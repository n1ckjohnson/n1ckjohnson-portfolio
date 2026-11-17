import { SUITE_ELEMENTS, type TicketingDemo } from "@/content/creative-technology/projects/ticketing-suites";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { image } from "@/components/creative-technology/ui/media";
import { SuiteFanOut } from "@/components/creative-technology/demos/ticketing-suites.client";
import { LocalizeScene } from "@/components/creative-technology/demos/suite-localize.client";
import { buildSuite } from "@/components/creative-technology/demos/suite";

/**
 * Creative suite versioning. The original creative opens into the formats
 * built from it, and each can be brought forward to see what it keeps and
 * what it drops. Every piece is the delivered file.
 */
export function TicketingSuitesDemo({ project, media }: DemoProps<TicketingDemo>) {
  const { placements, layouts, totals, suite, looks } = project.demo;
  const { pieces, ratios, cleared } = buildSuite(
    placements.map((placement) => ({
      ...placement,
      elements: SUITE_ELEMENTS.map((name) => ({ name, kept: placement.keeps.includes(name) })),
    })),
    layouts,
    media
  );

  const scale = `${placements.length} of the ${totals.deliverables} files delivered for ${suite.week}, across ${totals.sizes} sizes.`;

  return (
    <figure className="wide">
      <SuiteFanOut
        pieces={pieces}
        ratios={ratios}
        outlines={!cleared}
        looks={looks}
        summary={cleared ? scale : `${scale} Shown as outlines until the creative is cleared.`}
      />
    </figure>
  );
}

/** The same creative in Spanish: one version corrected, then carried through the suite. */
export function TicketingSuitesEvidence({ project, media }: DemoProps<TicketingDemo>) {
  const { english, spanish, regions, suite } = project.demo.localized;
  const en = image(media, english);
  const es = image(media, spanish);
  const rest = suite.flatMap((item) => {
    const shot = image(media, item.asset);
    return shot ? [{ key: item.key, media: shot, width: item.width, height: item.height }] : [];
  });
  if (!en || !es || rest.length !== suite.length) return null;

  return (
    <div className="col">
      <h3 className="text-ink">In Spanish</h3>
      <p className="mt-1 text-ink-2">One version is translated, then the same changes carry through every Spanish size.</p>
      <div className="mt-8">
        <LocalizeScene english={en} spanish={es} regions={regions} suite={rest} />
      </div>
    </div>
  );
}
