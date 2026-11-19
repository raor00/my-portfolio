export interface Project {
  id: number;
  slug: string;
  priority?: "featured" | "secondary";
  title: string;
  headline: string;
  headlineEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  role: string;
  roleEn: string;
  impact: string;
  impactEn: string;
  status: "live" | "private" | "in-progress";
  statusLabel: string;
  statusLabelEn: string;
  featuredPriority: number;
  hackathonBadge?: string;
  problem: string;
  problemEn: string;
  solution: string;
  solutionEn: string;
  results: string[];
  resultsEn: string[];
  resultHighlight?: string;
  resultHighlightEn?: string;
  conversionCta?: string;
  conversionCtaEn?: string;
  tags: string[];
  featured: boolean;
  image?: string;
  demo?: {
    frame?: "browser" | "phone";
    url?: string;
    shots: { src: string; alt?: string; caption: string; captionEn: string }[];
  };
  liveUrl?: string;
  primaryCta?: {
    label: string;
    labelEn: string;
    href: string;
    external?: boolean;
  };
  secondaryCta?: {
    label: string;
    labelEn: string;
    href: string;
    external?: boolean;
  };
  githubUrl?: string;
}

export interface Skill {
  name: string;
  category: "frontend" | "backend" | "tools" | "database" | "blockchain" | "ai" | "marketing";
  level: number; // 1-5
}

export interface Achievement {
  icon: string;
  title: string;
  titleEn: string;
  detail: string;
  detailEn: string;
  project: string | null;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  tags: string[];
  ctaHref: string;
}

export interface Experience {
  role: string;
  roleEn: string;
  company: string;
  period: string;
  summary: string;
  summaryEn: string;
  /** Impact bullets, same shape as project results. Numbers only where proven. */
  impacts: string[];
  impactsEn: string[];
  technologies: string[];
}

/**
 * Enterprise work shown on the home page. Only the first platform is named;
 * the other two are described by scope and volume, without names, clients,
 * URLs or screenshots.
 */
export interface EnterprisePlatform {
  id: "cops" | "commerce" | "nda";
  name: string;
  nameEn: string;
  anonymous: boolean;
  nda: boolean;
  summary: string;
  summaryEn: string;
  scope: string[];
  scopeEn: string[];
  metrics: { label: string; labelEn: string; value: string; valueEn: string }[];
  href: string | null;
}

export interface GithubPresence {
  url: string;
  publicRepositories: number;
  since: string;
  languages: string[];
}

const baseProjects: Project[] = [
  {
    id: 10,
    slug: "tropico-wallet",
    title: "Tropico Wallet",
    headline: "Wallet Solana que conecta USDC con la banca venezolana en tiempo real",
    headlineEn: "Solana wallet bridging USDC and the Venezuelan banking system in real time",
    subtitle: "Protocolo JIT BsX, agente IA financiero y UI en 4 idiomas. Ganador Dev3pack 2026.",
    subtitleEn: "JIT BsX protocol, AI financial agent, and 4-language UI. Dev3pack 2026 winner.",
    description:
      "Tropico Wallet es una wallet no-custodial en Solana que actúa como riel entre USDC y el sistema bancario venezolano (Pago Móvil). Incluye BsX, un protocolo JIT personalizado en Anchor, y Carlos AI, un agente financiero venezolano construido sobre el runtime Lumen.",
    descriptionEn:
      "Tropico Wallet is a non-custodial Solana wallet acting as a rail between USDC and the Venezuelan banking system (Pago Móvil). Features BsX, a custom JIT Anchor protocol, and Carlos AI, a Venezuelan financial agent built on the Lumen runtime.",
    role: "Arquitectura full-stack · Anchor · AI Agent",
    roleEn: "Full-stack architecture · Anchor · AI Agent",
    impact: "Primer puente directo entre Solana USDC y Pago Móvil VE con agente IA integrado.",
    impactEn: "First direct bridge between Solana USDC and Venezuelan Pago Móvil with integrated AI agent.",
    status: "live",
    statusLabel: "En producción",
    statusLabelEn: "Live",
    featuredPriority: 1,
    hackathonBadge: "#1 Venezuela · #28 Global · Dev3pack 2026",
    problem:
      "Venezuela opera con dos sistemas monetarios paralelos sin puente digital confiable entre USDC on-chain y la banca local.",
    problemEn:
      "Venezuela operates with two parallel monetary systems with no reliable digital bridge between on-chain USDC and local banking.",
    solution:
      "Se diseñó un protocolo JIT (BsX) en Anchor que mintea/quema entre USDC y BsX, conectado a Pago Móvil VE, con un agente IA (Carlos) para asistir transacciones.",
    solutionEn:
      "A JIT protocol (BsX) in Anchor was built to mint/burn between USDC and BsX, connected to Pago Móvil VE, with an AI agent (Carlos) to assist transactions.",
    results: [
      "Protocolo Anchor personalizado con 25+ rutas: wallet consumer, pagos merchant, P2P, yield y firma offline.",
      "UI en 4 idiomas (ES/EN/PT/FR) con i18n propio.",
      "Integración WhatsApp Bot via Cloud API.",
      "Top 9 LATAM · Top 28 mundial entre 386 proyectos.",
    ],
    resultsEn: [
      "Custom Anchor program with 25+ routes: consumer wallet, merchant payments, P2P, yield, and offline tx signing.",
      "4-language UI (ES/EN/PT/FR) with custom i18n.",
      "WhatsApp Bot integration via Cloud API.",
      "Top 9 LATAM · Top 28 worldwide out of 386 projects.",
    ],
    resultHighlight: "#1 Venezuela · Top 9 LATAM · Top 28 mundial en Dev3pack 2026",
    resultHighlightEn: "#1 Venezuela · Top 9 LATAM · Top 28 worldwide at Dev3pack 2026",
    tags: ["Solana", "Blockchain", "AI Agent", "Next.js", "TypeScript"],
    featured: true,
    demo: {
      frame: "browser",
      url: "tropico.vercel.app",
      shots: [
        {
          src: "/projects/tropico-wallet/01.webp",
          alt: "Tropico Wallet — wallet and balance screen",
          caption: "Wallet y saldo en tiempo real",
          captionEn: "Real-time wallet and balance",
        },
        {
          src: "/projects/tropico-wallet/02.webp",
          alt: "Tropico Wallet — Pago Móvil transfer flow",
          caption: "Envío a Pago Móvil venezolano",
          captionEn: "Send to Venezuelan Pago Móvil",
        },
        {
          src: "/projects/tropico-wallet/03.webp",
          alt: "Tropico Wallet — Guacama AI autonomous financial agent",
          caption: "Guacama AI — agente financiero autónomo",
          captionEn: "Guacama AI — autonomous financial agent",
        },
      ],
    },
    liveUrl: "https://tropico.vercel.app",
    primaryCta: {
      label: "Ver proyecto en vivo",
      labelEn: "View live project",
      href: "https://tropico.vercel.app",
      external: true,
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/Tropico",
      external: true,
    },
    githubUrl: "https://github.com/raor00/Tropico",
  },
  {
    id: 11,
    slug: "llave",
    title: "Llave",
    headline: "Marketplace de alquiler venezolano con agente IA que elimina depósitos abusivos",
    headlineEn: "Venezuelan rental marketplace with AI agent eliminating abusive advance deposits",
    subtitle: "Llavero, el agente IA potenciado por Claude API, guía a inquilinos y propietarios.",
    subtitleEn: "Llavero, the AI agent powered by Claude API, guides renters and landlords.",
    description:
      "Llave es un marketplace de alquiler venezolano que elimina los depósitos 'meses por adelantado' estándar del mercado local. Incluye Llavero, un agente IA construido sobre Claude API que ayuda a ambas partes a navegar la plataforma.",
    descriptionEn:
      "Llave is a Venezuelan rental marketplace eliminating the painful 'months in advance' deposits standard in the local market. Features Llavero, an AI agent built on Claude API helping both parties navigate the platform.",
    role: "Full-stack · AI Agent con Claude API",
    roleEn: "Full-stack · AI Agent with Claude API",
    impact: "Resuelve una fricción estructural del mercado inmobiliario venezolano con tecnología IA.",
    impactEn: "Solves a structural friction in the Venezuelan real estate market with AI technology.",
    status: "private",
    statusLabel: "Hackathon",
    statusLabelEn: "Hackathon",
    featuredPriority: 2,
    hackathonBadge: "Platanus · Anthropic Hackathon 2026",
    problem:
      "El mercado de alquiler en Venezuela exige depósitos de varios meses por adelantado, excluyendo a inquilinos con capacidad real de pago.",
    problemEn:
      "The Venezuelan rental market demands multi-month advance deposits, excluding renters with real payment capacity.",
    solution:
      "Se construyó un marketplace con modelo de garantía alternativo y Llavero, agente IA que asiste a usuarios durante el proceso de alquiler.",
    solutionEn:
      "A marketplace was built with an alternative guarantee model and Llavero, an AI agent assisting users throughout the rental process.",
    results: [
      "Agente Llavero integrado con Claude API para soporte conversacional.",
      "Flujo de alquiler sin depósitos tradicionales.",
      "Seleccionado en Platanus · Anthropic Hackathon 2026.",
    ],
    resultsEn: [
      "Llavero agent integrated with Claude API for conversational support.",
      "Rental flow without traditional deposits.",
      "Selected at Platanus · Anthropic Hackathon 2026.",
    ],
    resultHighlight: "Marketplace de alquiler con agente IA — Platanus · Anthropic Hackathon 2026",
    resultHighlightEn: "Rental marketplace with AI agent — Platanus · Anthropic Hackathon 2026",
    tags: ["AI Agent", "Claude API", "Next.js", "Marketplace"],
    featured: true,
    primaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/llave",
      external: true,
    },
    githubUrl: "https://github.com/raor00/llave",
  },
  {
    id: 1,
    slug: "cops-platform",
    title: "COPS Platform",
    headline: "Plataforma empresarial para soporte y operación técnica",
    headlineEn: "Enterprise platform for support and technical operations",
    subtitle: "Tickets, seguimiento de casos y control del ciclo de atención en un solo sistema.",
    subtitleEn: "Tickets, case tracking, and support lifecycle control in one system.",
    description:
      "COPS Platform centraliza la gestión de soporte de una empresa tecnológica con módulos de tickets, seguimiento de casos, estados y control operativo para mejorar tiempos de respuesta.",
    descriptionEn:
      "COPS Platform centralizes support operations for a tech company with ticketing, case tracking, status workflows, and operational control to improve response times.",
    role: "Arquitectura y desarrollo full stack",
    roleEn: "Architecture and full stack development",
    impact: "Consolidó la operación de soporte en una sola plataforma y elevó la trazabilidad de casos.",
    impactEn: "Consolidated support operations into one platform and improved case traceability.",
    status: "private",
    statusLabel: "Implementado",
    statusLabelEn: "Implemented",
    featuredPriority: 3,
    problem:
      "La gestión de soporte estaba fragmentada entre canales y no existía una trazabilidad clara por caso.",
    problemEn:
      "Support operations were fragmented across channels and there was no clear case traceability.",
    solution:
      "Se diseñó una plataforma con flujo de tickets, estado por caso y visibilidad operativa para acelerar la atención.",
    solutionEn:
      "A platform was built with ticket workflows, case status tracking, and operational visibility to speed up support delivery.",
    results: [
      "Seguimiento de casos con historial claro por cliente.",
      "Mejor control interno para priorización y cierre de tickets.",
      "Base sólida para escalar la operación de soporte.",
    ],
    resultsEn: [
      "Case tracking with clear customer history.",
      "Better internal control for ticket prioritization and resolution.",
      "Solid foundation to scale support operations.",
    ],
    resultHighlight: "Operación de soporte centralizada con trazabilidad clara por ticket y caso.",
    resultHighlightEn: "Centralized support operation with clear traceability by ticket and case.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Workflow"],
    featured: true,
    // demo: pending real screenshots (requires COPS login). Restore block once assets land in public/projects/cops-platform/.
    primaryCta: {
      label: "Solicitar plataforma similar",
      labelEn: "Request a similar platform",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/cops-platform",
      external: true,
    },
    githubUrl: "https://github.com/raor00/cops-platform",
  },
  {
    id: 2,
    slug: "erp-tienda-iphone",
    title: "ERP — Tienda iPhone",
    headline: "ERP para control total de una operación comercial",
    headlineEn: "ERP for end-to-end control of a retail operation",
    subtitle: "Inventario, ventas, clientes, reparaciones y reportes conectados en un mismo panel.",
    subtitleEn: "Inventory, sales, customers, repairs, and reports connected in one dashboard.",
    description:
      "ERP diseñado para una tienda de iPhone con enfoque operativo: centraliza procesos clave del negocio para reducir fricción diaria y facilitar decisiones basadas en datos.",
    descriptionEn:
      "ERP designed for an iPhone store with an operational focus: it centralizes core business processes to reduce daily friction and support data-driven decisions.",
    role: "Producto, backend y frontend",
    roleEn: "Product, backend, and frontend",
    impact: "Unificó procesos críticos del negocio en una sola herramienta de trabajo diario.",
    impactEn: "Unified critical business processes into one daily operational tool.",
    status: "private",
    statusLabel: "Implementado",
    statusLabelEn: "Implemented",
    featuredPriority: 7,
    problem:
      "El equipo operaba con procesos dispersos para inventario, ventas y reparaciones, generando retrabajo.",
    problemEn:
      "The team was running disconnected inventory, sales, and repair processes, causing rework.",
    solution:
      "Se construyó un ERP modular para centralizar la operación y generar reportes útiles para decisiones comerciales.",
    solutionEn:
      "A modular ERP was built to centralize operations and deliver useful reports for commercial decisions.",
    results: [
      "Operación más ordenada entre ventas e inventario.",
      "Mejor visibilidad sobre clientes y reparaciones.",
      "Reportes para seguimiento financiero y operativo.",
    ],
    resultsEn: [
      "Cleaner day-to-day operations across sales and inventory.",
      "Better visibility over customers and repair workflows.",
      "Reports for financial and operational tracking.",
    ],
    resultHighlight: "Inventario, ventas y reparaciones unificados en un solo flujo operativo.",
    resultHighlightEn: "Inventory, sales, and repairs unified in a single operational workflow.",
    tags: ["Next.js", "TypeScript", "Supabase", "ERP"],
    featured: true,
    primaryCta: {
      label: "Quiero un ERP a medida",
      labelEn: "I need a custom ERP",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/v0-ip-hone-store-erp",
      external: true,
    },
    githubUrl: "https://github.com/raor00/v0-ip-hone-store-erp",
  },
  {
    id: 3,
    slug: "invictus-erp",
    title: "Invictus ERP",
    headline: "ERP de operaciones para una tienda de tecnología",
    headlineEn: "Operations ERP for a tech retail store",
    subtitle: "Inventario, ventas, facturación y gestión de tienda en un solo sistema.",
    subtitleEn: "Inventory, sales, invoicing, and store management in one system.",
    description:
      "ERP independiente para la tienda Invictus, construido sobre Next.js con Convex como backend en tiempo real. Centraliza inventario, ventas, facturación y la operación diaria de la tienda en una sola plataforma a medida.",
    descriptionEn:
      "Independent ERP for the Invictus store, built on Next.js with Convex as a real-time backend. It centralizes inventory, sales, invoicing, and daily store operations in a single tailored platform.",
    role: "Arquitectura y desarrollo full stack",
    roleEn: "Full stack architecture and development",
    impact: "Unificó la operación de la tienda en una sola plataforma con datos en tiempo real.",
    impactEn: "Unified store operations into a single platform with real-time data.",
    status: "private",
    statusLabel: "Privado",
    statusLabelEn: "Private",
    featuredPriority: 5,
    problem:
      "La tienda necesitaba un sistema propio para manejar inventario, ventas y facturación sin depender de planillas.",
    problemEn:
      "The store needed its own system to manage inventory, sales, and invoicing without relying on spreadsheets.",
    solution:
      "Se construyó un ERP a medida sobre Convex (backend reactivo) con módulos de inventario, ventas y facturación adaptados a la marca.",
    solutionEn:
      "A custom ERP was built on Convex (reactive backend) with inventory, sales, and invoicing modules tailored to the brand.",
    results: [
      "Operación centralizada en una sola plataforma.",
      "Inventario y ventas sincronizados en tiempo real.",
      "Facturación adaptada a la tienda.",
    ],
    resultsEn: [
      "Operations centralized in a single platform.",
      "Inventory and sales synced in real time.",
      "Invoicing tailored to the store.",
    ],
    resultHighlight: "Operación de tienda unificada con backend en tiempo real.",
    resultHighlightEn: "Unified store operations with a real-time backend.",
    tags: ["Next.js", "Convex", "TypeScript", "Tailwind CSS"],
    featured: true,
    demo: {
      frame: "browser",
      url: "invictusphone.com",
      shots: [
        {
          src: "/projects/invictus-erp/01.webp",
          alt: "Invictus ERP — inventory and sales dashboard",
          caption: "Inventario y ventas",
          captionEn: "Inventory and sales",
        },
        {
          src: "/projects/invictus-erp/02.webp",
          alt: "Invictus ERP — product catalog with stock levels",
          caption: "Catálogo de productos con stock en tiempo real",
          captionEn: "Product catalog with real-time stock",
        },
        {
          src: "/projects/invictus-erp/03.webp",
          alt: "Invictus ERP — invoicing module",
          caption: "Módulo de facturación",
          captionEn: "Invoicing module",
        },
        {
          src: "/projects/invictus-erp/04.webp",
          alt: "Invictus ERP — store operations report",
          caption: "Reporte de operaciones de tienda",
          captionEn: "Store operations report",
        },
      ],
    },
    primaryCta: {
      label: "Quiero un ERP para mi negocio",
      labelEn: "I want an ERP for my business",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/invictus-erp",
      external: true,
    },
    githubUrl: "https://github.com/raor00/invictus-erp",
  },
  {
    id: 4,
    slug: "mi-gimnasio",
    title: "Mi Gimnasio",
    headline: "Aplicación para gestión de rutinas y progreso",
    headlineEn: "App for workout routines and progress management",
    subtitle: "Sesiones, estadísticas y evolución del usuario en una experiencia simple.",
    subtitleEn: "Sessions, analytics, and user progression in a streamlined experience.",
    description:
      "Aplicación pensada para entrenamiento personal: organiza rutinas y sesiones, registra progreso y ofrece estadísticas para mejorar consistencia y resultados.",
    descriptionEn:
      "Training-focused app that organizes routines and sessions, tracks progress, and provides stats to improve consistency and results.",
    role: "Producto y desarrollo frontend/back",
    roleEn: "Product and frontend/backend development",
    impact: "Transformó el seguimiento del entrenamiento en un proceso medible y constante.",
    impactEn: "Turned workout tracking into a measurable and consistent process.",
    status: "in-progress",
    statusLabel: "En evolución",
    statusLabelEn: "Evolving",
    featuredPriority: 12,
    problem:
      "Los usuarios no tenían una forma clara de registrar sesiones y visualizar su progreso real.",
    problemEn:
      "Users lacked a clear way to log sessions and understand real progress over time.",
    solution:
      "Se desarrolló una app con gestión de rutinas, historial de sesiones y métricas clave de avance.",
    solutionEn:
      "An app was developed with routine management, session history, and key progression metrics.",
    results: [
      "Mayor adherencia al plan de entrenamiento.",
      "Seguimiento visual del progreso por periodos.",
      "Base lista para nuevas funciones premium.",
    ],
    resultsEn: [
      "Higher adherence to workout plans.",
      "Visual progress tracking across periods.",
      "Foundation ready for premium feature expansion.",
    ],
    resultHighlight: "Rutinas, sesiones y progreso medible en una sola experiencia digital.",
    resultHighlightEn: "Routines, sessions, and measurable progress in one digital experience.",
    tags: ["Astro", "TypeScript", "Supabase", "Fitness"],
    featured: false,
    primaryCta: {
      label: "Quiero una app similar",
      labelEn: "I want a similar app",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/mi-gimnasio",
      external: true,
    },
    githubUrl: "https://github.com/raor00/mi-gimnasio",
  },
  {
    id: 5,
    slug: "itools-backup-recovery",
    title: "iTools",
    headline: "Recuperación y reparación de backups de iPhone",
    headlineEn: "iPhone backup recovery and repair tool",
    subtitle: "Herramienta técnica enfocada en restauración de información crítica.",
    subtitleEn: "Technical utility focused on restoring critical information.",
    description:
      "Herramienta de recuperación y reparación de backups de iPhone orientada a soporte técnico, con procesos guiados para minimizar pérdida de datos y acelerar intervenciones.",
    descriptionEn:
      "Recovery and repair tool for iPhone backups aimed at technical support teams, with guided flows to minimize data loss and speed up interventions.",
    role: "Desarrollo de producto y lógica de recuperación",
    roleEn: "Product development and recovery logic",
    impact: "Aporta una solución especializada para incidencias de backup con foco en continuidad del servicio.",
    impactEn: "Delivers a specialized backup incident solution focused on service continuity.",
    status: "private",
    statusLabel: "Implementado",
    statusLabelEn: "Implemented",
    featuredPriority: 10,
    problem:
      "La recuperación de backups dañados requería procesos manuales lentos y con alto riesgo.",
    problemEn:
      "Recovering damaged backups relied on slow manual processes with high risk.",
    solution:
      "Se diseñó una herramienta con flujos técnicos más seguros para recuperación y reparación.",
    solutionEn:
      "A tool was designed with safer technical workflows for backup recovery and repair.",
    results: [
      "Reducción de pasos manuales en incidentes críticos.",
      "Mayor consistencia en procesos de recuperación.",
      "Base técnica reutilizable para soporte especializado.",
    ],
    resultsEn: [
      "Reduced manual steps in critical incidents.",
      "Greater consistency in recovery workflows.",
      "Reusable technical foundation for specialized support.",
    ],
    resultHighlight: "Herramienta técnica para recuperar y reparar backups dañados de iPhone.",
    resultHighlightEn: "Technical tool to recover and repair damaged iPhone backups.",
    tags: ["Electron", "TypeScript", "Python", "iPhone"],
    featured: false,
    primaryCta: {
      label: "Consultar solución técnica",
      labelEn: "Discuss a technical solution",
      href: "/contacto",
    },
  },
  {
    id: 6,
    slug: "dolarya",
    title: "dolarYA",
    headline: "Consulta de tasas del dólar en Venezuela",
    headlineEn: "Dollar rate tracker for Venezuela",
    subtitle: "Acceso rápido a referencias de cambio para decisiones comerciales.",
    subtitleEn: "Fast access to exchange references for business decisions.",
    description:
      "Plataforma enfocada en consulta de tasas del dólar en Venezuela para usuarios y negocios que necesitan referencias actualizadas de forma simple.",
    descriptionEn:
      "Platform focused on dollar rate lookup in Venezuela for users and businesses that need updated references quickly.",
    role: "Desarrollo full stack y UX de consulta",
    roleEn: "Full stack development and lookup UX",
    impact: "Facilitó decisiones de precio con información accesible y clara.",
    impactEn: "Enabled pricing decisions with clearer and more accessible information.",
    status: "live",
    statusLabel: "En uso",
    statusLabelEn: "In use",
    featuredPriority: 6,
    problem:
      "Usuarios necesitaban consultar referencias de tipo de cambio de forma confiable y rápida.",
    problemEn:
      "Users needed fast and reliable access to exchange rate references.",
    solution:
      "Se creó una plataforma ligera de consulta con estructura orientada a uso diario.",
    solutionEn:
      "A lightweight lookup platform was built with a daily-use oriented structure.",
    results: [
      "Consulta rápida desde móvil y escritorio.",
      "Interfaz clara para referencias cambiarias.",
      "Producto útil para operación comercial diaria.",
    ],
    resultsEn: [
      "Fast lookup across mobile and desktop.",
      "Clear interface for exchange references.",
      "Useful product for daily commercial operations.",
    ],
    resultHighlight: "Información cambiaria clara para decisiones rápidas en el mercado venezolano.",
    resultHighlightEn: "Clear exchange information for fast decisions in the Venezuelan market.",
    tags: ["Vercel", "Node.js", "APIs", "Finanzas"],
    featured: false,
    primaryCta: {
      label: "Crear plataforma similar",
      labelEn: "Build a similar platform",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/dolarYA",
      external: true,
    },
    githubUrl: "https://github.com/raor00/dolarYA",
  },
  {
    id: 7,
    slug: "heavenly-store",
    title: "heavenly-store",
    headline: "E-commerce full stack orientado a conversión",
    headlineEn: "Conversion-driven full stack e-commerce",
    subtitle: "Catálogo, checkout y operación comercial en una arquitectura escalable.",
    subtitleEn: "Catalog, checkout, and operations in a scalable architecture.",
    description:
      "Proyecto e-commerce full stack con enfoque en experiencia de compra, administración del catálogo y base técnica preparada para crecimiento.",
    descriptionEn:
      "Full stack e-commerce project focused on purchase experience, catalog management, and technical scalability.",
    role: "Arquitectura, frontend y backend",
    roleEn: "Architecture, frontend, and backend",
    impact: "Construyó una base comercial digital lista para campañas y crecimiento.",
    impactEn: "Built a digital commerce foundation ready for campaigns and growth.",
    status: "in-progress",
    statusLabel: "En evolución",
    statusLabelEn: "Evolving",
    featuredPriority: 7,
    problem:
      "El negocio necesitaba una tienda online propia con control de catálogo y ventas.",
    problemEn:
      "The business needed its own online store with control over catalog and sales.",
    solution:
      "Se implementó una arquitectura e-commerce full stack con foco en conversión y mantenibilidad.",
    solutionEn:
      "A full stack e-commerce architecture was implemented with focus on conversion and maintainability.",
    results: [
      "Base lista para escalar tráfico pago.",
      "Mejor experiencia de navegación de productos.",
      "Estructura preparada para nuevas integraciones.",
    ],
    resultsEn: [
      "Foundation ready to scale paid traffic.",
      "Improved product browsing experience.",
      "Structure prepared for new integrations.",
    ],
    resultHighlight: "Base de e-commerce preparada para ventas, campañas y crecimiento.",
    resultHighlightEn: "E-commerce foundation ready for sales, campaigns, and growth.",
    tags: ["Next.js", "Supabase", "E-commerce", "Stripe-ready"],
    featured: false,
    primaryCta: {
      label: "Lanzar mi e-commerce",
      labelEn: "Launch my e-commerce",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/Heavenly",
      external: true,
    },
    githubUrl: "https://github.com/raor00/Heavenly",
  },
  {
    id: 8,
    slug: "churupitos-finanzas",
    title: "Churupitos",
    headline: "App de finanzas personales hecha para Venezuela",
    headlineEn: "Personal finance app built for Venezuela",
    subtitle: "Gastos, cuentas y metas en USD, bolívares y USDT — sin cuentas mentales.",
    subtitleEn: "Expenses, accounts, and goals in USD, bolívares, and USDT — no mental math.",
    description:
      "Churupitos es una app de finanzas personales para el día a día venezolano: registrar ingresos y gastos, ver saldos por cuenta, convertir entre Bs/USD/USDT con tasas en vivo y organizar suscripciones y metas. PWA instalable (iOS/Android) con frontend React y API NestJS + PostgreSQL en producción.",
    descriptionEn:
      "Churupitos is a personal finance app for everyday life in Venezuela: log income and expenses, see balances by account, convert Bs/USD/USDT with live rates, and organize subscriptions and savings goals. Installable PWA (iOS/Android) with a React frontend and a NestJS + PostgreSQL API in production.",
    role: "Producto · frontend y arquitectura de API",
    roleEn: "Product · frontend and API architecture",
    impact: "Una app real para ordenar el dinero en un país con varias monedas al mismo tiempo.",
    impactEn: "A real app for managing money in a country that runs on several currencies at once.",
    status: "live",
    statusLabel: "En producción",
    statusLabelEn: "Live",
    featuredPriority: 6,
    problem:
      "En Venezuela se opera en bolívares, dólares y USDT a la vez. Las apps genéricas no entienden tasas paralelas, cuentas mixtas ni el hábito real de anotar un gasto rápido.",
    problemEn:
      "Venezuela runs on bolívares, dollars, and USDT at the same time. Generic apps don't handle parallel rates, mixed accounts, or the habit of logging a quick expense.",
    solution:
      "Se construyó una PWA con auth (email + PIN), cuentas, movimientos, categorías, suscripciones, metas y una calculadora de cambio con BCV y paralelo. Backend propio (NestJS + Postgres + Redis), no un CRUD sobre plantilla.",
    solutionEn:
      "A PWA was built with auth (email + PIN), accounts, transactions, categories, subscriptions, savings goals, and an FX calculator with BCV and parallel rates. Custom backend (NestJS + Postgres + Redis), not a template CRUD.",
    results: [
      "App en producción en app.churupitos.com, instalable como PWA.",
      "Multimoneda real: USD, Bs y USDT con tasas en vivo.",
      "Cuentas, gastos, transferencias, suscripciones y metas de ahorro.",
    ],
    resultsEn: [
      "Live app at app.churupitos.com, installable as a PWA.",
      "Real multi-currency: USD, Bs, and USDT with live rates.",
      "Accounts, expenses, transfers, subscriptions, and savings goals.",
    ],
    resultHighlight: "Finanzas personales en producción para un país que opera en tres monedas.",
    resultHighlightEn: "Personal finance in production for a country that runs on three currencies.",
    tags: ["React", "Vite", "NestJS", "PostgreSQL", "PWA"],
    featured: true,
    demo: {
      frame: "browser",
      url: "app.churupitos.com",
      shots: [
        {
          src: "/projects/churupitos/01.webp",
          alt: "Churupitos — dashboard with net worth and live rates",
          caption: "Visión general: patrimonio, ingresos y tasas en vivo",
          captionEn: "Overview: net worth, income, and live rates",
        },
        {
          src: "/projects/churupitos/02.webp",
          alt: "Churupitos — multi-currency transaction ledger",
          caption: "Movimientos en USD, Bs y USDT",
          captionEn: "Ledger in USD, Bs, and USDT",
        },
        {
          src: "/projects/churupitos/03.webp",
          alt: "Churupitos — FX calculator BCV and paralelo",
          caption: "Calculadora BCV y paralelo",
          captionEn: "BCV and parallel FX calculator",
        },
        {
          src: "/projects/churupitos/04.webp",
          alt: "Churupitos — savings buckets and goals",
          caption: "Metas y buckets de ahorro",
          captionEn: "Savings buckets and goals",
        },
      ],
    },
    liveUrl: "https://app.churupitos.com",
    primaryCta: {
      label: "Abrir la app",
      labelEn: "Open the app",
      href: "https://app.churupitos.com",
      external: true,
    },
    secondaryCta: {
      label: "Quiero una app similar",
      labelEn: "I want a similar app",
      href: "/contacto?servicio=webapp&proyecto=churupitos-finanzas",
    },
    githubUrl: "https://github.com/churupitos/frontend-churupitos",
  },
  {
    id: 9,
    slug: "ventas-en-usa",
    title: "Ventas en USA",
    headline: "Web comercial para presencia digital y captación",
    headlineEn: "Commercial website for digital presence and lead capture",
    subtitle: "Página orientada a confianza, posicionamiento y generación de oportunidades.",
    subtitleEn: "Website focused on trust, positioning, and lead generation.",
    description:
      "Sitio web comercial creado para reforzar presencia digital de marca y convertir visitas en conversaciones de negocio en el mercado estadounidense.",
    descriptionEn:
      "Commercial website built to strengthen brand digital presence and convert visits into business conversations in the US market.",
    role: "Estrategia digital y desarrollo web",
    roleEn: "Digital strategy and web development",
    impact: "Mejoró la percepción profesional y abrió un canal de captación online.",
    impactEn: "Improved professional positioning and opened an online lead channel.",
    status: "live",
    statusLabel: "En uso",
    statusLabelEn: "In use",
    featuredPriority: 9,
    problem:
      "La marca requería una presencia web sólida para captar oportunidades fuera de su red actual.",
    problemEn:
      "The brand needed a stronger web presence to capture opportunities beyond its existing network.",
    solution:
      "Se desarrolló una página comercial enfocada en claridad de propuesta y contacto directo.",
    solutionEn:
      "A commercial website was built with clear value proposition and direct contact flow.",
    results: [
      "Mejor presentación digital de la marca.",
      "Canal claro de contacto comercial.",
      "Base para futuras campañas de captación.",
    ],
    resultsEn: [
      "Stronger digital brand presentation.",
      "Clear channel for commercial inquiries.",
      "Foundation for future acquisition campaigns.",
    ],
    resultHighlight: "Presencia digital diseñada para captar conversaciones comerciales.",
    resultHighlightEn: "Digital presence designed to attract commercial conversations.",
    tags: ["Next.js", "Landing Page", "SEO", "Lead Gen"],
    featured: false,
    primaryCta: {
      label: "Crear web para vender más",
      labelEn: "Build a website to sell more",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/VentasUSA",
      external: true,
    },
    githubUrl: "https://github.com/raor00/VentasUSA",
  },
  {
    id: 12,
    slug: "iparts-platform",
    title: "iParts Platform",
    headline: "ERP operativo para el ciclo completo de un taller de iPhone",
    headlineEn: "Operational ERP for the full iPhone repair-shop cycle",
    subtitle: "Lote, recepción, taller, QA, venta, cobranza y garantía — un equipo no se pierde.",
    subtitleEn: "Lot, intake, workshop, QA, sale, collections, and warranty — no device gets lost.",
    description:
      "iParts Platform es el ERP de operación de iParts: compra y recepción de lotes, identificación por IMEI, cava, taller (diagnóstico, reparación, repuestos), control de calidad, inventario comercial, cotizaciones, ventas, cuentas por cobrar y garantías. Monorepo Next.js + NestJS + Prisma + PostgreSQL, con panel del técnico y dinero en USD a precisión decimal.",
    descriptionEn:
      "iParts Platform is iParts' operations ERP: lot purchasing and intake, IMEI identification, vault, workshop (diagnosis, repair, parts), quality control, commercial inventory, quotes, sales, receivables, and warranties. Next.js + NestJS + Prisma + PostgreSQL monorepo, with a technician panel and USD money at decimal precision.",
    role: "Arquitectura del producto · API y frontend",
    roleEn: "Product architecture · API and frontend",
    impact: "Trazabilidad de cada dispositivo desde el lote hasta la garantía, sin drift de dinero.",
    impactEn: "Traceability of every device from lot to warranty, with no money drift.",
    status: "live",
    statusLabel: "En producción",
    statusLabelEn: "Live",
    featuredPriority: 4,
    problem:
      "Un taller de iPhone usado opera con lotes, IMEIs, técnicos, repuestos, ventas y CxC. Sin un sistema propio, el equipo se pierde entre WhatsApp, planillas y la caja.",
    problemEn:
      "A used-iPhone shop runs on lots, IMEIs, technicians, parts, sales, and receivables. Without its own system, devices get lost between WhatsApp, spreadsheets, and the cash drawer.",
    solution:
      "Se modeló el ciclo de vida del dispositivo como fuente de verdad (internalCode + IMEI) y se construyó un ERP modular: procurement, workshop, QC, sales, finance, warranty y un panel móvil para el técnico. La API NestJS concentra la regla de negocio; el dinero nunca se redondea en float.",
    solutionEn:
      "The device lifecycle was modeled as the source of truth (internalCode + IMEI) and a modular ERP was built: procurement, workshop, QC, sales, finance, warranty, and a mobile technician panel. The NestJS API owns business rules; money is never rounded in floats.",
    results: [
      "Flujo lote → taller → QA → venta → garantía con timeline por equipo.",
      "Cotizaciones, ventas y CxC con settlement en USD decimal.",
      "Panel del técnico, catálogo de repuestos e inventario comercial en el mismo sistema.",
    ],
    resultsEn: [
      "Lot → workshop → QA → sale → warranty flow with a timeline per device.",
      "Quotes, sales, and receivables with decimal USD settlement.",
      "Technician panel, parts catalog, and commercial inventory in one system.",
    ],
    resultHighlight: "ERP de taller con trazabilidad por IMEI y dinero exacto en USD.",
    resultHighlightEn: "Shop ERP with IMEI-level traceability and exact USD money.",
    tags: ["Next.js", "NestJS", "Prisma", "PostgreSQL", "TypeScript"],
    featured: true,
    liveUrl: "https://app.ipartsve.com",
    primaryCta: {
      label: "Quiero un ERP como iParts",
      labelEn: "I want an ERP like iParts",
      href: "/contacto?servicio=erp&proyecto=iparts-platform",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/IPARTS-platform",
      external: true,
    },
    githubUrl: "https://github.com/raor00/IPARTS-platform",
  },
  {
    id: 13,
    slug: "iparts-servicio-repuestos",
    title: "iParts — Servicio Técnico & Repuestos",
    headline: "Tickets de reparación y punto de venta de repuestos",
    headlineEn: "Repair tickets and parts point-of-sale",
    subtitle: "Dos módulos, un solo login: servicio técnico e inventario con POS.",
    subtitleEn: "Two modules, one login: repair service and parts inventory with POS.",
    description:
      "App standalone para una tienda de repuestos de iPhone que une servicio técnico (tickets de reparación, garantías, técnicos y dashboard) con el módulo de repuestos (inventario y punto de venta que descuenta stock y emite factura imprimible). Todo sobre Convex.",
    descriptionEn:
      "Standalone app for an iPhone parts shop that joins repair service (repair tickets, warranties, technicians, and dashboard) with the parts module (inventory and point-of-sale that discounts stock and prints invoices). All on Convex.",
    role: "Desarrollo full stack",
    roleEn: "Full stack development",
    impact: "Integró reparaciones y ventas de repuestos en una sola operación.",
    impactEn: "Integrated repairs and parts sales into a single operation.",
    status: "private",
    statusLabel: "Privado",
    statusLabelEn: "Private",
    featuredPriority: 7,
    problem:
      "El servicio técnico y la venta de repuestos vivían separados, sin un sistema común.",
    problemEn:
      "Repair service and parts sales lived separately, with no shared system.",
    solution:
      "Se construyó una app sobre Convex que comparte login, sidebar y base de datos entre ambos módulos.",
    solutionEn:
      "An app was built on Convex sharing one login, sidebar, and database across both modules.",
    results: [
      "Tickets de reparación con garantías y técnicos.",
      "POS que descuenta stock y emite factura imprimible.",
      "Dashboard unificado de la operación.",
    ],
    resultsEn: [
      "Repair tickets with warranties and technicians.",
      "POS that discounts stock and prints invoices.",
      "Unified operations dashboard.",
    ],
    resultHighlight: "Servicio técnico y repuestos en una sola plataforma.",
    resultHighlightEn: "Repair service and parts in a single platform.",
    tags: ["Next.js", "Convex", "TypeScript", "Tailwind CSS"],
    featured: false,
    primaryCta: {
      label: "Quiero digitalizar mi taller",
      labelEn: "Digitize my repair shop",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/ERP-iParts",
      external: true,
    },
    githubUrl: "https://github.com/raor00/ERP-iParts",
  },
];

export const projects: Project[] = baseProjects.map((project) => ({
  ...project,
  priority: project.featured ? "featured" : "secondary",
  resultHighlight: project.resultHighlight ?? project.results[0],
  resultHighlightEn: project.resultHighlightEn ?? project.resultsEn[0],
  conversionCta:
    project.conversionCta ?? project.primaryCta?.label ?? "Quiero una solución similar",
  conversionCtaEn:
    project.conversionCtaEn ?? project.primaryCta?.labelEn ?? "I want a similar solution",
}));

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.featuredPriority - b.featuredPriority);

export const secondaryProjects = projects
  .filter((project) => !project.featured)
  .sort((a, b) => a.featuredPriority - b.featuredPriority);

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", category: "frontend", level: 4 },
  { name: "Next.js", category: "frontend", level: 5 },
  { name: "TypeScript", category: "frontend", level: 4 },
  { name: "JavaScript", category: "frontend", level: 5 },
  { name: "Tailwind CSS", category: "frontend", level: 5 },
  { name: "Framer Motion", category: "frontend", level: 4 },

  // Backend
  { name: "Node.js", category: "backend", level: 4 },
  { name: "REST APIs", category: "backend", level: 4 },
  { name: "Python", category: "backend", level: 3 },
  { name: "Supabase Functions", category: "backend", level: 3 },

  // Database
  { name: "Supabase", category: "database", level: 4 },
  { name: "PostgreSQL", category: "database", level: 4 },

  // Blockchain
  { name: "Solana", category: "blockchain", level: 4 },
  { name: "Anchor 0.30", category: "blockchain", level: 3 },
  { name: "Jupiter v6", category: "blockchain", level: 3 },
  { name: "Privy MPC", category: "blockchain", level: 3 },

  // AI & Automation
  { name: "Claude API", category: "ai", level: 5 },
  { name: "AI Agent Dev", category: "ai", level: 4 },
  { name: "Codex", category: "ai", level: 4 },
  { name: "OpenCode", category: "ai", level: 3 },
  { name: "Prompt Engineering", category: "ai", level: 5 },

  // Marketing
  { name: "Meta Ads", category: "marketing", level: 5 },
  { name: "Google Ads", category: "marketing", level: 3 },
  { name: "Meta Pixel", category: "marketing", level: 4 },
  { name: "GA4", category: "marketing", level: 4 },

  // Tools
  { name: "Git / GitHub", category: "tools", level: 4 },
  { name: "Vercel", category: "tools", level: 5 },
  { name: "Linux / SSH", category: "tools", level: 3 },
];

export const experience: Experience[] = [
  {
    role: "Coordinador de Desarrollo Tecnológico",
    roleEn: "Technology Development Coordinator",
    company: "COP'S Electronics, S.A.",
    period: "2025 — 2026",
    summary:
      "Lideré el sistema de tickets interno que hoy opera la empresa y coordiné proyectos de seguridad electrónica para clientes bancarios, industriales y de gobierno.",
    summaryEn:
      "Led the internal ticketing system the company still runs today, and coordinated electronic security projects for banking, industrial and government clients.",
    impacts: [
      "Sistema de tickets en producción con RBAC de 5 niveles, defendido además como tesis universitaria.",
      "Reducción del 30% en el tiempo de seguimiento de incidencias reportada por el equipo operativo.",
      "Coordinación de 10+ proyectos de seguridad electrónica: CCTV, control de acceso Hikvision y Milestone VMS.",
    ],
    impactsEn: [
      "Ticketing system in production with 5-level RBAC, also defended as a university thesis.",
      "30% reduction in incident tracking time reported by the operations team.",
      "Coordinated 10+ electronic security projects: CCTV, Hikvision access control and Milestone VMS.",
    ],
    technologies: ["Next.js", "Supabase", "TypeScript", "RBAC", "Hikvision", "Milestone VMS"],
  },
  {
    role: "Full Stack Developer — Freelance",
    roleEn: "Full Stack Developer — Freelance",
    company: "Estudios independientes",
    period: "2022 — Presente",
    summary:
      "Construyo plataformas a medida que ya operan en producción: ERPs, comercio a alto volumen, catálogos, cotizadores y agentes IA.",
    summaryEn:
      "I build custom platforms that already run in production: ERPs, high-volume commerce, catalogs, quoting tools and AI agents.",
    impacts: [
      "Plataforma de comercio y operaciones que procesa más de USD 800,000 al mes (cliente en confidencialidad).",
      "ERPs en operación diaria: inventario, taller, garantías y facturación.",
      "Ganador de Dev3pack Global Hackathon 2026 (#1 Venezuela · Top 9 LATAM · #28 de 386).",
      "Agentes IA en producto real con Claude API y Codex, sobre Next.js y Supabase.",
    ],
    impactsEn: [
      "Commerce and operations platform processing over USD 800,000 per month (client under confidentiality).",
      "ERPs running daily: inventory, workshop, warranties and invoicing.",
      "Dev3pack Global Hackathon 2026 winner (#1 Venezuela · Top 9 LATAM · #28 of 386).",
      "AI agents in real products with Claude API and Codex, on Next.js and Supabase.",
    ],
    technologies: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Claude API", "Solana", "Vercel"],
  },
  {
    role: "Trafficker Pago — Meta Ads",
    roleEn: "Paid Traffic Specialist — Meta Ads",
    company: "Cartera de clientes independientes",
    period: "2022 — Presente",
    summary:
      "Gestiono campañas de rendimiento en Meta Ads para clientes de tecnología, reparación de dispositivos y retail.",
    summaryEn:
      "I run Meta Ads performance campaigns for clients in tech, device repair and retail.",
    impacts: [
      "Presupuestos gestionados de hasta USD 3,000 por mes por cliente.",
      "Auditorías de CPA, ROAS y CTR con audiencias personalizadas y lookalike vía Meta Pixel.",
      "Medición con GA4 y pruebas A/B sobre el embudo completo.",
    ],
    impactsEn: [
      "Managed budgets of up to USD 3,000 per month per client.",
      "CPA, ROAS and CTR audits with custom and lookalike audiences via Meta Pixel.",
      "GA4 measurement and A/B testing across the full funnel.",
    ],
    technologies: ["Meta Ads", "Facebook Business", "Meta Pixel", "GA4", "A/B Testing"],
  },
  {
    role: "Técnico iPhone · Paid Media Specialist",
    roleEn: "iPhone Technician · Paid Media Specialist",
    company: "Servicio técnico independiente",
    period: "2022 — 2024",
    summary:
      "Reparación de iPhone a nivel componente y captación local de clientes con campañas de Meta Ads.",
    summaryEn:
      "Component-level iPhone repair plus local customer acquisition with Meta Ads campaigns.",
    impacts: [
      "Diagnóstico y reparación de pantalla, batería, puerto de carga y placa.",
      "Campañas de captación local diseñadas y gestionadas de punta a punta.",
    ],
    impactsEn: [
      "Screen, battery, charging port and logic board diagnostics and repair.",
      "Local acquisition campaigns designed and managed end to end.",
    ],
    technologies: ["Meta Ads", "Facebook Business", "iPhone Repair"],
  },
];

export const personalInfo = {
  name: "Rafael Oviedo",
  title: "Full Stack Developer · AI Agent Engineer",
  subtitle: "Ingeniero en Informática",
  subtitleEn: "Software Engineer",
  bio: "Soy Rafael Oviedo — Ingeniero en Informática, ganador del Dev3pack Global Hackathon 2026 (#1 Venezuela · #28 mundial de 386 proyectos). Construyo sistemas full-stack con Next.js, Supabase y TypeScript; desarrollo agentes IA con Claude y Codex; e integro blockchain en Solana. También gestiono campañas Meta Ads con presupuestos de hasta $3,000/mes por cliente. Opero en la intersección de ingeniería de software, automatización IA y performance marketing.",
  bioEn:
    "I'm Rafael Oviedo — Software Engineer and Dev3pack Global Hackathon 2026 winner (#1 Venezuela · #28 worldwide out of 386 projects). I build full-stack systems with Next.js, Supabase, and TypeScript; develop AI agents with Claude and Codex; and integrate blockchain on Solana. I also manage Meta Ads campaigns with budgets up to $3,000/month per client. I operate at the intersection of software engineering, AI automation, and performance marketing.",
  location: "Venezuela",
  email: "devraor00@gmail.com",
  github: "https://github.com/raor00",
  linkedin: "https://www.linkedin.com/in/rafael-oviedo-ba876420a/",
  x: "https://x.com/raor_00",
  available: true,
};

/**
 * Achievement copy. Every number below is traceable:
 * - hackathon placements: this file's project entries and public/llms.txt
 * - thesis + RBAC ticketing: experience entry above and the tier-2 COPS page
 * - commerce volume: owner-provided figure for the anonymous platform
 * - Meta Ads budgets: services and experience entries above
 */
export const achievements: Achievement[] = [
  {
    icon: "🏆",
    title: "Dev3pack Global Hackathon 2026",
    titleEn: "Dev3pack Global Hackathon 2026",
    detail: "#1 Venezuela · Top 9 LATAM · #28 de 386 proyectos — Tropico Wallet",
    detailEn: "#1 Venezuela · Top 9 LATAM · #28 of 386 projects — Tropico Wallet",
    project: "tropico-wallet",
  },
  {
    icon: "🤖",
    title: "Platanus · Anthropic Hackathon 2026",
    titleEn: "Platanus · Anthropic Hackathon 2026",
    detail: "Llave — marketplace de alquiler con agente IA sobre Claude API",
    detailEn: "Llave — rental marketplace with an AI agent on Claude API",
    project: "llave",
  },
  {
    icon: "🥈",
    title: "GitHub Copilot Dev Days",
    titleEn: "GitHub Copilot Dev Days",
    detail: "Ganador del primer evento competitivo de prompt engineering de GitHub",
    detailEn: "Winner of GitHub's first competitive prompt engineering event",
    project: null,
  },
  {
    icon: "🎓",
    title: "Tesis universitaria defendida",
    titleEn: "University thesis defended",
    detail: "COP'S Platform — sistema de tickets con RBAC de 5 niveles, en uso real como herramienta interna",
    detailEn: "COP'S Platform — 5-level RBAC ticketing system, in real use as an internal tool",
    project: "cops-platform",
  },
  {
    icon: "📈",
    title: "Comercio a alto volumen en producción",
    titleEn: "High-volume commerce in production",
    detail: "Plataforma que procesa más de USD 800,000 al mes (cliente en confidencialidad)",
    detailEn: "Platform processing over USD 800,000 per month (client under confidentiality)",
    project: null,
  },
  {
    icon: "◍",
    title: "Meta Ads con presupuesto gestionado",
    titleEn: "Managed Meta Ads budgets",
    detail: "Hasta USD 3,000 por mes por cliente, con auditorías de CPA/ROAS/CTR",
    detailEn: "Up to USD 3,000 per month per client, with CPA/ROAS/CTR audits",
    project: null,
  },
];

/**
 * Three enterprise platforms. Only COPS is named; the other two are described
 * by scope and volume with no client, country detail, URL or screenshot.
 */
export const enterprisePlatforms: EnterprisePlatform[] = [
  {
    id: "cops",
    name: "COP'S Platform",
    nameEn: "COP'S Platform",
    anonymous: false,
    nda: false,
    summary:
      "Plataforma de tickets y operaciones para una empresa de electrónica y seguridad: incidencias, roles, seguimiento y reportes. Nació como tesis y hoy corre en producción.",
    summaryEn:
      "Ticketing and operations platform for an electronics and security company: incidents, roles, tracking and reporting. Started as a thesis and runs in production today.",
    scope: ["Next.js", "Supabase", "PostgreSQL", "RBAC 5 niveles", "Reportes"],
    scopeEn: ["Next.js", "Supabase", "PostgreSQL", "5-level RBAC", "Reporting"],
    metrics: [
      { label: "Roles de acceso", labelEn: "Access roles", value: "5", valueEn: "5" },
      { label: "Estado", labelEn: "Status", value: "Producción", valueEn: "Production" },
    ],
    href: "/proyectos/cops-platform",
  },
  {
    id: "commerce",
    name: "Plataforma de comercio y operaciones",
    nameEn: "Commerce and operations platform",
    anonymous: true,
    nda: false,
    summary:
      "Comercio y operación de alto volumen: catálogo, pedidos, inventario multi-sede, facturación y control de acceso por roles. Cliente en confidencialidad.",
    summaryEn:
      "High-volume commerce and operations: catalog, orders, multi-location inventory, invoicing and role-based access control. Client under confidentiality.",
    scope: ["Next.js", "NestJS", "PostgreSQL", "Inventario multi-sede", "Facturación"],
    scopeEn: ["Next.js", "NestJS", "PostgreSQL", "Multi-location inventory", "Invoicing"],
    metrics: [
      {
        label: "Volumen procesado",
        labelEn: "Processed volume",
        value: "USD 800,000+/mes",
        valueEn: "USD 800,000+/month",
      },
    ],
    href: null,
  },
  {
    id: "nda",
    name: "Plataforma empresarial confidencial",
    nameEn: "Confidential enterprise platform",
    anonymous: true,
    nda: true,
    summary:
      "Sistema interno crítico bajo NDA: flujos operativos, permisos por rol, auditoría de cambios y tableros de control para equipos de operación.",
    summaryEn:
      "Critical internal system under NDA: operational workflows, role-based permissions, change auditing and control dashboards for operations teams.",
    scope: ["Full-stack", "PostgreSQL", "RBAC", "Auditoría", "Dashboards"],
    scopeEn: ["Full-stack", "PostgreSQL", "RBAC", "Auditing", "Dashboards"],
    metrics: [{ label: "Detalle", labelEn: "Detail", value: "Bajo NDA", valueEn: "Under NDA" }],
    href: null,
  },
];

/** Public GitHub presence, aggregated. Verified through the GitHub API (9 public repos). */
export const githubPresence: GithubPresence = {
  url: "https://github.com/raor00",
  publicRepositories: 9,
  since: "2023",
  languages: ["TypeScript", "JavaScript", "Astro", "SQL"],
};

export const services: Service[] = [
  {
    id: "web",
    icon: "◈",
    title: "Páginas Web & Landing Pages",
    titleEn: "Web Pages & Landing Pages",
    description: "Sitios comerciales, landing pages y presencias digitales orientadas a conversión: diseño a medida, SEO técnico, carga rápida y estructura pensada para vender.",
    descriptionEn: "Commercial sites, landing pages, and digital presences built for conversion: custom design, technical SEO, fast load, and structure designed to sell.",
    tags: ["Next.js", "Tailwind CSS", "SEO", "Vercel"],
    ctaHref: "/contacto?servicio=web",
  },
  {
    id: "webapp",
    icon: "◉",
    title: "Web Apps & SaaS",
    titleEn: "Web Apps & SaaS",
    description: "Plataformas completas con autenticación, base de datos, paneles de control y lógica de negocio. Desde la arquitectura hasta el deploy en producción.",
    descriptionEn: "Full platforms with auth, database, dashboards, and business logic. From architecture to production deploy.",
    tags: ["Next.js", "Supabase", "TypeScript", "PostgreSQL"],
    ctaHref: "/contacto?servicio=webapp",
  },
  {
    id: "erp",
    icon: "▦",
    title: "ERPs & Sistemas Internos",
    titleEn: "ERPs & Internal Systems",
    description: "Sistemas de gestión a medida: inventario, facturación, tickets, reportes y control de acceso por roles. En producción real, no demos.",
    descriptionEn: "Custom management systems: inventory, invoicing, tickets, reports, and role-based access control. Real production, not demos.",
    tags: ["Full-Stack", "RBAC", "PostgreSQL", "Workflows"],
    ctaHref: "/contacto?servicio=erp",
  },
  {
    id: "ai",
    icon: "◬",
    title: "Agentes IA & Automatización",
    titleEn: "AI Agents & Automation",
    description: "Integración de agentes IA en productos reales con Claude API y Codex. Automatización de flujos operativos, bots conversacionales y asistentes especializados.",
    descriptionEn: "AI agent integration into real products with Claude API and Codex. Operational workflow automation, conversational bots, and specialized assistants.",
    tags: ["Claude API", "Codex", "Next.js", "Automation"],
    ctaHref: "/contacto?servicio=ai",
  },
  {
    id: "ads",
    icon: "◍",
    title: "Meta Ads & Performance Marketing",
    titleEn: "Meta Ads & Performance Marketing",
    description: "Gestión de campañas Meta Ads con presupuestos de hasta $3,000/mes. Audiencias personalizadas, lookalike via Pixel, optimización CPA/ROAS y reportes de métricas reales.",
    descriptionEn: "Meta Ads campaign management with budgets up to $3,000/month. Custom audiences, lookalike via Pixel, CPA/ROAS optimization, and real metrics reporting.",
    tags: ["Meta Ads", "Meta Pixel", "GA4", "ROAS"],
    ctaHref: "/contacto?servicio=ads",
  },
];
