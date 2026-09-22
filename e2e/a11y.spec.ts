import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// NFR-3: WCAG 2.2 AA in both languages. Pages are added to this list as they are built.
const PAGES = ["/fr", "/ar", "/fr/2021-2026", "/ar/2021-2026"];

for (const path of PAGES) {
  test(`${path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
