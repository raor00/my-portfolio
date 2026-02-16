"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { skills, projects } from "@/data/portfolio";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/i18n/LanguageContext";

const featuredProjects = projects.filter((p) => p.featured);

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] },
  }),
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 1.02, 0.73, 1] } },
};
const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.21, 1.02, 0.73, 1] } },
};

/* ── Category colors ────────────────────────────────────── */
const categoryColors: Record<string, string> = {
  frontend: "rgba(217,119,6,0.07)", backend: "rgba(16,185,129,0.07)",
  database: "rgba(245,158,11,0.07)", tools: "rgba(168,85,247,0.07)",
};
const categoryBorder: Record<string, string> = {
  frontend: "rgba(217,119,6,0.18)", backend: "rgba(16,185,129,0.18)",
  database: "rgba(245,158,11,0.18)", tools: "rgba(168,85,247,0.18)",
};
const categoryText: Record<string, string> = {
  frontend: "#b45309", backend: "#059669", database: "#d97706", tools: "#7c3aed",
};

/* ── Animated counter ───────────────────────────────────── */
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num)) { setDisplay(value); return; }
    const steps = 40;
    const inc = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= num) { setDisplay(`${num}${suffix}`); clearInterval(timer); }
      else setDisplay(`${Math.floor(current)}${suffix}`);
    }, 900 / steps);
    return () => clearInterval(timer);
  }, [inView, value, suffix]);

  return <span ref={ref}>{inView ? display : "0"}</span>;
}

/* ── Section heading ────────────────────────────────────── */
function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <motion.div
      variants={staggerContainer} initial="hidden"
      whileInView="visible" viewport={{ once: true, margin: "-60px" }}
      className="mb-10 sm:mb-14"
    >
      <motion.span variants={fadeUp} className="tech-label">{label}</motion.span>
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-4xl font-bold mt-2"
        style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
      >
        {title}
      </motion.h2>
      <motion.div
        variants={lineReveal}
        className="mt-3 h-px w-16"
        style={{ background: "linear-gradient(90deg, #d97706, transparent)" }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function Home() {
  const { t, lang } = useLanguage();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 overflow-hidden">
        <span className="tech-label absolute top-24 right-8 md:right-20 hidden sm:block">NODE_0x52</span>
        <span className="tech-label absolute top-1/3 right-6 md:right-16 hidden sm:block">SYNC_ACTIVE</span>
        <span className="tech-label absolute bottom-32 left-6 md:left-16 hidden sm:block">STATUS: ONLINE</span>
        <span className="tech-label absolute top-1/2 left-4 md:left-10 hidden md:block" style={{ writingMode: "vertical-rl" }}>
          BUILD_v2.0
        </span>
        <CrossHair className="absolute top-28 right-28 md:right-56 text-black/15 hidden sm:block" />
        <CrossHair className="absolute bottom-40 right-12 md:right-32 text-black/10 hidden sm:block" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(217,119,6,0.07) 0%, transparent 65%)" }}
        />

        <div className="max-w-6xl mx-auto w-full">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col">
            <motion.div variants={fadeUp} custom={0} className="mb-8">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-widest uppercase"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", color: "#b45309",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t.hero.badge}
              </span>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="mb-6">
              <h1
                className="font-bold leading-tight tracking-tight"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  fontSize: "clamp(2.4rem, 6vw, 5rem)", color: "#0a0a0f",
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
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}
              >
                {t.hero.subtitle}
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={2} className="text-sm mb-3"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.35)", letterSpacing: "0.04em" }}>
              {t.hero.comment}
            </motion.p>

            <motion.p variants={fadeUp} custom={3} className="text-base md:text-lg max-w-xl mb-12 leading-relaxed"
              style={{ color: "rgba(0,0,0,0.55)" }}>
              {t.hero.description}
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4">
              <Link href="/proyectos" className="group glass-btn-amber inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm text-white">
                {t.hero.ctaPrimary}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/contacto" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                {t.hero.ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="tech-label">{t.hero.scroll}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-black/20 to-transparent" />
        </motion.div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5 }} className="mb-8 sm:mb-10">
            <span className="tech-label">{t.metrics.label}</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
              {t.metrics.title}
            </h2>
            <p className="text-sm mt-2 max-w-sm" style={{ color: "rgba(0,0,0,0.4)" }}>
              {t.metrics.subtitle}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { raw: "5", suffix: "", idx: 0 },
              { raw: "1", suffix: "+", idx: 1 },
              { raw: "2", suffix: "+", idx: 2 },
              { raw: "∞", suffix: "", idx: 3 },
            ].map((stat) => (
              <motion.div key={stat.idx} variants={fadeScale}
                className="group p-5 rounded-2xl transition-all hover:scale-[1.03]"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
                  {stat.raw === "∞" ? "∞" : <Counter value={stat.raw} suffix={stat.suffix} />}
                </div>
                <div className="tech-label">{t.metrics.items[stat.idx].label}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>{t.metrics.items[stat.idx].desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SKILLS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading label={t.skills.label} title={t.skills.title} />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["frontend", "backend", "database", "tools"] as const).map((cat) => (
              <motion.div key={cat} variants={fadeScale}
                className="p-5 rounded-2xl hover:scale-[1.02] transition-transform"
                style={{ background: categoryColors[cat], border: `1px solid ${categoryBorder[cat]}`, backdropFilter: "blur(8px)" }}>
                <span className="block mb-4 tech-label" style={{ color: categoryText[cat], opacity: 0.8 }}>
                  {cat.toUpperCase()}
                </span>
                <div className="flex flex-wrap gap-2">
                  {skills.filter((s) => s.category === cat).map((skill) => (
                    <span key={skill.name} className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.65)", fontFamily: "var(--font-mono-display), monospace" }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURED PROJECTS ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <motion.span variants={fadeUp} className="tech-label">{t.featuredProjects.label}</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mt-2"
                style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
                {t.featuredProjects.title}
              </motion.h2>
              <motion.div variants={lineReveal} className="mt-3 h-px w-16"
                style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/proyectos" className="group flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors"
                style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.35)" }}>
                {t.featuredProjects.viewAll}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.21, 1.02, 0.73, 1] }}
            className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 65%)" }} />
            <span className="tech-label block mb-4">{t.cta.label}</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
              {t.cta.title}{" "}
              <span style={{ color: "#d97706" }}>{t.cta.highlight}</span>
            </h2>
            <p className="mb-10 max-w-md mx-auto relative" style={{ color: "rgba(0,0,0,0.5)" }}>
              {t.cta.description}
            </p>
            <Link href="/contacto" className="glass-btn-amber inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm text-white">
              {t.cta.button}
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
