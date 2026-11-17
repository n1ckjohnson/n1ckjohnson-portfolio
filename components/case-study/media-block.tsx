import type { MediaBlock } from "@/content/creative-layouts";
import { findMedia, listMedia, workDir } from "@/lib/media";
import { Media } from "@/components/media/media";
import { Gallery, type GalleryGroupData } from "@/components/media/gallery";

/**
 * Renders one media slot from a creative layout, on the wide stage. Missing
 * files simply render nothing: no empty placeholders on a public page.
 */
export function MediaBlockView({ block, slug, title }: { block?: MediaBlock; slug: string; title: string }) {
  if (!block) return null;
  const dir = workDir(slug);

  if (block.type === "image") {
    const item = findMedia(dir, block.file);
    if (!item) return null;
    return (
      <figure className="wide spaced">
        <div className="overflow-hidden rounded-stage bg-surface">
          <Media item={item} alt={`${title}: ${block.alt ?? block.label ?? "campaign visual"}`} sizes="(min-width: 1008px) 960px, 100vw" />
        </div>
        {block.label ? <figcaption className="caption">{block.label}</figcaption> : null}
      </figure>
    );
  }

  const groups: GalleryGroupData[] = block.groups
    .map((group) => ({ label: group.label, items: listMedia(dir, group.match) }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="wide spaced">
      <Gallery title={title} groups={groups} columns={block.columns} />
    </div>
  );
}
