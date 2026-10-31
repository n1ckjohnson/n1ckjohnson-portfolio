/**
 * Selected systems — engineering and automation work.
 *
 * Copy here is deliberately brief and limited to what is documented.
 * Detailed process, evidence and results arrive in later case-study
 * handoffs; add them through `sections` rather than expanding `summary`.
 */

export type SystemSection = {
  heading: string;
  body: string[];
};

export type SystemWorkflow = {
  name: string;
  description?: string;
};

export type SystemProject = {
  slug: string;
  title: string;
  /** Short category shown in indexes, e.g. "Data-to-design automation". */
  discipline: string;
  /** One sentence. */
  summary: string;
  /** Capability areas the system covers. */
  scope: string[];
  tools?: string[];
  /** Distinct workflows that share one entry; explained separately. */
  workflows?: SystemWorkflow[];
  /** Interactive demonstration key — see components/demos/registry. */
  demo?: string;
  /** Evidence-based write-up sections, added as handoffs arrive. */
  sections?: SystemSection[];
  status?: "archived";
};

export const systems: SystemProject[] = [
  {
    slug: "injury-report-builder",
    title: "Injury Report Builder",
    discipline: "Data-to-design automation",
    summary:
      "Photoshop automation that parses injury report data and builds the finished graphic: adaptive layout, layered output, and validation checks before export.",
    scope: ["Report parsing", "Adaptive layouts", "Layered Photoshop output", "Quality validation"],
    tools: ["Photoshop"],
  },
  {
    slug: "game-week-splash-screens",
    title: "Game Week Splash Screens",
    discipline: "Code-driven motion",
    summary:
      "A repeatable motion production workflow for game week splash screens, adapted every week from one animation system.",
    scope: ["Code-driven animation", "Repeatable motion structure", "Weekly adaptations"],
    tools: ["Photoshop", "Lottie"],
    demo: "splash-screens",
  },
  {
    slug: "game-day-score-graphics",
    title: "Game-Day Score Graphics",
    discipline: "Photoshop production tooling",
    summary:
      "Tooling that prepares score graphics for each game state as editable files, so the designer keeps control of the final result.",
    scope: ["Game-state preparation", "Editable outputs", "Designer control"],
    tools: ["Photoshop"],
  },
  {
    slug: "single-game-ticket-suite",
    title: "Single Game Ticket Suite / Digital Game Week",
    discipline: "Multi-format production",
    summary:
      "Two related production workflows for versioning campaign creative across many formats under shared layout rules.",
    scope: ["Campaign versioning", "Layout rules", "Localization", "Quality review"],
    workflows: [{ name: "Single Game Ticket Suite" }, { name: "Digital Game Week" }],
  },
  {
    slug: "rivalries-color-correction",
    title: "Rivalries Color Correction",
    discipline: "Color treatment",
    summary:
      "A designer-approved color treatment applied image by image, with material-specific masking and fully editable output.",
    scope: ["Material-specific masking", "Image-by-image calibration", "Designer approval", "Editable output"],
    tools: ["Photoshop"],
  },
  {
    slug: "birthday-graphics-automation",
    title: "Birthday Graphics Automation",
    discipline: "Template automation",
    summary:
      "Automated player birthday graphics across three template variants, with portrait alignment and batch processing.",
    scope: ["Template variants: Bottom, Top, Side", "Portrait alignment", "Batch processing"],
  },
];
