import type { Database } from "bun:sqlite";
import { EXCLUDED_PROVIDERS, isExcludedProvider, isFreeProvider } from "./config";
import { cacheSavingsOf, costOf, findPrice, type ModelPrice, type PriceTable } from "./pricing";
import type { QuotaProvider, TokenmaxxingDay, TokenmaxxingModel, TokenmaxxingOutput } from "./sanitize";
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

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Reads every ledger row (all-time), newest last. Excluded providers are dropped
 * in SQL so they can never reach an accumulator.
 */
export function readUsageRows(db: Database): UsageRow[] {
  const placeholders = EXCLUDED_PROVIDERS.map(() => "?").join(",");
  const notIn = placeholders ? ` WHERE provider NOT IN (${placeholders})` : "";
  const rows = db
    .prepare(
      `SELECT agent, provider, model, session_id, input_tokens, cache_read_tokens,
              cache_write_tokens, output_tokens, reported_cost_usd, occurred_at, usage_date
       FROM usage${notIn} ORDER BY usage_date`,
    )
    .all(...EXCLUDED_PROVIDERS) as {
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
  costUsd: number;
}

function modelKey(provider: string, model: string): string {
  return `${provider}\u0000${model}`;
}

/**
 * Builds the public aggregate. Reported costs win; everything else is priced
 * through LiteLLM or listed as unpriced (never invented). Excluded providers
 * are dropped before any accumulator sees them.
 */
export function aggregate(options: AggregateOptions): TokenmaxxingOutput {
  const { rows, prices, quotas, generatedAt, timezone } = options;

  const days = new Map<string, Map<string, { tokens: number; costUsd: number }>>();
  const dayModels = new Map<string, Map<string, DayModelAccumulator>>();
  const models = new Map<string, ModelAccumulator>();
  const unpriced = new Set<string>();
  const sessions = new Set<string>();

  let processedTokens = 0;
  let costUsd = 0;
  let cacheSavingsUsd = 0;

  for (const row of rows) {
    if (isExcludedProvider(row.provider)) continue;

    const tokens = row.inputTokens + row.cacheReadTokens + row.cacheWriteTokens + row.outputTokens;
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

    processedTokens += tokens;
    costUsd += cost;
    if (row.sessionId) sessions.add(`${row.agent}:${row.sessionId}`);

    const dayProviders = days.get(row.usageDate) ?? new Map<string, { tokens: number; costUsd: number }>();
    const dayEntry = dayProviders.get(row.provider) ?? { tokens: 0, costUsd: 0 };
    dayEntry.tokens += tokens;
    dayEntry.costUsd += cost;
    dayProviders.set(row.provider, dayEntry);
    days.set(row.usageDate, dayProviders);

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
    const dayModel = modelsOfDay.get(key) ?? { provider: row.provider, model: row.model, tokens: 0, costUsd: 0 };
    dayModel.tokens += tokens;
    dayModel.costUsd += cost;
    modelsOfDay.set(key, dayModel);
    dayModels.set(row.usageDate, modelsOfDay);
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
      const providerEntries: Record<string, { tokens: number; costUsd: number }> = {};
      for (const [provider, value] of [...providers.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
        providerEntries[provider] = { tokens: value.tokens, costUsd: round(value.costUsd) };
      }

      const perModel = dayModels.get(date) ?? new Map<string, DayModelAccumulator>();
      const other = { provider: "other", model: "other", tokens: 0, costUsd: 0 };
      for (const [key, entry] of perModel) {
        if (topModelSet.has(key)) continue;
        other.tokens += entry.tokens;
        other.costUsd += entry.costUsd;
      }

      const modelEntries: TokenmaxxingDay["models"] = [];
      for (const key of topModelKeys) {
        const entry = perModel.get(key);
        if (!entry || entry.tokens <= 0) continue;
        modelEntries.push({
          provider: entry.provider,
          model: entry.model,
          tokens: entry.tokens,
          costUsd: round(entry.costUsd),
        });
      }
      if (other.tokens > 0) {
        modelEntries.push({
          provider: other.provider,
          model: other.model,
          tokens: other.tokens,
          costUsd: round(other.costUsd),
        });
      }

      return { date, providers: providerEntries, models: modelEntries };
    });

  const outputModels: TokenmaxxingModel[] = rankedModels.map(([, entry]) => ({
    provider: entry.provider,
    model: entry.model,
    tokens: entry.tokens,
    costUsd: round(entry.costUsd),
    lastUsed: entry.lastUsed,
  }));

  return {
    generatedAt,
    timezone,
    firstUsageDate,
    totals: {
      processedTokens,
      costUsd: round(costUsd),
      cacheSavingsUsd: round(cacheSavingsUsd),
      sessions: sessions.size,
      undatedTokens,
      undatedCostUsd: round(undatedCostUsd),
    },
    days: outputDays,
    models: outputModels,
    quotas,
    unpricedModels: [...unpriced].sort(),
  };
}
