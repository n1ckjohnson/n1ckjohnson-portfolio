type SectionHeadingProps = {
  id?: string;
  title: string;
  description: string;
  count: number;
};

export function SectionHeading({ id, title, description, count }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
      <div>
        <h2 id={id} className="text-body font-medium text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-small text-ink-2">{description}</p>
      </div>
      <p className="text-small tabular-nums text-ink-3" aria-label={`${count} projects`}>
        {String(count).padStart(2, "0")}
      </p>
    </div>
  );
}

export function IndexArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h9.5M8.5 4 12.5 8l-4 4" />
    </svg>
  );
}

export function indexNumber(i: number) {
  return String(i + 1).padStart(2, "0");
}
