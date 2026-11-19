import type { Metadata } from "next";
import { SITE, SITE_URL, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto — hablemos de tu proyecto",
  description: `Contratá a Rafael Oviedo para una página web, un SaaS o un sistema a medida. Formulario con tipo de proyecto o correo directo a ${CONTACT_EMAIL}. Respuesta en menos de 24 horas.`,
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
