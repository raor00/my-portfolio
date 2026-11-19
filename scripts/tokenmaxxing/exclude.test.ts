import { describe, expect, test } from "bun:test";
import { aggregate, readUsageRows, TOP_MODELS_PER_DAY, type UsageRow } from "./aggregate";
import { EXCLUDED_PROVIDERS, isExcludedProvider, providerLabel } from "./config";
import { openLedger, upsertUsage } from "./ledger";
import type { PriceTable } from "./pricing";
import { validateOutput } from "./sanitize";

const prices: PriceTable = {
  "claude-opus-5-5": { input_cost_per_token: 0.00001, output_cost_per_token: 0.00005 },
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

const base = { prices, quotas: [], generatedAt: "2026-01-02T00:00:00.000Z", timezone: "America/Caracas" };

describe("excluded providers", () => {
  test("lyber is back in scope and the exclusion list is empty", () => {
    expect(EXCLUDED_PROVIDERS).toEqual([]);
    expect(isExcludedProvider("lyber")).toBe(false);
    expect(isExcludedProvider("lyber", ["lyber"])).toBe(true);
  });

  test("the mechanism still drops a fake excluded provider everywhere", () => {
    const output = aggregate({
      ...base,
      rows: [
        row(),
        row({ provider: "fake-excluded", model: "kimi-k31-pro-abliterated", sessionId: "fake-session" }),
      ],
      excludedProviders: ["fake-excluded"],
    });

    expect(output.totals.processedTokens).toBe(1100);
    expect(output.totals.sessions).toBe(1);
    expect(Object.keys(output.days[0].providers)).toEqual(["anthropic"]);
    expect(output.models.map((model) => model.provider)).toEqual(["anthropic"]);
    expect(output.breakdowns.all.providers.map((entry) => entry.provider)).toEqual(["anthropic"]);
    expect(output.unpricedModels).toEqual([]);
    expect(JSON.stringify(output)).not.toContain("fake-excluded");
    expect(validateOutput(output)).toEqual([]);
  });

  test("the SQL read honours an explicit exclusion list", () => {
    const db = openLedger(":memory:");
    try {
      for (const provider of ["lyber", "anthropic"]) {
        upsertUsage(db, {
          agent: "pi",
          provider,
          model: "claude-opus-5-5",
          externalId: provider,
          inputTokens: 10,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          outputTokens: 1,
          reasoningTokens: 0,
          reportedCostUsd: 0,
          occurredAt: new Date().toISOString(),
        });
      }
      expect(readUsageRows(db).length).toBe(2);
      const filtered = readUsageRows(db, ["lyber"]);
      expect(filtered.map((entry) => entry.provider)).toEqual(["anthropic"]);
    } finally {
      db.close();
    }
  });

  test("lyber rows do reach the totals and breakdowns when nothing is excluded", () => {
    const output = aggregate({
      ...base,
      rows: [row(), row({ provider: "lyber", model: "kimi-k31-pro-abliterated", sessionId: "lyber-1" })],
    });
    expect(output.breakdowns.all.providers.map((entry) => entry.provider).sort()).toEqual(["anthropic", "lyber"]);
    expect(output.breakdowns.all.providers.find((entry) => entry.provider === "lyber")?.label).toBe("lyber.ai");
    expect(validateOutput(output)).toEqual([]);
  });
});

describe("token split", () => {
  test("cachedInput + uncachedInput + output always equals the processed total", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ inputTokens: 100, cacheReadTokens: 900, cacheWriteTokens: 50, outputTokens: 10 }),
        row({ inputTokens: 7, cacheReadTokens: 0, cacheWriteTokens: 3, outputTokens: 1 }),
      ],
    });
    expect(output.totals.cachedInput).toBe(900);
    expect(output.totals.uncachedInput).toBe(160); // input 107 + cache_write 53
    expect(output.totals.output).toBe(11);
    expect(output.totals.cachedInput + output.totals.uncachedInput + output.totals.output).toBe(
      output.totals.processedTokens,
    );

    const day = output.days[0];
    expect(day.cachedInput + day.uncachedInput + day.output).toBe(
      Object.values(day.providers).reduce((sum, entry) => sum + entry.tokens, 0),
    );
    for (const entry of Object.values(day.providers)) {
      expect(entry.cachedInput + entry.uncachedInput + entry.output).toBe(entry.tokens);
    }
    expect(validateOutput(output)).toEqual([]);
  });

  test("desktop usage merges into Anthropic but keeps its own sessions", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ agent: "claude", sessionId: "code-1" }),
        row({ agent: "claude-desktop", sessionId: "desk-1" }),
        row({ agent: "claude-desktop", sessionId: "desk-2" }),
      ],
    });

    const anthropic = output.breakdowns.all.providers.find((entry) => entry.provider === "anthropic")!;
    expect(anthropic.label).toBe("Anthropic");
    expect(anthropic.tokens).toBe(3300);
    expect(output.totals.sessions).toBe(3);
    // One provider row only: Desktop is Anthropic in the public breakdowns.
    expect(output.breakdowns.all.providers.length).toBe(1);
    expect(output.breakdowns.all.models[0].tokens).toBe(3300);
    expect(validateOutput(output)).toEqual([]);
  });
});

describe("per-window breakdowns", () => {
  test("exposes 7/30/90/365/all windows", () => {
    const output = aggregate({ ...base, rows: [row()] });
    expect(Object.keys(output.breakdowns)).toEqual(["7", "30", "90", "365", "all"]);
  });

  test("each window sums only its own days and counts distinct sessions", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ usageDate: "2026-01-01", inputTokens: 100, outputTokens: 10, sessionId: "old" }),
        row({ usageDate: "2026-01-02", inputTokens: 200, outputTokens: 20, sessionId: "mid" }),
        row({ usageDate: "2026-01-09", inputTokens: 400, outputTokens: 40, sessionId: "new" }),
      ],
    });

    // Last day is 2026-01-09, so the 7-day window is 01-03..01-09.
    const week = output.breakdowns["7"].providers[0];
    expect(week.tokens).toBe(440);
    expect(week.sessions).toBe(1);

    const month = output.breakdowns["30"].providers[0];
    expect(month.tokens).toBe(770);
    expect(month.sessions).toBe(3);

    expect(output.breakdowns.all.providers[0].tokens).toBe(770);
    expect(output.breakdowns.all.models[0].lastUsed).toBe("2026-01-09");

    for (const window of ["7", "30", "90", "365", "all"]) {
      for (const entry of output.breakdowns[window].providers) {
        expect(entry.cachedInput + entry.uncachedInput + entry.output).toBe(entry.tokens);
      }
    }
    expect(validateOutput(output)).toEqual([]);
  });

  test("breakdowns carry no zero rows and use display labels", () => {
    const output = aggregate({
      ...base,
      rows: [
        row({ provider: "opencode-go", model: "deepseek-v4.1-flash" }),
        row({ provider: "xai", model: "grok-4.7", sessionId: "x" }),
      ],
    });
    expect(output.breakdowns.all.providers.map((entry) => entry.label)).toEqual(["OpenCode Go", "Grok"]);
    expect(providerLabel("opencode-zen")).toBe("OpenCode Zen");
    expect(providerLabel("lyber")).toBe("lyber.ai");
    expect(providerLabel("zai")).toBe("z.ai");
    expect(providerLabel("ollama")).toBe("Ollama");
    expect(providerLabel("something-new")).toBe("something-new");
    expect(output.breakdowns.all.providers.every((entry) => entry.tokens > 0)).toBe(true);
  });
});

describe("per-day model breakdown", () => {
  test("keeps the top models by window tokens plus one other bucket", () => {
    const rows: UsageRow[] = [];
    for (let index = 0; index < TOP_MODELS_PER_DAY + 4; index += 1) {
      rows.push(row({ model: `model-${index}`, inputTokens: 10_000 - index * 100, outputTokens: 0 }));
    }
    const output = aggregate({ ...base, rows });

    expect(output.days[0].models.length).toBe(TOP_MODELS_PER_DAY + 1);
    expect(output.days[0].models[0].model).toBe("model-0");
    expect(output.days[0].models[TOP_MODELS_PER_DAY].model).toBe("other");
    const dayModelTokens = output.days[0].models.reduce((sum, model) => sum + model.tokens, 0);
    expect(dayModelTokens).toBe(output.totals.processedTokens);
    // The breakdowns keep the full list, no top-N cap.
    expect(output.breakdowns.all.models.length).toBe(TOP_MODELS_PER_DAY + 4);
    expect(validateOutput(output)).toEqual([]);
  });

  test("day model costs are rounded to cents and never include zero rows", () => {
    const output = aggregate({ ...base, rows: [row()] });
    expect(output.days[0].models.length).toBe(1);
    expect(output.days[0].models[0].costUsd).toBe(0.02);
  });
});
