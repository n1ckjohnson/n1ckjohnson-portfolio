import { SectionHeading } from "@/components/index/section-heading";
import { SystemIndex } from "@/components/index/system-index";
import { CreativeIndex, type CreativeIndexItem } from "@/components/index/creative-index";
import { creativeEntries, systemEntries, workHref } from "@/lib/portfolio";
import { findMedia, workDir } from "@/lib/media";

export default function HomePage() {
  const systems = systemEntries.flatMap((entry) => (entry.kind === "system" ? [entry.project] : []));

  const creative: CreativeIndexItem[] = creativeEntries.map((entry) => ({
    slug: entry.slug,
    href: workHref(entry.slug),
    title: entry.title,
    label: entry.label,
    thumb: findMedia(workDir(entry.slug), "thumb") ?? findMedia(workDir(entry.slug), "hero"),
  }));

  return (
    <div className="page">
      <section className="pb-20 pt-16 sm:pb-28 sm:pt-28 lg:pt-36" aria-labelledby="intro">
        <p className="text-small text-ink-2">Creative technologist</p>
        <h1 id="intro" className="mt-3 max-w-[20ch] text-title font-medium text-ink sm:text-display">
          I design creative work and build the systems behind it.
        </h1>
        <p className="mt-5 max-w-measure text-body text-ink-2 sm:text-lead">
          Designer for the Jacksonville Jaguars, working across visual design, creative automation, and{" "}
          <span className="whitespace-nowrap">AI-assisted</span> software.
        </p>
      </section>

      <div id="work" className="scroll-mt-6 space-y-20 sm:space-y-28">
        <section aria-labelledby="systems">
          <SectionHeading
            id="systems"
            title="Selected systems"
            description="Automation and tools built for recurring production."
            count={systems.length}
          />
          <SystemIndex systems={systems} />
        </section>

        <section aria-labelledby="creative">
          <SectionHeading
            id="creative"
            title="Creative work"
            description="Campaigns and visual systems for the Jacksonville Jaguars."
            count={creative.length}
          />
          <CreativeIndex items={creative} />
        </section>
      </div>
    </div>
  );
}
