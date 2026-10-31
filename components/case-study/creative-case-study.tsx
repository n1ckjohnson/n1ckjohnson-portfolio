import type { Project } from "@/content/projects";
import { CREATIVE_LAYOUTS, DEFAULT_LAYOUT } from "@/content/creative-layouts";
import { findMedia, mediaItem, workDir } from "@/lib/media";
import { Media } from "@/components/media/media";
import { MediaBlockView } from "@/components/case-study/media-block";
import { CaseHeader, CaseSection, FlowSequence, NumberedList, Prose } from "@/components/case-study/parts";

/**
 * Template for the original creative case studies. Content comes straight
 * from content/projects.ts; media arrangement from content/creative-layouts.ts.
 */
export function CreativeCaseStudy({ project, label }: { project: Project; label: string }) {
  const { slug, title } = project;
  const hero = findMedia(workDir(slug), "hero") ?? (project.heroMedia ? mediaItem(project.heroMedia.src) : null);
  const layout = CREATIVE_LAYOUTS[slug] ?? DEFAULT_LAYOUT;

  return (
    <article>
      <CaseHeader
        label={label}
        title={title}
        summary={project.summary}
        meta={[
          { term: "Role", detail: project.role },
          { term: "Collaborators", detail: project.collaborators },
          { term: "Channels", detail: project.channels },
        ].filter((item) => item.detail)}
      />

      {hero ? (
        <div className="page mt-10 sm:mt-14">
          <div className="overflow-hidden rounded-[4px] bg-surface">
            <Media item={hero} alt={project.heroMedia?.alt ?? `${title} — hero`} priority />
          </div>
        </div>
      ) : null}

      <CaseSection label="Overview">
        <Prose paragraphs={project.opening.split("\n").filter(Boolean)} />
      </CaseSection>

      <MediaBlockView block={layout.mid} slug={slug} title={title} />

      {project.decisions.length > 0 ? (
        <CaseSection label="Decisions">
          <NumberedList items={project.decisions} />
        </CaseSection>
      ) : null}

      {project.flow ? (
        <CaseSection label="Flow">
          <FlowSequence flow={project.flow} />
        </CaseSection>
      ) : null}

      {project.outcome.length > 0 ? (
        <CaseSection label="Outcome">
          <Prose paragraphs={project.outcome} />
        </CaseSection>
      ) : null}

      <MediaBlockView block={layout.bottom} slug={slug} title={title} />

      {project.optionalExtension ? (
        <CaseSection>
          <Prose paragraphs={[project.optionalExtension]} />
        </CaseSection>
      ) : null}

      <MediaBlockView block={layout.closing} slug={slug} title={title} />
    </article>
  );
}
