#!/usr/bin/env node
/**
 * Creative Technology — display media builder.
 *
 * Reads the tracked asset manifest (content/creative-technology/media.json)
 * and a PRIVATE, git-ignored source map (media-internal/sources.local.mjs)
 * that points at original production files on this machine. Writes optimised
 * display derivatives only:
 *
 *   approval "approved"  →  public/creative-technology/media/<file>
 *   approval "pending"   →  media-internal/creative-technology/<file>   (git-ignored)
 *
 * Originals are opened read-only and never copied whole, except Lottie/JSON
 * deliverables, which are the shipped artefact itself. PSDs are never copied
 * and never rendered. The single exception to "never read" is the Rivalries
 * color page: specs marked `derive: "psd-masks"` read the layer-mask channels
 * of named adjustment groups (see extract-color-masks.py).
 *
 * Usage:
 *   node scripts/creative-technology/build-media.mjs            build what is missing or stale
 *   node scripts/creative-technology/build-media.mjs --force    rebuild everything
 *   node scripts/creative-technology/build-media.mjs --only score
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const require = createRequire(import.meta.url);
const sharp = require(join(ROOT, "node_modules/sharp"));

const MANIFEST = join(ROOT, "content/creative-technology/media.json");
const SOURCES = join(ROOT, "media-internal/sources.local.mjs");
const OUT = {
  approved: join(ROOT, "public/creative-technology/media"),
  pending: join(ROOT, "media-internal/creative-technology"),
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

if (!existsSync(SOURCES)) {
  console.log(
    "No private source map found (media-internal/sources.local.mjs).\n" +
      "Nothing to build. Approved media already in public/ is used as-is.\n" +
      "See docs/creative-technology/README.md → Media."
  );
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const sources = (await import(pathToFileURL(SOURCES).href)).default;
const byId = new Map(manifest.map((entry) => [entry.id, entry]));

const outPath = (entry) => join(OUT[entry.approval === "approved" ? "approved" : "pending"], entry.file);
const isStale = (out, inputs) => {
  if (force || !existsSync(out)) return true;
  const built = statSync(out).mtimeMs;
  return inputs.some((input) => existsSync(input) && statSync(input).mtimeMs > built);
};

const stats = { built: 0, current: 0, skipped: 0, failed: 0, bytes: 0 };
const failures = [];

async function buildImage(entry, spec, out) {
  let input = sharp(spec.src, { limitInputPixels: false });
  if (spec.gifFrame !== undefined) {
    const meta = await sharp(spec.src, { limitInputPixels: false, pages: 1 }).metadata();
    const pages = meta.pages ?? 1;
    const page = spec.gifFrame < 0 ? Math.max(pages + spec.gifFrame, 0) : Math.min(spec.gifFrame, pages - 1);
    input = sharp(spec.src, { limitInputPixels: false, page, pages: 1 });
  }
  let pipeline = input.rotate();
  if (spec.flatten) pipeline = pipeline.flatten({ background: spec.flatten });
  if (spec.width || spec.height) {
    pipeline = pipeline.resize({ width: spec.width, height: spec.height, fit: "inside", withoutEnlargement: true });
  }
  const format = extname(entry.file).slice(1);
  if (format === "jpg") pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  else if (format === "png") pipeline = pipeline.png({ compressionLevel: 9 });
  else pipeline = pipeline.webp({ quality: spec.quality ?? 84, effort: 5, smartSubsample: true });
  await pipeline.toFile(out);
}

/**
 * Derives a "what changes" mask from a set of same-size exports: wherever
 * any export differs from the others the pixel is marked variable. Writes
 * the mask (alpha = variable) plus the bounding boxes of the variable regions.
 */
async function buildDiffMask(entry, spec, out) {
  const width = spec.width ?? 900;
  const frames = [];
  let height = 0;
  for (const id of spec.inputs) {
    const source = sources[id]?.src;
    if (!source || !existsSync(source)) throw new Error(`diff-mask input missing: ${id}`);
    const { data, info } = await sharp(source).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    height = info.height;
    frames.push(data);
  }
  const pixels = width * height;
  const range = Buffer.alloc(pixels);
  for (let p = 0; p < pixels; p++) {
    let spread = 0;
    for (let c = 0; c < 3; c++) {
      let lo = 255;
      let hi = 0;
      for (const frame of frames) {
        const v = frame[p * 3 + c];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      if (hi - lo > spread) spread = hi - lo;
    }
    range[p] = spread > 40 ? 255 : 0;
  }
  // Close small gaps so text and logo areas read as solid regions.
  const closed = await sharp(range, { raw: { width, height, channels: 1 } })
    .blur(4)
    .threshold(26)
    .blur(1.4)
    .extractChannel(0) // sharp promotes to three channels after blur/threshold
    .raw()
    .toBuffer();

  // Bounding boxes via flood fill on a coarse grid.
  const cell = 6;
  const gw = Math.ceil(width / cell);
  const gh = Math.ceil(height / cell);
  const grid = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const x = Math.min(gx * cell + (cell >> 1), width - 1);
      const y = Math.min(gy * cell + (cell >> 1), height - 1);
      grid[gy * gw + gx] = closed[y * width + x] > 110 ? 1 : 0;
    }
  }
  const regions = [];
  for (let start = 0; start < grid.length; start++) {
    if (grid[start] !== 1) continue;
    let x0 = gw, y0 = gh, x1 = 0, y1 = 0, count = 0;
    const stack = [start];
    grid[start] = 2;
    while (stack.length) {
      const i = stack.pop();
      const x = i % gw;
      const y = (i - x) / gw;
      count++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const n = ny * gw + nx;
        if (grid[n] === 1) {
          grid[n] = 2;
          stack.push(n);
        }
      }
    }
    if (count >= 10) {
      regions.push({
        x: +((x0 * cell) / width).toFixed(4),
        y: +((y0 * cell) / height).toFixed(4),
        w: +((((x1 - x0 + 1) * cell)) / width).toFixed(4),
        h: +((((y1 - y0 + 1) * cell)) / height).toFixed(4),
      });
    }
  }
  regions.sort((a, b) => a.x - b.x || a.y - b.y);

  const rgba = Buffer.alloc(pixels * 4, 255);
  for (let p = 0; p < pixels; p++) rgba[p * 4 + 3] = closed[p];
  await sharp(rgba, { raw: { width, height, channels: 4 } }).webp({ lossless: true }).toFile(out);
  writeFileSync(out.replace(/\.[a-z0-9]+$/i, ".json"), JSON.stringify({ width, height, inputs: spec.inputs.length, regions }, null, 2) + "\n");
}

/**
 * Region masks for the Rivalries color page. The one place a PSD is opened:
 * extract-color-masks.py reads the layer-mask channels of the named
 * adjustment groups (never pixel layers, never the file as a whole) and
 * writes one small alpha mask per region. Each mask has its own manifest
 * entry and follows that entry's approval like any other asset.
 */
function buildPsdMasks(id, spec) {
  const regions = Object.keys(spec.regions);
  const targets = regions.map((region) => ({ region, entry: byId.get(`${spec.dir}/${spec.stem}-mask-${region}`) }));
  const missing = targets.filter((target) => !target.entry);
  if (missing.length) {
    stats.skipped++;
    console.warn(`  skip   ${id}  (no manifest entry for: ${missing.map((target) => target.region).join(", ")})`);
    return;
  }
  if (!existsSync(spec.psd)) {
    stats.failed++;
    failures.push(`${id}: source file not found`);
    return;
  }
  if (!targets.some((target) => isStale(outPath(target.entry), [spec.psd]))) {
    stats.current += targets.length;
    return;
  }
  const scratch = join(OUT.pending, ".masks", spec.stem);
  mkdirSync(scratch, { recursive: true });
  try {
    execFileSync(
      "python3",
      [
        join(ROOT, "scripts/creative-technology/extract-color-masks.py"),
        spec.psd,
        scratch,
        spec.stem,
        String(spec.width),
        ...regions.map((region) => `${region}=${spec.regions[region].join(",")}`),
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    for (const { region, entry } of targets) {
      const built = join(scratch, `${spec.stem}-mask-${region}.png`);
      if (!existsSync(built)) {
        stats.failed++;
        failures.push(`${entry.id}: the working file has no mask for this region`);
        continue;
      }
      const out = outPath(entry);
      mkdirSync(dirname(out), { recursive: true });
      copyFileSync(built, out);
      stats.built++;
      stats.bytes += statSync(out).size;
      console.log(`  built  ${entry.approval === "approved" ? "public  " : "internal"}  ${entry.file}  ${(statSync(out).size / 1024).toFixed(0)} KB`);
    }
  } catch (error) {
    stats.failed++;
    failures.push(`${id}: ${String(error.stderr ?? error.message).trim().split("\n").pop()}`);
  } finally {
    rmSync(join(OUT.pending, ".masks"), { recursive: true, force: true });
  }
}

for (const [id, spec] of Object.entries(sources)) {
  if (only && !id.startsWith(only)) continue;
  if (spec.derive === "psd-masks") {
    buildPsdMasks(id, spec);
    continue;
  }
  const entry = byId.get(id);
  if (!entry) {
    stats.skipped++;
    console.warn(`  skip   ${id}  (in the source map but not in the manifest)`);
    continue;
  }
  const out = outPath(entry);
  const inputs = spec.derive ? spec.inputs.map((input) => sources[input]?.src).filter(Boolean) : [spec.src];
  if (!spec.derive && !existsSync(spec.src)) {
    stats.failed++;
    failures.push(`${id}: source file not found`);
    continue;
  }
  if (!isStale(out, inputs)) {
    stats.current++;
    continue;
  }
  mkdirSync(dirname(out), { recursive: true });
  try {
    if (spec.derive === "diff-mask") await buildDiffMask(entry, spec, out);
    else if (spec.copy) copyFileSync(spec.src, out);
    else await buildImage(entry, spec, out);
    stats.built++;
    stats.bytes += statSync(out).size;
    console.log(`  built  ${entry.approval === "approved" ? "public  " : "internal"}  ${entry.file}  ${(statSync(out).size / 1024).toFixed(0)} KB`);
  } catch (error) {
    stats.failed++;
    failures.push(`${id}: ${error.message}`);
  }
}

console.log(
  `\nMedia: ${stats.built} built (${(stats.bytes / 1048576).toFixed(1)} MB), ${stats.current} up to date, ${stats.skipped} skipped, ${stats.failed} failed.`
);
if (failures.length) {
  console.log("Failures:");
  for (const failure of failures) console.log(`  ${failure}`);
  process.exitCode = 1;
}
