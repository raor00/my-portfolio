import { streamJsonLines } from "../lines";
import { normalizeModel, normalizeProvider } from "../config";
import { num, parseJsonObject, record, str } from "./types";
import type { RawUsage } from "./types";

/**
 * Pi session line -> usage row.
 *
 * `totalTokens == input + output + cacheRead + cacheWrite` for Pi, where
 * `input` is already uncached. `cost.total` is only trusted when
 * `cost.totalFromProvider` is true.
 */
export function mapPiLine(line: string, fallbackKey: string): RawUsage | null {
  const obj = parseJsonObject(line);
  if (!obj) return null;
  if (str(obj.type) !== "message") return null;

  const message = record(obj.message);
  if (!message) return null;
  if (str(message.role) !== "assistant") return null;

  const usage = record(message.usage);
  if (!usage) return null;

  const occurredAt = str(obj.timestamp);
  if (!occurredAt) return null;

  const model = str(message.model);
  if (!model) return null;

  const responseId = str(message.responseId);
  const lineId = str(obj.id);
  const externalId = responseId || `${fallbackKey}:${lineId || occurredAt}`;

  const cost = record(usage.cost);
  const reported = cost ? (cost.totalFromProvider === true ? num(cost.total) : 0) : 0;

  return {
    agent: "pi",
    provider: normalizeProvider(message.provider),
    model: normalizeModel(model),
    externalId,
    inputTokens: num(usage.input),
    cacheReadTokens: num(usage.cacheRead),
    cacheWriteTokens: num(usage.cacheWrite),
    outputTokens: num(usage.output),
    reasoningTokens: num(usage.reasoning),
    reportedCostUsd: reported > 0 ? reported : 0,
    occurredAt,
  };
}

/** Streams one Pi session file. The same response may appear in fork copies. */
export async function readPiFile(path: string, fallbackKey: string, onRow: (row: RawUsage) => void): Promise<void> {
  await streamJsonLines(path, (line) => {
    const row = mapPiLine(line, fallbackKey);
    if (row) onRow(row);
  });
}
