import type { CSSProperties, ReactNode } from "react";
import type { Media, MediaMap, Provenance } from "@/lib/creative-technology/media";
import { cn } from "@/lib/cn";

/** The assets a page is allowed to show in this build, in the order asked for. */
export function available(media: MediaMap, ids: readonly string[]): Media[] {
  return ids.map((id) => media[id]).filter((item): item is Media => Boolean(item) && item?.kind === "image");
}

export function image(media: MediaMap, id: string | undefined): Media | null {
  const item = id ? media[id] : null;
  return item && item.kind === "image" ? item : null;
}

/**
 * What a visitor is told when imagery is not a production output.
 * Production outputs carry no label: they are the default on these pages.
 */
const LABEL: Record<Provenance, string | null> = {
  "production-output": null,
  "system-output-synthetic": "Illustrative",
  "qa-proof": "QA proof",
  "source-input": "Source",
  derived: "Computed",
};

export const provenanceLabel = (media: Media | null | undefined) => (media ? LABEL[media.provenance] : null);

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Small counts as words, for captions. */
export const countWord = (count: number, capital = false) => {
  const word = WORDS[count] ?? String(count);
  return capital ? word[0].toUpperCase() + word.slice(1) : word;
};

/** A real export at its own proportions. Space is reserved before it loads. */
export function Shot({
  media,
  eager,
  lift,
  className,
  style,
}: {
  media: Media;
  /** Load immediately: only for what is on screen at first paint. */
  eager?: boolean;
  /** Give it the soft shadow used for creative sitting on a stage. */
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn("shot", lift && "lift", className)} style={{ aspectRatio: `${media.width} / ${media.height}`, ...style }}>
      {/* Real exports are served as built: no resizing proxy sits between the file and the page. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.src} width={media.width} height={media.height} alt={media.alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

export function Caption({ label, children, className }: { label?: string | null; children: ReactNode; className?: string }) {
  return (
    <figcaption className={cn("caption", className)}>
      {label ? <strong>{label}. </strong> : null}
      {children}
    </figcaption>
  );
}

/** Shown in place of imagery this build is not allowed to publish. */
export function Withheld({ children }: { children?: ReactNode }) {
  return (
    <div className="col">
      <p className="rounded-stage bg-surface px-5 py-4 text-small text-ink-2">
        {children ?? "The visuals for this project are not cleared for publication yet. How the system works is described below."}
      </p>
    </div>
  );
}
