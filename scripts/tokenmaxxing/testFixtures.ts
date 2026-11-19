/**
 * Shared shapes for the collector tests. Not a test file on its own; Bun only
 * picks up `*.test.ts`, so this module is safe to import from several suites.
 */

export function splitEntry(cachedInput: number, uncachedInput: number, output: number) {
  return { cachedInput, uncachedInput, output, tokens: cachedInput + uncachedInput + output };
}

export function breakdownWindow(providers: unknown[] = [], models: unknown[] = []) {
  return { providers, models };
}

export function validOutput() {
  return {
    generatedAt: "2026-01-02T00:00:00.000Z",
    timezone: "America/Caracas",
    firstUsageDate: "2026-01-01",
    totals: {
      processedTokens: 1000,
      cachedInput: 600,
      uncachedInput: 300,
      output: 100,
      costUsd: 1.23,
      cacheSavingsUsd: 0.45,
      sessions: 7,
      undatedTokens: 0,
      undatedCostUsd: 0,
    },
    days: [
      {
        date: "2026-01-01",
        cachedInput: 600,
        uncachedInput: 300,
        output: 100,
        providers: {
          anthropic: { tokens: 1000, cachedInput: 600, uncachedInput: 300, output: 100, costUsd: 1.23 },
        },
        models: [
          {
            provider: "anthropic",
            model: "claude-opus-5-5",
            tokens: 1000,
            cachedInput: 600,
            uncachedInput: 300,
            output: 100,
            costUsd: 1.23,
          },
        ],
      },
    ],
    models: [{ provider: "anthropic", model: "claude-opus-5-5", tokens: 1000, costUsd: 1.23, lastUsed: "2026-01-01" }],
    breakdowns: {
      "7": breakdownWindow(
        [
          {
            provider: "anthropic",
            label: "Anthropic",
            sessions: 3,
            tokens: 1000,
            cachedInput: 600,
            uncachedInput: 300,
            output: 100,
            costUsd: 1.23,
          },
        ],
        [
          {
            provider: "anthropic",
            label: "Anthropic",
            model: "claude-opus-5-5",
            sessions: 3,
            tokens: 1000,
            cachedInput: 600,
            uncachedInput: 300,
            output: 100,
            costUsd: 1.23,
            lastUsed: "2026-01-01",
          },
        ],
      ),
      "30": breakdownWindow(),
      "90": breakdownWindow(),
      "365": breakdownWindow(),
      all: breakdownWindow(),
    },
    quotas: [] as unknown[],
    unpricedModels: ["qwen3.6"],
  };
}
