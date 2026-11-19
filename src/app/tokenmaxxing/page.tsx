"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { useLanguage } from "@/i18n/LanguageContext";
import rawData from "@/data/tokenmaxxing.json";

/* ── Data shape (mirrors src/data/tokenmaxxing.json) ─────── */
interface DayModel {
  provider: string;
  model: string;
  tokens: number;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  costUsd: number;
}

interface DayProvider {
  tokens: number;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  costUsd: number;
}

interface DayEntry {
  date: string;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  providers: Record<string, DayProvider>;
  models: DayModel[];
}

interface BreakdownProvider {
  provider: string;
  label: string;
  sessions: number;
  tokens: number;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  costUsd: number;
}

interface BreakdownModel extends Omit<BreakdownProvider, "costUsd"> {
  model: string;
  costUsd: number;
  lastUsed: string;
}

interface BreakdownWindow {
  providers: BreakdownProvider[];
  models: BreakdownModel[];
}

interface QuotaProvider {
  id: string;
  plan: string;
  status: "ok" | "stale" | "error";
  windows: { label: string; usedPercent: number; resetsAt: string | null; windowSeconds: number }[];
  error: string | null;
}

type BreakdownKey = "7" | "30" | "90" | "365" | "all";
type Period = 7 | 30 | 90 | 0;
type Metric = "tokens" | "cost";
type ChartMode = "provider" | "model";
type BreakdownTab = "provider" | "model" | "day";

interface TokenmaxxingData {
  generatedAt: string;
  timezone: string;
  firstUsageDate: string;
  totals: {
    processedTokens: number;
    cachedInput: number;
    uncachedInput: number;
    output: number;
    costUsd: number;
    cacheSavingsUsd: number;
    sessions: number;
    undatedTokens: number;
    undatedCostUsd: number;
  };
  days: DayEntry[];
  models: { provider: string; model: string; tokens: number; costUsd: number; lastUsed: string }[];
  breakdowns: Record<BreakdownKey, BreakdownWindow>;
  quotas: QuotaProvider[];
  unpricedModels: string[];
}

const data = rawData as unknown as TokenmaxxingData;

/* ── Motion ──────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08, ease: [0.21, 1.02, 0.73, 1] as [number, number, number, number] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardLift = { y: -2, transition: { duration: 0.2, ease: "easeOut" as const } };

/* ── Palette ─────────────────────────────────────────────── */
/**
 * Seven slots, one per provider that can actually be co-visible in a window:
 * anthropic, nan, opencode-go, xai/grok, openai, lyber, deepseek.
 *
 * Checked with the dataviz palette validator (light mode), all pairs:
 * - normal-vision separation PASS (worst pair ΔE 15.8)
 * - CVD separation does NOT fully pass: worst pair ΔE 5.6 (deutan), below the
 *   checker's floor. That is why every chart keeps legends, tooltips and
 *   direct labels visible at all times as the secondary encoding.
 * - chroma floor and contrast vs surface pass for all seven slots.
 *
 * The order here is the display order, never the ranking: a provider keeps its
 * color when its volume changes or when the period changes.
 */
const channelColors = ["#d97706", "#2563eb", "#a21caf", "#db2777", "#0891b2", "#15803d", "#854d0e"];
const neutralColor = "#a1a1aa";

/** Amber belongs to Anthropic; every other provider id stays neutral and folds into "Other". */
const providerSlots: Record<string, number> = {
  anthropic: 0,
  nan: 1,
  "opencode-go": 2,
  xai: 3,
  grok: 3,
  openai: 4,
  lyber: 5,
  deepseek: 6,
};

function hasSlot(provider: string): boolean {
  return providerSlots[provider] !== undefined;
}

function providerColor(provider: string): string {
  const slot = providerSlots[provider];
  return slot === undefined ? neutralColor : channelColors[slot];
}

function hashOf(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  return hash;
}

/** Model series reuse the same seven slots; the provider badge keeps the provider color. */
function modelColor(provider: string, model: string): string {
  const slot = providerSlots[provider];
  const offset = slot === undefined ? 0 : slot;
  return channelColors[(offset + hashOf(model)) % channelColors.length];
}

/* ── Formatting ──────────────────────────────────────────── */
function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
  return `${Math.round(value)}`;
}

function axisFormatter(maxValue: number, metric: Metric): (value: number) => string {
  if (metric === "cost") return (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
  const divisor = maxValue >= 1e9 ? 1e9 : maxValue >= 1e6 ? 1e6 : maxValue >= 1e3 ? 1e3 : 1;
  const suffix = divisor === 1e9 ? "B" : divisor === 1e6 ? "M" : divisor === 1e3 ? "K" : "";
  return (value: number) => (value === 0 ? "0" : `${(value / divisor).toFixed(divisor === 1 ? 0 : 1)}${suffix}`);
}

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: string, lang: string): string {
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(lang === "es" ? "es-VE" : "en-US", { day: "numeric", month: "short" }).format(parsed);
}

function isoDays(period: Period): string[] {
  const last = data.days.length > 0 ? data.days[data.days.length - 1].date : new Date().toISOString().slice(0, 10);
  const end = new Date(`${last}T00:00:00.000Z`);
  const first = data.firstUsageDate || (data.days.length > 0 ? data.days[0].date : last);
  const span =
    period === 0
      ? Math.max(1, Math.round((end.getTime() - Date.parse(`${first}T00:00:00.000Z`)) / 86_400_000) + 1)
      : period;
  const dates: string[] = [];
  for (let offset = span - 1; offset >= 0; offset -= 1) {
    dates.push(new Date(end.getTime() - offset * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

/* ── Local building blocks ───────────────────────────────── */
const ink = "#0a0a0f";
const mutedInk = "#52525b";
const borderTone = "rgba(10,10,15,0.08)";

const surfaceStyle = {
  background: "#ffffff",
  border: `1px solid ${borderTone}`,
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(10,10,15,0.04), 0 8px 24px -16px rgba(10,10,15,0.18)",
} as const;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={cardLift} className={className} style={surfaceStyle}>
      {children}
    </motion.div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm" style={{ color: mutedInk, fontFamily: "var(--font-sans), sans-serif" }}>
      {children}
    </p>
  );
}

function CardValue({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-1 text-2xl sm:text-3xl font-semibold"
      style={{ color: ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
    >
      {children}
    </p>
  );
}

function CardHelper({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-xs leading-snug" style={{ color: mutedInk }}>
      {children}
    </p>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-xs font-medium" style={{ color: mutedInk }}>
          {label}
        </span>
      )}
      <div className="flex rounded-xl p-0.5" style={{ border: `1px solid ${borderTone}`, background: "#fafafa" }}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className="px-2.5 py-1 text-xs rounded-[10px] transition-colors duration-150"
              style={{
                background: active ? "#ffffff" : "transparent",
                color: active ? ink : mutedInk,
                boxShadow: active ? "0 1px 2px rgba(10,10,15,0.08)" : "none",
                fontWeight: active ? 600 : 400,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function TokenmaxxingPage() {
  const { t, lang } = useLanguage();
  const copy = t.tokenmaxxing;

  const [period, setPeriod] = useState<Period>(30);
  const [metric, setMetric] = useState<Metric>("tokens");
  const [mode, setMode] = useState<ChartMode>("provider");
  const [isolated, setIsolated] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [breakdownTab, setBreakdownTab] = useState<BreakdownTab>("provider");

  const dates = useMemo(() => isoDays(period), [period]);

  const breakdownKey: BreakdownKey = period === 0 ? "all" : (String(period) as BreakdownKey);
  const breakdown = data.breakdowns[breakdownKey];

  const periodLabel = period === 0 ? copy.allTime : period === 7 ? copy.last7 : period === 30 ? copy.last30 : copy.last90;

  const split = useMemo(() => {
    let cachedInput = 0;
    let uncachedInput = 0;
    let output = 0;
    for (const entry of breakdown.providers) {
      cachedInput += entry.cachedInput;
      uncachedInput += entry.uncachedInput;
      output += entry.output;
    }
    return { cachedInput, uncachedInput, output, tokens: cachedInput + uncachedInput + output };
  }, [breakdown]);

  const periodCost = useMemo(() => breakdown.providers.reduce((sum, entry) => sum + entry.costUsd, 0), [breakdown]);

  /* Donut: top 6 providers + other, colored by entity. */
  const donutSlices = useMemo(() => {
    const ranked = [...breakdown.providers].sort((a, b) => b.tokens - a.tokens);
    const top = ranked.filter((entry) => hasSlot(entry.provider));
    const rest = ranked.filter((entry) => !hasSlot(entry.provider));
    const restTokens = rest.reduce((sum, entry) => sum + entry.tokens, 0);
    const restCost = rest.reduce((sum, entry) => sum + entry.costUsd, 0);
    const slices = top.map((entry) => ({
      key: entry.provider,
      label: entry.label,
      tokens: entry.tokens,
      costUsd: entry.costUsd,
      sessions: entry.sessions,
      color: providerColor(entry.provider),
    }));
    if (restTokens > 0) {
      slices.push({
        key: "other",
        label: copy.other,
        tokens: restTokens,
        costUsd: restCost,
        sessions: 0,
        color: neutralColor,
      });
    }
    return slices;
  }, [breakdown, copy.other]);

  const donutTotal = useMemo(() => donutSlices.reduce((sum, entry) => sum + entry.tokens, 0), [donutSlices]);
  const activeSlice = donutSlices.find((entry) => entry.key === activeProvider) ?? null;

  /* Daily chart: per-day series, provider or model mode. */
  const chartSeries = useMemo(() => {
    const byDate = new Map(data.days.map((day) => [day.date, day]));
    const totals = new Map<string, { label: string; provider: string; tokens: number }>();

    for (const date of dates) {
      const day = byDate.get(date);
      if (!day) continue;
      if (mode === "provider") {
        for (const [provider, entry] of Object.entries(day.providers)) {
          const current = totals.get(provider) ?? { label: provider, provider, tokens: 0 };
          current.tokens += entry.tokens;
          totals.set(provider, current);
        }
      } else {
        for (const entry of day.models) {
          const key = `${entry.provider}/${entry.model}`;
          const current = totals.get(key) ?? { label: entry.model, provider: entry.provider, tokens: 0 };
          current.tokens += entry.tokens;
          totals.set(key, current);
        }
      }
    }

    const ranked = [...totals.entries()]
      .filter(([key]) => (mode === "provider" ? hasSlot(key) : true))
      .sort((a, b) => b[1].tokens - a[1].tokens);
    const keep = ranked.slice(0, 5);
    const kept = new Set(keep.map(([key]) => key));
    const labels = new Map(breakdown.providers.map((entry) => [entry.provider, entry.label]));

    const series = keep.map(([key, meta]) => ({
      key,
      label: mode === "provider" ? labels.get(key) ?? meta.label : meta.label,
      provider: meta.provider,
      color: mode === "provider" ? providerColor(key) : modelColor(meta.provider, meta.label),
      total: 0,
    }));

    const restTokens = new Map<string, number>();
    for (const date of dates) {
      const day = byDate.get(date);
      if (!day) continue;
      if (mode === "provider") {
        for (const [provider, entry] of Object.entries(day.providers)) {
          if (kept.has(provider)) continue;
          restTokens.set(date, (restTokens.get(date) ?? 0) + entry.tokens);
        }
      } else {
        for (const entry of day.models) {
          const key = `${entry.provider}/${entry.model}`;
          if (kept.has(key)) continue;
          restTokens.set(date, (restTokens.get(date) ?? 0) + entry.tokens);
        }
      }
    }
    if (restTokens.size > 0) {
      series.push({ key: "other", label: copy.other, provider: "other", color: neutralColor, total: 0 });
    }

    const rows = dates.map((date) => {
      const day = byDate.get(date);
      const row: Record<string, string | number> = { date, label: dayLabel(date, lang) };
      let dayTotal = 0;
      for (const entry of series) {
        let value = 0;
        if (entry.key === "other") {
          value = restTokens.get(date) ?? 0;
        } else if (mode === "provider") {
          const providerEntry = day?.providers[entry.key];
          value = providerEntry ? (metric === "tokens" ? providerEntry.tokens : providerEntry.costUsd) : 0;
        } else {
          const modelEntry = day?.models.find((candidate) => `${candidate.provider}/${candidate.model}` === entry.key);
          value = modelEntry ? (metric === "tokens" ? modelEntry.tokens : modelEntry.costUsd) : 0;
        }
        row[entry.key] = value;
        entry.total += value;
        dayTotal += value;
      }
      row.total = dayTotal;
      return row;
    });

    return { series, rows };
  }, [dates, mode, metric, breakdown, lang, copy.other]);

  const windowSeriesTotal = useMemo(
    () => chartSeries.series.reduce((sum, entry) => sum + entry.total, 0),
    [chartSeries.series],
  );

  const visibleSeries = useMemo(
    () => (isolated === null ? chartSeries.series : chartSeries.series.filter((entry) => entry.key === isolated)),
    [chartSeries.series, isolated],
  );

  const axisMax = useMemo(() => {
    let max = 0;
    for (const row of chartSeries.rows) {
      let sum = 0;
      for (const entry of visibleSeries) {
        const value = row[entry.key];
        if (typeof value === "number") sum += value;
      }
      if (sum > max) max = sum;
    }
    return max;
  }, [chartSeries.rows, visibleSeries]);

  const formatAxis = useMemo(() => axisFormatter(axisMax, metric), [axisMax, metric]);

  /** Shape the hand-made SVG chart wants: per-series value arrays and per-day totals. */
  const svgChart = useMemo(() => {
    const dates = chartSeries.rows.map((row) => String(row.date));
    const series = visibleSeries.map((entry) => ({
      key: entry.key,
      label: entry.label,
      color: entry.color,
      values: chartSeries.rows.map((row) => {
        const value = row[entry.key];
        return typeof value === "number" ? value : 0;
      }),
    }));
    const totals = chartSeries.rows.map((row) => {
      const value = row.total;
      return typeof value === "number" ? value : 0;
    });
    return { dates, series, totals, max: axisMax };
  }, [chartSeries.rows, visibleSeries, axisMax]);

  const dayRows = useMemo(
    () =>
      data.days
        .filter(
          (day) => dates.length === 0 || (day.date >= dates[0] && day.date <= dates[dates.length - 1]),
        )
        .slice()
        .reverse()
        .map((day) => {
          const top = day.models.reduce<DayModel | null>(
            (best, entry) => (best === null || entry.tokens > best.tokens ? entry : best),
            null,
          );
          return {
            date: day.date,
            tokens: day.cachedInput + day.uncachedInput + day.output,
            cachedInput: day.cachedInput,
            uncachedInput: day.uncachedInput,
            output: day.output,
            costUsd: Object.values(day.providers).reduce((sum, entry) => sum + entry.costUsd, 0),
            topModel: top && top.tokens > 0 ? top.model : "",
          };
        }),
    [dates],
  );

  const errorLabel = (code: string | null): string => {
    switch (code) {
      case "no_credential":
        return copy.errNoCredential;
      case "expired":
        return copy.errExpired;
      case "unauthorized":
        return copy.errUnauthorized;
      case "rate_limited":
        return copy.errRateLimited;
      case "cooldown":
        return copy.errCooldown;
      case "blocked_credential":
        return copy.errBlocked;
      case "network_error":
        return copy.errNetwork;
      case "parse_error":
        return copy.errParse;
      default:
        return copy.errOther;
    }
  };

  const kpis = [
    { label: copy.kpiTokens, value: compact(split.tokens), help: copy.kpiTokensHelp },
    { label: copy.kpiCost, value: usd(periodCost), help: copy.kpiCostHelp },
    { label: copy.kpiCache, value: usd(data.totals.cacheSavingsUsd), help: copy.kpiCacheHelp },
    { label: copy.kpiSessions, value: compact(data.totals.sessions), help: copy.kpiSessionsHelp },
  ];

  /* Composition cards are not providers: they stay out of the categorical palette. */
  const splitCards = [
    { label: copy.cached, value: split.cachedInput, color: "#d97706", help: copy.cachedHelp },
    { label: copy.uncached, value: split.uncachedInput, color: ink, help: copy.uncachedHelp },
    { label: copy.output, value: split.output, color: neutralColor, help: copy.outputHelp },
  ];

  return (
    <div className="min-h-screen py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8">
          <motion.p
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: mutedInk, fontFamily: "var(--font-mono-display), monospace" }}
          >
            {copy.eyebrow}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.02em]"
            style={{ color: ink }}
          >
            {copy.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: mutedInk }}>
            {copy.subtitle}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-2 text-xs" style={{ color: mutedInk }}>
            {copy.updatedAt} {shortDate(data.generatedAt)} · {data.timezone}
            {data.firstUsageDate ? ` · ${copy.firstUsage}: ${shortDate(`${data.firstUsageDate}T00:00:00.000Z`)}` : ""}
          </motion.p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
          <Segmented
            label={copy.period}
            value={period}
            onChange={(next) => {
              setPeriod(next);
              setIsolated(null);
              setHover(null);
            }}
            options={[
              { value: 7 as Period, label: copy.period7 },
              { value: 30 as Period, label: copy.period30 },
              { value: 90 as Period, label: copy.period90 },
              { value: 0 as Period, label: copy.periodAll },
            ]}
          />
        </motion.div>

        {/* KPI row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
        >
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="p-5 sm:p-6">
              <CardLabel>{kpi.label}</CardLabel>
              <CardValue>{kpi.value}</CardValue>
              <p className="mt-1 text-[11px] font-medium" style={{ color: channelColors[0] }}>
                {periodLabel}
              </p>
              <CardHelper>{kpi.help}</CardHelper>
            </Card>
          ))}
        </motion.div>

        {/* Split cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
        >
          {splitCards.map((card) => {
            const share = split.tokens > 0 ? (card.value / split.tokens) * 100 : 0;
            return (
              <Card key={card.label} className="p-5 sm:p-6">
                <CardLabel>{card.label}</CardLabel>
                <CardValue>{compact(card.value)}</CardValue>
                <p className="mt-1 text-[11px]" style={{ color: mutedInk }}>
                  {share.toFixed(1)}% {copy.ofTotal} · {periodLabel}
                </p>
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#f4f4f5" }}>
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.max(share, 1)}%`, background: card.color }}
                  />
                </div>
                <CardHelper>{card.help}</CardHelper>
              </Card>
            );
          })}
        </motion.div>

        {data.totals.undatedTokens > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="mb-4 rounded-2xl px-5 py-4"
            style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.16)" }}
          >
            <p className="text-sm font-medium" style={{ color: ink }}>
              {compact(data.totals.undatedTokens)} · {usd(data.totals.undatedCostUsd)}
            </p>
            <p className="mt-1 text-xs leading-snug" style={{ color: mutedInk }}>
              {copy.undatedHelp}
            </p>
          </motion.div>
        )}

        {/* Donut */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-4"
        >
          <motion.div variants={fadeUp} className="p-5 sm:p-6" style={surfaceStyle}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold" style={{ color: ink }}>
                {copy.usageByProvider}
              </h2>
              <p className="text-xs" style={{ color: mutedInk }}>
                {periodLabel}
              </p>
            </div>
            <p className="mt-1 text-xs" style={{ color: mutedInk }}>
              {copy.usageByProviderHelp}
            </p>

            <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-[220px] h-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutSlices}
                      dataKey="tokens"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="92%"
                      paddingAngle={0}
                      stroke="#ffffff"
                      strokeWidth={2}
                      isAnimationActive
                      animationDuration={600}
                      onMouseLeave={() => setActiveProvider(null)}
                      shape={(props) => {
                        const slice = donutSlices[props.index];
                        const active = slice !== undefined && slice.key === activeProvider;
                        // Recharts hands back a `key` prop; spreading it into JSX is a React error.
                        const sectorProps: Record<string, unknown> = { ...props };
                        delete sectorProps.key;
                        return (
                          <Sector
                            {...(sectorProps as React.ComponentProps<typeof Sector>)}
                            outerRadius={active ? Number(props.outerRadius) + 6 : props.outerRadius}
                            onMouseEnter={() => setActiveProvider(slice?.key ?? null)}
                            onMouseLeave={() => setActiveProvider(null)}
                            style={{ cursor: "pointer", transition: "opacity 150ms ease" }}
                          />
                        );
                      }}
                    >
                      {donutSlices.map((slice) => (
                        <Cell
                          key={slice.key}
                          fill={slice.color}
                          opacity={activeProvider === null || activeProvider === slice.key ? 1 : 0.45}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                  {activeSlice ? (
                    <>
                      <span className="text-xs font-medium" style={{ color: mutedInk }}>
                        {activeSlice.label}
                      </span>
                      <span className="text-lg font-semibold" style={{ color: ink, fontVariantNumeric: "tabular-nums" }}>
                        {compact(activeSlice.tokens)}
                      </span>
                      <span className="text-[11px]" style={{ color: mutedInk }}>
                        {donutTotal > 0 ? `${((activeSlice.tokens / donutTotal) * 100).toFixed(1)}%` : "0%"} ·{" "}
                        {activeSlice.costUsd > 0 ? usd(activeSlice.costUsd) : "—"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-semibold" style={{ color: ink, fontVariantNumeric: "tabular-nums" }}>
                        {compact(donutTotal)}
                      </span>
                      <span className="text-[11px]" style={{ color: mutedInk }}>
                        {copy.metricTokens}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <ul className="flex flex-col gap-1">
                  {donutSlices.map((slice) => {
                    const share = donutTotal > 0 ? (slice.tokens / donutTotal) * 100 : 0;
                    const active = activeProvider === slice.key;
                    return (
                      <li key={slice.key}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onMouseEnter={() => setActiveProvider(slice.key)}
                          onMouseLeave={() => setActiveProvider(null)}
                          onFocus={() => setActiveProvider(slice.key)}
                          onBlur={() => setActiveProvider(null)}
                          onClick={() => setActiveProvider(active ? null : slice.key)}
                          className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
                          style={{ background: active ? "#fafafa" : "transparent" }}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: slice.color }} />
                          <span className="flex-1 min-w-0 truncate text-xs" style={{ color: ink }}>
                            {slice.label}
                          </span>
                          <span
                            className="text-xs shrink-0"
                            style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
                          >
                            {compact(slice.tokens)}
                          </span>
                          <span
                            className="w-12 text-right text-xs shrink-0"
                            style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
                          >
                            {share >= 1 ? `${share.toFixed(0)}%` : "<1%"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 px-2 text-[11px]" style={{ color: mutedInk }}>
                  {copy.donutHint}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Daily chart */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-4"
        >
          <motion.div variants={fadeUp} className="p-5 sm:p-6" style={surfaceStyle}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold" style={{ color: ink }}>
                  {copy.dailyUsage}
                </h2>
                <p className="mt-1 text-xs" style={{ color: mutedInk }}>
                  {metric === "tokens" ? copy.tokensPerDay : copy.costPerDay}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  value={mode}
                  onChange={(next) => {
                    setMode(next);
                    setIsolated(null);
                    setHover(null);
                  }}
                  options={[
                    { value: "provider" as ChartMode, label: copy.byProvider },
                    { value: "model" as ChartMode, label: copy.byModel },
                  ]}
                />
                <Segmented
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: "tokens" as Metric, label: copy.metricTokens },
                    { value: "cost" as Metric, label: copy.metricCost },
                  ]}
                />
              </div>
            </div>

            <div className="mt-4 w-full">
              {svgChart.dates.length === 0 || svgChart.totals.every((value) => value === 0) ? (
                <p className="py-16 text-center text-xs" style={{ color: mutedInk }}>
                  {copy.empty}
                </p>
              ) : (
                <StackedArea
                  chart={svgChart}
                  formatValue={formatAxis}
                  metric={metric}
                  totalLabel={copy.total}
                  dayFormatter={(date: string) => dayLabel(date, lang)}
                  hover={hover}
                  onHover={setHover}
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {chartSeries.series.map((entry) => {
                const active = isolated === null || isolated === entry.key;
                const share = windowSeriesTotal > 0 ? (entry.total / windowSeriesTotal) * 100 : 0;
                return (
                  <button
                    key={entry.key}
                    onClick={() => setIsolated(isolated === entry.key ? null : entry.key)}
                    aria-pressed={isolated === entry.key}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-all"
                    style={{
                      border: `1px solid ${isolated === entry.key ? entry.color : borderTone}`,
                      background: isolated === entry.key ? "#fafafa" : "#ffffff",
                      opacity: active ? 1 : 0.4,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="max-w-[140px] truncate" style={{ color: ink }}>
                      {entry.label}
                    </span>
                    <span style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}>
                      {metric === "tokens" ? compact(entry.total) : usd(entry.total)}
                    </span>
                    <span style={{ color: mutedInk }}>{share >= 1 ? `${share.toFixed(0)}%` : "<1%"}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: mutedInk }}>
              {copy.legendHint}
            </p>
          </motion.div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div variants={fadeUp} className="p-5 sm:p-6" style={surfaceStyle}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold" style={{ color: ink }}>
                  {copy.breakdown}
                </h2>
                <p className="mt-1 text-xs" style={{ color: mutedInk }}>
                  {periodLabel}
                </p>
              </div>
              <Segmented
                value={breakdownTab}
                onChange={setBreakdownTab}
                options={[
                  { value: "provider" as BreakdownTab, label: copy.tabProvider },
                  { value: "model" as BreakdownTab, label: copy.tabModel },
                  { value: "day" as BreakdownTab, label: copy.tabDay },
                ]}
              />
            </div>

            <div
              className="mt-4 hidden sm:flex items-center gap-3 px-2 pb-2 text-[11px]"
              style={{ borderBottom: `1px solid ${borderTone}`, color: mutedInk }}
            >
              <span className="w-4" />
              <span className="flex-1">{breakdownTab === "day" ? copy.colName : copy.colName}</span>
              <span className="w-14 text-right">{breakdownTab === "day" ? "" : copy.colSessions}</span>
              <span className="w-16 text-right">{copy.colTokens}</span>
              <span className="w-16 text-right">{copy.colCached}</span>
              <span className="w-16 text-right">{copy.colUncached}</span>
              <span className="w-16 text-right">{copy.colOutput}</span>
              <span className="w-16 text-right">{copy.colCost}</span>
              <span className="w-14 text-right">{copy.colShare}</span>
            </div>

            <ul>
              {breakdownTab === "provider" &&
                breakdown.providers.map((row, index) => (
                  <BreakdownRow
                    key={row.provider}
                    rank={index}
                    color={providerColor(row.provider)}
                    name={row.label}
                    sessions={row.sessions}
                    tokens={row.tokens}
                    cachedInput={row.cachedInput}
                    uncachedInput={row.uncachedInput}
                    output={row.output}
                    costUsd={row.costUsd}
                    share={split.tokens > 0 ? (row.tokens / split.tokens) * 100 : 0}
                  />
                ))}

              {breakdownTab === "model" &&
                breakdown.models.map((row, index) => (
                  <BreakdownRow
                    key={`${row.provider}/${row.model}`}
                    rank={index}
                    color={modelColor(row.provider, row.model)}
                    name={row.model}
                    badge={row.label}
                    badgeColor={providerColor(row.provider)}
                    meta={`${copy.lastUsed} ${shortDate(`${row.lastUsed}T00:00:00.000Z`)}`}
                    sessions={row.sessions}
                    tokens={row.tokens}
                    cachedInput={row.cachedInput}
                    uncachedInput={row.uncachedInput}
                    output={row.output}
                    costUsd={row.costUsd}
                    share={split.tokens > 0 ? (row.tokens / split.tokens) * 100 : 0}
                  />
                ))}

              {breakdownTab === "day" &&
                dayRows.map((row, index) => (
                  <BreakdownRow
                    key={row.date}
                    rank={index}
                    color={channelColors[0]}
                    name={dayLabel(row.date, lang)}
                    meta={row.topModel ? `${copy.topModel}: ${row.topModel}` : ""}
                    sessions={null}
                    tokens={row.tokens}
                    cachedInput={row.cachedInput}
                    uncachedInput={row.uncachedInput}
                    output={row.output}
                    costUsd={row.costUsd}
                    share={split.tokens > 0 ? (row.tokens / split.tokens) * 100 : 0}
                  />
                ))}
            </ul>

            {((breakdownTab === "provider" && breakdown.providers.length === 0) ||
              (breakdownTab === "model" && breakdown.models.length === 0) ||
              (breakdownTab === "day" && dayRows.length === 0)) && (
              <p className="py-10 text-center text-xs" style={{ color: mutedInk }}>
                {copy.empty}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Quotas */}
        {data.quotas.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-4"
          >
            <motion.div variants={fadeUp} className="p-5 sm:p-6" style={surfaceStyle}>
              <h2 className="text-base font-semibold" style={{ color: ink }}>
                {copy.quotas}
              </h2>
              <p className="mt-1 text-xs" style={{ color: mutedInk }}>
                {copy.quotasHelp}
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {data.quotas.map((quota) => (
                  <div key={quota.id} className="rounded-xl p-4" style={{ border: `1px solid ${borderTone}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: providerColor(quota.id) }} />
                        <span className="text-sm font-medium truncate" style={{ color: ink }}>
                          {breakdown.providers.find((entry) => entry.provider === quota.id)?.label ?? quota.id}
                        </span>
                        {quota.plan && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#f4f4f5", color: mutedInk }}>
                            {quota.plan}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          color:
                            quota.status === "ok" ? "#15803d" : quota.status === "stale" ? "#b45309" : "#b91c1c",
                          background:
                            quota.status === "ok"
                              ? "rgba(21,128,61,0.1)"
                              : quota.status === "stale"
                                ? "rgba(217,119,6,0.1)"
                                : "rgba(185,28,28,0.1)",
                        }}
                      >
                        {quota.status === "ok" ? copy.statusOk : quota.status === "stale" ? copy.statusStale : copy.statusError}
                      </span>
                    </div>

                    {quota.error && (
                      <p className="mt-1.5 text-xs" style={{ color: mutedInk }}>
                        {errorLabel(quota.error)}
                      </p>
                    )}

                    <div className="mt-3 flex flex-col gap-3">
                      {quota.windows.map((window) => {
                        const leftPercent = Math.max(0, Math.min(100, 100 - window.usedPercent));
                        return (
                          <div key={`${quota.id}-${window.label}`}>
                            <div className="flex items-baseline justify-between">
                              <span className="text-[11px]" style={{ color: mutedInk }}>
                                {window.label}
                              </span>
                              <span
                                className="text-sm font-semibold"
                                style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                              >
                                {leftPercent.toFixed(0)}
                                {copy.left}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "#f4f4f5" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${leftPercent}%`, background: providerColor(quota.id) }}
                              />
                            </div>
                            {window.resetsAt && (
                              <p className="mt-1 text-[11px]" style={{ color: mutedInk }}>
                                {copy.resets} {shortDate(window.resetsAt)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Unpriced + footnote */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-6"
        >
          {data.unpricedModels.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium" style={{ color: ink }}>
                {copy.unpriced}
              </p>
              <p className="mt-1 text-xs" style={{ color: mutedInk }}>
                {copy.unpricedHelp}
              </p>
              <p className="mt-1.5 text-xs break-words" style={{ color: mutedInk }}>
                {data.unpricedModels.join(" · ")}
              </p>
            </div>
          )}
          <p className="text-xs leading-relaxed max-w-2xl" style={{ color: mutedInk }}>
            {copy.footnote}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Breakdown row ───────────────────────────────────────── */
function BreakdownRow({
  rank,
  color,
  name,
  badge,
  badgeColor,
  meta,
  sessions,
  tokens,
  cachedInput,
  uncachedInput,
  output,
  costUsd,
  share,
}: {
  rank: number;
  color: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  meta?: string;
  sessions: number | null;
  tokens: number;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  costUsd: number;
  share: number;
}) {
  return (
    <li
      className="flex items-center gap-3 px-2 py-2.5"
      style={{ borderTop: rank === 0 ? "none" : `1px solid rgba(10,10,15,0.05)` }}
    >
      <span className="w-4 text-[11px] shrink-0" style={{ color: neutralColor, fontVariantNumeric: "tabular-nums" }}>
        {rank + 1}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-sm truncate" style={{ color: ink }}>
            {name}
          </span>
          {badge && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "#f4f4f5", color: badgeColor ?? mutedInk }}
            >
              {badge}
            </span>
          )}
        </div>
        {meta && (
          <p className="mt-0.5 text-[11px] truncate" style={{ color: mutedInk }}>
            {meta}
          </p>
        )}
        <div className="mt-1.5 flex sm:hidden items-center gap-2">
          <span className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#f4f4f5" }}>
            <span className="block h-full rounded-full" style={{ width: `${Math.max(share, 1)}%`, background: color }} />
          </span>
          <span className="text-[11px] shrink-0" style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}>
            {share.toFixed(1)}%
          </span>
        </div>
      </div>

      <span
        className="hidden sm:block w-14 text-right text-xs"
        style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
      >
        {sessions === null ? "" : sessions}
      </span>
      <span className="w-16 text-right text-xs" style={{ color: ink, fontVariantNumeric: "tabular-nums" }}>
        {compact(tokens)}
      </span>
      <span
        className="hidden sm:block w-16 text-right text-xs"
        style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
      >
        {compact(cachedInput)}
      </span>
      <span
        className="hidden sm:block w-16 text-right text-xs"
        style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
      >
        {compact(uncachedInput)}
      </span>
      <span
        className="hidden sm:block w-16 text-right text-xs"
        style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
      >
        {compact(output)}
      </span>
      <span
        className="hidden sm:block w-16 text-right text-xs"
        style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}
      >
        {costUsd > 0 ? usd(costUsd) : "—"}
      </span>
      <span
        className="hidden sm:block w-14 text-right text-xs"
        style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
      >
        {share.toFixed(1)}%
      </span>
    </li>
  );
}

/* ── Hand-made SVG stacked area ──────────────────────────── */
const svgWidth = 820;
const svgHeight = 280;
const svgPad = { top: 14, right: 10, bottom: 28, left: 54 };

interface Point {
  x: number;
  y: number;
}

interface SvgSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

interface SvgChart {
  dates: string[];
  series: SvgSeries[];
  totals: number[];
  max: number;
}

/** Catmull-Rom to cubic bezier: smooth curves without overshooting much. */
function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  const first = points[0];
  if (points.length === 1) return `M${first.x.toFixed(2)},${first.y.toFixed(2)}`;
  const tension = 0.2;
  let path = `M${first.x.toFixed(2)},${first.y.toFixed(2)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return path;
}

function StackedArea({
  chart,
  formatValue,
  metric,
  totalLabel,
  dayFormatter,
  hover,
  onHover,
}: {
  chart: SvgChart;
  formatValue: (value: number) => string;
  metric: Metric;
  totalLabel: string;
  dayFormatter: (date: string) => string;
  hover: number | null;
  onHover: (index: number | null) => void;
}) {
  const plotWidth = svgWidth - svgPad.left - svgPad.right;
  const plotHeight = svgHeight - svgPad.top - svgPad.bottom;
  const count = chart.dates.length;
  const scale = Math.max(chart.max, 1);

  const xAt = (index: number): number => {
    if (count <= 1) return svgPad.left + plotWidth / 2;
    return svgPad.left + (index * plotWidth) / (count - 1);
  };
  const yAt = (value: number): number => svgPad.top + plotHeight - (Math.max(0, value) / scale) * plotHeight;

  const cumulative = new Array<number>(count).fill(0);
  const areas: { key: string; color: string; d: string }[] = [];

  for (const entry of chart.series) {
    const topPoints: Point[] = [];
    const bottomPoints: Point[] = [];
    for (let index = 0; index < count; index += 1) {
      const base = cumulative[index];
      const value = entry.values[index] ?? 0;
      topPoints.push({ x: xAt(index), y: yAt(base + value) });
      bottomPoints.push({ x: xAt(index), y: yAt(base) });
      cumulative[index] = base + value;
    }
    const topPath = smoothPath(topPoints);
    const bottomPath = smoothPath([...bottomPoints].reverse()).replace(/^M/, "L");
    areas.push({ key: entry.key, color: entry.color, d: `${topPath} ${bottomPath} Z` });
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    y: yAt(scale * ratio),
    label: formatValue(scale * ratio),
  }));

  const xLabelIndexes =
    count === 0
      ? []
      : [0, Math.floor((count - 1) / 3), Math.floor(((count - 1) * 2) / 3), count - 1].filter(
          (value, index, array) => array.indexOf(value) === index,
        );

  const handleMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const leftFraction = svgPad.left / svgWidth;
    const rightFraction = (svgWidth - svgPad.right) / svgWidth;
    const plotRatio = (ratio - leftFraction) / (rightFraction - leftFraction);
    const index = Math.round(plotRatio * (count - 1));
    onHover(index < 0 || index > count - 1 ? null : index);
  };

  const hoveredDate = hover === null ? null : chart.dates[hover];
  const hoveredTotal = hover === null ? 0 : chart.totals[hover] ?? 0;
  const hoveredRows =
    hover === null
      ? []
      : chart.series
          .map((entry) => ({ key: entry.key, label: entry.label, color: entry.color, value: entry.values[hover] ?? 0 }))
          .sort((a, b) => b.value - a.value);

  return (
    <div className="relative" onMouseMove={handleMove} onMouseLeave={() => onHover(null)}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label={totalLabel}
      >
        {gridLines.map((line) => (
          <g key={line.ratio}>
            <line
              x1={svgPad.left}
              x2={svgWidth - svgPad.right}
              y1={line.y}
              y2={line.y}
              stroke="#e4e4e7"
              strokeWidth={1}
            />
            <text
              x={svgPad.left - 8}
              y={line.y + 3}
              textAnchor="end"
              fontSize={11}
              fill={mutedInk}
            >
              {line.label}
            </text>
          </g>
        ))}

        {areas.map((area) => (
          <path
            key={area.key}
            d={area.d}
            fill={area.color}
            fillOpacity={0.35}
            stroke={area.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}

        {xLabelIndexes.map((index) => (
          <text
            key={index}
            x={xAt(index)}
            y={svgHeight - 8}
            textAnchor={index === count - 1 ? "end" : "middle"}
            fontSize={11}
            fill={mutedInk}
          >
            {dayFormatter(chart.dates[index])}
          </text>
        ))}

        {hover !== null && (
          <g>
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={svgPad.top}
              y2={svgPad.top + plotHeight}
              stroke="rgba(10,10,15,0.3)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle cx={xAt(hover)} cy={yAt(0)} r={2.5} fill="rgba(10,10,15,0.3)" />
          </g>
        )}
      </svg>

      {hover !== null && hoveredDate && (
        <div
          className="absolute top-0 px-3 py-2.5 rounded-xl pointer-events-none z-10"
          style={{
            left: `${(xAt(hover) / svgWidth) * 100}%`,
            transform: hover > count / 2 ? "translateX(-105%)" : "translateX(5%)",
            background: "#ffffff",
            border: `1px solid ${borderTone}`,
            boxShadow: "0 10px 30px -12px rgba(10,10,15,0.25)",
            minWidth: 180,
            maxWidth: 240,
          }}
        >
          <p className="text-xs font-medium" style={{ color: ink }}>
            {dayFormatter(hoveredDate)}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: mutedInk }}>
            {totalLabel} {metric === "tokens" ? compact(hoveredTotal) : usd(hoveredTotal)}
          </p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {hoveredRows.map((row) => (
              <p key={row.key} className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                <span className="flex-1 truncate" style={{ color: ink }}>
                  {row.label}
                </span>
                <span style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}>
                  {metric === "tokens" ? compact(row.value) : usd(row.value)}
                </span>
                <span className="w-8 text-right" style={{ color: mutedInk, fontVariantNumeric: "tabular-nums" }}>
                  {hoveredTotal > 0 ? `${((row.value / hoveredTotal) * 100).toFixed(0)}%` : "0%"}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
