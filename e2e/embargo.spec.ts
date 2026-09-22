import { expect, test } from "@playwright/test";

// FR-9 / SDR-3: runs only against a build with NEXT_PUBLIC_ARCHIVE_ENABLED unset
// (CI job "embargo-smoke": pnpm e2e --grep @embargo). The default suite excludes it.

test.describe("archive embargo @embargo", () => {
  for (const path of ["/fr/2021-2026", "/ar/2021-2026", "/fr/2021-2026/fictif-emploi"]) {
    test(`${path} does not exist`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }

  test("the mandate menu does not offer the archive", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator('a[href*="2021-2026"]')).toHaveCount(0);
  });

  test("the sitemap never lists the archive", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).not.toContain("2021-2026");
    expect(xml).toContain("/fr/2026-2031");
  });
});
