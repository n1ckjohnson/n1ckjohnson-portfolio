"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Media } from "@/lib/creative-technology/media";

/**
 * A large view of one image from a set, in the site's lightbox. Native
 * <dialog>: focus is trapped, Escape closes, and focus returns to whatever
 * opened it. Arrow keys move through the set.
 */
export function Lightbox({
  items,
  index,
  onIndex,
  label,
}: {
  items: { media: Media; title: string }[];
  index: number | null;
  onIndex: (index: number | null) => void;
  label: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const total = items.length;

  useEffect(() => {
    const node = dialog.current;
    if (index !== null && node && !node.open) {
      opener.current = document.activeElement;
      node.showModal();
    }
  }, [index]);

  const close = useCallback(() => {
    const node = dialog.current;
    if (!node || node.dataset.state === "closing") return;
    node.dataset.state = "closing";
    const finish = () => {
      node.removeAttribute("data-state");
      node.close();
      onIndex(null);
      (opener.current as HTMLElement | null)?.focus({ preventScroll: true });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else window.setTimeout(finish, 180);
  }, [onIndex]);

  const step = (delta: number) => index !== null && onIndex((index + delta + total) % total);
  const current = index === null ? null : items[index];

  return (
    <dialog
      ref={dialog}
      aria-label={label}
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
      }}
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      {current ? (
        <div className="flex h-full w-full flex-col" onClick={(event) => event.target === event.currentTarget && close()}>
          <div className="flex items-center justify-between px-6 py-4 text-small">
            <p className="text-ink-2" aria-live="polite">
              {current.title}
            </p>
            <button type="button" onClick={close} className="pressable -mr-3 inline-flex min-h-11 items-center rounded-full px-3 text-ink hover:text-ink-2">
              Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(event) => event.target === event.currentTarget && close()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.media.src}
              src={current.media.src}
              alt={current.media.alt}
              className="lightbox-image absolute inset-x-6 bottom-6 top-0 m-auto h-[calc(100%-1.5rem)] w-[calc(100%-3rem)] object-contain sm:inset-x-16 sm:w-[calc(100%-8rem)]"
            />
            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous"
                  className="pressable absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:text-ink sm:flex"
                >
                  <Chevron d="M12.5 4.5 7 10l5.5 5.5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next"
                  className="pressable absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:text-ink sm:flex"
                >
                  <Chevron d="M7.5 4.5 13 10l-5.5 5.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
