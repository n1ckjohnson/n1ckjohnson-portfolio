import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The quiet link back up one level. On a wide screen it sits in the left
 * margin, level with the title, so every page's title starts at the same
 * height. On a phone it stacks above the title.
 */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="back">
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 8H3.5M7.5 4 3.5 8l4 4" />
      </svg>
      <span>{children}</span>
    </Link>
  );
}

/**
 * The top of every page below the homepage: a way back, the page's name and
 * one grey line beneath it. Nothing here is larger than a step above body.
 */
export function PageHead({
  back,
  title,
  subtitle,
}: {
  back: { href: string; label: string };
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="page-head">
      <nav aria-label="Back" className="page-head__back">
        <BackLink href={back.href}>{back.label}</BackLink>
      </nav>
      <header className="col">
        <h1 className="text-title text-ink">{title}</h1>
        {subtitle ? <p className="text-ink-2">{subtitle}</p> : null}
      </header>
    </div>
  );
}
