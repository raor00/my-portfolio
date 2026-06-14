"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { Project } from "@/config/data";
import { useLanguage } from "@/i18n/LanguageContext";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  demo: NonNullable<Project["demo"]>;
  title: string;
}

export default function DemoModal({ open, onClose, demo, title }: DemoModalProps) {
  const { t, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Touch/coarse pointer detection for disabling tilt
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // 3D tilt for the browser frame
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltEnabled = !isCoarsePointer && !prefersReducedMotion;
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], tiltEnabled ? [4, -4] : [0, 0]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], tiltEnabled ? [-4, 4] : [0, 0]), { stiffness: 400, damping: 40 });

  const handleFrameMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [tiltEnabled, mouseX, mouseY]);

  const handleFrameMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Navigation helpers
  const shots = demo.shots;
  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % shots.length), [shots.length]);
  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + shots.length) % shots.length), [shots.length]);

  // Autoplay
  useEffect(() => {
    if (!open || paused || shots.length <= 1 || prefersReducedMotion) return;
    const id = setInterval(goNext, 3200);
    return () => clearInterval(id);
  }, [open, paused, shots.length, goNext, prefersReducedMotion]);

  // Reset index on open
  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  // Keyboard + body scroll lock + focus management
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    // Focus the close button on open
    const frame = requestAnimationFrame(() => closeBtnRef.current?.focus());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      // Restore focus
      if (previousFocusRef.current && "focus" in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [open, onClose, goNext, goPrev]);

  // SSR guard for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const activeShot = shots[activeIndex];
  const caption = lang === "en" ? activeShot.captionEn : activeShot.caption;

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="demo-backdrop"
            className="glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,10,15,0.45)",
              zIndex: 100,
            }}
          />

          {/* Panel */}
          <motion.div
            key="demo-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.21, 1.02, 0.73, 1] }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "min(92vw, 880px)",
                maxHeight: "88vh",
                pointerEvents: "all",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Browser chrome */}
              <div
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderBottom: "none",
                  borderRadius: "12px 12px 0 0",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}
              >
                {/* Traffic lights */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                </div>
                {/* URL pill */}
                {demo.url && (
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.09)",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontFamily: "var(--font-mono-display), monospace",
                      color: "rgba(0,0,0,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {demo.url}
                  </div>
                )}
                {/* Close button */}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label={t.card.demoClose}
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "rgba(0,0,0,0.55)",
                    fontFamily: "var(--font-mono-display), monospace",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Carousel viewport — 16:10 */}
              <div
                style={{ perspective: "900px" }}
                onMouseMove={handleFrameMouseMove}
                onMouseLeave={handleFrameMouseLeave}
              >
                <motion.div
                  style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/10",
                    background: "#0a0a0f",
                    borderRadius: "0 0 12px 12px",
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
                  }}
                >
                  {/* Shots */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.32, ease: [0.21, 1.02, 0.73, 1] }}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Image
                        src={activeShot.src}
                        alt={activeShot.alt ?? caption}
                        fill
                        sizes="(max-width: 880px) 92vw, 880px"
                        style={{ objectFit: "cover" }}
                        loading={activeIndex === 0 ? "eager" : "lazy"}
                        priority={activeIndex === 0}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Caption overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
                      padding: "32px 20px 16px",
                      pointerEvents: "none",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={`caption-${activeIndex}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        style={{
                          margin: 0,
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          fontFamily: "var(--font-mono-display), monospace",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {caption}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Prev arrow */}
                  {shots.length > 1 && (
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label={t.card.demoPrev}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.35)",
                        backdropFilter: "blur(8px)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 16,
                        zIndex: 10,
                      }}
                    >
                      ‹
                    </button>
                  )}

                  {/* Next arrow */}
                  {shots.length > 1 && (
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={t.card.demoNext}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.35)",
                        backdropFilter: "blur(8px)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 16,
                        zIndex: 10,
                      }}
                    >
                      ›
                    </button>
                  )}

                  {/* Dot indicators */}
                  {shots.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 14,
                        right: 16,
                        display: "flex",
                        gap: 6,
                        zIndex: 10,
                      }}
                    >
                      {shots.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          aria-label={`Shot ${i + 1}`}
                          style={{
                            width: i === activeIndex ? 18 : 7,
                            height: 7,
                            borderRadius: 4,
                            border: "none",
                            background: i === activeIndex ? "#d97706" : "rgba(255,255,255,0.4)",
                            cursor: "pointer",
                            padding: 0,
                            transition: "width 0.2s, background 0.2s",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
