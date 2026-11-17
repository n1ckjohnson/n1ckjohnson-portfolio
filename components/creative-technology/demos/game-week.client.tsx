"use client";

import type { CSSProperties } from "react";
import type { Media } from "@/lib/creative-technology/media";
import type { CodeSample } from "@/content/creative-technology/types";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import styles from "./game-week.module.css";

export type Region = { x: number; y: number; w: number; h: number };

export type WeekView = {
  key: string;
  week: string;
  opponent: string;
  site: "home" | "away";
  venue: string;
  date: string;
  kickoff: string;
  partner: string;
  header: Media;
  /** A different master, e.g. the night edition: the whole header changes. */
  newMaster?: string;
};

/** Names for the computed regions, matched by position on the header. */
function nameFor(region: Region) {
  if (region.y > 0.55 && region.x < 0.25) return "Week";
  if (region.y > 0.55) return "Date · kickoff · partner";
  if (region.x < 0.7) return "Visiting Team";
  return "Home Team";
}

export function GameWeekScene({ weeks, regions: all, code }: { weeks: WeekView[]; regions: Region[]; code?: CodeSample }) {
  // Hairline differences (a few pixels of anti-aliasing) are not worth a box.
  const regions = all.filter((region) => region.h > 0.04 && region.w > 0.04);

  // Week k is reached at k / (n − 1). The change into it fills the stretch before.
  const last = Math.max(weeks.length - 1, 1);
  const into = (k: number): [number, number] => [(k - 1) / last, k / last];

  const steps: SceneStep[] = weeks.map((week, k) => ({
    key: week.key,
    at: k === 0 ? 0 : into(k)[0],
    rest: k / last,
    label: week.week,
  }));

  // One change per week: the whole header and its row in the data, together. Nothing is staggered.
  const build = (): Track[] => {
    const tracks: Track[] = [];
    weeks.forEach((_, k) => {
      if (k === 0) return;
      const at = into(k);
      tracks.push({ el: `full-${k}`, at, ease: EASE.inOut, opacity: [0, 1] });
      tracks.push({ el: `row-${k}`, at, ease: EASE.inOut, vars: { "--on": [0, 1] } });
      tracks.push({ el: `row-${k - 1}`, at, ease: EASE.inOut, vars: { "--on": [1, 0] } });
      // The outlined regions brighten as one while the header changes under them.
      const mid = (at[0] + at[1]) / 2;
      tracks.push({ el: "rings", at: [at[0], mid], ease: EASE.inOut, opacity: [0.45, 1] });
      tracks.push({ el: "rings", at: [mid, at[1]], ease: EASE.inOut, opacity: [1, 0.45] });
    });
    return tracks;
  };

  return (
    <StepFigure
      label="Game Week header versioned from the schedule"
      ratio={1.2}
      ratioNarrow={1}
      steps={steps}
      build={build}
      deps={[weeks, regions]}
      code={code}
      openHold={2200}
      change={1250}
      hold={3200}
      loop
      loopHold={4500}
    >
      {() => (
        <div className={styles.root}>
          <div className={styles.header}>
            {/* Every week's delivered header, stacked in schedule order. Each change is one crossfade of the whole header. */}
            {weeks.map((week, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={week.key}
                data-m={k === 0 ? undefined : `full-${k}`}
                className={styles.full}
                src={week.header.src}
                alt={k === 0 ? week.header.alt : ""}
                decoding="async"
                style={k === 0 ? undefined : { opacity: 0 }}
              />
            ))}
            <div data-m="rings" className={styles.rings} style={{ opacity: 0.45 }}>
              {regions.map((region, r) => (
                <span key={r} className={styles.ring} style={box(region)}>
                  <span className={styles.tag} data-below={region.y < 0.5 ? undefined : ""}>
                    {nameFor(region)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.data}>
            <div className={styles.dataHead}>
              <span>schedule.json</span>
            </div>
            <div className={styles.cols} aria-hidden="true">
              <span>week</span>
              <span>opp</span>
              <span>site</span>
              <span>date</span>
              <span>kickoff</span>
              <span>partner</span>
            </div>
            {weeks.map((week, k) => (
              <div key={week.key} data-m={`row-${k}`} className={styles.row} style={{ "--on": k === 0 ? 1 : 0 } as CSSProperties}>
                <span>{week.week}</span>
                <span>{week.opponent}</span>
                <span>{week.site === "home" ? "vs" : "at"}</span>
                <span>{week.date}</span>
                <span>{week.kickoff}</span>
                <span>{week.partner}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepFigure>
  );
}

const box = (region: Region): CSSProperties => ({
  left: `${region.x * 100}%`,
  top: `${region.y * 100}%`,
  width: `${region.w * 100}%`,
  height: `${region.h * 100}%`,
});
