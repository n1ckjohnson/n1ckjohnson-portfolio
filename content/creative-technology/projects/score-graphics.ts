import type { Project } from "@/content/creative-technology/types";

export type ScoreState = {
  key: string;
  /** Control label. */
  label: string;
  /** Label printed on the graphic for this state. */
  printed: string;
  /** Historical fixture this real graphic comes from. */
  fixture: string;
  away: { team: string; score: number };
  home: { team: string; score: number };
  /** Whether the partner tab is shown. An operator decision at every state. */
  partner: boolean;
  /** Asset id stems: "<stem>-3x4" and "<stem>-9x16". */
  stem: string;
  /** Optional UK edition of the same state. */
  ukStem?: string;
};

/** One real game, period by period. Scores are as printed on the delivered graphics. */
export type ScoreGame = {
  key: string;
  label: string;
  fixture: string;
  /** Asset id stems, as in ScoreState. */
  /** `partner` is true where the delivered graphic shows the presenting-partner tab. */
  periods: { label: string; score: string; stem: string; partner?: boolean }[];
};

export type ScoreDemo = {
  states: ScoreState[];
  games: ScoreGame[];
  formats: { key: "3x4" | "9x16"; label: string; ratio: [number, number] }[];
  /** What the operator sets at each state. */
  controls: string[];
  /** What the system refuses. */
  guards: string[];
  /** The win state in other creative families, built by the same system. 3:4. `label` is the control; `game` is the source fixture, not shown. */
  families: { key: string; label: string; game: string; asset: string }[];
};

export const scoreGraphics: Project<ScoreDemo> = {
  id: "score-graphics",
  slug: "score-graphics",
  order: 5,
  title: "Score graphics",
  year: "2026",
  summary:
    "Automation for quarter and final score graphics in 3:4 and 9:16. A local control surface sets the period, the score and partner visibility, crops the photo for both formats and delivers verified outputs during the game.",
  line: "The automation that sets the period, the score and the photo crop for quarter and final score graphics during the game.",
  status: "production-tested",
  statusNote: {
    text: "Run live on a 2026 preseason game day, after a full rehearsal.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "JavaScript automation", "Layer-ID targeting", "Game-state logic", "Runtime QA", "Layered PSD output"],
  automated: [
    "Setting the period and both scores on the template",
    "Showing or hiding the partner tab",
    "Cropping the chosen photo for 3:4 and 9:16",
    "Verifying and delivering the finished files",
  ],
  designerControlled: [
    "The template and every layer in it",
    "Photo selection and crop adjustment",
    "Partner visibility, chosen at every state",
    "Approval before anything is delivered",
  ],
  detail: [
    "Score graphics are made against the clock. The system removes the mechanical steps and leaves the judgement: the operator picks the photo, confirms the score, approves the preview, and the files are delivered.",
    "It fails closed. An invalid score, an unsupported period or a template that does not match its recorded state stops the run before anything is rendered.",
    "The template covers first quarter, halftime, third quarter, final and a JAGS WIN treatment. The graphics shown are real delivered files from two 2026 games.",
  ],
  pipeline: [
    { label: "Preflight", detail: "Template integrity, Photoshop and outputs are checked before kickoff." },
    { label: "State", detail: "Period, both scores and partner visibility are set." },
    { label: "Photo", detail: "The chosen image is cropped for both formats and can be nudged." },
    { label: "Approve", detail: "A preview is reviewed before anything final is written." },
    { label: "Deliver", detail: "Outputs are verified, then copied to delivery with a receipt." },
  ],
  facts: [
    { text: "Two formats per state: 3:4 and 9:16.", basis: "evidence" },
    { text: "Partner visibility is an explicit choice at every state. There is no default.", basis: "evidence" },
    { text: "Layers are targeted by ID from a template contract, never by name.", basis: "evidence" },
    { text: "Invalid scores and unsupported periods are refused before rendering.", basis: "evidence" },
    { text: "Rendered files are checked for pixel dimensions and the template is verified unchanged.", basis: "evidence" },
    { text: "Test record before the first live run: 170 of 170 backend checks, 98 of 98 interface checks, and a 23-point game-day preflight.", basis: "evidence", tier: "internal" },
    { text: "The automated control surface covers first quarter, halftime, third quarter and final. The JAGS WIN treatment is a template state.", basis: "evidence", tier: "internal" },
  ],
  code: [
    {
      key: "state",
      title: "quarterRules.js",
      language: "js",
      origin: "excerpt",
      code: `const PERIOD_ORDER = ["Q1", "Q2", "Q3", "FINAL"];

const STATES = {
  Q1: { text: "Q1", dots: ["on", "off", "off", "off"] },
  Q2: { text: "Q2", dots: ["on", "on", "off", "off"] },
  Q3: { text: "Q3", dots: ["on", "on", "on", "off"] },
  FINAL: { text: "FINAL", dots: ["on", "on", "on", "on"] },
};

// Recognised, but no render rule supplied: fail closed.
const KNOWN_UNSUPPORTED = ["Q4", "HALFTIME", "OT", "OVERTIME"];

function resolvePeriodState(token) {
  const upper = token.toUpperCase();
  if (STATES[upper]) return { token: upper, ...STATES[upper] };
  if (KNOWN_UNSUPPORTED.indexOf(upper) !== -1) {
    throw new Error(\`PERIOD_NOT_YET_SUPPORTED: "\${upper}". Refusing to guess.\`);
  }
  throw new Error(\`PERIOD_UNKNOWN: "\${token}"\`);
}`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
      marks: {
        q1: [[4, 4], [14, 15]],
        half: [[5, 5], [14, 15]],
        q3: [[6, 6], [14, 15]],
        win: [[7, 7], [14, 15]],
        guard: [[10, 11], [16, 18]],
      },
    },
  ],
  mediaPrefix: "score/",
  demo: {
    states: [
      { key: "q1", label: "Q1", printed: "Q1", fixture: "Week 1 · Cleveland at Jacksonville", away: { team: "CLE", score: 0 }, home: { team: "JAX", score: 14 }, partner: false, stem: "score/w1-q1" },
      { key: "half", label: "Half", printed: "HALF", fixture: "Week 1 · Cleveland at Jacksonville", away: { team: "CLE", score: 0 }, home: { team: "JAX", score: 24 }, partner: true, stem: "score/w1-half" },
      { key: "q3", label: "Q3", printed: "Q3", fixture: "Week 1 · Cleveland at Jacksonville", away: { team: "CLE", score: 3 }, home: { team: "JAX", score: 34 }, partner: false, stem: "score/w1-q3" },
      { key: "final", label: "Final", printed: "FINAL", fixture: "Preseason Week 1 · Jacksonville at New Orleans", away: { team: "JAX", score: 24 }, home: { team: "NO", score: 20 }, partner: false, stem: "score/pw1-final" },
      { key: "win", label: "Win", printed: "JAGS WIN", fixture: "Week 1 · Cleveland at Jacksonville", away: { team: "CLE", score: 10 }, home: { team: "JAX", score: 34 }, partner: false, stem: "score/w1-win", ukStem: "score/w1-win-uk" },
    ],
    games: [
      {
        key: "w1",
        label: "Week 1",
        fixture: "Week 1, Cleveland at Jacksonville",
        periods: [
          { label: "Q1", score: "CLE 0, JAX 14", stem: "score/w1-q1" },
          { label: "Half", score: "CLE 0, JAX 24", stem: "score/w1-half", partner: true },
          { label: "Q3", score: "CLE 3, JAX 34", stem: "score/w1-q3" },
          { label: "Jags Win", score: "CLE 10, JAX 34", stem: "score/w1-win" },
        ],
      },
      {
        key: "pw1",
        label: "Preseason Week 1",
        fixture: "Preseason Week 1, Jacksonville at New Orleans",
        periods: [
          { label: "Q1", score: "JAX 6, NO 7", stem: "score/pw1-q1" },
          { label: "Half", score: "JAX 6, NO 20", stem: "score/pw1-half", partner: true },
          { label: "Q3", score: "JAX 14, NO 20", stem: "score/pw1-q3" },
          { label: "Final", score: "JAX 24, NO 20", stem: "score/pw1-final" },
        ],
      },
    ],
    formats: [
      { key: "3x4", label: "3:4", ratio: [3, 4] },
      { key: "9x16", label: "9:16", ratio: [9, 16] },
    ],
    controls: ["Period", "Score", "Partner on / off", "Photo + crop"],
    guards: ["Invalid score", "Unsupported period", "Template drift"],
    families: [
      { key: "throwback", label: "Throwback", game: "Week 3 vs NE", asset: "score/w3-win-3x4" },
      { key: "rivalries", label: "Rivalries", game: "Week 8 vs IND", asset: "score/w8-win-3x4" },
      { key: "tnf", label: "TNF", game: "Week 9 at BAL", asset: "score/w9-win-3x4" },
    ],
  },
  publication: { copy: "approved", note: "Copy adjusted to what local evidence supports. See the QA notes." },
};
