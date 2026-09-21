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

test("responses carry the SEC-1 security headers and no framework banner", async ({ request }) => {
  const headers = (await request.get("/fr")).headers();
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  const csp = headers["content-security-policy"] ?? "";
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
  ]) {
    expect(csp).toContain(directive);
  }
  expect(csp).not.toContain("unsafe-eval");
});

test("fonts are self-hosted: no request leaves the site", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://localhost")) external.push(req.url());
  });
  await page.goto("/fr");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});

test.describe("layout", () => {
  test("a skip link reaches the main content", async ({ page }) => {
    await page.goto("/fr");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await expect(page.locator("#main")).toHaveCount(1);
  });

  test("the language toggle stays on the same page", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("link", { name: "Version arabe" }).click();
    await expect(page).toHaveURL(/\/ar$/);
    await page.getByRole("link", { name: "النسخة الفرنسية" }).click();
    await expect(page).toHaveURL(/\/fr$/);
  });

  test("the footer states neutrality and links to the correction form", async ({ page }) => {
    await page.goto("/fr");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText("quelle que soit la coalition");
    const report = footer.getByRole("link", { name: /Signaler une erreur/ });
    await expect(report).toHaveAttribute("href", /\/issues\/new\?template=correction\.yml$/);
    await expect(report).toHaveAttribute("rel", "noopener noreferrer");
    await expect(footer.locator("bdi")).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
