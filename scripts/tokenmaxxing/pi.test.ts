import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mapPiLine, readPiFile } from "./parsers/pi";
import { openLedger, upsertUsage } from "./ledger";
import type { RawUsage } from "./parsers/types";

function line(overrides: Record<string, unknown> = {}, messageOverrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: "message",
    id: "line-1",
    timestamp: "2024-03-10T12:00:00.000Z",
    message: {
      role: "assistant",
      provider: "anthropic",
      model: "claude-opus-4-1",
      responseId: "resp_1",
      usage: {
        input: 11,
        output: 22,
        cacheRead: 33,
        cacheWrite: 44,
        reasoning: 5,
        totalTokens: 110,
        cost: { total: 0.42, totalFromProvider: true },
      },
      ...messageOverrides,
    },
    ...overrides,
  });
}

describe("pi parser", () => {
  test("maps the usage object with input already uncached", () => {
    const row = mapPiLine(line(), "session");
    expect(row).toMatchObject({
      agent: "pi",
      provider: "anthropic",
      model: "claude-opus-4-1",
      externalId: "resp_1",
      inputTokens: 11,
      cacheReadTokens: 33,
      cacheWriteTokens: 44,
      outputTokens: 22,
      reasoningTokens: 5,
      reportedCostUsd: 0.42,
      occurredAt: "2024-03-10T12:00:00.000Z",
    });
  });

  test("only trusts cost.total when totalFromProvider is true", () => {
    const unverified = line({}, {
      usage: { input: 1, output: 2, cacheRead: 0, cacheWrite: 0, reasoning: 0, cost: { total: 0.9, totalFromProvider: false } },
    });
    expect(mapPiLine(unverified, "session")?.reportedCostUsd).toBe(0);

    const missingFlag = line({}, {
      usage: { input: 1, output: 2, cacheRead: 0, cacheWrite: 0, reasoning: 0, cost: { total: 0.9 } },
    });
    expect(mapPiLine(missingFlag, "session")?.reportedCostUsd).toBe(0);
  });

  test("falls back to a basename key when responseId is absent", () => {
    const noResponse = line({}, { responseId: undefined });
    expect(mapPiLine(noResponse, "2024-03-10_session")?.externalId).toBe("2024-03-10_session:line-1");
  });

  test("ignores non-assistant and non-message lines", () => {
    expect(mapPiLine(JSON.stringify({ type: "user", message: { role: "user" } }), "s")).toBeNull();
    expect(
      mapPiLine(line({}, { role: "user" }), "s"),
    ).toBeNull();
    expect(mapPiLine(JSON.stringify({ type: "message", message: { role: "assistant" } }), "s")).toBeNull();
  });

  test("responseId dedupe collapses the same response copied into a fork file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-pi-"));
    const original = join(dir, "2024-03-10_original.jsonl");
    const fork = join(dir, "2024-03-10_fork.jsonl");
    writeFileSync(original, `${line()}\n`);
    writeFileSync(fork, `${line()}\n${line({ id: "line-2", timestamp: "2024-03-10T12:00:10.000Z" }, { responseId: "resp_2" })}\n`);

    const db = openLedger(":memory:");
    try {
      const rows: RawUsage[] = [];
      for (const [path, key] of [
        [original, "2024-03-10_original"],
        [fork, "2024-03-10_fork"],
      ] as const) {
        await readPiFile(path, key, (row) => {
          rows.push(row);
          upsertUsage(db, row, "replace");
        });
      }
      expect(rows.length).toBe(3);
      const stored = db.prepare("SELECT COUNT(*) AS count FROM usage").get() as { count: number };
      expect(stored.count).toBe(2);
      const ids = db.prepare("SELECT external_id FROM usage ORDER BY external_id").all() as { external_id: string }[];
      expect(ids.map((row) => row.external_id)).toEqual(["resp_1", "resp_2"]);
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
