"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { AnimationItem, LottiePlayer } from "lottie-web";
import type { Media } from "@/lib/creative-technology/media";
import { useReducedMotion } from "@/components/creative-technology/ui/hooks";
import { cn } from "@/lib/cn";
import styles from "@/components/creative-technology/demos/splash-screens.module.css";

export type SplashCard = {
  key: string;
  /** Full name, e.g. "Week 1 vs CLE". */
  name: string;
  /** URL of the delivered Lottie file. */
  lottie: string;
  /** Final frame of the animation. Absent in builds that may not show it. */
  poster: Media | null;
  /** URL of the delivered phone background the animation plays over. */
  background: string | null;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
/** How long Week 4 holds alone before the fan spreads, and how long the spread takes, in ms. */
const SPREAD_HOLD = 1500;
const SPREAD_MS = 1450;
/** Widest the whole fan may open to either side, and the most between two neighbours, in degrees. */
const MAX_FAN = 24;
const MAX_STEP = 6;
/** Distance from a card's centre to the point it turns about, in card heights. Matches the CSS. */
const PIVOT = 3;
/**
 * Where a screen sits in the fan, in steps from the chosen one. The first
 * few are evenly spaced; beyond them screens close up, so choosing one near
 * the end of the list does not push the rest off the stage.
 */
const EVEN = 4;
const spread = (offset: number) => {
  const away = Math.abs(offset);
  return Math.sign(offset) * (Math.min(away, EVEN) + Math.max(away - EVEN, 0) * 0.35);
};

/**
 * One splash screen that opens into every version of itself.
 *
 * - It opens once, on its own: Week 4 is shown alone at the front, the
 *   others stacked behind it; once most of the stage is on screen it holds,
 *   then the fan spreads out and stays open. Nothing pins and nothing reads
 *   the scroll bar.
 * - Choosing a screen moves it to the centre and plays its real animation,
 *   looping as it does in the app. The others re-form around it.
 * - Exactly one Lottie plays at a time, and none while the stage is off
 *   screen. Coming back into view starts it again from its first frame.
 *   The other screens show their final frame.
 * - With reduced motion nothing autoplays;
 *   a Play button plays the chosen screen once.
 */
export function SplashBouquet({ cards, ratio }: { cards: SplashCard[]; ratio: number }) {
  const middle = (cards.length - 1) / 2;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const holders = useRef(new Map<string, HTMLSpanElement>());
  const playerRef = useRef<LottiePlayer | null>(null);
  const instances = useRef(new Map<string, AnimationItem>());
  const files = useRef(new Map<string, string>());
  const visibleRef = useRef(false);
  // The fan opens on Week 4, the middle of the season's versions, so the spread is balanced either side.
  const opening = (cards.find((card) => card.key.startsWith("w04")) ?? cards[Math.round(middle)]).key;
  const selectedRef = useRef(opening);

  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(opening);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [failedKey, setFailedKey] = useState<string | null>(null);
  // While the fan is spreading, cards follow --p frame by frame; selection easing returns once it has opened.
  const [spreading, setSpreading] = useState(false);
  const spreadAt = useRef(0);
  const opened = useRef(false);

  const current = cards.find((card) => card.key === selected) ?? cards[0];
  const at = cards.indexOf(current);
  // How many screens sit on the wider side of the chosen one: the fan is fitted to that.
  const reach = Math.max(spread(Math.max(at, cards.length - 1 - at)), 1);
  // Without posters every screen draws its own final frame from its Lottie.
  const posters = cards.every((card) => card.poster);

  /* ── Scroll: one number, written once per frame ─────────────────────── */

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    // The widest fan that keeps the outermost screen inside the stage. A
    // card turned by A about its pivot reaches (R + h/2)·sin A + (w/2)·cos A
    // from the centre line, so A is found by halving the interval.
    const fit = () => {
      const card = stage.querySelector<HTMLElement>("[role=radio]");
      const cardH = card?.offsetHeight || stage.clientHeight * 0.6;
      const cardW = cardH * ratio;
      const radius = cardH * PIVOT;
      // On a narrow stage the outermost screens may run a little past the edge.
      const spill = stage.clientWidth < 520 ? cardW * 0.35 : 0;
      const room = stage.clientWidth / 2 - 14 + spill;
      const extent = (angle: number) => (radius + cardH / 2) * Math.sin(angle) + (cardW / 2) * Math.cos(angle);
      let low = 0;
      let high = (MAX_FAN * Math.PI) / 180;
      if (extent(high) > room) {
        for (let i = 0; i < 18; i++) {
          const mid = (low + high) / 2;
          if (extent(mid) > room) high = mid;
          else low = mid;
        }
      } else low = high;
      const step = Math.min(((low * 180) / Math.PI) / reach, MAX_STEP);
      stage.style.setProperty("--theta", `${step.toFixed(3)}deg`);
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(stage);

    // Closed until the fan has spread (see below); with reduced motion it is simply open.
    stage.style.setProperty("--p", (reduced || opened.current ? 1 : spreadAt.current).toFixed(4));
    return () => resize.disconnect();
  }, [ratio, reach, reduced]);

  /* ── The fan spreads, once ──────────────────────────────────────────── */

  // Week 4 first, alone at the front with the others stacked behind it. Once most of the stage is
  // on screen it holds there, then every screen turns out to its place in one movement, on a clock,
  // and the fan stays open. Leaving before it has begun cancels it; nothing here reads the scroll bar.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced || opened.current) return;
    let timer = 0;
    let frame = 0;
    const fanOut = () => {
      setSpreading(true);
      const began = performance.now();
      const tick = (now: number) => {
        const t = clamp((now - began) / SPREAD_MS);
        spreadAt.current = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        stage.style.setProperty("--p", spreadAt.current.toFixed(4));
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          opened.current = true;
          setSpreading(false);
        }
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting && !opened.current && !frame) timer = window.setTimeout(fanOut, SPREAD_HOLD);
      },
      { threshold: 0.6 }
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  /* ── Visibility: load a little early, play only on screen ───────────── */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearby.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        setVisible(entry.isIntersecting);
        // Out of view: stop whatever is running. Nothing renders off screen.
        if (!entry.isIntersecting) instances.current.forEach((animation) => animation.pause());
      },
      { threshold: 0.35 }
    );
    nearby.observe(stage);
    onScreen.observe(stage);
    return () => {
      nearby.disconnect();
      onScreen.disconnect();
    };
  }, []);

  /* ── Lottie ─────────────────────────────────────────────────────────── */

  const mount = useCallback(async (card: SplashCard) => {
    const existing = instances.current.get(card.key);
    if (existing) return existing;
    const holder = holders.current.get(card.key);
    if (!holder) return null;

    playerRef.current ??= (await import("lottie-web/build/player/lottie_light")).default;
    let json = files.current.get(card.lottie);
    if (!json) {
      const response = await fetch(card.lottie);
      if (!response.ok) throw new Error(`Could not load ${card.lottie}`);
      json = await response.text();
      files.current.set(card.lottie, json);
    }
    // Another call may have mounted it while this one was loading.
    const raced = instances.current.get(card.key);
    if (raced) return raced;

    const animation = playerRef.current.loadAnimation({
      container: holder,
      renderer: "svg",
      // The delivered file holds its last frame, then begins again, as the app shows it.
      loop: true,
      autoplay: false,
      // lottie mutates its input, so every load gets a fresh parse.
      animationData: JSON.parse(json),
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    });
    instances.current.set(card.key, animation);
    await new Promise<void>((resolve) => {
      if (animation.isLoaded) resolve();
      else animation.addEventListener("DOMLoaded", () => resolve());
    });
    // Hold the final frame until asked to play, as the app does.
    animation.goToAndStop(Math.max(animation.totalFrames - 1, 0), true);
    setReady((state) => ({ ...state, [card.key]: true }));
    return animation;
  }, []);

  const play = useCallback((key: string) => {
    const animation = instances.current.get(key);
    if (!animation) return;
    animation.goToAndPlay(0, true);
  }, []);

  // Mount the chosen screen, and play it if the visitor can see it.
  useEffect(() => {
    if (!near) return;
    let cancelled = false;

    mount(current)
      .then((animation) => {
        if (cancelled || !animation) return;
        // One engine at a time: with posters available, the rest are released.
        if (posters) {
          instances.current.forEach((other, key) => {
            if (key === current.key) return;
            other.destroy();
            instances.current.delete(key);
            setReady((state) => ({ ...state, [key]: false }));
          });
        }
        if (!reduced && visibleRef.current) play(current.key);
      })
      .catch(() => {
        if (!cancelled) setFailedKey(current.key);
      });

    return () => {
      cancelled = true;
    };
  }, [near, current, posters, reduced, mount, play]);

  // Without posters, the other screens need their final frame drawn once.
  useEffect(() => {
    if (!near || posters) return;
    cards.forEach((card) => void mount(card).catch(() => {}));
  }, [near, posters, cards, mount]);

  // Every arrival on screen plays the chosen animation from its first frame, looping while it stays
  // in view. Leaving pauses it (see the observer above). This used to run only on the first
  // arrival, so a reader who scrolled away and came back found it frozen.
  const isReady = Boolean(ready[selected]);
  useEffect(() => {
    if (!visible || reduced || !isReady) return;
    play(selected);
  }, [visible, reduced, isReady, selected, play]);

  useEffect(() => {
    const live = instances.current;
    return () => live.forEach((animation) => animation.destroy());
  }, []);

  /* ── Selection ──────────────────────────────────────────────────────── */

  const choose = (key: string) => {
    if (key === selected) return;
    instances.current.get(selected)?.pause();
    selectedRef.current = key;
    setSelected(key);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    const edge = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : null;
    if (!step && edge === null) return;
    event.preventDefault();
    const next = cards[edge ?? clamp(at + step, 0, cards.length - 1)];
    choose(next.key);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-key="${next.key}"]`)?.focus();
  };

  return (
    <div ref={trackRef} className={styles.track}>
      <div ref={stageRef} className={cn("stage", styles.stage, !spreading && styles.settled)} style={{ "--ratio": ratio } as CSSProperties}>
        <div className={styles.fan} role="radiogroup" aria-label="Splash screen versions" onKeyDown={onKeyDown}>
          {cards.map((card, index) => {
            // Offsets are measured from the chosen screen, so it sits at the
            // centre and the others arrange themselves either side of it.
            const offset = index - at;
            const chosen = card.key === selected;
            const drawn = Boolean(ready[card.key]);
            return (
              <button
                key={card.key}
                type="button"
                role="radio"
                data-key={card.key}
                aria-checked={chosen}
                aria-label={card.name}
                tabIndex={chosen ? 0 : -1}
                className={styles.card}
                style={{ "--o": spread(offset), "--a": Math.abs(offset) } as CSSProperties}
                onClick={() => choose(card.key)}
              >
                <span className={styles.screen}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {card.background ? <img className={styles.layer} src={card.background} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
                  {card.poster ? (
                    // The final frame stands in until the real file is drawn.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.layer} src={card.poster.src} alt="" decoding="async" draggable={false} data-hidden={chosen && drawn} />
                  ) : null}
                  <span
                    ref={(node) => {
                      if (node) holders.current.set(card.key, node);
                      else holders.current.delete(card.key);
                    }}
                    className={styles.lottie}
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.bar}>
          <button type="button" className={styles.step} aria-label="Previous version" disabled={at <= 0} onClick={() => choose(cards[at - 1].key)}>
            <Chevron direction="left" />
          </button>
          <p className={styles.name} aria-live="polite">
            {failedKey === current.key ? "This animation could not be loaded." : current.name}
          </p>
          <button
            type="button"
            className={styles.step}
            aria-label="Next version"
            disabled={at >= cards.length - 1}
            onClick={() => choose(cards[at + 1].key)}
          >
            <Chevron direction="right" />
          </button>
        </div>
        {reduced ? (
          <button
            type="button"
            className={styles.replay}
            disabled={!isReady}
            onClick={() => {
              // Once, then it holds its final frame: nothing keeps moving that the reader did not ask for.
              const animation = instances.current.get(selected);
              if (!animation) return;
              animation.loop = false;
              animation.goToAndPlay(0, true);
            }}
          >
            Play animation
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
    </svg>
  );
}
