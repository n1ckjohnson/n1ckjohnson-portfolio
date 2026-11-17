"use client";

import { useState, type CSSProperties } from "react";
import type { Media } from "@/lib/creative-technology/media";
import type { CodeSample } from "@/content/creative-technology/types";
import { StepFigure, type SceneStep } from "@/components/creative-technology/motion/step-figure";
import { EASE, type Track } from "@/components/creative-technology/motion/timeline";
import { Lightbox } from "@/components/creative-technology/ui/lightbox";
import styles from "./player-birthday.module.css";

export type BirthdayPlayer = { key: string; name: string; position: string; number: string; graphic: Media };

/** The stage is 100 × 80 cqw. The graphic is built large, in the middle. */
const STAGE_H = 80;
const BIG = { left: 23, top: 4, width: 54 };

function grid(count: number) {
  const columns = count > 6 ? 5 : Math.max(count, 1);
  const rows = Math.ceil(count / columns);
  const gap = 2;
  const width = (90 - (columns - 1) * gap) / columns;
  const height = (width * 4) / 3;
  const top = (STAGE_H - (rows * height + (rows - 1) * gap)) / 2;
  return Array.from({ length: count }, (_, i) => ({
    left: 5 + (i % columns) * (width + gap),
    top: top + Math.floor(i / columns) * (height + gap),
    width,
  }));
}

const STEPS: SceneStep[] = [
  { key: "template", at: 0, rest: 0.04, label: "Template" },
  { key: "photo", at: 0.06, rest: 0.18, ms: 1100, hold: 1600, label: "Photo" },
  { key: "signature", at: 0.18, rest: 0.3, ms: 1200, hold: 1600, label: "Signature" },
  { key: "title", at: 0.3, rest: 0.41, ms: 950, hold: 1500, label: "Title" },
  { key: "name", at: 0.42, rest: 0.54, ms: 1000, hold: 1700, label: "Name" },
  { key: "final", at: 0.55, rest: 0.63, ms: 900, hold: 3400, label: "Finished" },
  { key: "batch", at: 0.68, rest: 1, ms: 1600, label: "Batch" },
];

/**
 * One birthday graphic, assembled from its own PSD layers in their real
 * stacking order, becomes the delivered file and joins the batch.
 */
export function BirthdayScene({
  players,
  focus,
  layers,
  code,
}: {
  players: BirthdayPlayer[];
  focus: BirthdayPlayer;
  layers: { key: string; media: Media }[];
  code?: CodeSample;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const ordered = [focus, ...players.filter((player) => player.key !== focus.key)];
  const cells = grid(ordered.length);
  const home = cells[0];
  const s = home.width / BIG.width;

  const build = (): Track[] => [
    { el: "photo", at: [0.06, 0.18], ease: EASE.out, opacity: [0, 1], scale: [1.06, 1] },
    { el: "signature", at: [0.18, 0.3], ease: EASE.inOut, vars: { "--reveal": [0, 100] } },
    { el: "title", at: [0.3, 0.41], ease: EASE.out, x: ["-36%", "0%"] },
    { el: "nameplate", at: [0.42, 0.5], ease: EASE.out, opacity: [0, 1], y: ["4%", "0%"] },
    { el: "marks", at: [0.48, 0.54], opacity: [0, 1] },
    { el: "final", at: [0.55, 0.62], opacity: [0, 1] },
    { el: "frame", at: [0.68, 0.8], ease: EASE.inOut, x: ["0cqw", `${home.left - BIG.left}cqw`], y: ["0cqw", `${home.top - BIG.top}cqw`], scale: [1, s] },
    ...ordered.slice(1).map(
      (_, i): Track => ({ el: `cell-${i + 1}`, at: [0.74, 0.86], ease: EASE.out, opacity: [0, 1], scale: [0.96, 1] })
    ),
  ];

  const items = ordered.map((player) => ({ media: player.graphic, title: `${player.name}, ${player.position} ${player.number}` }));

  return (
    <>
      <StepFigure label="A birthday graphic, built from its own layers" ratio={1.25} openHold={1600} steps={STEPS} build={build} deps={[ordered]} code={code}>
        {(step) => {
          const batch = step === "batch";
          return (
            <div className={styles.root} data-batch={batch ? "" : undefined}>
              {ordered.slice(1).map((player, i) => {
                const cell = cells[i + 1];
                return (
                  <button
                    key={player.key}
                    type="button"
                    data-m={`cell-${i + 1}`}
                    className={styles.cell}
                    style={{ left: `${cell.left}cqw`, top: `${cell.top}cqw`, width: `${cell.width}cqw`, opacity: 0 } as CSSProperties}
                    tabIndex={batch ? 0 : -1}
                    aria-hidden={batch ? undefined : true}
                    aria-label={`Enlarge ${player.name}`}
                    onClick={() => setOpen(i + 1)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.graphic.src} alt="" decoding="async" />
                  </button>
                );
              })}

              <button
                type="button"
                data-m="frame"
                className={styles.frame}
                style={{ left: `${BIG.left}cqw`, top: `${BIG.top}cqw`, width: `${BIG.width}cqw` }}
                tabIndex={batch ? 0 : -1}
                aria-label={`Enlarge ${focus.name}`}
                onClick={() => batch && setOpen(0)}
              >
                {layers.map((layer) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={layer.key}
                    data-m={layer.key}
                    className={styles.layer}
                    data-layer={layer.key}
                    src={layer.media.src}
                    alt=""
                    decoding="async"
                    style={layer.key === "background" || layer.key === "title" || layer.key === "signature" ? undefined : { opacity: 0 }}
                  />
                ))}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-m="final" className={styles.layer} src={focus.graphic.src} alt={focus.graphic.alt} decoding="async" style={{ opacity: 0 }} />
              </button>
            </div>
          );
        }}
      </StepFigure>
      <Lightbox items={items} index={open} onIndex={setOpen} label="Birthday graphics" />
    </>
  );
}
