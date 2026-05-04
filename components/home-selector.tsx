"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

const ITEMS_PER_PAGE = 6;

type HomeSelectorProps = {
  projects: Project[];
  thumbMap: Record<string, string | null>;
  logoSrc?: string | null;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

function DownArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ProjectCard({ project, thumbSrc }: { project: Project; thumbSrc: string | null }) {
  const imageSrc = thumbSrc ?? project.heroMedia?.src ?? null;

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative block overflow-hidden bg-[#1a1a1a] aspect-[16/9]"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={project.title}
          fill
          unoptimized={!!thumbSrc}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-60"
        />
      ) : (
        <div className="absolute inset-0 bg-[#181816] transition-opacity duration-300 group-hover:opacity-60" />
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="font-brand text-[11px] uppercase tracking-[0.18em] text-white">
          {project.title}
        </p>
      </div>
    </Link>
  );
}

export function HomeSelector({ projects, thumbMap, logoSrc }: HomeSelectorProps) {
  const gridRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(0);

  const pages = chunk(projects, ITEMS_PER_PAGE);
  const totalPages = pages.length;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
      else if (e.key === "ArrowRight") setPage((p) => Math.min(totalPages - 1, p + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [totalPages]);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="h-screen overflow-y-scroll" style={{ scrollSnapType: "y mandatory" }}>

      {/* ── Section 1: Intro ──────────────────────────────────── */}
      <section
        className="relative flex h-screen flex-col items-center justify-center px-5"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Logo / mark — centered above name */}
        <div className="mb-6 flex justify-center">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" aria-hidden="true" className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#141414]" aria-hidden="true" />
          )}
        </div>

        {/* Name label — static brackets, swappable inner text */}
        <div className="group/name inline-flex items-center font-brand text-[10px] uppercase tracking-[0.14em] text-[#141414] sm:text-[11px]">
          <span>[</span>
          <span className="relative mx-[0.5em]">
            <span className="invisible whitespace-nowrap">NICK JOHNSON</span>
            <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap transition-opacity duration-150 ease-linear group-hover/name:opacity-0">
              NICK JOHNSON
            </span>
            <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap opacity-0 transition-opacity duration-150 ease-linear group-hover/name:opacity-100">
              N1CKJOHNSON
            </span>
          </span>
          <span>]</span>
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-center font-sans text-[2.15rem] font-bold leading-[0.98] tracking-[-0.05em] text-[#141414] sm:text-[2.9rem] sm:leading-[0.95] sm:tracking-[-0.06em] lg:text-[3.15rem] xl:text-[3.3rem]">
          Designer for the<br />Jacksonville Jaguars.
        </h1>

        {/* Scroll indicator */}
        <button
          type="button"
          aria-label="Scroll to projects"
          onClick={scrollToGrid}
          className="mt-12 flex flex-col items-center cursor-pointer opacity-60 transition-opacity duration-200 hover:opacity-100 focus:outline-none"
        >
          <DownArrow />
        </button>
      </section>

      {/* ── Section 2: Project Grid ───────────────────────────── */}
      <section
        id="work"
        ref={gridRef}
        className="flex h-screen min-h-0 flex-col justify-start overflow-y-auto px-5 py-10 sm:justify-center sm:overflow-hidden sm:px-8 lg:px-14 xl:px-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="mx-auto w-full max-w-[92rem]">

          {/* ── Mobile: all projects, vertical scroll, no pagination ── */}
          <div className="sm:hidden">
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} thumbSrc={thumbMap[project.slug] ?? null} />
              ))}
            </div>
          </div>

          {/* ── Desktop: paginated horizontal slider ────────────────── */}
          <div className="hidden sm:block">
            {/* Slider — overflow hidden clips pages not in view */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {pages.map((pageProjects, pageIndex) => (
                  <div key={pageIndex} className="min-w-full shrink-0">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pageProjects.map((project) => (
                        <ProjectCard key={project.slug} project={project} thumbSrc={thumbMap[project.slug] ?? null} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination controls — only shown when more than 1 page */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                {/* Prev arrow */}
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 text-[#BBBBBB] transition-colors duration-150 hover:text-[#141414] disabled:opacity-0 focus:outline-none"
                >
                  <ChevronLeft />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Page ${i + 1}`}
                      onClick={() => setPage(i)}
                      className={`rounded-full transition-all duration-200 focus:outline-none ${
                        i === page
                          ? "h-1.5 w-4 bg-[#141414]"
                          : "h-1.5 w-1.5 bg-[#CCCCCC] hover:bg-[#888888]"
                      }`}
                    />
                  ))}
                </div>

                {/* Next arrow */}
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-1.5 text-[#BBBBBB] transition-colors duration-150 hover:text-[#141414] disabled:opacity-0 focus:outline-none"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
