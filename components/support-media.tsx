"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ImageSlot } from "@/components/image-slot";

interface Group {
  label: string;
  srcs: string[];
}

interface SupportMediaProps {
  title: string;
  srcs?: string[];
  groups?: Group[];
  groupColClass?: string;
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function MediaGrid({
  srcs,
  title,
  colClass,
  onOpen,
}: {
  srcs: string[];
  title: string;
  colClass: string;
  onOpen: (src: string) => void;
}) {
  return (
    <div className={`grid gap-4 items-start ${colClass}`}>
      {srcs.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => onOpen(src)}
          className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${title} — ${i + 1}`}
            className="w-full h-auto"
          />
        </button>
      ))}
    </div>
  );
}

export function SupportMedia({
  title,
  srcs,
  groups,
  groupColClass = "grid-cols-2 sm:grid-cols-4",
}: SupportMediaProps) {
  const allSrcs = useMemo(() => {
    if (groups && groups.length > 0) return groups.flatMap((g) => g.srcs);
    if (srcs && srcs.length > 0) return srcs;
    return [];
  }, [groups, srcs]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Portal requires the DOM — track mount so SSR never attempts createPortal
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);

  // Touch tracking for swipe navigation on mobile
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return; // ignore taps / tiny swipes
    if (delta > 0) {
      // swiped left → next
      setLightboxIndex((i) => (i === null ? null : (i + 1) % allSrcs.length));
    } else {
      // swiped right → prev
      setLightboxIndex((i) => (i === null ? null : (i - 1 + allSrcs.length) % allSrcs.length));
    }
  }

  const isOpen = lightboxIndex !== null;

  function openAt(src: string) {
    const idx = allSrcs.indexOf(src);
    if (idx !== -1) setLightboxIndex(idx);
  }

  function close() {
    setLightboxIndex(null);
  }

  // Lock body scroll and handle keyboard while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const total = allSrcs.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? null : (i + 1) % total));
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, allSrcs.length]);

  // ── Lightbox — portalled into document.body ──────────────────────────
  // Rendering directly into body ensures no parent stacking context,
  // overflow-hidden, or z-index can constrain the overlay.
  const lightbox =
    isMounted && isOpen && lightboxIndex !== null
      ? createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
            style={{ zIndex: 9999, background: "rgba(255,255,255,0.92)" }}
            onClick={close}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close — top-right, 32px from edges */}
            <button
              type="button"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute top-8 right-8 p-2 text-[#888] transition-colors duration-150 hover:text-black focus:outline-none"
            >
              <CloseIcon />
            </button>

            {/* Left arrow */}
            {allSrcs.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i === null ? null : (i - 1 + allSrcs.length) % allSrcs.length
                  );
                }}
                className="absolute left-5 top-1/2 -translate-y-1/2 p-3 text-[#888] transition-colors duration-150 hover:text-black focus:outline-none hidden sm:block"
              >
                <ChevronLeft />
              </button>
            )}

            {/* Image — constrained to viewport, centered */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allSrcs[lightboxIndex]}
              alt=""
              style={{
                maxWidth: "100vw",
                maxHeight: "100dvh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right arrow */}
            {allSrcs.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i === null ? null : (i + 1) % allSrcs.length
                  );
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-3 text-[#888] transition-colors duration-150 hover:text-black focus:outline-none hidden sm:block"
              >
                <ChevronRight />
              </button>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="mt-20">
        {groups && groups.length > 0 ? (
          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-6 font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                  [ {group.label} ]
                </p>
                <MediaGrid
                  srcs={group.srcs}
                  title={title}
                  colClass={groupColClass}
                  onOpen={openAt}
                />
              </div>
            ))}
          </div>
        ) : srcs && srcs.length > 0 ? (
          <MediaGrid
            srcs={srcs}
            title={title}
            colClass="grid-cols-2 sm:grid-cols-3"
            onOpen={openAt}
          />
        ) : (
          <div className="grid gap-4 items-start grid-cols-2 sm:grid-cols-3">
            <ImageSlot aspect="aspect-[4/3]" sizes="(min-width: 640px) 33vw, 50vw" />
            <ImageSlot aspect="aspect-[4/3]" sizes="(min-width: 640px) 33vw, 50vw" />
            <ImageSlot aspect="aspect-[4/3]" sizes="(min-width: 640px) 33vw, 50vw" />
          </div>
        )}
      </div>

      {lightbox}
    </>
  );
}
