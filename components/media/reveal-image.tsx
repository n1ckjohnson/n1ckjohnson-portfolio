"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * next/image that fades in once decoded instead of painting top-to-bottom.
 * Space is always reserved (width/height or fill), so there is no shift.
 * Priority images skip the reveal so they never delay the largest paint.
 */
export function RevealImage({ alt, className, onLoad, priority, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      priority={priority}
      data-loaded={priority || loaded ? "true" : undefined}
      className={cn(!priority && "media-reveal", className)}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
    />
  );
}
