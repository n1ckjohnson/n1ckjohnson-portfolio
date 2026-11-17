import type { Project } from "@/content/creative-technology/types";

/** Everything a ticketing creative can carry. A placement keeps some of these and drops the rest. */
export const SUITE_ELEMENTS = [
  "Player",
  "Headline",
  "Team marks",
  "Matchup",
  "Date and time",
  "Venue",
  "Presenting partner",
  "Ticket link",
] as const;

export type SuiteElement = (typeof SUITE_ELEMENTS)[number];

export type Placement = {
  key: string;
  /** Plain name of the placement. */
  label: string;
  /** Pixel size of the delivered file. */
  width: number;
  height: number;
  /** Manifest id of the real export. */
  asset: string;
  /** Read off the delivered file. Anything not listed was left out of this format. */
  keeps: SuiteElement[];
  /** One sentence on how this format is composed. */
  note: string;
  /** One of the two compositions the designer supplied. */
  source?: boolean;
  /** The same placement in each further look, in the order of `looks`. */
  alts?: string[];
};

/**
 * How the placements are packed for display: rows and columns of keys.
 * A string is a placement; `row` sets children side by side at one height,
 * `col` stacks them at one width.
 */
export type Pack = string | { row: Pack[] } | { col: Pack[] };

export type TicketingDemo = {
  /** Which suite is shown, and when its game was played. */
  suite: { week: string; matchup: string; played: string };
  /** Counted from the final shipping package on disk. Never typed by hand. */
  totals: { deliverables: number; sizes: number; families: number; layeredSources: number };
  placements: Placement[];
  /** The arrangement on a wide screen and on a phone. */
  layouts: { wide: { hero: string; pack: Pack }; narrow: { hero: string; pack: Pack } };
  /** The same creative in a second language. */
  localized: {
    english: string;
    spanish: string;
    regions: { key: string; label: string; box: [number, number, number, number]; note: string }[];
    suite: { key: string; asset: string; width: number; height: number }[];
  };
  /** The name of each campaign look shown, the first being this suite's own. */
  looks: string[];
};

export const ticketingSuites: Project<TicketingDemo> = {
  id: "ticketing-suites",
  slug: "creative-suites",
  order: 2,
  title: "Creative suite versioning",
  year: "2026",
  summary:
    "Production workflows for single-game ticketing suites across many placements and aspect ratios. One creative becomes a coordinated package: game information, player imagery, typography and layout are adapted for each format, not scaled.",
  line: "The system that versions one creative into a full campaign suite, composing every placement for its format, in English and Spanish.",
  status: "production-tested",
  statusNote: {
    text: "Used to build complete 2026 suites. The one shown is Week 8, the Rivalries game.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "JavaScript / scripting", "Structured creative data", "Suite versioning", "AI-assisted production workflows", "Automated export and validation"],
  automated: [
    "Building each placement from a per-target plan",
    "English and Spanish versions",
    "Rendering and export, including file-size limits",
    "Structural and content checks on every target",
    "QA boards for designer review",
  ],
  designerControlled: [
    "The original creative, in 16:9 and 9:16",
    "Review and direction of every correction",
    "Hand finishing where a format needs it",
  ],
  detail: [
    "A suite starts from the designer's original creative, supplied as two compositions: 16:9 and 9:16. A plan is written for every target in the package, and scripted Photoshop builds each artboard from its plan.",
    "Formats are composed, not resized. Landscape formats set the player beside the information and portrait formats stack them. Small tiles drop the player and the venue. The smallest strip keeps only the matchup.",
    "The player is repositioned between formats rather than rescaled, and every output stays a layered file a designer can open and finish.",
  ],
  pipeline: [
    { label: "Original creative", detail: "Designer-supplied 16:9 and 9:16 compositions in one file." },
    { label: "Plan", detail: "A per-target plan for every placement and size." },
    { label: "Build", detail: "Scripted Photoshop composes each artboard from its plan." },
    { label: "Localize", detail: "Spanish versions of the placements that need them." },
    { label: "Certify", detail: "Structure, content matrix, visual review, source-file hashes." },
    { label: "Export", detail: "Flattened deliverables and layered sources, by placement family." },
  ],
  facts: [
    { text: "The counts on this page are read from the final shipping package, not estimated.", basis: "evidence" },
    { text: "The suite shown is Week 8, Colts at Jaguars, played on 1 November 2026.", basis: "evidence" },
    { text: "Source files are hashed before and after each run to prove nothing upstream was altered.", basis: "evidence" },
    { text: "The player cutout is placed at the same pixel size in both source compositions. Formats move it. They do not rescale it.", basis: "evidence" },
    { text: "League placements are exported as JPGs under a 50 KB limit.", basis: "evidence" },
    { text: "Spanish versions translate the headline, the week and day, and the ticket link.", basis: "evidence" },
    { text: "AI-assisted here means the scripts were written and run with an AI coding assistant. No imagery is generated.", basis: "evidence" },
    {
      text: "Planning for the Week 8 suite sorted 61 targets into three classes: 15 matched a source aspect ratio, 21 kept the source's zones with adjusted margins, and 25 needed a composition of their own.",
      basis: "evidence",
      tier: "internal",
    },
  ],
  code: [
    {
      key: "roles",
      title: "semantic/roles.js",
      language: "js",
      origin: "excerpt",
      code: `INFO_BLOCK: { allowedOperations: ['MOVE', 'SCALE', 'SHOW', 'HIDE', 'PRESERVE'],
  movesWithParent: false, required: true,
  note: 'Rigid unit. Move the block, never its parts.' },
MATCHUP_MARKS: { allowedOperations: ['PRESERVE', 'SHOW', 'HIDE'], required: true },
DATE_TIME: { allowedOperations: ['PRESERVE', 'SHOW', 'HIDE'], required: true },
VENUE_LOCKUP: { allowedOperations: ['PRESERVE', 'SHOW', 'HIDE'], required: false },

// Presence is an editorial decision, never a property of the dimensions:
// 1080x1920 occurs as both PORTRAIT_SOCIAL and PORTRAIT_TICKETING.
export const EXPLICIT_INCLUSION_ROLES = Object.freeze([
  'PLAYER_IMAGERY', 'CTA_TICKETING', 'HEADLINE_EDGE_LOCKUP', 'BRAND_MARK',
]);

export const INCLUSION_DECISIONS = Object.freeze([
  'SHOW',   // visible in this target
  'HIDE',   // in the source, deliberately switched off here
  'ABSENT', // not in the source composition at all
]);`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
    },
  ],
  mediaPrefix: "ticketing/",
  demo: {
    suite: { week: "Week 8", matchup: "Colts at Jaguars", played: "1 November 2026" },
    totals: { deliverables: 53, sizes: 25, families: 11, layeredSources: 16 },
    placements: [
      {
        key: "social-16x9",
        label: "Social, landscape",
        width: 1920,
        height: 1080,
        asset: "ticketing/w8-social-16x9",
        alts: ["ticketing/w3-social-16x9", "ticketing/w12-social-16x9"],
        keeps: ["Player", "Headline", "Team marks", "Matchup", "Date and time", "Venue", "Presenting partner", "Ticket link"],
        note: "The original 16:9 creative. Player on the left, information stacked on the right.",
        source: true,
      },
      {
        key: "social-9x16",
        label: "Social, story",
        width: 1080,
        height: 1920,
        asset: "ticketing/w8-social-9x16",
        alts: ["ticketing/w3-social-9x16", "ticketing/w12-social-9x16"],
        keeps: ["Player", "Headline", "Team marks", "Matchup", "Date and time", "Venue", "Presenting partner"],
        note: "The original 9:16 creative. Information on top, player below.",
        source: true,
      },
      {
        key: "social-1x1",
        label: "Social, square",
        width: 1080,
        height: 1080,
        asset: "ticketing/w8-social-1x1",
        alts: ["ticketing/w3-social-1x1", "ticketing/w12-social-1x1"],
        keeps: ["Player", "Headline", "Team marks", "Matchup", "Date and time", "Venue", "Presenting partner"],
        note: "The story composition, tightened. The player is cropped to head and shoulders.",
      },
      {
        key: "skyscraper",
        label: "Skyscraper",
        width: 160,
        height: 600,
        asset: "ticketing/w8-tm-160x600",
        alts: ["ticketing/w3-tm-160x600", "ticketing/w12-tm-160x600"],
        keeps: ["Player", "Headline", "Team marks", "Matchup", "Date and time"],
        note: "The narrowest format. The day is dropped from the date line, and the player is shown to the waist.",
      },
      {
        key: "rectangle",
        label: "Medium rectangle",
        width: 300,
        height: 250,
        asset: "ticketing/w8-tm-300x250",
        alts: ["ticketing/w3-tm-300x250", "ticketing/w12-tm-300x250"],
        keeps: ["Team marks", "Matchup", "Date and time"],
        note: "Type only. At this size a likeness would not read.",
      },
      {
        key: "endcard",
        label: "TV endcard",
        width: 1920,
        height: 1080,
        asset: "ticketing/w8-endcard-16x9",
        alts: ["ticketing/w3-endcard-16x9", "ticketing/w12-endcard-16x9"],
        keeps: ["Team marks", "Matchup", "Date and time", "Venue", "Ticket link"],
        note: "The same shape as the landscape source with a different job: centred type for broadcast, no player.",
      },
      {
        key: "billboard",
        label: "Billboard",
        width: 970,
        height: 250,
        asset: "ticketing/w8-tm-970x250",
        alts: ["ticketing/w3-tm-970x250", "ticketing/w12-tm-970x250"],
        keeps: ["Player", "Headline", "Team marks", "Matchup", "Date and time", "Venue", "Ticket link"],
        note: "One row. The team marks stack so the information can run wide.",
      },
      {
        key: "banner",
        label: "Wide banner",
        width: 2400,
        height: 350,
        asset: "ticketing/w8-tm-2400x350",
        alts: ["ticketing/w3-tm-2400x350", "ticketing/w12-tm-2400x350"],
        keeps: ["Player", "Team marks", "Matchup", "Date and time", "Venue"],
        note: "The player becomes a small portrait at the left edge and the headline is dropped.",
      },
      {
        key: "leaderboard",
        label: "Leaderboard",
        width: 728,
        height: 90,
        asset: "ticketing/w8-tm-728x90",
        alts: ["ticketing/w3-tm-728x90", "ticketing/w12-tm-728x90"],
        keeps: ["Team marks", "Date and time", "Venue"],
        note: "The marks carry the matchup, so the one line of type goes to the date.",
      },
      {
        key: "mobile",
        label: "Mobile banner",
        width: 320,
        height: 50,
        asset: "ticketing/w8-tm-320x50",
        alts: ["ticketing/w3-tm-320x50", "ticketing/w12-tm-320x50"],
        keeps: ["Team marks", "Matchup"],
        note: "The smallest format. Only the matchup survives.",
      },
    ],
    layouts: {
      wide: {
        hero: "social-16x9",
        pack: {
          col: [
            { row: ["social-9x16", "skyscraper", { col: ["social-16x9", "endcard"] }, { col: ["social-1x1", "rectangle"] }] },
            { row: ["billboard", "banner"] },
            { row: ["leaderboard", "mobile"] },
          ],
        },
      },
      narrow: {
        hero: "social-9x16",
        pack: {
          col: [
            { row: ["social-9x16", "skyscraper", { col: ["social-1x1", "rectangle"] }] },
            { row: ["social-16x9", "endcard"] },
            "billboard",
            "banner",
            "leaderboard",
            "mobile",
          ],
        },
      },
    },
    looks: ["Rivalries", "Throwback", "Salute to Service"],
    localized: {
      english: "ticketing/w8-social-16x9",
      spanish: "ticketing/w8-social-16x9-es",
      /** Where the 16:9 changes, measured by comparing the two delivered files. x, y, w, h. */
      regions: [
        { key: "headline", label: "Headline", box: [0.11, 0.03, 0.31, 0.39], note: "The headline is set in Spanish, on the same arc." },
        { key: "week", label: "Week", box: [0.535, 0.435, 0.26, 0.08], note: "Week 8 becomes Semana 8." },
        { key: "day", label: "Day", box: [0.54, 0.56, 0.345, 0.095], note: "Sunday becomes Domingo. Date and time stay as they are." },
        { key: "link", label: "Link", box: [0.545, 0.73, 0.34, 0.09], note: "The ticket link points to the Spanish page." },
      ],
      /** The rest of the Spanish suite, built with the same changes. */
      suite: [
        { key: "social-9x16", asset: "ticketing/w8-social-9x16-es", width: 1080, height: 1920 },
        { key: "social-3x4", asset: "ticketing/w8-social-3x4-es", width: 1080, height: 1440 },
        { key: "social-1x1", asset: "ticketing/w8-social-1x1-es", width: 1080, height: 1080 },
        { key: "endcard", asset: "ticketing/w8-endcard-16x9-es", width: 1920, height: 1080 },
      ],
    },
  },
  publication: { copy: "approved", note: "Copy supplied by the owner. Counts and per-format contents verified against the Week 8 package on disk." },
};
