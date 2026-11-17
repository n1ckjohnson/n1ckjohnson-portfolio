import type { ReactNode } from "react";
import { PageHead } from "@/components/site/page-head";

/* Shared building blocks for the design case studies. */

export type MetaItem = { term: string; detail: string };

/** Name, one grey line, the summary, then who and where. */
export function CaseHeader({ label, title, summary, meta }: { label: string; title: string; summary: string; meta: MetaItem[] }) {
  return (
    <>
      <PageHead back={{ href: "/#design", label: "Nick Johnson" }} title={title} subtitle={label} />
      <div className="col">
        <p className="mt-8">{summary}</p>
        {meta.length > 0 ? (
          <dl className="pairs mt-8">
            {meta.map((item) => (
              <div key={item.term} className="pair">
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </>
  );
}

/** A section of the reading column, named by a small grey label. */
export function CaseSection({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="col spaced">
      {label ? <h2 className="label mb-3">{label}</h2> : null}
      {children}
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Decisions, one to a line, with hairlines between them. */
export function PlainList({ items }: { items: string[] }) {
  return (
    <ul className="border-t border-line">
      {items.map((item) => (
        <li key={item} className="border-b border-line py-[0.6875rem]">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** "A → B → C" set as one quiet line that wraps. */
export function FlowSequence({ flow }: { flow: string }) {
  const stages = flow
    .split("→")
    .map((stage) => stage.trim())
    .filter(Boolean);

  return (
    <ol className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1" aria-label={`Flow: ${stages.join(", then ")}`}>
      {stages.map((stage, i) => (
        <li key={stage} className="flex items-baseline gap-x-2.5">
          {i > 0 ? (
            <span aria-hidden="true" className="text-ink-3">
              →
            </span>
          ) : null}
          <span>{stage}</span>
        </li>
      ))}
    </ol>
  );
}
