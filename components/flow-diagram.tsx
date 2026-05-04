type Stage = {
  labels: string[];
};

function parseStages(flow: string): Stage[] {
  return flow
    .split(" → ")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((stage) => ({
      labels: stage
        .split(/\s[\/·]\s/)
        .map((l) => l.trim())
        .filter(Boolean)
    }));
}

export function FlowDiagram({ flow }: { flow: string }) {
  const stages = parseStages(flow);

  const items: React.ReactNode[] = [];

  stages.forEach((stage, stageIndex) => {
    items.push(
      <div key={`stage-${stageIndex}`} className="flex items-center gap-3">
        {stage.labels.map((label, labelIndex) => (
          <span key={label} className="flex items-center gap-3">
            {labelIndex > 0 && (
              <span className="font-brand text-[11px] text-[#C0BDB8]">·</span>
            )}
            <span className="font-brand text-[12px] uppercase tracking-[0.18em] text-[#141414] sm:text-[13px]">
              {label}
            </span>
          </span>
        ))}
      </div>
    );

    if (stageIndex < stages.length - 1) {
      items.push(
        <span
          key={`arrow-${stageIndex}`}
          aria-hidden="true"
          className="font-sans text-[1rem] font-light text-[#C0BDB8]"
        >
          →
        </span>
      );
    }
  });

  return (
    <div
      role="img"
      aria-label={`Flow: ${flow}`}
      className="border-t border-b border-[#E8E6E2] py-10 sm:py-12"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {items}
      </div>
    </div>
  );
}
