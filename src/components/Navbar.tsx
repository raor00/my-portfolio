"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  const links = [
    { href: "/",          label: t.nav.home },
    { href: "/proyectos", label: t.nav.projects },
    { href: "/sobre-mi",  label: t.nav.about },
    { href: "/contacto",  label: t.nav.contact },
  ];

  return (
    <>
      {/* ─── Desktop: floating LiquidGlass island ─── */}
      <header
        className="fixed top-4 left-1/2 z-50 hidden md:block"
        style={{ transform: "translateX(-50%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Layer 1: backdrop blur */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.68) 100%)",
            }}
          />
          {/* Layer 2: shimmer sweep */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="absolute top-0 -left-full h-full w-1/2"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                animation: "shimmer-sweep 9s ease-in-out infinite",
                animationDelay: "3s",
              }}
            />
          </div>
          {/* Layer 3: specular highlight */}
          <div
            className="absolute top-0 left-6 right-6 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(230,230,255,1) 50%, rgba(255,255,255,0.9) 70%, transparent)",
              animation: "specular-breathe 5s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          {/* Layer 4: border + shadow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.85),
                0 0 0 1.5px rgba(217,119,6,0.18),
                inset 0 0 0 0.5px rgba(255,255,255,0.7),
                0 8px 32px rgba(0,0,0,0.10),
                0 2px 8px rgba(0,0,0,0.07)
              `,
            }}
            aria-hidden="true"
          />

          {/* Nav content */}
          <nav className="relative z-10 flex items-center gap-1 px-3 py-2.5">
            {/* Logo */}
            <Link
              href="/"
              className="text-sm font-bold tracking-tight mr-4 px-2 py-1"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
            >
              ovi<span style={{ color: "#d97706" }}>.</span>dev
            </Link>

            {/* Links */}
            <div className="flex items-center gap-0.5">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-3.5 py-1.5 text-[13px] font-medium rounded-xl transition-colors"
                    style={{ color: active ? "#0a0a0f" : "rgba(0,0,0,0.45)" }}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}
                        transition={{ type: "spring", duration: 0.35 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-black/10 mx-2" />

            {/* Language switch */}
            <LangSwitch lang={lang} setLang={setLang} />

            {/* Divider */}
            <div className="w-px h-4 bg-black/10 mx-2" />

            {/* CTA */}
            <Link href="/contacto" className="glass-btn-amber px-4 py-1.5 text-[13px] rounded-xl text-white">
              {t.nav.cta}
            </Link>
          </nav>
        </motion.div>
      </header>

      {/* ─── Mobile ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div
          className="mx-3 mt-3 rounded-2xl overflow-hidden"
          style={{
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            background: "rgba(255,255,255,0.75)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.9), 0 0 0 1.5px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
            >
              ovi<span style={{ color: "#d97706" }}>.</span>dev
            </Link>

            <div className="flex items-center gap-2">
              {/* Language switch mobile */}
              <LangSwitch lang={lang} setLang={setLang} />

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(0,0,0,0.5)" }}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t px-3 pb-3"
                style={{ borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div className="pt-2 flex flex-col gap-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        color: pathname === link.href ? "#0a0a0f" : "rgba(0,0,0,0.45)",
                        background: pathname === link.href ? "rgba(0,0,0,0.05)" : "transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}

/* ── Language Switch component ──────────────────────────── */
function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {(["es", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2.5 py-1 text-[11px] font-semibold transition-all"
          style={{
            fontFamily: "var(--font-mono-display), monospace",
            letterSpacing: "0.08em",
            background: lang === l ? "rgba(217,119,6,0.12)" : "transparent",
            color: lang === l ? "#b45309" : "rgba(0,0,0,0.35)",
            borderRight: l === "es" ? "1px solid rgba(0,0,0,0.08)" : "none",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
