import type { Project } from "@/content/creative-technology/types";
import type { Pack } from "@/lib/creative-technology/pack";

export type GameWeekDemo = {
  /**
   * Weekly versions of one master. Values are public schedule facts.
   * Only games that have been played are listed: add a week once it is over.
   */
  weeks: {
    key: string;
    week: string;
    opponent: string;
    site: "home" | "away";
    venue: string;
    date: string;
    kickoff: string;
    partner: string;
    header: string;
    liveBlog?: string;
    note?: string;
  }[];
  /** Computed from the real exports: where any week differs from the others. */
  mask: string;
  templates: { name: string; sizes: string; mode: "Automated" | "Semi-automated" }[];
  /** One week's package, every piece the delivered file. Opens from its header. */
  suite: {
    week: string;
    /** Every game-week deliverable that week, counted from the production folder. */
    total: number;
    placements: { key: string; label: string; width: number; height: number; asset: string; note: string }[];
    layouts: { wide: { hero: string; pack: Pack }; narrow: { hero: string; pack: Pack } };
  };
};

export const gameWeek: Project<GameWeekDemo> = {
  id: "game-week",
  slug: "game-week",
  order: 1,
  title: "Game week digital assets",
  year: "2026",
  summary:
    "A Photoshop-based production system for recurring Game Week creative. Masters are versioned from schedule and matchup data: opponent, home or away, logos, date, time and location. The creative stays editable.",
  line: "The system that versions the whole game-week package of assets for our digital platforms (website/app).",
  status: "production",
  statusNote: {
    text: "Weekly packages for Weeks 1 to 10 were built with scripted Photoshop jobs. A registry-driven panel is in development.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop (ExtendScript + UXP)", "JavaScript", "Game and template registries", "Protected creative masters", "Automated validation"],
  automated: [
    "Opponent mark, team order and the VS. or AT indicator",
    "Week label, date and kickoff, in US and UK formats",
    "Stadium lockup for home games, presenting partner by site",
    "Exports at every size a template requires",
    "Checks for leftover copy from a previous week",
  ],
  designerControlled: [
    "The masters. Builds only ever open copies",
    "Player art, routed to a manual queue by design",
    "Special-edition creative such as Throwback and Rivalries",
  ],
  detail: [
    "Each week starts from the masters. The build copies them into that week's folder, applies the matchup data and exports, and refuses to touch any document outside the week folder.",
    "What changes is deliberately narrow. The outlines on this page are computed from six real weekly exports: only the team marks, the week, date and kickoff bar and the partner slot differ. Everything else is the master.",
    "Anything that needs judgement, such as player art, is not automated. It is placed in a manual queue for the designer and the rest of the package is built around it.",
  ],
  pipeline: [
    { label: "Master", detail: "A read-only template for each asset type." },
    { label: "Game data", detail: "Opponent, site, week, date, kickoff, venue, partner." },
    { label: "Build", detail: "A copy of the master is populated inside that week's folder." },
    { label: "Validate", detail: "Site state, date formats, stale copy and master integrity are checked." },
    { label: "Export", detail: "Every required size, plus a manual queue for designer-led pieces." },
  ],
  facts: [
    { text: "Home games put the opponent first with VS. Away games put the Jaguars first with AT.", basis: "evidence" },
    { text: "Masters are read-only and compared before and after each build.", basis: "evidence" },
    { text: "UK versions use UK date and time formats and carry no presenting partner.", basis: "evidence" },
    { text: "Player art and some partner placement are intentionally left to the designer.", basis: "evidence" },
    { text: "The comparison overlay is calculated from the exports themselves. It is not drawn by hand.", basis: "evidence" },
    {
      text: "Nine weekly packages built in 2026: Weeks 1 to 6 and 8 to 10.",
      basis: "evidence",
      tier: "internal",
    },
    {
      text: "The template registry lists 21 asset families: 6 automated, 7 semi-automated, the rest manual or live.",
      basis: "evidence",
      tier: "internal",
    },
    {
      text: "The UXP panel has batch-run two templates across the 18-game schedule, 36 of 36 jobs. Weekly production currently runs through scripted jobs.",
      basis: "evidence",
      tier: "internal",
    },
  ],
  code: [
    {
      key: "version",
      title: "v1-engine.js",
      language: "js",
      origin: "excerpt",
      code: `// Which game-record fields a template needs for this game.
function resolveDataRequirements(template, game) {
  var MODULE_FIELD = {
    WEEK: "week",
    DATE: "dateDisplayUS",
    TIME: "kickoffLocal",
    LOCATION: "stadium",
    BROADCAST: "broadcast"
  };
  var required = [], missing = [];
  var mods = template.modules || [];

  for (var i = 0; i < mods.length; i++) {
    var m = mods[i];
    // Marks, VS. / AT and the partner resolve separately.
    if (m === "MATCHUP" || m === "SPONSOR" || m === "SITE_VS_AT") continue;
    var field = MODULE_FIELD[m];
    if (!field) continue;
    required.push({ module: m, field: field });
    if (fieldAbsenceKind(game, field) === "BLOCKING") {
      missing.push({ module: m, field: field });
    }
  }
  return { required: required, missing: missing };
}`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
      marks: {
        w01: [[3, 9]],
        w02: [[13, 19]],
        w04: [[4, 6], [17, 19]],
        w05: [[15, 16]],
        w06: [[20, 22]],
        w09: [[10, 11]],
      },
    },
  ],
  mediaPrefix: "game-week/",
  demo: {
    /** Four played games, each showing something different: home, away, London, and the TNF master. */
    weeks: [
      { key: "w01", week: "W1", opponent: "CLE", site: "home", venue: "Jacksonville", date: "9.13", kickoff: "1:00 PM", partner: "Home partner", header: "game-week/gch-w01", liveBlog: "game-week/live-blog-w01" },
      { key: "w02", week: "W2", opponent: "DEN", site: "away", venue: "Denver", date: "9.20", kickoff: "4:05 PM", partner: "Away partner", header: "game-week/gch-w02", liveBlog: "game-week/live-blog-w02" },
      { key: "w05", week: "W5", opponent: "PHI", site: "home", venue: "London", date: "10.11", kickoff: "9:30 AM", partner: "Team badge", header: "game-week/gch-w05" },
      { key: "w09", week: "W9", opponent: "BAL", site: "away", venue: "Baltimore", date: "11.5", kickoff: "8:15 PM", partner: "Away partner", header: "game-week/gch-w09", note: "TNF edition. Same structure, darker surface." },
    ],
    mask: "game-week/gch-variable-mask",
    templates: [
      { name: "Game Center Header", sizes: "3000 × 1000", mode: "Automated" },
      { name: "Social Game Header", sizes: "3000 × 1000", mode: "Automated" },
      { name: "Global Header", sizes: "3000 × 282 · 2050 × 240", mode: "Automated" },
      { name: "Live Blog", sizes: "3840 × 2160", mode: "Automated" },
      { name: "Split Banner", sizes: "2400 × 800 × 2", mode: "Automated" },
      { name: "Highlight Cover", sizes: "1080 × 1620 · 256 × 256", mode: "Automated" },
      { name: "Ticket Promo / Away Game", sizes: "3840 × 2160", mode: "Semi-automated" },
      { name: "Where to Watch", sizes: "16:9 · 3:4 · 9:16", mode: "Semi-automated" },
      { name: "UK Game Week / Game Day", sizes: "2160 × 2880", mode: "Semi-automated" },
    ],
    suite: {
      week: "Week 1 · Browns at Jaguars",
      /**
       * Week 1 has 24 game-week deliverables (US and UK, counted once each; revisions and PSDs
       * not counted): 7 in the final delivery folder, 14 re-exported after the designer's manual
       * pass, 3 not yet resolved. These nine are verified finished, laid out as the montage was.
       */
      total: 24,
      placements: [
        { key: "gch", label: "Game Center header", width: 3000, height: 1000, asset: "game-week/gch-w01", note: "The week's header. Everything else follows the same data." },
        { key: "social", label: "Social header", width: 3000, height: 1000, asset: "game-week/w01-social-header", note: "Its own master, with the presenting partner." },
        { key: "live", label: "Live Blog", width: 3840, height: 2160, asset: "game-week/live-blog-w01", note: "The live coverage cover." },
        { key: "watch-16x9", label: "Where to Watch, 16:9", width: 3840, height: 2160, asset: "game-week/w01-watch-16x9", note: "Kickoff and the broadcast partner." },
        { key: "ticket", label: "Ticket promotion", width: 3840, height: 2160, asset: "game-week/w01-ticket-16x9", note: "Home-game ticket promotion." },
        { key: "watch-9x16", label: "Where to Watch, 9:16", width: 2160, height: 3840, asset: "game-week/w01-watch-9x16", note: "Story format, with player art." },
        { key: "watch-3x4", label: "Where to Watch, 3:4", width: 2160, height: 2880, asset: "game-week/w01-watch-3x4", note: "Portrait format, with player art." },
        { key: "highlight", label: "Highlight cover", width: 1080, height: 1620, asset: "game-week/w01-highlight-cover", note: "Story highlight cover." },
        { key: "icon", label: "Highlight icon", width: 256, height: 256, asset: "game-week/w01-highlight-icon", note: "The same mark, as an icon." },
      ],
      layouts: {
        wide: {
          hero: "gch",
          pack: {
            col: [
              { row: ["gch", "social"] },
              { row: ["watch-9x16", "watch-3x4", { col: ["live", "watch-16x9"] }, { col: ["ticket", { row: ["highlight", "icon"] }] }] },
            ],
          },
        },
        narrow: {
          hero: "gch",
          pack: { col: ["gch", "social", { row: ["watch-9x16", "watch-3x4", "highlight"] }, { row: ["live", "ticket"] }, { row: ["watch-16x9", "icon"] }] },
        },
      },
    },
  },
  publication: { copy: "approved", note: "Copy supplied by the owner; stack and status adjusted to match local evidence." },
};
