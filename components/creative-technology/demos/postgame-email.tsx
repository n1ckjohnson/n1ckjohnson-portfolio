import type { EmailDemo } from "@/content/creative-technology/projects/postgame-email";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { assemble } from "@/lib/creative-technology/email-slices";
import { EmailScene, type EmailEdition, type EmailModuleView } from "@/components/creative-technology/demos/postgame-email.client";

/**
 * Jags Win email. Real sent emails, each assembled from its own Save for
 * Web slices at their native geometry, module by module; later editions
 * re-skin the same six modules.
 */
export function PostgameEmailDemo({ project, media }: DemoProps<EmailDemo>) {
  const { modules, editions, width, height } = project.demo;

  // An edition is shown only when every one of its slices is cleared for this build.
  const sent: EmailEdition[] = editions.flatMap((edition) => {
    const slices = edition.slices.map((slice) => ({ ...slice, media: image(media, slice.asset) }));
    if (slices.some((slice) => !slice.media)) return [];
    // Throws if the slices do not tile the email exactly, or a module boundary would cut one.
    const spans = assemble(
      slices.map((slice) => ({ asset: slice.asset, x: slice.x, y: slice.y, w: slice.w, h: slice.h, src: slice.media!.src })),
      { width, height },
      modules
    );
    return [{ key: edition.key, label: edition.label, alt: edition.alt, modules: spans.map((span) => span.slices) }];
  });

  if (!sent.length) {
    return (
      <Withheld>
        The sent emails carry team photography and partner marks, so they are held back until they are cleared for
        publication. In their place: the email is six modules, filled from each game&rsquo;s photographs, score and next matchup,
        and re-skinned for themed games.
      </Withheld>
    );
  }

  const views: EmailModuleView[] = modules.map((module, i) => ({
    key: module.key,
    label: module.label,
    varies: module.varies,
    y: modules.slice(0, i).reduce((sum, above) => sum + above.height, 0),
    h: module.height,
  }));

  return (
    <div className="col">
      <EmailScene size={{ width, height }} modules={views} editions={sent} code={project.code.find((sample) => sample.key === "plan")} />
    </div>
  );
}
