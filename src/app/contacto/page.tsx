"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { personalInfo } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.21, 1.02, 0.73, 1] },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.21, 1.02, 0.73, 1] },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, delay: 0.15, ease: [0.21, 1.02, 0.73, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.21, 1.02, 0.73, 1] } },
};

/* ── Types ──────────────────────────────────────────────── */
interface FormData   { nombre: string; email: string; mensaje: string; }
interface FormErrors { nombre?: string; email?: string; mensaje?: string; }
type Status = "idle" | "loading" | "success";

export default function ContactoPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormData>({ nombre: "", email: "", mensaje: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate(d: FormData): FormErrors {
    const e: FormErrors = {};
    if (!d.nombre.trim()) e.nombre = t.contact.errors.nameRequired;
    else if (d.nombre.trim().length < 2) e.nombre = t.contact.errors.nameMin;
    if (!d.email.trim()) e.email = t.contact.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = t.contact.errors.emailInvalid;
    if (!d.mensaje.trim()) e.mensaje = t.contact.errors.messageRequired;
    else if (d.mensaje.trim().length < 10) e.mensaje = t.contact.errors.messageMin;
    return e;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    background: "rgba(255,255,255,0.8)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.4)" : "rgba(0,0,0,0.1)"}`,
    color: "#0a0a0f",
    boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
  });

  return (
    <div className="min-h-screen py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-12 sm:mb-16"
        >
          <motion.span variants={fadeUp} className="tech-label">{t.contact.pageLabel}</motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold mt-2 mb-3"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
          >
            {t.contact.pageTitle}
          </motion.h1>
          <motion.div
            variants={lineReveal}
            className="mb-4 h-px w-16"
            style={{ background: "linear-gradient(90deg, #d97706, transparent)" }}
          />
          <motion.p variants={fadeUp} className="max-w-lg" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.contact.pageDescription}
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── Info cards ─────────────────────────────── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-3"
          >
            {[
              {
                label: "GITHUB",
                value: "raor00",
                href: personalInfo.github,
                iconBg: "rgba(36,41,46,0.08)",
                iconBorder: "rgba(36,41,46,0.18)",
                iconColor: "#24292e",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
              },
              {
                label: "LINKEDIN",
                value: "Rafael Oviedo",
                href: personalInfo.linkedin,
                iconBg: "rgba(0,119,181,0.08)",
                iconBorder: "rgba(0,119,181,0.22)",
                iconColor: "#0077B5",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
              },
              {
                label: "X / TWITTER",
                value: "@raor_00",
                href: "https://x.com/raor_00",
                iconBg: "rgba(0,0,0,0.06)",
                iconBorder: "rgba(0,0,0,0.14)",
                iconColor: "#000000",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.a
                key={item.label}
                variants={fadeLeft}
                custom={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] group"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                    color: item.iconColor,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="tech-label text-left">{item.label}</p>
                  <p className="text-sm mt-0.5 group-hover:text-amber-700 transition-colors" style={{ color: "rgba(0,0,0,0.6)" }}>
                    {item.value}
                  </p>
                </div>
              </motion.a>
            ))}

            <motion.div
              variants={fadeLeft}
              custom={3}
              className="p-4 rounded-2xl mt-2"
              style={{ background: "rgba(240,253,244,0.8)", border: "1px solid rgba(74,222,128,0.25)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span
                  className="text-xs text-green-700"
                  style={{ fontFamily: "var(--font-mono-display), monospace", letterSpacing: "0.08em" }}
                >
                  {t.contact.available}
                </span>
              </div>
              <p className="tech-label mt-1">{t.contact.responseTime}</p>
            </motion.div>
          </motion.div>

          {/* ── Form ───────────────────────────────────── */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3"
          >
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: [0.21, 1.02, 0.73, 1] }}
                className="h-full flex flex-col items-center justify-center text-center py-20 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, ease: [0.21, 1.02, 0.73, 1] }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl text-green-600"
                  style={{ background: "rgba(240,253,244,0.9)", border: "1px solid rgba(74,222,128,0.3)" }}
                >
                  ✓
                </motion.div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
                >
                  {t.contact.successTitle}
                </h3>
                <p className="mb-6 text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{t.contact.successDesc}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-xs transition-colors hover:opacity-70"
                  style={{ fontFamily: "var(--font-mono-display), monospace", color: "#b45309" }}
                >
                  {t.contact.sendAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                noValidate
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="p-5 sm:p-7 rounded-2xl space-y-5"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <motion.span variants={fadeUp} className="tech-label block mb-2">{t.contact.formLabel}</motion.span>

                {/* Name */}
                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="nombre"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    {t.contact.nameLabel} <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <input
                    id="nombre" name="nombre" type="text"
                    value={form.nombre} onChange={handleChange}
                    placeholder={t.contact.namePlaceholder}
                    className={inputCls}
                    style={inputStyle(!!errors.nombre)}
                  />
                  {errors.nombre && (
                    <p className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
                      {errors.nombre}
                    </p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    {t.contact.emailLabel} <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder={t.contact.emailPlaceholder}
                    className={inputCls}
                    style={inputStyle(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
                      {errors.email}
                    </p>
                  )}
                </motion.div>

                {/* Message */}
                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="mensaje"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    {t.contact.messageLabel} <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <textarea
                    id="mensaje" name="mensaje" rows={5}
                    value={form.mensaje} onChange={handleChange}
                    placeholder={t.contact.messagePlaceholder}
                    className={`${inputCls} resize-none`}
                    style={inputStyle(!!errors.mensaje)}
                  />
                  {errors.mensaje ? (
                    <p className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
                      {errors.mensaje}
                    </p>
                  ) : (
                    <p className="tech-label mt-1">{form.mensaje.length}/500</p>
                  )}
                </motion.div>

                <motion.button
                  variants={fadeUp}
                  type="submit"
                  disabled={status === "loading"}
                  className="glass-btn-amber w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm text-white"
                  style={{ fontFamily: "var(--font-mono-display), monospace", letterSpacing: "0.07em" }}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t.contact.sending}
                    </>
                  ) : (
                    <>
                      {t.contact.submit}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
