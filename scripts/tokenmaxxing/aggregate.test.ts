import { describe, expect, test } from "bun:test";
import { aggregate, type UsageRow } from "./aggregate";
import type { PriceTable } from "./pricing";
import { validateOutput } from "./sanitize";

const prices: PriceTable = {
  "claude-opus-5-5": {
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00005,
    cache_read_input_token_cost: 0.000001,
    cache_creation_input_token_cost: 0.0000125,
  },
  "opencode_go/deepseek-v4.1-flash": { input_cost_per_token: 0.0000002, output_cost_per_token: 0.0000008 },
};

function row(overrides: Partial<UsageRow> = {}): UsageRow {
  return {
    agent: "claude",
    provider: "anthropic",
    model: "claude-opus-5-5",
    sessionId: "session-1",
    inputTokens: 1000,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 100,
    reportedCostUsd: 0,
    occurredAt: "2026-01-01T12:00:00.000Z",
    usageDate: "2026-01-01",
    ...overrides,
  };
}

const base = {
  prices,
  quotas: [],
  generatedAt: "2026-01-02T00:00:00.000Z",
  timezone: "America/Caracas",
};

describe("aggregate", () => {
  test("counts processed tokens as input + cache read + cache write + output, never reasoning", () => {
    const output = aggregate({
      ...base,
      rows: [row({ inputTokens: 1000, cacheReadTokens: 500, cacheWriteTokens: 200, outputTokens: 100 })],
    });
    expect(output.totals.processedTokens).toBe(1800);
  });

  test("prices unreported usage and prefers a reported cost", () => {
    const priced = aggregate({
      ...base,
      rows: [row({ inputTokens: 1000, outputTokens: 100 })],
    });
    // 0.015 rounds to cents in the published file.
    expect(priced.totals.costUsd).toBe(0.02);

    const reported = aggregate({
      ...base,
      rows: [row({ reportedCostUsd: 3.3333 })],
    });
    expect(reported.totals.costUsd).toBe(3.33);
  });

  test("computes cache savings from the cache-read discount", () => {
    const output = aggregate({ ...base, rows: [row({ cacheReadTokens: 10_000, inputTokens: 0, outputTokens: 0 })] });
    expect(output.totals.cacheSavingsUsd).toBeCloseTo(0.09, 2);
  });

  test("lists unpriced models instead of guessing a price", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ provider: "nan", model: "qwen3.6", inputTokens: 10, outputTokens: 10 }),
        row({ provider: "nan", model: "muse-spark-1.3-contributor-free", inputTokens: 10, outputTokens: 10 }),
      ],
    });
    expect(output.unpricedModels).toEqual(["muse-spark-1.3-contributor-free", "qwen3.6"]);
    expect(output.totals.costUsd).toBe(0);
  });

  test("counts distinct sessions across agents", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ sessionId: "a" }),
        row({ sessionId: "a" }),
        row({ sessionId: "b" }),
        row({ agent: "pi", sessionId: "a" }),
        row({ sessionId: "" }),
      ],
    });
    expect(output.totals.sessions).toBe(3);
  });

  test("groups days by provider and sums per model", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ usageDate: "2026-01-01", inputTokens: 100, outputTokens: 10 }),
        row({ usageDate: "2026-01-02", inputTokens: 200, outputTokens: 20 }),
        row({ usageDate: "2026-01-02", provider: "opencode-go", model: "deepseek-v4.1-flash", inputTokens: 50, outputTokens: 5 }),
      ],
    });
    const dates = output.days.map((day) => day.date);
    expect(dates).toEqual(["2026-01-01", "2026-01-02"]);
    expect(Object.keys(output.days[1].providers).sort()).toEqual(["anthropic", "opencode-go"]);
    expect(output.models.length).toBe(2);
    expect(output.models[0].tokens).toBe(330);
    expect(output.models[0].lastUsed).toBe("2026-01-02");
  });

  test("skips all-zero rows and keeps the output schema-valid", () => {
    const output = aggregate({
      ...base,
      rows: [row({ inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }), row()],
    });
    expect(output.totals.processedTokens).toBe(1100);
    expect(validateOutput(output)).toEqual([]);
  });
});
