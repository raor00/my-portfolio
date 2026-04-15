"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, featuredProjects, secondaryProjects } from "@/config/data";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.21, 1.02, 0.73, 1] } },
};

const filterVariant = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.35, delay: i * 0.04, ease: [0.21, 1.02, 0.73, 1] },
  }),
};

const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

export default function ProyectosPage() {
  const { t } = useLanguage();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filteredFeatured = activeTag
    ? featuredProjects.filter((p) => p.tags.includes(activeTag))
    : featuredProjects;
  const filteredSecondary = activeTag
    ? secondaryProjects.filter((p) => p.tags.includes(activeTag))
    : secondaryProjects;
  const filteredTotal = filteredFeatured.length + filteredSecondary.length;

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-12 sm:mb-16"
        >
          <motion.span variants={fadeUp} className="tech-label">{t.projects.pageLabel}</motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold mt-2 mb-3"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
          >
            {t.projects.pageTitle}
          </motion.h1>
          <motion.div
            variants={lineReveal}
            className="mb-4 h-px w-16"
            style={{ background: "linear-gradient(90deg, #d97706, transparent)" }}
          />
          <motion.p variants={fadeUp} className="max-w-2xl text-base" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.projects.pageDescription}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="rounded-2xl p-5 sm:p-6 mb-10"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="tech-label">{t.projects.businessLabel}</p>
          <p className="text-sm mt-3 max-w-3xl" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.projects.businessDescription}
          </p>
          <Link href="/contacto" className="glass-btn-amber inline-flex mt-4 px-4 py-2 rounded-lg text-xs text-white" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
            {t.projects.contactCta}
          </Link>
        </motion.div>

        {/* ── Filters ────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2 mb-4"
        >
          <motion.button
            variants={filterVariant}
            custom={0}
            onClick={() => setActiveTag(null)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              fontFamily: "var(--font-mono-display), monospace",
              background: activeTag === null ? "rgba(217,119,6,0.12)" : "rgba(0,0,0,0.04)",
              border: activeTag === null ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(0,0,0,0.08)",
              color: activeTag === null ? "#b45309" : "rgba(0,0,0,0.45)",
            }}
          >
            {t.projects.filterAll} [{projects.length}]
          </motion.button>
          {allTags.map((tag, i) => (
            <motion.button
              key={tag}
              variants={filterVariant}
              custom={i + 1}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                background: activeTag === tag ? "rgba(217,119,6,0.12)" : "rgba(0,0,0,0.04)",
                border: activeTag === tag ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(0,0,0,0.08)",
                color: activeTag === tag ? "#b45309" : "rgba(0,0,0,0.45)",
              }}
            >
              {tag}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <span className="tech-label">
            {t.projects.showing} [{filteredTotal}] {t.projects.of} [{projects.length}]
          </span>
        </motion.div>

        {/* ── Featured ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}
            >
              {t.projects.featuredTitle}
            </h2>
            <span className="tech-label">[{filteredFeatured.length}]</span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(0,0,0,0.48)" }}>
            {t.projects.featuredDescription}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`featured-${activeTag ?? "all"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredFeatured.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Secondary ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}
            >
              {t.projects.secondaryTitle}
            </h2>
            <span className="tech-label">[{filteredSecondary.length}]</span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(0,0,0,0.48)" }}>
            {t.projects.secondaryDescription}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`secondary-${activeTag ?? "all"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredSecondary.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {filteredTotal === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-sm"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.2)" }}
          >
            {t.projects.noResults}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-2xl p-6 sm:p-7 mt-12"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="tech-label">{t.projects.bottomCtaLabel}</p>
          <h3 className="text-lg sm:text-xl font-bold mt-2" style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}>
            {t.projects.bottomCtaTitle}
          </h3>
          <p className="text-sm mt-3 max-w-3xl" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.projects.bottomCtaDescription}
          </p>
          <Link href="/contacto" className="glass-btn-amber inline-flex mt-5 px-4 py-2 rounded-lg text-xs text-white" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
            {t.projects.contactCta}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
