# Portfolio — ovi.dev

Portfolio personal de **Rafael Oviedo** — Full Stack Developer + Meta Ads Trafficker.

## Stack
- **Framework**: Next.js 15 (App Router), TypeScript
- **Estilos**: Tailwind CSS v4 (`@import "tailwindcss"` en globals.css, NO `@tailwind` directives)
- **Animaciones**: Framer Motion (whileInView, variants, layoutId)
- **Fuente**: IBM Plex Mono (`--font-mono-display`) + Inter (`--font-sans`)
- **Package manager**: pnpm
- **Deploy**: Vercel (conectado al repo GitHub `raor00/my-portfolio`)

## Diseño
- Tema claro, fondo `#f5f5f7` (grid sutil)
- Acento principal: ámbar `#d97706` / `#b45309`
- Texto principal: `#0a0a0f`
- Navbar flotante LiquidGlass (5 capas: backdrop-blur, shimmer, specular, border, contenido)
- Clase CSS clave: `.glass-btn-amber` (botón ámbar con shimmer y specular en globals.css)
- Clase CSS clave: `.tech-label` (etiqueta monospace pequeña)

## Estructura de páginas
- `/` → Home (hero, métricas animadas con Counter, skills, proyectos destacados, CTA)
- `/proyectos` → Grid de proyectos con filtros por tag
- `/sobre-mi` → Bio, experiencia (timeline), stack (barras de progreso)
- `/contacto` → Cards de redes sociales + formulario de contacto

## Internacionalización (i18n)
- Switch ES/EN en el navbar (desktop y móvil)
- Auto-detección: `navigator.language` → `localStorage` → fallback `"es"`
- Archivos clave:
  - `src/i18n/translations.ts` — todos los strings ES/EN
  - `src/i18n/LanguageContext.tsx` — Context + hook `useLanguage()`
  - `src/components/Providers.tsx` — wrapper client para el layout (Server Component)
- Hook de uso: `const { t, lang, setLang } = useLanguage()`
- El pill animado del switch usa `layoutId="lang-pill"` de Framer Motion
- Para evitar hydration mismatch: el pill solo se renderiza cuando `mounted === true`

## Datos del portfolio
- Archivo: `src/data/portfolio.ts`
- Todos los textos bilingües: `description` / `descriptionEn`, `role` / `roleEn`, `bio` / `bioEn`
- **Proyectos**: ERP iPhone, COPS Platform, TasaVE, System Quote, E-Commerce
- **Experiencia**: Full Stack Developer Freelance (2025—Present), Trafficker Meta Ads (2023—Present)
- **Skills**: React, React Native, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML/CSS, Node.js, REST APIs, Supabase Functions, Supabase, PostgreSQL, MySQL, GitHub, Vercel, VS Code, Claude, ChatGPT

## Convenciones de animación
Todos los archivos usan las mismas variantes locales:
```ts
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] } }) }
const fadeLeft = { hidden: { opacity: 0, x: -24 }, visible: ... }
const fadeScale = { hidden: { opacity: 0, scale: 0.96, y: 16 }, visible: ... }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }
const lineReveal = { hidden: { scaleX: 0, originX: 0 }, visible: { scaleX: 1, ... } }
```

## Reglas importantes
- Todas las páginas son `"use client"` (usan `useLanguage`)
- El Footer también es `"use client"` por el mismo motivo
- NO usar `@tailwind base/components/utilities` — esta versión usa `@import "tailwindcss"`
- Los colores inline con `style={{}}` son intencionales (diseño preciso)
- Git: rama `main`, historial limpio (se rehízo con orphan branch para eliminar node_modules)
- `.gitignore` incluye `.next/` y `node_modules/`
