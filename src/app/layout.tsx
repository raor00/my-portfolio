import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassFilters from "@/components/GlassFilters";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import JsonLd from "@/components/JsonLd";
import ScrollProgress from "@/components/ScrollProgress";
import { SITE, SITE_URL, CONTACT_EMAIL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: "%s · roviedo.dev",
  },
  description: SITE.description,
  keywords: [
    "Rafael Oviedo",
    "desarrollador full stack",
    "páginas web a medida",
    "SaaS",
    "ERP",
    "código personalizado",
    "agentes IA",
    "Next.js",
    "desarrollador Venezuela",
    "Meta Ads",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.brand,
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE.brand,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    creator: SITE.twitter,
    title: SITE.title,
    description: SITE.description,
  },
  icons: {
    icon: "/icon.png",
    apple: "/logo.png",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  category: "technology",
  other: {
    "contact:email": CONTACT_EMAIL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <JsonLd />
        <Providers>
          <ScrollProgress />
          <GlassFilters />
          <Navbar />
          <main className="pt-16 md:pt-20">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
