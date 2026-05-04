"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GridIcon() {
  return (
    <svg
      width="19"
      height="12"
      viewBox="0 0 19 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="5" height="5" rx="0.5" />
      <rect x="7" y="0" width="5" height="5" rx="0.5" />
      <rect x="14" y="0" width="5" height="5" rx="0.5" />
      <rect x="0" y="7" width="5" height="5" rx="0.5" />
      <rect x="7" y="7" width="5" height="5" rx="0.5" />
      <rect x="14" y="7" width="5" height="5" rx="0.5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7H4z" />
    </svg>
  );
}

export function SiteHeader({ logoSrc }: { logoSrc?: string | null }) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const isProfile = pathname === "/profile";

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-5 lg:px-6">

        {/* Left: grid icon → homepage project grid */}
        <Link
          href="/#work"
          aria-label="Work"
          className="flex items-center gap-2 text-[#C0C0C0] transition-colors duration-150 hover:text-[#141414]"
        >
          <GridIcon />
          <span className="font-brand text-[10px] uppercase tracking-[0.14em]">
            Work
          </span>
        </Link>

        {/* Center: logo or dot mark → home top */}
        <Link
          href="/"
          aria-label="Home"
          className={`flex items-center justify-center transition-opacity duration-150 hover:opacity-50 ${
            logoSrc ? "" : "h-[22px] w-[22px] rounded-full border border-[#1b1d21]/20"
          }`}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" aria-hidden="true" className="h-[22px] w-auto" />
          ) : (
            <span className="h-[5px] w-[5px] rounded-full bg-[#1b1d21]" />
          )}
        </Link>

        {/* Right: profile icon → /profile */}
        <Link
          href="/profile"
          aria-label="Profile"
          className={`flex items-center gap-2 transition-colors duration-150 hover:text-[#141414] ${
            isProfile ? "text-[#141414]" : "text-[#C0C0C0]"
          }`}
        >
          <span className="font-brand text-[10px] uppercase tracking-[0.14em]">
            Profile
          </span>
          <ProfileIcon />
        </Link>

      </div>
    </header>
  );
}
