import type { ReactNode } from "react";

/**
 * Shared shell for interactive demonstrations inside case studies:
 * a quiet surface for the demo and a caption that says exactly what
 * the viewer is looking at.
 */
export function DemoFrame({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-[6px] bg-surface">{children}</div>
      <figcaption className="mt-3 grid gap-1 text-small sm:grid-cols-12 sm:gap-6">
        <span className="font-medium text-ink sm:col-span-3">{title}</span>
        <span className="max-w-[44rem] text-ink-2 sm:col-span-9">{caption}</span>
      </figcaption>
    </figure>
  );
}
