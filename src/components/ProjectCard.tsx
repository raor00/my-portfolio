import Link from "next/link";
import { motion } from "framer-motion";
import { Project } from "@/config/data";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";

  const headline = isEn ? project.headlineEn : project.headline;
  const subtitle = isEn ? project.subtitleEn : project.subtitle;
  const role = isEn ? project.roleEn : project.role;
  const impact = isEn ? project.impactEn : project.impact;
  const resultHighlight = isEn ? project.resultHighlightEn : project.resultHighlight;
  const status = isEn ? project.statusLabelEn : project.statusLabel;
  const primaryCtaLabel = project.primaryCta
    ? isEn
      ? project.primaryCta.labelEn
      : project.primaryCta.label
    : t.card.ctaSimilar;
  const secondaryCtaLabel = project.secondaryCta
    ? isEn
      ? project.secondaryCta.labelEn
      : project.secondaryCta.label
    : null;
  const conversionCta = isEn ? project.conversionCtaEn : project.conversionCta;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      {/* Hover border glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
        style={{ boxShadow: "inset 0 0 0 1.5px rgba(217,119,6,0.25)" }}
      />

      {/* Hero area */}
      <div className="relative h-44 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 25%, rgba(217,119,6,0.18) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.88) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="tech-label">{project.featured ? t.card.featured : t.card.secondary}</span>
            <span
              className="text-[10px] px-2.5 py-1 rounded-md"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "rgba(0,0,0,0.55)",
                fontFamily: "var(--font-mono-display), monospace",
              }}
            >
              {status}
            </span>
          </div>

          <div>
            <h4
              className="text-sm font-semibold"
              style={{ color: "#0a0a0f", fontFamily: "var(--font-mono-display), monospace" }}
            >
              {headline}
            </h4>
          </div>
        </div>
        <span className="absolute bottom-3 left-3 tech-label">
          {project.tags[0].toUpperCase()}_MOD
        </span>
        <div
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.8), transparent)" }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          className="text-base font-bold mb-1 group-hover:text-amber-700 transition-colors"
          style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
        >
          {project.title}
        </h3>

        <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.52)" }}>
          {subtitle}
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.46)" }}>
            <strong style={{ color: "#0a0a0f" }}>{t.card.role}:</strong> {role}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.46)" }}>
            <strong style={{ color: "#0a0a0f" }}>{t.card.impact}:</strong> {impact}
          </p>
          {resultHighlight && (
            <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.46)" }}>
              <strong style={{ color: "#0a0a0f" }}>{t.card.result}:</strong> {resultHighlight}
            </p>
          )}
        </div>

        <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "rgba(0,0,0,0.42)" }}>
          {isEn ? project.descriptionEn : project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
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

        {/* Links */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <Link
            href={`/proyectos/${project.slug}`}
            className="glass-btn-amber flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg text-white"
            style={{ fontFamily: "var(--font-mono-display), monospace" }}
          >
            {t.card.ctaDetail}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {project.primaryCta && project.primaryCta.href !== "/contacto" && (
            <Link
              href={project.primaryCta.href}
              target={project.primaryCta.external ? "_blank" : undefined}
              rel={project.primaryCta.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.2)",
                color: "#b45309",
                fontFamily: "var(--font-mono-display), monospace",
              }}
            >
              {primaryCtaLabel}
            </Link>
          )}

          {project.secondaryCta && secondaryCtaLabel && (
            <Link
              href={project.secondaryCta.href}
              target={project.secondaryCta.external ? "_blank" : undefined}
              rel={project.secondaryCta.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.2)",
                color: "#b45309",
                fontFamily: "var(--font-mono-display), monospace",
              }}
            >
              {secondaryCtaLabel}
            </Link>
          )}

          <Link
            href={`/contacto?proyecto=${project.slug}`}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.09)",
              color: "rgba(0,0,0,0.6)",
              fontFamily: "var(--font-mono-display), monospace",
            }}
          >
            {conversionCta || t.card.ctaSolve}
          </Link>

          {project.githubUrl && project.githubUrl !== "#" && !project.secondaryCta && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.09)",
                color: "rgba(0,0,0,0.55)",
                fontFamily: "var(--font-mono-display), monospace",
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              {t.card.github}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
