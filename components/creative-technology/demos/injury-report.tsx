import type { InjuryReportDemo as Config } from "@/content/creative-technology/projects/injury-report";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { InjuryScene, type InjuryBuild, type InjuryLook } from "@/components/creative-technology/demos/injury-report.client";
import geometry from "@/content/creative-technology/data/injury-rows.json";

type Rows = Record<string, { rows: [number, number, number, number][] }>;

/**
 * Injury Report. Three delivered reports, assembled in front of the
 * reader: the report's own header and artwork, then its own rows, placed
 * one at a time. Nothing is redrawn; every pixel is the delivered file.
 */
export function InjuryReportDemo({ project, media }: DemoProps<Config>) {
  const rows = geometry as unknown as Rows;
  const builds: InjuryBuild[] = project.demo.build.flatMap((step) => {
    const tallBase = image(media, step.tall.base);
    const tallFull = image(media, step.tall.full);
    const wideBase = image(media, step.wide.base);
    const wideFull = image(media, step.wide.full);
    if (!tallBase || !tallFull || !wideBase || !wideFull) return [];
    return [
      {
        players: step.players,
        when: step.when,
        tall: { base: tallBase, full: tallFull, rows: rows[`${step.key}-9x16`]?.rows ?? [] },
        wide: { base: wideBase, full: wideFull, rows: rows[`${step.key}-16x9`]?.rows ?? [] },
      },
    ];
  });

  // Other artwork from the same system, after the builds. Only looks whose both formats are cleared.
  const looks: InjuryLook[] = project.demo.looks.flatMap((look) => {
    const mode = project.demo.modes.find((candidate) => candidate.key === look.mode);
    const tall = mode && image(media, mode.tall);
    const wide = mode && image(media, mode.wide);
    return mode && tall && wide ? [{ key: mode.key, label: look.label ?? mode.label, when: look.when, tall, wide }] : [];
  });

  if (builds.length < 2) {
    return (
      <Withheld>
        The delivered reports carry real players&rsquo; injury information, so they are held back until they are cleared for publication.
      </Withheld>
    );
  }

  return (
    <div className="col">
      <InjuryScene builds={builds} looks={looks} code={project.code.find((sample) => sample.key === "layout")} />
    </div>
  );
}
