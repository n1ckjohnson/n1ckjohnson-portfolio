"use client";

import { useEffect, useRef, useCallback } from "react";

type DecisionsRevealProps = {
  decisions: string[];
};

export function DecisionsReveal({ decisions }: DecisionsRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    const section = sectionRef.current;
    const list = listRef.current;
    if (!section || !list) return;

    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    // Progress: 0 when section top hits viewport bottom, 1 when it's 20% from top
    const raw = (vh - rect.top) / (vh * 0.8);
    const progress = Math.max(0, Math.min(1, raw));

    // Clip container from bottom: progress 0 = fully clipped, 1 = fully open
    const clipPct = (1 - progress) * 100;
    list.style.clipPath = `inset(0 0 ${clipPct.toFixed(2)}% 0)`;

    // Each row: reveal in sequence as container opens
    const n = decisions.length;
    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      // stagger so row i fully visible by the time progress reaches (i+1)/(n+1)
      const threshold = (i / n) * 0.85;
      const p = Math.max(0, Math.min(1, (progress - threshold) / Math.max(0.3, 0.85 / n)));
      item.style.opacity = String(0.3 + p * 0.7);
      item.style.transform = `translateY(${(1 - p) * 8}px)`;
    });
  }, [decisions.length]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const list = listRef.current;

    if (prefersReduced) {
      if (list) list.style.clipPath = "none";
      itemRefs.current.forEach((item) => {
        if (!item) return;
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    if (list) {
      list.style.clipPath = "inset(0 0 100% 0)";
      list.style.willChange = "clip-path";
    }
    itemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.opacity = "0.3";
      item.style.transform = "translateY(8px)";
      item.style.willChange = "opacity, transform";
    });

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  return (
    <section ref={sectionRef} className="mt-20" aria-label="Decisions">
      <p className="mb-6 font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
        Decisions
      </p>
      <ol ref={listRef}>
        {decisions.map((decision, index) => (
          <li
            key={decision}
            ref={(el) => { itemRefs.current[index] = el; }}
            className="flex items-start gap-8 border-t border-[#E8E6E2] py-6 last:border-b sm:gap-10 sm:py-8"
          >
            <span className="min-w-[2.5rem] pt-[0.1rem] font-brand text-[1.1rem] font-light tabular-nums leading-none text-[#C8C5C0] sm:text-[1.25rem]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="font-sans text-[1rem] font-medium leading-[1.6] tracking-[-0.02em] text-[#444444]">
              {decision}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
