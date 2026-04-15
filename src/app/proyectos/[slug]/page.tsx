"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getProjectBySlug } from "@/config/data";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();

  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="min-h-screen py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="tech-label">// 404</p>
            <h1
              className="text-2xl font-bold mt-3"
              style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}
            >
              {t.projectDetail.notFoundTitle}
            </h1>
            <p className="text-sm mt-2" style={{ color: "rgba(0,0,0,0.5)" }}>
              {t.projectDetail.notFoundDescription}
            </p>
            <Link
              href="/proyectos"
              className="inline-flex mt-5 px-4 py-2 rounded-lg text-xs"
              style={{
                fontFamily: "var(--font-mono-display), monospace",
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "rgba(0,0,0,0.62)",
              }}
            >
              {t.projectDetail.backToProjects}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEn = lang === "en";
  const headline = isEn ? project.headlineEn : project.headline;
  const subtitle = isEn ? project.subtitleEn : project.subtitle;
  const role = isEn ? project.roleEn : project.role;
  const impact = isEn ? project.impactEn : project.impact;
  const description = isEn ? project.descriptionEn : project.description;
  const problem = isEn ? project.problemEn : project.problem;
  const solution = isEn ? project.solutionEn : project.solution;
  const status = isEn ? project.statusLabelEn : project.statusLabel;
  const results = isEn ? project.resultsEn : project.results;
  const resultHighlight = isEn ? project.resultHighlightEn : project.resultHighlight;
  const conversionCta = isEn ? project.conversionCtaEn : project.conversionCta;
  const primaryCtaLabel = project.primaryCta
    ? isEn
      ? project.primaryCta.labelEn
      : project.primaryCta.label
    : t.projectDetail.ctaButton;
  const secondaryCtaLabel = project.secondaryCta
    ? isEn
      ? project.secondaryCta.labelEn
      : project.secondaryCta.label
    : null;

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="mb-6">
            <Link
              href="/proyectos"
              className="tech-label"
              style={{ color: "rgba(0,0,0,0.45)" }}
            >
              ← {t.projectDetail.backToProjects}
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-3xl p-6 sm:p-8 mb-6"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="tech-label">{project.featured ? t.card.featured : t.card.secondary}</span>
              <span
                className="text-[10px] px-2.5 py-1 rounded-md"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.09)",
                  color: "rgba(0,0,0,0.52)",
                  fontFamily: "var(--font-mono-display), monospace",
                }}
              >
                {status}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}
            >
              {project.title}
            </h1>
            <h2 className="text-lg mt-3" style={{ color: "#b45309" }}>
              {headline}
            </h2>
            <p className="text-sm sm:text-base mt-3 max-w-3xl" style={{ color: "rgba(0,0,0,0.52)" }}>
              {subtitle}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5 mb-6">
            {[{ label: t.card.role, value: role }, { label: t.card.impact, value: impact }].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.68)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <p className="tech-label">{item.label}</p>
                <p className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.55)" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </motion.div>

          {resultHighlight && (
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5 mb-6"
              style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)" }}
            >
              <p className="tech-label">{t.card.result}</p>
              <p className="text-sm mt-2" style={{ color: "rgba(0,0,0,0.58)" }}>
                {resultHighlight}
              </p>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-6 mb-6"
            style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p className="tech-label">{t.projectDetail.summary}</p>
            <p className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.55)" }}>
              {description}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5 mb-6">
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <p className="tech-label">{t.projectDetail.problem}</p>
              <p className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.55)" }}>
                {problem}
              </p>
            </div>
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <p className="tech-label">{t.projectDetail.solution}</p>
              <p className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.55)" }}>
                {solution}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-6 mb-6"
            style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p className="tech-label">{t.projectDetail.results}</p>
            <ul className="mt-4 space-y-2">
              {results.map((result) => (
                <li key={result} className="text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>
                  • {result}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p className="tech-label">{t.projectDetail.ctaLabel}</p>
            <p className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.52)" }}>
              {t.projectDetail.ctaDescription}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                href={project.primaryCta?.href || "/contacto"}
                target={project.primaryCta?.external ? "_blank" : undefined}
                rel={project.primaryCta?.external ? "noopener noreferrer" : undefined}
                className="glass-btn-amber inline-flex items-center px-4 py-2 rounded-lg text-xs text-white"
                style={{ fontFamily: "var(--font-mono-display), monospace" }}
              >
                {primaryCtaLabel}
              </Link>

              <Link
                href={`/contacto?proyecto=${project.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "rgba(0,0,0,0.58)",
                }}
              >
                {conversionCta || t.card.ctaSolve}
              </Link>

              {project.secondaryCta && secondaryCtaLabel && (
                <Link
                  href={project.secondaryCta.href}
                  target={project.secondaryCta.external ? "_blank" : undefined}
                  rel={project.secondaryCta.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-xs"
                  style={{
                    fontFamily: "var(--font-mono-display), monospace",
                    background: "rgba(217,119,6,0.08)",
                    border: "1px solid rgba(217,119,6,0.2)",
                    color: "#b45309",
                  }}
                >
                  {secondaryCtaLabel}
                </Link>
              )}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-0.5 rounded-md"
                    style={{
                      background: "rgba(217,119,6,0.07)",
                      border: "1px solid rgba(217,119,6,0.18)",
                      color: "#b45309",
                      fontFamily: "var(--font-mono-display), monospace",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
