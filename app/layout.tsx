import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// Variable Inter with the optical-size axis: display cuts at large sizes,
// text cuts at small ones, from a single font file.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
});

// Code is part of the work shown here, so it gets one typeface that looks
// the same on every device instead of whatever monospace the system has.
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const DESCRIPTION =
  "Designer with the Jacksonville Jaguars, working on fan-facing creative and the production systems behind it. @n1ckmade / @n1ckjohnson";

export const metadata: Metadata = {
  metadataBase: new URL("https://n1ckjohnson.com"),
  title: {
    default: "Nick Johnson",
    template: "%s — Nick Johnson",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://n1ckjohnson.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Nick Johnson",
    description: DESCRIPTION,
    url: "https://n1ckjohnson.com",
    siteName: "Nick Johnson",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Johnson",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Nick Johnson",
      alternateName: ["N1CK Johnson", "N1CKmade", "@n1ckjohnson", "@n1ckmade"],
      url: "https://n1ckjohnson.com",
    },
    {
      "@type": "Person",
      name: "Nick Johnson",
      alternateName: ["N1CK Johnson", "N1CKmade", "@n1ckjohnson", "@n1ckmade"],
      jobTitle: "Digital Designer",
      worksFor: { "@type": "Organization", name: "Jacksonville Jaguars" },
      url: "https://n1ckjohnson.com",
      sameAs: ["https://linkedin.com/in/nickjohnson1397/", "https://www.instagram.com/n1ckmade/", "https://x.com/n1ckmade"],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior: anchors on a page glide (see globals.css); moving
    // between pages does not.
    <html lang="en" className={`${inter.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so reveal-on-load
            styles never hide content when scripts don't run. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans text-body">
        <a
          href="#main"
          className="fixed left-4 top-3 z-50 -translate-y-20 rounded-full bg-ink px-4 py-3 text-small text-canvas transition-transform duration-quick ease-out focus:translate-y-0"
        >
          Skip to content
        </a>
        {/* Every page shares one shell, provided by app/(site)/layout.tsx. */}
        {children}
      </body>
    </html>
  );
}
