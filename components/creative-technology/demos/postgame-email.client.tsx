"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { CodeSample } from "@/content/creative-technology/types";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import { snap, type EmailSlice } from "@/lib/creative-technology/email-slices";
import styles from "./postgame-email.module.css";

/** A module of the email: `y` and `h` in native pixels. */
export type EmailModuleView = { key: string; label: string; varies: string; y: number; h: number };
/** One sent email: for each module, its genuine slices at native geometry. */
export type EmailEdition = { key: string; label: string; alt: string; modules: (EmailSlice & { src: string })[][] };

/** The email is drawn at the stage's full height; its width follows from the native email. */
const FRAME = { w: 40.5, x: 54 };

/** How the frame sits on the page's device-pixel grid, once it has been measured. */
type Grid = { left: number; top: number; scale: number; dpr: number };

/**
 * The master is six modules. The first sent email is assembled into them
 * one by one; every later edition is a different game re-skinned through
 * the same modules, cascading from the header down.
 *
 * Every module is built from the edition's own slices, placed at their
 * native coordinates. Once the frame has been measured, every slice edge is
 * rounded to the page's device-pixel grid, so two slices that meet in the
 * email meet on the same device pixel on screen: nothing between them,
 * nothing on top of them, nothing cut away.
 */
export function EmailScene({
  size,
  modules,
  editions,
  code,
}: {
  size: { width: number; height: number };
  modules: EmailModuleView[];
  editions: EmailEdition[];
  code?: CodeSample;
}) {
  const FH = FRAME.w * (size.height / size.width);
  const top = (100 - FH) / 2;
  const themes = editions.slice(1);
  const frame = useRef<HTMLDivElement>(null);
  const grid = useGrid(frame, size.width);

  const ASSEMBLE: [number, number] = [0.14, 0.46];
  const themeAt = (i: number): [number, number] => {
    const span = 0.44 / Math.max(themes.length, 1);
    const start = 0.52 + i * span;
    return [start, start + span * 0.75];
  };

  const steps: SceneStep[] = [
    { key: "master", at: 0, rest: 0.08, label: "Master" },
    { key: "assemble", at: ASSEMBLE[0], rest: ASSEMBLE[1], ms: 4400, hold: 3000, label: editions[0].label },
    ...themes.map((edition, i) => ({
      key: edition.key,
      at: themeAt(i)[0],
      rest: themeAt(i)[1],
      label: edition.label,
    })),
  ];

  const build = (): Track[] => {
    const tracks: Track[] = [];
    modules.forEach((_, m) => {
      // The empty frames appear together. The email is then filled module by module, top to bottom,
      // each one landing before the next begins to settle; later editions re-skin all six at once.
      tracks.push({ el: `slot-${m}`, at: [0.02, 0.07], ease: EASE.out, opacity: [0, 1] });
      const span = ASSEMBLE[1] - ASSEMBLE[0];
      const start = ASSEMBLE[0] + (m / modules.length) * span * 0.8;
      const at: [number, number] = [start, start + span * 0.24];
      tracks.push({ el: `mod-${m}`, at, ease: EASE.out, opacity: [0, 1], y: ["3cqw", "0cqw"] });
      tracks.push({ el: `lab-${m}`, at, vars: { "--on": [0, 1] } });
      themes.forEach((_, i) => {
        const [a, b] = themeAt(i);
        tracks.push({ el: `layer-${i + 1}-${m}`, at: [a, b], ease: EASE.inOut, opacity: [0, 1] });
        tracks.push({ el: `lab-${m}`, at: [a, a + (b - a) * 0.4], vars: { "--hl": [0, 1] } });
        tracks.push({ el: `lab-${m}`, at: [a + (b - a) * 0.6, b], vars: { "--hl": [1, 0] } });
      });
    });
    return tracks;
  };

  // Vertical and horizontal placement of a native span. Measured: snapped CSS pixels from the frame's
  // corner. Not yet measured (first paint): percentages of the frame, which are the same layout unsnapped.
  const edge = (value: number, end: number) => (value === 0 ? "floor" : value === end ? "ceil" : "round");
  const ys = (y: number) => (grid ? snap(y, grid.top, grid.scale, grid.dpr, edge(y, size.height)) : null);
  const xs = (x: number) => (grid ? snap(x, grid.left, grid.scale, grid.dpr, edge(x, size.width)) : null);
  const moduleBox = (module: EmailModuleView): CSSProperties => {
    const a = ys(module.y);
    const b = ys(module.y + module.h);
    return a === null || b === null
      ? { top: `${(module.y / size.height) * 100}%`, height: `${(module.h / size.height) * 100}%` }
      : { top: `${a}px`, height: `${b - a}px` };
  };
  const sliceBox = (slice: EmailSlice, module: EmailModuleView): CSSProperties => {
    const x0 = xs(slice.x);
    const x1 = xs(slice.x + slice.w);
    const y0 = ys(slice.y);
    const y1 = ys(slice.y + slice.h);
    const m0 = ys(module.y);
    if (x0 === null || x1 === null || y0 === null || y1 === null || m0 === null) {
      return {
        left: `${(slice.x / size.width) * 100}%`,
        width: `${(slice.w / size.width) * 100}%`,
        top: `${((slice.y - module.y) / module.h) * 100}%`,
        height: `${(slice.h / module.h) * 100}%`,
      };
    }
    return { left: `${x0}px`, width: `${x1 - x0}px`, top: `${y0 - m0}px`, height: `${y1 - y0}px` };
  };

  return (
    <StepFigure
      label="Jags Win email assembled from its six modules"
      ratio={1}
      ratioNarrow={0.92}
      steps={steps}
      build={build}
      deps={[modules, editions]}
      code={code}
      openHold={1600}
      change={1300}
      hold={2800}
      loop
      loopHold={5200}
    >
      {() => (
        <div className={styles.root}>
          <div className={styles.side} style={{ top: `${top}cqw` }}>
            <div className={styles.head}>Modules</div>
            {modules.map((module, m) => (
              <div key={module.key} data-m={`lab-${m}`} className={styles.label} style={{ "--on": 0, "--hl": 0 } as CSSProperties}>
                <span>{module.label}</span>
                <span>{module.varies}</span>
              </div>
            ))}
          </div>

          <div ref={frame} className={styles.frame} style={{ left: `${FRAME.x}cqw`, top: `${top}cqw`, width: `${FRAME.w}cqw`, height: `${FH}cqw` }}>
            {modules.map((module, m) => (
              <div
                key={`slot-${module.key}`}
                data-m={`slot-${m}`}
                className={styles.slot}
                style={{ top: `${(module.y / size.height) * 100}%`, height: `${(module.h / size.height) * 100}%`, opacity: 0 }}
              >
                <span>{module.label}</span>
              </div>
            ))}
            {modules.map((module, m) => (
              <div key={module.key} data-m={`mod-${m}`} className={styles.module} style={{ ...moduleBox(module), opacity: 0 }}>
                {editions.map((edition, e) => (
                  <div key={edition.key} data-m={e === 0 ? undefined : `layer-${e}-${m}`} className={styles.edition} style={{ opacity: e === 0 ? 1 : 0 }}>
                    {edition.modules[m].map((slice, s) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={slice.asset}
                        className={styles.slice}
                        src={slice.src}
                        alt={e === 0 && m === 0 && s === 0 ? edition.alt : ""}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        style={sliceBox(slice, module)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </StepFigure>
  );
}

/**
 * Measures where the frame sits on the page, in page coordinates, and how
 * many CSS pixels one native pixel takes. Updated whenever the frame or the
 * window changes size, or the device pixel ratio changes (zoom, or moving
 * to another screen).
 */
function useGrid(frame: RefObject<HTMLDivElement | null>, nativeWidth: number) {
  const [grid, setGrid] = useState<Grid | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    let media: MediaQueryList | null = null;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (!rect.width) return;
      const next = { left: rect.left + window.scrollX, top: rect.top + window.scrollY, scale: rect.width / nativeWidth, dpr: window.devicePixelRatio || 1 };
      setGrid((current) =>
        current && Math.abs(current.left - next.left) < 1e-3 && Math.abs(current.top - next.top) < 1e-3 && Math.abs(current.scale - next.scale) < 1e-6 && current.dpr === next.dpr
          ? current
          : next
      );
      // Listen for the next change of pixel ratio.
      media?.removeEventListener("change", measure);
      media = window.matchMedia(`(resolution: ${next.dpr}dppx)`);
      media.addEventListener("change", measure);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      media?.removeEventListener("change", measure);
    };
  }, [frame, nativeWidth]);

  return grid;
}
