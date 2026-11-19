import { SITE, SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { services, achievements, enterprisePlatforms, githubPresence } from "@/config/data";

const faqs = [
  {
    q: "¿Quién es Rafael Oviedo?",
    a: "Rafael Oviedo es un ingeniero en informática venezolano, full stack developer y AI agent engineer. Construye plataformas a medida —ERPs, comercio, SaaS— y agentes IA, y ganó el Dev3pack Global Hackathon 2026 (#1 Venezuela, #28 de 386 proyectos).",
  },
  {
    q: "¿Qué stack usa?",
    a: "Next.js, TypeScript, React, Tailwind CSS, Node.js, NestJS, Supabase y PostgreSQL, desplegado en Vercel. En IA trabaja con Claude API y Codex; en blockchain, con Solana.",
  },
  {
    q: "¿Está disponible para nuevos proyectos?",
    a: "Sí. Toma proyectos freelance y colaboraciones remotas en español e inglés, con dedicación parcial o por proyecto.",
  },
  {
    q: "¿Cómo se contrata?",
    a: "Escribiendo a devraor00@gmail.com o desde el formulario de contacto. Cuenta qué necesitas (web, SaaS, ERP, IA o ads) y responde en menos de 24 horas con alcance y próximos pasos.",
  },
];
export default function JsonLd() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE.brand,
      alternateName: SITE.name,
      description: SITE.description,
      inLanguage: ["es", "en"],
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: SITE.name,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      jobTitle: "Full Stack Developer · AI Agent Engineer",
      description: SITE.description,
      address: {
        "@type": "PostalAddress",
        addressCountry: "VE",
      },
      sameAs: [SITE.github, SITE.linkedin, SITE.x],
      knowsAbout: [
        "Next.js",
        "TypeScript",
        "React",
        "Node.js",
        "NestJS",
        "Supabase",
        "PostgreSQL",
        "SaaS",
        "ERP",
        "ticketing systems",
        "AI agents",
        "Claude API",
        "Solana",
        "Meta Ads",
        "technical SEO",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Full Stack Developer",
        occupationLocation: { "@type": "Country", name: "Venezuela" },
        skills: "Next.js, TypeScript, Supabase, PostgreSQL, Claude API, Solana, Meta Ads",
      },
      worksFor: {
        "@type": "Organization",
        name: "Independent practice",
      },
      award: achievements.map((achievement) => achievement.title),
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "roviedo.dev — desarrollo web, SaaS y software a medida",
      url: SITE_URL,
      email: CONTACT_EMAIL,
      image: `${SITE_URL}/logo.png`,
      areaServed: "Worldwide",
      availableLanguage: ["Spanish", "English"],
      founder: { "@id": `${SITE_URL}/#person` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de desarrollo",
        itemListElement: services.map((svc) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: svc.title,
            description: svc.description,
          },
        })),
      },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#platforms`,
      name: "Enterprise platforms",
      itemListElement: enterprisePlatforms.map((platform) => ({
        "@type": "ListItem",
        name: platform.nameEn,
        description: platform.summaryEn,
      })),
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#code`,
      name: "Public code",
      about: { "@id": `${SITE_URL}/#person` },
      mainEntity: {
        "@type": "SoftwareSourceCode",
        name: "Public repositories",
        codeRepository: githubPresence.url,
        programmingLanguage: githubPresence.languages,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
