import type { Project } from "@/content/creative-technology/types";
import type { EmailSlice } from "@/lib/creative-technology/email-slices";

export type EmailModule = {
  key: string;
  label: string;
  /** Real slice heights, in pixels of the 2400-wide master. */
  height: number;
  /** Semantic photo slots this module owns. */
  slots: string[];
  /** What changes from game to game. */
  varies: string;
};

export type EmailDemo = {
  /** The native email, in pixels. */
  width: number;
  height: number;
  modules: EmailModule[];
  /**
   * Finished, sent-layout emails, each as its genuine Save for Web slices in
   * slice order. Geometry is native pixels, measured from the exported files:
   * the slices tile the email exactly (see lib/creative-technology/email-slices).
   */
  editions: { key: string; label: string; theme: string; alt: string; note: string; source: string; slices: EmailSlice[] }[];
};

/*
 * The slice rows every edition shares, measured from the exports. Rows sum to
 * 4983. The moments row is one 2400 slice in Weeks 8 and 9 and three 800
 * slices in Week 3; the highlights row is two 1200 slices in all three.
 * The light 4px rules at several row edges, and the hero subject breaking
 * out above the hero frame into the header, are in the artwork itself.
 */
const full = (asset: string, y: number, h: number): EmailSlice => ({ asset, x: 0, y, w: 2400, h });
const split = (stem: string, first: number, y: number, h: number, columns: number): EmailSlice[] =>
  Array.from({ length: columns }, (_, i) => ({ asset: `${stem}-${String(first + i).padStart(2, "0")}`, x: (i * 2400) / columns, y, w: 2400 / columns, h }));

/** Nine slices: header, hero, moments, vote band, highlights ×2, labels band, coming up next, next home game. */
const nineSlices = (stem: string): EmailSlice[] => [
  full(`${stem}-01`, 0, 1335),
  full(`${stem}-02`, 1335, 839),
  full(`${stem}-03`, 2174, 478),
  full(`${stem}-04`, 2652, 302),
  ...split(stem, 5, 2954, 686, 2),
  full(`${stem}-07`, 3640, 237),
  full(`${stem}-08`, 3877, 556),
  full(`${stem}-09`, 4433, 550),
];

/** Eleven slices: as nine, with the moments row as three. */
const elevenSlices = (stem: string): EmailSlice[] => [
  full(`${stem}-01`, 0, 1335),
  full(`${stem}-02`, 1335, 839),
  ...split(stem, 3, 2174, 478, 3),
  full(`${stem}-06`, 2652, 302),
  ...split(stem, 7, 2954, 686, 2),
  full(`${stem}-09`, 3640, 237),
  full(`${stem}-10`, 3877, 556),
  full(`${stem}-11`, 4433, 550),
];

export const postgameEmail: Project<EmailDemo> = {
  id: "postgame-email",
  slug: "jags-win-email",
  order: 8,
  title: "Jags Win email",
  year: "2026",
  summary:
    "A modular workflow for recurring postgame emails. Photography, game outcome, content, visual theme and the next promoted matchup change with every game. The editable Photoshop master and the sliced-email export stay intact.",
  line: "The modular workflow behind the postgame email. The photography, the result and the next matchup change every game.",
  status: "production-tested",
  statusNote: {
    text: "2026 emails were built with scripted per-week passes. The manifest-driven pipeline is built and tested but has not yet run a live week.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "JavaScript automation", "Smart Objects", "Semantic image slots", "Outcome-based content logic", "Slice-preserving export"],
  automated: [
    "Placing photography into named slots, cover-fitted",
    "Score, headline and caption updates",
    "Starting the build from the final result",
    "Re-skinning for themed games",
    "Export through the master's own slice table",
  ],
  designerControlled: [
    "The master design and its slices",
    "Photo selection and moment captions",
    "The next home game to promote",
    "Theme art direction",
  ],
  detail: [
    "The email is built as modules. Each photograph has a named slot with a frame and an embedded Smart Object, so an image can be swapped without touching the layout around it.",
    "Themed games re-skin the same six modules: Rivalries, TNF and Throwback editions change the header, colors and marks, never the structure.",
    "Export uses the slice table saved in the master. The script refuses a document with unsaved changes and keeps QA renders out of the production folder.",
  ],
  pipeline: [
    { label: "Result", detail: "A Jaguars win starts the build." },
    { label: "Slots", detail: "Six named photo slots are filled and cover-fitted." },
    { label: "Content", detail: "Score, moment captions and the next home game are set." },
    { label: "Theme", detail: "Themed games re-skin the same structure." },
    { label: "Checks", detail: "Structure, typography and safe zones are verified." },
    { label: "Export", detail: "The saved slice table produces the email images." },
  ],
  facts: [
    { text: "Six semantic photo slots: Hero, three Moments, Highlights and Gallery.", basis: "evidence" },
    { text: "The outcome state is derived from venue and result. It is never typed by hand.", basis: "evidence" },
    { text: "The next home game is a designer input, checked to fall after the game date.", basis: "evidence" },
    { text: "The current master exports nine slices, 4,983 pixels tall at 2,400 wide.", basis: "evidence" },
    { text: "Automated checks: 197 logic tests and 319 PSD checks on structure, typography and safe zones. Slice count and size are not yet asserted.", basis: "evidence", tier: "internal" },
    { text: "The documented rule that drops Moments for away wins was not applied to the 2026 away-win emails; they shipped with the full layout.", basis: "evidence", tier: "internal" },
  ],
  code: [
    {
      key: "plan",
      title: "40_place_photos.jsx",
      language: "js",
      origin: "excerpt",
      code: `// Each photo: an embedded Smart Object, cover-fitted, clipped to its frame.
for (var i = 0; i < P.slots.length; i++) {
  var spec = P.slots[i];
  var frame = boundsOf(mustFind(doc, spec.frame_layer));

  // A rerun replaces rather than stacks.
  var old = findAllByName(doc, spec.photo_layer, []);
  for (var k = 0; k < old.length; k++) old[k].remove();

  selectLayerByName(spec.frame_layer, false);
  var photo = placeEmbedded(spec.path);
  photo.name = spec.photo_layer;
  coverFit(photo, frame);
  photo.grouped = true; // clip to the frame beneath
}

function coverFit(layer, frame) {
  var fw = frame[2] - frame[0], fh = frame[3] - frame[1];
  var b = boundsOf(layer);
  var scale = Math.max(fw / (b[2] - b[0]), fh / (b[3] - b[1])) * 100;
  layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
}`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
      marks: {
        assemble: [[2, 15]],
        w9: [[10, 14]],
        w3: [[17, 22]],
      },
    },
  ],
  mediaPrefix: "email/",
  demo: {
    width: 2400,
    height: 4983,
    modules: [
      { key: "header", label: "Header", height: 1335, slots: [], varies: "Headline treatment and theme" },
      { key: "hero", label: "Hero + score", height: 839, slots: ["Hero"], varies: "Photo, both scores, opponent mark" },
      { key: "moments", label: "Game day moments", height: 780, slots: ["Moment 1", "Moment 2", "Moment 3"], varies: "Three photos and captions" },
      { key: "links", label: "Highlights + gallery", height: 923, slots: ["Highlights", "Gallery"], varies: "Two photos" },
      { key: "next", label: "Coming up next", height: 556, slots: [], varies: "Opponent, week, date, kickoff" },
      { key: "tickets", label: "Next home game", height: 550, slots: [], varies: "Ticket call to action" },
    ],
    editions: [
      {
        key: "w8",
        label: "Rivalries",
        theme: "Themed home win",
        alt: "Jags Win postgame email, Week 8, Rivalries theme, full length",
        note: "Script headline and cream band. Same six modules.",
        source: "Save for Web slices exported with the final save of the Week 8 working file (the 4:05 PM edition).",
        slices: nineSlices("email/w8"),
      },
      {
        key: "w9",
        label: "TNF",
        theme: "Away win",
        alt: "Jags Win postgame email, Week 9, night theme, full length",
        note: "Dark surface and block headline. Same six modules.",
        source: "Save for Web slices exported with the final save of the Week 9 working file.",
        slices: nineSlices("email/w9"),
      },
      {
        key: "w3",
        label: "Throwback",
        theme: "Themed home win",
        alt: "Jags Win postgame email, Week 3, Throwback theme, full length",
        note: "Throwback marks and helmet score box. Same six modules.",
        source: "Save for Web slices exported with the final save of the Week 3 working file.",
        slices: elevenSlices("email/w3"),
      },
    ],
  },
  publication: { copy: "approved", note: "Copy adjusted to what local evidence supports. See the QA notes." },
};
