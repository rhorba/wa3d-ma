import { describe, expect, it } from "vitest";
import { readCatalogue } from "./load";
import { worksheetMarkdown } from "./worksheet";

const { commitments, indicators } = readCatalogue({
  dataDir: "tests/fixtures/catalogue/valid",
  today: "2026-09-21",
});
const sheet = worksheetMarkdown("2021-2026", commitments, indicators, "2026-09-22");

describe("verification worksheet (Story 4.4)", () => {
  it("lists every commitment of the mandate, in programme order, and nothing else", () => {
    const headings = [...sheet.matchAll(/^## \d+\. (.+)$/gm)].map((m) => m[1]);
    expect(headings).toHaveLength(9);
    expect(headings[0]).toBe("Création fictive d'un million d'emplois nets");
    expect(sheet).not.toContain("fictif-mandat-suivant");
  });

  it("puts every quote, target, baseline and evidence entry on its own checkbox next to its source", () => {
    const emploi = sheet.slice(sheet.indexOf("## 1."), sheet.indexOf("## 2."));
    expect(emploi).toContain("statut affiché : **Partiellement réalisé**");
    expect(emploi).toContain(
      "Source du texte : [Programme gouvernemental fictif 2021-2026, p. 12](https://www.cg.gov.ma/fictif/programme-2021.pdf#page=12)",
    );
    expect(emploi).toContain("- [ ] Citation FR identique au document (texte original)");
    expect(emploi).toContain("- [ ] Citation AR identique au document (traduction officielle)");
    expect(emploi).toContain("- [ ] Cible 1000000 (hausse, indicateur `fictif-emplois-nets`)");
    expect(emploi).toContain("- [ ] Point de départ 0 en 2021");
    expect(emploi).toContain(
      "- [ ] 2022-02-02 · **En cours** · [Bulletin officiel fictif n° 7001]",
    );
    expect(emploi).toContain("  - AR : نشرت المندوبية الوهمية 620 000 منصب شغل صاف خلال الفترة.");
    expect(emploi).toContain("⚠️ pas d'archive");
  });

  it("flags editorial commitments and lists the indicator values used", () => {
    expect(sheet).toContain("- [ ] Sans cible chiffrée");
    expect(sheet).toContain("### `fictif-emplois-nets` · Emplois nets créés (fictif) (count)");
    expect(sheet).toContain("- [ ] 2025 = 620000 · [HCP, note fictive emploi-2025]");
  });

  it("counts the checks and ends with the sign-off", () => {
    const boxes = (sheet.match(/- \[ \]/g) ?? []).length;
    const announced = Number(/(\d+) point\(s\) à vérifier/.exec(sheet)?.[1]);
    expect(boxes).toBe(announced + 1);
    expect(sheet.trimEnd().endsWith("Nom : ____________________ · Date : ____________")).toBe(true);
  });

  it("shows publication dates, archive copies and sub-annual periods", () => {
    const source = {
      name: "HCP, note T2",
      url: "https://www.hcp.ma/note-t2.pdf",
      published: "2025-08-04",
      accessed: "2026-09-22",
      archiveUrl: "https://web.archive.org/web/2026/https://www.hcp.ma/note-t2.pdf",
    };
    const emploi = commitments.find((c) => c.id === "fictif-emploi");
    if (!emploi?.target) throw new Error("fixture changed");
    const archived = {
      ...emploi,
      target: { ...emploi.target, baseline: { ...emploi.target.baseline, source } },
    };
    const quarterly = {
      schemaVersion: 1 as const,
      id: "fictif-emplois-nets",
      name: { fr: "Emplois", ar: "مناصب" },
      unit: "count" as const,
      decimals: 0,
      values: [{ year: 2025, period: "Q2", value: 5, source }],
    };
    const out = worksheetMarkdown("2021-2026", [archived], [quarterly], "2026-09-22");
    expect(out).toContain(
      "[HCP, note T2](https://www.hcp.ma/note-t2.pdf), publié le 2025-08-04 · [archive](https://web.archive.org/web/2026/https://www.hcp.ma/note-t2.pdf)",
    );
    expect(out).toContain("- [ ] 2025 Q2 = 5 · [HCP, note T2]");
  });

  it("handles a mandate with no commitments and a missing indicator", () => {
    const empty = worksheetMarkdown("2026-2031", [], [], "2026-09-22");
    expect(empty).toContain("0 engagement(s) · 0 point(s)");
    expect(empty).toContain("Aucun indicateur utilisé.");
    const emploi = commitments.find((c) => c.id === "fictif-emploi");
    const orphan = worksheetMarkdown("2021-2026", emploi ? [emploi] : [], [], "2026-09-22");
    expect(orphan).toContain("⚠️ indicateur `fictif-emplois-nets` introuvable");
  });
});
