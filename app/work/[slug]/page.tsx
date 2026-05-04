import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { WorkNavLink } from "@/components/work-nav-link";
import { ImageSlot } from "@/components/image-slot";
import { MediaAsset } from "@/components/media-asset";
import { SupportMedia } from "@/components/support-media";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlowReveal } from "@/components/flow-reveal";
import {
  detectHeroSrc,
  detectBreakSrc,
  detectBreak2Src,
  detectSupportSrcs,
  detectSupportGroups,
  detectLaunchSrcs,
  detectCommunicationSrcs,
  detectSmallMarketSrcs,
  detectEmailSupportSrcs,
  detectAboutUsSrcs,
} from "@/lib/detect-media";
import { CaseStudyKeyNav } from "@/components/case-study-key-nav";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Nick Johnson`,
    description: project.summary,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const openingParagraphs = project.opening.split("\n").filter(Boolean);

  // Auto-detect media — detectHeroSrc takes priority for mtime cache-busting
  const heroSrc = detectHeroSrc(project.slug) ?? project.heroMedia?.src ?? null;
  const breakSrc = project.breakMedia?.src ?? detectBreakSrc(project.slug);
  const supportGroups = detectSupportGroups(project.slug);
  const supportSrcs = supportGroups ? [] : detectSupportSrcs(project.slug);
  const launchSrcs = detectLaunchSrcs(project.slug);
  const communicationSrcs = detectCommunicationSrcs(project.slug);

  // Slug flags for custom layouts
  const isSocialContent = project.slug === "social-content-systems";
  const isProwler = project.slug === "prowler-throwback";
  const isLondon = project.slug === "london-series-2026";
  const isSmallMarket = project.slug === "small-market-team";
  const isSeasonTickets = project.slug === "season-tickets-2025";
  const isFOTY = project.slug === "fan-of-the-year";
  const isNFLDraft = project.slug === "nfl-draft-creative";

  // ── NFL Draft second break
  const break2Src = isNFLDraft ? detectBreak2Src(project.slug) : null;

  // ── Small Market bottom: small-market-* images with label
  const smallMarketSrcs = isSmallMarket ? detectSmallMarketSrcs(project.slug) : [];
  const smallMarketGroups = isSmallMarket
    ? [{ label: "Small Market Team", srcs: smallMarketSrcs }]
    : null;

  // ── FOTY mid: support images with label
  const fotySupportGroups = isFOTY
    ? [{ label: "FOTY Social Creative", srcs: supportSrcs }]
    : null;

  // ── FOTY bottom: email-support-* images with label
  const fotyEmailSrcs = isFOTY ? detectEmailSupportSrcs(project.slug) : [];
  const fotyEmailGroups = isFOTY
    ? [{ label: "FOTY Email Creative", srcs: fotyEmailSrcs }]
    : null;

  // Prev / next navigation
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  // ── Prowler mid: support images with label
  const prowlerSupportGroups = isProwler
    ? [{ label: "2025 Throwback Social Creative", srcs: supportSrcs }]
    : null;

  // ── London mid: support images with label
  const londonSupportGroups = isLondon
    ? [{ label: "2025 London Game Social Creative", srcs: supportSrcs }]
    : null;

  // ── London bottom: communication images with label
  const londonCommunicationGroups = isLondon
    ? [{ label: "2026 London Games Communication", srcs: communicationSrcs }]
    : null;

  // ── Prowler bottom: about-us + launch images with labels
  const aboutUsSrcs = isProwler ? detectAboutUsSrcs(project.slug) : [];
  const prowlerBottomGroups: { label: string; srcs: string[] }[] = isProwler
    ? [
        ...(aboutUsSrcs.length > 0 ? [{ label: "It's About Us Campaign", srcs: aboutUsSrcs }] : []),
        { label: "2024 Prowler Throwback Website Takeover", srcs: launchSrcs },
      ]
    : [];
  const prowlerLaunchGroups = isProwler
    ? prowlerBottomGroups
    : null;

  return (
    <article>
      <CaseStudyKeyNav
        prevSlug={prevProject?.slug ?? null}
        nextSlug={nextProject?.slug ?? null}
      />

      {/* ── Hero — sticky ──────────────────────────────────────── */}
      <div className="sticky top-12 z-0">
        {heroSrc ? (
          <MediaAsset
            src={heroSrc}
            alt={project.heroMedia?.alt ?? `${project.title} — hero`}
            width={project.heroMedia?.width}
            height={project.heroMedia?.height}
            priority
          />
        ) : (
          <div className="w-full h-[260px] sm:h-[42vh] sm:max-h-[420px] sm:min-h-[260px] bg-[#181816]" />
        )}
      </div>

      {/* ── Single continuous white layer over hero ────────────── */}
      <div className="relative z-10 w-full bg-white">

        {/* ── Part 1: Header + Opening ────────────────────────── */}
        <div className="mx-auto w-full max-w-[72rem] px-5 pb-14 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <header>
            <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
              [ {project.type} ]
            </p>
            <h1 className="mt-5 max-w-[22ch] font-sans text-[2.28rem] font-bold leading-[0.95] tracking-[-0.06em] text-[#141414] sm:text-[2.9rem] lg:text-[3.15rem] xl:text-[3.4rem]">
              {project.title}
            </h1>
            <p className="mt-6 max-w-[42rem] font-sans text-[1rem] leading-[1.6] tracking-[-0.01em] text-[#444444]">
              {project.summary}
            </p>
            <div className="mt-10 border-t border-[#E8E6E2] pt-7 lg:mt-12 lg:pt-8">
              <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                <span className="text-[#A0A09A]">Collaborators</span>
                <span className="mx-3 text-[#E8E6E2]">·</span>
                {project.collaborators}
              </p>
            </div>
          </header>

          <ScrollReveal>
            <section className="mt-20" aria-label="Opening">
              <div className="max-w-[42rem] space-y-4">
                {openingParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="font-sans text-[1rem] leading-[1.6] tracking-[-0.01em] text-[#444444]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </div>

        {/* ── Mid-page slot ───────────────────────────────────────
             Prowler:         support images (labeled, 3 cols)
             London:          support images (labeled, 3 cols)
             Social:          support grid (4 cols)
             Small Market:    support groups (Playoff Social Creative + Grassroots)
             Season Tickets:  support images (3 cols, no break)
             FOTY:            support images (labeled FOTY Social Creative, 3 cols)
             Default:         full-bleed break image               */}
        {isProwler ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={prowlerSupportGroups ?? undefined}
                groupColClass="grid-cols-3"
              />
            </ScrollReveal>
          </div>
        ) : isLondon ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={londonSupportGroups ?? undefined}
                groupColClass="grid-cols-3"
              />
            </ScrollReveal>
          </div>
        ) : isSocialContent ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                srcs={supportSrcs}
                groups={supportGroups ?? undefined}
                groupColClass="grid-cols-2 sm:grid-cols-4"
              />
            </ScrollReveal>
          </div>
        ) : isSmallMarket ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={supportGroups ?? undefined}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          </div>
        ) : isSeasonTickets ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                srcs={supportSrcs}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          </div>
        ) : isFOTY ? (
          <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={fotySupportGroups ?? undefined}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          </div>
        ) : isNFLDraft ? (
          <>
            <div className="mx-auto w-full max-w-[72rem] px-5 pb-6 sm:px-6 lg:px-8">
              <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                [ Draft Education Slider ]
              </p>
            </div>
            <ScrollReveal>
              {breakSrc ? (
                <MediaAsset
                  src={breakSrc}
                  alt={project.breakMedia?.alt ?? `${project.title} — draft education slider`}
                  width={project.breakMedia?.width}
                  height={project.breakMedia?.height}
                />
              ) : (
                <ImageSlot aspect="aspect-[21/9]" sizes="100vw" />
              )}
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal>
            {breakSrc ? (
              <MediaAsset
                src={breakSrc}
                alt={project.breakMedia?.alt ?? `${project.title} — campaign visual`}
                width={project.breakMedia?.width}
                height={project.breakMedia?.height}
              />
            ) : (
              <ImageSlot aspect="aspect-[21/9]" sizes="100vw" />
            )}
          </ScrollReveal>
        )}

        {/* ── Part 2: Decisions → Outcome ─────────────────────── */}
        <div className="mx-auto w-full max-w-[72rem] px-5 pb-28 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40">

          <section className="mt-20" aria-label="Decisions">
            <p className="mb-6 font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
              Decisions
            </p>
            <ol>
              {project.decisions.map((decision, index) => (
                <li
                  key={decision}
                  className="flex items-start gap-8 border-t border-[#E8E6E2] py-6 last:border-b sm:gap-10 sm:py-8"
                >
                  <span className="min-w-[2.5rem] pt-[0.1rem] font-brand text-[1.1rem] font-light tabular-nums leading-none text-[#C8C5C0] sm:text-[1.25rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-sans text-[1rem] font-medium leading-[1.6] tracking-[-0.02em] text-[#444444]">
                    {decision}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <FlowReveal flow={project.flow} />

          <ScrollReveal>
            <section className="mt-20" aria-label="Outcome">
              <p className="mb-6 font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                Outcome
              </p>
              <div className="max-w-[42rem]">
                <p className="font-sans text-[1rem] font-medium leading-[1.6] tracking-[-0.01em] text-[#444444]">
                  {project.outcome[0]}
                </p>
                {project.outcome.slice(1).length > 0 && (
                  <div className="mt-4 space-y-4">
                    {project.outcome.slice(1).map((paragraph) => (
                      <p
                        key={paragraph}
                        className="font-sans text-[1rem] leading-[1.6] tracking-[-0.01em] text-[#444444]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>

          {/* ── Bottom media slot ─────────────────────────────────
               Prowler:         launch images (labeled, 3 cols)
               London:          communication images (labeled, 3 cols)
               Social:          break image
               Small Market:    small-market-* images (labeled, 3 cols)
               Season Tickets:  nothing (support already in mid)
               FOTY:            email-support-* images (labeled, 3 cols)
               Default:         support images                    */}
          {isProwler ? (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={prowlerLaunchGroups ?? undefined}
                groupColClass="grid-cols-3"
              />
            </ScrollReveal>
          ) : isLondon ? (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={londonCommunicationGroups ?? undefined}
                groupColClass="grid-cols-3"
              />
            </ScrollReveal>
          ) : isSocialContent ? null
          : isSmallMarket ? (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={smallMarketGroups ?? undefined}
                groupColClass="grid-cols-3"
              />
            </ScrollReveal>
          ) : isNFLDraft ? (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={[{ label: "Draft Creative", srcs: supportSrcs }]}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          ) : isSeasonTickets ? null
          : isFOTY ? (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                groups={fotyEmailGroups ?? undefined}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <SupportMedia
                title={project.title}
                srcs={supportSrcs}
                groups={supportGroups ?? undefined}
                groupColClass="grid-cols-2 sm:grid-cols-3"
              />
            </ScrollReveal>
          )}

          {project.optionalExtension ? (
            <ScrollReveal>
              <section className="mt-20 max-w-[42rem]" aria-label="Extension">
                <p className="font-sans text-[1rem] leading-[1.6] tracking-[-0.01em] text-[#444444]">
                  {project.optionalExtension}
                </p>
              </section>
            </ScrollReveal>
          ) : null}

        </div>

        {/* ── NFL Draft: labeled second break at page bottom ─────────── */}
        {isNFLDraft && (
          <>
            <div className="mx-auto w-full max-w-[72rem] px-5 pb-6 sm:px-6 lg:px-8">
              <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                [ 2026 Draft Creative Team ]
              </p>
            </div>
            <ScrollReveal>
              {break2Src ? (
                <MediaAsset
                  src={break2Src}
                  alt="NFL Draft Creative — 2026 creative team"
                />
              ) : (
                <ImageSlot aspect="aspect-[21/9]" sizes="100vw" />
              )}
            </ScrollReveal>
            <div className="pb-28 sm:pb-32 lg:pb-40" />
          </>
        )}

        {/* ── Social Content Systems: labeled team break at page bottom ── */}
        {isSocialContent && (
          <>
            <div className="mx-auto w-full max-w-[72rem] px-5 pb-6 sm:px-6 lg:px-8">
              <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                [ 2025 Social / Digital / Creative Team ]
              </p>
            </div>
            <ScrollReveal>
              {breakSrc ? (
                <MediaAsset
                  src={breakSrc}
                  alt={project.breakMedia?.alt ?? `${project.title} — creative team`}
                  width={project.breakMedia?.width}
                  height={project.breakMedia?.height}
                />
              ) : (
                <ImageSlot aspect="aspect-[21/9]" sizes="100vw" />
              )}
            </ScrollReveal>
            <div className="pb-28 sm:pb-32 lg:pb-40" />
          </>
        )}

        {/* ── Prowler: labeled Pro Shop break at page bottom ───── */}
        {isProwler && (
          <>
            <div className="mx-auto w-full max-w-[72rem] px-5 pb-6 sm:px-6 lg:px-8">
              <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                [ Prowler Throwback Pro Shop Event ]
              </p>
            </div>
            {breakSrc ? (
              <ScrollReveal>
                <MediaAsset
                  src={breakSrc}
                  alt="Prowler Throwback — Pro Shop Event"
                  width={project.breakMedia?.width}
                  height={project.breakMedia?.height}
                />
              </ScrollReveal>
            ) : (
              <ImageSlot aspect="aspect-[21/9]" sizes="100vw" />
            )}
            <div className="pb-28 sm:pb-32 lg:pb-40" />
          </>
        )}

        {/* ── Case Study Navigation ─────────────────────────── */}
        <div className="border-t border-[#E8E6E2]">
          <div className="mx-auto w-full max-w-[72rem] px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex items-center justify-between">

              {/* Previous — loops to last project from first */}
              <WorkNavLink
                href={`/work/${prevProject.slug}`}
                className="group flex items-center gap-3 transition-opacity duration-150 hover:opacity-70"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#C8C5C0] transition-colors duration-150 group-hover:text-[#141414]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <div>
                  <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#A0A09A] sm:text-[11px]">Previous</p>
                  <p className="mt-0.5 font-sans text-[0.875rem] font-medium leading-snug tracking-[-0.01em] text-[#141414]">{prevProject.title}</p>
                </div>
              </WorkNavLink>

              {/* Next — loops to first project from last */}
              <WorkNavLink
                href={`/work/${nextProject.slug}`}
                className="group flex items-center gap-3 text-right transition-opacity duration-150 hover:opacity-70"
              >
                <div>
                  <p className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#A0A09A] sm:text-[11px]">Next</p>
                  <p className="mt-0.5 font-sans text-[0.875rem] font-medium leading-snug tracking-[-0.01em] text-[#141414]">{nextProject.title}</p>
                </div>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#C8C5C0] transition-colors duration-150 group-hover:text-[#141414]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </WorkNavLink>

            </div>
          </div>
        </div>

      </div>
      {/* end single white layer */}

    </article>
  );
}
