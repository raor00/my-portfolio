import { baseName, streamJsonLines } from "../lines";
import { normalizeModel, normalizeProvider } from "../config";
import { parseJsonObject, record, num, str } from "./types";
import type { RawUsage } from "./types";

/**
 * Claude Code transcript line -> usage row.
 *
 * The same `message.id` can appear on up to 9 lines (and again in resumed
 * sessions), sometimes with slightly different usage. Callers must upsert with
 * the "max-output" mode so the highest output_tokens line wins.
 */
export function mapClaudeLine(line: string): RawUsage | null {
  const obj = parseJsonObject(line);
  if (!obj) return null;

  const message = record(obj.message);
  if (!message) return null;

  const usage = record(message.usage);
  if (!usage) return null;

  const model = str(message.model);
  const externalId = str(message.id);
  if (!model || !externalId) return null;
  if (model === "<synthetic>") return null;

  // Claude Code writes `timestamp`; Claude Desktop audit logs fall back to `_audit_timestamp`.
  const occurredAt = str(obj.timestamp) || str(obj._audit_timestamp);
  if (!occurredAt) return null;

  return {
    agent: "claude",
    provider: normalizeProvider("anthropic"),
    model: normalizeModel(model),
    externalId,
    inputTokens: num(usage.input_tokens),
    cacheReadTokens: num(usage.cache_read_input_tokens),
    cacheWriteTokens: num(usage.cache_creation_input_tokens),
    outputTokens: num(usage.output_tokens),
    reasoningTokens: 0,
    reportedCostUsd: 0,
    occurredAt,
  };
}

/** Streams one Claude transcript file. The caller owns dedupe and persistence. */
export async function readClaudeFile(
  path: string,
  onRow: (row: RawUsage) => void,
  options: { sessionId?: string; source?: string; agent?: string } = {},
): Promise<void> {
  const sessionId = options.sessionId ?? baseName(path).replace(/\.jsonl$/, "");
  const source = options.source ?? "transcript";
  const agent = options.agent;
  await streamJsonLines(path, (line) => {
    const row = mapClaudeLine(line);
    if (!row) return;
    row.sessionId = sessionId;
    row.source = source;
    if (agent) row.agent = agent;
    onRow(row);
  });
}
