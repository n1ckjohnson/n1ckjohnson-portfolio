"use client";

import type { Media } from "@/lib/creative-technology/media";
import type { CodeSample } from "@/content/creative-technology/types";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import styles from "./injury-report.module.css";

type Box = [number, number, number, number];
type Format = { base: Media; full: Media; rows: Box[] };
export type InjuryBuild = { players: number; when: string; tall: Format; wide: Format };
/** The same system in other artwork: the delivered report, both formats. */
export type InjuryLook = { key: string; label: string; when: string; tall: Media; wide: Media };

/**
 * Real reports, assembled in front of the reader. Each format holds every
 * report's base (header and artwork, rows lifted out) and that report's
 * rows, cut from the delivered file by a clip, so a row is the delivered
 * row at its delivered place. The looks that follow are delivered reports
 * in other artwork.
 *
 * Every change is one change: the rows of a report arrive as a group, and
 * both formats change together. Nothing is placed one row at a time.
 */
export function InjuryScene({ builds, looks = [], code }: { builds: InjuryBuild[]; looks?: InjuryLook[]; code?: CodeSample }) {
  // Stage 0 is the design alone, then one stage per report, then one per look.
  const count = 1 + builds.length + looks.length;
  const last = count - 1;
  const into = (stage: number): [number, number] => [(stage - 1) / last, stage / last];

  const steps: SceneStep[] = [
    { key: "design", at: 0, rest: 0, label: "Design" },
    ...builds.map((build, k) => ({
      key: `p${build.players}`,
      at: into(1 + k)[0],
      rest: (1 + k) / last,
      label: `${build.players} players`,
    })),
    ...looks.map((look, j) => ({
      key: look.key,
      at: into(1 + builds.length + j)[0],
      rest: (1 + builds.length + j) / last,
      label: look.label,
    })),
  ];

  const build = (): Track[] => {
    const tracks: Track[] = [];
    for (const format of ["tall", "wide"] as const) {
      builds.forEach((_, k) => {
        const [a, b] = into(1 + k);
        const w = b - a;
        // A new report's design arrives first; its rows follow as one group while it settles.
        if (k > 0) tracks.push({ el: `${format}-base-${k}`, at: [a, a + w * 0.6], ease: EASE.inOut, opacity: [0, 1] });
        tracks.push({ el: `${format}-rows-${k}`, at: [a + w * (k > 0 ? 0.35 : 0), b], ease: EASE.out, opacity: [0, 1], y: ["1.2cqw", 0] });
      });
      looks.forEach((_, j) => {
        tracks.push({ el: `${format}-look-${j}`, at: into(1 + builds.length + j), ease: EASE.inOut, opacity: [0, 1] });
      });
    }
    return tracks;
  };

  return (
    <StepFigure
      label="Injury Report, assembled from delivered reports"
      ratio={1.515}
      ratioNarrow={1.515}
      steps={steps}
      build={build}
      deps={[builds, looks]}
      code={code}
      openHold={1600}
      change={1250}
      hold={2800}
      loop
      loopHold={4500}
    >
      {() => (
        <div className={styles.root}>
          <Frame className={styles.tall} format="tall" builds={builds} looks={looks} />
          <Frame className={styles.wide} format="wide" builds={builds} looks={looks} />
        </div>
      )}
    </StepFigure>
  );
}

function Frame({ className, format, builds, looks }: { className: string; format: "tall" | "wide"; builds: InjuryBuild[]; looks: InjuryLook[] }) {
  return (
    <div className={`${styles.frame} ${className}`}>
      {builds.map((report, k) => (
        <div key={k} className={styles.layer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-m={`${format}-base-${k}`}
            className={styles.img}
            src={report[format].base.src}
            alt={k === 0 ? report[format].full.alt : ""}
            decoding="async"
            style={{ opacity: k === 0 ? 1 : 0 }}
          />
          <div data-m={`${format}-rows-${k}`} className={styles.layer} style={{ opacity: 0 }}>
            {report[format].rows.map(([x, y, w, h], i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className={styles.img}
                src={report[format].full.src}
                alt=""
                decoding="async"
                style={{ clipPath: `inset(${pct(y - 0.002)} ${pct(1 - x - w - 0.002)} ${pct(1 - y - h - 0.002)} ${pct(x - 0.002)})` }}
              />
            ))}
          </div>
        </div>
      ))}
      {looks.map((look, j) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={look.key} data-m={`${format}-look-${j}`} className={styles.img} src={look[format].src} alt={look[format].alt} decoding="async" style={{ opacity: 0 }} />
      ))}
    </div>
  );
}

const pct = (value: number) => `${(Math.max(value, 0) * 100).toFixed(3)}%`;
