import { streamJsonLines } from "../lines";
import { normalizeModel, normalizeProvider } from "../config";
import { num, parseJsonObject, record, str } from "./types";
import type { RawUsage, Totals } from "./types";

export interface CodexState {
  /** First `session_meta` payload id. Fork/subagent files carry a second one. */
  sessionId: string | null;
  /** Last seen `turn_context.payload.model` (models change mid-session). */
  model: string | null;
  /** Previous cumulative total, for the delta fallback. */
  previousTotal: Totals | null;
  /** Previous `input:cached:write:output:reasoning` signature. */
  previousSignature: string | null;
}

export function createCodexState(): CodexState {
  return { sessionId: null, model: null, previousTotal: null, previousSignature: null };
}

function readTotals(info: Record<string, unknown>, key: "last_token_usage" | "total_token_usage"): Totals | null {
  const usage = record(info[key]);
  if (!usage) return null;
  return {
    input_tokens: num(usage.input_tokens),
    cached_input_tokens: num(usage.cached_input_tokens),
    cache_read_input_tokens: num(usage.cache_read_input_tokens),
    cache_write_input_tokens: num(usage.cache_write_input_tokens),
    output_tokens: num(usage.output_tokens),
    reasoning_output_tokens: num(usage.reasoning_output_tokens),
    total_tokens: num(usage.total_tokens),
  };
}

function diffTotals(current: Totals, previous: Totals): Totals {
  const delta = (a: number, b: number): number => Math.max(0, a - b);
  return {
    input_tokens: delta(current.input_tokens, previous.input_tokens),
    cached_input_tokens: delta(current.cached_input_tokens, previous.cached_input_tokens),
    cache_read_input_tokens: delta(current.cache_read_input_tokens, previous.cache_read_input_tokens),
    cache_write_input_tokens: delta(current.cache_write_input_tokens, previous.cache_write_input_tokens),
    output_tokens: delta(current.output_tokens, previous.output_tokens),
    reasoning_output_tokens: delta(current.reasoning_output_tokens, previous.reasoning_output_tokens),
    total_tokens: delta(current.total_tokens, previous.total_tokens),
  };
}

/**
 * Codex rollout line -> usage row.
 *
 * Stateful: the session id comes from the FIRST `session_meta`, the model from
 * the last `turn_context`, and duplicate `token_count` announcements (same
 * signature as the previous event) are dropped. `token_usage_record` lines are
 * ignored because they duplicate `token_count` events.
 */
export function mapCodexLine(line: string, state: CodexState): RawUsage | null {
  const obj = parseJsonObject(line);
  if (!obj) return null;

  const type = str(obj.type);

  if (type === "session_meta") {
    if (state.sessionId === null) {
      const payload = record(obj.payload);
      const id = payload ? str(payload.id) : "";
      if (id) state.sessionId = id;
      else if (payload) {
        const sessionId = str(payload.session_id);
        if (sessionId) state.sessionId = sessionId;
      }
    }
    return null;
  }

  if (type === "turn_context") {
    const payload = record(obj.payload);
    const model = payload ? str(payload.model) : "";
    if (model) state.model = model;
    return null;
  }

  if (type !== "event_msg") return null;

  const payload = record(obj.payload);
  if (!payload || str(payload.type) !== "token_count") return null;

  const info = record(payload.info);
  if (!info) return null;

  const totals = readTotals(info, "total_token_usage");
  let usage = readTotals(info, "last_token_usage");
  if (!usage && totals) {
    usage = state.previousTotal ? diffTotals(totals, state.previousTotal) : totals;
  }
  if (totals) state.previousTotal = totals;
  if (!usage) return null;

  const signature = [
    usage.input_tokens,
    usage.cached_input_tokens,
    usage.cache_write_input_tokens,
    usage.output_tokens,
    usage.reasoning_output_tokens,
  ].join(":");
  if (signature === state.previousSignature) return null;
  state.previousSignature = signature;

  const occurredAt = str(obj.timestamp);
  if (!occurredAt) return null;

  const cached = usage.cached_input_tokens || usage.cache_read_input_tokens;
  const model = normalizeModel(state.model ?? "unknown");
  const sessionId = state.sessionId ?? "unknown";

  return {
    agent: "codex",
    provider: normalizeProvider("openai"),
    model,
    externalId: `${sessionId}:${occurredAt}:${model}`,
    inputTokens: Math.max(0, usage.input_tokens - cached),
    cacheReadTokens: cached,
    cacheWriteTokens: usage.cache_write_input_tokens,
    outputTokens: usage.output_tokens,
    reasoningTokens: usage.reasoning_output_tokens,
    reportedCostUsd: 0,
    occurredAt,
  };
}

/** Streams one Codex rollout file with a fresh state object. */
export async function readCodexFile(path: string, onRow: (row: RawUsage) => void): Promise<void> {
  const state = createCodexState();
  await streamJsonLines(path, (line) => {
    const row = mapCodexLine(line, state);
    if (!row) return;
    row.sessionId = state.sessionId ?? "";
    onRow(row);
  });
}
