"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/portfolio";
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
  const filtered = activeTag ? projects.filter((p) => p.tags.includes(activeTag)) : projects;

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
          <motion.p variants={fadeUp} className="max-w-lg text-base" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.projects.pageDescription}
          </motion.p>
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
            {t.projects.showing} [{filtered.length}] {t.projects.of} [{projects.length}]
          </span>
        </motion.div>

        {/* ── Grid ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag ?? "all"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-sm"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.2)" }}
          >
            {t.projects.noResults}
          </motion.p>
        )}
      </div>
    </div>
  );
}
