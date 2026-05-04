"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  // Disable browser scroll restoration once on mount so it can't
  // override the manual scroll-to-top on client-side route changes.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // setTimeout(0) defers until after Next.js finishes its own scroll
    // handling for the route transition, and works even in throttled
    // background-tab contexts where requestAnimationFrame is suspended.
    const id = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
