#!/usr/bin/env node
/**
 * The standing visual check. Needs the dev server on port 3000.
 *
 *   node scripts/qa/sweep.mjs [run-name] [--only pages|states]
 *
 * 1. Every page at desktop, tablet and phone width: a full-page capture,
 *    plus a check for sideways overflow, console errors and failed requests.
 * 2. The demonstrations, state by state. Nothing on the page pins, so each
 *    figure is brought to the middle of the window and driven through its
 *    own controls: the splash fan with a screen chosen; the ticketing suite
 *    closed, open, in each campaign look and with a placement in focus; the
 *    color comparison in each framing and moved from the keyboard; then
 *    every step figure, once played by itself and then step by step. Then
 *    the same with reduced motion.
 *
 * Captures land in .qa/<run-name>/.
 */
import { join } from "node:path";
import { launch } from "./browser.mjs";

const BASE = process.env.QA_BASE ?? "http://localhost:3000";
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const run = args.find((arg) => !arg.startsWith("--") && arg !== only) ?? "latest";
const OUT = join(process.cwd(), ".qa", run);

const PAGES = [
  ["home", "/"],
  ["index", "/creative-technology"],
  ["work-london", "/work/london-series-2026"],
  ["work-social", "/work/social-content-systems"],
  ["missing", "/this-page-does-not-exist"],
];

const VIEWPORTS = [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["phone", 390, 844],
];

const findings = [];
const note = (where, what) => {
  findings.push(`${where}: ${what}`);
  console.log(`  ! ${where}: ${what}`);
};

const browser = await launch();
try {
  /* ── 1. Every page, three widths ─────────────────────────────────── */
  if (only !== "states") {
    for (const [device, width, height] of VIEWPORTS) {
      const page = await browser.newPage();
      await page.viewport(width, height, { scale: 1 });
      for (const [name, path] of PAGES) {
        const before = page.problems.length;
        await page.goto(BASE + path, { settle: 2500 });
        // Let lazy images below the fold load before the long capture.
        await page.eval(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); })()`);
        const overflow = await page.eval(`document.documentElement.scrollWidth - innerWidth`);
        if (overflow > 0) note(`${name} @ ${device}`, `page is ${overflow}px wider than the viewport`);
        const broken = await page.eval(`[...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src).join(", ")`);
        if (broken) note(`${name} @ ${device}`, `images failed to load: ${broken}`);
        for (const problem of page.problems.slice(before)) {
          if (name === "missing" && /http 404/.test(problem)) continue;
          note(`${name} @ ${device}`, problem);
        }
        await page.shot(join(OUT, "pages", `${name}-${device}.png`), { full: true });
        console.log(`  ok ${name} @ ${device}`);
      }
      await page.close();
    }
  }

  /* ── 2. Every demonstration, state by state, on the continuous page ─ */
  if (only !== "pages") {
    const PAGE = `${BASE}/creative-technology`;
    // Brings an element to the middle of the window.
    const centre = (selector) => `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: "center" })`;
    const FIGURES = [
      ["game-week", "game-week"],
      ["creative-suites", "suite-spanish"],
      ["injury-report", "injury-report"],
      ["score-graphics", "score-states"],
      ["player-birthdays", "player-birthdays"],
      ["jags-win-email", "jags-win-email"],
    ];

    for (const [device, width, height] of [VIEWPORTS[0], VIEWPORTS[2]]) {
      for (const reduced of [false, true]) {
        const tag = `${device}${reduced ? "-reduced" : ""}`;
        const page = await browser.newPage();
        await page.viewport(width, height, { scale: 1 });
        await page.reducedMotion(reduced);
        const shot = (name) => page.shot(join(OUT, "states", `${name}-${tag}.png`));
        await page.goto(PAGE, { settle: 3000 });
        await page.eval(`document.documentElement.style.scrollBehavior = "auto"`);

        // Splash: the open fan, a screen at the end chosen (it moves to the centre), then the keyboard.
        await page.eval(centre("#splash-screens [role=radiogroup]"));
        await page.wait(1200);
        await shot("splash-1-open");
        await page.click('#splash-screens [role="radio"][data-key="w08-ind"]', { settle: 1600 });
        await shot("splash-2-chosen-centred");
        await page.key("ArrowLeft", { settle: 1400 });
        await shot("splash-3-keyboard-previous");

        // Ticketing: opens once in view; each campaign look; a placement in focus.
        await page.eval(centre('#creative-suites [style*="--w-ratio"]'));
        await page.wait(1600);
        await shot("ticketing-open");
        const looks = await page.eval(`[...document.querySelectorAll('#creative-suites [aria-label="Campaign look"] button')].map(b => b.textContent)`);
        for (const [i, look] of looks.entries()) {
          await page.eval(`document.querySelectorAll('#creative-suites [aria-label="Campaign look"] button')[${i}].click()`);
          await page.wait(1000);
          await shot(`ticketing-look-${look.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
        }
        await page.click('#creative-suites [data-key]:not([data-source])', { settle: 900 });
        await shot("ticketing-focus");
        await page.key("Escape", { settle: 800 });

        // The Week 1 package opens the same way.
        await page.eval(centre('#game-week [style*="--w-ratio"]'));
        await page.wait(1600);
        await shot("game-week-package");

        // Rivalries: each camera framing, then the divider moved from the keyboard.
        await page.eval(centre("#rivalries-color [role=slider]"));
        await page.wait(1400);
        await shot("rivalries-at-rest");
        for (const label of ["Jersey", "Pants", "Helmet", "Full image"]) {
          await page.eval(`[...document.querySelectorAll('#rivalries-color button')].find((b) => b.textContent.trim() === ${JSON.stringify(label)}).click()`);
          await page.wait(1400);
          await shot(`rivalries-${label.toLowerCase().replace(" ", "-")}`);
        }
        await page.click("#rivalries-color [role=slider]", { settle: 200 });
        await page.key("ArrowLeft", { settle: 200, shift: true });
        await page.key("ArrowLeft", { settle: 400, shift: true });
        await shot("rivalries-divider-keyboard");

        // Every step figure: as it plays by itself, then each step chosen.
        for (const [id, name] of FIGURES) {
          const figure = `#${id} .scene--figure`;
          await page.eval(centre(figure));
          const count = await page.eval(`document.querySelectorAll('${figure} .scene__chip:not(.scene__chip--replay)').length`);
          // Long enough for the figure to have played to its last step.
          await page.wait(reduced ? 600 : 1000 + count * 2300);
          await shot(`${name}-played`);
          for (let i = 0; i < count; i++) {
            await page.eval(`document.querySelectorAll('${figure} .scene__chip:not(.scene__chip--replay)')[${i}].click()`);
            await page.wait(1100);
            await shot(`${name}-step-${i + 1}`);
          }
        }

        // Birthdays: any graphic in the batch opens large.
        await page.eval(centre("#player-birthdays .scene--figure"));
        await page.eval(`[...document.querySelectorAll('#player-birthdays .scene__chip')].find(b => b.textContent === "Batch").click()`);
        await page.wait(1400);
        await page.click('#player-birthdays [aria-label^="Enlarge"]:not([aria-hidden])', { settle: 900 });
        await shot("player-birthdays-enlarged");
        await page.key("Escape", { settle: 600 });

        const overflow = await page.eval(`document.documentElement.scrollWidth - innerWidth`);
        if (overflow > 0) note(`states @ ${tag}`, `page is ${overflow}px wider than the viewport`);
        for (const problem of page.problems) note(`states @ ${tag}`, problem);
        await page.close();
        console.log(`  ok states @ ${tag}`);
      }
    }
  }
} finally {
  await browser.close();
}

console.log(findings.length ? `\n${findings.length} finding(s).` : "\nNo findings.");
console.log(`Captures: ${OUT}`);
process.exitCode = findings.length ? 1 : 0;
