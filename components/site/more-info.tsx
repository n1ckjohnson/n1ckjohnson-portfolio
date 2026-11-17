"use client";

import type { ReactNode } from "react";
import { Reveal, useDisclosure } from "@/components/site/disclosure";

/**
 * "More info": the rest of the introduction, opened in place.
 *
 * The control sits directly under the opening sentence. When the region
 * opens, the control is carried down to the end of it and reads "Less
 * info", so the text is read in order and closed from where it ends.
 */
export function MoreInfo({ children }: { children: ReactNode }) {
  const { open, button, region } = useDisclosure("more-info", ["more-info", "about"]);

  return (
    <>
      <Reveal {...region} label="More about Nick Johnson">
        {children}
      </Reveal>
      <p className="mt-4">
        <button {...button} className="more">
          {open ? "Less info" : "More info"}
        </button>
      </p>
    </>
  );
}
