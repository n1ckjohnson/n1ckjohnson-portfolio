import Link from "next/link";
import type { Entry } from "@/lib/portfolio";
import { workHref } from "@/lib/portfolio";
import { CaseKeyNav } from "@/components/case-study/case-key-nav";

/** Previous / next within the design portfolio. */
export function CaseNav({ prev, next }: { prev: Entry; next: Entry }) {
  return (
    <nav aria-label="More design work" className="col mt-16 sm:mt-20">
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
    <Link href={workHref(entry.slug)} rel={direction} className={`group block rounded-s ${isNext ? "text-right" : ""}`}>
      <span className="block text-small text-ink-2">{isNext ? "Next" : "Previous"}</span>
      <span className="link block decoration-transparent group-hover:decoration-current">{entry.title}</span>
    </Link>
  );
}
