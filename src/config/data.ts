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
  description: string;
  descriptionEn: string;
  technologies: string[];
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
    featuredPriority: 4,
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
    featuredPriority: 6,
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
    featured: true,
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
    headline: "Finanzas personales para Venezuela",
    headlineEn: "Personal finance app for Venezuela",
    subtitle: "Control diario del dinero con categorías, seguimiento y claridad financiera.",
    subtitleEn: "Daily money tracking with categories, insights, and financial clarity.",
    description:
      "App de finanzas personales diseñada para el contexto venezolano, enfocada en registrar gastos, ordenar movimientos y mejorar control del dinero.",
    descriptionEn:
      "Personal finance app designed for the Venezuelan context, focused on expense tracking, transaction organization, and money control.",
    role: "Producto y desarrollo de experiencia móvil",
    roleEn: "Product and mobile experience development",
    impact: "Ayuda a usuarios a tomar mejores decisiones financieras en su día a día.",
    impactEn: "Helps users make better day-to-day financial decisions.",
    status: "in-progress",
    statusLabel: "En evolución",
    statusLabelEn: "Evolving",
    featuredPriority: 8,
    problem:
      "No existía una herramienta simple y local para registrar gastos personales en el contexto venezolano.",
    problemEn:
      "There was no simple, local-focused tool for personal expense tracking in Venezuela.",
    solution:
      "Se creó una app orientada a hábitos financieros diarios con interfaz clara y rápida.",
    solutionEn:
      "An app was built for daily financial habits with a clear and fast user experience.",
    results: [
      "Mejor visibilidad de gastos personales.",
      "Mayor constancia en registro diario.",
      "Producto con alto potencial de adopción local.",
    ],
    resultsEn: [
      "Better visibility over personal expenses.",
      "Greater consistency in daily tracking.",
      "Product with strong local adoption potential.",
    ],
    resultHighlight: "Control diario del dinero adaptado al contexto financiero venezolano.",
    resultHighlightEn: "Daily money control adapted to the Venezuelan financial context.",
    tags: ["Next.js", "Supabase", "Recharts", "Finanzas"],
    featured: false,
    primaryCta: {
      label: "Desarrollar app financiera",
      labelEn: "Build a finance app",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/Churupitos",
      external: true,
    },
    githubUrl: "https://github.com/raor00/Churupitos",
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
    slug: "iparts-erp",
    title: "iParts ERP",
    headline: "ERP para el ciclo completo de reparación de dispositivos",
    headlineEn: "ERP for the full device repair lifecycle",
    subtitle: "Compra, recepción, diagnóstico, reparación, control de calidad y venta.",
    subtitleEn: "Purchase, intake, diagnosis, repair, QA, and sale.",
    description:
      "ERP operativo para gestionar el flujo completo de iParts: desde la compra y recepción de dispositivos hasta el diagnóstico, la reparación, el control de calidad y la venta. Construido sobre Next.js, Prisma y PostgreSQL con manejo preciso de dinero en USD.",
    descriptionEn:
      "Operational ERP to manage iParts' full flow: from purchasing and intake of devices through diagnosis, repair, quality control, and sale. Built on Next.js, Prisma, and PostgreSQL with precise USD money handling.",
    role: "Arquitectura de datos y desarrollo full stack",
    roleEn: "Data architecture and full stack development",
    impact: "Estandarizó el flujo de reparación en etapas trazables de punta a punta.",
    impactEn: "Standardized the repair flow into traceable end-to-end stages.",
    status: "private",
    statusLabel: "Privado",
    statusLabelEn: "Private",
    featuredPriority: 6,
    problem:
      "El negocio necesitaba trazabilidad del dispositivo en cada etapa, desde la compra hasta la venta.",
    problemEn:
      "The business needed device traceability at every stage, from purchase to sale.",
    solution:
      "Se modeló el ciclo de vida del dispositivo con Prisma sobre PostgreSQL y montos en USD con precisión decimal.",
    solutionEn:
      "The device lifecycle was modeled with Prisma over PostgreSQL, with USD amounts handled at decimal precision.",
    results: [
      "Flujo de reparación trazable etapa por etapa.",
      "Control de calidad antes de la venta.",
      "Cálculo de dinero preciso en USD.",
    ],
    resultsEn: [
      "Repair flow traceable stage by stage.",
      "Quality control before each sale.",
      "Precise USD money calculation.",
    ],
    resultHighlight: "Ciclo de reparación trazable de la compra a la venta.",
    resultHighlightEn: "Repair lifecycle traceable from purchase to sale.",
    tags: ["Next.js", "Prisma", "PostgreSQL", "TypeScript"],
    featured: false,
    primaryCta: {
      label: "Quiero digitalizar mi taller",
      labelEn: "Digitize my repair shop",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/IPARTS-platfotrm",
      external: true,
    },
    githubUrl: "https://github.com/raor00/IPARTS-platfotrm",
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
    description:
      "Lideré el desarrollo del sistema de tickets interno (Next.js 14 + Supabase) con RBAC de 5 niveles, reduciendo el tiempo de seguimiento de incidencias un 30%. Coordiné 10+ proyectos de seguridad electrónica: CCTV, control de acceso Hikvision y Milestone VMS para clientes bancarios, industriales y de gobierno.",
    descriptionEn:
      "Led development of the internal ticket management system (Next.js 14 + Supabase) with 5-level RBAC, reducing incident tracking time by 30%. Coordinated 10+ electronic security projects: CCTV, Hikvision access control, and Milestone VMS for banking, industrial, and government clients.",
    technologies: ["Next.js", "Supabase", "TypeScript", "Hikvision", "Milestone VMS"],
  },
  {
    role: "Full Stack Developer — Freelance",
    roleEn: "Full Stack Developer — Freelance",
    company: "Clientes independientes",
    period: "2022 — Presente",
    description:
      "Desarrollo de aplicaciones web a medida: ERPs, plataformas e-commerce, catálogos digitales y sistemas de cotización. Proyectos ganadores de hackathon (Dev3pack 2026, Platanus · Anthropic 2026) e integración de agentes IA con Claude y Codex.",
    descriptionEn:
      "Custom web application development: ERPs, e-commerce platforms, digital catalogs, and quote systems. Hackathon-winning projects (Dev3pack 2026, Platanus · Anthropic 2026) and AI agent integration with Claude and Codex.",
    technologies: ["Next.js", "Solana", "Claude API", "Supabase", "TypeScript"],
  },
  {
    role: "Trafficker Pago — Meta Ads",
    roleEn: "Paid Traffic Specialist — Meta Ads",
    company: "Cartera de clientes independientes",
    period: "2022 — Presente",
    description:
      "Gestión de campañas de rendimiento en Meta Ads con presupuestos de hasta $3,000/mes por cliente. Clientes activos en tecnología, reparación de dispositivos y retail. Auditorías de CPA/ROAS/CTR, audiencias personalizadas y lookalike via Meta Pixel.",
    descriptionEn:
      "Performance campaign management on Meta Ads with budgets up to $3,000/month per client. Active clients in tech, device repair, and retail. CPA/ROAS/CTR audits, custom and lookalike audiences via Meta Pixel.",
    technologies: ["Meta Ads", "Facebook Business", "Meta Pixel", "GA4", "A/B Testing"],
  },
  {
    role: "Técnico iPhone · Paid Media Specialist",
    roleEn: "iPhone Technician · Paid Media Specialist",
    company: "Servicio técnico independiente",
    period: "2022 — 2024",
    description:
      "Técnico especializado en reparación de iPhone (pantallas, baterías, puertos, diagnóstico de placa). Diseño y gestión de campañas Meta Ads para captación local de clientes del servicio técnico.",
    descriptionEn:
      "Specialized iPhone repair technician (screens, batteries, charging ports, logic board diagnostics). Designed and managed Meta Ads campaigns for local service customer acquisition.",
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
  github: "https://github.com/raor00",
  linkedin: "https://www.linkedin.com/in/rafael-oviedo-ba876420a/",
  x: "https://x.com/raor_00",
  available: true,
};

export const achievements: Achievement[] = [
  {
    icon: "🏆",
    title: "Dev3pack Global Hackathon 2026",
    titleEn: "Dev3pack Global Hackathon 2026",
    detail: "#1 Venezuela · Top 9 LATAM · #28 mundial de 386 proyectos — Tropico Wallet",
    detailEn: "#1 Venezuela · Top 9 LATAM · #28 worldwide out of 386 projects — Tropico Wallet",
    project: "tropico-wallet",
  },
  {
    icon: "🤖",
    title: "Platanus · Anthropic Hackathon 2026",
    titleEn: "Platanus · Anthropic Hackathon 2026",
    detail: "Llave — marketplace de alquiler venezolano con agente IA (Claude API)",
    detailEn: "Llave — Venezuelan rental marketplace with AI agent (Claude API)",
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
    title: "Tesis universitaria culminada",
    titleEn: "University thesis completed",
    detail: "COP'S Platform — ticket management system desarrollado y defendido como tesis, en uso como herramienta interna real",
    detailEn: "COP'S Platform — ticket management system built and defended as a thesis, in use as a real internal tool",
    project: "cops-platform",
  },
];

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
