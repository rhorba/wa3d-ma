// Story 4.2 (SDR-4): run by the curator, never by the build. Reads data/world-bank-series.json, fetches
// each series for Morocco from the World Bank Indicators API and writes data/indicators/<id>.json,
// then validates the whole catalogue. HCP and Bank Al-Maghrib values are entered by hand (curation guide).
//   pnpm fetch:indicators [--data-dir data]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readCatalogue } from "../lib/catalogue/load";
import { countBySeverity, formatIssues } from "../lib/catalogue/report";
import { SeriesConfig, apiUrl, toIndicator } from "../lib/catalogue/world-bank";

const args = process.argv.slice(2);
const at = args.indexOf("--data-dir");
const dataDir = at >= 0 ? (args[at + 1] ?? "data") : "data";
const today = new Date().toISOString().slice(0, 10);

async function main(): Promise<number> {
  const configPath = join(dataDir, "world-bank-series.json");
  let raw: string;
  try {
    raw = readFileSync(configPath, "utf8");
  } catch {
    console.error(
      `${configPath} not found: list the series to fetch there (see lib/catalogue/world-bank.ts).`,
    );
    return 1;
  }
  const config = SeriesConfig.parse(JSON.parse(raw));
  mkdirSync(join(dataDir, "indicators"), { recursive: true });

  for (const spec of config.series) {
    const response = await fetch(apiUrl(spec, Number(today.slice(0, 4))), {
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`${spec.series}: HTTP ${response.status}`);
    const indicator = toIndicator(spec, await response.json(), today);
    const file = join(dataDir, "indicators", `${spec.id}.json`);
    writeFileSync(file, `${JSON.stringify(indicator, null, 2)}\n`);
    const last = indicator.values.at(-1);
    console.log(
      `${file}: ${indicator.values.length} value(s), latest ${last?.year} = ${last?.value}`,
    );
  }

  const { issues } = readCatalogue({ dataDir });
  const { errors, warnings } = countBySeverity(issues);
  if (issues.length > 0) console.log(formatIssues(issues));
  console.log(`catalogue: ${errors} error(s), ${warnings} warning(s)`);
  return errors > 0 ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error: Error) => {
    console.error(error.message);
    process.exit(1);
  },
);
