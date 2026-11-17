/**
 * Content model for the Creative Technology projects.
 *
 * Every project is a section of one continuous page, addressed as
 * /creative-technology#<slug>. The same data drives the internal preview
 * and the public site; the only difference is which facts and media each
 * audience may see.
 *
 * Rules that keep this honest:
 * - `status` says exactly how far a system has got. Never round up.
 * - Copy marked `tier: "internal"` is removed from public builds on the
 *   server, before anything reaches the browser.
 * - Media is referenced by asset id and resolved through the approval-aware
 *   manifest (content/creative-technology/media.json).
 * - Code is either an excerpt of the working source or written for the page
 *   to show documented logic, and it always says which.
 */

export type Status = "production" | "production-tested" | "built" | "architecture" | "in-development";

export const STATUS_LABEL: Record<Status, string> = {
  production: "In production",
  "production-tested": "Production-tested",
  built: "Built",
  architecture: "Architecture designed",
  "in-development": "In development",
};

export type Tier = "public" | "internal";

/** A statement the page makes about a system, with where it comes from. */
export type Fact = {
  text: string;
  /** "brief": supplied by the owner. "evidence": confirmed in the local project. */
  basis: "brief" | "evidence";
  /** Internal facts never ship in a public build. Defaults to public. */
  tier?: Tier;
};

export type PipelineStep = {
  label: string;
  detail: string;
};

export type CodeLanguage = "json" | "js" | "ts" | "py" | "text";

export type CodeSample = {
  /** Lets a demonstration pick out one sample, e.g. "data". */
  key: string;
  /** Shown above the code: a file name, or a few words. */
  title: string;
  language: CodeLanguage;
  /**
   * "excerpt": taken from the working source. Names may be shortened and
   * private values replaced, never the logic.
   * "illustrative": written for the page to show documented behaviour.
   */
  origin: "excerpt" | "illustrative";
  code: string;
  /** One short line under the code, only where it helps. */
  note?: string;
  /**
   * Lines a demonstration can pick out while it runs, by step.
   * 1-based, inclusive: { "names": [[4, 9]] }.
   */
  marks?: Record<string, [number, number][]>;
};

export type Project<Demo = unknown> = {
  /** Stable key. Also names the demonstration (see demos/registry). */
  id: string;
  /** The section's address: /creative-technology#<slug>. */
  slug: string;
  /** Position on the page and in every list, 1-based. */
  order: number;
  /**
   * Shown as a part of another project's section, after its demonstration,
   * rather than as a section of its own. The id of that project.
   */
  parent?: string;
  /** The concise name used everywhere, sentence case. */
  title: string;
  /** One concise sentence saying what was built. Sits under the name. */
  line: string;
  /** One or two sentences. Opens the technical details. */
  summary: string;
  status: Status;
  /** When the work was done. */
  year: string;
  /** Qualifies the status. Internal by default: it usually cites dates or runs. */
  statusNote?: Fact;
  stack: string[];
  /** What the system does without a designer touching it. */
  automated: string[];
  /** What stays a human, editable decision. */
  designerControlled: string[];
  /** Longer account, kept for the technical details. */
  detail: string[];
  pipeline?: PipelineStep[];
  facts: Fact[];
  /** Shown in the reading flow, beside or under the demonstration. */
  code: CodeSample[];
  /** Manifest id prefix for this project's media, e.g. "injury-report/". */
  mediaPrefix: string;
  /** Configuration for the demonstration. */
  demo: Demo;
  /**
   * Publication approval for the section's copy. Media is approved per
   * asset in the manifest; a project whose copy is not approved is left out
   * of public builds entirely.
   */
  publication: { copy: "approved" | "pending"; note?: string };
};

/** A project as a component receives it: already filtered for the audience. */
export type ProjectView<Demo = unknown> = Omit<Project<Demo>, "facts" | "statusNote" | "publication"> & {
  facts: string[];
  statusNote?: string;
  statusLabel: string;
};
