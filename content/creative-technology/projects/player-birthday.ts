import type { Project } from "@/content/creative-technology/types";

export type BirthdayLayout = "bottom" | "top" | "side";

export type BirthdayDemo = {
  layouts: { key: BirthdayLayout; label: string; note: string }[];
  players: { key: string; name: string; position: string; number: string; layout: BirthdayLayout; graphic: string }[];
  /**
   * One player's graphic, assembled from the layer groups of its production
   * PSD (see scripts/creative-technology/extract-psd-layers.py), bottom to top.
   */
  build: { player: string; layers: { key: string; asset: string }[] };
};

export const playerBirthday: Project<BirthdayDemo> = {
  id: "player-birthday",
  slug: "player-birthdays",
  order: 7,
  title: "Player birthdays",
  year: "2026",
  summary:
    "A structured production system around the Jaguars Social birthday template. Player data, imagery and signatures are processed in batches: image replacement, name updates, signature treatment, typography fitting and export.",
  line: "The system that turns the birthday template into a finished graphic for any player: photo, signature, name and number.",
  status: "built",
  statusNote: {
    text: "Production packages were built with it in October and November 2026.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "ExtendScript / JavaScript", "JSON configuration", "Smart Objects", "Batch processing", "Signature processing", "PSD / PNG output"],
  automated: [
    "Replacing the player image and aligning it to the layout",
    "Name, number and position, with the position chip sized to its text",
    "Cleaning the signature and fitting it to its bounds",
    "A layered PSD and a PNG for every player in the batch",
  ],
  designerControlled: [
    "The template and its layouts",
    "Which layout each player gets",
    "Photo selection and any final polish",
  ],
  detail: [
    "A player is chosen from a registry that supplies name, number, position and the matching signature. The operator adds the photography; the system does the rest.",
    "The photo is placed through a Smart Object, so the designer's crop, mask and effects stay live. The signature is cleaned, sized to its bounds and keeps the template's gold treatment.",
    "The position chip is responsive: it grows to fit its text and the number and name move with it, so a two-letter and a three-letter position both sit correctly.",
  ],
  pipeline: [
    { label: "Player", detail: "Picked from the registry: name, number, position, signature." },
    { label: "Imagery", detail: "The operator supplies the photograph for each artboard." },
    { label: "Layout", detail: "Bottom, Top or Side, set by the designer per player." },
    { label: "Build", detail: "Smart Object replacement, text and chip fitting, signature placement." },
    { label: "Export", detail: "Layered PSD and PNG at 2160 × 2880." },
  ],
  facts: [
    { text: "One template carries several layouts. Bottom, Top and Side are shown here.", basis: "evidence" },
    { text: "Outputs are 2160 × 2880, delivered as a layered PSD and a PNG.", basis: "evidence" },
    { text: "Signatures are matched exactly to the player. There is no fuzzy substitution.", basis: "evidence" },
    { text: "The designer can lock a layout for a player, and the batch respects it.", basis: "evidence" },
    { text: "Face landmarks are used to place each portrait on the layout's eye line.", basis: "evidence", tier: "internal" },
    { text: "The current build is a reconstruction of the original project and has not been fully re-certified.", basis: "evidence", tier: "internal" },
  ],
  code: [
    {
      key: "batch",
      title: "RUN_HBD_PRODUCTION.jsx",
      language: "js",
      origin: "excerpt",
      code: `function buildFinalJobSpec(row, testMode) {
  return {
    masterPath: MASTER_PATH,
    layout: row.layout, // BOTTOM, TOP or SIDE
    displayName: row.player.displayName,
    position: row.player.position,
    number: row.player.number,
    mainImage: row.mainImage,
    signatureFile: row.player.signatureFullPath,
    export01: row.paths.export01,
    testMode: !!testMode
  };
}

// The exact gate for ADD TO BATCH.
function validateRow(row) {
  var reasons = [];
  if (row.player.identityStatus !== "IDENTITY_VERIFIED")
    reasons.push("Identity is not IDENTITY_VERIFIED.");
  if (!row.mainImage) reasons.push("Main 01 image not selected.");
  if (!row.layout) reasons.push("Layout (Bottom/Top/Side) not chosen.");
  return { ok: reasons.length === 0, reasons: reasons };
}`,
      note: "Excerpt from the working source. Shortened; paths and private values removed.",
      marks: {
        template: [[3, 4]],
        data: [[5, 7]],
        photo: [[8, 8]],
        signature: [[9, 9]],
        export: [[10, 10]],
        batch: [[15, 22]],
      },
    },
  ],
  mediaPrefix: "birthday/",
  demo: {
    layouts: [
      { key: "bottom", label: "Bottom", note: "Title band along the bottom, portrait above." },
      { key: "top", label: "Top", note: "Title band along the top, portrait below." },
      { key: "side", label: "Side", note: "Vertical title band at the left, portrait right." },
    ],
    players: [
      { key: "lawrence", name: "Trevor Lawrence", position: "QB", number: "16", layout: "side", graphic: "birthday/side-lawrence" },
      { key: "thomas", name: "Brian Thomas Jr.", position: "WR", number: "7", layout: "bottom", graphic: "birthday/bottom-thomas" },
      { key: "durfee", name: "Zach Durfee", position: "DE", number: "58", layout: "top", graphic: "birthday/top-durfee" },
      { key: "dickerson", name: "Matt Dickerson", position: "DT", number: "93", layout: "top", graphic: "birthday/top-dickerson" },
      { key: "meyers", name: "Jakobi Meyers", position: "WR", number: "3", layout: "side", graphic: "birthday/side-meyers" },
      { key: "braswell", name: "Christian Braswell", position: "CB", number: "21", layout: "side", graphic: "birthday/side-braswell" },
      { key: "rodriguez", name: "Chris Rodriguez Jr.", position: "RB", number: "24", layout: "bottom", graphic: "birthday/bottom-rodriguez" },
      { key: "matiscik", name: "Ross Matiscik", position: "LS", number: "46", layout: "top", graphic: "birthday/top-matiscik" },
      { key: "boerkircher", name: "Nate Boerkircher", position: "TE", number: "87", layout: "bottom", graphic: "birthday/bottom-boerkircher" },
      { key: "williams", name: "Wesley Williams", position: "DE", number: "90", layout: "top", graphic: "birthday/top-williams" },
    ],
    build: {
      player: "lawrence",
      layers: [
        { key: "background", asset: "birthday/build-lawrence-background" },
        { key: "signature", asset: "birthday/build-lawrence-signature" },
        { key: "photo", asset: "birthday/build-lawrence-photo-presentation" },
        { key: "title", asset: "birthday/build-lawrence-title" },
        { key: "nameplate", asset: "birthday/build-lawrence-nameplate" },
        { key: "marks", asset: "birthday/build-lawrence-marks" },
      ],
    },
  },
  publication: { copy: "approved", note: "Copy supplied by the owner; status set conservatively." },
};
