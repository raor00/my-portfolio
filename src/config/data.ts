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
  category: "frontend" | "backend" | "tools" | "database";
  level: number; // 1-5
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
    featuredPriority: 1,
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
    featuredPriority: 2,
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
    slug: "invictus-catalogo",
    title: "Invictus Catálogo",
    headline: "Catálogo digital orientado a ventas y pedidos",
    headlineEn: "Digital catalog focused on sales and order capture",
    subtitle: "Presentación de productos, control de inventario y pedidos por WhatsApp.",
    subtitleEn: "Product showcase, inventory control, and WhatsApp order flow.",
    description:
      "Solución de catálogo digital para acelerar la venta: permite mostrar productos de forma clara, mantener inventario actualizado y facilitar pedidos directos por WhatsApp.",
    descriptionEn:
      "Digital catalog solution built to accelerate sales: clear product display, updated inventory, and direct WhatsApp ordering.",
    role: "Diseño de flujo comercial y desarrollo full stack",
    roleEn: "Commercial flow design and full stack development",
    impact: "Mejoró la conversión comercial al simplificar el paso de catálogo a conversación de venta.",
    impactEn: "Improved conversion by simplifying the path from product browsing to sales conversation.",
    status: "live",
    statusLabel: "En uso",
    statusLabelEn: "In use",
    featuredPriority: 3,
    problem:
      "El negocio necesitaba mostrar productos y generar pedidos sin fricción desde móvil.",
    problemEn:
      "The business needed a low-friction way to showcase products and capture mobile orders.",
    solution:
      "Se implementó un catálogo digital con estructura de venta y atajos a WhatsApp para cierre rápido.",
    solutionEn:
      "A sales-oriented digital catalog was implemented with WhatsApp shortcuts for faster deal closing.",
    results: [
      "Navegación más clara para clientes potenciales.",
      "Pedidos más directos desde WhatsApp.",
      "Mejor organización del catálogo y stock.",
    ],
    resultsEn: [
      "Clearer navigation for potential buyers.",
      "More direct ordering via WhatsApp.",
      "Better product and stock organization.",
    ],
    resultHighlight: "Catálogo orientado a conversión con salida directa a WhatsApp.",
    resultHighlightEn: "Conversion-oriented catalog with direct WhatsApp handoff.",
    tags: ["Next.js", "Firebase", "Tailwind CSS", "WhatsApp"],
    featured: true,
    primaryCta: {
      label: "Crear mi catálogo digital",
      labelEn: "Build my digital catalog",
      href: "/contacto",
    },
    secondaryCta: {
      label: "Ver repositorio",
      labelEn: "View repository",
      href: "https://github.com/raor00/invictus-catalogo",
      external: true,
    },
    githubUrl: "https://github.com/raor00/invictus-catalogo",
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
    featuredPriority: 4,
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
    featuredPriority: 5,
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
    featured: true,
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
  { name: "React Native", category: "frontend", level: 3 },
  { name: "Next.js", category: "frontend", level: 4 },
  { name: "TypeScript", category: "frontend", level: 4 },
  { name: "JavaScript", category: "frontend", level: 5 },
  { name: "Tailwind CSS", category: "frontend", level: 5 },
  { name: "HTML / CSS", category: "frontend", level: 5 },

  // Backend
  { name: "Node.js", category: "backend", level: 3 },
  { name: "REST APIs", category: "backend", level: 4 },
  { name: "Supabase Functions", category: "backend", level: 3 },

  // Database
  { name: "Supabase", category: "database", level: 4 },
  { name: "PostgreSQL", category: "database", level: 3 },
  { name: "MySQL", category: "database", level: 2 },

  // Tools
  { name: "Git / GitHub", category: "tools", level: 4 },
  { name: "Vercel", category: "tools", level: 4 },
  { name: "VS Code", category: "tools", level: 5 },
  { name: "Claude", category: "tools", level: 4 },
  { name: "ChatGPT", category: "tools", level: 4 },
];

export const experience: Experience[] = [
  {
    role: "Full Stack Developer",
    roleEn: "Full Stack Developer",
    company: "Freelance",
    period: "2025 — Presente",
    description:
      "Desarrollo de aplicaciones web a medida para clientes de distintos sectores. Construcción de ERPs, sistemas de cotización y plataformas e-commerce desde el diseño hasta el despliegue en producción.",
    descriptionEn:
      "Custom web application development for clients across different industries. Built ERPs, quote systems, and e-commerce platforms from design to production deployment.",
    technologies: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
  },
  {
    role: "Trafficker Pago — Meta Ads",
    roleEn: "Paid Traffic Specialist — Meta Ads",
    company: "Freelance",
    period: "2023 — Presente",
    description:
      "Especialista en publicidad paga en Meta (Facebook & Instagram Ads) con 2 años de experiencia. Gestión de campañas de rendimiento, optimización de presupuestos, segmentación de audiencias y análisis de métricas para maximizar el ROI de los clientes.",
    descriptionEn:
      "Paid advertising specialist on Meta (Facebook & Instagram Ads) with 2 years of experience managing high-performance Meta Ads campaigns.",
    technologies: ["Meta Ads", "Facebook Business", "Pixel", "Analytics", "A/B Testing"],
  },
];

export const personalInfo = {
  name: "Rafael Oviedo",
  title: "Full Stack Developer",
  subtitle: "Ingeniero en Informática",
  subtitleEn: "Software Engineer",
  bio: "Soy Rafael Oviedo, Ingeniero en Informática y Full Stack Developer. Ofrezco soluciones tecnológicas integrales: desde el desarrollo de aplicaciones móviles y web, páginas web y web apps escalables y personalizadas, hasta la optimización de estrategias con IA y la gestión experta de campañas en Meta Ads para maximizar el retorno de inversión. Mi enfoque es crear soluciones robustas y a medida que impulsen el crecimiento de tu negocio.",
  bioEn:
    "I'm Rafael Oviedo, a Software Engineer and Full Stack Developer. I offer comprehensive technological solutions: from developing scalable and personalized mobile and web applications, websites, and web apps, to optimizing strategies with AI and expertly managing Meta Ads campaigns to maximize your return on investment. My approach is to create robust, tailor-made solutions that drive your business growth.",
  location: "Venezuela",
  github: "https://github.com/raor00",
  linkedin: "https://www.linkedin.com/in/rafael-oviedo-ba876420a/",
  available: true,
};
