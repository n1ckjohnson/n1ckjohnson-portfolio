import { projects } from "@/content/creative-technology";
import { STATUS_LABEL, type Fact, type Project, type ProjectView } from "@/content/creative-technology/types";
import { getAudience } from "@/lib/creative-technology/audience";
import { resolvePrefix, type MediaMap } from "@/lib/creative-technology/media";

/**
 * Assembles what the Creative Technology page needs, filtered for the build
 * audience. This is the single place where internal-tier copy and unapproved
 * media are removed, so nothing a public visitor may not see is ever
 * serialized into a page or its scripts. Server-only.
 */

/** What a list of projects needs: the homepage, the table of contents. */
export type ProjectSummary = {
  slug: string;
  href: string;
  title: string;
};

/** Everything one project's section needs. */
export type ProjectData<Demo = unknown> = {
  project: ProjectView<Demo>;
  /** Media by asset id. `null` means this build may not show that asset. */
  media: MediaMap;
  /** True when this build may show media that is not approved for publication. */
  internal: boolean;
  /** Parts of this project, shown inside its section. */
  parts: ProjectData[];
};

export const CREATIVE_TECHNOLOGY_PATH = "/creative-technology";

/** Every project is a section of one page. */
export function projectHref(slug: string) {
  return `${CREATIVE_TECHNOLOGY_PATH}#${slug}`;
}

function allowed(fact: Fact | undefined, internal: boolean): fact is Fact {
  return Boolean(fact) && (internal || fact?.tier !== "internal");
}

function toView(project: Project, internal: boolean): ProjectView {
  const { facts, statusNote, publication: _publication, ...rest } = project;
  return {
    ...rest,
    facts: facts.filter((fact) => allowed(fact, internal)).map((fact) => fact.text),
    statusNote: allowed(statusNote, internal) ? statusNote.text : undefined,
    statusLabel: STATUS_LABEL[project.status],
  };
}

/** Projects this build may show, in page order. */
function visible(): Project[] {
  const internal = getAudience() === "internal";
  return projects.filter((project) => internal || project.publication.copy === "approved");
}

export function listProjects(): ProjectSummary[] {
  return visible()
    .filter((project) => !project.parent)
    .map((project) => ({ slug: project.slug, href: projectHref(project.slug), title: project.title }));
}

/** Every section of the page, in order. */
export function listProjectData(): ProjectData[] {
  const internal = getAudience() === "internal";
  const all = visible();
  const data = (project: Project): ProjectData => ({
    project: toView(project, internal),
    media: resolvePrefix(project.mediaPrefix),
    internal,
    parts: all.filter((candidate) => candidate.parent === project.id).map(data),
  });
  return all.filter((project) => !project.parent).map(data);
}
