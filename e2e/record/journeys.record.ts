import { expect, test, type Page } from "@playwright/test";

// Test Strategy §6 "Version completion": the critical journeys in one take, on the fixture catalogue.
// Assertions keep the video honest; the detailed checks live in the regular E2E specs.
const pause = (page: Page, ms = 900) => page.waitForTimeout(ms);

test("critical journeys", async ({ page }) => {
  test.setTimeout(180_000);

  // Home → mandate list (FR).
  await page.goto("/fr");
  await pause(page);
  await page.goto("/fr/2021-2026");
  await expect(page.getByTestId("filter-count")).toHaveText("9 engagements affichés sur 9");
  await pause(page);

  // Browse + filter: theme, then status; the URL carries the view.
  const facets = page.locator(".filters-desktop");
  await facets.getByRole("button", { name: "Emploi", exact: true }).click();
  await pause(page);
  await facets.getByRole("button", { name: "Partiellement réalisé", exact: true }).click();
  await expect(page).toHaveURL(/theme=employment&status=partial$/);
  await expect(page.getByTestId("filter-count")).toHaveText("1 engagement affiché sur 9");
  await pause(page, 1500);

  // Detail FR: status, verbatim quote, progress, timeline, citation.
  await page.getByRole("link", { name: /Création fictive d'un million d'emplois nets/ }).click();
  await expect(page).toHaveURL(/\/fr\/2021-2026\/fictif-emploi$/);
  await expect(page.getByTestId("quote")).toBeVisible();
  await pause(page);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 500);
    await pause(page, 700);
  }
  await expect(page.getByTestId("citation")).toBeVisible();
  await pause(page);

  // Language toggle → the same commitment in Arabic (RTL).
  await page.mouse.wheel(0, -5000);
  await page.getByRole("link", { name: "Version arabe" }).click();
  await expect(page).toHaveURL(/\/ar\/2021-2026\/fictif-emploi$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await pause(page, 1200);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 600);
    await pause(page, 700);
  }

  // Méthodologie: status definitions at stable anchors.
  await page.goto("/fr/methodologie#statut-partial");
  await pause(page, 1500);

  // A page that does not exist: the bilingual 404 (the embargo 404 is covered by e2e:embargo).
  const response = await page.goto("/fr/2031-2036");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  await pause(page, 1500);
});
