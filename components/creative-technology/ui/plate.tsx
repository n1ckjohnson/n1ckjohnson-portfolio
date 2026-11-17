"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { Swap } from "@/components/creative-technology/ui/swap";
import { cn } from "@/lib/cn";

/**
 * One real export, fitted inside a stage of fixed height.
 *
 * Changing the export dissolves to the new one. If its proportions differ,
 * the fitted box eases from one shape to the other while the stage itself,
 * and everything below it, stays exactly where it is.
 */
export function Plate({
  media,
  height,
  heightWide,
  eager,
  flat,
  className,
  children,
}: {
  media: Media;
  /** Stage height on a phone, as a CSS length. */
  height?: string;
  /** Stage height from 640px up. */
  heightWide?: string;
  eager?: boolean;
  /** Artwork with transparent corners of its own: no plate behind it, and a shadow that follows its shape. */
  flat?: boolean;
  className?: string;
  /** Drawn over the export, in the same box: overlays and outlines. */
  children?: ReactNode;
}) {
  return (
    <div className={cn("stage plate", className)} style={{ "--plate-h": height, "--plate-h-wide": heightWide } as CSSProperties}>
      <div className="plate__area">
        <div className="plate__fit" style={{ "--ar": media.width / media.height } as CSSProperties}>
          <Swap media={media} eager={eager} lift={!flat} className={flat ? "swap--flat" : undefined} style={{ aspectRatio: "auto" }} />
          {children}
        </div>
      </div>
    </div>
  );
}
