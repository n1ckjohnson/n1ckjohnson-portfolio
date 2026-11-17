import { projects, type Project } from "@/content/projects";

/**
 * The design portfolio: what is public, in what order, and how entries link
 * to one another. Archived entries keep their data but never appear here.
 *
 * Creative Technology projects have their own model and routes, see
 * lib/creative-technology/projects.ts.
 */

export type Entry = { slug: string; title: string; label: string; project: Project };

/** "CAMPAIGN SYSTEM" → "Campaign system" */
function sentenceCase(value: string) {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const publicEntries: Entry[] = projects
  .filter((project) => project.status !== "archived")
  .map((project) => ({
    slug: project.slug,
    title: project.title,
    label: sentenceCase(project.type),
    project,
  }));

export function getEntry(slug: string): Entry | undefined {
  return publicEntries.find((entry) => entry.slug === slug);
}

/** Previous / next within the design portfolio, looping at the ends. */
export function getNeighbors(slug: string) {
  const index = publicEntries.findIndex((entry) => entry.slug === slug);
  const count = publicEntries.length;
  return {
    prev: publicEntries[(index - 1 + count) % count],
    next: publicEntries[(index + 1) % count],
  };
}

export function workHref(slug: string) {
  return `/work/${slug}`;
}
