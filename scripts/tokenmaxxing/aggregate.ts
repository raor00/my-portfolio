import type { Database } from "bun:sqlite";
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

const WINDOW_DAYS = 365;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

/** Reads the window's ledger rows (local usage day, newest last). */
export function readUsageRows(db: Database, today: string = toUsageDate(new Date())): UsageRow[] {
  const from = shiftDate(today, -(WINDOW_DAYS - 1));
  const rows = db
    .prepare(
      `SELECT agent, provider, model, session_id, input_tokens, cache_read_tokens,
              cache_write_tokens, output_tokens, reported_cost_usd, occurred_at, usage_date
       FROM usage WHERE usage_date >= ? AND usage_date <= ? ORDER BY usage_date`,
    )
    .all(from, today) as {
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

export interface AggregateOptions {
  rows: UsageRow[];
  prices: PriceTable;
  quotas: QuotaProvider[];
  generatedAt: string;
  timezone: string;
}

interface ModelAccumulator {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
  lastUsed: string;
}

/**
 * Builds the public aggregate. Reported costs win; everything else is priced
 * through LiteLLM or listed as unpriced (never invented).
 */
export function aggregate(options: AggregateOptions): TokenmaxxingOutput {
  const { rows, prices, quotas, generatedAt, timezone } = options;

  const days = new Map<string, Map<string, { tokens: number; costUsd: number }>>();
  const models = new Map<string, ModelAccumulator>();
  const unpriced = new Set<string>();
  const sessions = new Set<string>();

  let processedTokens = 0;
  let costUsd = 0;
  let cacheSavingsUsd = 0;

  for (const row of rows) {
    const tokens =
      row.inputTokens + row.cacheReadTokens + row.cacheWriteTokens + row.outputTokens;
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

    const modelKey = `${row.provider}\u0000${row.model}`;
    const modelEntry = models.get(modelKey) ?? {
      provider: row.provider,
      model: row.model,
      tokens: 0,
      costUsd: 0,
      lastUsed: row.usageDate,
    };
    modelEntry.tokens += tokens;
    modelEntry.costUsd += cost;
    if (row.usageDate > modelEntry.lastUsed) modelEntry.lastUsed = row.usageDate;
    models.set(modelKey, modelEntry);
  }

  const outputDays: TokenmaxxingDay[] = [...days.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, providers]) => {
      const entries: Record<string, { tokens: number; costUsd: number }> = {};
      for (const [provider, value] of [...providers.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
        entries[provider] = { tokens: value.tokens, costUsd: round(value.costUsd) };
      }
      return { date, providers: entries };
    });

  const outputModels: TokenmaxxingModel[] = [...models.values()]
    .sort((a, b) => b.tokens - a.tokens)
    .map((entry) => ({
      provider: entry.provider,
      model: entry.model,
      tokens: entry.tokens,
      costUsd: round(entry.costUsd),
      lastUsed: entry.lastUsed,
    }));

  return {
    generatedAt,
    timezone,
    totals: {
      processedTokens,
      costUsd: round(costUsd),
      cacheSavingsUsd: round(cacheSavingsUsd),
      sessions: sessions.size,
    },
    days: outputDays,
    models: outputModels,
    quotas,
    unpricedModels: [...unpriced].sort(),
  };
}
