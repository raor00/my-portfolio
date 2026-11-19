import { streamJsonLines } from "../lines";
import { normalizeModel, normalizeProvider } from "../config";
import { num, parseJsonObject, record, str } from "./types";
import type { RawUsage } from "./types";

/**
 * Grok CLI session update -> usage rows.
 *
 * Verified on this Mac (59 usage lines, 5 sessions):
 * - `params.update.usage.modelUsage.<model>` carries one entry per model per prompt.
 * - `inputTokens` INCLUDES cached reads: `input + output == totalTokens` holds on
 *   every line while `cachedReadTokens <= inputTokens`, so the uncached input is
 *   `inputTokens - cachedReadTokens - cacheCreationTokens`.
 * - There is exactly one usage line per `prompt_id`, so the numbers are per-prompt
 *   aggregates across that prompt's model calls, never cumulative across prompts.
 * - `costUsdTicks` is UNVERIFIED (it looks like 1e-9 USD, ~16.7 USD for 2.7M
 *   tokens) so it is NOT used as a reported cost; those tokens are priced instead.
 */
export function mapGrokLine(line: string): RawUsage[] {
  const obj = parseJsonObject(line);
  if (!obj) return [];

  const params = record(obj.params);
  if (!params) return [];
  const update = record(params.update);
  if (!update) return [];
  const usage = record(update.usage);
  if (!usage) return [];

  const modelUsage = record(usage.modelUsage);
  if (!modelUsage) return [];

  const sessionId = str(params.sessionId);
  const promptId = str(update.prompt_id);
  if (!sessionId || !promptId) return [];

  const meta = record(params._meta);
  const agentTimestamp = num(meta?.agentTimestampMs);
  const occurredAt =
    agentTimestamp > 0 ? new Date(agentTimestamp).toISOString() : str(obj.timestamp);
  if (!occurredAt) return [];

  const rows: RawUsage[] = [];
  for (const [model, rawEntry] of Object.entries(modelUsage)) {
    const entry = record(rawEntry);
    if (!entry) continue;
    const cached = num(entry.cachedReadTokens);
    const cacheWrite = num(entry.cacheCreationTokens);
    const input = num(entry.inputTokens);
    rows.push({
      agent: "grok",
      provider: normalizeProvider("xai"),
      model: normalizeModel(model),
      externalId: `${sessionId}:${promptId}:${model}`,
      inputTokens: Math.max(0, input - cached - cacheWrite),
      cacheReadTokens: cached,
      cacheWriteTokens: cacheWrite,
      outputTokens: num(entry.outputTokens),
      reasoningTokens: num(entry.reasoningTokens),
      reportedCostUsd: 0,
      occurredAt,
      sessionId,
      source: "grok",
    });
  }
  return rows;
}

export async function readGrokFile(path: string, onRow: (row: RawUsage) => void): Promise<void> {
  await streamJsonLines(path, (line) => {
    for (const row of mapGrokLine(line)) onRow(row);
  });
}
