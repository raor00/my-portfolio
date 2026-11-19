import { describe, expect, test } from "bun:test";
import { mapGrokLine } from "./parsers/grok";
import { mapContinueLine } from "./parsers/continue";

function grokLine(overrides: Record<string, unknown> = {}, modelOverrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    method: "session.update",
    params: {
      sessionId: "session-1",
      _meta: { agentTimestampMs: 1_793_724_156_252 },
      update: {
        prompt_id: "prompt-1",
        usage: {
          modelUsage: {
            "grok-4.7-build": {
              inputTokens: 2_755_985,
              outputTokens: 21_707,
              cachedReadTokens: 2_647_424,
              cacheCreationTokens: 0,
              reasoningTokens: 13_951,
              totalTokens: 2_777_692,
              costUsdTicks: 16_710_760_000,
              ...modelOverrides,
            },
          },
        },
      },
      ...overrides,
    },
  });
}

describe("grok parser", () => {
  test("maps a model usage entry and subtracts cached reads from input", () => {
    const rows = mapGrokLine(grokLine());
    expect(rows.length).toBe(1);
    const [row] = rows;
    expect(row.agent).toBe("grok");
    expect(row.provider).toBe("xai");
    expect(row.model).toBe("grok-4.7-build");
    // inputTokens includes cached reads on this source: 2755985 - 2647424 - 0
    expect(row.inputTokens).toBe(108_561);
    expect(row.cacheReadTokens).toBe(2_647_424);
    expect(row.cacheWriteTokens).toBe(0);
    expect(row.outputTokens).toBe(21_707);
    expect(row.reasoningTokens).toBe(13_951);
    // costUsdTicks has no proven unit, so it is never trusted as reported cost.
    expect(row.reportedCostUsd).toBe(0);
    expect(row.occurredAt).toBe(new Date(1_793_724_156_252).toISOString());
    expect(row.externalId).toBe("session-1:prompt-1:grok-4.7-build");
  });

  test("keys each prompt separately so per-prompt usage never double counts", () => {
    const first = mapGrokLine(grokLine());
    const second = mapGrokLine(
      JSON.stringify({
        params: {
          sessionId: "session-1",
          _meta: { agentTimestampMs: 1_793_724_725_409 },
          update: {
            prompt_id: "prompt-2",
            usage: { modelUsage: { "grok-4.7-build": { inputTokens: 10, outputTokens: 1, cachedReadTokens: 0 } } },
          },
        },
      }),
    );
    expect(first[0].externalId).not.toBe(second[0].externalId);
  });

  test("falls back to the line timestamp when the agent time is missing", () => {
    const line = JSON.parse(grokLine());
    delete line.params._meta;
    line.timestamp = "2026-11-01T10:00:00.000Z";
    expect(mapGrokLine(JSON.stringify(line))[0].occurredAt).toBe("2026-11-01T10:00:00.000Z");
  });

  test("ignores lines without usage", () => {
    expect(mapGrokLine(JSON.stringify({ params: { sessionId: "s", update: { prompt_id: "p" } } }))).toEqual([]);
    expect(mapGrokLine("not json")).toEqual([]);
  });
});

describe("continue parser", () => {
  const line = JSON.stringify({
    eventName: "tokensGenerated",
    schema: 1,
    timestamp: "2026-04-05T15:44:56.899Z",
    model: "qwen2.5-coder:1.5b-base",
    provider: "ollama",
    promptTokens: 1881,
    generatedTokens: 778,
    userId: "ignored",
    userAgent: "ignored",
    selectedProfileId: "ignored",
  });

  test("maps prompt tokens to input and generated tokens to output", () => {
    const row = mapContinueLine(line, 1)!;
    expect(row).toMatchObject({
      agent: "continue",
      provider: "ollama",
      model: "qwen2.5-coder:1.5b-base",
      inputTokens: 1881,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      outputTokens: 778,
      reportedCostUsd: 0,
      occurredAt: "2026-04-05T15:44:56.899Z",
      source: "continue",
    });
  });

  test("the line number is part of the dedupe key", () => {
    expect(mapContinueLine(line, 1)!.externalId).toBe("2026-04-05T15:44:56.899Z:qwen2.5-coder:1.5b-base:1");
    expect(mapContinueLine(line, 2)!.externalId).not.toBe(mapContinueLine(line, 1)!.externalId);
  });

  test("never leaks user identity fields into the row", () => {
    const row = mapContinueLine(line, 1)!;
    expect(JSON.stringify(row)).not.toContain("ignored");
  });

  test("skips incomplete lines", () => {
    expect(mapContinueLine(JSON.stringify({ model: "m" }), 1)).toBeNull();
    expect(mapContinueLine("nope", 1)).toBeNull();
  });
});
