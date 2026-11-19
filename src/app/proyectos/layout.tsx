import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proyectos — web, SaaS y sistemas a medida",
  description:
    "Casos reales de Rafael Oviedo: ERPs, plataformas SaaS, wallets blockchain, e-commerce y agentes de IA. Sistemas en producción, no solo demos.",
  alternates: { canonical: `${SITE_URL}/proyectos` },
  openGraph: {
    title: "Proyectos — Rafael Oviedo",
    description: "ERPs, SaaS, web y agentes IA construidos para operaciones reales.",
    url: `${SITE_URL}/proyectos`,
    siteName: SITE.brand,
  },
};

export default function ProyectosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
