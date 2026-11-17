import type { Project } from "@/content/creative-technology/types";

export type InjuryReportDemo = {
  /** Real delivered practice reports, one per player count, in both formats. */
  sequence: { players: number; tall: string; wide: string; when: string }[];
  /**
   * The reports the demonstration assembles. `base` is the delivered report
   * with its rows lifted out; the rows are the delivered rows, cut from the
   * report itself (see scripts/creative-technology/extract-psd-layers.py).
   */
  build: { players: number; when: string; key: string; tall: { base: string; full: string }; wide: { base: string; full: string } }[];
  /** Other report modes and visual variants the same system produces. */
  modes: { key: string; label: string; tall: string; wide: string; caption: string }[];
  /** Modes shown after the builds, in the same scene, and when each was delivered. */
  looks: { mode: string; when: string; label?: string }[];
};

export const injuryReport: Project<InjuryReportDemo> = {
  id: "injury-report",
  slug: "injury-report",
  order: 4,
  title: "Injury report",
  year: "2026",
  summary:
    "Designed the 2026 Injury Report creative and built the graphics production system behind it. Structured player data generates 9:16 and 16:9 graphics that adapt to player count, name length, injury information, participation status and game status.",
  line: "The system that lays out the 2026 Injury Report from the team's report, in 9:16 and 16:9.",
  status: "production",
  statusNote: {
    text: "Delivered every game week of the 2026 season through Week 10.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "JavaScript automation", "Structured report data", "Layer-ID bindings", "Adaptive layout logic", "Automated QA"],
  automated: [
    "Parsing the pasted report into structured data",
    "Row, column and type sizing for each format",
    "Name and chip fitting",
    "A layered PSD and a PNG for both formats in one run",
    "Quality checks before anything is delivered",
  ],
  designerControlled: [
    "The creative and its sealed master files",
    "Visual variants: Standard, Throwback, Rivalries",
    "Every output remains a layered, editable PSD",
  ],
  detail: [
    "A report is pasted in as text, parsed into a structured model and matched against a local roster. Anything the parser cannot resolve stops the run before Photoshop opens.",
    "The layout is solved from the data rather than picked from fixed templates: row height, column count, chip widths and name fitting are calculated for each format, then applied to layers bound by ID.",
    "The finished PSD is read back by a separate checker that did not write it. Only a report that passes is staged for delivery.",
  ],
  pipeline: [
    { label: "Input", detail: "The report is pasted as text. Practice report, game status or gameday inactives." },
    { label: "Parse + validate", detail: "Structured entries, matched to a local roster. Unresolved rows stop the run." },
    { label: "Plan", detail: "Row height, columns, chip widths and name fitting solved per format." },
    { label: "Photoshop", detail: "A sealed master is populated through layer-ID bindings. 9:16 and 16:9 together." },
    { label: "QA", detail: "An independent reader re-opens the PSD and checks it against the plan." },
    { label: "Output", detail: "Layered PSD and PNG for each format, staged for delivery." },
  ],
  facts: [
    { text: "One run produces a layered PSD and a PNG in 2160 × 3840 and 3840 × 2160.", basis: "evidence" },
    { text: "Runs locally. No cloud services and no telemetry, so report data stays inside the team's workflow.", basis: "evidence" },
    { text: "Layers are bound by ID, never by name, so renaming a layer cannot break a report.", basis: "evidence" },
    { text: "Master files are hash-sealed and verified before and after every run.", basis: "evidence" },
    { text: "Over the certified maximum the run stops before Photoshop opens. It never clips and never shrinks past the template's scale.", basis: "evidence" },
    { text: "Automated checks include canvas size, text overflow, slot count, leftover template text, name and chip collisions, minimum text size and logo clearance.", basis: "evidence" },
    { text: "Three report modes: practice report, game status and gameday inactives.", basis: "evidence" },
    { text: "45 recorded production runs. Each took between 11 and 73 seconds for both formats.", basis: "evidence", tier: "internal" },
    { text: "Nine game weeks delivered: Weeks 1 to 6 and 8 to 10, with a bye in Week 7.", basis: "evidence", tier: "internal" },
  ],
  code: [
    {
      key: "layout",
      title: "populate.jsx",
      language: "js",
      origin: "excerpt",
      code: `// ExtendScript. Fails closed rather than guessing.
function refuse(m) { throw new Error('POPULATE_REFUSED: ' + m); }

function setRowHeight(slot, targetH) {
  var card = byId(slot.cardId);
  var cb = bx(card);
  var factor = targetH / cb.h;

  // Card + tab change height only.
  card.resize(100, factor * 100, AnchorPosition.TOPLEFT);
  if (slot.positionTabId) {
    byId(slot.positionTabId)
      .resize(100, factor * 100, AnchorPosition.TOPLEFT);
  }

  // Contents scale uniformly with the row, so type and
  // chips keep the designer's proportions.
  var nb = bx(card);
  var centre = nb.t + nb.h / 2;
  var inner = [slot.nameGroupId, slot.updateGroupId];
  for (var i = 0; i < inner.length; i++) {
    var l = byId(inner[i]);
    l.resize(factor * 100, factor * 100,
      AnchorPosition.MIDDLECENTER);
    var lb = bx(l);
    l.translate(0, centre - (lb.t + lb.h / 2));
  }
  return bx(card);
}`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
    },
  ],
  mediaPrefix: "injury-report/",
  demo: {
    sequence: [
      { players: 4, tall: "injury-report/standard-p04-9x16", wide: "injury-report/standard-p04-16x9", when: "Week 1, Thursday" },
      { players: 5, tall: "injury-report/standard-p05-9x16", wide: "injury-report/standard-p05-16x9", when: "Week 2, Wednesday" },
      { players: 6, tall: "injury-report/standard-p06-9x16", wide: "injury-report/standard-p06-16x9", when: "Week 2, Thursday" },
      { players: 8, tall: "injury-report/standard-p08-9x16", wide: "injury-report/standard-p08-16x9", when: "Week 4, Wednesday" },
      { players: 9, tall: "injury-report/standard-p09-9x16", wide: "injury-report/standard-p09-16x9", when: "Week 6, Wednesday" },
      { players: 10, tall: "injury-report/standard-p10-9x16", wide: "injury-report/standard-p10-16x9", when: "Week 9, Monday" },
      { players: 11, tall: "injury-report/standard-p11-9x16", wide: "injury-report/standard-p11-16x9", when: "Week 10, Thursday" },
    ],
    modes: [
      {
        key: "game-status",
        label: "Game status",
        tall: "injury-report/game-status-p09-9x16",
        wide: "injury-report/game-status-p09-16x9",
        caption: "A third chip column and a header tag are added. A missing value prints as two dashes.",
      },
      {
        key: "inactives",
        label: "Gameday inactives",
        tall: "injury-report/sample-inactives-p10-9x16",
        wide: "injury-report/sample-inactives-p10-16x9",
        caption: "A different row: position, name and jersey number only. Shown here with fictional names.",
      },
      {
        key: "throwback",
        label: "Throwback",
        tall: "injury-report/throwback-9x16",
        wide: "injury-report/throwback-16x9",
        caption: "A visual variant. Same data and layout law, solved inside different artwork.",
      },
      {
        key: "rivalries",
        label: "Rivalries",
        tall: "injury-report/rivalries-9x16",
        wide: "injury-report/rivalries-16x9",
        caption: "A visual variant. Same data and layout law, solved inside different artwork.",
      },
    ],
    looks: [
      { mode: "rivalries", when: "Week 8, Wednesday" },
      { mode: "throwback", when: "Week 3, Thursday" },
    ],
    build: [
      { players: 4, when: "Week 1", key: "p04", tall: { base: "injury-report/base-p04-9x16", full: "injury-report/standard-p04-9x16" }, wide: { base: "injury-report/base-p04-16x9", full: "injury-report/standard-p04-16x9" } },
      { players: 9, when: "Week 6", key: "p09", tall: { base: "injury-report/base-p09-9x16", full: "injury-report/standard-p09-9x16" }, wide: { base: "injury-report/base-p09-16x9", full: "injury-report/standard-p09-16x9" } },
      { players: 11, when: "Week 10", key: "p11", tall: { base: "injury-report/base-p11-9x16", full: "injury-report/standard-p11-9x16" }, wide: { base: "injury-report/base-p11-16x9", full: "injury-report/standard-p11-16x9" } },
    ],
  },
  publication: { copy: "approved", note: "Copy supplied by the owner for publication; technical facts confirmed locally." },
};
