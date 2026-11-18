import { LEDGER_PATH } from "./config";
import { openLedger } from "./ledger";
import { ingestAllSources } from "./ingest";

/**
 * Collector entry point.
 *
 * Reads every local transcript source read-only, keeps the incremental ledger at
 * ~/.local/share/tokenmaxxing/ledger.db, and (from the aggregation step) writes
 * the sanitized aggregate JSON consumed by the site.
 */
async function main(): Promise<void> {
  const db = openLedger(LEDGER_PATH);
  try {
    const stats = await ingestAllSources(db);
    const perAgent = Object.entries(stats.perAgent)
      .map(([agent, count]) => `${agent}=${count}`)
      .join(" ");
    console.log(
      `ingest: files read=${stats.filesRead} skipped=${stats.filesSkipped} rows total=${stats.rowsTotal} ${perAgent}`,
    );
  } finally {
    db.close();
  }
}

await main();
