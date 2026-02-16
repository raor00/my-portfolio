"use client";

import { motion } from "framer-motion";
import { skills, experience, personalInfo } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.21, 1.02, 0.73, 1] },
  }),
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 1.02, 0.73, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.21, 1.02, 0.73, 1] } },
};

const categoryLabels: Record<string, string> = {
  frontend: "FRONTEND", backend: "BACKEND", database: "DATABASE", tools: "TOOLS",
};

export default function SobreMiPage() {
  const { t, lang } = useLanguage();
  const bio = lang === "en" ? personalInfo.bioEn : personalInfo.bio;

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-16 sm:mb-20">
          <motion.span variants={fadeUp} className="tech-label">{t.about.pageLabel}</motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mt-2"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
            {t.about.pageTitle}
          </motion.h1>
          <motion.div variants={lineReveal} className="mt-3 h-px w-16"
            style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
        </motion.div>

        {/* Bio */}
        <motion.div variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }} className="grid lg:grid-cols-5 gap-12 mb-20 sm:mb-24 items-start">
          {/* Avatar */}
          <motion.div variants={fadeLeft} className="lg:col-span-2 flex justify-center lg:justify-start">
            <div className="relative">
              <div className="w-52 h-52 rounded-3xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <div className="absolute inset-0 rounded-3xl overflow-hidden"
                  style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <span className="relative text-6xl select-none">👨‍💻</span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(74,222,128,0.3)", backdropFilter: "blur(8px)", fontFamily: "var(--font-mono-display), monospace", fontSize: "10px", color: "#16a34a", letterSpacing: "0.1em", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t.about.statusBadge}
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={stagger} className="lg:col-span-3 space-y-5">
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
                {personalInfo.name}
              </h2>
              <p className="text-xs tracking-widest mt-1" style={{ fontFamily: "var(--font-mono-display), monospace", color: "#b45309" }}>
                {t.about.bioTitle}
              </p>
            </motion.div>
            <motion.p variants={fadeUp} className="leading-relaxed" style={{ color: "rgba(0,0,0,0.55)" }}>
              {bio}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {[
                { icon: "◎", label: personalInfo.location },
                { icon: "✉", label: personalInfo.email },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.5)", fontFamily: "var(--font-mono-display), monospace" }}>
                  <span style={{ color: "#d97706" }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-3 pt-1">
              {[
                { label: "GITHUB", href: personalInfo.github, icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg> },
                { label: "LINKEDIN", href: personalInfo.linkedin, icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.09)", color: "rgba(0,0,0,0.55)", fontFamily: "var(--font-mono-display), monospace" }}>
                  {s.icon}{s.label}
                </a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Experiencia */}
        <div className="mb-20 sm:mb-24">
          <motion.div variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }} className="mb-10 sm:mb-12">
            <motion.span variants={fadeUp} className="tech-label">{t.about.experienceLabel}</motion.span>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mt-1"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
              {t.about.experienceTitle}
            </motion.h2>
            <motion.div variants={lineReveal} className="mt-3 h-px w-16"
              style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
          </motion.div>

          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(to bottom, rgba(217,119,6,0.3), rgba(217,119,6,0.03))" }} />
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <motion.div key={i} variants={fadeLeft} custom={i} initial="hidden" whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }} className="relative pl-12">
                  <div className="absolute left-0 top-2 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="p-5 rounded-2xl transition-all hover:scale-[1.005]"
                    style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(8px)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
                          {lang === "en" ? exp.roleEn.toUpperCase() : exp.role.toUpperCase()}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ fontFamily: "var(--font-mono-display), monospace", color: "#b45309" }}>
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-lg"
                        style={{ fontFamily: "var(--font-mono-display), monospace", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.35)", letterSpacing: "0.08em" }}>
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>
                      {lang === "en" ? exp.descriptionEn : exp.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.technologies.map((tech) => (
                        <span key={tech} className="text-[11px] px-2 py-0.5 rounded-md"
                          style={{ fontFamily: "var(--font-mono-display), monospace", background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.18)", color: "#b45309" }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stack */}
        <div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }} className="mb-10 sm:mb-12">
            <motion.span variants={fadeUp} className="tech-label">{t.about.skillsLabel}</motion.span>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mt-1"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}>
              {t.about.skillsTitle}
            </motion.h2>
            <motion.div variants={lineReveal} className="mt-3 h-px w-16"
              style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-2 gap-4">
            {(["frontend", "backend", "database", "tools"] as const).map((cat) => (
              <motion.div key={cat} variants={fadeScale} className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(8px)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <span className="block mb-4 tech-label" style={{ color: "rgba(0,0,0,0.3)" }}>
                  {categoryLabels[cat]}
                </span>
                <div className="space-y-3">
                  {skills.filter((s) => s.category === cat).map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs" style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.65)" }}>
                          {skill.name}
                        </span>
                        <span className="tech-label">{skill.level * 20}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                        <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #b45309, #f59e0b)" }}
                          initial={{ width: 0 }} whileInView={{ width: `${skill.level * 20}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
