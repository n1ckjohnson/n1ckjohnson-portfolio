"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface WorkNavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

// Wraps Next.js Link with an onClick that resets scroll position before
// the route transition, so the incoming case study always starts at the top.
export function WorkNavLink({ href, className, children }: WorkNavLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => window.scrollTo(0, 0)}
    >
      {children}
    </Link>
  );
}
