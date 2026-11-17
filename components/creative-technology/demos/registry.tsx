import type { DemoEntry, DemoProps } from "@/components/creative-technology/demos/types";
import { Caption, Shot, Withheld } from "@/components/creative-technology/ui/media";
import { SplashScreensDemo } from "@/components/creative-technology/demos/splash-screens";
import { TicketingSuitesDemo, TicketingSuitesEvidence } from "@/components/creative-technology/demos/ticketing-suites";
import { RivalriesColorDemo } from "@/components/creative-technology/demos/rivalries-color";
import { InjuryReportDemo } from "@/components/creative-technology/demos/injury-report";
import { ScoreGraphicsDemo, ScoreGraphicsEvidence } from "@/components/creative-technology/demos/score-graphics";
import { GameWeekDemo, GameWeekEvidence } from "@/components/creative-technology/demos/game-week";
import { PlayerBirthdayDemo } from "@/components/creative-technology/demos/player-birthday";
import { PostgameEmailDemo } from "@/components/creative-technology/demos/postgame-email";

/** Fallback for a project without a demonstration: its first real image on a stage. */
function GenericDemo({ media }: DemoProps) {
  const first = Object.values(media).find((item) => item?.kind === "image");
  if (!first) return <Withheld />;
  return (
    <figure className="wide">
      <div className="stage p-3 sm:p-6">
        <Shot media={first} lift />
      </div>
      <Caption>{first.alt}</Caption>
    </figure>
  );
}

/** Demonstrations, keyed by `Project.id`. */
const DEMOS: Record<string, DemoEntry> = {
  "splash-screens": { Demo: SplashScreensDemo },
  "ticketing-suites": { Demo: TicketingSuitesDemo, Evidence: TicketingSuitesEvidence },
  "rivalries-color": { Demo: RivalriesColorDemo },
  "injury-report": { Demo: InjuryReportDemo, ownsCode: true },
  "score-graphics": { Demo: ScoreGraphicsDemo, Evidence: ScoreGraphicsEvidence, ownsCode: true },
  "game-week": { Demo: GameWeekDemo, Evidence: GameWeekEvidence, ownsCode: true },
  "player-birthday": { Demo: PlayerBirthdayDemo, ownsCode: true },
  "postgame-email": { Demo: PostgameEmailDemo, ownsCode: true },
};

export function demoFor(id: string): DemoEntry {
  return DEMOS[id] ?? { Demo: GenericDemo };
}
