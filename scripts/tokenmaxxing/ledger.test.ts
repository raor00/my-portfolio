import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { countByAgent, countRows, getSourceFile, isAllZeroTokens, openLedger, setSourceFile, sourceFileUnchanged, upsertUsage } from "./ledger";
import type { RawUsage } from "./parsers/types";

function row(overrides: Partial<RawUsage> = {}): RawUsage {
  return {
    agent: "claude",
    provider: "anthropic",
    model: "claude-sonnet-4",
    externalId: "msg_1",
    inputTokens: 10,
    cacheReadTokens: 20,
    cacheWriteTokens: 30,
    outputTokens: 40,
    reasoningTokens: 0,
    reportedCostUsd: 0,
    occurredAt: "2024-03-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("ledger", () => {
  test("drops rows whose token counts are all zero", () => {
    const db = openLedger(":memory:");
    expect(isAllZeroTokens(row({ inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }))).toBe(true);
    expect(upsertUsage(db, row({ inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }))).toBe(false);
    expect(countRows(db)).toBe(0);
    db.close();
  });

  test("UNIQUE(agent, external_id) replaces instead of duplicating", () => {
    const db = openLedger(":memory:");
    upsertUsage(db, row({ outputTokens: 40 }));
    upsertUsage(db, row({ outputTokens: 90 }));
    expect(countRows(db)).toBe(1);
    const stored = db.prepare("SELECT output_tokens FROM usage").get() as { output_tokens: number };
    expect(stored.output_tokens).toBe(90);
    db.close();
  });

  test("max-output mode keeps the higher output_tokens line", () => {
    const db = openLedger(":memory:");
    upsertUsage(db, row({ outputTokens: 90 }), "max-output");
    upsertUsage(db, row({ outputTokens: 40 }), "max-output");
    const stored = db.prepare("SELECT output_tokens, input_tokens FROM usage").get() as {
      output_tokens: number;
      input_tokens: number;
    };
    expect(stored.output_tokens).toBe(90);
    db.close();
  });

  test("stores the local usage day and counts per agent", () => {
    const db = openLedger(":memory:");
    upsertUsage(db, row({ externalId: "a" }));
    upsertUsage(db, row({ externalId: "b", agent: "pi", provider: "anthropic" }));
    expect(countByAgent(db)).toEqual({ claude: 1, pi: 1 });
    const stored = db.prepare("SELECT usage_date, occurred_at FROM usage WHERE external_id = 'a'").get() as {
      usage_date: string;
      occurred_at: string;
    };
    expect(stored.occurred_at).toBe("2024-03-10T12:00:00.000Z");
    expect(stored.usage_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    db.close();
  });

  test("source_file tracks size and mtime watermarks", () => {
    const db = openLedger(":memory:");
    expect(getSourceFile(db, "/tmp/x.jsonl")).toBeNull();
    expect(sourceFileUnchanged(db, "/tmp/x.jsonl", 10, 20)).toBe(false);
    setSourceFile(db, "/tmp/x.jsonl", 10, 20);
    expect(sourceFileUnchanged(db, "/tmp/x.jsonl", 10, 20)).toBe(true);
    expect(sourceFileUnchanged(db, "/tmp/x.jsonl", 11, 20)).toBe(false);
    db.close();
  });

  test("opens a file-backed ledger and recreates the schema idempotently", () => {
    const db = new Database(":memory:");
    db.close();
    const ledger = openLedger(":memory:");
    ledger.close();
  });
});
