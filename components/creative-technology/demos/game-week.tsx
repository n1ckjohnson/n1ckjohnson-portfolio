import { resolveSidecar } from "@/lib/creative-technology/media";
import type { GameWeekDemo as Config } from "@/content/creative-technology/projects/game-week";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { SuiteFanOut } from "@/components/creative-technology/demos/ticketing-suites.client";
import { buildSuite } from "@/components/creative-technology/demos/suite";
import { GameWeekScene, type Region, type WeekView } from "@/components/creative-technology/demos/game-week.client";

/**
 * Game Week versioning. One master, and the header that was
 * delivered for each game. The regions that vary are computed from the real
 * exports by the media builder, not drawn by hand.
 */
export function GameWeekDemo({ project, media }: DemoProps<Config>) {
  const regions: Region[] = resolveSidecar<{ regions: Region[] }>("game-week/gch-variable-mask")?.regions ?? [];

  const weeks: WeekView[] = project.demo.weeks.flatMap((week) => {
    const header = image(media, week.header);
    if (!header) return [];
    return [
      {
        key: week.key,
        week: week.week,
        opponent: week.opponent,
        site: week.site,
        venue: week.venue,
        date: week.date,
        kickoff: week.kickoff,
        partner: week.partner,
        header,
        newMaster: week.note,
      },
    ];
  });

  if (!weeks.length) {
    return (
      <Withheld>
        The delivered headers carry opponent and partner marks, so they are held back until they are cleared for publication.
        In their place: each week the opponent mark, the VS. or AT indicator, the week, the date and kickoff and the partner
        slot are set from data. Everything else is the master.
      </Withheld>
    );
  }

  return (
    <div className="col">
      <GameWeekScene weeks={weeks} regions={regions} code={project.code.find((sample) => sample.key === "version")} />
    </div>
  );
}

/** The rest of one week's package, opening from the header. */
export function GameWeekEvidence({ project, media }: DemoProps<Config>) {
  const { suite } = project.demo;
  const { pieces, ratios, cleared } = buildSuite(suite.placements, suite.layouts, media);
  if (!cleared) return null;

  return (
    <div>
      <div className="col">
        <h3 className="text-ink">{suite.week}</h3>
      </div>
      <figure className="wide mt-8">
        <SuiteFanOut
          pieces={pieces}
          ratios={ratios}
          summary={`${pieces.length} of the ${suite.total} Week 1 assets.`}
        />
      </figure>
    </div>
  );
}
