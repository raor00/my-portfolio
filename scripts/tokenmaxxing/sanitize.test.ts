import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FORBIDDEN_SUBSTRINGS, validateOutput } from "./sanitize";
import { REPO_ROOT } from "./config";

function valid() {
  return {
    generatedAt: "2026-01-02T00:00:00.000Z",
    timezone: "America/Caracas",
    totals: { processedTokens: 1000, costUsd: 1.23, cacheSavingsUsd: 0.45, sessions: 7 },
    days: [{ date: "2026-01-01", providers: { anthropic: { tokens: 1000, costUsd: 1.23 } } }],
    models: [{ provider: "anthropic", model: "claude-opus-5-5", tokens: 1000, costUsd: 1.23, lastUsed: "2026-01-01" }],
    quotas: [
      {
        id: "claude",
        plan: "max",
        status: "ok",
        windows: [
          { label: "5h", usedPercent: 44.4, resetsAt: "2026-01-02T03:04:05.000Z", windowSeconds: 18000 },
          { label: "7d", usedPercent: 81, resetsAt: null, windowSeconds: 604800 },
        ],
        error: null,
      },
    ],
    unpricedModels: ["qwen3.6"],
  };
}

describe("output sanitization", () => {
  test("accepts the published schema", () => {
    expect(validateOutput(valid())).toEqual([]);
  });

  test("rejects any extra key at every level", () => {
    const topLevel = { ...valid(), accountId: "x" } as Record<string, unknown>;
    expect(validateOutput(topLevel).length).toBe(1);

    const nested = valid();
    (nested.totals as Record<string, unknown>).email = "a@b.c";
    expect(validateOutput(nested).some((violation) => violation.includes("totals keys"))).toBe(true);

    const model = valid();
    (model.models[0] as Record<string, unknown>).path = "/Users/oviedo";
    expect(validateOutput(model).some((violation) => violation.includes("model keys"))).toBe(true);
  });

  test("rejects provider and model ids outside the allowlist", () => {
    const badProvider = valid();
    badProvider.days[0].providers = { "/Users/oviedo": { tokens: 1, costUsd: 0 } };
    expect(validateOutput(badProvider).some((violation) => violation.includes("unsafe provider"))).toBe(true);

    const badModel = valid();
    badModel.models[0].model = "~/secrets/model";
    expect(validateOutput(badModel).some((violation) => violation.includes("unsafe model"))).toBe(true);

    const badUnpriced = valid();
    badUnpriced.unpricedModels = ["/tmp/x"];
    expect(validateOutput(badUnpriced).some((violation) => violation.includes("unsafe unpriced"))).toBe(true);
  });

  test("rejects quota percentages outside 0..100 and unsafe statuses", () => {
    const outOfRange = valid();
    outOfRange.quotas[0].windows[0].usedPercent = 140;
    expect(validateOutput(outOfRange).some((violation) => violation.includes("usedPercent"))).toBe(true);

    const badStatus = valid();
    (badStatus.quotas[0] as Record<string, unknown>).status = "live";
    expect(validateOutput(badStatus).some((violation) => violation.includes("quota status"))).toBe(true);

    const rawError = valid();
    (rawError.quotas[0] as Record<string, unknown>).error = "HTTP 500: {\"detail\":\"boom\"}";
    expect(validateOutput(rawError).some((violation) => violation.includes("unsafe quota error"))).toBe(true);
  });

  test("rejects every forbidden substring anywhere in the document", () => {
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      const tainted = valid();
      tainted.quotas[0].plan = `p${forbidden}x`;
      expect(validateOutput(tainted).some((violation) => violation.includes("forbidden"))).toBe(true);
    }
  });

  test("the committed src/data/tokenmaxxing.json is schema-clean", () => {
    const path = join(REPO_ROOT, "src", "data", "tokenmaxxing.json");
    expect(existsSync(path)).toBe(true);
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    expect(validateOutput(parsed)).toEqual([]);

    const text = readFileSync(path, "utf8");
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      expect(text.includes(forbidden)).toBe(false);
    }
    expect(parsed.quotas).toEqual([]);
    expect(parsed.totals.processedTokens).toBeGreaterThan(0);
  });
});
