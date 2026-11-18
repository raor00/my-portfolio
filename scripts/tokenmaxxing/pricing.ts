import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { PRICES_CACHE_PATH } from "./config";

export const PRICES_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

/** Per-token USD prices for one model. */
export interface ModelPrice {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
}

interface RawPriceEntry {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  cache_read_input_token_cost?: number;
  cache_creation_input_token_cost?: number;
}

export type PriceTable = Record<string, RawPriceEntry>;

export interface PricesCache {
  fetchedAt: string;
  prices: PriceTable;
}

/**
 * Provider-specific price namespaces in the LiteLLM file.
 * Verified against the downloaded JSON: `opencode_go/`, `zai/` and `xai/` exist,
 * `opencode/`, `zen/`, `tokenrouter/` and `nan/` do not.
 *
 * A provider whose id already names a namespace (`xai`, `deepseek`, `google`)
 * resolves to `<provider>/` on its own, but only when that entry exists.
 */
const PROVIDER_PREFIXES: Record<string, string[]> = {
  "opencode-go": ["opencode_go/"],
  "opencode-zen": ["opencode_go/", "opencode/"],
  zai: ["zai/"],
};

function prefixCandidates(provider: string): string[] {
  const explicit = PROVIDER_PREFIXES[provider] ?? [];
  const namespace = `${provider.replace(/-/g, "_")}/`;
  return provider === "" ? explicit : [...explicit, namespace];
}

/** Strips routing suffixes such as `[1m]` from a model id. */
export function stripModelSuffix(model: string): string {
  return model.replace(/\[[^\]]*\]$/, "").trim();
}

function toPrice(entry: RawPriceEntry | undefined): ModelPrice | null {
  if (!entry) return null;
  const input = entry.input_cost_per_token;
  const output = entry.output_cost_per_token;
  if (typeof input !== "number" || typeof output !== "number") return null;
  return {
    input,
    output,
    cacheRead: typeof entry.cache_read_input_token_cost === "number" ? entry.cache_read_input_token_cost : input,
    cacheWrite:
      typeof entry.cache_creation_input_token_cost === "number" ? entry.cache_creation_input_token_cost : input,
  };
}

function samePrice(a: ModelPrice, b: ModelPrice): boolean {
  return a.input === b.input && a.output === b.output && a.cacheRead === b.cacheRead && a.cacheWrite === b.cacheWrite;
}

/**
 * Resolves a price without ever inventing one:
 * 1. exact model key,
 * 2. the provider's own namespace,
 * 3. the bare alias only when every prefixed entry agrees on the price.
 */
export function findPrice(prices: PriceTable, provider: string, model: string): ModelPrice | null {
  const base = stripModelSuffix(model);
  if (!base) return null;

  const exact = toPrice(prices[base]);
  if (exact) return exact;

  for (const prefix of prefixCandidates(provider)) {
    const namespaced = toPrice(prices[`${prefix}${base}`]);
    if (namespaced) return namespaced;
  }

  const suffix = `/${base}`;
  const candidates: ModelPrice[] = [];
  for (const [key, entry] of Object.entries(prices)) {
    if (!key.endsWith(suffix)) continue;
    const price = toPrice(entry);
    if (price) candidates.push(price);
  }
  if (candidates.length === 0) return null;
  const [first] = candidates;
  return candidates.every((price) => samePrice(price, first)) ? first : null;
}

export interface TokenBuckets {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
}

export function costOf(price: ModelPrice, tokens: TokenBuckets): number {
  return (
    tokens.input * price.input +
    tokens.cacheRead * price.cacheRead +
    tokens.cacheWrite * price.cacheWrite +
    tokens.output * price.output
  );
}

/** Cache savings: what cache reads would have cost at the full input rate. */
export function cacheSavingsOf(price: ModelPrice, tokens: TokenBuckets): number {
  return Math.max(0, tokens.cacheRead * (price.input - price.cacheRead));
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function readPricesCache(path: string = PRICES_CACHE_PATH): PricesCache | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as PricesCache;
    if (!parsed || typeof parsed.prices !== "object" || Object.keys(parsed.prices).length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePricesCache(
  path: string,
  cache: { fetchedAt: string; prices: PriceTable },
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(cache));
}

export interface LoadPricesOptions {
  cachePath?: string;
  /** Reuse the cached download while it is younger than this. Default 24h. */
  maxAgeMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => number;
  onStatus?: (message: string) => void;
}

/**
 * Returns the LiteLLM price table, downloading at most once per day.
 * The download holds public price data only.
 */
export async function loadPrices(options: LoadPricesOptions = {}): Promise<PriceTable> {
  const cachePath = options.cachePath ?? PRICES_CACHE_PATH;
  const maxAgeMs = options.maxAgeMs ?? DAY_MS;
  const now = options.now ?? Date.now;
  const fetchImpl = options.fetchImpl ?? fetch;

  const cached = readPricesCache(cachePath);
  if (cached) {
    const age = now() - Date.parse(cached.fetchedAt);
    if (Number.isFinite(age) && age < maxAgeMs) return cached.prices;
  }

  try {
    const response = await fetchImpl(PRICES_URL, { signal: AbortSignal.timeout(30_000) });
    options.onStatus?.(`prices: http ${response.status}`);
    if (!response.ok) return cached?.prices ?? {};
    const prices = (await response.json()) as PriceTable;
    if (!prices || typeof prices !== "object") return cached?.prices ?? {};
    writePricesCache(cachePath, { fetchedAt: new Date(now()).toISOString(), prices });
    return prices;
  } catch {
    options.onStatus?.("prices: network_error");
    return cached?.prices ?? {};
  }
}
