import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyOpencodeDb, mapOpencodeRow, readOpencodeRows } from "./parsers/opencode";

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
    const row = mapOpencodeRow("msg_1", messageData());
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

  test("reads the copy incrementally by rowid watermark", () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-opencode-"));
    const source = join(dir, "opencode.db");
    const db = new Database(source, { create: true });
    db.exec("CREATE TABLE message (id TEXT, data TEXT, time_updated INTEGER)");
    const insert = db.prepare("INSERT INTO message (id, data, time_updated) VALUES (?, ?, ?)");
    insert.run("m1", messageData(), 1);
    insert.run("m2", messageData({ role: "user" }), 2);
    insert.run("m3", messageData({ providerID: "opencode" }), 3);
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
