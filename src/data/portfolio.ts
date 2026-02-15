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
      "Plataforma de comercio electrónico completa con carrito de compras, pasarela de pagos con Stripe, autenticación JWT y panel de administración.",
    image: "/projects/ecommerce.jpg",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 2,
    title: "Task Manager App",
    description:
      "Aplicación de gestión de tareas con drag & drop, etiquetas, fechas límite, colaboración en tiempo real vía WebSockets y notificaciones push.",
    image: "/projects/taskmanager.jpg",
    tags: ["React", "Express.js", "Socket.io", "MongoDB", "Redux"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 3,
    title: "REST API con Node.js",
    description:
      "API RESTful escalable para sistema de inventario con autenticación OAuth2, documentación con Swagger, rate limiting y caché con Redis.",
    image: "/projects/api.jpg",
    tags: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: 4,
    title: "Dashboard Analytics",
    description:
      "Panel de analíticas con visualizaciones interactivas, reportes exportables en PDF, filtros avanzados y actualización de datos en tiempo real.",
    image: "/projects/dashboard.jpg",
    tags: ["React", "D3.js", "Node.js", "PostgreSQL", "Chart.js"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
  },
  {
    id: 5,
    title: "Blog con CMS Headless",
    description:
      "Blog técnico con CMS headless, generación estática de páginas, búsqueda full-text, sistema de comentarios y modo oscuro/claro.",
    image: "/projects/blog.jpg",
    tags: ["Next.js", "Contentful", "TypeScript", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
  },
  {
    id: 6,
    title: "Chat en Tiempo Real",
    description:
      "Aplicación de mensajería con salas privadas y grupales, notificaciones push, envío de archivos multimedia y cifrado de mensajes.",
    image: "/projects/chat.jpg",
    tags: ["React", "Node.js", "Socket.io", "MongoDB", "WebRTC"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
  },
];

export const skills: Skill[] = [
  // Frontend
  { name: "React", category: "frontend", level: 5 },
  { name: "Next.js", category: "frontend", level: 5 },
  { name: "TypeScript", category: "frontend", level: 4 },
  { name: "Tailwind CSS", category: "frontend", level: 5 },
  { name: "HTML / CSS", category: "frontend", level: 5 },

  // Backend
  { name: "Node.js", category: "backend", level: 5 },
  { name: "Express.js", category: "backend", level: 5 },
  { name: "REST APIs", category: "backend", level: 5 },
  { name: "GraphQL", category: "backend", level: 3 },
  { name: "Socket.io", category: "backend", level: 4 },

  // Database
  { name: "PostgreSQL", category: "database", level: 4 },
  { name: "MongoDB", category: "database", level: 4 },
  { name: "Redis", category: "database", level: 3 },
  { name: "MySQL", category: "database", level: 4 },

  // Tools
  { name: "Git / GitHub", category: "tools", level: 5 },
  { name: "Docker", category: "tools", level: 4 },
  { name: "Linux", category: "tools", level: 4 },
  { name: "Figma", category: "tools", level: 3 },
];

export const experience: Experience[] = [
  {
    role: "Full Stack Developer",
    company: "Freelance",
    period: "2023 — Presente",
    description:
      "Desarrollo de aplicaciones web a medida para clientes de distintos sectores. Desde el diseño de la arquitectura hasta el despliegue en producción, asegurando código limpio y escalable.",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Docker"],
  },
  {
    role: "Desarrollador Frontend",
    company: "Startup TechLab",
    period: "2022 — 2023",
    description:
      "Lideré la migración de una SPA en Vue.js a React con TypeScript, reduciendo el tiempo de carga en un 40%. Implementé un sistema de diseño con Storybook y colaboré en la API REST con Node.js.",
    technologies: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
  },
  {
    role: "Practicante Full Stack",
    company: "Agencia Digital CreativeHub",
    period: "2021 — 2022",
    description:
      "Participé en el desarrollo de sitios web para clientes usando WordPress y soluciones personalizadas con React y PHP. Primer contacto con CI/CD con GitHub Actions.",
    technologies: ["React", "PHP", "MySQL", "WordPress"],
  },
];

export const personalInfo = {
  name: "Rafael Oviedo",
  title: "Full Stack Developer",
  subtitle: "Ingeniero en Informática",
  bio: "Soy Rafael Oviedo, Ingeniero en Informática apasionado por construir aplicaciones web robustas y escalables. Me especializo en el ecosistema JavaScript/TypeScript, trabajando tanto en el frontend con React y Next.js como en el backend con Node.js. Disfruto transformar ideas complejas en productos digitales simples, funcionales y con una excelente experiencia de usuario.",
  location: "Venezuela",
  email: "rafaeloviedo@email.com",
  github: "https://github.com/raor00",
  linkedin: "https://linkedin.com/in/rafaeloviedo",
  available: true,
};
