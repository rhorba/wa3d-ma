import { expect, test, type Page } from "@playwright/test";

// Test Strategy §3.2 "Browse commitments" (US-1, FR-10), on the fixture catalogue (9 commitments in
// 2021-2026, one per theme; partial = fictif-emploi + fictif-eau-energie).

const visibleIds = (page: Page) =>
  page
    .locator("#commitments li[data-id]:visible")
    .evaluateAll((items) => items.map((li) => li.getAttribute("data-id")));

// The side column is desktop-only; on mobile the same controls live in the bottom sheet.
async function choose(page: Page, name: string) {
  const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
  if (isMobile) {
    await page.locator(".filters-mobile .filter-button").first().click();
    await page.locator("dialog").getByRole("button", { name, exact: true }).click();
    await page.locator("dialog").getByRole("button", { name: "Appliquer" }).click();
  } else {
    await page.locator(".filters-desktop").getByRole("button", { name, exact: true }).click();
  }
}

test.describe("list filters", () => {
  test("filter by theme and status, then share the view", async ({ page, browser }) => {
    await page.goto("/fr/2021-2026");
    await expect(page.getByTestId("filter-count")).toHaveText("9 engagements affichés sur 9");
    await choose(page, "Emploi");
    await choose(page, "Partiellement réalisé");
    await expect(page).toHaveURL(/\/fr\/2021-2026\?theme=employment&status=partial$/);
    expect(await visibleIds(page)).toEqual(["fictif-emploi"]);
    await expect(page.getByTestId("filter-count")).toHaveText("1 engagement affiché sur 9");

    const shared = await browser.newPage();
    await shared.goto(page.url());
    expect(await visibleIds(shared)).toEqual(["fictif-emploi"]);
    await shared.close();
  });

  test("OR within a group: two statuses together", async ({ page }) => {
    await page.goto("/fr/2021-2026?status=partial,achieved");
    expect(await visibleIds(page)).toEqual([
      "fictif-emploi",
      "fictif-protection-sociale",
      "fictif-logement",
      "fictif-eau-energie",
    ]);
  });

  test("zero results offers a reset", async ({ page }) => {
    await page.goto("/fr/2021-2026?theme=health&status=achieved");
    await expect(page.getByTestId("no-results")).toContainText(
      "Aucun engagement ne correspond à ces filtres.",
    );
    await page
      .getByTestId("no-results")
      .getByRole("button", { name: "Réinitialiser les filtres" })
      .click();
    expect(await visibleIds(page)).toHaveLength(9);
    await expect(page).toHaveURL(/\/fr\/2021-2026$/);
  });

  test("invalid parameters are ignored, not fatal", async ({ page }) => {
    await page.goto("/fr/2021-2026?theme=%3Cscript%3E&status=foo");
    expect(await visibleIds(page)).toHaveLength(9);
    await expect(page).toHaveURL(/\/fr\/2021-2026$/);
  });

  test("with JavaScript the list is flat, in programme order, with row theme labels", async ({
    page,
  }) => {
    await page.goto("/fr/2021-2026");
    await expect(page.locator("#commitments")).toHaveAttribute("data-enhanced", "");
    await expect(page.getByRole("navigation", { name: "Thèmes" })).toBeHidden();
    await expect(page.locator('li[data-id="fictif-sante"] .row-theme')).toBeVisible();
    await expect(page.getByTestId("result-count")).toBeHidden();
  });

  test("the Arabic filters work and use Arabic labels", async ({ page }) => {
    await page.goto("/ar/2021-2026?status=not_achieved");
    await expect(page.getByTestId("filter-count")).toHaveText("الالتزامات المعروضة: 2 من أصل 9");
    expect(await visibleIds(page)).toEqual(["fictif-sante", "fictif-autre"]);
  });
});
