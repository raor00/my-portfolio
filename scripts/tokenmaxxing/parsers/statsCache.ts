import { normalizeModel, normalizeProvider } from "../config";
import { num, record } from "./types";
import type { RawUsage, TokenBuckets } from "./types";

/**
 * Claude Code stats cache (`~/.claude/stats-cache.json`) -> synthetic usage.
 *
 * Transcripts older than ~30 days are purged, so this file is the only source
 * for the 2026-06-22..2026-08-20 window. It stores ONE token number per
 * (date, model); the input/output/cache split is reconstructed from that
 * model's measured ratios in `modelUsage`, and the rows are marked
 * `estimatedSplit` so the provenance stays visible.
 */

export interface StatsCacheUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
}

export interface StatsCache {
  firstSessionDate: string | null;
  days: { date: string; models: Record<string, number> }[];
  modelUsage: Record<string, StatsCacheUsage>;
}

function readUsage(value: unknown): StatsCacheUsage {
  const entry = record(value) ?? {};
  return {
    inputTokens: num(entry.inputTokens),
    outputTokens: num(entry.outputTokens),
    cacheReadInputTokens: num(entry.cacheReadInputTokens),
    cacheCreationInputTokens: num(entry.cacheCreationInputTokens),
  };
}

export function parseStatsCache(raw: unknown): StatsCache | null {
  const obj = record(raw);
  if (!obj) return null;

  const days: StatsCache["days"] = [];
  const dailyRaw = obj.dailyModelTokens;
  if (Array.isArray(dailyRaw)) {
    for (const item of dailyRaw) {
      const entry = record(item);
      if (!entry) continue;
      const date = typeof entry.date === "string" ? entry.date : "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      const byModel = record(entry.tokensByModel) ?? {};
      const models: Record<string, number> = {};
      for (const [model, tokens] of Object.entries(byModel)) {
        const value = num(tokens);
        if (value > 0) models[model] = value;
      }
      if (Object.keys(models).length > 0) days.push({ date, models });
    }
  }

  const modelUsage: StatsCache["modelUsage"] = {};
  const usageRaw = record(obj.modelUsage) ?? {};
  for (const [model, value] of Object.entries(usageRaw)) modelUsage[model] = readUsage(value);

  const firstSessionDate = typeof obj.firstSessionDate === "string" ? obj.firstSessionDate : null;
  if (days.length === 0 && Object.keys(modelUsage).length === 0) return null;
  return { firstSessionDate, days, modelUsage };
}

function ratiosFor(usage: StatsCacheUsage | undefined): { input: number; output: number; cacheRead: number; cacheWrite: number } | null {
  if (!usage) return null;
  const total =
    usage.inputTokens + usage.outputTokens + usage.cacheReadInputTokens + usage.cacheCreationInputTokens;
  if (total <= 0) return null;
  return {
    input: usage.inputTokens / total,
    output: usage.outputTokens / total,
    cacheRead: usage.cacheReadInputTokens / total,
    cacheWrite: usage.cacheCreationInputTokens / total,
  };
}

/** Splits one total into the four buckets using the model's measured ratios. */
export function splitByRatios(total: number, usage: StatsCacheUsage | undefined): TokenBuckets | null {
  const ratios = ratiosFor(usage);
  if (!ratios || total <= 0) return null;
  const input = Math.round(total * ratios.input);
  const output = Math.round(total * ratios.output);
  const cacheRead = Math.round(total * ratios.cacheRead);
  const cacheWrite = Math.max(0, total - input - output - cacheRead);
  return { input, cacheRead, cacheWrite, output };
}

/**
 * Builds one synthetic row per (date, model). Dates already covered by
 * transcript rows for the Claude agent are skipped so nothing is counted twice.
 */
export function buildStatsRows(cache: StatsCache, occupiedDates: Set<string>): RawUsage[] {
  const rows: RawUsage[] = [];
  for (const day of cache.days) {
    if (occupiedDates.has(day.date)) continue;
    for (const [model, tokens] of Object.entries(day.models)) {
      const buckets = splitByRatios(tokens, cache.modelUsage[model]);
      if (!buckets) continue;
      rows.push({
        agent: "claude",
        provider: normalizeProvider("anthropic"),
        model: normalizeModel(model),
        externalId: `stats:${day.date}:${model}`,
        inputTokens: buckets.input,
        cacheReadTokens: buckets.cacheRead,
        cacheWriteTokens: buckets.cacheWrite,
        outputTokens: buckets.output,
        reasoningTokens: 0,
        reportedCostUsd: 0,
        occurredAt: `${day.date}T12:00:00.000Z`,
        sessionId: "",
        source: "stats-cache",
        estimatedSplit: true,
      });
    }
  }
  return rows;
}

/** Dates present in the cache (for the no-double-count check). */
export function statsDates(cache: StatsCache): string[] {
  return cache.days.map((day) => day.date);
}

export interface UndatedRemainderModel {
  model: string;
  tokens: number;
  buckets: TokenBuckets;
}

/**
 * `modelUsage` totals minus the dated sum = usage from dates whose transcripts
 * and stats rows are both gone (2026-04-20..2026-06-21). It is reported in the
 * all-time totals only; no days are invented for it.
 */
export function computeUndatedRemainder(cache: StatsCache): UndatedRemainderModel[] {
  const dated = new Map<string, number>();
  for (const day of cache.days) {
    for (const [model, tokens] of Object.entries(day.models)) {
      dated.set(model, (dated.get(model) ?? 0) + tokens);
    }
  }

  const remainder: UndatedRemainderModel[] = [];
  for (const [model, usage] of Object.entries(cache.modelUsage)) {
    const total =
      usage.inputTokens + usage.outputTokens + usage.cacheReadInputTokens + usage.cacheCreationInputTokens;
    const left = total - (dated.get(model) ?? 0);
    if (left <= 0) continue;
    const buckets = splitByRatios(left, usage);
    if (!buckets) continue;
    remainder.push({ model, tokens: left, buckets });
  }
  return remainder;
}
