"use client";

import { useEffect, useRef, useCallback } from "react";

type Stage = {
  labels: string[];
};

function parseStages(flow: string): Stage[] {
  return flow
    .split(" → ")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((stage) => ({
      labels: stage
        .split(/\s[\/·]\s/)
        .map((l) => l.trim())
        .filter(Boolean),
    }));
}

type FlowRevealProps = {
  flow: string;
};

export function FlowReveal({ flow }: FlowRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // each renderable item (stage or arrow) gets a ref
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const stages = parseStages(flow);

  // Build flat list: stage, arrow, stage, arrow, stage …
  const itemCount = stages.length * 2 - 1;

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const raw = (vh - rect.top) / (vh * 0.65);
    const progress = Math.max(0, Math.min(1, raw));

    const n = itemCount;
    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      const start = (i / (n + 1)) * 0.4;
      const end = ((i + 1) / (n + 1)) * 0.9;
      const p = Math.max(0, Math.min(1, (progress - start) / Math.max(end - start, 0.01)));
      item.style.opacity = String(0.25 + p * 0.75);
      item.style.transform = `translateX(${(1 - p) * -16}px)`;
    });
  }, [itemCount]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      itemRefs.current.forEach((item) => {
        if (!item) return;
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    itemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.opacity = "0.25";
      item.style.transform = "translateX(-16px)";
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

  const items: React.ReactNode[] = [];
  let refIndex = 0;

  stages.forEach((stage, stageIndex) => {
    const currentRef = refIndex;
    items.push(
      <div
        key={`stage-${stageIndex}`}
        ref={(el) => { itemRefs.current[currentRef] = el; }}
        className="flex items-center gap-3"
      >
        {stage.labels.map((label, labelIndex) => (
          <span key={label} className="flex items-center gap-3">
            {labelIndex > 0 && (
              <span className="font-brand text-[11px] text-[#C0BDB8]">·</span>
            )}
            <span className="font-brand text-[12px] uppercase tracking-[0.18em] text-[#141414] sm:text-[13px]">
              {label}
            </span>
          </span>
        ))}
      </div>
    );
    refIndex++;

    if (stageIndex < stages.length - 1) {
      const arrowRef = refIndex;
      items.push(
        <span
          key={`arrow-${stageIndex}`}
          ref={(el) => { itemRefs.current[arrowRef] = el; }}
          aria-hidden="true"
          className="font-sans text-[1rem] font-light text-[#C0BDB8]"
        >
          →
        </span>
      );
      refIndex++;
    }
  });

  return (
    <section ref={sectionRef} className="mt-20" aria-label="System flow">
      <p className="mb-6 font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
        Flow
      </p>
      <div
        role="img"
        aria-label={`Flow: ${flow}`}
        className="border-t border-b border-[#E8E6E2] py-10 sm:py-12"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {items}
        </div>
      </div>
    </section>
  );
}
