/**
 * Checks the packing used by the ticketing suite: pieces keep their own
 * proportions, rows and columns come out flush, and nothing overlaps.
 *
 * Run: npm run test:ct
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { pack, type Pack } from "./pack.ts";

const aspects = { wide: 16 / 9, tall: 9 / 16, square: 1, strip: 320 / 50, banner: 970 / 250 };
const close = (a: number, b: number, tolerance = 1e-3) => Math.abs(a - b) <= tolerance;

test("a single piece fills the box at its own ratio", () => {
  const { ratio, slots } = pack("wide", aspects);
  assert.ok(close(ratio, 16 / 9));
  assert.deepEqual(slots, [{ key: "wide", x: 0, w: 1, y: 0, h: 1 }]);
});

test("every piece keeps its aspect ratio", () => {
  const tree: Pack = { col: [{ row: ["tall", { col: ["wide", "banner"] }, "square"] }, "strip"] };
  const { ratio, slots } = pack(tree, aspects, 0.02);
  for (const slot of slots) {
    // Slot width and height are fractions of different sides of the box.
    const drawn = (slot.w / slot.h) * ratio;
    assert.ok(close(drawn, aspects[slot.key as keyof typeof aspects], 5e-3), `${slot.key}: ${drawn}`);
  }
});

test("a row is flush with both edges and of one height", () => {
  const { slots } = pack({ row: ["tall", "square", "wide"] }, aspects, 0.02);
  assert.ok(close(slots[0].x, 0));
  const last = slots[slots.length - 1];
  assert.ok(close(last.x + last.w, 1));
  for (const slot of slots) assert.ok(close(slot.h, 1));
});

test("a column is flush with top and bottom and of one width", () => {
  const { slots } = pack({ col: ["wide", "strip", "banner"] }, aspects, 0.02);
  assert.ok(close(slots[0].y, 0));
  const last = slots[slots.length - 1];
  assert.ok(close(last.y + last.h, 1));
  for (const slot of slots) assert.ok(close(slot.w, 1));
});

test("pieces never overlap", () => {
  const tree: Pack = { col: [{ row: ["tall", { col: ["wide", "banner"] }, { col: ["square", "strip"] }] }, { row: ["banner", "strip"] }] };
  const { slots } = pack(tree, { ...aspects }, 0.016);
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      const apart = a.x + a.w <= b.x + 1e-6 || b.x + b.w <= a.x + 1e-6 || a.y + a.h <= b.y + 1e-6 || b.y + b.h <= a.y + 1e-6;
      assert.ok(apart, `${a.key} overlaps ${b.key}`);
    }
  }
});

test("an unknown piece is an error, not a silent gap", () => {
  assert.throws(() => pack({ row: ["wide", "missing"] }, aspects));
});
