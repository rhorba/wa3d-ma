// NFR-1 JS budget on the list page (user decision 2026-09-21): total <= 130 KB gzip, island <= 15 KB.
// Pure over the app build manifest so it can be tested without a build (scripts/bundle-budget.ts reads the files).

export const LIST_PAGE = "/[locale]/[mandate]/page";
export const LAYOUTS = ["/layout", "/[locale]/layout"];
export const KB = 1024;
export const TOTAL_BUDGET = 130 * KB;
export const ISLAND_BUDGET = 15 * KB;

export type BudgetReport = {
  total: number;
  island: number;
  islandChunks: string[];
  failures: string[];
};

const isScript = (file: string) => file.endsWith(".js");

// Everything the list page loads = its own chunks + its layouts' chunks. The island is what only the page loads.
export function measureListPage(
  pages: Record<string, string[]>,
  gzipSize: (file: string) => number,
  budgets = { total: TOTAL_BUDGET, island: ISLAND_BUDGET },
): BudgetReport {
  const page = pages[LIST_PAGE];
  if (!page) throw new Error(`${LIST_PAGE} is missing from the build manifest`);
  const layout = new Set(LAYOUTS.flatMap((key) => pages[key] ?? []).filter(isScript));
  const islandChunks = page.filter((file) => isScript(file) && !layout.has(file));
  const all = new Set([...layout, ...islandChunks]);

  const sum = (files: Iterable<string>) => [...files].reduce((acc, f) => acc + gzipSize(f), 0);
  const total = sum(all);
  const island = sum(islandChunks);

  const failures: string[] = [];
  if (total > budgets.total) failures.push(`list page JS ${kb(total)} > ${kb(budgets.total)}`);
  if (island > budgets.island) failures.push(`island JS ${kb(island)} > ${kb(budgets.island)}`);
  return { total, island, islandChunks, failures };
}

export const kb = (bytes: number) => `${(bytes / KB).toFixed(1)} KB`;
