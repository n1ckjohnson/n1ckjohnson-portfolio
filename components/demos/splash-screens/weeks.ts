/**
 * Shipped 2026 splash screens used in the demo. Lottie files are copied
 * byte-for-byte from the delivery folders; backgrounds are web-sized
 * copies of the delivered phone backgrounds.
 */

const BASE = "/systems/game-week-splash-screens";

export type SplashWeek = {
  id: string;
  week: string;
  opponent: string;
  matchup: string;
  context: string;
  lottie: string;
  background: "standard" | "rivalries";
};

export const SPLASH_BACKGROUNDS = {
  standard: `${BASE}/background-standard.jpg`,
  rivalries: `${BASE}/background-rivalries.jpg`,
} as const;

export const SPLASH_WEEKS: SplashWeek[] = [
  {
    id: "w01",
    week: "W1",
    opponent: "CLE",
    matchup: "Cleveland Browns vs. Jacksonville Jaguars",
    context: "Home · Standard edition",
    lottie: `${BASE}/w01-cle.json`,
    background: "standard",
  },
  {
    id: "w02",
    week: "W2",
    opponent: "DEN",
    matchup: "Jacksonville Jaguars at Denver Broncos",
    context: "Away · Standard edition",
    lottie: `${BASE}/w02-den.json`,
    background: "standard",
  },
  {
    id: "w08",
    week: "W8",
    opponent: "IND",
    matchup: "Indianapolis Colts vs. Jacksonville Jaguars",
    context: "Home · Rivalries edition",
    lottie: `${BASE}/w08-ind.json`,
    background: "rivalries",
  },
  {
    id: "w12",
    week: "W12",
    opponent: "TEN",
    matchup: "Tennessee Titans vs. Jacksonville Jaguars",
    context: "Home · Standard edition",
    lottie: `${BASE}/w12-ten.json`,
    background: "standard",
  },
];
