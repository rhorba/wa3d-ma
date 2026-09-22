// Story 3.3: fails the build when the list page or its filters island goes over the NFR-1 JS budget.
// Run after `pnpm build`; Lighthouse checks the transferred total too, this pins the island.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { ISLAND_BUDGET, TOTAL_BUDGET, kb, measureListPage } from "../lib/bundle-budget";

const dist = ".next";
const manifest = JSON.parse(readFileSync(join(dist, "app-build-manifest.json"), "utf8")) as {
  pages: Record<string, string[]>;
};
const report = measureListPage(
  manifest.pages,
  (file) => gzipSync(readFileSync(join(dist, file))).length,
);

console.log(`list page JS: ${kb(report.total)} (budget ${kb(TOTAL_BUDGET)})`);
console.log(`island JS:    ${kb(report.island)} (budget ${kb(ISLAND_BUDGET)})`);
console.log(`island chunks: ${report.islandChunks.join(", ")}`);
if (report.failures.length > 0) {
  for (const failure of report.failures) console.error(`over budget: ${failure}`);
  process.exit(1);
}
