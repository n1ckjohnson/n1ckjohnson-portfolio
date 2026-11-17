"use client";

import type { Media } from "@/lib/creative-technology/media";
import type { CodeSample } from "@/content/creative-technology/types";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import styles from "./score-graphics.module.css";

export type ScoreFrame = { key: string; label: string; score: string; wide: Media; tall: Media };

/**
 * One game, state by state. At each change the next delivered file replaces
 * the last in both formats at once. Nothing else moves: what changes is the
 * graphic itself, period, score and treatment.
 */
export function ScoreScene({ frames, code }: { frames: ScoreFrame[]; code?: CodeSample }) {
  const last = Math.max(frames.length - 1, 1);
  const into = (k: number): [number, number] => [(k - 1) / last, k / last];

  const steps: SceneStep[] = frames.map((frame, k) => ({
    key: frame.key,
    at: k === 0 ? 0 : into(k)[0],
    rest: k / last,
    label: frame.label,
    hold: frame.key === "jags-win" ? 3200 : undefined,
  }));

  const build = (): Track[] => {
    const tracks: Track[] = [];
    frames.forEach((_, k) => {
      if (k === 0) return;
      for (const format of ["wide", "tall"] as const) tracks.push({ el: `${format}-${k}`, at: into(k), ease: EASE.inOut, opacity: [0, 1] });
    });
    return tracks;
  };

  return (
    <StepFigure label="Score graphics, state by state" ratio={1.324} steps={steps} build={build} deps={[frames]} code={code} openHold={1500} change={950} hold={2300} loop loopHold={4200}>
      {() => (
        <div className={styles.pair}>
          {(["wide", "tall"] as const).map((format) => (
            <div key={format} className={styles.frame} data-format={format}>
              <div className={styles.cam}>
                {frames.map((frame, k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={frame.key}
                    data-m={`${format}-${k}`}
                    className={styles.img}
                    src={frame[format].src}
                    alt={k === frames.length - 1 ? frame[format].alt : ""}
                    decoding="async"
                    style={k === 0 ? undefined : { opacity: 0 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </StepFigure>
  );
}

/**
 * The same win state in three creative families. Each treatment arrives in
 * front of the last, so they can be compared one at a time, then the three
 * settle side by side for the comparison. It holds there, then goes round.
 */
export function ScoreFamilies({ cards }: { cards: { key: string; label: string; media: Media }[] }) {
  const n = cards.length;
  // Stage 100 × 66.7 cqw. Large: one 3:4 card in the middle. Small: n across.
  const big = { w: 43.5, left: (100 - 43.5) / 2, top: 4.4 };
  const small = { w: (100 - 10 - (n - 1) * 3) / n };
  const smallTop = (66.7 - (small.w * 4) / 3) / 2;
  const s = small.w / big.w;
  const last = n;
  const into = (k: number): [number, number] => [(k - 1) / last, k / last];

  const steps: SceneStep[] = [
    ...cards.map((card, k) => ({ key: card.key, at: k === 0 ? 0 : into(k)[0], rest: k / last, label: card.label })),
    { key: "all", at: into(n)[0], rest: 1, label: "Together", ms: 1500 },
  ];

  const build = (): Track[] => [
    // The next treatment slides in over the last, from the right, and settles.
    ...cards.flatMap((_, k): Track[] => (k === 0 ? [] : [{ el: `card-${k}`, at: into(k), ease: EASE.out, x: ["18cqw", "0cqw"], opacity: [0, 1] }])),
    // Then all three move to their places in one row.
    ...cards.map(
      (_, k): Track => ({
        el: `card-${k}`,
        at: into(n),
        ease: EASE.inOut,
        x: ["0cqw", `${5 + k * (small.w + 3) - big.left}cqw`],
        y: ["0cqw", `${smallTop - big.top}cqw`],
        scale: [1, s],
      })
    ),
  ];

  return (
    <StepFigure label="The win state in three creative families" ratio={1.5} steps={steps} build={build} deps={[cards]} openHold={1500} change={1000} hold={2300} loop loopHold={4800}>
      {() => (
        <div className={styles.families}>
          {cards.map((card, k) => (
            <div
              key={card.key}
              data-m={`card-${k}`}
              className={styles.card}
              style={{ left: `${big.left}cqw`, top: `${big.top}cqw`, width: `${big.w}cqw`, opacity: k === 0 ? 1 : 0, zIndex: k + 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.media.src} alt={card.media.alt} decoding="async" />
            </div>
          ))}
        </div>
      )}
    </StepFigure>
  );
}
