/**
 * Packs pieces of very different proportions into one tidy rectangle.
 *
 * The arrangement is written as rows and columns: a row sets its children
 * side by side at one height, a column stacks them at one width, and either
 * may contain the other. Every piece keeps its own aspect ratio, so nothing
 * is cropped or stretched to fit.
 *
 * Pure functions, no DOM. Sizes are fractions of the finished box, which is
 * what lets one solution serve every screen width.
 */

export type Pack = string | { row: Pack[] } | { col: Pack[] };

export type Slot = {
  key: string;
  /** Left edge and width, as fractions of the box width. */
  x: number;
  w: number;
  /** Top edge and height, as fractions of the box height. */
  y: number;
  h: number;
};

export type Packed = {
  /** Width over height of the finished box. */
  ratio: number;
  slots: Slot[];
};

const isRow = (node: Pack): node is { row: Pack[] } => typeof node === "object" && "row" in node;
const isCol = (node: Pack): node is { col: Pack[] } => typeof node === "object" && "col" in node;

/** Finds the input at which an increasing function reaches `target`. */
function solve(fn: (value: number) => number, target: number): number {
  let low = 0;
  let high = 1;
  while (fn(high) < target && high < 1e6) high *= 2;
  for (let i = 0; i < 48; i++) {
    const mid = (low + high) / 2;
    if (fn(mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/**
 * @param tree     The arrangement.
 * @param aspects  Width over height of each piece, by key.
 * @param gap      Space between neighbours, as a fraction of the box width.
 */
export function pack(tree: Pack, aspects: Record<string, number>, gap = 0.016): Packed {
  const aspect = (key: string) => {
    const value = aspects[key];
    if (!value) throw new Error(`pack: no aspect ratio for "${key}"`);
    return value;
  };

  const heightFor = (node: Pack, width: number): number => {
    if (typeof node === "string") return width / aspect(node);
    if (isCol(node)) return node.col.reduce((sum, child) => sum + heightFor(child, width), 0) + gap * (node.col.length - 1);
    return solve((height) => widthFor(node, height), width);
  };

  const widthFor = (node: Pack, height: number): number => {
    if (typeof node === "string") return height * aspect(node);
    if (isRow(node)) return node.row.reduce((sum, child) => sum + widthFor(child, height), 0) + gap * (node.row.length - 1);
    return solve((width) => heightFor(node, width), height);
  };

  const slots: Slot[] = [];
  const place = (node: Pack, x: number, y: number, w: number, h: number) => {
    if (typeof node === "string") {
      slots.push({ key: node, x, y, w, h });
      return;
    }
    if (isCol(node)) {
      let top = y;
      for (const child of node.col) {
        const height = heightFor(child, w);
        place(child, x, top, w, height);
        top += height + gap;
      }
      return;
    }
    let left = x;
    for (const child of node.row) {
      const width = widthFor(child, h);
      place(child, left, y, width, h);
      left += width + gap;
    }
  };

  const height = heightFor(tree, 1);
  place(tree, 0, 0, 1, height);

  const round = (value: number) => Math.round(value * 1e5) / 1e5;
  return {
    ratio: round(1 / height),
    slots: slots.map((slot) => ({ key: slot.key, x: round(slot.x), w: round(slot.w), y: round(slot.y / height), h: round(slot.h / height) })),
  };
}
