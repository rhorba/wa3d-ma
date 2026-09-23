import { expect, test } from "@playwright/test";

// Test Strategy §3.2 "Read one commitment" (US-2, US-4, US-5; FR-2, FR-6, FR-7, FR-8) on fixtures.
const NNBSP = String.fromCodePoint(0x202f); // fr-FR thousands separator

test.describe("commitment page", () => {
  test("header: title, status with its definition, deadline and last verification", async ({
    page,
  }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Création fictive d'un million d'emplois nets",
    );
    await expect(page.getByTestId("status")).toHaveText("Partiellement réalisé");
    await expect(
      page.getByRole("link", { name: "Comment ce statut est-il défini ?" }),
    ).toHaveAttribute("href", "/fr/methodologie#statut-partial");
    await expect(page.getByTestId("deadline")).toHaveText("31/12/2025 (passée)");
    await expect(page.getByTestId("last-verified")).toHaveText("15/09/2026");
    const crumbs = page.getByRole("navigation", { name: "Fil d'Ariane" }).getByRole("link");
    await expect(crumbs).toHaveText(["Mandat 2021-2026", "Emploi"]);
    await expect(crumbs.nth(1)).toHaveAttribute("href", "/fr/2021-2026?theme=employment");
  });

  test("verbatim quote with its document, page and provenance", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    await expect(page.getByTestId("quote")).toHaveText(
      "« Texte fictif : le gouvernement créera un million d'emplois nets. »",
    );
    const source = page.getByRole("link", {
      name: /Programme gouvernemental fictif 2021-2026, p\. 12/,
    });
    await expect(source).toHaveAttribute(
      "href",
      "https://www.cg.gov.ma/fictif/programme-2021.pdf#page=12",
    );
    await expect(source).toHaveAttribute("target", "_blank");
    await expect(page.getByTestId("provenance")).toHaveText("Texte original");
  });

  test("metric progress: baseline, latest and target, each with a year and a source (FR-6)", async ({
    page,
  }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    const progress = page.getByTestId("progress");
    await expect(progress.getByRole("img")).toHaveAttribute(
      "aria-label",
      /62 % du chemin depuis 2021/,
    );
    const cells = progress.locator("dl > div");
    await expect(cells.nth(0)).toContainText("0");
    await expect(cells.nth(0)).toContainText("2021");
    await expect(cells.nth(0).getByRole("link")).toHaveAttribute(
      "href",
      "https://www.hcp.ma/fictif/emploi-2021.pdf",
    );
    await expect(cells.nth(1)).toContainText(`620${NNBSP}000`);
    await expect(cells.nth(1).getByRole("link")).toHaveAttribute(
      "href",
      "https://www.hcp.ma/fictif/emploi-2025.pdf",
    );
    await expect(cells.nth(2)).toContainText(`1${NNBSP}000${NNBSP}000`);
    await expect(cells.nth(2).getByRole("link")).toContainText("p. 12");
  });

  test("missing data shows the last known value, never a 0 (FR-8)", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-education");
    await expect(page.getByTestId("no-data")).toContainText("Données indisponibles");
    await expect(page.getByTestId("no-data")).toContainText(
      "Aucune valeur officielle n'a encore été publiée après 2021. Dernière valeur connue : 10,5 % (2021).",
    );
    await expect(page.getByTestId("progress").getByRole("img")).toHaveCount(0);
  });

  test("an editorial commitment never shows a target (FR-7)", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-sante");
    await expect(page.getByTestId("editorial")).toHaveText(
      "Engagement sans cible chiffrée : seul le statut est suivi.",
    );
    await expect(page.getByTestId("progress").getByRole("img")).toHaveCount(0);
  });

  test("a Wa3d translation is labelled and the original is one click away (FR-2)", async ({
    page,
  }) => {
    await page.goto("/fr/2021-2026/fictif-gouvernance");
    await expect(page.getByTestId("provenance")).toHaveText("Traduction Wa3d");
    await page.getByText("Voir le texte original").click();
    await expect(page.getByTestId("original-quote")).toHaveText(
      "«نص وهمي أصلي: سيتم إصلاح الإدارة.»",
    );
    await expect(page.getByTestId("original-quote")).toHaveAttribute("dir", "rtl");
  });

  test("the Arabic page is right-to-left and labels an official translation", async ({ page }) => {
    await page.goto("/ar/2021-2026/fictif-emploi");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("status")).toHaveText("منجز جزئيا");
    await expect(page.getByTestId("provenance")).toHaveText("ترجمة رسمية");
    await expect(page.getByTestId("deadline")).toHaveText("31/12/2025 (انقضى)");
  });

  test("Arabic: the mandate range, French source names and the citation URL stay left to right (Story 2.8)", async ({
    page,
  }) => {
    await page.goto("/ar/2021-2026/fictif-emploi");
    const crumb = page.getByRole("navigation", { name: "مسار التنقل" }).getByRole("link").first();
    await expect(crumb.locator('bdi[dir="ltr"]')).toHaveText("2021-2026");
    await expect(page.locator("header").locator('bdi[dir="ltr"]').first()).toHaveText("2021-2026");
    await expect(page.locator("section[aria-labelledby=h-promised] a bdi").first()).toHaveText(
      "Programme gouvernemental fictif 2021-2026",
    );
    await expect(page.getByTestId("citation").locator('bdi[dir="ltr"]')).toHaveText(
      /^https:\/\/.+\/ar\/2021-2026\/fictif-emploi$/,
    );
  });

  test("French guillemets are bound to their words by no-break spaces", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    const quote = await page.getByTestId("quote").textContent();
    expect(quote).toMatch(/^« Texte fictif .* »$/);
    const citation = await page.getByTestId("citation").textContent();
    expect(citation).toContain("Wa3d.ma, « ");
  });

  test("the language toggle stays on the same commitment", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    await page.getByRole("link", { name: "Version arabe" }).click();
    await expect(page).toHaveURL(/\/ar\/2021-2026\/fictif-emploi$/);
  });

  for (const path of ["/fr/2021-2026/inexistant", "/fr/2026-2031/fictif-emploi"]) {
    test(`${path} does not exist`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }
});

test.describe("commitment timeline, citation and corrections (US-3, US-8, US-9)", () => {
  test("the timeline is newest first, each entry with an official source", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    const entries = page.getByTestId("timeline").locator("li");
    await expect(entries).toHaveCount(2);
    await expect(entries.nth(0)).toContainText("10/03/2026 · statut actuel");
    await expect(entries.nth(0)).toContainText("Partiellement réalisé");
    await expect(entries.nth(1)).toContainText("02/02/2022");
    await expect(
      entries.nth(0).getByRole("link", { name: /HCP, note fictive emploi-2025/ }),
    ).toHaveAttribute("href", "https://www.hcp.ma/fictif/emploi-2025.pdf");
  });

  test("press links are visibly secondary", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    const pointers = page.getByTestId("pointers");
    await expect(pointers).toContainText("Presse, pour information :");
    const link = pointers.getByRole("link", { name: /Presse fictive/ });
    await expect(link).toHaveCSS("text-decoration-style", "dotted");
  });

  test("a commitment without evidence says so", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-economie");
    await expect(page.getByTestId("timeline-empty")).toHaveText(
      "Aucun acte officiel relevé à ce jour.",
    );
  });

  test("notes are text: markup in the data is shown, never executed (ADR-8)", async ({ page }) => {
    let dialog = false;
    page.on("dialog", async (d) => {
      dialog = true;
      await d.dismiss();
    });
    await page.goto("/fr/2021-2026/fictif-autre");
    await expect(page.getByTestId("timeline")).toContainText("<script>alert(1)</script>");
    await expect(page.getByTestId("timeline").locator("script")).toHaveCount(0);
    await expect(page.getByTestId("timeline").locator("li p.my-1")).toHaveCount(2);
    expect(dialog).toBe(false);
  });

  test("the citation carries the permanent URL", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    await expect(page.getByTestId("citation")).toHaveText(
      "Wa3d.ma, « Création fictive d'un million d'emplois nets », statut au 15/09/2026, https://wa3d-ma.vercel.app/fr/2021-2026/fictif-emploi",
    );
  });

  test("the correction link opens the prefilled public issue form", async ({ page }) => {
    await page.goto("/fr/2021-2026/fictif-emploi");
    const report = page.getByRole("link", { name: /Signaler une erreur sur cet engagement/ });
    const href = (await report.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/github\.com\/rhorba\/wa3d-ma\/issues\/new\?/);
    const params = new URL(href).searchParams;
    expect(params.get("template")).toBe("correction.yml");
    expect(params.get("commitment")).toBe("fictif-emploi");
    await expect(
      page.getByText("Le signalement est public et nécessite un compte GitHub."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Tous les engagements Emploi/ })).toHaveAttribute(
      "href",
      "/fr/2021-2026?theme=employment",
    );
  });
});
