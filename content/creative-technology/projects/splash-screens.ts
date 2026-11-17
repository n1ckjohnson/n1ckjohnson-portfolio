import type { Project } from "@/content/creative-technology/types";
import games from "@/content/creative-technology/data/splash-games.json";

export type SplashGame = {
  key: string;
  week: string;
  opponent: string;
  site: "home" | "away";
  edition: string | null;
  background: string;
  lottie: string;
  poster: string;
};

export type SplashDemo = {
  /** Left to right, in schedule order. Only games that have been played. */
  games: SplashGame[];
  backgrounds: Record<string, string>;
  spec: { width: number; height: number; fps: number; frames: number; holdFrom: number };
  /** What each matchup version changes, and what it never touches. */
  variable: string[];
  constant: string[];
};

const order = (key: string) => {
  const match = key.match(/^(p?)w(\d+)/);
  if (!match) return 999;
  return (match[1] ? 0 : 100) + Number(match[2]);
};

const EDITION: Record<string, string> = {
  NIGHT_A: "TNF edition",
  NIGHT_B: "TNF edition",
};

/**
 * The versions shown on the page. Every one is a game that has been played:
 * creative for an upcoming game is never shown, even in the internal preview.
 * Add a key here once its game is over.
 */
const PLAYED = ["pw2-car", "pw3-tb", "w01-cle", "w02-den", "w04-cin", "w05-phi", "w06-hou", "w08-ind", "w09-bal-night-a"];

const splashGames: SplashGame[] = [...games]
  .filter((game) => PLAYED.includes(game.key))
  .sort((a, b) => order(a.key) - order(b.key) || a.key.localeCompare(b.key))
  .map((game) => ({
    key: game.key,
    week: game.wk,
    opponent: game.opp,
    site: game.rel === "VS" ? "home" : "away",
    edition: game.edition ? EDITION[game.edition] ?? "Special edition" : game.background === "rivalries" ? "RIVALRIES edition" : null,
    background: game.background,
    lottie: `splash/${game.key}`,
    poster: `splash/poster-${game.key}`,
  }));

export const splashScreens: Project<SplashDemo> = {
  id: "splash-screens",
  slug: "splash-screens",
  order: 1,
  parent: "game-week",
  title: "Jaguars App splash screens",
  year: "2026",
  summary:
    "A versioning system for the Jaguars App splash-screen animation. Structured game data drives each matchup version, and the workflow automates production and export into the formats the app requires.",
  line: "The same game data versions the animation that opens the Jaguars App on game week: one Lottie file per game.",
  status: "production",
  statusNote: {
    text: "17 final deliveries for the 2026 season so far, including Rivalries, London and night editions.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["JavaScript", "Lottie / JSON", "Structured game data", "Automated versioning and export", "Photoshop source assets", "Local rendering", "Frame validation"],
  automated: [
    "Building each matchup version from game data",
    "A transparent, self-contained Lottie file per game",
    "Phone and tablet backgrounds, reference renders and a handoff note",
    "Frame-by-frame validation before delivery",
  ],
  designerControlled: [
    "The animation and its timing",
    "Photoshop source artwork for marks and backgrounds",
    "Special editions and their art direction",
  ],
  detail: [
    "The animation was designed once. Its motion settings are locked, and every build checks that lock before it renders, so week 16 moves exactly like week 1.",
    "Game data supplies only what differs between matchups: the two team marks, whether the game is home or away, the week and the presenting partner. Date and kickoff are not part of the splash.",
    "Each version is rendered locally and validated frame by frame before the delivery folder is assembled. The screens on this page are running the delivered Lottie files, not a video of them.",
  ],
  pipeline: [
    { label: "Source art", detail: "Team marks and backgrounds exported from Photoshop." },
    { label: "Game data", detail: "Opponent, home or away, week, presenting partner." },
    { label: "Build", detail: "The locked motion is applied and a self-contained Lottie is written." },
    { label: "Render", detail: "A local render produces reference GIF and MP4 files." },
    { label: "Validate", detail: "Frame count, canvas size, safe areas and the final hold are checked." },
    { label: "Deliver", detail: "Lottie, phone and tablet backgrounds, references, handoff note." },
  ],
  facts: [
    { text: "Every delivery is one Lottie at 1242 × 2688, 30 frames per second, 96 frames, with static phone and tablet backgrounds.", basis: "evidence" },
    { text: "Validation checks frame count, canvas size, safe-area violations, empty frames and that the animation holds still from frame 56.", basis: "evidence" },
    { text: "The motion configuration is locked by hash. A build that does not match the lock does not run.", basis: "evidence" },
    { text: "The splash carries the matchup, week and presenting partner. It does not show date, time or location.", basis: "evidence" },
    { text: "The page plays the delivered Lottie files byte for byte.", basis: "evidence" },
    { text: "Only games that have been played are shown here.", basis: "evidence" },
    { text: "17 final delivery folders exist for 2026: preseason, regular season, Rivalries, London and two night editions.", basis: "evidence", tier: "internal" },
  ],
  code: [
    {
      key: "game",
      title: "SEASON_2026_SPLASH_MANIFEST.json",
      language: "json",
      origin: "excerpt",
      code: `{
  "gameId": "PW2",
  "side": "HOME",
  "opponent": "Carolina Panthers",
  "relation": "VS",
  "visitingLeft": "Carolina Panthers",
  "homeRight": "Jacksonville Jaguars",
  "visitorAbbreviation": "CAR",
  "homeAbbreviation": "JAX",
  "sponsorMode": "HOME",
  "homeSponsorGroup": "PW2_SPONSOR_GROUP"
}`,
      note: "One game record from the season manifest, as written.",
    },
    {
      key: "validate",
      title: "validate_season_2026_batch.py",
      language: "py",
      origin: "excerpt",
      code: `SAFE_Y0, SAFE_Y1 = 2588, 2688
HOLD_FROM = 56

for f in frames:
    a = np.array(Image.open(f))
    alpha = a[..., 3]
    if alpha.max() > 0:
        r["nonempty_frames"] += 1
    band = alpha[SAFE_Y0:SAFE_Y1, :]
    if band.max() != 0:
        r["safe_area_violations"].append((n, int(band.max())))
    if n >= HOLD_FROM:
        if hold_first is None:
            hold_first = a
        elif not np.array_equal(a, hold_first):
            hold_identical = False

r["result"] = "PASS" if (r["frame_count"] == 96
    and r["single_canvas_size"]
    and r["safe_area_max_alpha"] == 0
    and hold_identical
    and r["nonempty_frames"] >= 90) else "FAIL"`,
      note: "Run on the rendered pixels of the exact file delivered. Excerpt from the working source. Shortened; paths and private values removed.",
    },
  ],
  mediaPrefix: "splash/",
  demo: {
    games: splashGames,
    backgrounds: {
      standard: "splash/background-standard",
      rivalries: "splash/background-rivalries",
      dark: "splash/background-dark",
    },
    spec: { width: 1242, height: 2688, fps: 30, frames: 96, holdFrom: 56 },
    variable: ["Team marks", "VS. or AT", "Week", "Presenting partner"],
    constant: ["Animation and timing", "Layout and safe areas", "Delivery structure"],
  },
  publication: { copy: "approved", note: "Copy supplied by the owner; details confirmed against the delivery folders." },
};
