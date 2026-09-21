import { describe, expect, it } from "vitest";
import { commitment, evidence, indicator, source } from "@/tests/builders";
import { Commitment, Indicator, STATUSES, THEMES } from "./schema";

function issuesOf(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  return (result.error?.issues ?? []).map((issue) => `${issue.path.join(".")}: ${issue.message}`);
}

describe("Commitment schema (V-1)", () => {
  it("accepts the fictional builder, metric and editorial", () => {
    expect(Commitment.safeParse(commitment()).success).toBe(true);
    const metric = commitment({
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 0, year: 2021, source: source() },
        value: 1_000_000,
        direction: "increase",
      },
    });
    expect(Commitment.safeParse(metric).success).toBe(true);
  });

  it("accepts an empty evidence list (derived status not_started)", () => {
    expect(Commitment.safeParse(commitment({ evidence: [] })).success).toBe(true);
  });

  it("keeps the fixed status and theme order used by the UI", () => {
    expect(STATUSES).toEqual([
      "not_started",
      "in_progress",
      "achieved",
      "partial",
      "not_achieved",
      "abandoned",
    ]);
    expect(THEMES).toHaveLength(9);
  });

  it("rejects unknown keys anywhere (typo protection)", () => {
    const withTypo = { ...commitment(), statut: "achieved" };
    expect(issuesOf(Commitment.safeParse(withTypo)).join()).toMatch(/Unrecognized key/);
    const nestedTypo = commitment({ origin: { ...commitment().origin, pagee: 3 } as never });
    expect(Commitment.safeParse(nestedTypo).success).toBe(false);
  });

  it.each([
    ["http", "http://www.hcp.ma/x.pdf"],
    ["javascript", "javascript:alert(1)"],
    ["data", "data:text/html,<script>alert(1)</script>"],
    ["relative", "/x.pdf"],
  ])("rejects a %s source URL", (_label, url) => {
    const bad = commitment({ evidence: [evidence({ source: source({ url }) })] });
    expect(issuesOf(Commitment.safeParse(bad)).join()).toMatch(/evidence\.0\.source\.url/);
  });

  it("rejects non-NFC text (decomposed é)", () => {
    const decomposed = `Cre${String.fromCodePoint(0x301)}ation`; // e + combining acute accent
    const bad = commitment({ title: { fr: decomposed, ar: "التزام" } });
    expect(issuesOf(Commitment.safeParse(bad)).join()).toMatch(/NFC/);
    expect(
      Commitment.safeParse(commitment({ title: { fr: decomposed.normalize("NFC"), ar: "التزام" } }))
        .success,
    ).toBe(true);
  });

  it("rejects blank text after trimming", () => {
    const bad = commitment({ evidence: [evidence({ note: { fr: "   ", ar: "واقعة" } })] });
    expect(Commitment.safeParse(bad).success).toBe(false);
  });

  it("limits titles to 90 characters", () => {
    expect(
      Commitment.safeParse(commitment({ title: { fr: "a".repeat(90), ar: "ب" } })).success,
    ).toBe(true);
    expect(
      Commitment.safeParse(commitment({ title: { fr: "a".repeat(91), ar: "ب" } })).success,
    ).toBe(false);
  });

  it.each(["2026-02-30", "2026-13-01", "2026-9-01", "01/09/2026", "2025-02-29"])(
    "rejects the impossible or malformed date %s",
    (date) => {
      expect(Commitment.safeParse(commitment({ deadline: date })).success).toBe(false);
    },
  );

  it("accepts 29 February in a leap year", () => {
    expect(Commitment.safeParse(commitment({ deadline: "2028-02-29" })).success).toBe(true);
  });

  it.each(["Emploi", "emploi--x", "-x", "x-", "emploi_x", "../x", "a".repeat(61)])(
    "rejects the id %j",
    (id) => {
      expect(Commitment.safeParse(commitment({ id })).success).toBe(false);
    },
  );

  it("requires a positive integer page when present", () => {
    const withPage = (page: number) => commitment({ origin: { ...commitment().origin, page } });
    expect(Commitment.safeParse(withPage(0)).success).toBe(false);
    expect(Commitment.safeParse(withPage(1.5)).success).toBe(false);
  });

  it("requires a source on the target baseline (DB v1.1, FR-6)", () => {
    const noBaselineSource = commitment({
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 0, year: 2021 },
        value: 10,
        direction: "increase",
      } as never,
    });
    expect(issuesOf(Commitment.safeParse(noBaselineSource)).join()).toMatch(
      /target\.baseline\.source/,
    );
  });

  it("allows at most three press pointers per evidence entry", () => {
    const pointer = { name: "Presse fictive", url: "https://presse.example/a" };
    const four = commitment({
      evidence: [evidence({ pointers: [pointer, pointer, pointer, pointer] })],
    });
    expect(Commitment.safeParse(four).success).toBe(false);
  });

  it("only knows schema version 1", () => {
    expect(Commitment.safeParse({ ...commitment(), schemaVersion: 2 }).success).toBe(false);
  });
});

describe("Indicator schema (V-1)", () => {
  it("accepts the builder and defaults the period to Y", () => {
    const parsed = Indicator.parse(
      indicator({ values: [{ year: 2024, value: 3, source: source() }] as never }),
    );
    expect(parsed.values[0]?.period).toBe("Y");
  });

  it.each(["Q5", "M13", "M1", "year"])("rejects the period %s", (period) => {
    const bad = indicator({ values: [{ year: 2024, period, value: 3, source: source() }] });
    expect(Indicator.safeParse(bad).success).toBe(false);
  });

  it("requires at least one value and a known unit", () => {
    expect(Indicator.safeParse(indicator({ values: [] })).success).toBe(false);
    expect(Indicator.safeParse({ ...indicator(), unit: "dollars" }).success).toBe(false);
  });
});
