"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/portfolio";
import ProjectCard from "@/components/ProjectCard";

const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

export default function ProyectosPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag ? projects.filter((p) => p.tags.includes(activeTag)) : projects;

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="tech-label">{"// PORTFOLIO"}</span>
          <h1
            className="text-4xl md:text-5xl font-bold mt-2 mb-4"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
          >
            MIS_PROYECTOS
          </h1>
          <p className="max-w-lg text-base" style={{ color: "rgba(0,0,0,0.5)" }}>
            Selección de proyectos full stack — desde arquitectura hasta despliegue en producción.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          <button
            onClick={() => setActiveTag(null)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              fontFamily: "var(--font-mono-display), monospace",
              background: activeTag === null ? "rgba(217,119,6,0.12)" : "rgba(0,0,0,0.04)",
              border: activeTag === null ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(0,0,0,0.08)",
              color: activeTag === null ? "#b45309" : "rgba(0,0,0,0.45)",
            }}
          >
            TODOS [{projects.length}]
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
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
            </button>
          ))}
        </motion.div>

        <div className="mb-10">
          <span className="tech-label">
            MOSTRANDO [{filtered.length}] DE [{projects.length}] PROYECTOS
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag ?? "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p
            className="text-center py-16 text-sm"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.2)" }}
          >
            {"// NO_RESULTS_FOUND"}
          </p>
        )}
      </div>
    </div>
  );
}
