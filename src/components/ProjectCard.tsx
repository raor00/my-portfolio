import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { useState } from "react";
import { Project } from "@/config/data";
import { useLanguage } from "@/i18n/LanguageContext";
import DemoModal from "./DemoModal";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 400, damping: 40 });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["30%", "70%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["30%", "70%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.13) 0%, transparent 65%)`;
  const [hovering, setHovering] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); setHovering(false); };
  const handleMouseEnter = () => setHovering(true);

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
    <div
      style={{ perspective: "900px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        background: "rgba(255,255,255,0.8)",
        border: hovering
          ? "1px solid rgba(217,119,6,0.3)"
          : project.featured
          ? "1px solid rgba(217,119,6,0.2)"
          : "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(12px)",
        boxShadow: hovering
          ? "0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(217,119,6,0.15)"
          : project.featured
          ? "0 4px 24px rgba(217,119,6,0.1)"
          : "0 4px 24px rgba(0,0,0,0.07)",
        transition: "border 0.2s, box-shadow 0.2s",
      }}
      className="group relative flex flex-col rounded-2xl overflow-hidden"
    >
      {project.featured && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-20"
          style={{ background: "linear-gradient(90deg, #d97706, #f59e0b 60%, transparent)" }}
        />
      )}
      {/* Mouse-tracking glare */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl z-10"
        style={{ background: glareBg, opacity: hovering ? 1 : 0, transition: "opacity 0.2s" }}
      />

      {/* Hero area */}
      <div className="relative h-44 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: project.featured
              ? "radial-gradient(ellipse at 20% 25%, rgba(217,119,6,0.3) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.88) 100%)"
              : "radial-gradient(ellipse at 20% 25%, rgba(100,100,100,0.08) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.88) 100%)",
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
            {project.featured ? (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-widest"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  background: "rgba(217,119,6,0.18)",
                  border: "1px solid rgba(217,119,6,0.42)",
                  color: "#92400e",
                  letterSpacing: "0.07em",
                }}
              >
                ★ {t.card.featured}
              </span>
            ) : (
              <span className="tech-label">{t.card.secondary}</span>
            )}
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

          {project.hackathonBadge && (
            <div className="flex">
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  fontFamily: "var(--font-mono-display), monospace",
                  background: "rgba(217,119,6,0.15)",
                  border: "1px solid rgba(217,119,6,0.35)",
                  color: "#92400e",
                  letterSpacing: "0.06em",
                }}
              >
                🏆 {project.hackathonBadge}
              </span>
            </div>
          )}

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
          {project.demo && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDemoOpen(true); }}
              className="glass-btn-amber flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg text-white"
              style={{ fontFamily: "var(--font-mono-display), monospace" }}
            >
              ▶ {t.card.viewDemo}
            </button>
          )}
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
    {project.demo && (
      <DemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        demo={project.demo}
        title={project.title}
      />
    )}
    </div>
  );
}
