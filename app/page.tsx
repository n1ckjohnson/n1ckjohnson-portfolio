import { HomeSelector } from "@/components/home-selector";
import { projects } from "@/content/projects";
import { detectThumbSrc, detectLogoSrc } from "@/lib/detect-media";

export default function HomePage() {
  const thumbMap: Record<string, string | null> = {};
  for (const p of projects) {
    thumbMap[p.slug] = detectThumbSrc(p.slug);
  }
  const logoSrc = detectLogoSrc();
  return <HomeSelector projects={projects} thumbMap={thumbMap} logoSrc={logoSrc} />;
}
