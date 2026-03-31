export interface Project {
  id: number;
  title: string;
  description: string;
  descriptionEn: string;
  image: string;
  tags: string[];
  demoUrl: string;
  githubUrl?: string;
  featured: boolean;
  githubRepoName?: string;
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

export const projects: Project[] = [
  {
    id: 1,
    title: "ERP — Tienda iPhone",
    description:
      "Sistema ERP para tienda especializada en iPhone: gestión de inventario, ventas, clientes, reparaciones y reportes financieros en un solo panel.",
    descriptionEn:
      "ERP system for an iPhone specialty store: inventory management, sales, customers, repairs, and financial reports all in one dashboard.",
    image: "/projects/erp.jpg",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "https://github.com/raor00/v0-ip-hone-store-erp",
    featured: true,
  },
  {
    id: 2,
    title: "COPS Platform",
    description:
      "Plataforma empresarial para empresa de soluciones tecnológicas: website corporativa y sistema de soporte con gestión de tickets, agentes y seguimiento de casos.",
    descriptionEn:
      "Enterprise platform for a tech solutions company: corporate website and support system with ticket management, agent assignment, and case tracking.",
    image: "/projects/cops.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    demoUrl: "#",
    githubUrl: "https://github.com/raor00/cops-platform",
    featured: true,
  },
  {
    id: 3,
    title: "TasaVE",
    description:
      "Monitor del dólar en Venezuela en tiempo real. Consulta las tasas de cambio del BCV, dólar paralelo y otras referencias con historial y alertas.",
    descriptionEn:
      "Real-time Venezuela dollar rate monitor. Check BCV exchange rates, parallel dollar, and other references with history and alerts.",
    image: "/projects/tasave.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "https://github.com/raor00/TasaVE",
    featured: true,
  },
  {
    id: 4,
    title: "System Quote — COPS",
    description:
      "Sistema de cotizaciones para COPS Electronics: generación y gestión de presupuestos, control de estados y seguimiento a clientes.",
    descriptionEn:
      "Quote system for COPS Electronics: budget generation and management, status tracking, and client follow-up.",
    image: "/projects/quote.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "https://github.com/raor00/v0-cops-electronics-quote-system",
    featured: false,
  },
  {
    id: 5,
    title: "E-Commerce Full Stack",
    description:
      "Plataforma de comercio electrónico con carrito de compras, pasarela de pagos, autenticación y panel de administración. En desarrollo.",
    descriptionEn:
      "E-commerce platform with shopping cart, payment gateway, authentication, and admin dashboard. Currently in development.",
    image: "/projects/ecommerce.jpg",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
  },
];

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