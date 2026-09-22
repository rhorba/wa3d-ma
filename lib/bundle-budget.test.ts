import { describe, expect, it } from "vitest";
import { KB, LIST_PAGE, kb, measureListPage } from "./bundle-budget";

const pages = {
  "/layout": ["webpack.js", "react.js", "app/layout.js"],
  "/[locale]/layout": ["webpack.js", "react.js", "main.css", "app/locale-layout.js"],
  [LIST_PAGE]: ["webpack.js", "react.js", "0-island.js", "app/list-page.js"],
};
const sizes: Record<string, number> = {
  "webpack.js": 2 * KB,
  "react.js": 100 * KB,
  "app/layout.js": 1 * KB,
  "app/locale-layout.js": 1 * KB,
  "0-island.js": 3 * KB,
  "app/list-page.js": 1 * KB,
};
const size = (file: string) => sizes[file] ?? 0;

describe("measureListPage", () => {
  it("counts layouts once, ignores css, and isolates the island", () => {
    const report = measureListPage(pages, size);
    expect(report.total).toBe(108 * KB);
    expect(report.island).toBe(4 * KB);
    expect(report.islandChunks).toEqual(["0-island.js", "app/list-page.js"]);
    expect(report.failures).toEqual([]);
  });

  it("reports both budgets when exceeded", () => {
    const report = measureListPage(pages, size, { total: 100 * KB, island: 2 * KB });
    expect(report.failures).toEqual([
      "list page JS 108.0 KB > 100.0 KB",
      "island JS 4.0 KB > 2.0 KB",
    ]);
  });

  it("treats a missing layout as empty", () => {
    const report = measureListPage({ [LIST_PAGE]: ["0-island.js"] }, size);
    expect(report.total).toBe(3 * KB);
    expect(report.island).toBe(3 * KB);
  });

  it("fails loudly when the list page is not in the manifest", () => {
    expect(() => measureListPage({}, size)).toThrow(/missing from the build manifest/);
  });

  it("formats kilobytes", () => {
    expect(kb(1536)).toBe("1.5 KB");
  });
});
