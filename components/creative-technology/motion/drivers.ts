"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { clamp } from "@/components/creative-technology/motion/timeline";

/**
 * What moves a timeline: the scroll bar, or a clock.
 *
 * Both hand a number to a callback, straight from an animation frame.
 * Neither goes through React state, so a scene can be redrawn sixty times a
 * second without rendering a component.
 */

/** True when the visitor has asked for less motion. Updates if they change it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Whether an element is on screen, with an optional margin around the window. */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, { margin = "0px", threshold = 0 }: { margin?: string; threshold?: number } = {}): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: margin, threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, margin, threshold]);
  return onScreen;
}

type ScrollOptions = {
  /** Skip all scroll work and report 1: used for reduced motion. */
  disabled?: boolean;
  /**
   * How quickly the drawn position follows the scroll bar, as a time
   * constant in milliseconds. A little lag turns the steps of a mouse wheel
   * into one continuous movement. 0 follows exactly.
   */
  smoothing?: number;
};

/**
 * Calls `onProgress` with a 0–1 number computed by `measure`, once per
 * frame, while the element is near the window and the page is moving.
 *
 * `measure` is a function of layout only, so the result is the same
 * whichever direction the page is scrolled and however it got there.
 */
function useScrollDriver(
  ref: RefObject<HTMLElement | null>,
  measure: (node: HTMLElement) => number,
  onProgress: (progress: number) => void,
  { disabled = false, smoothing = 90 }: ScrollOptions
) {
  const measureRef = useRef(measure);
  const callback = useRef(onProgress);
  useEffect(() => {
    measureRef.current = measure;
    callback.current = onProgress;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (disabled) {
      callback.current(1);
      return;
    }

    let frame = 0;
    let target = 0;
    let current = -1;
    let last = 0;
    let listening = false;

    const draw = (now: number) => {
      frame = 0;
      if (current < 0 || smoothing <= 0) current = target;
      else {
        const elapsed = Math.min(now - last, 64);
        current += (target - current) * (1 - Math.exp(-elapsed / smoothing));
        if (Math.abs(target - current) < 0.0004) current = target;
      }
      last = now;
      callback.current(current);
      if (current !== target) frame = requestAnimationFrame(draw);
    };

    const update = () => {
      target = clamp(measureRef.current(node));
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) window.addEventListener("scroll", update, { passive: true });
      else window.removeEventListener("scroll", update);
    };

    // Work only while the scene is within a screen of the window.
    const near = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting);
        update();
      },
      { rootMargin: "100% 0px" }
    );
    near.observe(node);

    // A change of size changes the geometry `measure` reads.
    const resized = new ResizeObserver(update);
    resized.observe(node);
    window.addEventListener("resize", update);

    // Drawn once immediately, so a scene far down the page is already in the right state.
    target = clamp(measureRef.current(node));
    current = target;
    callback.current(current);

    return () => {
      near.disconnect();
      resized.disconnect();
      listen(false);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, [ref, disabled, smoothing]);
}

/**
 * Progress through a pinned scene: 0 when the stage takes its place, 1 a
 * little before it lets go.
 *
 * @param track  The tall element whose first child is the sticky stage.
 * @param finish The share of the pinned distance over which the timeline
 *               runs. The rest is a hold on the finished state.
 */
export function usePinnedProgress(
  track: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { finish = 0.88, ...options }: ScrollOptions & { finish?: number } = {}
) {
  useScrollDriver(
    track,
    (node) => {
      const stage = node.firstElementChild as HTMLElement | null;
      if (!stage) return 1;
      const travel = node.offsetHeight - stage.offsetHeight;
      if (travel <= 1) return 1;
      const pinnedAt = parseFloat(getComputedStyle(stage).top) || 0;
      const scrolled = pinnedAt - node.getBoundingClientRect().top;
      return scrolled / (travel * finish);
    },
    onProgress,
    options
  );
}

/**
 * Progress of an element as it crosses the window, for scenes that are not
 * pinned: 0 when its top edge is at `from` of the window's height, 1 when
 * it has risen to `to`.
 */
export function usePassingProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { from = 0.8, to = 0.25, ...options }: ScrollOptions & { from?: number; to?: number } = {}
) {
  useScrollDriver(
    ref,
    (node) => {
      const height = window.innerHeight;
      const top = node.getBoundingClientRect().top;
      return (height * from - top) / (height * (from - to));
    },
    onProgress,
    options
  );
}

/**
 * A clock for looping scenes. Calls `onTime` with the seconds the scene
 * has spent on screen: time stops while it is off screen or the tab is
 * hidden, so nothing is drawn that nobody can see.
 *
 * With reduced motion the clock never starts and `onTime` is called once
 * with `rest`, the moment that best stands for the whole loop.
 */
export function useClock(
  ref: RefObject<HTMLElement | null>,
  onTime: (seconds: number) => void,
  { paused = false, rest = 0 }: { paused?: boolean; rest?: number } = {}
) {
  const reduced = useReducedMotion();
  const onScreen = useOnScreen(ref, { threshold: 0.25 });
  const callback = useRef(onTime);
  const elapsed = useRef(0);
  useEffect(() => {
    callback.current = onTime;
  });

  useEffect(() => {
    if (reduced) {
      callback.current(rest);
      return;
    }
    if (!onScreen || paused) return;

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // A long gap means the tab was in the background: do not jump ahead.
      elapsed.current += Math.min(now - last, 100) / 1000;
      last = now;
      callback.current(elapsed.current);
      frame = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible") {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, onScreen, paused, rest]);

  return { reduced, onScreen };
}

/**
 * Decodes every image in a scene shortly before it comes on screen, so the
 * images a stage change reveals are ready and the change never waits on a
 * decode. Runs once.
 */
export function useDecodeAhead(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        node.querySelectorAll("img").forEach((img) => {
          img.decode?.().catch(() => undefined);
        });
      },
      { rootMargin: "150% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
}
