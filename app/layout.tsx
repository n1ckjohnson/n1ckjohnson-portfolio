import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { detectLogoSrc } from "@/lib/media";

// Variable Inter with the optical-size axis: display cuts at large sizes,
// text cuts at small ones, from a single font file.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
});

const DESCRIPTION =
  "I design creative work and build the systems behind it. Designer for the Jacksonville Jaguars. @n1ckmade / @n1ckjohnson";

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
  themeColor: "#fcfcfb",
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
      sameAs: ["https://linkedin.com/in/nickjohnson1397/", "https://www.instagram.com/n1ckmade/"],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so reveal-on-load
            styles never hide content when scripts don't run. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans text-body">
        <a
          href="#main"
          className="fixed left-4 top-3 z-50 -translate-y-16 rounded-md bg-ink px-3 py-2 text-small text-canvas transition-transform duration-quick ease-out focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader logoSrc={detectLogoSrc()} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
