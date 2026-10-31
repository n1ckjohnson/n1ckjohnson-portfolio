import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page pt-16 sm:pt-28 lg:pt-36">
      <p className="text-small text-ink-2">404</p>
      <h1 className="mt-3 text-title font-medium text-ink sm:text-display">This page isn&rsquo;t here.</h1>
      <p className="mt-5 text-body text-ink-2 sm:text-lead">
        <Link href="/#work" className="text-link text-ink">
          Back to the work
        </Link>
      </p>
    </div>
  );
}
