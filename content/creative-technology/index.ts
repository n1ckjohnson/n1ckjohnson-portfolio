import type { Project } from "@/content/creative-technology/types";
import { splashScreens } from "@/content/creative-technology/projects/splash-screens";
import { ticketingSuites } from "@/content/creative-technology/projects/ticketing-suites";
import { rivalriesColor } from "@/content/creative-technology/projects/rivalries-color";
import { injuryReport } from "@/content/creative-technology/projects/injury-report";
import { scoreGraphics } from "@/content/creative-technology/projects/score-graphics";
import { gameWeek } from "@/content/creative-technology/projects/game-week";
import { playerBirthday } from "@/content/creative-technology/projects/player-birthday";
import { postgameEmail } from "@/content/creative-technology/projects/postgame-email";

/**
 * The eight Creative Technology projects, in the order they appear on the
 * homepage and down the page at /creative-technology.
 *
 * To add one: create a file in ./projects, add it here, and add its
 * demonstration to components/creative-technology/demos/registry.tsx.
 * See docs/creative-technology/README.md.
 *
 * Projects retired from the website are kept, uncompiled, in ./archive.
 */
export const projects: Project[] = [
  splashScreens,
  ticketingSuites,
  rivalriesColor,
  injuryReport,
  scoreGraphics,
  gameWeek,
  playerBirthday,
  postgameEmail,
].sort((a, b) => a.order - b.order) as Project[];

/** Copy for the top of the page at /creative-technology. */
export const index = {
  title: "Creative technology",
  role: "Production systems, Jacksonville Jaguars",
  description:
    "Creative production systems built with automation, software and structured data for the Jacksonville Jaguars, each explained through a working demonstration and the code behind it.",
};
