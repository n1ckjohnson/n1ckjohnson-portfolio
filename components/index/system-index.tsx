import Link from "next/link";
import type { SystemProject } from "@/content/systems";
import { IndexArrow, indexNumber } from "@/components/index/section-heading";
import { workHref } from "@/lib/portfolio";

/**
 * Text-first index for engineering work. Every row carries its own
 * summary, so nothing depends on hover to be understood.
 */
export function SystemIndex({ systems }: { systems: SystemProject[] }) {
  return (
    <ol className="index">
      {systems.map((system, i) => (
        <li key={system.slug}>
          <Link
            href={workHref(system.slug)}
            className="index-row group grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 border-b border-line py-5 outline-offset-[-2px] sm:grid-cols-[2.5rem_minmax(0,1fr)_13rem_1rem] sm:gap-x-6 sm:py-6"
          >
            <span className="pt-px text-small tabular-nums text-ink-3">{indexNumber(i)}</span>
            <span className="min-w-0">
              <span className="block text-body font-medium text-ink">{system.title}</span>
              <span className="mt-0.5 block text-small text-ink-2 sm:hidden">{system.discipline}</span>
              <span className="mt-2 block max-w-[36rem] text-small text-ink-2 sm:mt-1.5">{system.summary}</span>
            </span>
            <span className="hidden pt-px text-small text-ink-2 sm:block">{system.discipline}</span>
            <IndexArrow className="index-arrow mt-[5px] text-ink opacity-30" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
