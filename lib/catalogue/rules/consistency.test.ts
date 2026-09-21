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
import type { Commitment, IndicatorValue, Status, Target } from "../schema";
import { validateCatalogue, type CatalogueInput } from "../validate";

const rulesOf = (input: CatalogueInput) =>
  validateCatalogue(input).issues.map((issue) => issue.rule);
const withCommitment = (value: Commitment) =>
  catalogueInput({ commitments: [commitmentFile(value)] });

describe("V-8 verification dates", () => {
  it("rejects lastVerified before the latest evidence", () => {
    const value = commitment({
      evidence: [evidence({ date: "2025-01-10" })],
      lastVerified: "2025-01-09",
    });
    expect(rulesOf(withCommitment(value))).toEqual(["V-8"]);
  });

  it("accepts lastVerified on the day of the latest evidence", () => {
    const value = commitment({
      evidence: [evidence({ date: "2025-01-10" })],
      lastVerified: "2025-01-10",
    });
    expect(rulesOf(withCommitment(value))).toEqual([]);
  });

  it("rejects evidence dated before the mandate started (2021-10-07)", () => {
    const value = commitment({ evidence: [evidence({ date: "2021-10-06" })] });
    expect(rulesOf(withCommitment(value))).toEqual(["V-8"]);
    const onFirstDay = commitment({ evidence: [evidence({ date: "2021-10-07" })] });
    expect(rulesOf(withCommitment(onFirstDay))).toEqual([]);
  });
});

describe("V-9 status against the deadline (Test Strategy §3.1 boundary table, deadline 2026-09-23)", () => {
  const at = (date: string, status: Status) =>
    commitment({ evidence: [evidence({ date, status })], lastVerified: date });
  // The builder's "today" is 2026-09-21; move it so post-deadline dates are not "future" (V-6).
  const check = (date: string, status: Status) =>
    rulesOf({ ...withCommitment(at(date, status)), today: "2026-12-31" });

  it.each([
    ["2026-09-22", "not_started", true],
    ["2026-09-22", "in_progress", true],
    ["2026-09-22", "partial", false],
    ["2026-09-22", "not_achieved", false],
    ["2026-09-22", "achieved", true],
    ["2026-09-22", "abandoned", true],
    ["2026-09-23", "not_started", false],
    ["2026-09-23", "in_progress", false],
    ["2026-09-23", "partial", true],
    ["2026-09-23", "not_achieved", true],
    ["2026-09-23", "achieved", true],
    ["2026-09-23", "abandoned", true],
    ["2026-09-24", "in_progress", false],
    ["2026-09-24", "partial", true],
  ] as const)("%s %s → valid: %s", (date, status, valid) => {
    expect(check(date, status)).toEqual(valid ? [] : ["V-9"]);
  });
});

describe("V-11 targets", () => {
  const withTarget = (overrides: Partial<Target>) =>
    commitment({
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 10, year: 2021, source: source() },
        value: 20,
        direction: "increase",
        ...overrides,
      },
    });

  it("accepts a known indicator with a consistent direction, both ways", () => {
    expect(rulesOf(withCommitment(withTarget({})))).toEqual([]);
    expect(rulesOf(withCommitment(withTarget({ value: 5, direction: "decrease" })))).toEqual([]);
  });

  it("rejects an unknown indicator", () => {
    const issues = validateCatalogue(withCommitment(withTarget({ indicatorId: "inconnu" }))).issues;
    expect(issues.map((issue) => issue.rule)).toEqual(["V-11"]);
    expect(issues[0]?.message).toMatch(/"inconnu" has no data\/indicators file/);
  });

  it.each([
    ["increase with a lower target", { value: 5, direction: "increase" }],
    ["decrease with a higher target", { value: 20, direction: "decrease" }],
    ["a target equal to the baseline", { value: 10, direction: "increase" }],
  ] as const)("rejects %s", (_label, overrides) => {
    expect(rulesOf(withCommitment(withTarget(overrides)))).toEqual(["V-11"]);
  });

  it("ignores editorial commitments (no target)", () => {
    expect(rulesOf(withCommitment(commitment()))).toEqual([]);
  });
});

describe("V-12 indicator order", () => {
  const withValues = (...points: [number, IndicatorValue["period"]][]) =>
    catalogueInput({
      indicators: [
        indicatorFile(
          indicator({
            values: points.map(([year, period]) => ({ year, period, value: 1, source: source() })),
          }),
        ),
      ],
    });

  it("accepts years, quarters and months in order, with the annual value last", () => {
    expect(
      rulesOf(withValues([2023, "Y"], [2024, "Q1"], [2024, "M05"], [2024, "Q4"], [2024, "Y"])),
    ).toEqual([]);
  });

  it.each([
    [
      "a duplicate year",
      [
        [2024, "Y"],
        [2024, "Y"],
      ],
    ],
    [
      "years out of order",
      [
        [2025, "Y"],
        [2024, "Y"],
      ],
    ],
    [
      "a quarter after the annual value",
      [
        [2024, "Y"],
        [2024, "Q2"],
      ],
    ],
    [
      "Q4 and M12 in the same year (same period end)",
      [
        [2024, "Q4"],
        [2024, "M12"],
      ],
    ],
  ] as const)("rejects %s", (_label, points) => {
    expect(
      rulesOf(withValues(...(points as unknown as [number, IndicatorValue["period"]][]))),
    ).toEqual(["V-12"]);
  });
});
