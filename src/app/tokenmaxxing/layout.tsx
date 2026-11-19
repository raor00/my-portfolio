import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tokenmaxxing — mi consumo diario de tokens de IA",
  description:
    "Cuántos tokens de IA consumo por día, por proveedor y por modelo, con costo estimado a partir de precios públicos. Datos generados localmente desde mis transcripts.",
  alternates: { canonical: `${SITE_URL}/tokenmaxxing` },
  openGraph: {
    title: "Tokenmaxxing — Rafael Oviedo",
    description: "Consumo diario de tokens de IA por proveedor y modelo, con costo estimado.",
    url: `${SITE_URL}/tokenmaxxing`,
    siteName: SITE.brand,
  },
};

export default function TokenmaxxingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
