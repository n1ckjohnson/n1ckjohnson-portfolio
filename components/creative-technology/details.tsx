import type { ProjectView } from "@/content/creative-technology/types";

/**
 * The longer technical account, closed until asked for. A native
 * disclosure: it works without script, it is searchable in the page, and
 * it keeps the reading flow short. The code is not in here: it is shown in
 * the flow, next to the demonstration it explains.
 */
export function TechnicalDetails({ project }: { project: ProjectView }) {
  return (
    <details className="details">
      <summary>
        <span>Technical details</span>
        <span className="details__icon" aria-hidden="true" />
      </summary>

      <div className="details__body text-small">
        <p>{project.summary}</p>
        {project.statusNote ? <p className="mt-2 text-ink-2">{project.statusNote}</p> : null}

        {project.pipeline?.length ? (
          <>
            <h3>How a run works</h3>
            <ol className="details__list details__steps">
              {project.pipeline.map((step) => (
                <li key={step.label}>
                  <span className="text-ink">{step.label}.</span> <span className="text-ink-2">{step.detail}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        <div className="mt-7 grid gap-x-8 sm:grid-cols-2">
          <div>
            <h3>Automated</h3>
            <ul className="details__list">
              {project.automated.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-7 sm:mt-0">
            <h3>Designer-controlled</h3>
            <ul className="details__list">
              {project.designerControlled.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3>Built with</h3>
        <p className="mt-1.5">{project.stack.join(", ")}</p>

        {project.facts.length ? (
          <>
            <h3>Verified</h3>
            <ul className="details__list">
              {project.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </details>
  );
}
