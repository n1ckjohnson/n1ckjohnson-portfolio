import type { Project } from "@/content/creative-technology/types";

export type ColorRegion = {
  key: string;
  label: string;
  /** What the adjustment group contains, read from the working file. */
  layers: string;
};

export type ColorPhoto = {
  key: string;
  label: string;
  before: string;
  after: string;
  /** Regions this photograph has a mask for. A crop without pants has no pants stripe. */
  regions: string[];
};

export type RivalriesDemo = {
  photos: ColorPhoto[];
  regions: ColorRegion[];
  /**
   * Camera framings for the lead photograph, as fractions of the image:
   * x, y, width, height. Set from the working file's layer masks.
   */
  views: { key: string; label: string; box: [number, number, number, number]; note: string }[];
  /**
   * The part of the photograph the camera may show, as x0, y0, x1, y1.
   * Keeps the backdrop roll and the light stand out of every framing.
   */
  safe: [number, number, number, number];
};

export const rivalriesColor: Project<RivalriesDemo> = {
  id: "rivalries-color",
  slug: "rivalries-color",
  order: 3,
  title: "Rivalries color",
  year: "2026",
  summary:
    "A Photoshop color workflow for photography of the 2026 Rivalries uniform. The reference look is rebuilt as masked, editable adjustment layers, one group for each material, with a small tuning layer for each photograph.",
  line: "The Photoshop color workflow that matches Rivalries uniform photography to one reference look, material by material, with every correction kept editable.",
  status: "built",
  statusNote: {
    text: "Applied to seven photographs between 19 October and 2 November 2026: five from the studio and two from a game.",
    basis: "evidence",
    tier: "internal",
  },
  stack: ["Photoshop", "Scripted Photoshop automation", "Region masks", "Editable adjustment layers", "Lab color measurement"],
  automated: [
    "Rebuilding the reference adjustment values as layers over the photograph",
    "A mask for each material, from subject selection and color keys",
    "Measuring the result against the reference",
    "A QA sheet with full-size detail crops",
  ],
  designerControlled: [
    "The reference look",
    "The tuning layers for each photograph",
    "Every correction, which stays an adjustment layer",
    "Approval of each image",
  ],
  detail: [
    "Photography of the Rivalries uniform has to match one look. That look was set on a reference photograph, with a swatch for each material: bone for the jersey, two teals and gold.",
    "Each correction is its own masked group of adjustment layers: jersey, pants, teal, gold stripe, facemask, chest script and shoulder patch. The mask keeps a change inside its material. In the detail crops the jersey turns bone while the white undershirt and the towel beside it stay white.",
    "The reference values are the same for every photograph. What changes is a small tuning layer for each image, because studio light and stadium light are not the same. Nothing is flattened: the original stays locked underneath and every correction stays editable above it.",
  ],
  pipeline: [
    { label: "Reference", detail: "A reference photograph with a swatch for each material." },
    { label: "Masks", detail: "One mask per material, from subject selection, color keys and per-image regions." },
    { label: "Build", detail: "The reference values are rebuilt as adjustment layers over the locked original." },
    { label: "Tune", detail: "A small tuning layer brings this photograph's jersey and teal to the reference." },
    { label: "Check", detail: "Original, corrected and reference side by side, with full-size detail crops." },
    { label: "Approve", detail: "The designer signs off each image." },
  ],
  facts: [
    { text: "Every correction is a masked adjustment layer. The original photograph stays locked underneath.", basis: "evidence" },
    { text: "A helmeted photograph carries eight adjustment groups: overall tone, pants, jersey and socks, teal, facemask, gold stripe, chest script and shoulder patch.", basis: "evidence" },
    { text: "The reference values are shared. Each photograph adds its own tuning layers for the jersey and the teal.", basis: "evidence" },
    { text: "The region outlines on this page are the working file's own layer masks, exported small. They were not drawn for the page.", basis: "evidence" },
    { text: "The comparison shows each photograph as shot and as exported. The page does not run the correction.", basis: "evidence" },
    { text: "Each image is calibrated and checked by a designer. The workflow does not run unattended.", basis: "brief" },
  ],
  code: [
    {
      key: "build",
      title: "build-corrections.jsx",
      language: "js",
      origin: "illustrative",
      code: `// The reference values, rebuilt over a locked original
const MATERIALS = ["jersey", "pants", "teal", "gold",
  "facemask", "script", "patch"];

function correct(doc, reference) {
  lockLayer(doc, "ORIGINAL");
  for (const name of MATERIALS) {
    const group = addGroup(doc, name.toUpperCase());
    group.mask = maskFor(doc, name); // selection + color keys
    for (const step of reference[name]) {
      addAdjustment(group, step.type, step.values);
    }
  }
  addGroup(doc, "TUNING"); // per photograph, by the designer
  return measure(doc, reference.swatches);
}`,
      note: "Written for this page. The order of operations follows the working file.",
    },
  ],
  mediaPrefix: "rivalries/",
  demo: {
    photos: [
      {
        key: "tuten-134",
        label: "Studio",
        before: "rivalries/tuten-134-before",
        after: "rivalries/tuten-134-after",
        regions: ["jersey", "pants", "teal", "gold", "facemask", "patch"],
      },
      {
        key: "hines-allen-120",
        label: "Studio, wide",
        before: "rivalries/hines-allen-120-before",
        after: "rivalries/hines-allen-120-after",
        regions: ["jersey", "pants", "teal", "facemask", "patch"],
      },
      {
        key: "game-4780",
        label: "Game day",
        before: "rivalries/game-4780-before",
        after: "rivalries/game-4780-after",
        regions: ["jersey", "pants", "teal", "gold", "facemask", "patch"],
      },
    ],
    regions: [
      { key: "jersey", label: "Jersey", layers: "A color fill sets the bone. Exposure and levels set how bright it sits." },
      { key: "pants", label: "Pants", layers: "Hue, saturation and exposure, on the pants only." },
      { key: "teal", label: "Teal", layers: "One hue and saturation move for every teal surface: helmet, trim and stripes." },
      { key: "gold", label: "Gold stripe", layers: "A soft-light color fill on the pants stripe." },
      { key: "facemask", label: "Facemask", layers: "Clarity and a soft-light color fill, on the facemask bars." },
      { key: "patch", label: "Patch", layers: "Exposure and clarity, on the shoulder patch." },
    ],
    safe: [0.02, 0.045, 0.93, 1],
    views: [
      { key: "full", label: "Full image", box: [0.06, 0.12, 0.86, 0.86], note: "As shot, and corrected. Drag to compare." },
      { key: "jersey", label: "Jersey", box: [0.17, 0.36, 0.58, 0.46], note: "The jersey moves to the uniform's bone. The undershirt and the ball stay as they were." },
      { key: "pants", label: "Pants", box: [0.2, 0.72, 0.5, 0.28], note: "Hue, saturation and exposure on the pants only, inside their own mask." },
      { key: "helmet", label: "Helmet", box: [0.38, 0.14, 0.46, 0.38], note: "One teal move for helmet and trim; clarity and a soft-light fill on the facemask bars." },
    ],
  },
  publication: {
    copy: "approved",
    note: "Page requested by the owner on 2026-11-14. Wording drafted from the working files; every image stays pending.",
  },
};
