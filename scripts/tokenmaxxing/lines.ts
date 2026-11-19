import { createReadStream, readdirSync, statSync } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";

/**
 * Streams a JSONL file line by line. A truncated trailing line (or any invalid
 * JSON) is skipped instead of failing the whole file; the file is never loaded
 * into memory as a whole.
 */
export async function streamJsonLines(path: string, onLine: (line: string) => void): Promise<void> {
  const stream = createReadStream(path, { encoding: "utf8" });
  const reader = createInterface({ input: stream, crlfDelay: Infinity });
  try {
    for await (const line of reader) {
      if (line.length === 0) continue;
      onLine(line);
    }
  } finally {
    reader.close();
    stream.close();
  }
}

export interface FileStat {
  path: string;
  size: number;
  mtimeMs: number;
}

/** Recursively lists files under `root` whose name ends with `suffix`. */
export function listFilesRecursive(root: string, suffix: string): FileStat[] {
  const out: FileStat[] = [];
  const walk = (dir: string): void => {
    let entries: ReturnType<typeof readdirSync>;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(suffix)) continue;
      try {
        const stat = statSync(full);
        out.push({ path: full, size: stat.size, mtimeMs: Math.floor(stat.mtimeMs) });
      } catch {
        // Ignore unreadable files.
      }
    }
  };
  walk(root);
  out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return out;
}

/** File name without directories. */
export function baseName(path: string): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? path : path.slice(index + 1);
}
