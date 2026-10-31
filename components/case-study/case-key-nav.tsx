"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * ← / → move between case studies. Steps aside whenever something else
 * owns the arrow keys: form controls, open dialogs, interactive demos.
 */
export function CaseKeyNav({ prevHref, nextHref }: { prevHref: string; nextHref: string }) {
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (document.querySelector("dialog[open]")) return;

      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable], [role=radiogroup], [role=slider], [data-owns-arrows]")) return;

      router.push(event.key === "ArrowLeft" ? prevHref : nextHref);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, router]);

  return null;
}
