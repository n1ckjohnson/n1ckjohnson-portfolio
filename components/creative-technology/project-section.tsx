import { demoFor } from "@/components/creative-technology/demos/registry";
import { TechnicalDetails } from "@/components/creative-technology/details";
import { CodeBlock } from "@/components/creative-technology/code-block";
import type { ProjectData } from "@/lib/creative-technology/projects";

/**
 * One project on the continuous page: its name, one sentence, the
 * demonstration, the code behind it, and technical details for anyone who
 * wants them. The section's id is its address: /creative-technology#<slug>.
 *
 * A project can have parts: a second system that grew out of it. Each part
 * follows the demonstration, with its own name and its own address.
 */
export function ProjectSection({ data }: { data: ProjectData }) {
  const { project } = data;
  const headingId = `${project.slug}-title`;

  return (
    <section id={project.slug} className="ct-section" aria-labelledby={headingId}>
      <header className="col">
        <h2 id={headingId} className="text-ink">
          {project.title}
        </h2>
        <p className="mt-1 text-ink-2">{project.line}</p>
      </header>

      <Body data={data} />

      {data.parts.map((part) => (
        <div key={part.project.slug} id={part.project.slug} className="ct-sub" aria-labelledby={`${part.project.slug}-title`}>
          <header className="col">
            <div className="ct-sub__head">
              <h3 id={`${part.project.slug}-title`} className="text-ink">
                {part.project.title}
              </h3>
              <p className="mt-1 text-ink-2">{part.project.line}</p>
            </div>
          </header>
          <Body data={part} />
        </div>
      ))}
    </section>
  );
}

function Body({ data }: { data: ProjectData }) {
  const { project } = data;
  const { Demo, Evidence, ownsCode } = demoFor(project.id);

  return (
    <>
      <div className="mt-8 sm:mt-10">
        <Demo {...data} />
      </div>

      {Evidence ? (
        <div className="mt-16 sm:mt-20">
          <Evidence {...data} />
        </div>
      ) : null}

      {!ownsCode && project.code.length ? (
        <div className="col mt-10 grid gap-4">
          {project.code.map((sample) => (
            <CodeBlock key={sample.key} sample={sample} />
          ))}
        </div>
      ) : null}

      <div className="col mt-10">
        <TechnicalDetails project={project} />
      </div>
    </>
  );
}
