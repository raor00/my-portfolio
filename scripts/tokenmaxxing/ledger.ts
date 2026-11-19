import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { LEDGER_PATH } from "./config";
import { toIsoTimestamp, toUsageDate } from "./time";
import type { LedgerRow, RawUsage } from "./parsers/types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usage (
  agent TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  external_id TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cache_write_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  reasoning_tokens INTEGER NOT NULL DEFAULT 0,
  reported_cost_usd REAL NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  session_id TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'transcript',
  estimated_split INTEGER NOT NULL DEFAULT 0,
  UNIQUE(agent, external_id)
);
CREATE TABLE IF NOT EXISTS source_file (
  path TEXT PRIMARY KEY,
  size INTEGER NOT NULL,
  mtime_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS usage_date_idx ON usage(usage_date);
CREATE INDEX IF NOT EXISTS usage_agent_idx ON usage(agent);
`;

/**
 * Opens (or creates) the local ledger. This is the only writable store the
 * collector owns; every transcript source stays read-only.
 */
export function openLedger(path: string = LEDGER_PATH): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

/** Adds columns introduced after the first ledger version. */
function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(usage)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("session_id")) {
    db.exec("ALTER TABLE usage ADD COLUMN session_id TEXT NOT NULL DEFAULT ''");
  }
  if (!names.has("source")) {
    db.exec("ALTER TABLE usage ADD COLUMN source TEXT NOT NULL DEFAULT 'transcript'");
  }
  if (!names.has("estimated_split")) {
    db.exec("ALTER TABLE usage ADD COLUMN estimated_split INTEGER NOT NULL DEFAULT 0");
  }
}

export function isAllZeroTokens(row: RawUsage): boolean {
  return (
    row.inputTokens <= 0 &&
    row.cacheReadTokens <= 0 &&
    row.cacheWriteTokens <= 0 &&
    row.outputTokens <= 0
  );
}

/** Adds the derived local usage day and the ISO timestamp to a raw row. */
export function toLedgerRow(raw: RawUsage, upsertMode: LedgerRow["upsertMode"] = "replace"): LedgerRow | null {
  const occurredAt = toIsoTimestamp(raw.occurredAt);
  if (!occurredAt) return null;
  const usageDate = toUsageDate(occurredAt);
  if (!usageDate) return null;
  return { ...raw, occurredAt, usageDate, upsertMode };
}

const UPSERT_REPLACE = `
INSERT INTO usage (
  agent, provider, model, external_id, input_tokens, cache_read_tokens,
  cache_write_tokens, output_tokens, reasoning_tokens, reported_cost_usd,
  occurred_at, usage_date, session_id, source, estimated_split
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(agent, external_id) DO UPDATE SET
  provider = excluded.provider,
  model = excluded.model,
  input_tokens = excluded.input_tokens,
  cache_read_tokens = excluded.cache_read_tokens,
  cache_write_tokens = excluded.cache_write_tokens,
  output_tokens = excluded.output_tokens,
  reasoning_tokens = excluded.reasoning_tokens,
  reported_cost_usd = excluded.reported_cost_usd,
  occurred_at = excluded.occurred_at,
  usage_date = excluded.usage_date,
  session_id = excluded.session_id,
  source = excluded.source,
  estimated_split = excluded.estimated_split
`;

/**
 * Streaming sources repeat the same external id with slightly different usage.
 * For Claude we keep the line with the highest output_tokens instead of the
 * last one seen, so re-runs and resumed sessions stay stable.
 */
const UPSERT_MAX_OUTPUT = `${UPSERT_REPLACE} WHERE excluded.output_tokens > usage.output_tokens`;

/**
 * Writes one row. All-zero rows are dropped. Returns true when a row was
 * written or updated.
 */
export function upsertUsage(db: Database, raw: RawUsage, mode: LedgerRow["upsertMode"] = "replace"): boolean {
  if (isAllZeroTokens(raw)) return false;
  const row = toLedgerRow(raw, mode);
  if (!row) return false;

  const statement = mode === "max-output" ? UPSERT_MAX_OUTPUT : UPSERT_REPLACE;
  const result = db
    .prepare(statement)
    .run(
      row.agent,
      row.provider,
      row.model,
      row.externalId,
      row.inputTokens,
      row.cacheReadTokens,
      row.cacheWriteTokens,
      row.outputTokens,
      row.reasoningTokens,
      row.reportedCostUsd,
      row.occurredAt,
      row.usageDate,
      row.sessionId ?? "",
      row.source ?? "transcript",
      row.estimatedSplit ? 1 : 0,
    );
  return result.changes > 0;
}

export interface SourceFileState {
  size: number;
  mtimeMs: number;
}

export function getSourceFile(db: Database, path: string): SourceFileState | null {
  const row = db
    .prepare("SELECT size, mtime_ms FROM source_file WHERE path = ?")
    .get(path) as { size: number; mtime_ms: number } | null;
  return row ? { size: row.size, mtimeMs: row.mtime_ms } : null;
}

export function setSourceFile(db: Database, path: string, size: number, mtimeMs: number): void {
  db.prepare(
    "INSERT INTO source_file (path, size, mtime_ms) VALUES (?, ?, ?) ON CONFLICT(path) DO UPDATE SET size = excluded.size, mtime_ms = excluded.mtime_ms",
  ).run(path, size, mtimeMs);
}

export function sourceFileUnchanged(db: Database, path: string, size: number, mtimeMs: number): boolean {
  const current = getSourceFile(db, path);
  return current !== null && current.size === size && current.mtimeMs === mtimeMs;
}

export function countByAgent(db: Database): Record<string, number> {
  const rows = db.prepare("SELECT agent, COUNT(*) AS count FROM usage GROUP BY agent ORDER BY agent").all() as {
    agent: string;
    count: number;
  }[];
  const result: Record<string, number> = {};
  for (const row of rows) result[row.agent] = row.count;
  return result;
}

export function countRows(db: Database): number {
  const row = db.prepare("SELECT COUNT(*) AS count FROM usage").get() as { count: number } | null;
  return row?.count ?? 0;
}
