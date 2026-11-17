import type { MediaMap } from "@/lib/creative-technology/media";
import { image } from "@/components/creative-technology/ui/media";
import { pack, type Pack, type Packed } from "@/lib/creative-technology/pack";
import type { Seat, SuitePiece } from "@/components/creative-technology/demos/ticketing-suites.client";

/** The box width each arrangement is drawn at, used to stop small files being enlarged too far. */
const DRAWN = { wide: 880, narrow: 334 };
/** A placement in focus fills this much of the box, and is never shown above twice its real size. */
const FILL = 0.94;
const MAX_ENLARGE = 2;

export type SuiteSource = {
  key: string;
  label: string;
  width: number;
  height: number;
  asset: string;
  /** The same placement in each further look, in order. */
  alts?: string[];
  /** What this placement carries, of every element the suite can carry. Optional. */
  elements?: { name: string; kept: boolean }[];
};

function seat(packed: Packed, placement: SuiteSource, drawn: number): Seat {
  const slot = packed.slots.find((candidate) => candidate.key === placement.key);
  if (!slot) throw new Error(`Suite layout has no seat for "${placement.key}"`);
  const fill = Math.min(1 / slot.w, 1 / slot.h) * FILL;
  const sharp = (MAX_ENLARGE * placement.width) / (slot.w * drawn);
  const round = (value: number) => Math.round(value * 1e4) / 1e4;
  return {
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    // Percentages of the piece's own size: what a CSS translate expects.
    tx: `${round(((0.5 - (slot.x + slot.w / 2)) / slot.w) * 100)}%`,
    ty: `${round(((0.5 - (slot.y + slot.h / 2)) / slot.h) * 100)}%`,
    s: round(Math.min(fill, sharp)),
  };
}

/**
 * Lays a suite out for the fan-out: where every piece sits on a wide and a
 * narrow screen, and the order pieces leave the creative they came from.
 */
export function buildSuite(
  placements: SuiteSource[],
  layouts: { wide: { hero: string; pack: Pack }; narrow: { hero: string; pack: Pack } },
  media: MediaMap
) {
  const aspects = Object.fromEntries(placements.map((placement) => [placement.key, placement.width / placement.height]));
  const wide = pack(layouts.wide.pack, aspects, 0.016);
  const narrow = pack(layouts.narrow.pack, aspects, 0.024);

  // Pieces leave in order of their distance from the creative they came from.
  const origin = wide.slots.find((slot) => slot.key === layouts.wide.hero);
  const distance = (key: string) => {
    const slot = wide.slots.find((candidate) => candidate.key === key);
    if (!slot || !origin) return 0;
    return Math.hypot(slot.x + slot.w / 2 - (origin.x + origin.w / 2), (slot.y + slot.h / 2 - (origin.y + origin.h / 2)) / wide.ratio);
  };
  const order = [...placements].sort((a, b) => distance(a.key) - distance(b.key)).map((placement) => placement.key);
  const cleared = placements.every((placement) => image(media, placement.asset));

  const pieces: SuitePiece[] = placements.map((placement) => {
    const isWide = placement.key === layouts.wide.hero;
    const isNarrow = placement.key === layouts.narrow.hero;
    return {
      key: placement.key,
      label: placement.label,
      size: `${placement.width} × ${placement.height}`,
      media: cleared ? image(media, placement.asset) : null,
      looks: cleared ? (placement.alts ?? []).map((id) => image(media, id)) : [],
      elements: placement.elements ?? [],
      wide: seat(wide, placement, DRAWN.wide),
      narrow: seat(narrow, placement, DRAWN.narrow),
      hero: isWide && isNarrow ? "both" : isWide ? "wide" : isNarrow ? "narrow" : undefined,
      rank: order.indexOf(placement.key),
    };
  });

  return { pieces, ratios: { wide: wide.ratio, narrow: narrow.ratio }, cleared };
}
