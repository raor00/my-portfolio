import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre mí — Full Stack Developer en Venezuela",
  description:
    "Rafael Oviedo es un ingeniero en informática venezolano: full stack developer y AI agent engineer. Trayectoria, stack (Next.js, TypeScript, Supabase, PostgreSQL), logros verificables y disponibilidad para proyectos remotos en español e inglés.",
  alternates: { canonical: `${SITE_URL}/sobre-mi` },
  openGraph: {
    title: "Sobre Rafael Oviedo",
    description: "Trayectoria, stack, logros y disponibilidad de Rafael Oviedo.",
    url: `${SITE_URL}/sobre-mi`,
    siteName: SITE.brand,
  },
};

export default function SobreMiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
