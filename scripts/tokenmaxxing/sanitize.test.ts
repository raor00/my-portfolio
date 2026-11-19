import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FORBIDDEN_SUBSTRINGS, validateOutput } from "./sanitize";
import { REPO_ROOT } from "./config";
import { validOutput } from "./testFixtures";

describe("output sanitization", () => {
  test("accepts the published schema", () => {
    expect(validateOutput(validOutput())).toEqual([]);
  });

  test("the token split must sum to the processed total", () => {
    const broken = validOutput();
    broken.totals.output += 1;
    expect(validateOutput(broken).some((violation) => violation.includes("split does not sum"))).toBe(true);

    const brokenDay = validOutput();
    brokenDay.days[0].providers.anthropic.output += 5;
    expect(validateOutput(brokenDay).some((violation) => violation.includes("split does not sum"))).toBe(true);

    const negative = validOutput();
    negative.breakdowns["7"].providers[0].cachedInput = -1;
    expect(validateOutput(negative).some((violation) => violation.includes("negative"))).toBe(true);
  });

  test("rejects any extra key at every level", () => {
    const topLevel = { ...validOutput(), accountId: "x" } as Record<string, unknown>;
    expect(validateOutput(topLevel).length).toBe(1);

    const nested = validOutput();
    (nested.totals as Record<string, unknown>).email = "a@b.c";
    expect(validateOutput(nested).some((violation) => violation.includes("totals keys"))).toBe(true);

    const model = validOutput();
    (model.models[0] as Record<string, unknown>).path = "/Users/oviedo";
    expect(validateOutput(model).some((violation) => violation.includes("model keys"))).toBe(true);

    const breakdown = validOutput();
    (breakdown.breakdowns["7"].providers[0] as Record<string, unknown>).sessionId = "abc";
    expect(validateOutput(breakdown).some((violation) => violation.includes("provider keys mismatch"))).toBe(true);
  });

  test("breakdown windows must be exactly 7/30/90/365/all", () => {
    const missing = validOutput();
    delete (missing.breakdowns as Record<string, unknown>)["365"];
    expect(validateOutput(missing).some((violation) => violation.includes("windows mismatch"))).toBe(true);
  });

  test("provider labels allow spaces and dots but never paths", () => {
    const spaced = validOutput();
    spaced.breakdowns["7"].providers[0].label = "OpenCode Go";
    expect(validateOutput(spaced)).toEqual([]);

    const dotted = validOutput();
    dotted.breakdowns["7"].providers[0].label = "lyber.ai";
    expect(validateOutput(dotted)).toEqual([]);

    const path = validOutput();
    path.breakdowns["7"].providers[0].label = "/Users/oviedo";
    expect(validateOutput(path).some((violation) => violation.includes("label is unsafe"))).toBe(true);
  });

  test("rejects day model entries with extra keys or unsafe ids", () => {
    const extraKey = validOutput();
    (extraKey.days[0].models[0] as Record<string, unknown>).sessionId = "abc";
    expect(validateOutput(extraKey).some((violation) => violation.includes("day model keys"))).toBe(true);

    const unsafe = validOutput();
    unsafe.days[0].models[0].model = "~/private/model";
    expect(validateOutput(unsafe).some((violation) => violation.includes("unsafe day model"))).toBe(true);
  });

  test("rejects provider and model ids outside the allowlist", () => {
    const badProvider = validOutput();
    badProvider.days[0].providers = { "/Users/oviedo": { tokens: 1, cachedInput: 1, uncachedInput: 0, output: 0, costUsd: 0 } };
    expect(validateOutput(badProvider).some((violation) => violation.includes("unsafe provider"))).toBe(true);

    const badModel = validOutput();
    badModel.models[0].model = "~/secrets/model";
    expect(validateOutput(badModel).some((violation) => violation.includes("unsafe model"))).toBe(true);

    const badUnpriced = validOutput();
    badUnpriced.unpricedModels = ["/tmp/x"];
    expect(validateOutput(badUnpriced).some((violation) => violation.includes("unsafe unpriced"))).toBe(true);
  });

  test("rejects quota percentages outside 0..100 and unsafe statuses", () => {
    const outOfRange = validOutput();
    outOfRange.quotas = [
      {
        id: "claude",
        plan: "max",
        status: "ok",
        windows: [{ label: "5h", usedPercent: 140, resetsAt: null, windowSeconds: 18000 }],
        error: null,
      },
    ];
    expect(validateOutput(outOfRange).some((violation) => violation.includes("usedPercent"))).toBe(true);

    const badStatus = validOutput();
    badStatus.quotas = [
      {
        id: "claude",
        plan: "max",
        status: "live" as unknown as "ok",
        windows: [],
        error: null,
      },
    ];
    expect(validateOutput(badStatus).some((violation) => violation.includes("quota status"))).toBe(true);

    const rawError = validOutput();
    rawError.quotas = [
      { id: "claude", plan: "max", status: "error", windows: [], error: 'HTTP 500: {"detail":"boom"}' },
    ];
    expect(validateOutput(rawError).some((violation) => violation.includes("unsafe quota error"))).toBe(true);
  });

  test("rejects every forbidden substring anywhere in the document", () => {
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      const tainted = validOutput();
      tainted.unpricedModels = [`x${forbidden}y`];
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
    expect(parsed.totals.cachedInput + parsed.totals.uncachedInput + parsed.totals.output).toBe(
      parsed.totals.processedTokens,
    );
  });
});
