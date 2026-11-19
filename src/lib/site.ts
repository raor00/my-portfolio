export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "devraor00@gmail.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://roviedo.dev")
).replace(/\/$/, "");

export const SITE = {
  name: "Rafael Oviedo",
  brand: "roviedo.dev",
  email: CONTACT_EMAIL,
  url: SITE_URL,
  locale: "es_VE",
  twitter: "@raor_00",
  github: "https://github.com/raor00",
  linkedin: "https://www.linkedin.com/in/rafael-oviedo-ba876420a/",
  x: "https://x.com/raor_00",
  title: "Rafael Oviedo — Full Stack Developer · Páginas web, SaaS y código a medida",
  titleEn: "Rafael Oviedo — Full Stack Developer · Websites, SaaS & custom software",
  description:
    "Rafael Oviedo, ingeniero en informática en Venezuela. Construyo páginas web, landing pages, SaaS, ERPs a medida y agentes de IA. Ganador Dev3pack 2026 (#1 Venezuela · #28 global). Escríbeme a devraor00@gmail.com.",
  descriptionEn:
    "Rafael Oviedo, software engineer in Venezuela. I build websites, landing pages, SaaS, custom ERPs, and AI agents. Dev3pack 2026 winner (#1 Venezuela · #28 global). Write to devraor00@gmail.com.",
} as const;

export const SERVICE_IDS = ["web", "webapp", "erp", "ai", "ads", "otro"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export function isServiceId(value: string): value is ServiceId {
  return (SERVICE_IDS as readonly string[]).includes(value);
}
