import type { Database } from "bun:sqlite";
import { existsSync, readFileSync, statSync } from "node:fs";
import { SOURCES } from "./config";
import { baseName, listFilesRecursive, type FileStat } from "./lines";
import { countByAgent, countRows, setSourceFile, sourceFileUnchanged, upsertUsage } from "./ledger";
import { readClaudeFile } from "./parsers/claude";
import { readCodexFile } from "./parsers/codex";
import { readContinueFile } from "./parsers/continue";
import { readGrokFile } from "./parsers/grok";
import { readPiFile } from "./parsers/pi";
import { copyOpencodeDb, readOpencodeRows } from "./parsers/opencode";
import { buildStatsRows, computeUndatedRemainder, parseStatsCache, type StatsCache, type UndatedRemainderModel } from "./parsers/statsCache";
import type { RawUsage } from "./parsers/types";

export interface IngestStats {
  filesRead: number;
  filesSkipped: number;
  rowsWritten: number;
  rowsTotal: number;
  perAgent: Record<string, number>;
  /** Rows synthesized from the purged-transcript stats cache. */
  statsRows: number;
  /** Dates skipped because transcripts already cover them. */
  statsDatesSkipped: number;
  /** True when the stats cache could not be read. */
  statsCacheMissing: boolean;
}

export interface IngestResult {
  stats: IngestStats;
  /** Claude usage with no surviving day-level source (all-time totals only). */
  undatedRemainder: UndatedRemainderModel[];
  firstSessionDate: string | null;
}

function isUnchanged(db: Database, file: FileStat): boolean {
  return sourceFileUnchanged(db, file.path, file.size, file.mtimeMs);
}

function markRead(db: Database, file: FileStat): void {
  setSourceFile(db, file.path, file.size, file.mtimeMs);
}

async function ingestJsonlFiles(
  db: Database,
  files: FileStat[],
  stats: IngestStats,
  read: (path: string, onRow: (row: RawUsage) => void) => Promise<void>,
): Promise<void> {
  for (const file of files) {
    if (isUnchanged(db, file)) {
      stats.filesSkipped += 1;
      continue;
    }
    stats.filesRead += 1;
    await read(file.path, (row) => {
      if (upsertUsage(db, row, row.agent === "claude" ? "max-output" : "replace")) stats.rowsWritten += 1;
    });
    markRead(db, file);
  }
}

/** Incremental ingest of every local transcript source into the ledger. */
export async function ingestAllSources(db: Database): Promise<IngestResult> {
  const stats: IngestStats = {
    filesRead: 0,
    filesSkipped: 0,
    rowsWritten: 0,
    rowsTotal: 0,
    perAgent: {},
    statsRows: 0,
    statsDatesSkipped: 0,
    statsCacheMissing: false,
  };

  const claudeFiles = listFilesRecursive(SOURCES.claudeProjects, ".jsonl");
  await ingestJsonlFiles(db, claudeFiles, stats, (path, onRow) => readClaudeFile(path, onRow));

  // Claude Desktop audit logs are their own agent id but still Anthropic usage.
  const desktopFiles = listFilesRecursive(SOURCES.claudeDesktopSessions, ".jsonl");
  dropLegacyDesktopRows(db, desktopFiles);
  await ingestJsonlFiles(db, desktopFiles, stats, (path, onRow) =>
    readClaudeFile(path, onRow, {
      sessionId: sessionKeyOf(path),
      source: "claude-desktop",
      agent: "claude-desktop",
    }),
  );

  const codexFiles = [
    ...listFilesRecursive(SOURCES.codexSessions, ".jsonl"),
    ...listFilesRecursive(SOURCES.codexArchived, ".jsonl"),
    ...listFilesRecursive(SOURCES.codexOrcaSessions, ".jsonl"),
  ];
  await ingestJsonlFiles(db, codexFiles, stats, (path, onRow) => readCodexFile(path, onRow));

  const piFiles = listFilesRecursive(SOURCES.piSessions, ".jsonl");
  await ingestJsonlFiles(db, piFiles, stats, (path, onRow) =>
    readPiFile(path, baseName(path).replace(/\.jsonl$/, ""), onRow),
  );

  const grokFiles = listFilesRecursive(SOURCES.grokSessions, ".jsonl");
  await ingestJsonlFiles(db, grokFiles, stats, (path, onRow) => readGrokFile(path, onRow));

  const continueFiles = existsSync(SOURCES.continueTokens) ? [statFile(SOURCES.continueTokens)] : [];
  await ingestJsonlFiles(db, continueFiles, stats, (path, onRow) => readContinueFile(path, onRow));

  ingestOpencode(db, stats);

  const cache = loadStatsCache();
  let undatedRemainder: UndatedRemainderModel[] = [];
  if (cache) {
    const occupied = claudeDatesInLedger(db);
    for (const date of cache.days) {
      if (occupied.has(date.date)) stats.statsDatesSkipped += 1;
    }
    for (const row of buildStatsRows(cache, occupied)) {
      if (upsertUsage(db, row, "max-output")) stats.statsRows += 1;
    }
    undatedRemainder = computeUndatedRemainder(cache);
  } else {
    stats.statsCacheMissing = true;
  }

  stats.rowsTotal = countRows(db);
  stats.perAgent = countByAgent(db);
  return { stats, undatedRemainder, firstSessionDate: cache?.firstSessionDate ?? null };
}

/**
 * Earlier runs stored Desktop rows under agent `claude`; that would now double
 * count against the stats-cache backfill, so those legacy rows are removed and
 * the desktop files are re-read into the new agent id.
 */
function dropLegacyDesktopRows(db: Database, files: FileStat[]): void {
  const removed = db.prepare("DELETE FROM usage WHERE agent = 'claude' AND source = 'claude-desktop'").run();
  const hasDesktopRows =
    db.prepare("SELECT 1 AS present FROM usage WHERE agent = 'claude-desktop' LIMIT 1").get() !== null;
  // Re-read the desktop files when legacy rows were dropped or when the new
  // agent id has no rows yet (self-healing after the id migration).
  if (removed.changes > 0 || !hasDesktopRows) {
    const forget = db.prepare("DELETE FROM source_file WHERE path = ?");
    for (const file of files) forget.run(file.path);
  }
}

function sessionKeyOf(path: string): string {
  return baseName(path).replace(/\.jsonl$/, "");
}

function statFile(path: string): FileStat {
  const info = statSync(path);
  return { path, size: info.size, mtimeMs: Math.floor(info.mtimeMs) };
}

function loadStatsCache(): StatsCache | null {
  if (!existsSync(SOURCES.claudeStatsCache)) return null;
  try {
    const raw = JSON.parse(readFileSync(SOURCES.claudeStatsCache, "utf8")) as unknown;
    return parseStatsCache(raw);
  } catch {
    return null;
  }
}

/**
 * Local usage days that already have a Claude Code row (agent `claude`).
 * Claude Desktop is a different agent id, so it no longer suppresses the
 * stats-cache backfill.
 */
export function claudeDatesInLedger(db: Database): Set<string> {
  const rows = db
    .prepare("SELECT DISTINCT usage_date FROM usage WHERE agent = 'claude' AND source <> 'stats-cache'")
    .all() as { usage_date: string }[];
  return new Set(rows.map((row) => row.usage_date));
}

const OPENCODE_WATERMARK_KEY = `${SOURCES.opencodeDb}::rowid`;

function ingestOpencode(db: Database, stats: IngestStats): void {
  let mtimeMs = 0;
  try {
    mtimeMs = Math.floor(statSync(SOURCES.opencodeDb).mtimeMs);
  } catch {
    return;
  }

  const watermarkRow = db
    .prepare("SELECT size, mtime_ms FROM source_file WHERE path = ?")
    .get(OPENCODE_WATERMARK_KEY) as { size: number; mtime_ms: number } | null;

  if (watermarkRow && watermarkRow.mtime_ms === mtimeMs) {
    stats.filesSkipped += 1;
    return;
  }

  const copy = copyOpencodeDb(SOURCES.opencodeDb);
  if (!copy) return;
  try {
    stats.filesRead += 1;
    const { rows, maxRowid } = readOpencodeRows(copy.path, watermarkRow?.size ?? 0);
    for (const row of rows) {
      if (upsertUsage(db, row, "replace")) stats.rowsWritten += 1;
    }
    setSourceFile(db, OPENCODE_WATERMARK_KEY, maxRowid, mtimeMs);
  } finally {
    copy.cleanup();
  }
}
