import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// DevOps §3 "real-data-smoke" (runbook R1): runs only against a build of the real data/ folder with the
// archive on (CI job real-data-smoke: pnpm e2e:real-data). The default suite, on fixtures, excludes it.
// Every URL the sitemap publishes must answer 200 and have no serious or critical axe violation.

test.describe("real catalogue @realdata", () => {
  test("every sitemap URL (and both homes) is reachable and accessible", async ({
    page,
    request,
  }) => {
    test.setTimeout(10 * 60_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    // Sitemap URLs carry the production host (NEXT_PUBLIC_SITE_URL): crawl their paths locally.
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] as string).pathname,
    );
    expect(paths.length, "sitemap lists at least the Méthodologie pages").toBeGreaterThan(1);

    for (const path of ["/fr", "/ar", ...new Set(paths)]) {
      const response = await page.goto(path);
      expect.soft(response?.status(), path).toBe(200);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
      expect.soft(blocking, path).toEqual([]);
    }
  });
});
