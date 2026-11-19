import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre mí — Full Stack Developer en Venezuela",
  description:
    "Rafael Oviedo, ingeniero en informática. Full stack, agentes IA, Solana y Meta Ads. Ganador Dev3pack 2026 (#1 Venezuela · #28 global). Trabajo remoto en español e inglés.",
  alternates: { canonical: `${SITE_URL}/sobre-mi` },
  openGraph: {
    title: "Sobre Rafael Oviedo",
    description: "Ingeniero en informática. Full stack, IA, blockchain y performance marketing.",
    url: `${SITE_URL}/sobre-mi`,
    siteName: SITE.brand,
  },
};

export default function SobreMiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
