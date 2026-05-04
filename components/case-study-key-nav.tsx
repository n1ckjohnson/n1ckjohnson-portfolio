"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface CaseStudyKeyNavProps {
  prevSlug: string | null;
  nextSlug: string | null;
}

export function CaseStudyKeyNav({ prevSlug, nextSlug }: CaseStudyKeyNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't navigate while lightbox is open (SupportMedia sets body overflow hidden)
      if (document.body.style.overflow === "hidden") return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;

      if (e.key === "ArrowLeft" && prevSlug) {
        window.scrollTo(0, 0);
        router.push(`/work/${prevSlug}`);
      } else if (e.key === "ArrowRight" && nextSlug) {
        window.scrollTo(0, 0);
        router.push(`/work/${nextSlug}`);
      }
      // prevSlug/nextSlug are always defined (looping nav), so both keys always work
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevSlug, nextSlug, router]);

  return null;
}
