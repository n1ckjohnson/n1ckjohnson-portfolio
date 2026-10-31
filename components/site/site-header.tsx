"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contact } from "@/content/profile";

const email = contact.find((item) => item.label === "Email");

const links = [
  { href: "/#work", label: "Work", match: (path: string) => path.startsWith("/work/") },
  { href: "/profile", label: "About", match: (path: string) => path === "/profile" },
];

export function SiteHeader({ logoSrc }: { logoSrc: string | null }) {
  const pathname = usePathname();

  return (
    <header className="page flex h-16 items-center justify-between sm:h-20">
      <Link href="/" className="pressable group -m-2 flex items-center gap-2.5 rounded-md p-2" aria-label="Nick Johnson, home">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" width={17} height={15} className="h-[15px] w-auto" />
        ) : null}
        {/* Name swaps to the handle on hover — a nod to N1CKJOHNSON */}
        <span className="grid text-small font-medium" aria-hidden="true">
          <span className="col-start-1 row-start-1 transition-opacity duration-quick ease-out group-hover:opacity-0">
            Nick Johnson
          </span>
          <span className="col-start-1 row-start-1 opacity-0 transition-opacity duration-quick ease-out group-hover:opacity-100">
            N1CKJOHNSON
          </span>
        </span>
      </Link>

      <nav aria-label="Primary">
        <ul className="-mr-2.5 flex items-center text-small">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`pressable inline-flex rounded-md px-2.5 py-3 sm:py-2 ${active ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {email ? (
            <li>
              <a href={email.href} className="pressable inline-flex rounded-md px-2.5 py-3 sm:py-2 text-ink-2 hover:text-ink">
                Contact
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
