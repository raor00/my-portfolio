import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mapClaudeLine, readClaudeFile } from "./parsers/claude";
import { openLedger, upsertUsage } from "./ledger";
import type { RawUsage } from "./parsers/types";

function line(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: "assistant",
    timestamp: "2024-03-10T12:00:00.000Z",
    message: {
      id: "msg_1",
      model: "claude-sonnet-4-5-20250929",
      usage: {
        input_tokens: 12,
        cache_read_input_tokens: 34,
        cache_creation_input_tokens: 56,
        output_tokens: 78,
      },
    },
    ...overrides,
  });
}

describe("claude parser", () => {
  test("maps usage fields, keeping input_tokens as uncached", () => {
    const row = mapClaudeLine(line());
    expect(row).not.toBeNull();
    expect(row).toMatchObject({
      agent: "claude",
      provider: "anthropic",
      model: "claude-sonnet-4-5-20250929",
      externalId: "msg_1",
      inputTokens: 12,
      cacheReadTokens: 34,
      cacheWriteTokens: 56,
      outputTokens: 78,
      reasoningTokens: 0,
      reportedCostUsd: 0,
      occurredAt: "2024-03-10T12:00:00.000Z",
    });
  });

  test("skips synthetic models", () => {
    const synthetic = JSON.parse(line());
    synthetic.message.model = "<synthetic>";
    expect(mapClaudeLine(JSON.stringify(synthetic))).toBeNull();
  });

  test("skips lines without usage, model, id or timestamp", () => {
    expect(mapClaudeLine(JSON.stringify({ type: "user", message: { role: "user" } }))).toBeNull();
    expect(mapClaudeLine("not json")).toBeNull();
    const noTimestamp = JSON.parse(line());
    delete noTimestamp.timestamp;
    expect(mapClaudeLine(JSON.stringify(noTimestamp))).toBeNull();
  });

  test("dedupe by message.id keeps the max output_tokens line, not the last", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-claude-"));
    const file = join(dir, "session.jsonl");
    const lines = [
      line(),
      // Same id, higher output.
      line({
        timestamp: "2024-03-10T12:00:05.000Z",
        message: {
          id: "msg_1",
          model: "claude-sonnet-4-5-20250929",
          usage: { input_tokens: 12, cache_read_input_tokens: 34, cache_creation_input_tokens: 56, output_tokens: 200 },
        },
      }),
      // Same id again with lower output (must not win by being last).
      line({
        timestamp: "2024-03-10T12:00:09.000Z",
        message: {
          id: "msg_1",
          model: "claude-sonnet-4-5-20250929",
          usage: { input_tokens: 12, cache_read_input_tokens: 34, cache_creation_input_tokens: 56, output_tokens: 10 },
        },
      }),
      // Truncated trailing line is ignored.
      '{"type":"assistant","message":{"id":"msg_2"',
    ];
    writeFileSync(file, `${lines.join("\n")}\n`);

    const db = openLedger(":memory:");
    try {
      const rows: RawUsage[] = [];
      await readClaudeFile(file, (row) => {
        rows.push(row);
        upsertUsage(db, row, "max-output");
      });
      expect(rows.length).toBe(3);
      const stored = db.prepare("SELECT COUNT(*) AS count, MAX(output_tokens) AS out FROM usage").get() as {
        count: number;
        out: number;
      };
      expect(stored.count).toBe(1);
      expect(stored.out).toBe(200);
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
