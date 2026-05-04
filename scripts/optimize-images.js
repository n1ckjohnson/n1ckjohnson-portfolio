#!/usr/bin/env node
/**
 * Image optimization script for N1CKJOHNSON-PORTFOLIO
 *
 * - Backs up /public/work to /public/work-backup (full copy, skip if backup exists)
 * - Skips SVG, GIF, MP4, WebM
 * - Detects alpha channel in PNGs; keeps transparency PNGs as-is (only resize)
 * - Converts photographic PNGs → JPEG at quality 88
 * - JPEGs re-encoded at quality 88
 * - Resize targets:
 *     break*.png / break*.jpg  → 2400px wide max
 *     hero.*                   → 2400px wide max
 *     thumb.*                  → 1920px wide max
 *     support-*                → 1800px wide max
 *     everything else          → 1800px wide max
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const sharp = require(path.join(__dirname, "../node_modules/sharp"));

const WORK_DIR = path.join(__dirname, "../public/work");
const BACKUP_DIR = path.join(__dirname, "../public/work-backup");

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function fileSize(filePath) {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function collectImages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(full));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

function targetWidth(filename) {
  const base = path.basename(filename).toLowerCase();
  if (base.startsWith("break")) return 2400;
  if (base.startsWith("hero.")) return 2400;
  if (base.startsWith("thumb.")) return 1920;
  return 1800; // support-*, everything else
}

async function hasRealAlpha(filePath) {
  try {
    const meta = await sharp(filePath).metadata();
    // Only RGBA (4) or greyscale+alpha (2) can have transparency
    if (meta.channels !== 4 && meta.channels !== 2) return false;
    // Check if any pixel actually uses transparency (alpha min < 255)
    const stats = await sharp(filePath).stats();
    const alphaChannel = stats.channels[meta.channels - 1];
    return alphaChannel ? alphaChannel.min < 255 : false;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Backup
  if (fs.existsSync(BACKUP_DIR)) {
    console.log(`\nBackup already exists at ${BACKUP_DIR} — skipping copy.`);
  } else {
    console.log(`\nBacking up ${WORK_DIR} → ${BACKUP_DIR} ...`);
    copyDirSync(WORK_DIR, BACKUP_DIR);
    console.log("Backup complete.\n");
  }

  // 2. Collect all images
  const images = collectImages(WORK_DIR);
  console.log(`Found ${images.length} images to process.\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const filePath of images) {
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath);
    const dir = path.dirname(filePath);
    const before = fileSize(filePath);
    totalBefore += before;

    const maxW = targetWidth(base);

    let outPath = filePath;
    let didConvert = false;

    try {
      if (ext === ".png") {
        const alpha = await hasRealAlpha(filePath);
        if (alpha) {
          // Has genuine transparent pixels — keep as PNG, just resize if oversized
          const meta = await sharp(filePath).metadata();
          if ((meta.width ?? 0) > maxW) {
            const tmp = filePath + ".tmp.png";
            await sharp(filePath)
              .resize({ width: maxW, withoutEnlargement: true })
              .png({ compressionLevel: 9 })
              .toFile(tmp);
            fs.renameSync(tmp, filePath);
          }
          // else: already small enough, no rewrite needed
        } else {
          // Fully opaque (or no alpha at all) → flatten to white, convert to JPEG
          const jpegPath = path.join(dir, base.replace(/\.png$/i, ".jpg"));
          await sharp(filePath)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .resize({ width: maxW, withoutEnlargement: true })
            .jpeg({ quality: 88, mozjpeg: true })
            .toFile(jpegPath);
          fs.unlinkSync(filePath); // remove original PNG
          outPath = jpegPath;
          didConvert = true;
        }
      } else {
        // JPEG/JPG — re-encode
        const tmp = filePath + ".tmp.jpg";
        await sharp(filePath)
          .resize({ width: maxW, withoutEnlargement: true })
          .jpeg({ quality: 88, mozjpeg: true })
          .toFile(tmp);
        fs.renameSync(tmp, filePath);
      }

      const after = fileSize(outPath);
      totalAfter += after;
      processed++;

      const label = didConvert
        ? `PNG→JPG  ${base} → ${path.basename(outPath)}`
        : `        ${base}`;
      const saving = before > 0 ? `(${Math.round((1 - after / before) * 100)}% smaller)` : "";
      console.log(`✓ ${label}`);
      console.log(`  ${formatBytes(before)} → ${formatBytes(after)} ${saving}`);

    } catch (err) {
      console.error(`✗ FAILED: ${filePath}`);
      console.error(`  ${err.message}`);
      skipped++;
      totalAfter += before; // count original size for failed files
    }
  }

  console.log("\n────────────────────────────────────────────────────────────");
  console.log(`Processed : ${processed} files`);
  console.log(`Skipped   : ${skipped} files (errors)`);
  console.log(`Before    : ${formatBytes(totalBefore)}`);
  console.log(`After     : ${formatBytes(totalAfter)}`);
  console.log(`Saved     : ${formatBytes(totalBefore - totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
  console.log("────────────────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
