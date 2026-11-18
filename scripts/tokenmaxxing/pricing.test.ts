import { describe, expect, test } from "bun:test";
import { findPrice, costOf, cacheSavingsOf, loadPrices, stripModelSuffix, type PriceTable } from "./pricing";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function entry(input: number, output: number, cacheRead?: number, cacheWrite?: number) {
  return {
    input_cost_per_token: input,
    output_cost_per_token: output,
    ...(cacheRead === undefined ? {} : { cache_read_input_token_cost: cacheRead }),
    ...(cacheWrite === undefined ? {} : { cache_creation_input_token_cost: cacheWrite }),
  };
}

const prices: PriceTable = {
  "claude-opus-5-5": entry(0.00001, 0.00005, 0.000001, 0.0000125),
  "opencode_go/deepseek-v4.1-flash": entry(0.0000002, 0.0000008),
  "zai/glm-5.3": entry(0.0000006, 0.0000022),
  "opencode_go/agree-model": entry(0.000001, 0.000002),
  "zai/agree-model": entry(0.000001, 0.000002),
  "other/agree-model": entry(0.000001, 0.000002),
  "vendor/split-model": entry(0.000001, 0.000002),
  "other/split-model": entry(0.000003, 0.000002),
};

describe("pricing lookup", () => {
  test("strips routing suffixes such as [1m]", () => {
    expect(stripModelSuffix("claude-opus-5-5[1m]")).toBe("claude-opus-5-5");
    expect(stripModelSuffix("claude-opus-5-5")).toBe("claude-opus-5-5");
  });

  test("prefers an exact model key", () => {
    const price = findPrice(prices, "anthropic", "claude-opus-5-5");
    expect(price?.input).toBe(0.00001);
    expect(price?.output).toBe(0.00005);
    expect(price?.cacheRead).toBe(0.000001);
  });

  test("falls back to the provider namespace", () => {
    expect(findPrice(prices, "opencode-go", "deepseek-v4.1-flash")?.input).toBe(0.0000002);
    expect(findPrice(prices, "zai", "glm-5.3")?.output).toBe(0.0000022);
    // zai* providers collapse to the zai namespace as well.
    expect(findPrice(prices, "zai", "glm-5.3[1m]")?.output).toBe(0.0000022);
  });

  test("uses the bare alias only when every prefixed entry agrees", () => {
    expect(findPrice(prices, "nan", "agree-model")?.input).toBe(0.000001);
    expect(findPrice(prices, "nan", "split-model")).toBeNull();
  });

  test("never invents a price for an unknown model", () => {
    expect(findPrice(prices, "nan", "muse-spark-1.3-contributor-free")).toBeNull();
  });

  test("costOf and cacheSavingsOf use the resolved rates", () => {
    const price = findPrice(prices, "anthropic", "claude-opus-5-5")!;
    const tokens = { input: 1000, cacheRead: 5000, cacheWrite: 200, output: 300 };
    expect(costOf(price, tokens)).toBeCloseTo(1000 * 0.00001 + 5000 * 0.000001 + 200 * 0.0000125 + 300 * 0.00005, 12);
    expect(cacheSavingsOf(price, tokens)).toBeCloseTo(5000 * (0.00001 - 0.000001), 12);
  });

  test("reuses a fresh cache download and only refetches when stale", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-prices-"));
    const cachePath = join(dir, "litellm-prices.json");
    let fetches = 0;
    const fetchImpl = (async () => {
      fetches += 1;
      return new Response(JSON.stringify({ "m": entry(1, 2) }), { status: 200 });
    }) as unknown as typeof fetch;

    const now = Date.parse("2026-01-01T00:00:00.000Z");
    const first = await loadPrices({ cachePath, fetchImpl, now: () => now });
    expect(fetches).toBe(1);
    expect(first.m).toBeDefined();

    const second = await loadPrices({ cachePath, fetchImpl, now: () => now + 60_000 });
    expect(fetches).toBe(1);
    expect(second.m).toBeDefined();

    const third = await loadPrices({ cachePath, fetchImpl, now: () => now + 25 * 60 * 60 * 1000 });
    expect(fetches).toBe(2);
    expect(third.m).toBeDefined();
    rmSync(dir, { recursive: true, force: true });
  });

  test("keeps the cached table when the download fails", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-prices-"));
    const cachePath = join(dir, "litellm-prices.json");
    let status: string | undefined;
    const fetchImpl = (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;

    const first = await loadPrices({
      cachePath,
      fetchImpl: (async () => new Response(JSON.stringify({ m: entry(1, 2) }), { status: 200 })) as unknown as typeof fetch,
      now: () => 0,
    });
    expect(first.m).toBeDefined();

    const offline = await loadPrices({
      cachePath,
      fetchImpl,
      now: () => 30 * 60 * 60 * 1000,
      onStatus: (line) => {
        status = line;
      },
    });
    expect(offline.m).toBeDefined();
    expect(status).toBe("prices: network_error");
    rmSync(dir, { recursive: true, force: true });
  });
});
