/**
 * Checks the Jags Win email geometry: every edition's genuine slices tile the
 * 2400 × 4983 email exactly, every module boundary falls between slice rows,
 * and on-screen snapping keeps shared edges shared. Where the display
 * derivatives have been built on this machine, each one is checked against
 * the native slice it stands for.
 *
 * Run: npm run test:ct
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { assemble, snap, type EmailSlice } from "./email-slices.ts";
import { postgameEmail } from "../../content/creative-technology/projects/postgame-email.ts";

const { width, height, modules, editions } = postgameEmail.demo;

test("the email is 2400 × 4983 and its modules add up to it", () => {
  assert.equal(width, 2400);
  assert.equal(height, 4983);
  assert.equal(modules.reduce((sum, module) => sum + module.height, 0), height);
});

for (const edition of editions) {
  test(`${edition.label}: the slices tile the email exactly and the modules fall on slice rows`, () => {
    const spans = assemble(edition.slices, { width, height }, modules);
    assert.deepEqual(
      spans.map((span) => [span.key, span.y, span.h]),
      [
        ["header", 0, 1335],
        ["hero", 1335, 839],
        ["moments", 2174, 780],
        ["links", 2954, 923],
        ["next", 3877, 556],
        ["tickets", 4433, 550],
      ]
    );
    // Each module is exactly covered by its own slices.
    for (const span of spans) assert.equal(span.slices.reduce((sum, slice) => sum + slice.w * slice.h, 0), width * span.h, span.key);
    // Slices are numbered in reading order, as Photoshop exported them.
    assert.deepEqual(
      edition.slices.map((slice) => slice.asset),
      edition.slices.map((_, i) => `email/${edition.key}-${String(i + 1).padStart(2, "0")}`)
    );
  });
}

test("Week 3 splits the moments row into three slices; Weeks 8 and 9 do not", () => {
  const moments = (key: string) => editions.find((edition) => edition.key === key)!.slices.filter((slice) => slice.y === 2174);
  assert.deepEqual(moments("w3").map((slice) => [slice.x, slice.w]), [[0, 800], [800, 800], [1600, 800]]);
  assert.deepEqual(moments("w8").map((slice) => [slice.x, slice.w]), [[0, 2400]]);
  assert.deepEqual(moments("w9").map((slice) => [slice.x, slice.w]), [[0, 2400]]);
});

test("a gap, an overlap or a module boundary through a slice is refused", () => {
  const two: EmailSlice[] = [
    { asset: "a", x: 0, y: 0, w: 10, h: 5 },
    { asset: "b", x: 0, y: 5, w: 10, h: 5 },
  ];
  assert.doesNotThrow(() => assemble(two, { width: 10, height: 10 }, [{ key: "m", height: 5 }, { key: "n", height: 5 }]));
  assert.throws(() => assemble([two[0], { ...two[1], y: 6, h: 4 }], { width: 10, height: 10 }, [{ key: "m", height: 10 }]), /gap/);
  assert.throws(() => assemble([two[0], { ...two[1], y: 4 }], { width: 10, height: 10 }, [{ key: "m", height: 10 }]), /overlap|outside/);
  assert.throws(() => assemble(two, { width: 10, height: 10 }, [{ key: "m", height: 3 }, { key: "n", height: 7 }]), /cuts through/);
});

test("snapping puts a shared edge on one device pixel, whatever the scale and offset", () => {
  for (const dpr of [1, 2, 3]) {
    for (const origin of [0, 10.25, 133.7, 4021.5]) {
      for (const scale of [0.09, 0.1131, 0.2263, 0.37]) {
        const edges = [0, 1335, 2174, 2652, 2954, 3640, 3877, 4433, 4983].map((y) => snap(y, origin, scale, dpr));
        for (const edge of edges) {
          // Whole device pixels in page coordinates.
          const device = (origin + edge) * dpr;
          assert.ok(Math.abs(device - Math.round(device)) < 1e-6, `edge at ${device} device px`);
        }
        // The outer edges round outwards, never inwards.
        assert.ok(snap(0, origin, scale, dpr, "floor") <= 1e-9);
        assert.ok(snap(4983, origin, scale, dpr, "ceil") >= 4983 * scale - 1e-9);
        // Never more than half a device pixel from the exact position, and in order.
        [0, 1335, 2174, 2652, 2954, 3640, 3877, 4433, 4983].forEach((y, i) => assert.ok(Math.abs(edges[i] - y * scale) <= 0.5 / dpr + 1e-9));
        for (let i = 1; i < edges.length; i++) assert.ok(edges[i] > edges[i - 1]);
      }
    }
  }
});

// The display derivatives are git-ignored and built per machine; check them when they are here.
const MEDIA = join(process.cwd(), "media-internal", "creative-technology");
const webpSize = (file: string) => {
  // VP8X header (extended WebP): canvas size at bytes 24–29, minus one.
  const bytes = readFileSync(file);
  if (bytes.toString("ascii", 12, 16) === "VP8X") return { w: 1 + bytes.readUIntLE(24, 3), h: 1 + bytes.readUIntLE(27, 3) };
  if (bytes.toString("ascii", 12, 16) === "VP8 ") return { w: bytes.readUInt16LE(26) & 0x3fff, h: bytes.readUInt16LE(28) & 0x3fff };
  if (bytes.toString("ascii", 12, 16) === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`unrecognised WebP: ${file}`);
};

for (const edition of editions) {
  const files = edition.slices.map((slice) => join(MEDIA, `${slice.asset}.webp`));
  test(`${edition.label}: each built slice is its native slice at half size`, { skip: !files.every(existsSync) && "derivatives not built here" }, () => {
    edition.slices.forEach((slice, i) => {
      const { w, h } = webpSize(files[i]);
      assert.equal(w, slice.w / 2, slice.asset);
      // Odd native heights round to the nearest whole pixel.
      assert.ok(Math.abs(h - slice.h / 2) <= 0.5, `${slice.asset}: ${h} rows for ${slice.h} native`);
    });
  });
}
