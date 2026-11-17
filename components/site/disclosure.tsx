"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * Regions that open in place: "More info" and "More creative projects".
 *
 * Which regions are open is kept outside React, in one small store backed by
 * sessionStorage. That gives three things at once:
 *  - the server always renders a region closed, and the browser corrects it
 *    before first paint without a hydration mismatch;
 *  - coming back from a case study finds the list still open, so the page is
 *    the same height it was and the scroll position is restored correctly;
 *  - an address that names a region (/#design, /#more-info) opens it.
 */

const STORAGE_KEY = "nj:open-regions";
const open = new Map<string, boolean>();
const listeners = new Set<() => void>();
let restored = false;

function restore() {
  if (restored) return;
  restored = true;
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(stored)) for (const id of stored) if (typeof id === "string") open.set(id, true);
  } catch {
    // Storage can be unavailable (private windows). Regions simply start closed.
  }
}

function persist() {
  try {
    const ids = [...open].filter(([, value]) => value).map(([id]) => id);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // As above.
  }
}

function isOpen(id: string) {
  restore();
  return open.get(id) ?? false;
}

function setRegion(id: string, value: boolean) {
  restore();
  if ((open.get(id) ?? false) === value) return;
  open.set(id, value);
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * @param id      Names the region. Also the id of the element it controls.
 * @param anchors Address fragments that should open it, e.g. ["design"].
 */
export function useDisclosure(id: string, anchors: readonly string[] = []) {
  const isOpenNow = useSyncExternalStore(
    subscribe,
    () => isOpen(id),
    () => false
  );
  // Until the visitor uses the control, changes are a restoration and do not animate.
  const [touched, setTouched] = useState(false);
  const [rested, setRested] = useState(false);

  // An address that names this region opens it, on arrival and on later changes.
  const anchorKey = anchors.join(" ");
  useEffect(() => {
    const names = anchorKey ? anchorKey.split(" ") : [];
    if (!names.length) return;
    const check = () => {
      if (names.includes(window.location.hash.slice(1))) setRegion(id, true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id, anchorKey]);

  const toggle = useCallback(() => {
    setTouched(true);
    setRested(false);
    setRegion(id, !isOpen(id));
  }, [id]);

  const instant = !touched;

  return {
    open: isOpenNow,
    toggle,
    button: { type: "button" as const, "aria-expanded": isOpenNow, "aria-controls": id, onClick: toggle },
    region: {
      id,
      open: isOpenNow,
      instant,
      // Open and no longer moving: stop clipping, so focus rings are whole.
      settled: isOpenNow && (instant || rested),
      onRest: () => setRested(true),
    },
  };
}

/** The region itself. Grows from nothing to its content's height; see .reveal in globals.css. */
export function Reveal({
  id,
  open: isOpenNow,
  instant,
  settled,
  onRest,
  label,
  children,
}: {
  id: string;
  open: boolean;
  instant: boolean;
  settled: boolean;
  onRest: () => void;
  /** Names the region for assistive technology. */
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="reveal"
      data-open={isOpenNow ? "true" : undefined}
      data-instant={instant ? "true" : undefined}
      data-settled={settled ? "true" : undefined}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "grid-template-rows") onRest();
      }}
    >
      <div id={id} role="region" aria-label={label} className="reveal__inner">
        {children}
      </div>
    </div>
  );
}
