"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { skills, projects } from "@/data/portfolio";
import ProjectCard from "@/components/ProjectCard";

const featuredProjects = projects.filter((p) => p.featured);

const categoryColors: Record<string, string> = {
  frontend: "rgba(217,119,6,0.07)",
  backend:  "rgba(16,185,129,0.07)",
  database: "rgba(245,158,11,0.07)",
  tools:    "rgba(168,85,247,0.07)",
};
const categoryBorder: Record<string, string> = {
  frontend: "rgba(217,119,6,0.18)",
  backend:  "rgba(16,185,129,0.18)",
  database: "rgba(245,158,11,0.18)",
  tools:    "rgba(168,85,247,0.18)",
};
const categoryText: Record<string, string> = {
  frontend: "#b45309",
  backend:  "#059669",
  database: "#d97706",
  tools:    "#7c3aed",
};

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 overflow-hidden">
        {/* Tech decorators — hidden on small screens to avoid overflow */}
        <span className="tech-label absolute top-24 right-8 md:right-20 hidden sm:block">NODE_0x52</span>
        <span className="tech-label absolute top-1/3 right-6 md:right-16 hidden sm:block">SYNC_ACTIVE</span>
        <span className="tech-label absolute bottom-32 left-6 md:left-16 hidden sm:block">STATUS: ONLINE</span>
        <span
          className="tech-label absolute top-1/2 left-4 md:left-10 hidden md:block"
          style={{ writingMode: "vertical-rl" }}
        >
          BUILD_v2.0
        </span>

        {/* Crosshairs — hide on smallest screens */}
        <CrossHair className="absolute top-28 right-28 md:right-56 text-black/15 hidden sm:block" />
        <CrossHair className="absolute bottom-40 right-12 md:right-32 text-black/10 hidden sm:block" />

        {/* Subtle indigo glow */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(217,119,6,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-6xl mx-auto w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.2)",
                color: "#b45309",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              ■ FULL STACK DEV_V2
            </span>
          </motion.div>

          {/* Headline — proportional, not gigantic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mb-6"
          >
            <h1
              className="font-bold leading-tight tracking-tight"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                fontSize: "clamp(2.4rem, 6vw, 5rem)",
                color: "#0a0a0f",
              }}
            >
              Rafael Oviedo
            </h1>
            <div
              className="mt-1 font-semibold tracking-widest"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
                background: "linear-gradient(90deg, #b45309, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FULL STACK DEVELOPER · INGENIERO EN INFORMÁTICA
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm mb-3"
            style={{
              fontFamily: "var(--font-mono-display), monospace",
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.04em",
            }}
          >
            {"// construyo para la web"}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-base md:text-lg max-w-xl mb-12 leading-relaxed"
            style={{ color: "rgba(0,0,0,0.55)" }}
          >
            Construyo aplicaciones web modernas y escalables — desde APIs robustas
            hasta interfaces elegantes. Full stack de principio a fin.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/proyectos"
              className="group glass-btn-amber inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm text-white"
            >
              Ver proyectos
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/contacto"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              }}
            >
              Contáctame
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="tech-label">SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-black/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50+", label: "PROYECTOS" },
            { value: "3+",  label: "AÑOS_EXP" },
            { value: "99%", label: "UPTIME_AVG" },
            { value: "∞",   label: "CAFÉ_CONSUMIDO" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center md:text-left"
            >
              <div
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  color: "#0a0a0f",
                }}
              >
                {stat.value}
              </div>
              <div className="tech-label text-left">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SKILLS
      ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-14"
          >
            <span className="tech-label">{"// STACK"}</span>
            <h2
              className="text-3xl md:text-4xl font-bold mt-2"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
            >
              TECNOLOGÍAS_
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["frontend", "backend", "database", "tools"] as const).map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl hover:scale-[1.02] transition-transform"
                style={{
                  background: categoryColors[cat],
                  border: `1px solid ${categoryBorder[cat]}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  className="block mb-4 tech-label"
                  style={{ color: categoryText[cat], opacity: 0.8 }}
                >
                  {cat.toUpperCase()}
                </span>
                <div className="flex flex-wrap gap-2">
                  {skills.filter((s) => s.category === cat).map((skill) => (
                    <span
                      key={skill.name}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        color: "rgba(0,0,0,0.65)",
                        fontFamily: "var(--font-mono-display), monospace",
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PROJECTS
      ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14"
          >
            <div>
              <span className="tech-label">{"// TRABAJO"}</span>
              <h2
                className="text-3xl md:text-4xl font-bold mt-2"
                style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
              >
                PROYECTOS_DESTACADOS
              </h2>
            </div>
            <Link
              href="/proyectos"
              className="group flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              VER_TODOS
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 65%)",
              }}
            />
            <span className="tech-label block mb-4">{"// DISPONIBLE"}</span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 relative"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                color: "#0a0a0f",
              }}
            >
              ¿Tienes un{" "}
              <span style={{ color: "#d97706" }}>
                proyecto?
              </span>
            </h2>
            <p className="mb-10 max-w-md mx-auto relative" style={{ color: "rgba(0,0,0,0.5)" }}>
              Estoy disponible para proyectos freelance y colaboraciones. Hablemos.
            </p>
            <Link
              href="/contacto"
              className="glass-btn-amber inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm text-white"
            >
              Iniciar conversación
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function CrossHair({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} fill="none">
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="0.5" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}
