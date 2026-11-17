"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media";
import { RevealImage } from "@/components/media/reveal-image";
import { cn } from "@/lib/cn";

export type GalleryGroupData = {
  label?: string;
  items: MediaItem[];
};

type GalleryProps = {
  title: string;
  groups: GalleryGroupData[];
  columns: 3 | 4;
};

const GRID = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

const SIZES = {
  3: "(min-width: 1008px) 312px, (min-width: 640px) 33vw, 50vw",
  4: "(min-width: 1008px) 232px, (min-width: 640px) 25vw, 50vw",
};

/**
 * Grid of supporting media with a modal viewer. Uses the native <dialog>
 * for focus containment, Escape and inert background; motion is CSS.
 */
export function Gallery({ title, groups, columns }: GalleryProps) {
  const flat = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => ({ item, label: group.label }))),
    [groups]
  );
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const total = flat.length;
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total]
  );

  const open = (i: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(i);
  };

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.dataset.state === "closing") return;
    dialog.dataset.state = "closing";
    const finish = () => {
      dialog.removeAttribute("data-state");
      dialog.close();
      setIndex(null);
      openerRef.current?.focus();
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) finish();
    else setTimeout(finish, 180);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (index !== null && dialog && !dialog.open) dialog.showModal();
  }, [index]);

  const current = index === null ? null : flat[index];

  // Index of each group's first item within the flattened sequence
  const starts = groups.map((_, g) => groups.slice(0, g).reduce((sum, group) => sum + group.items.length, 0));

  return (
    <>
      <div className="space-y-10 sm:space-y-12">
        {groups.map((group, g) => {
          const start = starts[g];
          return (
            <div key={group.label ?? start}>
              {group.label ? <p className="mb-3 text-small text-ink-2">{group.label}</p> : null}
              <ul className={cn("grid items-start gap-2 sm:gap-3", GRID[columns])}>
                {group.items.map((item, i) => (
                  <li key={item.src}>
                    <button
                      type="button"
                      onClick={(event) => open(start + i, event.currentTarget)}
                      aria-label={`View ${title}, image ${start + i + 1} of ${total}`}
                      className="group block w-full cursor-zoom-in overflow-hidden rounded-s bg-surface"
                    >
                      <RevealImage
                        src={item.src}
                        alt=""
                        width={item.width}
                        height={item.height}
                        sizes={SIZES[columns]}
                        unoptimized={item.kind === "animated"}
                        className="block h-auto w-full transition-[opacity,transform] duration-base ease-out group-hover:opacity-90"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${title}, image viewer`}
        className="lightbox"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          else if (event.key === "ArrowLeft") step(-1);
          else return;
          event.preventDefault();
          event.stopPropagation();
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const delta = touchX.current - event.changedTouches[0].clientX;
          touchX.current = null;
          if (Math.abs(delta) > 48) step(delta > 0 ? 1 : -1);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {current ? (
          <div className="flex h-full w-full flex-col" onClick={(event) => event.target === event.currentTarget && close()}>
            <div className="flex items-center justify-between px-6 py-4 text-small">
              <p className="tabular-nums text-ink-2" aria-live="polite">
                {index! + 1} <span className="text-ink-2">/ {total}</span>
                {current.label ? <span className="ml-3 hidden text-ink-2 sm:inline">{current.label}</span> : null}
              </p>
              <button type="button" onClick={close} className="pressable -mr-2 rounded-full px-2 py-1 text-ink hover:text-ink-2">
                Close
              </button>
            </div>

            <div className="relative min-h-0 flex-1" onClick={(event) => event.target === event.currentTarget && close()}>
              {/* Sized by the viewport, not the file: fill + contain */}
              <div className="absolute inset-x-6 bottom-6 top-0 sm:inset-x-16">
                <Image
                  key={current.item.src}
                  src={current.item.src}
                  alt={`${title}, image ${index! + 1} of ${total}`}
                  fill
                  sizes="100vw"
                  quality={85}
                  unoptimized={current.item.kind === "animated"}
                  className="lightbox-image object-contain"
                />
              </div>

              {total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="pressable absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:text-ink sm:flex"
                  >
                    <Chevron direction="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="pressable absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:text-ink sm:flex"
                  >
                    <Chevron direction="right" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
    </svg>
  );
}
