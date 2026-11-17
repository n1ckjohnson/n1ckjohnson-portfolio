"use client";

import type { ReactNode } from "react";
import { Reveal, useDisclosure } from "@/components/site/disclosure";

/**
 * "More creative projects": the design work, closed until asked for.
 *
 * The heading is the control. Closed, it is one line and a chevron. Open,
 * the chevron turns and the grid of projects is shown under it. A link to
 * /#design (the way back from a case study) arrives with it already open.
 */
export function MoreProjects({ title, children }: { title: string; children: ReactNode }) {
  const { button, region } = useDisclosure("design-work", ["design", "design-work"]);

  return (
    <>
      <h2>
        <button {...button} className="fold">
          <span>{title}</span>
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </button>
      </h2>
      <Reveal {...region} label={title}>
        {children}
      </Reveal>
    </>
  );
}
