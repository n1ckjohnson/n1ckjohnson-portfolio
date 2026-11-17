import type { CodeSample } from "@/content/creative-technology/types";
import { highlight, linesOf } from "@/lib/code/highlight";
import { cn } from "@/lib/cn";

const ORIGIN: Record<CodeSample["origin"], string> = {
  excerpt: "Source excerpt",
  illustrative: "Illustrative",
};

/** Up to this many lines are shown whole. */
const WHOLE = 16;

/**
 * Where a longer sample is cut: at the last blank line between lines 9 and
 * 16, so the visible part ends at a natural pause; failing that, line 14.
 */
function cutAt(lines: Line[]) {
  for (let i = Math.min(16, lines.length - 1); i >= 9; i--) if (!lines[i - 1].length) return i - 1;
  return 14;
}

type Line = ReturnType<typeof highlight>[number];

/**
 * The one way code is shown on the site.
 *
 * A quiet panel the same width as the text: a file name, where the code
 * comes from, and the code itself. A demonstration can light up the lines
 * that belong to the step it is on (`active`), so the code and the motion
 * explain each other.
 *
 * Code stays in the article. A sample of up to 16 lines is shown whole; a
 * longer one shows its opening, cut at a natural pause, and the rest opens
 * in place below it with the line numbers carrying on. Nothing about the
 * code itself changes.
 *
 * Works as a server component, and inside a client demonstration.
 */
export function CodeBlock({
  sample,
  active,
  className,
}: {
  sample: CodeSample;
  /** A key of `sample.marks`: the lines to pick out. Null or absent: none. */
  active?: string | null;
  className?: string;
}) {
  const lines = highlight(sample.code.replace(/\n$/, ""), sample.language);
  const marked = active ? linesOf(sample.marks?.[active]) : null;
  const picking = Boolean(marked && marked.size);
  const cut = lines.length > WHOLE ? cutAt(lines) : lines.length;
  const shown = lines.slice(0, cut);
  // The cut falls on a blank line; the continuation starts on the code after it, numbered as it is.
  const from = lines[cut] && !lines[cut].length ? cut + 1 : cut;
  const rest = lines.slice(from);
  const label = `${sample.title}, ${ORIGIN[sample.origin].toLowerCase()}`;

  const render = (part: Line[], offset: number) =>
    part.map((line, index) => (
      <span key={index} className="code__line" data-on={picking && marked?.has(offset + index + 1) ? "" : undefined}>
        {line.length
          ? line.map((token, at) =>
              token.kind === "plain" ? (
                token.text
              ) : (
                <span key={at} className={`tok-${token.kind}`}>
                  {token.text}
                </span>
              )
            )
          : " "}
        {"\n"}
      </span>
    ));

  return (
    <figure className={cn("code", className)} data-picking={picking ? "true" : undefined}>
      <figcaption className="code__head">
        <span className="code__title">{sample.title}</span>
        <span>{ORIGIN[sample.origin]}</span>
      </figcaption>
      {/* Focusable, so a long line can be scrolled into view from the keyboard. */}
      <pre className="code__body" tabIndex={0} aria-label={label}>
        <code>{render(shown, 0)}</code>
      </pre>
      {rest.length ? (
        <details className="code__more">
          <summary>
            <span className="code__more-closed">{rest.length} more lines</span>
            <span className="code__more-open">Fewer lines</span>
          </summary>
          <pre className="code__body code__body--rest" tabIndex={0} aria-label={`${label}, continued`}>
            <code style={{ counterReset: `line ${from}` }}>{render(rest, from)}</code>
          </pre>
        </details>
      ) : null}
      {sample.note ? <p className="code__note">{sample.note}</p> : null}
    </figure>
  );
}
