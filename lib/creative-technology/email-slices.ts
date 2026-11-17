/**
 * Geometry for the Jags Win email, assembled from its Save for Web slices.
 *
 * Every number is in pixels of the native 2400-wide email. A slice is placed
 * exactly where Photoshop cut it; nothing is cropped, stretched or overlapped.
 * `assemble` refuses any set of slices that does not tile the email exactly,
 * or that a module boundary would cut through.
 *
 * Pure: no DOM, no filesystem. Shared by the page and its tests.
 */

export type EmailSlice = {
  /** Manifest id of the slice's display derivative. */
  asset: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type EmailModuleSpan<S extends EmailSlice = EmailSlice> = {
  key: string;
  /** Top of the module, in native pixels. */
  y: number;
  /** Height of the module, in native pixels. */
  h: number;
  /** The slices that make up this module, in slice order. */
  slices: S[];
};

export function assemble<S extends EmailSlice>(
  slices: readonly S[],
  size: { width: number; height: number },
  modules: readonly { key: string; height: number }[]
): EmailModuleSpan<S>[] {
  const { width, height } = size;
  const name = (slice: S) => `${slice.asset} (${slice.x},${slice.y} ${slice.w}×${slice.h})`;

  for (const slice of slices) {
    if (![slice.x, slice.y, slice.w, slice.h].every(Number.isInteger)) throw new Error(`slice ${name(slice)} is not on whole pixels`);
    if (slice.w <= 0 || slice.h <= 0) throw new Error(`slice ${name(slice)} is empty`);
    if (slice.x < 0 || slice.y < 0 || slice.x + slice.w > width || slice.y + slice.h > height) throw new Error(`slice ${name(slice)} falls outside the ${width}×${height} email`);
  }
  for (let i = 0; i < slices.length; i++) {
    for (let j = i + 1; j < slices.length; j++) {
      const a = slices[i];
      const b = slices[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) throw new Error(`slices ${name(a)} and ${name(b)} overlap`);
    }
  }
  // In bounds and not overlapping, so covering the whole area means there is no gap.
  const area = slices.reduce((sum, slice) => sum + slice.w * slice.h, 0);
  if (area !== width * height) throw new Error(`slices cover ${area} of ${width * height} pixels: the email has a gap`);

  const total = modules.reduce((sum, module) => sum + module.height, 0);
  if (total !== height) throw new Error(`modules add up to ${total} pixels, the email is ${height}`);

  let y = 0;
  return modules.map((module) => {
    const top = y;
    const bottom = y + module.height;
    y = bottom;
    const inside = slices.filter((slice) => slice.y >= top && slice.y + slice.h <= bottom);
    const cut = slices.find((slice) => slice.y < bottom && slice.y + slice.h > top && !inside.includes(slice));
    if (cut) throw new Error(`the boundary of module "${module.key}" cuts through slice ${name(cut)}`);
    return { key: module.key, y: top, h: module.height, slices: inside };
  });
}

/**
 * Where an edge lands on screen: a native coordinate, scaled, rounded to a
 * device pixel of the page, returned in CSS pixels from `origin`. Two slices
 * that share an edge in the email share the same device pixel on screen, so
 * there is never a sliver of anything between them. The email's own outer
 * edges round outwards (`floor` at the start, `ceil` at the end), so it
 * always covers the frame it sits in.
 */
export function snap(native: number, origin: number, scale: number, dpr: number, rounding: "round" | "floor" | "ceil" = "round") {
  const exact = origin * dpr + native * scale * dpr;
  // An edge already on a device pixel stays there: floating-point noise must not push it one pixel out.
  const nudge = rounding === "ceil" ? -1e-9 : rounding === "floor" ? 1e-9 : 0;
  return (Math[rounding](exact + nudge) - origin * dpr) / dpr;
}
