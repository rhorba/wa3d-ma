import { expect, test } from "@playwright/test";

// Runs against the fictional fixture catalogue (tests/fixtures/catalogue/valid), archive enabled.

test.describe("mandate list (US-1, US-7)", () => {
  test("shows all six status counts in the fixed order, with no score", async ({ page }) => {
    await page.goto("/fr/2021-2026");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gouvernement 2021-2026");
    const counts = page.getByTestId("status-counts").locator("li");
    await expect(counts).toHaveCount(6);
    expect(
      await counts.evaluateAll((items) => items.map((li) => li.getAttribute("data-status"))),
    ).toEqual(["not_started", "in_progress", "achieved", "partial", "not_achieved", "abandoned"]);
    await expect(counts.locator("bdi")).toHaveText(["1", "1", "2", "2", "2", "1"]);
    await expect(page.getByTestId("status-counts")).not.toContainText("%");
    await expect(page.locator("main")).not.toContainText(/tenus|kept/i);
  });

  test("lists commitments in programme order, each linking to its page", async ({ page }) => {
    await page.goto("/fr/2021-2026");
    const rows = page.getByTestId("commitment-list").locator("li[data-id]");
    await expect(rows).toHaveCount(9);
    const ids = await rows.evaluateAll((items) => items.map((li) => li.getAttribute("data-id")));
    expect(ids).toEqual([
      "fictif-emploi",
      "fictif-protection-sociale",
      "fictif-sante",
      "fictif-education",
      "fictif-economie",
      "fictif-gouvernance",
      "fictif-logement",
      "fictif-eau-energie",
      "fictif-autre",
    ]);
    await expect(rows.first().locator("a")).toHaveAttribute("href", "/fr/2021-2026/fictif-emploi");
  });

  test("shows progress only for numeric targets and never invents data", async ({ page }) => {
    await page.goto("/fr/2021-2026");
    const row = (id: string) => page.locator(`li[data-id="${id}"]`);
    await expect(row("fictif-emploi")).toContainText("62 % vers la cible");
    await expect(row("fictif-education")).toContainText("Données indisponibles");
    await expect(row("fictif-education")).not.toContainText("%");
    await expect(row("fictif-sante")).toContainText("Sans cible chiffrée");
    await expect(row("fictif-sante").locator("bdi")).toHaveText("10/09/2026");
  });

  test("works without JavaScript: grouped by theme with a jump index", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/fr/2021-2026");
    const index = page.getByRole("navigation", { name: "Thèmes" });
    await expect(index.getByRole("link")).toHaveCount(9);
    await expect(index.getByRole("link", { name: "Santé" })).toHaveAttribute(
      "href",
      "#theme-health",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Santé" })).toBeVisible();
    await context.close();
  });

  test("the Arabic list is right-to-left with Arabic labels and Western digits", async ({
    page,
  }) => {
    await page.goto("/ar/2021-2026");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("حكومة 2021-2026");
    await expect(page.locator('li[data-id="fictif-emploi"]')).toContainText(
      "62 في المائة نحو الهدف",
    );
    await expect(page.getByTestId("status-counts")).toContainText("منجز جزئيا");
  });

  test("an unknown mandate does not exist", async ({ request }) => {
    expect((await request.get("/fr/2031-2036")).status()).toBe(404);
  });

  test("the header marks the current mandate and the toggle keeps the page", async ({ page }) => {
    await page.goto("/fr/2021-2026");
    await expect(page.getByRole("banner")).toContainText("Mandat 2021-2026");
    await page.getByRole("link", { name: "Version arabe" }).click();
    await expect(page).toHaveURL(/\/ar\/2021-2026$/);
  });
});
