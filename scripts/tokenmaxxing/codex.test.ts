import { describe, expect, test } from "bun:test";
import { createCodexState, mapCodexLine } from "./parsers/codex";
import type { RawUsage } from "./parsers/types";

function meta(id: string, timestamp = "2024-03-10T11:59:00.000Z"): string {
  return JSON.stringify({ timestamp, type: "session_meta", payload: { id, session_id: "session-abc" } });
}

function turn(model: string, timestamp = "2024-03-10T12:00:00.000Z"): string {
  return JSON.stringify({ timestamp, type: "turn_context", payload: { model } });
}

function tokenCount(
  usage: Record<string, number> | null,
  options: { totals?: Record<string, number>; timestamp?: string } = {},
): string {
  return JSON.stringify({
    timestamp: options.timestamp ?? "2024-03-10T12:00:01.000Z",
    type: "event_msg",
    payload: {
      type: "token_count",
      info: {
        last_token_usage: usage,
        total_token_usage: options.totals ?? null,
      },
    },
  });
}

function apply(lines: string[], state = createCodexState()): { rows: RawUsage[]; state: ReturnType<typeof createCodexState> } {
  const rows: RawUsage[] = [];
  for (const line of lines) {
    const row = mapCodexLine(line, state);
    if (row) rows.push(row);
  }
  return { rows, state };
}

const usage = {
  input_tokens: 100,
  cached_input_tokens: 40,
  cache_write_input_tokens: 0,
  output_tokens: 25,
  reasoning_output_tokens: 5,
  total_tokens: 125,
};

describe("codex parser", () => {
  test("maps a token_count event with cached subtraction", () => {
    const { rows } = apply([meta("sess-1"), turn("gpt-5-codex"), tokenCount(usage)]);
    expect(rows.length).toBe(1);
    expect(rows[0]).toMatchObject({
      agent: "codex",
      provider: "openai",
      model: "gpt-5-codex",
      inputTokens: 60, // 100 input - 40 cached
      cacheReadTokens: 40,
      cacheWriteTokens: 0,
      outputTokens: 25,
      reasoningTokens: 5,
      reportedCostUsd: 0,
    });
    expect(rows[0].externalId).toBe("sess-1:2024-03-10T12:00:01.000Z:gpt-5-codex");
  });

  test("drops a repeated event with the same signature", () => {
    const { rows } = apply([
      meta("sess-1"),
      turn("gpt-5-codex"),
      tokenCount(usage),
      tokenCount(usage, { timestamp: "2024-03-10T12:00:02.000Z" }),
    ]);
    expect(rows.length).toBe(1);
  });

  test("picks up a mid-session model switch", () => {
    const { rows } = apply([
      meta("sess-1"),
      turn("gpt-5-codex"),
      tokenCount(usage),
      turn("gpt-5.1-codex", "2024-03-10T12:10:00.000Z"),
      tokenCount({ ...usage, output_tokens: 77 }, { timestamp: "2024-03-10T12:10:01.000Z" }),
    ]);
    expect(rows.length).toBe(2);
    expect(rows[0].model).toBe("gpt-5-codex");
    expect(rows[1].model).toBe("gpt-5.1-codex");
  });

  test("keys a fork file by the FIRST session_meta, never the second or session_id", () => {
    const { rows } = apply([
      meta("sess-fork"),
      turn("gpt-5-codex"),
      tokenCount(usage),
      // A forked/subagent file carries the parent meta later in the file.
      meta("sess-parent", "2024-03-10T12:00:30.000Z"),
      tokenCount({ ...usage, output_tokens: 90 }, { timestamp: "2024-03-10T12:00:31.000Z" }),
    ]);
    expect(rows.length).toBe(2);
    expect(rows[0].externalId.startsWith("sess-fork:")).toBe(true);
    expect(rows[1].externalId.startsWith("sess-fork:")).toBe(true);
    expect(rows.some((row) => row.externalId.includes("session-abc"))).toBe(false);
  });

  test("ignores token_usage_record lines", () => {
    const record = JSON.stringify({
      timestamp: "2024-03-10T12:00:03.000Z",
      type: "token_usage_record",
      payload: { input_tokens: 999, output_tokens: 999, model: "gpt-5-codex" },
    });
    const { rows } = apply([meta("sess-1"), turn("gpt-5-codex"), tokenCount(usage), record]);
    expect(rows.length).toBe(1);
  });

  test("falls back to the total diff when last_token_usage is missing", () => {
    const { rows } = apply([
      meta("sess-1"),
      turn("gpt-5-codex"),
      tokenCount(null, {
        totals: { input_tokens: 100, cached_input_tokens: 40, output_tokens: 25, reasoning_output_tokens: 5, total_tokens: 125 },
      }),
      tokenCount(null, {
        totals: { input_tokens: 160, cached_input_tokens: 60, output_tokens: 45, reasoning_output_tokens: 5, total_tokens: 205 },
        timestamp: "2024-03-10T12:05:00.000Z",
      }),
    ]);
    expect(rows.length).toBe(2);
    expect(rows[0]).toMatchObject({ inputTokens: 60, cacheReadTokens: 40, outputTokens: 25 });
    // Diff: input 60, cached 20 -> uncached 40; output 20.
    expect(rows[1]).toMatchObject({ inputTokens: 40, cacheReadTokens: 20, outputTokens: 20 });
  });
});
