/**
 * A small syntax highlighter for the code shown on the Creative Technology
 * page: JSON, JavaScript / TypeScript (ExtendScript is JavaScript) and Python.
 *
 * It is a scanner, not a parser. Each language is an ordered list of
 * patterns; at every position the first one that matches wins. That is
 * enough to colour short, well-formed excerpts and it keeps a dependency
 * and a few hundred kilobytes out of the site.
 *
 * Pure: no DOM, no state. Works on the server and in the browser.
 * Covered by highlight.test.ts.
 */

export type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "constant" | "property" | "function" | "punctuation";

export type Token = { kind: TokenKind; text: string };

export type Language = "json" | "js" | "ts" | "py" | "text";

type Rule = [TokenKind, RegExp];

const NUMBER = /-?\b(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y;
const IDENTIFIER = /[A-Za-z_$][\w$]*/y;

const JSON_RULES: Rule[] = [
  ["comment", /\/\/[^\n]*/y],
  ["property", /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y],
  ["string", /"(?:[^"\\\n]|\\.)*"/y],
  ["constant", /\b(?:true|false|null)\b/y],
  ["number", NUMBER],
  ["punctuation", /[{}[\],:]+/y],
];

const JS_KEYWORDS =
  "as|async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|interface|let|new|of|return|switch|this|throw|try|type|typeof|var|void|while|yield";

const JS_RULES: Rule[] = [
  ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ["string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/y],
  ["keyword", new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, "y")],
  ["constant", /\b(?:true|false|null|undefined|NaN|Infinity)\b/y],
  ["number", NUMBER],
  ["function", /[A-Za-z_$][\w$]*(?=\s*\()/y],
  ["property", /[A-Za-z_$][\w$]*(?=\s*:(?!:))/y],
  ["plain", IDENTIFIER],
  ["punctuation", /[{}()[\];,.:?=+\-*/%<>!&|^~]+/y],
];

const PY_KEYWORDS =
  "and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield";

const PY_RULES: Rule[] = [
  ["comment", /#[^\n]*/y],
  ["string", /[rRfFbB]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/y],
  ["keyword", new RegExp(`\\b(?:${PY_KEYWORDS})\\b`, "y")],
  ["constant", /\b(?:None|True|False)\b/y],
  ["number", NUMBER],
  ["function", /@?[A-Za-z_][\w]*(?=\s*\()/y],
  ["plain", /[A-Za-z_][\w]*/y],
  ["punctuation", /[{}()[\];,.:=+\-*/%<>!&|^~@]+/y],
];

const RULES: Record<Language, Rule[]> = {
  json: JSON_RULES,
  js: JS_RULES,
  ts: JS_RULES,
  py: PY_RULES,
  text: [],
};

/** Splits code into lines of coloured tokens. Every character of the input is kept. */
export function highlight(code: string, language: Language): Token[][] {
  const rules = RULES[language] ?? [];
  const lines: Token[][] = [[]];

  const push = (kind: TokenKind, text: string) => {
    // A token may run over several lines (a block comment). Each line gets its part.
    const parts = text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (!part) return;
      const line = lines[lines.length - 1];
      const last = line[line.length - 1];
      if (last && last.kind === kind && kind === "plain") last.text += part;
      else line.push({ kind, text: part });
    });
  };

  let at = 0;
  scan: while (at < code.length) {
    for (const [kind, pattern] of rules) {
      pattern.lastIndex = at;
      const match = pattern.exec(code);
      if (match && match[0].length > 0) {
        push(kind, match[0]);
        at += match[0].length;
        continue scan;
      }
    }
    // Whitespace, and anything no rule recognises.
    push("plain", code[at]);
    at += 1;
  }

  return lines;
}

/** Expands inclusive 1-based ranges, e.g. [[2, 4], [9, 9]], to a set of line numbers. */
export function linesOf(ranges: readonly (readonly [number, number])[] | undefined): Set<number> {
  const set = new Set<number>();
  for (const [from, to] of ranges ?? []) for (let line = from; line <= to; line++) set.add(line);
  return set;
}
