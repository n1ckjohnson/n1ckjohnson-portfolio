"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type DependencyList, type ReactNode, type RefObject } from "react";
import { usePinnedProgress, useReducedMotion } from "@/components/creative-technology/motion/drivers";
import { createTimeline, type Timeline, type Track } from "@/components/creative-technology/motion/timeline";
import { cn } from "@/lib/cn";

/**
 * A stage: the off-white tile a demonstration is drawn on. It is exactly as
 * wide as the reading column and has a fixed shape, and everything inside
 * it is sized against its width (cqw units), so a scene is the same picture
 * on a phone and on a desktop.
 */
export function Stage({
  ratio,
  ratioNarrow,
  className,
  label,
  children,
  stageRef,
}: {
  /** Width over height. */
  ratio: number;
  /** Width over height on a phone, when the scene needs a taller shape there. */
  ratioNarrow?: number;
  className?: string;
  /** Describes the demonstration for assistive technology. */
  label?: string;
  children: ReactNode;
  stageRef?: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="scene" style={{ "--ar-wide": ratio, "--ar-narrow": ratioNarrow ?? ratio } as CSSProperties}>
      <div ref={stageRef} className={cn("scene__stage", className)} role={label ? "img" : undefined} aria-label={label}>
        {children}
      </div>
    </div>
  );
}

/**
 * A stage that holds its place while the page scrolls a set distance, and
 * reports how far through that distance the page is.
 *
 * Scrolling is native: the stage is `position: sticky` inside a taller
 * track. Nothing listens for the wheel and nothing changes the scroll
 * position. With reduced motion the track collapses to the stage and the
 * scene is drawn in its finished state.
 */
export function PinnedStage({
  ratio,
  ratioNarrow,
  travel = "90svh",
  travelNarrow,
  onProgress,
  className,
  label,
  children,
  stageRef,
}: {
  ratio: number;
  ratioNarrow?: number;
  /** How far the page scrolls while the scene plays, as a CSS length. */
  travel?: string;
  travelNarrow?: string;
  onProgress: (progress: number) => void;
  className?: string;
  label?: string;
  children: ReactNode;
  stageRef?: RefObject<HTMLDivElement>;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  usePinnedProgress(track, onProgress, { disabled: reduced });

  return (
    <div
      className="scene"
      style={
        { "--ar-wide": ratio, "--ar-narrow": ratioNarrow ?? ratio, "--travel-wide": travel, "--travel-narrow": travelNarrow ?? travel } as CSSProperties
      }
    >
      <div ref={track} className="scene__track">
        <div ref={stageRef} className={cn("scene__stage", className)} role={label ? "group" : undefined} aria-label={label}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Builds a timeline for a scene and keeps it drawn.
 *
 * Returns `draw`, to be called with a position from a scroll or clock
 * driver. The timeline is rebuilt when `deps` change (a different layout,
 * a different selection) and immediately redrawn at the position it was
 * last given, so the scene never shows a frame of the wrong state.
 *
 * @param root  The scene's stage. Tracks look their elements up inside it.
 * @param build Returns the tracks. Called after the stage has rendered.
 */
export function useTimeline(root: RefObject<HTMLElement | null>, build: () => readonly Track[], deps: DependencyList) {
  const timeline = useRef<Timeline | null>(null);
  const position = useRef(0);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const next = createTimeline(node, build());
    timeline.current = next;
    next.render(position.current);
    return () => {
      // Leave no stale transform behind on elements the next build does not move.
      next.clear();
      timeline.current = null;
    };
    // `build` is expected to change with `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useCallback((p: number) => {
    position.current = p;
    timeline.current?.render(p);
  }, []);
}
