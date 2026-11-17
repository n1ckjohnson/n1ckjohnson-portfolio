"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type DependencyList, type ReactNode } from "react";
import { useDecodeAhead, useReducedMotion } from "@/components/creative-technology/motion/drivers";
import { bezier, clamp, type Track } from "@/components/creative-technology/motion/timeline";
import { useTimeline } from "@/components/creative-technology/motion/scene";
import { CodeBlock } from "@/components/creative-technology/code-block";
import type { CodeSample } from "@/content/creative-technology/types";

export type SceneStep = {
  key: string;
  /** Where on the 0–1 timeline this step's change begins. */
  at: number;
  /**
   * Where on the timeline this step is complete and at rest. A change always
   * plays to here. Defaults to where the next step begins (1 for the last).
   */
  rest?: number;
  /** A word or two, shown on the step's control. Also what assistive technology hears when the step changes. */
  label: string;
  /** How long the change into this step takes, in ms. Defaults to the figure's `change`. */
  ms?: number;
  /** How long this step is held once its change has finished, in ms. Defaults to the figure's `hold`. */
  hold?: number;
};

/** Starts and stops softly; the tracks inside keep their own curves. */
const PLAY = bezier(0.42, 0, 0.2, 1);
/** The fade used when a loop returns to its first step. */
const RESET_MS = 520;

/**
 * A demonstration that sits in the page like a figure in an article, and
 * plays like a short piece of directed motion.
 *
 * - It does not pin and it does not read the scroll bar. The figure and its
 *   controls always travel together. Nothing narrates the steps on screen:
 *   the motion and the step's label carry it.
 * - It starts only once most of it is on screen (`threshold`), and then not
 *   at once: the opening composition holds (`openHold`) so the reader sees
 *   what is about to change. Each change has its own duration (`ms`) and is
 *   followed by its own hold (`hold`), so a figure is timed for what it shows.
 * - A looping figure holds its last step longest (`loopHold`), then fades
 *   back to its first and goes round again; a figure that does not loop ends
 *   on its last step and stays there.
 * - Off screen it pauses. Back on screen it holds briefly, then carries on.
 * - Every step is a labelled control. Choosing one pauses the guided
 *   sequence and plays the change into that step; a quiet Play resumes it.
 * - With reduced motion nothing plays by itself: the figure shows its last
 *   step, and the controls switch steps without animating.
 * - The timeline is the same pure function of 0–1 it always was (see
 *   ./timeline); a clock drives it instead of the scroll bar.
 */
export function StepFigure({
  label,
  ratio,
  ratioNarrow,
  steps,
  build,
  deps,
  code,
  onStep,
  change = 1100,
  hold = 2400,
  openHold = 1300,
  loop = false,
  loopHold = 4200,
  threshold = 0.6,
  children,
}: {
  label: string;
  ratio: number;
  ratioNarrow?: number;
  steps: readonly SceneStep[];
  /** Returns the tracks. Called after the stage has rendered. */
  build: () => readonly Track[];
  deps: DependencyList;
  code?: CodeSample;
  onStep?: (key: string) => void;
  /** Default duration of a change, in ms. */
  change?: number;
  /** Default hold after a change, in ms. */
  hold?: number;
  /** How long the opening composition holds before anything moves, in ms. */
  openHold?: number;
  /** Go round again after the last step. */
  loop?: boolean;
  /** How long a looping figure holds its last step before starting over, in ms. */
  loopHold?: number;
  /** How much of the figure must be on screen before it plays. */
  threshold?: number;
  /** The stage's contents. Receives the current step for anything that is text rather than motion. */
  children: (step: string) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const draw = useTimeline(stage, build, deps);
  const last = steps.length - 1;
  const onStepRef = useRef(onStep);
  // Read through a ref: a scene may hand over a new array on every render, and that must not restart the sequence.
  const stepsRef = useRef(steps);
  useEffect(() => {
    onStepRef.current = onStep;
    stepsRef.current = steps;
  });

  const [index, setIndex] = useState(0);
  // Who is in charge: the guided sequence, or the reader (who may also simply have paused it).
  const [mode, setMode] = useState<"auto" | "reader">("auto");
  const [inView, setInView] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Bumped whenever the figure (re)enters view, so the next wait starts with a fresh hold.
  const [arrival, setArrival] = useState(0);

  // What is drawn, which step it belongs to, and the change in flight.
  const drawn = useRef(0);
  const current = useRef(0);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const rest = useCallback((k: number) => {
    const list = stepsRef.current;
    return list[k].rest ?? (k === list.length - 1 ? 1 : list[k + 1].at);
  }, []);
  const msOf = useCallback((k: number) => stepsRef.current[k].ms ?? change, [change]);
  const holdOf = useCallback((k: number, fallback: number) => stepsRef.current[k].hold ?? fallback, []);

  const play = useCallback(
    (to: number, from: number, jump: boolean) => {
      cancelAnimationFrame(frame.current);
      const target = rest(to);
      if (jump || to === from) {
        drawn.current = target;
        draw(target);
        return;
      }
      // Several steps at once: begin from the step before the one chosen, so only its own change plays.
      const neighbour = rest(to - Math.sign(to - from));
      const playing = drawn.current;
      const between = (playing - neighbour) * (target - playing) >= 0;
      if (Math.abs(to - from) > 1 && !between) drawn.current = neighbour;

      const start = drawn.current;
      const distance = Math.abs(target - start);
      const whole = Math.abs(target - neighbour) || distance;
      if (distance < 1e-4) {
        draw(target);
        return;
      }
      const duration = msOf(to) * clamp(distance / whole, 0.4, 1);
      const began = performance.now();
      const tick = (now: number) => {
        const t = clamp((now - began) / duration);
        drawn.current = start + (target - start) * PLAY(t);
        draw(drawn.current);
        if (t < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [draw, rest, msOf]
  );

  const enter = useCallback(
    (to: number, jump = false) => {
      const from = current.current;
      current.current = to;
      setIndex(to);
      onStepRef.current?.(stepsRef.current[to].key);
      play(to, from, jump);
    },
    [play]
  );

  // The first frame: the first step, or with reduced motion the finished figure.
  const shown = reduced && mode === "auto" ? last : index;
  useEffect(() => {
    if (mode !== "auto") return;
    const first = reduced ? last : 0;
    current.current = first;
    play(first, first, true);
    // Only when the motion preference is known or changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Most of the figure on screen counts as in view.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setArrival((n) => n + 1);
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  useDecodeAhead(stage);

  // Back to the first step: the stage fades out, the first step is drawn, the stage fades in.
  const restart = useCallback(() => {
    setResetting(true);
    window.setTimeout(() => {
      enter(0, true);
      setResetting(false);
    }, RESET_MS);
  }, [enter]);

  // The guided sequence. Each wait is the change that is playing plus the hold after it; the
  // first wait after arriving is the opening hold, so nothing moves the moment the figure appears.
  const arrivedAt = useRef(-1);
  useEffect(() => {
    if (reduced || mode !== "auto" || !inView || resetting) return;
    const fresh = arrivedAt.current !== arrival;
    arrivedAt.current = arrival;
    let wait: number;
    let next: () => void;
    if (index < last) {
      wait = fresh ? openHold : msOf(index) + holdOf(index, hold);
      if (index === 0 && !fresh) wait = holdOf(0, openHold);
      next = () => enter(index + 1);
    } else if (loop) {
      wait = (fresh ? openHold : msOf(index)) + loopHold;
      next = restart;
    } else {
      return;
    }
    const timer = window.setTimeout(next, wait);
    return () => window.clearTimeout(timer);
  }, [reduced, mode, inView, resetting, index, last, arrival, openHold, hold, loop, loopHold, msOf, holdOf, enter, restart]);

  const choose = (to: number) => {
    setMode("reader");
    enter(to, reduced);
  };

  const resume = () => {
    setMode("auto");
    setArrival((n) => n + 1);
    if (!loop && index >= last) restart();
  };

  const step = steps[shown] ?? steps[0];
  const finished = !loop && index >= last;

  return (
    <div className="scene scene--figure" style={{ "--ar-wide": ratio, "--ar-narrow": ratioNarrow ?? ratio } as CSSProperties}>
      <div ref={root}>
        <div ref={stage} className="scene__stage" role="group" aria-label={label} data-step={step.key} data-resetting={resetting ? "" : undefined}>
          {children(step.key)}
        </div>

        <div className="scene__bar">
          <div className="scene__chips" role="group" aria-label={`${label}: steps`}>
            {steps.map((candidate, at) => (
              <button key={candidate.key} type="button" className="scene__chip" aria-pressed={at === shown} onClick={() => choose(at)}>
                {candidate.label}
              </button>
            ))}
            {reduced ? null : mode === "auto" && !finished ? (
              <button type="button" className="scene__chip scene__chip--quiet" onClick={() => setMode("reader")} aria-label={`Pause ${label}`}>
                Pause
              </button>
            ) : (
              <button type="button" className="scene__chip scene__chip--quiet" onClick={resume} aria-label={`Play ${label}`}>
                Play
              </button>
            )}
          </div>
          {/* The step's name, for assistive technology only. Read out when the reader changed it, not while the figure plays by itself. */}
          <p className="sr-only" aria-live={mode === "reader" ? "polite" : "off"}>
            {step.label}
          </p>
        </div>
      </div>

      {code ? (
        <div className="scene__after">
          <CodeBlock sample={code} />
        </div>
      ) : null}
    </div>
  );
}
