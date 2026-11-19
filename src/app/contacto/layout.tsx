import type { Metadata } from "next";
import { SITE, SITE_URL, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto — hablemos de tu proyecto",
  description: `¿Tienes una página web, un SaaS o un sistema a medida en mente? Escríbeme a ${CONTACT_EMAIL}. Respondo en menos de 24 horas.`,
  alternates: { canonical: `${SITE_URL}/contacto` },
  openGraph: {
    title: "Hablemos de tu proyecto — Rafael Oviedo",
    description: `Cuéntame qué necesitas. Páginas web, SaaS, ERPs y agentes IA. ${CONTACT_EMAIL}`,
    url: `${SITE_URL}/contacto`,
    siteName: SITE.brand,
  },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
