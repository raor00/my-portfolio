import { describe, expect, test } from "bun:test";
import { aggregate, readUsageRows, TOP_MODELS_PER_DAY, type UsageRow } from "./aggregate";
import { EXCLUDED_PROVIDERS, isExcludedProvider } from "./config";
import { openLedger, upsertUsage } from "./ledger";
import type { PriceTable } from "./pricing";
import { validateOutput } from "./sanitize";

const prices: PriceTable = {
  "claude-opus-5-5": { input_cost_per_token: 0.00001, output_cost_per_token: 0.00005 },
};

function row(overrides: Partial<UsageRow> = {}): UsageRow {
  return {
    agent: "pi",
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

const base = { prices, quotas: [], generatedAt: "2026-01-02T00:00:00.000Z", timezone: "America/Caracas" };

describe("excluded providers", () => {
  test("lyber is the excluded provider", () => {
    expect(EXCLUDED_PROVIDERS).toContain("lyber");
    expect(isExcludedProvider("lyber")).toBe(true);
    expect(isExcludedProvider("anthropic")).toBe(false);
  });

  test("excluded rows never reach totals, days, models, sessions or unpriced", () => {
    const output = aggregate({
      ...base,
      rows: [
        row(),
        row({ provider: "lyber", model: "deepseek-v4.1-flash-1017-abliterated", sessionId: "lyber-session" }),
      ],
    });

    expect(output.totals.processedTokens).toBe(1100);
    expect(output.totals.sessions).toBe(1);
    expect(output.days.length).toBe(1);
    expect(Object.keys(output.days[0].providers)).toEqual(["anthropic"]);
    expect(output.models.map((model) => model.provider)).toEqual(["anthropic"]);
    expect(output.days[0].models.map((model) => model.provider)).toEqual(["anthropic"]);
    expect(output.unpricedModels).toEqual([]);
    expect(JSON.stringify(output)).not.toContain("lyber");
    expect(validateOutput(output)).toEqual([]);
  });

  test("the ledger read filters excluded providers in SQL", () => {
    const db = openLedger(":memory:");
    try {
      upsertUsage(db, {
        agent: "pi",
        provider: "lyber",
        model: "kimi-k31-pro-abliterated",
        externalId: "a",
        inputTokens: 10,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        outputTokens: 1,
        reasoningTokens: 0,
        reportedCostUsd: 0,
        occurredAt: new Date().toISOString(),
      });
      upsertUsage(db, {
        agent: "pi",
        provider: "anthropic",
        model: "claude-opus-5-5",
        externalId: "b",
        inputTokens: 10,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        outputTokens: 1,
        reasoningTokens: 0,
        reportedCostUsd: 0,
        occurredAt: new Date().toISOString(),
      });
      const rows = readUsageRows(db);
      expect(rows.length).toBe(1);
      expect(rows[0].provider).toBe("anthropic");
    } finally {
      db.close();
    }
  });
});

describe("per-day model breakdown", () => {
  test("keeps the top models by window tokens plus one other bucket", () => {
    const rows: UsageRow[] = [];
    for (let index = 0; index < TOP_MODELS_PER_DAY + 4; index += 1) {
      rows.push(
        row({
          model: `model-${index}`,
          // Descending volume so the ranking is unambiguous.
          inputTokens: 10_000 - index * 100,
          outputTokens: 0,
        }),
      );
    }
    const output = aggregate({ ...base, rows });

    expect(output.days[0].models.length).toBe(TOP_MODELS_PER_DAY + 1);
    expect(output.days[0].models[0].model).toBe("model-0");
    expect(output.days[0].models[TOP_MODELS_PER_DAY].model).toBe("other");
    expect(output.days[0].models[TOP_MODELS_PER_DAY].provider).toBe("other");

    const dayModelTokens = output.days[0].models.reduce((sum, model) => sum + model.tokens, 0);
    expect(dayModelTokens).toBe(output.totals.processedTokens);
    expect(validateOutput(output)).toEqual([]);
  });

  test("day model costs are rounded to cents and never include zero rows", () => {
    const output = aggregate({ ...base, rows: [row()] });
    expect(output.days[0].models.length).toBe(1);
    expect(output.days[0].models[0].costUsd).toBe(0.02);
  });
});
