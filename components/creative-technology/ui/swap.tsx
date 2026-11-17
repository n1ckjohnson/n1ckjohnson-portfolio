"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Media } from "@/lib/creative-technology/media";
import { cn } from "@/lib/cn";

const warmed = new Set<string>();

/** Fetches and decodes an image ahead of the moment it is shown. */
export function preload(media: Media | null | undefined) {
  if (!media || warmed.has(media.src) || typeof window === "undefined") return;
  warmed.add(media.src);
  const picture = new window.Image();
  picture.decoding = "async";
  picture.src = media.src;
}

/**
 * One slot that dissolves between real exports.
 *
 * The incoming image is decoded first and only then laid over the current
 * one, where it fades in. The frame never flashes empty. When the two images
 * have different proportions the slot's aspect ratio changes with them, and
 * the caller decides whether that change is animated (see Frame).
 */
export function Swap({
  media,
  eager,
  lift,
  className,
  style,
}: {
  media: Media;
  eager?: boolean;
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  // Bottom to top. At rest there is one layer; during a change there are two.
  const [layers, setLayers] = useState<Media[]>([media]);
  const top = layers[layers.length - 1];

  useEffect(() => {
    if (top.id === media.id) return;
    let cancelled = false;
    const picture = new window.Image();
    picture.src = media.src;
    const show = () => {
      if (!cancelled) setLayers((current) => [current[current.length - 1], media]);
    };
    picture.decode().then(show, show);
    return () => {
      cancelled = true;
    };
  }, [media, top.id]);

  return (
    <span className={cn("swap", lift && "lift", className)} style={{ aspectRatio: `${media.width} / ${media.height}`, ...style }}>
      {layers.map((layer, index) => {
        const incoming = layers.length > 1 && index === layers.length - 1;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.id}
            className={incoming ? "swap__in" : undefined}
            src={layer.src}
            width={layer.width}
            height={layer.height}
            alt={index === layers.length - 1 ? layer.alt : ""}
            loading={eager || incoming ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onAnimationEnd={incoming ? () => setLayers((current) => (current[current.length - 1].id === layer.id ? [layer] : current)) : undefined}
          />
        );
      })}
    </span>
  );
}
