"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type InlineVideoProps = {
  src: string;
  width: number;
  height: number;
  label: string;
  className?: string;
};

/**
 * Muted loop that only plays while on screen, and never on its own when
 * the visitor prefers reduced motion (native controls are offered instead).
 */
export function InlineVideo({ src, width, height, label, className }: InlineVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      width={width}
      height={height}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      className={cn("block h-auto w-full", className)}
    />
  );
}
