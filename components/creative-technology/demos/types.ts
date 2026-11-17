import type { ComponentType } from "react";
import type { ProjectData } from "@/lib/creative-technology/projects";

/** What every demonstration receives. Already filtered for the audience. */
export type DemoProps<Demo = unknown> = ProjectData<Demo>;

export type DemoEntry = {
  /** The centrepiece: the interactive demonstration of the system. */
  // Each demonstration narrows the configuration type for itself.
  Demo: ComponentType<DemoProps<any>>;
  /** Optional figures shown after the prose. */
  Evidence?: ComponentType<DemoProps<any>>;
  /**
   * True when the demonstration draws the project's code itself, so it can
   * light up lines step by step. Otherwise the section shows it after the demo.
   */
  ownsCode?: boolean;
};
