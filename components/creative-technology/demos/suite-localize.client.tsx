"use client";

import type { CSSProperties } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import { pack, type Pack } from "@/lib/creative-technology/pack";
import styles from "./suite-localize.module.css";

type Region = { key: string; label: string; box: [number, number, number, number] };
type Piece = { key: string; media: Media; width: number; height: number };

/** The finished Spanish suite: the 16:9 and the endcard stacked, the story, then square over portrait. */
const ARRANGEMENT: Pack = { row: [{ col: ["hero", "endcard"] }, "social-9x16", { col: ["social-1x1", "social-3x4"] }] };
const MARGIN = 4;
const INNER = 100 - MARGIN * 2;

/** Where the camera sits to frame a region of the 16:9: translate (% of the image) and scale. Never closer than reads well. */
function frame([x, y, w, h]: Region["box"]) {
  const z = Math.min(0.72 / w, 0.72 / h, 2.4);
  const limit = ((z - 1) / 2) * 100;
  const clampTo = (value: number) => Math.max(-limit, Math.min(limit, value));
  return { z, tx: clampTo(-(x + w / 2 - 0.5) * z * 100), ty: clampTo(-(y + h / 2 - 0.5) * z * 100) };
}

/** Clips the Spanish file to one region, so only that region changes. */
const inset = ([x, y, w, h]: Region["box"]) => {
  const pad = 0.006;
  const pc = (value: number) => `${(Math.max(0, value) * 100).toFixed(2)}%`;
  return `inset(${pc(y - pad)} ${pc(1 - x - w - pad)} ${pc(1 - y - h - pad)} ${pc(x - pad)})`;
};

/**
 * Localisation, in two figures: a camera tour of the 16:9, then the
 * Spanish suite opening from it.
 */
export function LocalizeScene({ english, spanish, regions, suite }: { english: Media; spanish: Media; regions: Region[]; suite: Piece[] }) {
  return (
    <div>
      <CameraTour english={english} spanish={spanish} regions={regions} />
      <div className="mt-12">
        <SpanishSuite hero={spanish} suite={suite} />
      </div>
    </div>
  );
}

/**
 * The camera visits each place the 16:9 differs in Spanish. At each one it
 * settles on the English, holds, and the Spanish appears in place; then it
 * moves on. Finally it pulls back to the whole Spanish file, holds, and the
 * tour fades back to the English and begins again. Every pixel is one of the
 * two delivered files.
 */
function CameraTour({ english, spanish, regions }: { english: Media; spanish: Media; regions: Region[] }) {
  const heroH = INNER / (english.width / english.height);
  const count = regions.length + 2;
  const at = (k: number) => k / (count - 1);

  const steps: SceneStep[] = [
    { key: "english", at: 0, rest: 0, label: "English" },
    ...regions.map((region, r) => ({ key: region.key, at: at(r), rest: at(r + 1), label: region.label, ms: 3400, hold: 2300 })),
    { key: "spanish", at: at(count - 2), rest: 1, label: "Spanish", ms: 1700 },
  ];

  // Within each region's step: the camera travels (first half), rests on the English, then the Spanish fades in.
  const build = (): Track[] => {
    const tracks: Track[] = [];
    let from = { z: 1, tx: 0, ty: 0 };
    regions.forEach((region, r) => {
      const a = at(r);
      const b = at(r + 1);
      const w = b - a;
      const to = frame(region.box);
      tracks.push({ el: "cam", at: [a, a + w * 0.4], ease: EASE.inOut, scale: [from.z, to.z], x: [`${from.tx}%`, `${to.tx}%`], y: [`${from.ty}%`, `${to.ty}%`] });
      tracks.push({ el: `es-${r}`, at: [a + w * 0.62, b], ease: EASE.inOut, opacity: [0, 1] });
      from = to;
    });
    const a = at(count - 2);
    tracks.push({ el: "cam", at: [a, 1], ease: EASE.inOut, scale: [from.z, 1], x: [`${from.tx}%`, "0%"], y: [`${from.ty}%`, "0%"] });
    tracks.push({ el: "es-all", at: [a, a + (1 - a) * 0.3], opacity: [0, 1] });
    return tracks;
  };

  return (
    <StepFigure
      label="The 16:9 localised into Spanish, region by region"
      ratio={100 / (heroH + MARGIN * 2)}
      steps={steps}
      build={build}
      deps={[regions]}
      openHold={1700}
      change={1600}
      hold={2400}
      loop
      loopHold={4200}
    >
      {() => (
        <div className={styles.root}>
          <div className={styles.hero} style={{ left: `${MARGIN}cqw`, top: `${MARGIN}cqw`, width: `${INNER}cqw`, aspectRatio: `${english.width} / ${english.height}` }}>
            <div data-m="cam" className={styles.cam}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.img} src={english.src} alt={english.alt} decoding="async" />
              {regions.map((region, r) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={region.key} data-m={`es-${r}`} className={styles.img} src={spanish.src} alt="" decoding="async" style={{ opacity: 0, clipPath: inset(region.box) }} />
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-m="es-all" className={styles.img} src={spanish.src} alt={spanish.alt} decoding="async" style={{ opacity: 0 }} />
            </div>
          </div>
        </div>
      )}
    </StepFigure>
  );
}

/**
 * The corrected Spanish 16:9 opens into the rest of the Spanish suite: it
 * holds on its own, then moves to its seat as the other sizes arrive around
 * it, together. It stays open.
 */
function SpanishSuite({ hero, suite }: { hero: Media; suite: Piece[] }) {
  const aspects: Record<string, number> = { hero: hero.width / hero.height, ...Object.fromEntries(suite.map((piece) => [piece.key, piece.width / piece.height])) };
  const packed = pack(ARRANGEMENT, aspects, 0.02);
  const innerH = INNER / packed.ratio;
  const stageH = innerH + MARGIN * 2;
  const slot = (key: string) => {
    const found = packed.slots.find((candidate) => candidate.key === key)!;
    return { left: MARGIN + found.x * INNER, top: MARGIN + found.y * innerH, width: found.w * INNER };
  };
  // The 16:9 starts as large as the stage allows, centred.
  const startW = Math.min(INNER, innerH * aspects.hero);
  const start = { left: (100 - startW) / 2, top: (stageH - startW / aspects.hero) / 2, width: startW };
  const end = slot("hero");

  const steps: SceneStep[] = [
    { key: "single", at: 0, rest: 0, label: "16:9" },
    { key: "suite", at: 0, rest: 1, label: "Suite", ms: 1700 },
  ];

  const build = (): Track[] => [
    { el: "hero", at: [0, 0.85], ease: EASE.inOut, x: ["0cqw", `${end.left - start.left}cqw`], y: ["0cqw", `${end.top - start.top}cqw`], scale: [1, end.width / start.width] },
    ...suite.map((piece): Track => ({ el: `piece-${piece.key}`, at: [0.3, 1], ease: EASE.out, opacity: [0, 1], scale: [0.95, 1] })),
  ];

  return (
    <StepFigure label="The Spanish suite opening from the 16:9" ratio={100 / stageH} steps={steps} build={build} deps={[suite]} openHold={1500}>
      {() => (
        <div className={styles.root}>
          {suite.map((piece) => {
            const place = slot(piece.key);
            return (
              <div
                key={piece.key}
                data-m={`piece-${piece.key}`}
                className={styles.piece}
                style={{ left: `${place.left}cqw`, top: `${place.top}cqw`, width: `${place.width}cqw`, aspectRatio: `${piece.width} / ${piece.height}`, opacity: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={piece.media.src} alt={piece.media.alt} decoding="async" />
              </div>
            );
          })}
          <div
            data-m="hero"
            className={`${styles.hero} ${styles.heroMoves}`}
            style={{ left: `${start.left}cqw`, top: `${start.top}cqw`, width: `${start.width}cqw`, aspectRatio: `${hero.width} / ${hero.height}` } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.img} src={hero.src} alt={hero.alt} decoding="async" />
          </div>
        </div>
      )}
    </StepFigure>
  );
}
