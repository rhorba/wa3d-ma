import { expect, test } from "@playwright/test";

// Test Strategy §3.2 "Mandates and embargo" (ADR-10) and "Method and corrections" (US-9), on fixtures.

test.describe("home page (ADR-10)", () => {
  test("shows the newest mandate that has commitments, canonical to its own URL", async ({
    page,
  }) => {
    await page.goto("/fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gouvernement 2026-2031");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://wa3d-ma.vercel.app/fr/2026-2031",
    );
    await expect(page.locator("li[data-id]")).toHaveCount(1);
  });
});

test.describe("pages that do not exist", () => {
  test("an unknown URL returns the bilingual 404 page", async ({ page }) => {
    const response = await page.goto("/fr/2031-2036");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "الصفحة غير موجودة" })).toBeVisible();
    await expect(page.locator('section[lang="ar"]')).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("link", { name: "Voir les engagements" })).toHaveAttribute(
      "href",
      "/fr",
    );
  });
});

test.describe("méthodologie (US-9)", () => {
  test("defines every status at a stable anchor, in the fixed order", async ({ page }) => {
    await page.goto("/fr/methodologie");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Méthodologie");
    const anchors = await page
      .locator('[id^="statut-"]')
      .evaluateAll((items) => items.map((item) => item.id));
    expect(anchors).toEqual([
      "statut-not_started",
      "statut-in_progress",
      "statut-achieved",
      "statut-partial",
      "statut-not_achieved",
      "statut-abandoned",
    ]);
    await expect(page.locator("#statut-partial")).toContainText("L'échéance est passée");
    await expect(
      page.getByRole("navigation", { name: "Sur cette page" }).getByRole("link"),
    ).toHaveCount(7);
  });

  test("a status link on a commitment lands on its definition", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    await page.getByRole("link", { name: "Comment ce statut est-il défini ?" }).click();
    await expect(page).toHaveURL(/\/fr\/methodologie#statut-partial$/);
    await expect(page.locator("#statut-partial")).toBeInViewport();
  });

  test("explains that corrections are public and need an official source", async ({ page }) => {
    await page.goto("/fr/methodologie");
    const corrections = page.locator("#corrections");
    await expect(corrections).toContainText("public et nécessite un compte GitHub");
    await expect(corrections).toContainText("source officielle");
    await expect(corrections.getByRole("link", { name: /Ouvrir un signalement/ })).toHaveAttribute(
      "href",
      "https://github.com/rhorba/wa3d-ma/issues/new?template=correction.yml",
    );
  });

  test("the Arabic méthodologie is right-to-left", async ({ page }) => {
    await page.goto("/ar/methodologie");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("المنهجية");
    await expect(page.locator("#statut-not_achieved")).toContainText("غير منجز");
  });
});
