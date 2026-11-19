import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proyectos — web, SaaS y sistemas a medida",
  description:
    "Casos de Rafael Oviedo con contexto, stack y resultado: ERPs en operación diaria, comercio a alto volumen, wallets en Solana, SaaS y agentes IA. Sistemas en producción, no demos.",
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
