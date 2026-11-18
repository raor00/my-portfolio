import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { LEDGER_PATH, OUTPUT_PATH } from "./config";
import { openLedger } from "./ledger";
import { aggregate, readUsageRows } from "./aggregate";
import { ingestAllSources } from "./ingest";
import { loadPrices } from "./pricing";
import { collectQuotas } from "./quotas";
import { validateOutput, type QuotaProvider } from "./sanitize";
import { localTimeZone } from "./time";

/**
 * Tokenmaxxing collector.
 *
 * Reads every local transcript source read-only, keeps the incremental ledger at
 * ~/.local/share/tokenmaxxing/ledger.db, and writes the sanitized aggregate
 * `src/data/tokenmaxxing.json` consumed by the static site.
 *
 * Quotas are opt-in (`--quotas`): the committed default run contains no quota
 * data, and the quota probe never prints tokens.
 */
async function main(): Promise<void> {
  const withQuotas = process.argv.slice(2).includes("--quotas");

  const startedAt = Date.now();
  const db = openLedger(LEDGER_PATH);
  let stats;
  let rows;
  try {
    stats = await ingestAllSources(db);
    rows = readUsageRows(db);
  } finally {
    db.close();
  }

  const prices = await loadPrices({ onStatus: (line) => console.error(line) });

  let quotas: QuotaProvider[] = [];
  if (withQuotas) {
    quotas = await collectQuotas({ onStatus: (line) => console.error(line) });
  }

  const output = aggregate({
    rows,
    prices,
    quotas,
    generatedAt: new Date().toISOString(),
    timezone: localTimeZone(),
  });

  const violations = validateOutput(output);
  if (violations.length > 0) {
    console.error(`refusing to write ${OUTPUT_PATH}: ${violations.length} sanitization violation(s)`);
    for (const violation of violations) console.error(`- ${violation}`);
    process.exitCode = 1;
    return;
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  const perAgent = Object.entries(stats.perAgent)
    .map(([agent, count]) => `${agent}=${count}`)
    .join(" ");
  const quotaSummary = quotas.length === 0 ? "quotas=off" : `quotas=${quotas.map((q) => `${q.id}:${q.status}`).join(",")}`;
  console.log(
    `tokenmaxxing: ${elapsed}s files read=${stats.filesRead} skipped=${stats.filesSkipped} ` +
      `rows=${stats.rowsTotal} (${perAgent}) priced-days=${output.days.length} ` +
      `models=${output.models.length} unpriced=${output.unpricedModels.length} ${quotaSummary}`,
  );
}

await main();
