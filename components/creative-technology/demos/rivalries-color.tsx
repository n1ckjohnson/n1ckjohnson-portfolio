import type { RivalriesDemo } from "@/content/creative-technology/projects/rivalries-color";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { RivalriesCamera } from "@/components/creative-technology/demos/rivalries-color.client";

/**
 * Rivalries color engineering. One studio photograph, as shot and as
 * corrected, with a divider to compare and a camera that frames the
 * jersey, the pants or the helmet. The framings come from the working
 * file's own layer masks.
 */
export function RivalriesColorDemo({ project, media }: DemoProps<RivalriesDemo>) {
  const { photos, views, safe } = project.demo;
  const lead = photos[0];
  const before = image(media, lead.before);
  const after = image(media, lead.after);

  if (!before || !after) {
    return (
      <Withheld>
        The photographs for this project are not cleared for publication yet. In their place: the workflow corrects a
        photograph material by material (jersey, pants, helmet), and every correction stays an editable, masked layer.
      </Withheld>
    );
  }

  return <RivalriesCamera before={before} after={after} views={views} safe={safe} />;
}
