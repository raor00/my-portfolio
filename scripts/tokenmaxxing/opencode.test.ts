import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyOpencodeDb, mapOpencodeRow, readOpencodeRows } from "./parsers/opencode";
import { resetBrokenOpencodeSessions } from "./ingest";
import { openLedger, upsertUsage } from "./ledger";

function messageData(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    role: "assistant",
    providerID: "nan",
    modelID: "glm5.3",
    cost: 0,
    tokens: { input: 100, output: 50, reasoning: 10, cache: { read: 200, write: 300 } },
    time: { created: 1_700_000_000_000, completed: 1_700_000_030_000 },
    ...overrides,
  });
}

describe("opencode parser", () => {
  test("maps an assistant row, taking the provider from providerID", () => {
    const row = mapOpencodeRow("msg_1", messageData(), "ses_abc");
    expect(row).toMatchObject({
      agent: "opencode",
      provider: "nan",
      model: "glm5.3",
      externalId: "msg_1",
      inputTokens: 100,
      cacheReadTokens: 200,
      cacheWriteTokens: 300,
      outputTokens: 50,
      reasoningTokens: 10,
      reportedCostUsd: 0,
    });
    expect(row?.occurredAt).toBe(new Date(1_700_000_030_000).toISOString());
    expect(row?.sessionId).toBe("ses_abc");
  });

  test("prefers the session_id column over the payload and the message id", () => {
    expect(mapOpencodeRow("msg_1", messageData(), "ses_column")?.sessionId).toBe("ses_column");
    // The payload has no sessionID on real rows; fall back to the message id.
    expect(mapOpencodeRow("msg_1", messageData())?.sessionId).toBe("msg_1");
    expect(
      mapOpencodeRow("msg_1", messageData({ sessionID: "ses_payload" }))?.sessionId,
    ).toBe("ses_payload");
  });

  test("two messages from the same session count as one session", () => {
    const first = mapOpencodeRow("msg_a", messageData(), "ses_same")!;
    const second = mapOpencodeRow("msg_b", messageData(), "ses_same")!;
    expect(first.externalId).not.toBe(second.externalId);
    expect(new Set([first.sessionId, second.sessionId])).toEqual(new Set(["ses_same"]));
  });

  test("never infers the provider from the model id", () => {
    const row = mapOpencodeRow("msg_2", messageData({ providerID: "tokenrouter", modelID: "gpt-5" }));
    expect(row?.provider).toBe("tokenrouter");
  });

  test("uses time.completed, then time.created", () => {
    const onlyCreated = mapOpencodeRow("msg_3", messageData({ time: { created: 1_600_000_000_000 } }));
    expect(onlyCreated?.occurredAt).toBe(new Date(1_600_000_000_000).toISOString());
  });

  test("keeps a reported cost only when it is above zero", () => {
    expect(mapOpencodeRow("msg_4", messageData({ cost: 1.25 }))?.reportedCostUsd).toBe(1.25);
    expect(mapOpencodeRow("msg_5", messageData({ cost: 0 }))?.reportedCostUsd).toBe(0);
  });

  test("ignores user rows", () => {
    expect(mapOpencodeRow("msg_6", messageData({ role: "user" }))).toBeNull();
  });

  test("the copy reader takes the session from the message table column", () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-opencode-"));
    const source = join(dir, "opencode.db");
    const db = new Database(source, { create: true });
    db.exec("CREATE TABLE message (id TEXT, session_id TEXT, data TEXT, time_updated INTEGER)");
    const insert = db.prepare("INSERT INTO message (id, session_id, data, time_updated) VALUES (?, ?, ?, ?)");
    insert.run("m1", "ses_one", messageData(), 1);
    insert.run("m2", "ses_one", messageData({ tokens: { input: 1, output: 1, cache: { read: 0, write: 0 } } }), 2);
    insert.run("m3", "ses_two", messageData(), 3);
    db.close();

    const copy = copyOpencodeDb(source);
    try {
      const read = readOpencodeRows(copy!.path, 0);
      expect(read.rows.map((row) => row.sessionId)).toEqual(["ses_one", "ses_one", "ses_two"]);
      expect(new Set(read.rows.map((row) => row.sessionId)).size).toBe(2);
      expect(read.rows[0].externalId).toBe("m1");
    } finally {
      copy!.cleanup();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("the migration wipes message-id sessions and the watermark", () => {
    const db = openLedger(":memory:");
    try {
      upsertUsage(db, {
        agent: "opencode",
        provider: "opencode-zen",
        model: "m",
        externalId: "msg_broken",
        inputTokens: 1,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        outputTokens: 1,
        reasoningTokens: 0,
        reportedCostUsd: 0,
        occurredAt: "2026-11-01T00:00:00.000Z",
        sessionId: "msg_broken",
      });
      expect(resetBrokenOpencodeSessions(db)).toBe(1);
      const left = db.prepare("SELECT COUNT(*) AS count FROM usage WHERE agent = 'opencode'").get() as { count: number };
      expect(left.count).toBe(0);
      // Idempotent: nothing left to reset.
      expect(resetBrokenOpencodeSessions(db)).toBe(0);
    } finally {
      db.close();
    }
  });

  test("reads the copy incrementally by rowid watermark", () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-opencode-"));
    const source = join(dir, "opencode.db");
    const db = new Database(source, { create: true });
    db.exec("CREATE TABLE message (id TEXT, session_id TEXT, data TEXT, time_updated INTEGER)");
    const insert = db.prepare("INSERT INTO message (id, session_id, data, time_updated) VALUES (?, ?, ?, ?)");
    insert.run("m1", "ses_one", messageData(), 1);
    insert.run("m2", "ses_one", messageData({ role: "user" }), 2);
    insert.run("m3", "ses_two", messageData({ providerID: "opencode" }), 3);
    db.close();

    const copy = copyOpencodeDb(source);
    expect(copy).not.toBeNull();
    try {
      const first = readOpencodeRows(copy!.path, 0);
      expect(first.rows.map((row) => row.externalId)).toEqual(["m1", "m3"]);
      expect(first.rows[1].provider).toBe("opencode-zen");
      expect(first.maxRowid).toBe(3);

      const second = readOpencodeRows(copy!.path, first.maxRowid);
      expect(second.rows).toEqual([]);
      expect(second.maxRowid).toBe(3);
    } finally {
      copy!.cleanup();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
