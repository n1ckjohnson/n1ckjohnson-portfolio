/**
 * Illustrative reproduction of the Injury Report layout law.
 *
 * This is NOT the production engine. It re-implements the documented rules
 * (Adaptive Layout V1.1) closely enough to show how a report's geometry is
 * solved from its data: row height, whole-list scaling, the column switch
 * and the hard stop above the certified maximum. The production system
 * solves against measured Photoshop bounds; this model uses the same rules
 * with constants fitted to the documented measurements.
 *
 * Pure functions, no DOM. Covered by injury-layout.test.ts.
 */

export type TallRules = {
  canvas: [number, number];
  /** Full-size row height, px. */
  rowMax: number;
  /** Smallest row height before the whole list scales instead, px. */
  rowMin: number;
  /** Gap between rows as a fraction of row height. */
  gapRatio: number;
  /** Height available to the list, px. */
  region: number;
  /** The list is never scaled below this. */
  scaleFloor: number;
  /** Certified maximum player count. */
  max: number;
};

export type WideRules = {
  canvas: [number, number];
  /** First player count that uses two columns. */
  splitAt: number;
  /** Full-size rows that fit in one column. */
  rowsPerColumn: number;
  /** Rows of height the list region can hold at full size. */
  regionRows: number;
  /** A single column never enlarges beyond this. */
  growCap: number;
  scaleFloor: number;
  max: number;
};

export type Solution = {
  ok: boolean;
  /** Rows in each column, left to right. */
  columns: number[];
  /** Row height before scaling, px on the production canvas. */
  rowHeight: number;
  /** Uniform scale applied to rows, gaps, type and chips together. */
  scale: number;
  state: "full" | "compressed" | "scaled" | "enlarged" | "stopped";
  /** One plain sentence describing what the rule did. */
  note: string;
};

const round = (value: number, places = 3) => Math.round(value * 10 ** places) / 10 ** places;

export function solveTall(players: number, rules: TallRules): Solution {
  const n = Math.max(0, Math.floor(players));
  const units = (rows: number) => rows + Math.max(rows - 1, 0) * rules.gapRatio;

  if (n > rules.max) {
    return {
      ok: false,
      columns: [n],
      rowHeight: rules.rowMin,
      scale: rules.scaleFloor,
      state: "stopped",
      note: `${n} is over the certified maximum of ${rules.max}. The run stops before Photoshop opens.`,
    };
  }
  if (n === 0) return { ok: true, columns: [0], rowHeight: rules.rowMax, scale: 1, state: "full", note: "No players on the report." };

  const fit = rules.region / units(n);
  const rowHeight = Math.min(rules.rowMax, Math.max(rules.rowMin, fit));
  const scale = Math.min(1, rules.region / (rowHeight * units(n)));

  if (scale < rules.scaleFloor - 0.005) {
    return {
      ok: false,
      columns: [n],
      rowHeight,
      scale: rules.scaleFloor,
      state: "stopped",
      note: `${n} players would need a scale below ${rules.scaleFloor}. The run stops before Photoshop opens.`,
    };
  }

  if (rowHeight >= rules.rowMax && scale >= 1) {
    return { ok: true, columns: [n], rowHeight, scale: 1, state: "full", note: `Rows at full height, ${rules.rowMax} px.` };
  }
  if (scale >= 1) {
    return {
      ok: true,
      columns: [n],
      rowHeight: round(rowHeight, 1),
      scale: 1,
      state: "compressed",
      note: `Rows solved to ${Math.round(rowHeight)} px so the list fits. Card contents scale with the row.`,
    };
  }
  return {
    ok: true,
    columns: [n],
    rowHeight,
    scale: round(scale),
    state: "scaled",
    note: `Rows are at the ${rules.rowMin} px floor, so the whole list scales to ${Math.round(scale * 100)}%.`,
  };
}

export function solveWide(players: number, rules: WideRules): Solution {
  const n = Math.max(0, Math.floor(players));

  if (n > rules.max) {
    return {
      ok: false,
      columns: [Math.ceil(n / 2), Math.floor(n / 2)],
      rowHeight: 1,
      scale: rules.scaleFloor,
      state: "stopped",
      note: `${n} is over the certified maximum of ${rules.max}. The run stops before Photoshop opens.`,
    };
  }
  if (n === 0) return { ok: true, columns: [0], rowHeight: 1, scale: 1, state: "full", note: "No players on the report." };

  if (n < rules.splitAt) {
    const scale = Math.min(rules.growCap, rules.regionRows / n);
    return {
      ok: true,
      columns: [n],
      rowHeight: 1,
      scale: round(scale),
      state: scale > 1 ? "enlarged" : "full",
      note: `One centred column. Rows enlarge to ${Math.round(scale * 100)}% to use the space.`,
    };
  }

  const left = Math.ceil(n / 2);
  const right = Math.floor(n / 2);
  const scale = Math.min(1, rules.regionRows / left);
  if (scale < rules.scaleFloor - 0.005) {
    return {
      ok: false,
      columns: [left, right],
      rowHeight: 1,
      scale: rules.scaleFloor,
      state: "stopped",
      note: `${n} players would need a scale below ${rules.scaleFloor}. The run stops before Photoshop opens.`,
    };
  }
  return {
    ok: true,
    columns: [left, right],
    rowHeight: 1,
    scale: round(scale),
    state: scale >= 1 ? "full" : "scaled",
    note:
      scale >= 1
        ? `Two columns, ${left} + ${right}, filled left first. Rows at full size.`
        : `Two columns, ${left} + ${right}. The whole list scales to ${Math.round(scale * 100)}%.`,
  };
}

/** Name-fit ladder: normal cut, then the narrow cut, then a bounded shrink, then stop. */
export type NameFit = { cut: "normal" | "narrow"; scale: number; ok: boolean };

export function fitName(widthNormal: number, widthNarrow: number, available: number, shrinkFloor = 0.9): NameFit {
  if (widthNormal <= available) return { cut: "normal", scale: 1, ok: true };
  if (widthNarrow <= available) return { cut: "narrow", scale: 1, ok: true };
  const scale = available / widthNarrow;
  if (scale >= shrinkFloor) return { cut: "narrow", scale: round(scale), ok: true };
  return { cut: "narrow", scale: shrinkFloor, ok: false };
}
