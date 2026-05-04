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

export const metadata: Metadata = {
  title: "Nick Johnson",
  description:
    "Personal portfolio for Nick Johnson featuring selected systems, visual design work, and profile details."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoSrc = detectLogoSrc();
  return (
    <html lang="en">
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
