import { expect, test } from "@playwright/test";

test("the bare domain redirects to French", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("the Arabic home is right-to-left", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("responses do not advertise the framework", async ({ request }) => {
  const response = await request.get("/fr");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
