import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="col pt-10 sm:pt-20">
        <h1 className="text-title text-ink">This page isn&rsquo;t here.</h1>
        <p className="text-ink-2">404</p>
        <p className="mt-8">
          <Link href="/" className="link">
            Back to the homepage
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
