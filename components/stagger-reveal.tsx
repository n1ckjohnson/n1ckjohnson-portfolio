"use client";

import { useEffect, useRef } from "react";

type StaggerRevealProps = {
  children: React.ReactNode;
};

export function StaggerReveal({ children }: StaggerRevealProps) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(el.children) as HTMLElement[];

    if (!prefersReduced) {
      items.forEach((item, i) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
        item.style.transition = `opacity 450ms ease-out ${i * 55}ms, transform 450ms ease-out ${i * 55}ms`;
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <ol ref={ref}>{children}</ol>;
}
