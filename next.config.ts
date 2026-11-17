import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // CSP for a static portfolio:
    // - self for all standard assets (scripts, styles, fonts, images)
    // - data: for inline SVGs and base64 images
    // - blob: for Next.js image optimization worker
    // - unsafe-inline for Next.js inline styles/scripts
    // - unsafe-eval only in dev (Next.js dev server uses eval-source-map bundles)
    // - connect-src self for Next.js prefetch/analytics
    // - frame-ancestors 'none' enforced here too (belt + suspenders with X-Frame-Options)
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "media-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

// Internal builds of the Creative Technology pages include media that is not
// approved for publication. They get their own output folder so an internal
// build can never be mistaken for, or deployed as, the public one.
const isInternalBuild = process.env.CT_AUDIENCE === "internal" && !isDev;

const nextConfig: NextConfig = {
  ...(isInternalBuild ? { distDir: ".next-internal" } : {}),
  // Media that is not approved for publication must never travel with a
  // public build, not even as a traced server dependency. An internal build
  // reads it from this machine's disk, so it needs no tracing either.
  outputFileTracingExcludes: { "*": ["media-internal/**"] },
  // Baked at build time so an internal build keeps serving its media when it
  // is started without the variable, and a public build can never do so.
  env: { CT_BUILD_AUDIENCE: isInternalBuild ? "internal" : "public" },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  // Every Creative Technology project is now a section of one page, and
  // About is part of the homepage. Earlier addresses still resolve.
  //
  // These are temporary (307) while the site is under review, so a browser
  // does not cache them for good. Switch PERMANENT to true at publication.
  async redirects() {
    const PERMANENT = false;
    const page = "/creative-technology";

    // Project pages as they were under /creative-technology/<slug>, plus the
    // current section names used as paths.
    const sections: Record<string, string> = {
      "splash-screens": "splash-screens",
      "ticketing-suites": "ticketing-suites",
      "rivalries-color": "rivalries-color",
      "injury-report": "injury-report",
      "score-graphics": "score-graphics",
      "game-week": "game-week",
      "player-birthday": "player-birthdays",
      "player-birthdays": "player-birthdays",
      "postgame-email": "jags-win-email",
      "jags-win-email": "jags-win-email",
    };
    // Projects no longer on the website lead to the top of the page.
    const retired = ["new-hire", "entertainment-carousel", "targeted-automation"];

    // The six systems first listed under /work.
    const work: Record<string, string> = {
      "injury-report-builder": "injury-report",
      "game-week-splash-screens": "splash-screens",
      "game-day-score-graphics": "score-graphics",
      "single-game-ticket-suite": "ticketing-suites",
      "rivalries-color-correction": "rivalries-color",
      "birthday-graphics-automation": "player-birthdays",
    };

    return [
      ...Object.entries(sections).map(([from, to]) => ({ source: `${page}/${from}`, destination: `${page}#${to}`, permanent: PERMANENT })),
      ...retired.map((from) => ({ source: `${page}/${from}`, destination: page, permanent: PERMANENT })),
      ...Object.entries(work).map(([from, to]) => ({ source: `/work/${from}`, destination: `${page}#${to}`, permanent: PERMANENT })),
      { source: "/profile", destination: "/#more-info", permanent: PERMANENT },
      { source: "/about", destination: "/#more-info", permanent: PERMANENT },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
