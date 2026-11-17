"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { useReducedMotion } from "@/components/creative-technology/ui/hooks";
import styles from "./rivalries-color.module.css";

export type CameraView = { key: string; label: string; box: [number, number, number, number] };

/** The stage's shape, width over height: a portrait frame, close to the photograph's own. */
const STAGE = 0.8;

/**
 * Where the camera sits for a framing: the transform for the photograph's
 * box, so the region fills about nine tenths of the stage. The camera never
 * shows anything outside `safe`, so the studio's backdrop edge and stands
 * stay out of every framing, including the full view.
 */
function camera(box: [number, number, number, number], aspect: number, safe: [number, number, number, number]) {
  const [x, y, w, h] = box;
  const [sx0, sy0, sx1, sy1] = safe;
  // The photograph's width as a share of the stage's width, at full height.
  const bw = aspect / STAGE;
  const left = (1 - bw) / 2;
  const least = Math.max(1 / ((sx1 - sx0) * bw), 1 / (sy1 - sy0));
  const z = Math.max(least, Math.min(0.92 / (w * bw), 0.92 / h, 3.2));
  let tx = 0.5 - left - (x + w / 2) * bw * z;
  let ty = 0.5 - (y + h / 2) * z;
  tx = Math.min(-left - sx0 * bw * z, Math.max(1 - left - sx1 * bw * z, tx));
  ty = Math.min(-sy0 * z, Math.max(1 - sy1 * z, ty));
  return `translate(${((tx / bw) * 100).toFixed(3)}%, ${(ty * 100).toFixed(3)}%) scale(${z.toFixed(4)})`;
}

/**
 * One photograph as shot and as corrected. The divider compares them; the
 * camera moves in on a material so the correction can be read at size.
 * The divider is in the stage's space, not the photograph's, so it stays
 * where it was put while the camera moves.
 */
export function RivalriesCamera({
  before,
  after,
  views,
  safe,
}: {
  before: Media;
  after: Media;
  views: CameraView[];
  safe: [number, number, number, number];
}) {
  const [view, setView] = useState(views[0].key);
  const [split, setSplit] = useState(50);
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // Once the reader has touched the divider, nothing else moves it.
  const touched = useRef(false);
  const place = (value: number) => {
    touched.current = true;
    setSplit(value);
  };
  const reduced = useReducedMotion();
  const current = views.find((candidate) => candidate.key === view) ?? views[0];
  const transform = camera(current.box, before.width / before.height, safe);

  // A hint, once: the first time the photograph is well in view the divider
  // eases from mostly "as shot" to the middle, so the reader sees there are
  // two images and that the line moves. After that it is theirs: drag or
  // arrow keys. It never follows the scroll bar.
  useEffect(() => {
    const node = stage.current;
    if (!node || reduced) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || touched.current) return;
        observer.disconnect();
        const began = performance.now();
        const tick = (now: number) => {
          if (touched.current) return;
          const t = Math.min(1, (now - began) / 1100);
          const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          setSplit(78 - 28 * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setSplit(78);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const at = (clientX: number) => {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect) return;
    place(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };
  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    at(event.clientX);
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) at(event.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const next = event.key === "ArrowLeft" ? split - step : event.key === "ArrowRight" ? split + step : event.key === "Home" ? 0 : event.key === "End" ? 100 : null;
    if (next === null) return;
    event.preventDefault();
    place(Math.min(100, Math.max(0, next)));
  };

  // Images are decoded before the first camera move, so it never moves onto a blank.
  useEffect(() => {
    [before.src, after.src].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [before.src, after.src]);

  const photo = (media: Media, alt: string) => (
    <div className={styles.photo} style={{ aspectRatio: `${media.width} / ${media.height}`, transform }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.src} alt={alt} width={media.width} height={media.height} decoding="async" draggable={false} />
    </div>
  );

  return (
    <figure className="col">
      <div
        ref={stage}
        className={`stage ${styles.stage}`}
        style={{ aspectRatio: STAGE, "--split": `${split}%` } as CSSProperties}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className={styles.layer}>{photo(before, before.alt)}</div>
        <div className={`${styles.layer} ${styles.after}`}>{photo(after, after.alt)}</div>
        <span className={styles.label} data-side="before">
          As shot
        </span>
        <span className={styles.label} data-side="after">
          Corrected
        </span>
        <div
          className={styles.handle}
          role="slider"
          tabIndex={0}
          aria-label="Divider between the photograph as shot and as corrected"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(split)}
          onKeyDown={onKey}
        >
          <span />
        </div>
      </div>

      <div className="controls">
        {/* The same quiet, labelled controls the other demonstrations use. */}
        <div className="scene__chips" role="group" aria-label="Framing">
          {views.map((candidate) => (
            <button key={candidate.key} type="button" className="scene__chip" aria-pressed={candidate.key === view} onClick={() => setView(candidate.key)}>
              {candidate.label}
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}
