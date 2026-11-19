import { streamJsonLines } from "../lines";
import { normalizeModel, normalizeProvider } from "./../config";
import { num, parseJsonObject, str } from "./types";
import type { RawUsage } from "./types";

/**
 * Continue extension token log -> usage row.
 *
 * `promptTokens` is input and `generatedTokens` is output; the provider is
 * `ollama` on every row on this Mac, so the usage is local and costs $0.
 * `userId`/`userAgent` are deliberately ignored.
 */
export function mapContinueLine(line: string, lineNumber: number): RawUsage | null {
  const obj = parseJsonObject(line);
  if (!obj) return null;

  const model = str(obj.model);
  const occurredAt = str(obj.timestamp);
  const provider = str(obj.provider) || "unknown";
  if (!model || !occurredAt) return null;

  return {
    agent: "continue",
    provider: normalizeProvider(provider),
    model: normalizeModel(model),
    externalId: `${occurredAt}:${model}:${lineNumber}`,
    inputTokens: num(obj.promptTokens),
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: num(obj.generatedTokens),
    reasoningTokens: 0,
    reportedCostUsd: 0,
    occurredAt,
    sessionId: "",
    source: "continue",
  };
}

export async function readContinueFile(path: string, onRow: (row: RawUsage) => void): Promise<void> {
  let lineNumber = 0;
  await streamJsonLines(path, (line) => {
    lineNumber += 1;
    const row = mapContinueLine(line, lineNumber);
    if (row) onRow(row);
  });
}
