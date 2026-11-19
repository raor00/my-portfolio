import { describe, expect, test } from "bun:test";
import {
  buildStatsRows,
  computeUndatedRemainder,
  parseStatsCache,
  splitByRatios,
  statsDates,
} from "./parsers/statsCache";
import { aggregate } from "./aggregate";
import { validateOutput } from "./sanitize";
import type { PriceTable } from "./pricing";

/** Ratios: input 1, output 4, cacheRead 30, cacheWrite 5 -> total 40. */
const raw = {
  version: 5,
  firstSessionDate: "2026-04-20T18:03:06.954Z",
  lastComputedDate: "2026-08-20",
  dailyModelTokens: [
    { date: "2026-06-22", tokensByModel: { "claude-sonnet-5": 4000, "claude-opus-5": 800 } },
    { date: "2026-06-23", tokensByModel: { "claude-sonnet-5": 1200 } },
  ],
  modelUsage: {
    "claude-sonnet-5": {
      inputTokens: 100,
      outputTokens: 400,
      cacheReadInputTokens: 3000,
      cacheCreationInputTokens: 500,
      costUSD: 0,
    },
    "claude-opus-5": {
      inputTokens: 10,
      outputTokens: 40,
      cacheReadInputTokens: 300,
      cacheCreationInputTokens: 50,
    },
  },
};

const prices: PriceTable = {
  "claude-sonnet-5": {
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    cache_read_input_token_cost: 0.0000003,
    cache_creation_input_token_cost: 0.00000375,
  },
  "claude-opus-5": {
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    cache_read_input_token_cost: 0.0000015,
    cache_creation_input_token_cost: 0.00001875,
  },
};

describe("stats-cache backfill", () => {
  test("parses the cache shape and exposes the first session date", () => {
    const cache = parseStatsCache(raw);
    expect(cache?.firstSessionDate).toBe("2026-04-20T18:03:06.954Z");
    expect(statsDates(cache!)).toEqual(["2026-06-22", "2026-06-23"]);
    expect(Object.keys(cache!.modelUsage)).toEqual(["claude-sonnet-5", "claude-opus-5"]);
  });

  test("splits one token total using the model ratios, keeping the sum exact", () => {
    const cache = parseStatsCache(raw)!;
    const buckets = splitByRatios(4000, cache.modelUsage["claude-sonnet-5"])!;
    // 4000 * (100/4000, 400/4000, 3000/4000, 500/4000)
    expect(buckets).toEqual({ input: 100, output: 400, cacheRead: 3000, cacheWrite: 500 });
    const total = buckets.input + buckets.output + buckets.cacheRead + buckets.cacheWrite;
    expect(total).toBe(4000);

    const odd = splitByRatios(1234, cache.modelUsage["claude-sonnet-5"])!;
    expect(odd.input + odd.output + odd.cacheRead + odd.cacheWrite).toBe(1234);
  });

  test("builds one synthetic row per date and model, marked as an estimated split", () => {
    const cache = parseStatsCache(raw)!;
    const rows = buildStatsRows(cache, new Set());
    expect(rows.map((row) => row.externalId)).toEqual([
      "stats:2026-06-22:claude-sonnet-5",
      "stats:2026-06-22:claude-opus-5",
      "stats:2026-06-23:claude-sonnet-5",
    ]);
    expect(rows[0]).toMatchObject({
      agent: "claude",
      provider: "anthropic",
      model: "claude-sonnet-5",
      inputTokens: 100,
      cacheReadTokens: 3000,
      cacheWriteTokens: 500,
      outputTokens: 400,
      occurredAt: "2026-06-22T12:00:00.000Z",
      source: "stats-cache",
      estimatedSplit: true,
    });
  });

  test("skips dates already covered by transcript rows (no double count)", () => {
    const cache = parseStatsCache(raw)!;
    const rows = buildStatsRows(cache, new Set(["2026-06-23"]));
    expect(rows.map((row) => row.externalId)).toEqual([
      "stats:2026-06-22:claude-sonnet-5",
      "stats:2026-06-22:claude-opus-5",
    ]);
    expect(rows.some((row) => row.occurredAt.startsWith("2026-06-23"))).toBe(false);
  });

  test("the undated remainder is modelUsage minus the dated sum", () => {
    const cache = parseStatsCache(raw)!;
    const remainder = computeUndatedRemainder(cache);
    // sonnet: (100+400+3000+500)=4000 total, dated 4000+1200=5200 -> nothing left.
    // opus:   400 total, dated 800 -> nothing left.
    expect(remainder).toEqual([]);

    const withGap = parseStatsCache({
      ...raw,
      modelUsage: {
        ...raw.modelUsage,
        "claude-sonnet-5": {
          inputTokens: 200,
          outputTokens: 800,
          cacheReadInputTokens: 6000,
          cacheCreationInputTokens: 1000,
        },
      },
    })!;
    const gap = computeUndatedRemainder(withGap);
    expect(gap.length).toBe(1);
    expect(gap[0].model).toBe("claude-sonnet-5");
    // 8000 total measured minus 5200 dated.
    expect(gap[0].tokens).toBe(2800);
    const buckets = gap[0].buckets;
    expect(buckets.input + buckets.output + buckets.cacheRead + buckets.cacheWrite).toBe(2800);
  });

  test("undated usage reaches the totals only, never a day row", () => {
    const cache = parseStatsCache(raw)!;
    const rows = buildStatsRows(cache, new Set());
    const output = aggregate({
      rows: rows.map((row) => ({
        agent: row.agent,
        provider: row.provider,
        model: row.model,
        sessionId: "",
        inputTokens: row.inputTokens,
        cacheReadTokens: row.cacheReadTokens,
        cacheWriteTokens: row.cacheWriteTokens,
        outputTokens: row.outputTokens,
        reportedCostUsd: 0,
        occurredAt: row.occurredAt,
        usageDate: row.occurredAt.slice(0, 10),
      })),
      prices,
      quotas: [],
      generatedAt: "2026-08-21T00:00:00.000Z",
      timezone: "America/Caracas",
      firstSessionDate: cache.firstSessionDate,
      undatedRemainder: computeUndatedRemainder(
        parseStatsCache({
          ...raw,
          modelUsage: {
            ...raw.modelUsage,
            "claude-sonnet-5": {
              inputTokens: 200,
              outputTokens: 800,
              cacheReadInputTokens: 6000,
              cacheCreationInputTokens: 1000,
            },
          },
        })!,
      ),
    });

    expect(output.days.map((day) => day.date)).toEqual(["2026-06-22", "2026-06-23"]);
    expect(output.totals.undatedTokens).toBe(2800);
    expect(output.totals.undatedCostUsd).toBeGreaterThan(0);
    // The undated tokens are NOT part of the dated processed total.
    expect(output.totals.processedTokens).toBe(6000);
    // firstSessionDate (04-20) predates every dated row.
    expect(output.firstUsageDate).toBe("2026-04-20");
    expect(validateOutput(output)).toEqual([]);
  });
});
