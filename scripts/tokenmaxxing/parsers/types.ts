/** Read-only parsers for every local transcript source. */

export interface RawUsage {
  agent: string;
  provider: string;
  model: string;
  externalId: string;
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  reportedCostUsd: number;
  occurredAt: string;
  /** Source session identity, used only for the public `sessions` count. */
  sessionId?: string;
  /** Reader provenance: "transcript", "claude-desktop", "stats-cache", ... */
  source?: string;
  /** True when the token split was derived from ratios, not measured. */
  estimatedSplit?: boolean;
}

export interface LedgerRow extends RawUsage {
  usageDate: string;
  /** Cross-file dedupe strategy for this row's (agent, external_id). */
  upsertMode?: "replace" | "max-output";
}

export interface Totals {
  input_tokens: number;
  cached_input_tokens: number;
  cache_read_input_tokens: number;
  cache_write_input_tokens: number;
  output_tokens: number;
  reasoning_output_tokens: number;
  total_tokens: number;
}

export function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseJsonObject(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    return record(JSON.parse(trimmed));
  } catch {
    return null;
  }
}
