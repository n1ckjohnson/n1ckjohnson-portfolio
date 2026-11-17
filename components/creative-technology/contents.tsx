"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { BackLink } from "@/components/site/page-head";
import type { ProjectSummary } from "@/lib/creative-technology/projects";

/**
 * The table of contents for the Creative Technology page.
 *
 * On a wide screen it sits in the left margin, fixed to the window, and
 * marks the project being read. It takes no space in the layout, so the
 * reading column stays centred. On a phone it is not shown: the page is
 * simply scrolled.
 *
 * - Which project is current comes from an IntersectionObserver watching a
 *   thin band of the window, not from scroll offsets, so it stays right
 *   through resizes, pinned stages and late-loading media.
 * - The links are ordinary fragment links, recorded in history so Back
 *   returns to where the visitor was. A long jump covers most of the way at
 *   once and glides only the last half screen, so it is quick, still reads
 *   as movement, and does not play every demonstration it passes. With
 *   reduced motion it is a plain jump.
 * - As the page is read, the address follows the current project without
 *   adding history entries, so a reload or a copied link lands in the same
 *   place.
 */
export function Contents({ items, back }: { items: ProjectSummary[]; back: { href: string; label: string } }) {
  const [current, setCurrent] = useState<string | null>(null);

  const jump = (event: MouseEvent<HTMLAnchorElement>, slug: string) => {
    const target = document.getElementById(slug);
    if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - margin;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const near = window.innerHeight * 0.5;
    if (!still && Math.abs(top - window.scrollY) > near) {
      window.scrollTo({ top: top - Math.sign(top - window.scrollY) * near, behavior: "instant" });
    }
    window.scrollTo({ top, behavior: still ? "instant" : "smooth" });
    window.history.pushState(window.history.state, "", `#${slug}`);
    setCurrent(slug);
  };

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.slug)).filter((node): node is HTMLElement => Boolean(node));
    if (!sections.length) return;

    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const found = items.find((item) => inBand.has(item.slug))?.slug;
        if (found) {
          setCurrent(found);
          return;
        }
        // Between two projects the last one read stays marked. Above the
        // first one, nothing is.
        const band = window.innerHeight * 0.34;
        if (sections[0].getBoundingClientRect().top > band) setCurrent(null);
      },
      // A band a third of the way down the window: what the eye is on.
      { rootMargin: "-34% 0px -64% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Keep the address on the project being read. Replaces, never pushes.
  useEffect(() => {
    const hash = current ? `#${current}` : "";
    if (window.location.hash === hash) return;
    // Arriving from a link, the address already names a project further
    // down: leave it alone until the page has got there.
    const named = document.getElementById(window.location.hash.slice(1));
    if (!current && named) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${hash}`);
  }, [current]);

  return (
    <nav className="toc" aria-label="Projects">
      <BackLink href={back.href}>{back.label}</BackLink>
      <ol className="toc__list">
        {items.map((item) => (
          <li key={item.slug}>
            <a href={`#${item.slug}`} aria-current={current === item.slug ? "true" : undefined} onClick={(event) => jump(event, item.slug)}>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
