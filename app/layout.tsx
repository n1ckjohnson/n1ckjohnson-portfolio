import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ScrollToTop } from "@/components/scroll-to-top";
import { detectLogoSrc } from "@/lib/detect-media";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

const DESCRIPTION = "Designer for the Jacksonville Jaguars. @n1ckmade / @n1ckjohnson";

export const metadata: Metadata = {
  metadataBase: new URL("https://n1ckjohnson.com"),
  title: "Nick Johnson",
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoSrc = detectLogoSrc();
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
        sameAs: [
          "https://linkedin.com/in/nickjohnson1397/",
          "https://www.instagram.com/n1ckmade/",
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} bg-canvas font-sans text-ink antialiased`}
      >
        <div className="min-h-screen">
          <ScrollToTop />
          <SiteHeader logoSrc={logoSrc} />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
