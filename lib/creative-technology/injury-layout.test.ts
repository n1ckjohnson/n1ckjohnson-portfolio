/**
 * Checks the illustrative layout model against the measurements documented
 * for the production system (Adaptive Layout V1.1):
 *
 *   9:16  N<=5 full 275 px rows · N=6 → 273 · N=8 → 204 · N=10 → 186 + scaling
 *         N=12 → scale 0.72 · N=13 → fails closed
 *   16:9  N<=6 single centred column (cap 1.9x) · N>=7 two columns, left = ceil(N/2)
 *         comfortable 12 (2 x 6) · max 18 · floor 0.72
 *
 * Run: npm run test:ct   (Node 22.18+ runs TypeScript directly)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { fitName, solveTall, solveWide, type TallRules, type WideRules } from "./injury-layout.ts";

const tall: TallRules = { canvas: [2160, 3840], rowMax: 275, rowMin: 186, gapRatio: 0.095, region: 1768, scaleFloor: 0.72, max: 12 };
const wide: WideRules = { canvas: [3840, 2160], splitAt: 7, rowsPerColumn: 6, regionRows: 6.5, growCap: 1.9, scaleFloor: 0.72, max: 18 };

test("9:16 keeps full 275 px rows up to five players", () => {
  for (const n of [1, 2, 3, 4, 5]) {
    const s = solveTall(n, tall);
    assert.equal(s.ok, true);
    assert.equal(s.rowHeight, 275);
    assert.equal(s.scale, 1);
    assert.equal(s.state, "full");
  }
});

test("9:16 compresses rows to the documented heights", () => {
  assert.equal(Math.round(solveTall(6, tall).rowHeight), 273);
  assert.equal(Math.round(solveTall(8, tall).rowHeight), 204);
  assert.equal(solveTall(8, tall).scale, 1);
});

test("9:16 holds the 186 px floor and scales the list from ten players", () => {
  const ten = solveTall(10, tall);
  assert.equal(ten.rowHeight, 186);
  assert.ok(ten.scale < 1 && ten.scale > 0.72);
  assert.equal(ten.state, "scaled");
});

test("9:16 reaches the 0.72 floor at twelve and stops at thirteen", () => {
  const twelve = solveTall(12, tall);
  assert.equal(twelve.ok, true);
  assert.ok(Math.abs(twelve.scale - 0.72) < 0.015, `scale was ${twelve.scale}`);
  assert.equal(solveTall(13, tall).ok, false);
  assert.equal(solveTall(13, tall).state, "stopped");
});

test("16:9 uses one enlarged column up to six players, capped at 1.9x", () => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const s = solveWide(n, wide);
    assert.deepEqual(s.columns, [n]);
    assert.ok(s.scale <= 1.9 && s.scale >= 1);
  }
  assert.equal(solveWide(1, wide).scale, 1.9);
});

test("16:9 switches to two columns at seven, left column filled first", () => {
  assert.deepEqual(solveWide(7, wide).columns, [4, 3]);
  assert.deepEqual(solveWide(11, wide).columns, [6, 5]);
  assert.deepEqual(solveWide(12, wide).columns, [6, 6]);
  assert.equal(solveWide(12, wide).scale, 1);
});

test("16:9 scales to the floor at eighteen and stops at nineteen", () => {
  const eighteen = solveWide(18, wide);
  assert.equal(eighteen.ok, true);
  assert.deepEqual(eighteen.columns, [9, 9]);
  assert.ok(Math.abs(eighteen.scale - 0.72) < 0.015, `scale was ${eighteen.scale}`);
  assert.equal(solveWide(19, wide).ok, false);
});

test("name fit follows the ladder: normal, narrow, bounded shrink, stop", () => {
  assert.deepEqual(fitName(400, 330, 500), { cut: "normal", scale: 1, ok: true });
  assert.deepEqual(fitName(600, 480, 500), { cut: "narrow", scale: 1, ok: true });
  const shrunk = fitName(700, 540, 500);
  assert.equal(shrunk.cut, "narrow");
  assert.equal(shrunk.ok, true);
  assert.ok(shrunk.scale >= 0.9 && shrunk.scale < 1);
  assert.equal(fitName(900, 700, 500).ok, false);
});
