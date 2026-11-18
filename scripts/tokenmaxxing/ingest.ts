import type { Database } from "bun:sqlite";
import { statSync } from "node:fs";
import { SOURCES } from "./config";
import { baseName, listFilesRecursive, type FileStat } from "./lines";
import { countByAgent, countRows, setSourceFile, sourceFileUnchanged, upsertUsage } from "./ledger";
import { readClaudeFile } from "./parsers/claude";
import { readCodexFile } from "./parsers/codex";
import { readPiFile } from "./parsers/pi";
import { copyOpencodeDb, readOpencodeRows } from "./parsers/opencode";

export interface IngestStats {
  filesRead: number;
  filesSkipped: number;
  rowsWritten: number;
  rowsTotal: number;
  perAgent: Record<string, number>;
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
  read: (path: string, onRow: (row: import("./parsers/types").RawUsage) => void) => Promise<void>,
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
export async function ingestAllSources(db: Database): Promise<IngestStats> {
  const stats: IngestStats = { filesRead: 0, filesSkipped: 0, rowsWritten: 0, rowsTotal: 0, perAgent: {} };

  const claudeFiles = listFilesRecursive(SOURCES.claudeProjects, ".jsonl");
  await ingestJsonlFiles(db, claudeFiles, stats, (path, onRow) => readClaudeFile(path, onRow));

  const codexFiles = [
    ...listFilesRecursive(SOURCES.codexSessions, ".jsonl"),
    ...listFilesRecursive(SOURCES.codexArchived, ".jsonl"),
  ];
  await ingestJsonlFiles(db, codexFiles, stats, (path, onRow) => readCodexFile(path, onRow));

  const piFiles = listFilesRecursive(SOURCES.piSessions, ".jsonl");
  await ingestJsonlFiles(db, piFiles, stats, (path, onRow) =>
    readPiFile(path, baseName(path).replace(/\.jsonl$/, ""), onRow),
  );

  ingestOpencode(db, stats);

  stats.rowsTotal = countRows(db);
  stats.perAgent = countByAgent(db);
  return stats;
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
