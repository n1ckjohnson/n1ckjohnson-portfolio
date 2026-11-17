import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";

/**
 * The shell every page shares: the main landmark and the footer. There is
 * no navigation bar. The homepage is the index, and every other page
 * carries one link back to it.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
