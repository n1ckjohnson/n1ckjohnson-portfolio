/**
 * The motion engine behind every demonstration: a timeline that is a pure
 * function of one number.
 *
 * A timeline is a list of tracks. A track says: between here and there on
 * a 0 to 1 scale, move this element from one value to another. Rendering
 * the timeline at any position writes exactly the transforms and opacities
 * that position implies, and nothing else: no tweens in flight, no state
 * left over from the last frame.
 *
 * That is what makes a demonstration safe to drive from the scroll bar. It
 * plays forward, plays backward, can be opened half-way through from a
 * link, and survives a resize, because every frame is computed from
 * scratch. The same timeline can also be driven by a clock, for loops.
 *
 * Values keep their CSS units ("12cqw", "50%", "-8deg"), so geometry is
 * resolved by the browser against the stage and never measured here.
 */

export type Ease = (t: number) => number;

/** A cubic-bezier easing, as CSS defines it. */
export function bezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Newton's method, then bisection if it does not settle.
    let t = x;
    for (let i = 0; i < 6; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-5) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    let low = 0;
    let high = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const value = sampleX(t);
      if (Math.abs(value - x) < 1e-5) break;
      if (value < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return sampleY(t);
  };
}

/** The site's curves. `out` and `inOut` match --ease-out and --ease-in-out. */
export const EASE = {
  linear: ((t) => t) as Ease,
  out: bezier(0.22, 1, 0.36, 1),
  inOut: bezier(0.65, 0, 0.35, 1),
  in: bezier(0.5, 0, 0.9, 0.5),
  /** Arrives, passes its mark by a hair and settles. For things that land. */
  settle: bezier(0.3, 1.25, 0.5, 1),
};

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Progress of `p` through the window [start, end], clamped to 0–1. */
export const span = (p: number, start: number, end: number) => (end <= start ? (p >= end ? 1 : 0) : clamp((p - start) / (end - start)));

type Value = number | string;
type Pair = readonly [Value, Value];

type TransformProp = "x" | "y" | "scale" | "scaleX" | "scaleY" | "rotate";

export type Track = {
  /** An element, or the value of its `data-m` attribute inside the scene. Every match moves. */
  el: Element | string | null | undefined;
  /** When the change runs: [start, end] on the 0–1 timeline. */
  at: readonly [number, number];
  ease?: Ease;
  /** Offsets, as CSS lengths: "12cqw", "-50%", or a number of pixels. */
  x?: Pair;
  y?: Pair;
  scale?: Pair;
  scaleX?: Pair;
  scaleY?: Pair;
  /** Degrees. */
  rotate?: Pair;
  opacity?: Pair;
  /** Custom properties, for anything CSS should derive: { "--fill": [0, 1] }. */
  vars?: Record<string, Pair>;
};

type Segment = { start: number; end: number; from: number; to: number; ease: Ease };
type Channel = { unit: string; segments: Segment[] };

type Target = {
  node: HTMLElement | SVGElement;
  transforms: Partial<Record<TransformProp, Channel>>;
  opacity?: Channel;
  vars: Map<string, Channel>;
  /** What was last written, so an unchanged frame touches nothing. */
  written: { transform?: string; opacity?: string; vars: Map<string, string> };
};

const NUMBER = /^(-?\d*\.?\d+(?:e[+-]?\d+)?)([a-z%]*)$/i;

function parse(value: Value): { number: number; unit: string } {
  if (typeof value === "number") return { number: value, unit: "" };
  const match = NUMBER.exec(value.trim());
  if (!match) throw new Error(`timeline: cannot read the value "${value}"`);
  return { number: Number(match[1]), unit: match[2] };
}

const TRANSFORM_PROPS: TransformProp[] = ["x", "y", "scale", "scaleX", "scaleY", "rotate"];
const DEFAULT_UNIT: Record<TransformProp, string> = { x: "px", y: "px", scale: "", scaleX: "", scaleY: "", rotate: "deg" };

function addSegment(channel: Channel | undefined, pair: Pair, track: Track, fallbackUnit: string): Channel {
  const from = parse(pair[0]);
  const to = parse(pair[1]);
  // A bare 0 takes the unit of the value it is paired with.
  const unit = from.unit || to.unit || channel?.unit || fallbackUnit;
  const next = channel ?? { unit, segments: [] };
  if (!channel) next.unit = unit;
  next.segments.push({ start: track.at[0], end: track.at[1], from: from.number, to: to.number, ease: track.ease ?? EASE.inOut });
  next.segments.sort((a, b) => a.start - b.start);
  return next;
}

/**
 * The value of one property at position `p`: before its first change it
 * holds the starting value, between changes it holds where the last one
 * left it, and inside a change it is eased between the two.
 */
function valueAt(channel: Channel, p: number): number {
  const { segments } = channel;
  let active = segments[0];
  if (p <= active.start) return active.from;
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].start <= p) active = segments[i];
    else break;
  }
  if (p >= active.end) return active.to;
  return lerp(active.from, active.to, active.ease(span(p, active.start, active.end)));
}

const round = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export type Timeline = {
  /** Draws the timeline at position `p` (0 to 1). */
  render: (p: number) => void;
  /** Removes every style the timeline wrote. */
  clear: () => void;
};

/**
 * @param root    The scene. String targets are looked up inside it.
 * @param tracks  Every change, in any order.
 */
export function createTimeline(root: ParentNode, tracks: readonly Track[]): Timeline {
  const targets = new Map<Element, Target>();

  const targetFor = (node: Element): Target => {
    let target = targets.get(node);
    if (!target) {
      target = { node: node as HTMLElement, transforms: {}, vars: new Map(), written: { vars: new Map() } };
      targets.set(node, target);
    }
    return target;
  };

  for (const track of tracks) {
    if (!track.el) continue;
    const nodes = typeof track.el === "string" ? Array.from(root.querySelectorAll(`[data-m="${track.el}"]`)) : [track.el];
    for (const node of nodes) {
      const target = targetFor(node);
      for (const prop of TRANSFORM_PROPS) {
        const pair = track[prop];
        if (pair) target.transforms[prop] = addSegment(target.transforms[prop], pair, track, DEFAULT_UNIT[prop]);
      }
      if (track.opacity) target.opacity = addSegment(target.opacity, track.opacity, track, "");
      for (const [name, pair] of Object.entries(track.vars ?? {})) {
        target.vars.set(name, addSegment(target.vars.get(name), pair, track, ""));
      }
    }
  }

  const render = (position: number) => {
    const p = clamp(position);
    for (const target of targets.values()) {
      const { node, transforms, written } = target;

      const x = transforms.x;
      const y = transforms.y;
      const rotate = transforms.rotate;
      const scale = transforms.scale;
      const scaleX = transforms.scaleX;
      const scaleY = transforms.scaleY;

      if (x || y || rotate || scale || scaleX || scaleY) {
        let transform = "";
        if (x || y) {
          const tx = x ? `${round(valueAt(x, p), 3)}${x.unit}` : "0";
          const ty = y ? `${round(valueAt(y, p), 3)}${y.unit}` : "0";
          transform = `translate3d(${tx},${ty},0)`;
        }
        if (rotate) transform += ` rotate(${round(valueAt(rotate, p), 3)}deg)`;
        if (scale || scaleX || scaleY) {
          const uniform = scale ? valueAt(scale, p) : 1;
          const sx = round(uniform * (scaleX ? valueAt(scaleX, p) : 1), 4);
          const sy = round(uniform * (scaleY ? valueAt(scaleY, p) : 1), 4);
          transform += sx === sy ? ` scale(${sx})` : ` scale(${sx},${sy})`;
        }
        if (transform !== written.transform) {
          node.style.transform = transform;
          written.transform = transform;
        }
      }

      if (target.opacity) {
        const opacity = String(round(valueAt(target.opacity, p), 4));
        if (opacity !== written.opacity) {
          node.style.opacity = opacity;
          written.opacity = opacity;
        }
      }

      for (const [name, channel] of target.vars) {
        const value = `${round(valueAt(channel, p), 4)}${channel.unit}`;
        if (value !== written.vars.get(name)) {
          node.style.setProperty(name, value);
          written.vars.set(name, value);
        }
      }
    }
  };

  const clear = () => {
    for (const target of targets.values()) {
      target.node.style.removeProperty("transform");
      target.node.style.removeProperty("opacity");
      for (const name of target.vars.keys()) target.node.style.removeProperty(name);
      target.written = { vars: new Map() };
    }
  };

  return { render, clear };
}

/** A named moment on a timeline, e.g. the step a code panel should light up. */
export type Step<Key extends string = string> = { key: Key; at: number };

/** The step a position falls in: the last one whose start has been reached. */
export function stepAt<Key extends string>(steps: readonly Step<Key>[], p: number): Key {
  let current = steps[0].key;
  for (const step of steps) {
    if (p >= step.at) current = step.key;
    else break;
  }
  return current;
}
