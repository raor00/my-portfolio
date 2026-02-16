export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
}

export interface Skill {
  name: string;
  category: "frontend" | "backend" | "tools" | "database";
  level: number; // 1-5
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Full Stack",
    description:
      "Plataforma de comercio electrónico completa con carrito de compras, pasarela de pagos, autenticación y panel de administración. En desarrollo.",
    image: "/projects/ecommerce.jpg",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 2,
    title: "ERP — Tienda iPhone",
    description:
      "Sistema ERP para tienda especializada en iPhone: gestión de inventario, ventas, clientes, reparaciones y reportes financieros en un solo panel.",
    image: "/projects/erp.jpg",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 3,
    title: "System Quote",
    description:
      "Sistema de cotizaciones para generar, gestionar y hacer seguimiento de presupuestos a clientes. Exportación a PDF y control de estados.",
    image: "/projects/quote.jpg",
    tags: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 4,
    title: "Sistema de Soporte — Tickets",
    description:
      "Plataforma de soporte técnico con gestión de tickets, asignación de agentes, prioridades, historial de conversaciones y notificaciones en tiempo real.",
    image: "/projects/tickets.jpg",
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
    company: "Freelance",
    period: "2025 — Presente",
    description:
      "Desarrollo de aplicaciones web a medida para clientes de distintos sectores. Construcción de ERPs, sistemas de cotización y plataformas e-commerce desde el diseño hasta el despliegue en producción.",
    technologies: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
  },
  {
    role: "Trafficker Pago — Meta Ads",
    company: "Freelance",
    period: "2023 — Presente",
    description:
      "Especialista en publicidad paga en Meta (Facebook & Instagram Ads) con 2 años de experiencia. Gestión de campañas de rendimiento, optimización de presupuestos, segmentación de audiencias y análisis de métricas para maximizar el ROI de los clientes.",
    technologies: ["Meta Ads", "Facebook Business", "Pixel", "Analytics", "A/B Testing"],
  },
];

export const personalInfo = {
  name: "Rafael Oviedo",
  title: "Full Stack Developer",
  subtitle: "Ingeniero en Informática",
  bio: "Soy Rafael Oviedo, Ingeniero en Informática con 1 año de experiencia en desarrollo web. Me especializo en el ecosistema JavaScript/TypeScript, construyendo tanto frontends modernos con React y Next.js como backends con Node.js y Supabase. También soy trafficker pago especializado en Meta Ads con 2 años de experiencia gestionando campañas de alto rendimiento.",
  location: "Venezuela",
  email: "rafaeloviedo@email.com",
  github: "https://github.com/raor00",
  linkedin: "https://linkedin.com/in/rafaeloviedo",
  available: true,
};
