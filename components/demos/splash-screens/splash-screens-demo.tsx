"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationItem, LottiePlayer } from "lottie-web";
import { DemoFrame } from "@/components/demos/demo-frame";
import { SPLASH_BACKGROUNDS, SPLASH_WEEKS } from "@/components/demos/splash-screens/weeks";
import { cn } from "@/lib/cn";

type Spec = { width: number; height: number; fps: number; frames: number };

const pad = (n: number) => String(n).padStart(3, "0");

/**
 * Plays shipped splash-screen Lottie files over their delivered backgrounds.
 *
 * - The player (lottie_light, SVG only, no eval) and each week's JSON load
 *   only when the demo approaches the viewport.
 * - Plays once when first seen, then holds the final frame — like the app.
 * - Reduced motion: shows the final frame; playback only on request.
 */
export function SplashScreensDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<LottiePlayer | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const cacheRef = useRef(new Map<string, string>());
  const visibleRef = useRef(false);
  const autoplayedRef = useRef(false);

  const [near, setNear] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [spec, setSpec] = useState<Spec | null>(null);

  const week = SPLASH_WEEKS[weekIndex];
  const lastFrame = spec ? spec.frames - 1 : 0;

  const play = useCallback((fromStart: boolean) => {
    const anim = animRef.current;
    if (!anim) return;
    if (fromStart || anim.currentFrame >= anim.totalFrames - 1) anim.goToAndPlay(0, true);
    else anim.play();
    setPlaying(true);
  }, []);

  // Start loading a little before the demo scrolls into view; autoplay once it's mostly visible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (entry.isIntersecting && !autoplayedRef.current && animRef.current && !reduced) {
          autoplayedRef.current = true;
          play(true);
        }
      },
      { threshold: 0.6 }
    );
    nearObserver.observe(root);
    visibleObserver.observe(root);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [play]);

  // Load (or switch to) the selected week.
  useEffect(() => {
    if (!near) return;
    let cancelled = false;

    (async () => {
      playerRef.current ??= (await import("lottie-web/build/player/lottie_light")).default;

      let json = cacheRef.current.get(week.lottie);
      if (!json) {
        const response = await fetch(week.lottie);
        if (!response.ok) throw new Error(`Failed to load ${week.lottie}`);
        json = await response.text();
        cacheRef.current.set(week.lottie, json);
      }
      if (cancelled || !stageRef.current) return;

      // lottie mutates animationData, so parse a fresh copy each time
      const data = JSON.parse(json);
      animRef.current?.destroy();
      const anim = playerRef.current.loadAnimation({
        container: stageRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: data,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animRef.current = anim;

      anim.addEventListener("enterFrame", () => setFrame(Math.min(Math.floor(anim.currentFrame), anim.totalFrames - 1)));
      anim.addEventListener("complete", () => setPlaying(false));
      let handled = false;
      const onReady = () => {
        // Ignore stale animations replaced by a later selection
        if (handled || animRef.current !== anim) return;
        handled = true;
        setSpec({ width: data.w, height: data.h, fps: data.fr, frames: Math.round(anim.totalFrames) });
        setLoadedId(week.id);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const switching = autoplayedRef.current;
        if (reduced) {
          anim.goToAndStop(anim.totalFrames - 1, true);
          setFrame(Math.round(anim.totalFrames) - 1);
          setPlaying(false);
        } else if (switching || visibleRef.current) {
          autoplayedRef.current = true;
          anim.goToAndPlay(0, true);
          setPlaying(true);
        } else {
          anim.goToAndStop(0, true);
          setFrame(0);
        }
      };
      anim.addEventListener("DOMLoaded", onReady);
      // Embedded assets can finish before the listener is attached
      if (anim.isLoaded) onReady();
    })().catch(() => {
      if (!cancelled) setFailedId(week.id);
    });

    return () => {
      cancelled = true;
    };
  }, [near, week.id, week.lottie]);

  useEffect(() => () => animRef.current?.destroy(), []);

  const togglePlay = () => {
    const anim = animRef.current;
    if (!anim) return;
    if (playing) {
      anim.pause();
      setPlaying(false);
    } else {
      play(false);
    }
  };

  const scrub = (value: number) => {
    const anim = animRef.current;
    if (!anim) return;
    anim.goToAndStop(value, true);
    setFrame(value);
    setPlaying(false);
  };

  const selectWeek = (index: number) => {
    if (index === weekIndex) return;
    autoplayedRef.current = true; // a deliberate choice should play right away
    setWeekIndex(index);
  };

  const ready = loadedId === week.id;
  const loading = near && !ready && failedId !== week.id;

  return (
    <DemoFrame
      title="Splash screen player"
      caption="Four shipped 2026 splash screens, played from the delivered Lottie files. Standard weeks reuse one 96-frame structure; matchup, home/away order and presenting partner are set per game. Week 8 is the Rivalries edition."
    >
      <div ref={rootRef} className="grid items-center gap-10 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-6 lg:px-14">
        {/* Device stage */}
        <div className="flex justify-center">
          <div
            role="img"
            aria-label={`${week.week} splash screen: ${week.matchup}`}
            className="relative aspect-[1242/2688] w-[13.5rem] overflow-hidden rounded-[1.75rem] bg-[#0f5b66] shadow-[0_0_0_1px_rgba(17,17,16,0.06),0_24px_48px_-24px_rgba(17,17,16,0.35)] sm:w-[15.5rem]"
          >
            {(Object.keys(SPLASH_BACKGROUNDS) as (keyof typeof SPLASH_BACKGROUNDS)[]).map((key) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={key}
                src={SPLASH_BACKGROUNDS[key]}
                alt=""
                decoding="async"
                loading="lazy"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-base ease-out",
                  week.background === key ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
            <div
              ref={stageRef}
              className={cn(
                "absolute inset-0 transition-opacity duration-quick ease-out [&_svg]:!h-full [&_svg]:!w-full",
                ready ? "opacity-100" : "opacity-0"
              )}
            />
            <p
              className={cn(
                "absolute inset-x-0 bottom-6 text-center text-label text-white/70 transition-opacity duration-quick ease-out",
                loading && !spec ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            >
              Loading
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mx-auto w-full max-w-[22rem] lg:mx-0">
          <p id="splash-week-label" className="text-small text-ink-2">
            Game week
          </p>
          <div
            role="radiogroup"
            aria-labelledby="splash-week-label"
            className="relative mt-2 grid grid-cols-4 rounded-[10px] bg-ink/[0.05] p-1"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-[7px] bg-canvas shadow-[0_1px_2px_rgba(17,17,16,0.08),0_0_0_0.5px_rgba(17,17,16,0.06)] transition-transform duration-base ease-out"
              style={{ transform: `translateX(${weekIndex * 100}%)` }}
            />
            {SPLASH_WEEKS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={i === weekIndex}
                aria-label={`${item.week}: ${item.matchup}`}
                tabIndex={i === weekIndex ? 0 : -1}
                onClick={() => selectWeek(i)}
                onKeyDown={(event) => {
                  const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
                  if (!delta) return;
                  event.preventDefault();
                  const next = (i + delta + SPLASH_WEEKS.length) % SPLASH_WEEKS.length;
                  selectWeek(next);
                  (event.currentTarget.parentElement?.children[next + 1] as HTMLElement | undefined)?.focus();
                }}
                className="pressable relative z-10 rounded-[7px] py-2 text-center text-small"
              >
                <span className={i === weekIndex ? "font-medium text-ink" : "text-ink-2"}>{item.week}</span>{" "}
                <span className="text-ink-3">{item.opponent}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 min-h-[2.75rem]" aria-live="polite">
            <p className="text-body text-ink">{week.matchup}</p>
            <p className="text-small text-ink-2">{week.context}</p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!ready}
              className="pressable inline-flex h-9 items-center gap-2 rounded-full bg-ink pl-3 pr-4 text-small font-medium text-canvas hover:bg-ink/85 disabled:opacity-40"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => play(true)}
              disabled={!ready}
              className="pressable inline-flex h-9 items-center gap-2 rounded-full px-3 text-small font-medium text-ink hover:bg-ink/[0.05] disabled:opacity-40"
            >
              <ReplayIcon />
              Replay
            </button>
          </div>

          <div className="mt-5" data-owns-arrows>
            <input
              type="range"
              min={0}
              max={Math.max(lastFrame, 1)}
              step={1}
              value={frame}
              disabled={!ready}
              onChange={(event) => scrub(Number(event.target.value))}
              aria-label="Frame"
              aria-valuetext={`Frame ${frame + 1} of ${spec?.frames ?? ""}`}
              className="scrubber w-full"
              style={{ "--progress": `${lastFrame ? (frame / lastFrame) * 100 : 0}%` } as React.CSSProperties}
            />
            <div className="mt-2 flex justify-between text-label tabular-nums text-ink-3">
              <span>
                Frame {pad(frame + 1)} / {pad(spec?.frames ?? 0)}
              </span>
              <span>{spec ? `${spec.width} × ${spec.height} · ${spec.fps} fps` : " "}</span>
            </div>
          </div>

          {failedId === week.id ? (
            <p className="mt-4 text-small text-ink-2">This animation couldn&rsquo;t be loaded. Try another week.</p>
          ) : null}
        </div>
      </div>
    </DemoFrame>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.8v10.4c0 .5.6.8 1 .5l8-5.2a.6.6 0 0 0 0-1L5.5 2.3c-.4-.3-1 0-1 .5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.78" />
      <path d="M2.5 2.5v3h3" />
    </svg>
  );
}
