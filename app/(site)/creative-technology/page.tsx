import type { Metadata } from "next";
import { index } from "@/content/creative-technology";
import { PageHead } from "@/components/site/page-head";
import { Contents } from "@/components/creative-technology/contents";
import { ProjectSection } from "@/components/creative-technology/project-section";
import { getAudience } from "@/lib/creative-technology/audience";
import { listProjectData, listProjects } from "@/lib/creative-technology/projects";

export function generateMetadata(): Metadata {
  const internal = getAudience() === "internal";
  return {
    title: index.title,
    description: index.description,
    alternates: { canonical: "/creative-technology" },
    // An internal build carries unapproved media and must never be indexed.
    robots: internal ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/**
 * Creative Technology: one continuous page. Every project is a section
 * with its own address, read top to bottom, with a table of contents in
 * the margin on a wide screen.
 */
export default function CreativeTechnologyPage() {
  const sections = listProjectData();
  const back = { href: "/", label: "Nick Johnson" };

  return (
    <>
      <Contents items={listProjects()} back={back} />

      <div className="ct-head">
        <PageHead back={back} title={index.title} subtitle={index.role} />
      </div>

      {sections.map((data) => (
        <ProjectSection key={data.project.slug} data={data} />
      ))}
    </>
  );
}
