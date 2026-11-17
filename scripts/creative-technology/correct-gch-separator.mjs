#!/usr/bin/env node
/**
 * Game Center header: the date | kickoff separator.
 *
 * The Week 1 and Week 2 exports carry that separator at twice the template's
 * weight (about 37.5px wide at 3000×1000, where the standard Week 5 header
 * has about 19px). This writes corrected copies of those two exports and
 * never touches the delivered files.
 *
 * The correction is measured, not drawn: every header shares the same
 * template background, so the heavy bar is replaced by the reference
 * header's own background pixels, and the reference header's bar (its solid
 * columns and its antialiased edge columns, same rows) is laid back in,
 * centred where the heavy bar was centred. Nothing outside the bar's box
 * changes; the script checks that and refuses to write otherwise.
 *
 * Paths come from the private source map: an entry with `separatorFrom`
 * names the delivered export (`original`), the reference header
 * (`separatorFrom`) and where the corrected copy goes (`src`, which the
 * media builder then reads like any other source).
 *
 *   node scripts/creative-technology/correct-gch-separator.mjs
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const require = createRequire(import.meta.url);
const sharp = require(join(ROOT, "node_modules/sharp"));
const SOURCES = join(ROOT, "media-internal/sources.local.mjs");

if (!existsSync(SOURCES)) {
  console.log("No private source map found (media-internal/sources.local.mjs). Nothing to correct.");
  process.exit(0);
}
const sources = (await import(pathToFileURL(SOURCES).href)).default;

/** The date box rows the separator spans, and the stretch of the box it can sit in. */
const BOX = { y0: 600, y1: 920, x0: 1150, x1: 2200 };

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** The separator: the columns whose white vertical run is the tallest in the box, and that run's rows. */
function findBar(img) {
  const at = (x, y) => (y * img.width + x) * 4;
  const runs = [];
  for (let x = BOX.x0; x < BOX.x1; x++) {
    let best = 0, cur = 0, top = 0, bestTop = 0;
    for (let y = BOX.y0; y < BOX.y1; y++) {
      const i = at(x, y);
      if (img.data[i] > 200 && img.data[i + 1] > 200 && img.data[i + 2] > 200) {
        if (!cur) top = y;
        cur++;
        if (cur > best) { best = cur; bestTop = top; }
      } else cur = 0;
    }
    runs.push({ x, best, top: bestTop });
  }
  const tallest = Math.max(...runs.map((r) => r.best));
  const solid = runs.filter((r) => r.best === tallest);
  const x0 = solid[0].x, x1 = solid[solid.length - 1].x;
  if (solid.length !== x1 - x0 + 1) throw new Error("separator columns are not contiguous");
  const y0 = solid[0].top, y1 = solid[0].top + tallest - 1;
  return { x0, x1, y0, y1 };
}

/**
 * Coverage of a partly covered edge column: its red channel against the plain template background
 * (near-zero red) three columns further out on the same row of the same image.
 */
const coverage = (img, x, y, outward) => {
  const red = (px) => img.data[(y * img.width + px) * 4];
  const bg = red(x + 3 * outward);
  return Math.min(1, Math.max(0, (red(x) - bg) / (255 - bg)));
};

let written = 0;
for (const [id, spec] of Object.entries(sources)) {
  if (!spec.separatorFrom) continue;
  const target = await load(spec.original);
  const reference = await load(spec.separatorFrom);
  if (target.width !== reference.width || target.height !== reference.height) throw new Error(`${id}: size differs from the reference`);

  const bad = findBar(target);
  const good = findBar(reference);
  if (bad.y0 !== good.y0 || bad.y1 !== good.y1) throw new Error(`${id}: separator rows ${bad.y0}–${bad.y1} differ from the reference's ${good.y0}–${good.y1}`);

  // The box the heavy bar occupies, with its antialiased edge columns and one clear column either side.
  const clear = { x0: bad.x0 - 2, x1: bad.x1 + 2, y0: bad.y0 - 1, y1: bad.y1 + 1 };
  const out = Buffer.from(target.data);
  const idx = (x, y) => (y * target.width + x) * 4;

  // 1. The template background, from the reference header, where the heavy bar was. The reference must be
  //    plain background there, and identical to the target just outside the box, or the patch would show.
  for (let y = clear.y0; y <= clear.y1; y++) {
    for (let x = clear.x0; x <= clear.x1; x++) {
      const i = idx(x, y);
      if (reference.data[i] > 40) throw new Error(`${id}: the reference is not plain background at ${x},${y}`);
      for (let k = 0; k < 4; k++) out[i + k] = reference.data[i + k];
    }
  }
  for (let y = clear.y0 - 2; y <= clear.y1 + 2; y++) {
    for (const x of [clear.x0 - 2, clear.x0 - 1, clear.x1 + 1, clear.x1 + 2]) {
      const i = idx(x, y);
      for (let k = 0; k < 4; k++) if (target.data[i + k] !== reference.data[i + k]) throw new Error(`${id}: the background differs from the reference beside the separator (${x},${y})`);
    }
  }

  // 2. The reference bar, column by column: the solid columns and one antialiased column either side,
  //    moved by a whole number of pixels so its centre lands on the heavy bar's centre.
  const mid = Math.round((good.y0 + good.y1) / 2);
  const centre = (bar, img) => {
    const left = coverage(img, bar.x0 - 1, mid, -1), right = coverage(img, bar.x1 + 1, mid, 1);
    return (bar.x0 - left + bar.x1 + 1 + right) / 2;
  };
  const shift = Math.round(centre(bad, target) - centre(good, reference));
  for (let y = good.y0; y <= good.y1; y++) {
    for (let x = good.x0 - 1; x <= good.x1 + 1; x++) {
      const a = x < good.x0 ? coverage(reference, x, y, -1) : x > good.x1 ? coverage(reference, x, y, 1) : 1;
      if (a <= 0) continue;
      const d = idx(x + shift, y);
      for (let k = 0; k < 3; k++) out[d + k] = Math.round(out[d + k] * (1 - a) + 255 * a);
    }
  }

  // 3. Nothing outside the bar's box changed.
  for (let y = 0; y < target.height; y++) {
    for (let x = 0; x < target.width; x++) {
      if (x >= clear.x0 && x <= clear.x1 && y >= clear.y0 && y <= clear.y1) continue;
      const i = idx(x, y);
      for (let k = 0; k < 4; k++) if (out[i + k] !== target.data[i + k]) throw new Error(`${id}: pixel ${x},${y} changed outside the separator`);
    }
  }

  mkdirSync(dirname(spec.src), { recursive: true });
  await sharp(out, { raw: { width: target.width, height: target.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(spec.src);
  const fixed = findBar(await load(spec.src));
  console.log(`  corrected  ${id}: separator x ${bad.x0}–${bad.x1} (${bad.x1 - bad.x0 + 1} solid columns) → x ${fixed.x0}–${fixed.x1} (${fixed.x1 - fixed.x0 + 1}, as the reference's ${good.x1 - good.x0 + 1}), rows ${fixed.y0}–${fixed.y1}`);
  written++;
}
console.log(`\nSeparator: ${written} header${written === 1 ? "" : "s"} corrected.`);
