import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassFilters from "@/components/GlassFilters";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-display",
});

export const metadata: Metadata = {
  title: "Rafa — Full Stack Developer",
  description:
    "Portfolio de Rafael Oviedo, Ingeniero en Informática y Full Stack Developer especializado en React, Next.js y Node.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <Providers>
          <GlassFilters />
          <Navbar />
          <main className="pt-16 md:pt-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
