import { SITE, SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { services } from "@/config/data";

const faqs = [
  {
    q: "¿Qué tipo de proyectos desarrolla Rafael Oviedo?",
    a: "Rafael Oviedo desarrolla páginas web, landing pages, aplicaciones SaaS, ERPs a medida, agentes de inteligencia artificial y campañas de Meta Ads. Trabaja de forma remota desde Venezuela para clientes que necesitan software personalizado en producción.",
  },
  {
    q: "¿Cómo puedo contratar a Rafael Oviedo para un proyecto?",
    a: `Escríbele a ${CONTACT_EMAIL} o usa el formulario en ${SITE_URL}/contacto. Describe la idea, el tipo de solución (web, SaaS, ERP, IA o ads) y responde en menos de 24 horas.`,
  },
  {
    q: "¿Rafael Oviedo construye SaaS y sistemas internos a medida?",
    a: "Sí. Ha construido ERPs de inventario y facturación, plataformas de tickets empresariales, wallets blockchain, marketplaces con agentes IA y e-commerce. El trabajo cubre arquitectura, desarrollo full stack y puesta en producción.",
  },
  {
    q: "¿Dónde está basado Rafael Oviedo y en qué idiomas trabaja?",
    a: "Está basado en Venezuela y trabaja en remoto. El portafolio y la comunicación están disponibles en español e inglés.",
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
        "SaaS",
        "ERP",
        "AI agents",
        "Solana",
        "Meta Ads",
        "custom software",
      ],
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
