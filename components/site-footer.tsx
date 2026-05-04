"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/profile" || pathname.startsWith("/work/")) {
    return null;
  }

  const isFixedChromePage = pathname === "/" || pathname === "/profile";

  if (isFixedChromePage) {
    return (
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
        <div className="flex items-end justify-between px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
          <p className="pointer-events-auto font-brand text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B]">
            N1CKJOHNSON
          </p>
          <div className="pointer-events-auto flex items-center gap-5 font-brand text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B]">
            <a className="transition-colors duration-150 ease-linear hover:text-[#141414]" href="mailto:nickjohnson1397@gmail.com">
              nickjohnson1397@gmail.com
            </a>
            <a className="transition-colors duration-150 ease-linear hover:text-[#141414]" href="https://linkedin.com/in/nickjohnson1397/">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="shell border-t border-line bg-white pb-8 pt-8 sm:pb-10 sm:pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-brand text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B]">
          N1CKJOHNSON
        </p>
        <div className="flex items-center gap-5 font-brand text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B]">
          <a className="transition-colors duration-150 ease-linear hover:text-[#141414]" href="mailto:nickjohnson1397@gmail.com">
            nickjohnson1397@gmail.com
          </a>
          <a className="transition-colors duration-150 ease-linear hover:text-[#141414]" href="https://linkedin.com/in/nickjohnson1397/">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
