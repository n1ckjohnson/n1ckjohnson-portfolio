"use client";

import { useState } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { Plate } from "@/components/creative-technology/ui/plate";
import { Segmented } from "@/components/creative-technology/ui/segmented";
import { preload } from "@/components/creative-technology/ui/swap";
import { Caption } from "@/components/creative-technology/ui/media";

export type PickerItem = {
  key: string;
  /** Short label for the control. */
  label: string;
  /** Spoken name, where the label is too terse. */
  name?: string;
  media: Media;
  caption: string;
  /** Set when the export is not a delivered one, e.g. "Illustrative". */
  tag?: string | null;
};

/**
 * The quietest demonstration: one stage, one choice. Picking an item shows
 * its real export and says what is different about it. Used by the projects
 * whose point is "the same template, set for someone else".
 */
export function Picker({
  label,
  items,
  height,
  heightWide,
}: {
  /** Names the choice for assistive technology, e.g. "Player". */
  label: string;
  items: PickerItem[];
  height?: string;
  heightWide?: string;
}) {
  const [key, setKey] = useState(items[0].key);
  const item = items.find((candidate) => candidate.key === key) ?? items[0];

  return (
    <>
      <Plate media={item.media} height={height} heightWide={heightWide} eager />
      {items.length > 1 ? (
        <div className="controls">
          <Segmented
            label={label}
            value={item.key}
            onChange={setKey}
            onPeek={(candidate) => preload(items.find((entry) => entry.key === candidate)?.media)}
            options={items.map((candidate) => ({ key: candidate.key, label: candidate.label, name: candidate.name }))}
          />
        </div>
      ) : null}
      <Caption label={item.tag} className="min-h-10">
        <span aria-live="polite">{item.caption}</span>
      </Caption>
    </>
  );
}
