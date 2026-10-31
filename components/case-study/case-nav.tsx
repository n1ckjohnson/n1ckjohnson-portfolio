import Link from "next/link";
import type { Entry } from "@/lib/portfolio";
import { workHref } from "@/lib/portfolio";
import { CaseKeyNav } from "@/components/case-study/case-key-nav";

/** Previous / next across the whole public sequence (systems, then creative). */
export function CaseNav({ prev, next }: { prev: Entry; next: Entry }) {
  return (
    <nav aria-label="More work" className="page mt-24 sm:mt-32">
      <CaseKeyNav prevHref={workHref(prev.slug)} nextHref={workHref(next.slug)} />
      <div className="grid grid-cols-2 gap-6 border-t border-line pt-5">
        <NeighborLink entry={prev} direction="prev" />
        <NeighborLink entry={next} direction="next" />
      </div>
    </nav>
  );
}

function NeighborLink({ entry, direction }: { entry: Entry; direction: "prev" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={workHref(entry.slug)}
      rel={direction}
      className={`group block rounded-md ${isNext ? "text-right" : ""}`}
    >
      <span
        className={`flex items-center gap-1.5 text-small text-ink-3 transition-colors duration-quick ease-out group-hover:text-ink-2 ${isNext ? "justify-end" : "justify-start"}`}
      >
        {!isNext ? <Arrow className="rotate-180 transition-transform duration-base ease-out group-hover:-translate-x-0.5" /> : null}
        {isNext ? "Next" : "Previous"}
        {isNext ? <Arrow className="transition-transform duration-base ease-out group-hover:translate-x-0.5" /> : null}
      </span>
      <span className="mt-1 block text-body font-medium text-ink">{entry.title}</span>
      <span className="mt-0.5 block text-small text-ink-2">{entry.label}</span>
    </Link>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h9.5M8.5 4 12.5 8l-4 4" />
    </svg>
  );
}
