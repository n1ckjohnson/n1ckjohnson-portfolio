import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared building blocks for every case study, creative or system. */

export type MetaItem = { term: string; detail: string };

export function CaseHeader({
  label,
  title,
  summary,
  meta,
}: {
  label: string;
  title: string;
  summary: string;
  meta: MetaItem[];
}) {
  return (
    <header className="page pt-10 sm:pt-20 lg:pt-24">
      <p className="text-small text-ink-2">{label}</p>
      <h1 className="mt-3 max-w-[22ch] text-title font-medium text-ink sm:text-display">{title}</h1>
      <p className="mt-5 max-w-[40rem] text-body text-ink-2 sm:text-lead">{summary}</p>
      {meta.length > 0 ? (
        <dl className="mt-10 grid gap-x-6 gap-y-4 border-t border-line pt-5 sm:mt-14 sm:grid-cols-3">
          {meta.map((item) => (
            <div key={item.term}>
              <dt className="text-small text-ink-3">{item.term}</dt>
              <dd className="mt-0.5 text-small text-ink">{item.detail}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}

/** A labeled band: label in the left rail on desktop, stacked on mobile. */
export function CaseSection({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("page mt-16 sm:mt-24 lg:grid lg:grid-cols-12 lg:gap-x-6", className)}>
      {label ? <h2 className="mb-4 text-small font-medium text-ink lg:col-span-3 lg:mb-0 lg:pt-1">{label}</h2> : null}
      <div className="lg:col-span-8 lg:col-start-4">{children}</div>
    </section>
  );
}

/** First paragraph carries the point in full ink; the rest support it. */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-[38rem] space-y-4">
      {paragraphs.map((paragraph, i) => (
        <p key={paragraph} className={cn("text-body sm:text-lead", i === 0 ? "text-ink" : "text-ink-2")}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((item, i) => (
        <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-line py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:py-5">
          <span className="pt-0.5 text-small tabular-nums text-ink-3">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-body text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** "A → B / C → D" rendered as an ordered sequence. */
export function FlowSequence({ flow }: { flow: string }) {
  const stages = flow
    .split("→")
    .map((stage) => stage.trim())
    .filter(Boolean);

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-5" aria-label={`Flow: ${stages.join(", then ")}`}>
      {stages.map((stage, i) => (
        <li key={stage} className="flex items-center gap-x-3">
          {i > 0 ? (
            <span aria-hidden="true" className="text-ink-3">
              →
            </span>
          ) : null}
          <span className="text-small font-medium text-ink">{stage}</span>
        </li>
      ))}
    </ol>
  );
}
