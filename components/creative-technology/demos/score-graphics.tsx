import type { ScoreDemo } from "@/content/creative-technology/projects/score-graphics";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { ScoreFamilies, ScoreScene, type ScoreFrame } from "@/components/creative-technology/demos/score-graphics.client";

/**
 * Score graphics, part one: one real game, state by state, in both
 * formats. Every frame is the delivered file.
 */
export function ScoreGraphicsDemo({ project, media }: DemoProps<ScoreDemo>) {
  const game = project.demo.games.find((candidate) => candidate.key === "w1");
  const frames: ScoreFrame[] = (game?.periods ?? []).flatMap((period) => {
    const wide = image(media, `${period.stem}-3x4`);
    const tall = image(media, `${period.stem}-9x16`);
    return wide && tall ? [{ key: period.label.toLowerCase().replace(/\s+/g, "-"), label: period.label, score: period.score, wide, tall }] : [];
  });

  if (frames.length < 2) {
    return (
      <Withheld>
        The delivered score graphics carry team photography and player likenesses, so they are held back until they are cleared for
        publication.
      </Withheld>
    );
  }

  return (
    <div className="col">
      <ScoreScene frames={frames} code={project.code.find((sample) => sample.key === "state")} />
    </div>
  );
}

/** Part two: the win state in three creative families, from the same system. */
export function ScoreGraphicsEvidence({ project, media }: DemoProps<ScoreDemo>) {
  const cards = project.demo.families.flatMap((family) => {
    const shot = image(media, family.asset);
    return shot ? [{ key: family.key, label: family.label, media: shot }] : [];
  });
  if (cards.length < 2) return null;

  return (
    <div className="col">
      <ScoreFamilies cards={cards} />
    </div>
  );
}
