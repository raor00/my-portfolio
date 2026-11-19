import type { Database } from "bun:sqlite";
import { EXCLUDED_PROVIDERS, isExcludedProvider, isFreeProvider, providerLabel } from "./config";
import { cacheSavingsOf, costOf, findPrice, type ModelPrice, type PriceTable } from "./pricing";
import type {
  BreakdownModel,
  BreakdownProvider,
  QuotaProvider,
  TokenmaxxingDay,
  TokenmaxxingModel,
  TokenmaxxingOutput,
} from "./sanitize";
import { toUsageDate } from "./time";

export interface UsageRow {
  agent: string;
  provider: string;
  model: string;
  sessionId: string;
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  reportedCostUsd: number;
  occurredAt: string;
  usageDate: string;
}

/** Models kept per day; everything else is folded into a single "other" row. */
export const TOP_MODELS_PER_DAY = 8;

/** Precomputed breakdown windows. */
export const BREAKDOWN_WINDOWS = ["7", "30", "90", "365", "all"] as const;
export type BreakdownWindow = (typeof BREAKDOWN_WINDOWS)[number];

const WINDOW_DAYS: Record<Exclude<BreakdownWindow, "all">, number> = { "7": 7, "30": 30, "90": 90, "365": 365 };

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Reads every ledger row (all-time), newest last. Excluded providers are dropped
 * in SQL so they can never reach an accumulator.
 */
export function readUsageRows(db: Database, excluded: readonly string[] = EXCLUDED_PROVIDERS): UsageRow[] {
  const placeholders = excluded.map(() => "?").join(",");
  const where = placeholders ? ` WHERE provider NOT IN (${placeholders})` : "";
  const rows = db
    .prepare(
      `SELECT agent, provider, model, session_id, input_tokens, cache_read_tokens,
              cache_write_tokens, output_tokens, reported_cost_usd, occurred_at, usage_date
       FROM usage${where} ORDER BY usage_date`,
    )
    .all(...excluded) as {
    agent: string;
    provider: string;
    model: string;
    session_id: string;
    input_tokens: number;
    cache_read_tokens: number;
    cache_write_tokens: number;
    output_tokens: number;
    reported_cost_usd: number;
    occurred_at: string;
    usage_date: string;
  }[];

  return rows.map((row) => ({
    agent: row.agent,
    provider: row.provider,
    model: row.model,
    sessionId: row.session_id,
    inputTokens: row.input_tokens,
    cacheReadTokens: row.cache_read_tokens,
    cacheWriteTokens: row.cache_write_tokens,
    outputTokens: row.output_tokens,
    reportedCostUsd: row.reported_cost_usd,
    occurredAt: row.occurred_at,
    usageDate: row.usage_date,
  }));
}

export interface UndatedUsage {
  model: string;
  tokens: number;
  buckets: { input: number; cacheRead: number; cacheWrite: number; output: number };
}

export interface AggregateOptions {
  rows: UsageRow[];
  prices: PriceTable;
  quotas: QuotaProvider[];
  generatedAt: string;
  timezone: string;
  /** Claude usage whose days are gone: all-time totals only, never a day row. */
  undatedRemainder?: UndatedUsage[];
  /** Earliest known usage date from the source stats cache, if any. */
  firstSessionDate?: string | null;
  /** Overrides the configured exclusion list; used by the exclusion test. */
  excludedProviders?: readonly string[];
}

interface ModelAccumulator {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
  lastUsed: string;
}

interface DayModelAccumulator {
  provider: string;
  model: string;
  tokens: number;
  cachedInput: number;
  uncachedInput: number;
  output: number;
  costUsd: number;
}

interface Split {
  cachedInput: number;
  uncachedInput: number;
  output: number;
}

function emptySplit(): Split {
  return { cachedInput: 0, uncachedInput: 0, output: 0 };
}

function addSplit(target: Split, cachedInput: number, uncachedInput: number, output: number): void {
  target.cachedInput += cachedInput;
  target.uncachedInput += uncachedInput;
  target.output += output;
}

/** One priced ledger row, kept for the per-window breakdowns. */
interface EnrichedRow {
  date: string;
  provider: string;
  model: string;
  sessionKey: string;
  tokens: number;
  split: Split;
  costUsd: number;
}

function modelKey(provider: string, model: string): string {
  return `${provider}\u0000${model}`;
}

interface WindowBreakdown {
  providers: BreakdownProvider[];
  models: BreakdownModel[];
}

interface BreakdownAccumulator {
  provider: string;
  model: string;
  sessions: Set<string>;
  tokens: number;
  split: Split;
  costUsd: number;
  lastUsed: string;
}

function buildBreakdowns(rows: EnrichedRow[], lastDate: string): Record<BreakdownWindow, WindowBreakdown> {
  const result = {} as Record<BreakdownWindow, WindowBreakdown>;

  for (const window of BREAKDOWN_WINDOWS) {
    const from = window === "all" ? "" : shiftDate(lastDate, -(WINDOW_DAYS[window] - 1));

    const providers = new Map<string, BreakdownAccumulator>();
    const models = new Map<string, BreakdownAccumulator>();

    for (const row of rows) {
      if (from && row.date < from) continue;

      const providerEntry =
        providers.get(row.provider) ??
        {
          provider: row.provider,
          model: "",
          sessions: new Set<string>(),
          tokens: 0,
          split: emptySplit(),
          costUsd: 0,
          lastUsed: row.date,
        };
      providerEntry.tokens += row.tokens;
      addSplit(providerEntry.split, row.split.cachedInput, row.split.uncachedInput, row.split.output);
      providerEntry.costUsd += row.costUsd;
      if (row.sessionKey) providerEntry.sessions.add(row.sessionKey);
      if (row.date > providerEntry.lastUsed) providerEntry.lastUsed = row.date;
      providers.set(row.provider, providerEntry);

      const key = modelKey(row.provider, row.model);
      const modelEntry =
        models.get(key) ??
        {
          provider: row.provider,
          model: row.model,
          sessions: new Set<string>(),
          tokens: 0,
          split: emptySplit(),
          costUsd: 0,
          lastUsed: row.date,
        };
      modelEntry.tokens += row.tokens;
      addSplit(modelEntry.split, row.split.cachedInput, row.split.uncachedInput, row.split.output);
      modelEntry.costUsd += row.costUsd;
      if (row.sessionKey) modelEntry.sessions.add(row.sessionKey);
      if (row.date > modelEntry.lastUsed) modelEntry.lastUsed = row.date;
      models.set(key, modelEntry);
    }

    result[window] = {
      providers: [...providers.values()]
        .filter((entry) => entry.tokens > 0)
        .sort((a, b) => b.tokens - a.tokens)
        .map((entry) => ({
          provider: entry.provider,
          label: providerLabel(entry.provider),
          sessions: entry.sessions.size,
          tokens: entry.tokens,
          cachedInput: entry.split.cachedInput,
          uncachedInput: entry.split.uncachedInput,
          output: entry.split.output,
          costUsd: round(entry.costUsd),
        })),
      models: [...models.values()]
        .filter((entry) => entry.tokens > 0)
        .sort((a, b) => b.tokens - a.tokens)
        .map((entry) => ({
          provider: entry.provider,
          label: providerLabel(entry.provider),
          model: entry.model,
          sessions: entry.sessions.size,
          tokens: entry.tokens,
          cachedInput: entry.split.cachedInput,
          uncachedInput: entry.split.uncachedInput,
          output: entry.split.output,
          costUsd: round(entry.costUsd),
          lastUsed: entry.lastUsed,
        })),
    };
  }

  return result;
}

/**
 * Builds the public aggregate. Reported costs win; everything else is priced
 * through LiteLLM or listed as unpriced (never invented). Excluded providers
 * are dropped before any accumulator sees them.
 */
export function aggregate(options: AggregateOptions): TokenmaxxingOutput {
  const { rows, prices, quotas, generatedAt, timezone } = options;

  const days = new Map<string, Map<string, { tokens: number; costUsd: number } & Split>>();
  const daySplits = new Map<string, Split>();
  const dayModels = new Map<string, Map<string, DayModelAccumulator>>();
  const models = new Map<string, ModelAccumulator>();
  const unpriced = new Set<string>();
  const sessions = new Set<string>();
  const enriched: EnrichedRow[] = [];

  const totalsSplit = emptySplit();
  let processedTokens = 0;
  let costUsd = 0;
  let cacheSavingsUsd = 0;

  for (const row of rows) {
    if (isExcludedProvider(row.provider, options.excludedProviders ?? EXCLUDED_PROVIDERS)) continue;

    const cachedInput = row.cacheReadTokens;
    const uncachedInput = row.inputTokens + row.cacheWriteTokens;
    const tokens = cachedInput + uncachedInput + row.outputTokens;
    if (tokens <= 0) continue;

    const buckets = {
      input: row.inputTokens,
      cacheRead: row.cacheReadTokens,
      cacheWrite: row.cacheWriteTokens,
      output: row.outputTokens,
    };

    let cost = 0;
    if (row.reportedCostUsd > 0) {
      cost = row.reportedCostUsd;
    } else if (isFreeProvider(row.provider)) {
      cost = 0;
    } else {
      const price: ModelPrice | null = findPrice(prices, row.provider, row.model);
      if (price) {
        cost = costOf(price, buckets);
        cacheSavingsUsd += cacheSavingsOf(price, buckets);
      } else {
        unpriced.add(row.model);
      }
    }

    const sessionKey = row.sessionId ? `${row.agent}:${row.sessionId}` : "";
    processedTokens += tokens;
    costUsd += cost;
    addSplit(totalsSplit, cachedInput, uncachedInput, row.outputTokens);
    if (sessionKey) sessions.add(sessionKey);

    const dayProviders = days.get(row.usageDate) ?? new Map<string, { tokens: number; costUsd: number } & Split>();
    const dayEntry = dayProviders.get(row.provider) ?? { tokens: 0, costUsd: 0, ...emptySplit() };
    dayEntry.tokens += tokens;
    dayEntry.costUsd += cost;
    addSplit(dayEntry, cachedInput, uncachedInput, row.outputTokens);
    dayProviders.set(row.provider, dayEntry);
    days.set(row.usageDate, dayProviders);

    const daySplit = daySplits.get(row.usageDate) ?? emptySplit();
    addSplit(daySplit, cachedInput, uncachedInput, row.outputTokens);
    daySplits.set(row.usageDate, daySplit);

    const key = modelKey(row.provider, row.model);
    const modelEntry = models.get(key) ?? {
      provider: row.provider,
      model: row.model,
      tokens: 0,
      costUsd: 0,
      lastUsed: row.usageDate,
    };
    modelEntry.tokens += tokens;
    modelEntry.costUsd += cost;
    if (row.usageDate > modelEntry.lastUsed) modelEntry.lastUsed = row.usageDate;
    models.set(key, modelEntry);

    const modelsOfDay = dayModels.get(row.usageDate) ?? new Map<string, DayModelAccumulator>();
    const dayModel = modelsOfDay.get(key) ?? {
      provider: row.provider,
      model: row.model,
      tokens: 0,
      ...emptySplit(),
      costUsd: 0,
    };
    dayModel.tokens += tokens;
    dayModel.costUsd += cost;
    addSplit(dayModel, cachedInput, uncachedInput, row.outputTokens);
    modelsOfDay.set(key, dayModel);
    dayModels.set(row.usageDate, modelsOfDay);

    enriched.push({
      date: row.usageDate,
      provider: row.provider,
      model: row.model,
      sessionKey,
      tokens,
      split: { cachedInput, uncachedInput, output: row.outputTokens },
      costUsd: cost,
    });
  }

  let undatedTokens = 0;
  let undatedCostUsd = 0;
  for (const entry of options.undatedRemainder ?? []) {
    undatedTokens += entry.tokens;
    const price = findPrice(prices, "anthropic", entry.model);
    if (price) undatedCostUsd += costOf(price, entry.buckets);
  }

  const dayDates = [...days.keys()].sort();
  const candidates = [dayDates[0], options.firstSessionDate ? toUsageDate(options.firstSessionDate) : ""].filter(
    (value): value is string => typeof value === "string" && value.length === 10,
  );
  const firstUsageDate = candidates.length > 0 ? candidates.sort()[0] : "";

  const rankedModels = [...models.entries()].sort((a, b) => b[1].tokens - a[1].tokens);
  const topModelKeys = rankedModels.slice(0, TOP_MODELS_PER_DAY).map(([key]) => key);
  const topModelSet = new Set(topModelKeys);

  const outputDays: TokenmaxxingDay[] = [...days.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, providers]) => {
      const split = daySplits.get(date) ?? emptySplit();
      const providerEntries: TokenmaxxingDay["providers"] = {};
      for (const [provider, value] of [...providers.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
        providerEntries[provider] = {
          tokens: value.tokens,
          cachedInput: value.cachedInput,
          uncachedInput: value.uncachedInput,
          output: value.output,
          costUsd: round(value.costUsd),
        };
      }

      const perModel = dayModels.get(date) ?? new Map<string, DayModelAccumulator>();
      const other: DayModelAccumulator = {
        provider: "other",
        model: "other",
        tokens: 0,
        ...emptySplit(),
        costUsd: 0,
      };
      for (const [key, entry] of perModel) {
        if (topModelSet.has(key)) continue;
        other.tokens += entry.tokens;
        other.costUsd += entry.costUsd;
        addSplit(other, entry.cachedInput, entry.uncachedInput, entry.output);
      }

      const modelEntries: TokenmaxxingDay["models"] = [];
      for (const key of topModelKeys) {
        const entry = perModel.get(key);
        if (!entry || entry.tokens <= 0) continue;
        modelEntries.push({
          provider: entry.provider,
          model: entry.model,
          tokens: entry.tokens,
          cachedInput: entry.cachedInput,
          uncachedInput: entry.uncachedInput,
          output: entry.output,
          costUsd: round(entry.costUsd),
        });
      }
      if (other.tokens > 0) {
        modelEntries.push({
          provider: other.provider,
          model: other.model,
          tokens: other.tokens,
          cachedInput: other.cachedInput,
          uncachedInput: other.uncachedInput,
          output: other.output,
          costUsd: round(other.costUsd),
        });
      }

      return {
        date,
        cachedInput: split.cachedInput,
        uncachedInput: split.uncachedInput,
        output: split.output,
        providers: providerEntries,
        models: modelEntries,
      };
    });

  const outputModels: TokenmaxxingModel[] = rankedModels.map(([, entry]) => ({
    provider: entry.provider,
    model: entry.model,
    tokens: entry.tokens,
    costUsd: round(entry.costUsd),
    lastUsed: entry.lastUsed,
  }));

  const lastDate = dayDates.length > 0 ? dayDates[dayDates.length - 1] : toUsageDate(new Date());

  return {
    generatedAt,
    timezone,
    firstUsageDate,
    totals: {
      processedTokens,
      cachedInput: totalsSplit.cachedInput,
      uncachedInput: totalsSplit.uncachedInput,
      output: totalsSplit.output,
      costUsd: round(costUsd),
      cacheSavingsUsd: round(cacheSavingsUsd),
      sessions: sessions.size,
      undatedTokens,
      undatedCostUsd: round(undatedCostUsd),
    },
    days: outputDays,
    models: outputModels,
    breakdowns: buildBreakdowns(enriched, lastDate),
    quotas,
    unpricedModels: [...unpriced].sort(),
  };
}
