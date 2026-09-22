import { expect, test } from "@playwright/test";

// FR-12: canonical, hreflang, descriptions, sitemap and robots, all from NEXT_PUBLIC_SITE_URL.
const SITE = "https://wa3d-ma.vercel.app";

test.describe("SEO metadata", () => {
  test("a commitment page has its canonical, both hreflang alternates and a status-first description", async ({
    page,
  }) => {
    await page.goto("/ar/2021-2026/fictif-emploi");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE}/ar/2021-2026/fictif-emploi`,
    );
    const alternate = (lang: string) => page.locator(`link[rel="alternate"][hreflang="${lang}"]`);
    await expect(alternate("fr")).toHaveAttribute("href", `${SITE}/fr/2021-2026/fictif-emploi`);
    await expect(alternate("ar")).toHaveAttribute("href", `${SITE}/ar/2021-2026/fictif-emploi`);
    await expect(alternate("x-default")).toHaveAttribute(
      "href",
      `${SITE}/fr/2021-2026/fictif-emploi`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /^منجز جزئيا · /,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "ar_MA");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  });

  test("a list page describes the mandate", async ({ page }) => {
    await page.goto("/fr/2021-2026");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE}/fr/2021-2026`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Suivi des 9 engagements du gouvernement 2021-2026 : statuts, sources officielles et citations exactes.",
    );
  });
});

test.describe("sitemap and robots", () => {
  test("the sitemap lists every indexable page in both languages, never the home page", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    // Méthodologie + 2021-2026 (list + 9) + 2026-2031 (list + 1), in two languages.
    expect(urls).toHaveLength(26);
    expect(urls).toContain(`${SITE}/fr/2021-2026/fictif-emploi`);
    expect(urls).toContain(`${SITE}/ar/methodologie`);
    expect(urls).not.toContain(`${SITE}/fr`);
    expect(xml).toContain(`hreflang="ar"`);
  });

  test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Allow: /");
    expect(text).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});
