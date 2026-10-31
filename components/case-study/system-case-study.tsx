import type { SystemProject } from "@/content/systems";
import { DEMOS } from "@/components/demos/registry";
import { CaseHeader, CaseSection, NumberedList, Prose } from "@/components/case-study/parts";

/**
 * Template for engineering / automation work. Intentionally sparse until
 * evidence handoffs add `sections`; it states what the system covers and
 * nothing it can't yet back up.
 */
export function SystemCaseStudy({ project }: { project: SystemProject }) {
  const Demo = project.demo ? DEMOS[project.demo] : undefined;

  return (
    <article>
      <CaseHeader
        label={project.discipline}
        title={project.title}
        summary={project.summary}
        meta={[
          { term: "Discipline", detail: project.discipline },
          { term: "Tools", detail: project.tools?.join(", ") ?? "" },
          { term: "Case study", detail: project.sections?.length ? "Published" : "In preparation" },
        ].filter((item) => item.detail)}
      />

      {Demo ? (
        <div className="page mt-10 sm:mt-14">
          <Demo />
        </div>
      ) : null}

      <CaseSection label="Scope">
        <NumberedList items={project.scope} />
      </CaseSection>

      {project.workflows?.length ? (
        <CaseSection label="Workflows">
          <p className="max-w-[38rem] text-body text-ink-2 sm:text-lead">
            {project.workflows.length === 2 ? "Two" : project.workflows.length} distinct workflows share this entry.
            Each will be explained separately.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {project.workflows.map((workflow) => (
              <li key={workflow.name} className="rounded-[4px] border border-line px-4 py-4">
                <p className="text-body font-medium text-ink">{workflow.name}</p>
                {workflow.description ? <p className="mt-1 text-small text-ink-2">{workflow.description}</p> : null}
              </li>
            ))}
          </ul>
        </CaseSection>
      ) : null}

      {project.sections?.map((section) => (
        <CaseSection key={section.heading} label={section.heading}>
          <Prose paragraphs={section.body} />
        </CaseSection>
      ))}

      {!project.sections?.length ? (
        <CaseSection>
          <p className="max-w-[38rem] border-t border-line pt-5 text-small text-ink-2">
            A full write-up covering process, decisions, and documented results is in preparation.
          </p>
        </CaseSection>
      ) : null}
    </article>
  );
}
