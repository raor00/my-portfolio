"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { personalInfo } from "@/data/portfolio";

interface FormData   { nombre: string; email: string; mensaje: string; }
interface FormErrors { nombre?: string; email?: string; mensaje?: string; }
type Status = "idle" | "loading" | "success";

function validate(d: FormData): FormErrors {
  const e: FormErrors = {};
  if (!d.nombre.trim()) e.nombre = "El nombre es obligatorio";
  else if (d.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
  if (!d.email.trim()) e.email = "El email es obligatorio";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Email inválido";
  if (!d.mensaje.trim()) e.mensaje = "El mensaje es obligatorio";
  else if (d.mensaje.trim().length < 10) e.mensaje = "Mínimo 10 caracteres";
  return e;
}

export default function ContactoPage() {
  const [form, setForm] = useState<FormData>({ nombre: "", email: "", mensaje: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="tech-label">{"// CONTACTO"}</span>
          <h1
            className="text-4xl md:text-5xl font-bold mt-2 mb-4"
            style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
          >
            HABLEMOS_
          </h1>
          <p className="max-w-lg" style={{ color: "rgba(0,0,0,0.5)" }}>
            ¿Tienes un proyecto o idea? Escríbeme. Respondo en menos de 24 horas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-3"
          >
            {[
              { label: "EMAIL",      value: personalInfo.email,     href: `mailto:${personalInfo.email}`, icon: "✉" },
              { label: "GITHUB",     value: "raor00",               href: personalInfo.github,            icon: "◈" },
              { label: "LINKEDIN",   value: "Rafael Oviedo",        href: personalInfo.linkedin,          icon: "◉" },
              { label: "X / TWITTER", value: "@raor_00",            href: "https://x.com/raor_00",        icon: "✕" },
            ].map((item) => (
              <a
                key={item.label}
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
                    background: "rgba(217,119,6,0.08)",
                    border: "1px solid rgba(217,119,6,0.18)",
                    color: "#d97706",
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
              </a>
            ))}

            <div
              className="p-4 rounded-2xl mt-2"
              style={{ background: "rgba(240,253,244,0.8)", border: "1px solid rgba(74,222,128,0.25)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span
                  className="text-xs text-green-700"
                  style={{ fontFamily: "var(--font-mono-display), monospace", letterSpacing: "0.08em" }}
                >
                  DISPONIBLE_PARA_PROYECTOS
                </span>
              </div>
              <p className="tech-label mt-1">TIEMPO_RESPUESTA: &lt;24H</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-20 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl text-green-600"
                  style={{ background: "rgba(240,253,244,0.9)", border: "1px solid rgba(74,222,128,0.3)" }}
                >
                  ✓
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-mono-display), monospace", color: "#0a0a0f" }}
                >
                  MENSAJE_ENVIADO
                </h3>
                <p className="mb-6 text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>Gracias, te respondo pronto.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-xs transition-colors"
                  style={{ fontFamily: "var(--font-mono-display), monospace", color: "#b45309" }}
                >
                  {"// ENVIAR_OTRO_MENSAJE"}
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="p-5 sm:p-7 rounded-2xl space-y-5"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <span className="tech-label block mb-2">{"// INIT_CONTACT"}</span>

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    NOMBRE <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <input
                    id="nombre" name="nombre" type="text"
                    value={form.nombre} onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className={inputCls}
                    style={inputStyle(!!errors.nombre)}
                  />
                  {errors.nombre && (
                    <p className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    EMAIL <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="tu@email.com"
                    className={inputCls}
                    style={inputStyle(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="mensaje"
                    className="block mb-2 text-xs"
                    style={{ fontFamily: "var(--font-mono-display), monospace", color: "rgba(0,0,0,0.45)", letterSpacing: "0.1em" }}
                  >
                    MENSAJE <span style={{ color: "#d97706" }}>*</span>
                  </label>
                  <textarea
                    id="mensaje" name="mensaje" rows={5}
                    value={form.mensaje} onChange={handleChange}
                    placeholder="Cuéntame sobre tu proyecto..."
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
                </div>

                <button
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
                      ENVIANDO...
                    </>
                  ) : (
                    <>
                      ENVIAR_MENSAJE
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
