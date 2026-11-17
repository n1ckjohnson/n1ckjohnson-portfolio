/**
 * Checks the highlighter: it never loses a character, and it tells the
 * parts of each language apart.
 *
 * Run: npm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { highlight, linesOf, type Language, type Token } from "./highlight.ts";

const text = (lines: Token[][]) => lines.map((line) => line.map((token) => token.text).join("")).join("\n");
const kinds = (code: string, language: Language) =>
  highlight(code, language)
    .flat()
    .filter((token) => token.text.trim())
    .map((token) => `${token.kind}:${token.text.trim()}`);

const SAMPLES: [Language, string][] = [
  ["json", '{\n  "week": "W2",\n  "home": false,\n  "score": [24, 20], // sample\n  "partner": null\n}'],
  ["js", "/* block\n   comment */\nconst fit = (name, width) => {\n  if (measure(name) <= width) return { cut: 'normal', scale: 1 };\n  return null; // stop\n};"],
  ["py", 'def mask(hsv, hue=196, tol=12):\n    """Teal key."""\n    return abs(hsv[..., 0] - hue) <= tol  # degrees\n'],
  ["text", "plain text → stays as it is"],
];

for (const [language, code] of SAMPLES) {
  test(`${language}: every character survives`, () => {
    assert.equal(text(highlight(code, language)), code);
  });
}

test("json tells keys from string values", () => {
  assert.deepEqual(kinds('{"a": "b", "n": 1.5, "t": true}', "json"), [
    "punctuation:{",
    'property:"a"',
    "punctuation::",
    'string:"b"',
    "punctuation:,",
    'property:"n"',
    "punctuation::",
    "number:1.5",
    "punctuation:,",
    'property:"t"',
    "punctuation::",
    "constant:true",
    "punctuation:}",
  ]);
});

test("javascript marks keywords, calls, strings and comments", () => {
  const found = kinds("const n = solve(rows, 0.72); // floor", "js");
  assert.ok(found.includes("keyword:const"));
  assert.ok(found.includes("function:solve"));
  assert.ok(found.includes("number:0.72"));
  assert.ok(found.includes("comment:// floor"));
  assert.ok(found.includes("plain:rows"));
});

test("a keyword inside a longer name is not a keyword", () => {
  const found = kinds("const format = information;", "js");
  assert.ok(found.includes("plain:format"));
  assert.ok(found.includes("plain:information"));
});

test("python marks def, constants and comments", () => {
  const found = kinds("def run(batch):\n    return None  # done", "py");
  assert.ok(found.includes("keyword:def"));
  assert.ok(found.includes("function:run"));
  assert.ok(found.includes("constant:None"));
  assert.ok(found.includes("comment:# done"));
});

test("a block comment is split across its lines", () => {
  const lines = highlight("/* a\n   b */\nx", "js");
  assert.equal(lines.length, 3);
  assert.equal(lines[0][0].kind, "comment");
  assert.equal(lines[1][0].kind, "comment");
});

test("line ranges expand to line numbers", () => {
  assert.deepEqual([...linesOf([[2, 4], [9, 9]])], [2, 3, 4, 9]);
  assert.deepEqual([...linesOf(undefined)], []);
});
