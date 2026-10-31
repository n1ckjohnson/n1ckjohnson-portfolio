import { projects, type Project } from "@/content/projects";
import { systems, type SystemProject } from "@/content/systems";

/**
 * Single source of truth for what is public, in what order, and how
 * entries link to one another. Systems lead; creative work follows.
 * Archived entries keep their data but never appear here.
 */

export type Entry =
  | { kind: "system"; slug: string; title: string; label: string; project: SystemProject }
  | { kind: "creative"; slug: string; title: string; label: string; project: Project };

/** "CAMPAIGN SYSTEM" → "Campaign system" */
function sentenceCase(value: string) {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const systemEntries: Entry[] = systems
  .filter((p) => p.status !== "archived")
  .map((project) => ({
    kind: "system",
    slug: project.slug,
    title: project.title,
    label: project.discipline,
    project,
  }));

export const creativeEntries: Entry[] = projects
  .filter((p) => p.status !== "archived")
  .map((project) => ({
    kind: "creative",
    slug: project.slug,
    title: project.title,
    label: sentenceCase(project.type),
    project,
  }));

export const publicEntries: Entry[] = [...systemEntries, ...creativeEntries];

export function getEntry(slug: string): Entry | undefined {
  return publicEntries.find((entry) => entry.slug === slug);
}

/** Previous / next within the full public sequence, looping at the ends. */
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
