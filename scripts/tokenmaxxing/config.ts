import { homedir } from "node:os";
import { join, resolve } from "node:path";

/** Read-only source roots and the only writable directory (tokenmaxxing data dir). */
export const HOME = homedir();
export const DATA_DIR = join(HOME, ".local", "share", "tokenmaxxing");
export const LEDGER_PATH = join(DATA_DIR, "ledger.db");
export const COOLDOWNS_PATH = join(DATA_DIR, "cooldowns.json");
export const PRICES_CACHE_PATH = join(DATA_DIR, "litellm-prices.json");

export const REPO_ROOT = resolve(import.meta.dir, "..", "..");
export const OUTPUT_PATH = join(REPO_ROOT, "src", "data", "tokenmaxxing.json");

export const SOURCES = {
  claudeProjects: join(HOME, ".claude", "projects"),
  claudeCredentialsFile: join(HOME, ".claude", ".credentials.json"),
  /** Claude Code stats cache: covers dates whose transcripts were purged. */
  claudeStatsCache: join(HOME, ".claude", "stats-cache.json"),
  /** Claude Desktop agent-mode audit logs (Claude Code transcript shape). */
  claudeDesktopSessions: join(HOME, "Library", "Application Support", "Claude", "local-agent-mode-sessions"),
  /** Orca's own Codex runtime home: near-duplicate of ~/.codex/sessions. */
  codexOrcaSessions: join(HOME, "Library", "Application Support", "Orca", "codex-runtime-home", "home", "sessions"),
  /** Grok CLI prompt updates. */
  grokSessions: join(HOME, ".grok", "sessions"),
  /** Continue extension token log. */
  continueTokens: join(HOME, ".continue", "dev_data", "0.2.0", "tokensGenerated.jsonl"),
  codexSessions: join(HOME, ".codex", "sessions"),
  codexArchived: join(HOME, ".codex", "archived_sessions"),
  codexAuthFile: join(HOME, ".codex", "auth.json"),
  piSessions: join(HOME, ".pi", "agent", "sessions"),
  opencodeDb: join(HOME, ".local", "share", "opencode", "opencode.db"),
  opencodeAuthFile: join(HOME, ".local", "share", "opencode", "auth.json"),
} as const;

/**
 * Public-output allowlist for provider and model identifiers.
 * A leading "/" or "~" (path-like values) can never match.
 */
const SAFE_ID = /^[A-Za-z0-9._:\[\]-][A-Za-z0-9._:/\[\]-]*$/;

/**
 * Providers that must never reach the public file. Their ledger rows are
 * dropped before aggregation, so they cannot contribute to totals, days,
 * models, sessions or the unpriced list.
 */
export const EXCLUDED_PROVIDERS: readonly string[] = ["lyber"];

export function isExcludedProvider(provider: string): boolean {
  return EXCLUDED_PROVIDERS.includes(provider);
}

/**
 * Providers that run locally (or are price-free) and must never be priced from
 * the public price table: their usage counts as $0 and never lands in
 * unpricedModels.
 */
export const FREE_PROVIDERS: readonly string[] = ["ollama"];

export function isFreeProvider(provider: string): boolean {
  return FREE_PROVIDERS.includes(provider);
}

export function isSafeId(value: string): boolean {
  return SAFE_ID.test(value);
}

const PROVIDER_ALIASES: Record<string, string> = {
  "": "unknown",
  zen: "opencode-zen",
  opencode: "opencode-zen",
  "opencode-zen": "opencode-zen",
  "openai-codex": "openai",
};

/** Canonical provider id for the public JSON. Anything unsafe becomes "other". */
export function normalizeProvider(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (value.startsWith("zai")) return "zai";
  const aliased = PROVIDER_ALIASES[value] ?? value;
  if (!aliased) return "unknown";
  return isSafeId(aliased) ? aliased : "other";
}

/** Canonical model id for the public JSON. Anything unsafe becomes "other". */
export function normalizeModel(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value || value.startsWith("/") || value.startsWith("~")) return "other";
  return isSafeId(value) ? value : "other";
}
