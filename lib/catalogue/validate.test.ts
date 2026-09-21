import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  catalogueInput,
  commitment,
  commitmentFile,
  evidence,
  indicator,
  indicatorFile,
  source,
} from "@/tests/builders";
import type { Commitment } from "./schema";
import { hasErrors, todayInCasablanca, validateCatalogue, type CatalogueInput } from "./validate";

// These tests are about errors; warnings (V-13…V-15) have their own tests.
const rulesOf = (input: CatalogueInput) =>
  validateCatalogue(input)
    .issues.filter((issue) => issue.severity === "error")
    .map((issue) => issue.rule);
const withCommitments = (...values: Commitment[]) =>
  catalogueInput({ commitments: values.map((value) => commitmentFile(value)) });

describe("validateCatalogue: the fictional builder catalogue", () => {
  it("is valid and returns the parsed entities", () => {
    const result = validateCatalogue(catalogueInput());
    expect(result.issues).toEqual([]);
    expect(result.commitments).toHaveLength(1);
    expect(result.indicators).toHaveLength(1);
    expect(hasErrors(result.issues)).toBe(false);
  });
});

describe("V-1 schema", () => {
  it("reports each schema problem with its path and excludes the file from other rules", () => {
    const broken = { ...commitment(), id: "Pas-Kebab", evidence: [{ date: "2026-02-30" }] };
    const result = validateCatalogue(
      catalogueInput({ commitments: [{ path: "promises/2021-2026/x.json", data: broken }] }),
    );
    expect(new Set(result.issues.map((issue) => issue.rule))).toEqual(new Set(["V-1"]));
    expect(result.issues.map((issue) => issue.message).join("\n")).toMatch(/^id: /m);
    expect(result.commitments).toEqual([]);
    expect(hasErrors(result.issues)).toBe(true);
  });

  it("reports a root-level problem for non-object data", () => {
    const result = validateCatalogue(
      catalogueInput({ indicators: [{ path: "indicators/x.json", data: 42 }] }),
    );
    expect(result.issues[0]).toMatchObject({
      rule: "V-1",
      message: expect.stringMatching(/^\(root\): /),
    });
  });
});

describe("V-2 file location", () => {
  it("rejects a commitment whose file name differs from its id", () => {
    const file = commitmentFile(commitment(), "promises/2021-2026/autre-nom.json");
    expect(rulesOf(catalogueInput({ commitments: [file] }))).toEqual(["V-2"]);
  });

  it("rejects a commitment in another mandate's folder", () => {
    const file = commitmentFile(commitment(), "promises/2026-2031/engagement-fictif-a.json");
    expect(rulesOf(catalogueInput({ commitments: [file] }))).toEqual(["V-2"]);
  });

  it("accepts Windows path separators", () => {
    const file = commitmentFile(commitment(), "promises\\2021-2026\\engagement-fictif-a.json");
    expect(rulesOf(catalogueInput({ commitments: [file] }))).toEqual([]);
  });

  it("rejects a misnamed indicator file", () => {
    const file = indicatorFile(indicator(), "indicators/autre.json");
    expect(rulesOf(catalogueInput({ indicators: [file] }))).toEqual(["V-2"]);
  });
});

describe("V-3 unique ids", () => {
  it("rejects the same id in two mandates", () => {
    const a = commitment();
    const b = commitment({ mandate: "2026-2031", deadline: "2031-10-01", evidence: [] });
    const issues = validateCatalogue(withCommitments(a, b)).issues;
    expect(issues.map((issue) => issue.rule)).toEqual(["V-3"]);
    expect(issues[0]?.message).toMatch(
      /already used by promises\/2021-2026\/engagement-fictif-a\.json/,
    );
  });

  it("rejects duplicate indicator ids", () => {
    const input = catalogueInput({
      indicators: [indicatorFile(indicator()), indicatorFile(indicator())],
    });
    expect(rulesOf(input)).toEqual(["V-3"]);
  });
});

describe("V-4 quote provenance", () => {
  it.each([
    ["no original", "wa3d_translation", "official_translation"],
    ["two originals", "original", "original"],
  ] as const)("rejects %s", (_label, fr, ar) => {
    const value = commitment({
      quote: { fr: { text: "Texte", provenance: fr }, ar: { text: "نص", provenance: ar } },
    });
    expect(rulesOf(withCommitments(value))).toEqual(["V-4"]);
  });
});

describe("V-5 evidence order", () => {
  it("rejects two entries on the same date", () => {
    const value = commitment({
      evidence: [
        evidence({ date: "2024-03-14" }),
        evidence({ date: "2024-03-14", status: "achieved" }),
      ],
    });
    expect(rulesOf(withCommitments(value))).toEqual(["V-5"]);
  });

  it("rejects entries out of order", () => {
    const value = commitment({
      evidence: [evidence({ date: "2024-03-14" }), evidence({ date: "2022-02-02" })],
    });
    expect(rulesOf(withCommitments(value))).toEqual(["V-5"]);
  });
});

describe("V-6 no future dates (Africa/Casablanca)", () => {
  const origin = commitment().origin;

  it.each([
    [
      "an evidence date",
      commitment({ evidence: [evidence({ date: "2026-10-01" })], lastVerified: "2026-10-01" }),
    ],
    ["lastVerified", commitment({ lastVerified: "2026-10-01" })],
    ["a source's accessed date", commitment({ origin: { ...origin, accessed: "2026-10-01" } })],
    ["a source's published date", commitment({ origin: { ...origin, published: "2027-01-01" } })],
  ])("rejects %s after today", (_label, value) => {
    expect(rulesOf(withCommitments(value))).toContain("V-6");
  });

  it("checks the baseline source and indicator sources too", () => {
    const metric = commitment({
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 0, year: 2021, source: source({ accessed: "2026-12-01" }) },
        value: 10,
        direction: "increase",
      },
    });
    expect(rulesOf(withCommitments(metric))).toEqual(["V-6"]);
    const futureIndicator = indicator({
      values: [{ year: 2025, period: "Y", value: 1, source: source({ published: "2026-10-01" }) }],
    });
    expect(rulesOf(catalogueInput({ indicators: [indicatorFile(futureIndicator)] }))).toEqual([
      "V-6",
    ]);
  });

  it("accepts today itself and exempts the deadline", () => {
    const value = commitment({ lastVerified: "2026-09-30", deadline: "2031-10-01" });
    expect(rulesOf(withCommitments(value))).toEqual([]);
  });

  it("computes today in Morocco: 23:30 UTC is already the next day in Casablanca", () => {
    expect(todayInCasablanca(new Date("2026-09-21T23:30:00Z"))).toBe("2026-09-22");
    expect(todayInCasablanca(new Date("2026-09-21T10:00:00Z"))).toBe("2026-09-21");
  });

  it("defaults to the current time", () => {
    expect(todayInCasablanca()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("robustness", () => {
  it("sorts issues by file then rule number", () => {
    const late = commitment({ id: "b-fictif", lastVerified: "2026-12-01" });
    const misplaced = commitment({ id: "a-fictif" });
    const input = catalogueInput({
      commitments: [commitmentFile(late), commitmentFile(misplaced, "promises/2021-2026/zz.json")],
    });
    expect(validateCatalogue(input).issues.map((i) => `${i.file} ${i.rule}`)).toEqual([
      "promises/2021-2026/b-fictif.json V-6",
      "promises/2021-2026/zz.json V-2",
    ]);
  });

  it("property: never throws on arbitrary JSON, it returns issues", () => {
    fc.assert(
      fc.property(
        fc.array(fc.jsonValue(), { maxLength: 5 }),
        fc.array(fc.jsonValue(), { maxLength: 3 }),
        (a, b) => {
          const input = catalogueInput({
            commitments: a.map((data, i) => ({ path: `promises/2021-2026/f${i}.json`, data })),
            indicators: b.map((data, i) => ({ path: `indicators/f${i}.json`, data })),
          });
          return Array.isArray(validateCatalogue(input).issues);
        },
      ),
      { numRuns: 200 },
    );
  });
});
