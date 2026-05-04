"use client";

import { useEffect } from "react";

// Locks document-level scroll so pages that use h-[100svh] don't
// accidentally become scrollable when the sticky nav pushes content down.
export function ScrollLock() {
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);
  return null;
}
