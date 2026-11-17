"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { useMediaQuery, useReducedMotion } from "@/components/creative-technology/ui/hooks";
import { useDecodeAhead } from "@/components/creative-technology/motion/drivers";
import styles from "@/components/creative-technology/demos/ticketing-suites.module.css";

/** Where a piece sits in one arrangement, and how to bring it to the centre. */
export type Seat = { x: number; y: number; w: number; h: number; tx: string; ty: string; s: number };

export type SuitePiece = {
  key: string;
  label: string;
  /** Delivered pixel size, e.g. "1920 × 1080". */
  size: string;
  /** The real export, or null where this build may not show it. */
  media: Media | null;
  /** The same placement in each further campaign look, in order. */
  looks?: (Media | null)[];
  /** Every element, in a fixed order, and whether this format carries it. */
  elements: { name: string; kept: boolean }[];
  wide: Seat;
  narrow: Seat;
  /** Opens the demonstration in the wide or the narrow arrangement. */
  hero?: "wide" | "narrow" | "both";
  /** Order in which it leaves the creative it came from. */
  rank: number;
};

/** How long the original creative holds on its own before the suite opens, in ms. */
const OPEN_HOLD = 1500;

/**
 * One creative becomes a suite, and any placement can be brought
 * forward to see how it was composed.
 *
 * Nothing pins and nothing reads the scroll bar. When half the figure is on
 * screen the creative opens into its suite, once, as one composition; it
 * stays open. Further campaign looks are the reader's to choose, and a new
 * look replaces the last across every size in one crossfade. Every change
 * is a CSS transition of transform and opacity that runs to its end.
 */
export function SuiteFanOut({
  pieces,
  ratios,
  summary,
  outlines = false,
  looks: names = [],
}: {
  pieces: SuitePiece[];
  ratios: { wide: number; narrow: number };
  /** One static line under the suite, e.g. how many files it stands for. Hidden while a placement is in focus or another look is showing. */
  summary: string;
  /** Draw every placement as an outline: there is no creative to open from. */
  outlines?: boolean;
  /** The name of each campaign look, the first being the suite's own. Shown under the suite. */
  looks?: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [easing, setEasing] = useState(false);
  const easeTimer = useRef(0);
  const reduced = useReducedMotion();
  // Matches the breakpoint where the CSS switches to the wide arrangement.
  const wide = useMediaQuery("(min-width: 600px)");

  // Further looks are shown only when every piece has them.
  const extra = outlines ? 0 : Math.min(names.length - 1, ...pieces.map((piece) => piece.looks?.filter(Boolean).length ?? 0));
  const looks = Math.max(extra, 0);
  const [opened, setOpened] = useState(false);
  const [look, setLook] = useState(0);
  useDecodeAhead(trackRef);
  useEffect(() => () => window.clearTimeout(easeTimer.current), []);

  // Opens once. The original creative is shown on its own first: once most of the figure is on
  // screen it holds there long enough to be recognised, then the suite opens. Leaving before then
  // cancels it, so it never opens out of sight.
  useEffect(() => {
    const node = boxRef.current;
    if (!node || opened) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => setOpened(true), OPEN_HOLD);
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [opened]);

  // With reduced motion there is nothing to watch open: the suite starts open.
  const open = outlines || reduced || opened;

  const focused = pieces.find((piece) => piece.key === focus) ?? null;
  const isSource = (piece: SuitePiece) => piece.hero === "both" || piece.hero === (wide ? "wide" : "narrow");

  // Bringing a placement forward and putting it back are eased the same way.
  const eased = (change: () => void) => {
    window.clearTimeout(easeTimer.current);
    setEasing(true);
    change();
    easeTimer.current = window.setTimeout(() => setEasing(false), 700);
  };

  const select = (key: string) => {
    if (!open) {
      // A click on the closed creative opens the suite.
      setOpened(true);
      return;
    }
    eased(() => setFocus((current) => (current === key ? null : key)));
  };

  const release = (restore = true) => {
    if (!focus) return;
    const key = focus;
    eased(() => setFocus(null));
    if (restore) boxRef.current?.querySelector<HTMLButtonElement>(`[data-key="${key}"]`)?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!focus) return;
    if (event.key === "Escape") {
      event.preventDefault();
      release();
      return;
    }
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const at = pieces.findIndex((piece) => piece.key === focus);
    const next = pieces[(at + step + pieces.length) % pieces.length];
    eased(() => setFocus(next.key));
    boxRef.current?.querySelector<HTMLButtonElement>(`[data-key="${next.key}"]`)?.focus({ preventScroll: true });
  };

  return (
    <div ref={trackRef} className={styles.track}>
      <div className={styles.pin}>
      <div className={`stage ${styles.stage}`}>
        <div
          ref={boxRef}
          className={styles.box}
          data-open={open ? "" : undefined}
          data-focus={focus ? "" : undefined}
          data-easing={easing ? "" : undefined}
          style={{ "--w-ratio": ratios.wide, "--n-ratio": ratios.narrow } as CSSProperties}
          onKeyDown={onKeyDown}
        >
          {focus ? <button type="button" className={styles.scrim} aria-label="Back to the suite" tabIndex={-1} onClick={() => release(false)} /> : null}
          {pieces.map((piece) => {
            const isFocused = piece.key === focus;
            return (
              <button
                key={piece.key}
                type="button"
                data-key={piece.key}
                data-hero={piece.hero}
                data-source={isSource(piece) ? "" : undefined}
                data-focused={isFocused ? "" : undefined}
                aria-pressed={open ? isFocused : undefined}
                aria-label={`${piece.label}, ${piece.size.replace("×", "by")} pixels`}
                tabIndex={open || isSource(piece) ? 0 : -1}
                className={styles.piece}
                style={
                  {
                    "--w-x": piece.wide.x,
                    "--w-y": piece.wide.y,
                    "--w-w": piece.wide.w,
                    "--w-h": piece.wide.h,
                    "--w-tx": piece.wide.tx,
                    "--w-ty": piece.wide.ty,
                    "--w-s": piece.wide.s,
                    "--n-x": piece.narrow.x,
                    "--n-y": piece.narrow.y,
                    "--n-w": piece.narrow.w,
                    "--n-h": piece.narrow.h,
                    "--n-tx": piece.narrow.tx,
                    "--n-ty": piece.narrow.ty,
                    "--n-s": piece.narrow.s,
                    "--rank": piece.rank,
                  } as CSSProperties
                }
                onClick={() => select(piece.key)}
              >
                {piece.media ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={piece.media.src} width={piece.media.width} height={piece.media.height} alt={look === 0 ? piece.media.alt : ""} decoding="async" draggable={false} />
                ) : (
                  <span className={styles.blank} aria-hidden="true">
                    <span>{piece.size}</span>
                  </span>
                )}
                {piece.looks?.slice(0, looks).map((alt, i) =>
                  alt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={alt.src}
                      className={styles.alt}
                      data-on={look >= i + 1 ? "" : undefined}
                      src={alt.src}
                      width={alt.width}
                      height={alt.height}
                      alt={look === i + 1 ? alt.alt : ""}
                      decoding="async"
                      draggable={false}
                    />
                  ) : null
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Space is reserved for the tallest readout this suite can show, so nothing below it jumps. */}
      <div className={styles.readout} data-detailed={looks || pieces.some((piece) => piece.elements.length) ? "" : undefined} aria-live="polite">
        {focused ? (
          <>
            <p className={styles.readout__title}>
              {focused.label} <span>{focused.size}</span>
            </p>
            {focused.elements.length ? (
              <ul className={styles.elements}>
                {focused.elements.map((element) => (
                  <li key={element.name} data-dropped={element.kept ? undefined : ""}>
                    {element.name}
                    {element.kept ? null : <span className="sr-only"> (left out)</span>}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          // Kept in place under another look, so the look controls never shift.
          <p className={styles.readout__note} data-hidden={look === 0 ? undefined : ""} aria-hidden={look === 0 ? undefined : true}>
            {summary}
          </p>
        )}
        {looks && !focused ? (
          // The same quiet, labelled controls the step figures use.
          <div className={`scene__chips ${styles.looks}`} role="group" aria-label="Campaign look">
            {names.slice(0, looks + 1).map((name, i) => (
              <button
                key={name}
                type="button"
                className="scene__chip"
                aria-pressed={look === i}
                onClick={() => {
                  setOpened(true);
                  setLook(i);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
