import type { MediaItem } from "@/lib/media";
import { RevealImage } from "@/components/media/reveal-image";
import { InlineVideo } from "@/components/media/inline-video";
import { cn } from "@/lib/cn";

type MediaProps = {
  item: MediaItem;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Renders any project media at its intrinsic aspect ratio: optimized
 * images, animated GIFs (served as-is) and muted inline video.
 */
export function Media({ item, alt, sizes = "(min-width: 1008px) 960px, 100vw", priority, className }: MediaProps) {
  if (item.kind === "video") {
    return <InlineVideo src={item.src} width={item.width} height={item.height} label={alt} className={className} />;
  }

  return (
    <RevealImage
      src={item.src}
      alt={alt}
      width={item.width}
      height={item.height}
      sizes={sizes}
      priority={priority}
      unoptimized={item.kind === "animated"}
      className={cn("block h-auto w-full", className)}
    />
  );
}
