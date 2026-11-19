import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { normalizeModel, normalizeProvider } from "../config";
import { num, parseJsonObject, record, str } from "./types";
import type { RawUsage } from "./types";

/**
 * opencode assistant message row -> usage row.
 *
 * The provider always comes from `providerID`; it is never inferred from the
 * model id (opencode, nan and tokenrouter all serve shared models).
 */
export function mapOpencodeRow(id: string, data: string, sessionId?: string): RawUsage | null {
  const obj = parseJsonObject(data);
  if (!obj) return null;
  if (str(obj.role) !== "assistant") return null;

  const tokens = record(obj.tokens);
  if (!tokens) return null;

  const cache = record(tokens.cache);
  const time = record(obj.time);
  const timeMs = num(time?.completed) || num(time?.created);
  if (timeMs <= 0) return null;

  const model = str(obj.modelID);
  if (!model) return null;

  const cost = num(obj.cost);
  // The real session lives in the message table's session_id column; the JSON
  // payload carries no sessionID. The message id is only a last resort.
  const resolvedSession = sessionId || str(obj.sessionID) || id;

  return {
    agent: "opencode",
    provider: normalizeProvider(obj.providerID),
    model: normalizeModel(model),
    externalId: id,
    inputTokens: num(tokens.input),
    cacheReadTokens: cache ? num(cache.read) : 0,
    cacheWriteTokens: cache ? num(cache.write) : 0,
    outputTokens: num(tokens.output),
    reasoningTokens: num(tokens.reasoning),
    reportedCostUsd: cost > 0 ? cost : 0,
    occurredAt: new Date(timeMs).toISOString(),
    sessionId: resolvedSession,
  };
}

export interface OpencodeCopy {
  path: string;
  cleanup: () => void;
}

/**
 * Copies the live DB (plus WAL/SHM) into a temp dir so the collector never
 * touches a database another process is writing to.
 */
export function copyOpencodeDb(sourcePath: string): OpencodeCopy | null {
  if (!existsSync(sourcePath)) return null;
  const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-opencode-"));
  const target = join(dir, basename(sourcePath));
  try {
    copyFileSync(sourcePath, target);
    for (const suffix of ["-wal", "-shm"]) {
      const sidecar = `${sourcePath}${suffix}`;
      if (existsSync(sidecar)) copyFileSync(sidecar, `${target}${suffix}`);
    }
  } catch {
    rmSync(dir, { recursive: true, force: true });
    return null;
  }
  return {
    path: target,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

export interface OpencodeReadResult {
  rows: RawUsage[];
  maxRowid: number;
}

/** Reads assistant messages past the rowid watermark, in rowid order. */
export function readOpencodeRows(dbPath: string, afterRowid: number): OpencodeReadResult {
  const db = new Database(dbPath);
  try {
    const rows = db
      .prepare("SELECT rowid, id, session_id, data FROM message WHERE rowid > ? ORDER BY rowid")
      .all(afterRowid) as { rowid: number; id: string; session_id: string | null; data: string }[];

    const out: RawUsage[] = [];
    let maxRowid = afterRowid;
    for (const row of rows) {
      if (row.rowid > maxRowid) maxRowid = row.rowid;
      const mapped = mapOpencodeRow(str(row.id), str(row.data), str(row.session_id));
      if (mapped) out.push(mapped);
    }
    return { rows: out, maxRowid };
  } finally {
    db.close();
  }
}
