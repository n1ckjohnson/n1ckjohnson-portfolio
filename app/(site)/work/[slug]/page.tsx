import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEntry, getNeighbors, publicEntries } from "@/lib/portfolio";
import { CreativeCaseStudy } from "@/components/case-study/creative-case-study";
import { CaseNav } from "@/components/case-study/case-nav";

// Only public entries are built; anything else (including archived work) is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publicEntries.map((entry) => ({ slug: entry.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.project.summary,
    alternates: { canonical: `/work/${entry.slug}` },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const { prev, next } = getNeighbors(slug);

  return (
    <>
      <CreativeCaseStudy project={entry.project} label={entry.label} />
      <CaseNav prev={prev} next={next} />
    </>
  );
}
