#!/usr/bin/env node
/**
 * Confirms the two audiences behave as documented, against running servers.
 *
 *   node scripts/qa/check-audiences.mjs [public-origin] [internal-origin]
 *
 * Defaults: a public build on :3001 (`npm run build && npm start -- -p 3001`)
 * and the dev server on :3000. Either can be skipped by passing "-".
 *
 * Public: the internal media route answers 404 for every asset, pending
 * files are not reachable anywhere, approved files are, and no page
 * mentions the internal route. Internal: the route serves, and tells
 * crawlers not to index.
 */
import { readFileSync } from "node:fs";

const PUBLIC = process.argv[2] ?? "http://localhost:3001";
const INTERNAL = process.argv[3] ?? "http://localhost:3000";
const manifest = JSON.parse(readFileSync(new URL("../../content/creative-technology/media.json", import.meta.url), "utf8"));
const projects = ["splash-screens", "ticketing-suites", "rivalries-color", "injury-report", "score-graphics", "game-week", "player-birthday", "postgame-email", "new-hire", "entertainment-carousel", "targeted-automation"];

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "pass" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
};
const status = async (url) => (await fetch(url, { redirect: "manual" })).status;

if (PUBLIC !== "-") {
  console.log(`Public build at ${PUBLIC}`);
  const pending = manifest.filter((entry) => entry.approval !== "approved");
  const approved = manifest.filter((entry) => entry.approval === "approved");

  let served = [];
  for (const entry of pending) {
    for (const path of [`/internal-media/${entry.file}`, `/creative-technology/media/${entry.file}`, `/creative-technology/internal-media/${entry.file}`]) {
      if ((await status(PUBLIC + path)) === 200) served.push(path);
    }
  }
  check(served.length === 0, `none of the ${pending.length} pending assets can be fetched`, served.slice(0, 3).join(", "));

  let missing = [];
  for (const entry of approved) {
    const path = entry.publicPath ?? `/creative-technology/media/${entry.file}`;
    if ((await status(PUBLIC + path)) !== 200) missing.push(path);
  }
  check(missing.length === 0, `all ${approved.length} approved assets are served`, missing.join(", "));

  check((await status(`${PUBLIC}/internal-media/%2e%2e/sources.local.mjs`)) === 404, "the private source map cannot be reached through the media route");
  check((await status(`${PUBLIC}/systems/game-week-splash-screens/w12-ten.json`)) === 404, "the Week 12 splash file is no longer public");

  let mentions = [];
  let noindex = [];
  for (const slug of ["", ...projects.map((project) => `/${project}`)]) {
    const response = await fetch(`${PUBLIC}/creative-technology${slug}`);
    const html = await response.text();
    if (response.status !== 200) mentions.push(`${slug || "/"} -> ${response.status}`);
    if (/internal-media|media-internal/.test(html)) mentions.push(slug || "/");
    if (/name="robots" content="noindex/.test(html)) noindex.push(slug || "/");
  }
  check(mentions.length === 0, "every Creative Technology page loads and none mentions internal media", mentions.join(", "));
  check(noindex.length === 0, "public pages are indexable", noindex.join(", "));

  // Every project is a section of one page, so the old address leads to its anchor. The redirect is
  // temporary (307) while the site is under review and permanent (308) from publication; see next.config.ts.
  const moved = await fetch(`${PUBLIC}/work/game-week-splash-screens`, { redirect: "manual" });
  check(
    [307, 308].includes(moved.status) && /\/creative-technology#splash-screens$/.test(moved.headers.get("location") ?? ""),
    "an old /work system address redirects to its new section",
    `${moved.status} → ${moved.headers.get("location") ?? "no location"}`
  );
}

if (INTERNAL !== "-") {
  console.log(`Internal preview at ${INTERNAL}`);
  const sample = manifest.find((entry) => entry.approval !== "approved" && entry.kind === "image" && !/^Held back/.test(entry.note ?? ""));
  const response = await fetch(`${INTERNAL}/internal-media/${sample.file}`);
  check(response.status === 200, "a pending asset is served to the internal preview", sample.file);
  check(/noindex/.test(response.headers.get("x-robots-tag") ?? ""), "internal media is marked noindex");
  check((await status(`${INTERNAL}/internal-media/%2e%2e/sources.local.mjs`)) === 404, "the private source map cannot be reached through the media route");
  const page = await (await fetch(`${INTERNAL}/creative-technology/splash-screens`)).text();
  check(/name="robots" content="noindex/.test(page), "internal pages tell crawlers not to index");
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
process.exitCode = failures ? 1 : 0;
