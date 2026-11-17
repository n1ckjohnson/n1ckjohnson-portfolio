/**
 * Checks the footer clock against known instants, so its correctness does
 * not rest on the time zone of the machine running the test or the site.
 *
 * Run: npm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { clockParts, clockText, untilNextMinute } from "./time.ts";

const ZONE = "America/New_York";
const at = (iso: string) => clockText(clockParts(new Date(iso), ZONE));

test("standard time is five hours behind UTC", () => {
  assert.equal(at("2026-01-15T17:30:00Z"), "12:30 PM");
  assert.equal(at("2026-11-15T01:53:00Z"), "8:53 PM");
});

test("daylight time is four hours behind UTC", () => {
  assert.equal(at("2026-07-15T17:30:00Z"), "1:30 PM");
});

test("the spring change is applied at the right minute", () => {
  // 8 March 2026: 1:59 AM EST is followed by 3:00 AM EDT.
  assert.equal(at("2026-03-08T06:59:00Z"), "1:59 AM");
  assert.equal(at("2026-03-08T07:00:00Z"), "3:00 AM");
});

test("the autumn change is applied at the right minute", () => {
  // 1 November 2026: 1:59 AM EDT is followed by 1:00 AM EST.
  assert.equal(at("2026-11-01T05:59:00Z"), "1:59 AM");
  assert.equal(at("2026-11-01T06:00:00Z"), "1:00 AM");
});

test("midnight and noon read as twelve", () => {
  assert.equal(at("2026-01-15T05:00:00Z"), "12:00 AM");
  assert.equal(at("2026-01-15T17:00:00Z"), "12:00 PM");
});

test("the answer does not depend on the machine's own zone", () => {
  const original = process.env.TZ;
  try {
    for (const zone of ["Asia/Tokyo", "Europe/London", "America/Los_Angeles", "UTC"]) {
      process.env.TZ = zone;
      assert.equal(at("2026-06-01T12:05:00Z"), "8:05 AM", `machine in ${zone}`);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("minutes are always two digits and hours never have a leading zero", () => {
  const parts = clockParts(new Date("2026-01-15T14:05:00Z"), ZONE);
  assert.deepEqual(parts, { hour: "9", minute: "05", period: "AM" });
});

test("the next tick lands on the minute", () => {
  assert.equal(untilNextMinute(Date.UTC(2026, 0, 1, 0, 0, 0)), 60_000);
  assert.equal(untilNextMinute(Date.UTC(2026, 0, 1, 0, 0, 59, 500)), 500);
});
