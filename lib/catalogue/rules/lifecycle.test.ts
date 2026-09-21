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
import { daysBetween, staleCommitments } from "../freshness";
import type { Commitment } from "../schema";
import { hasErrors, validateCatalogue, type CatalogueInput } from "../validate";

const issuesOf = (input: CatalogueInput) =>
  validateCatalogue(input).issues.map((issue) => `${issue.rule}:${issue.severity}`);
const one = (value: Commitment, today = "2026-09-30") =>
  catalogueInput({ commitments: [commitmentFile(value)], today });

describe("freshness helpers", () => {
  it("counts whole days across months and years", () => {
    expect(daysBetween("2026-09-01", "2026-09-30")).toBe(29);
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
    expect(daysBetween("2026-03-01", "2026-03-01")).toBe(0);
  });

  it("lists stale commitments oldest first, with 45 days as the limit", () => {
    const at = (lastVerified: string) => ({ lastVerified });
    const list = [at("2026-08-15"), at("2026-08-16"), at("2026-07-01")];
    expect(staleCommitments(list, "2026-09-30")).toEqual([at("2026-07-01"), at("2026-08-15")]);
    expect(staleCommitments(list, "2026-09-30", 100)).toEqual([]);
  });
});

describe("V-13 freshness (warning)", () => {
  it("warns at 46 days but not at 45 days", () => {
    const at = (lastVerified: string) =>
      commitment({ lastVerified, evidence: [evidence({ date: "2024-03-14" })] });
    expect(issuesOf(one(at("2026-08-16")))).toEqual([]);
    expect(issuesOf(one(at("2026-08-15")))).toEqual(["V-13:warning"]);
  });

  it("never counts as an error", () => {
    const stale = commitment({
      lastVerified: "2025-01-01",
      evidence: [evidence({ date: "2024-03-14" })],
    });
    expect(hasErrors(validateCatalogue(one(stale)).issues)).toBe(false);
  });
});

describe("V-14 overdue (warning)", () => {
  it.each(["in_progress", "not_started"] as const)(
    "warns when the deadline has passed and the status is still %s",
    (status) => {
      const value = commitment({ evidence: [evidence({ date: "2024-03-14", status })] });
      expect(issuesOf(one(value))).toEqual(["V-14:warning"]);
    },
  );

  it("warns for a commitment with no evidence after its deadline", () => {
    expect(issuesOf(one(commitment({ evidence: [] })))).toEqual(["V-14:warning"]);
  });

  it("does not warn on the deadline day or for a settled status", () => {
    const pending = commitment({
      evidence: [evidence({ date: "2024-03-14", status: "in_progress" })],
    });
    expect(issuesOf(one(pending, "2026-09-23"))).not.toContain("V-14:warning");
    expect(issuesOf(one(commitment()))).toEqual([]);
  });
});

describe("V-15 missing indicator data (warning)", () => {
  const metric = commitment({
    target: {
      indicatorId: "indicateur-fictif",
      baseline: { value: 0, year: 2025, source: source() },
      value: 10,
      direction: "increase",
    },
  });

  it("warns when the indicator has no value after the baseline year", () => {
    // The builder indicator has values for 2021 and 2025 only.
    const input = catalogueInput({ commitments: [commitmentFile(metric)] });
    expect(issuesOf(input)).toEqual(["V-15:warning"]);
  });

  it("does not warn once a later value exists", () => {
    const withLater = indicator({
      values: [
        { year: 2025, period: "Y", value: 1, source: source() },
        { year: 2026, period: "Q2", value: 4, source: source() },
      ],
    });
    const input = catalogueInput({
      commitments: [commitmentFile(metric)],
      indicators: [indicatorFile(withLater)],
    });
    expect(issuesOf(input)).toEqual([]);
  });

  it("leaves an unknown indicator to V-11", () => {
    const input = catalogueInput({ commitments: [commitmentFile(metric)], indicators: [] });
    expect(issuesOf(input)).toEqual(["V-11:error"]);
  });
});

describe("V-16 embargo (error)", () => {
  it("rejects 2021-2026 files the day before the embargo lifts, even invalid ones", () => {
    const input = catalogueInput({
      today: "2026-09-23",
      commitments: [
        commitmentFile(commitment({ lastVerified: "2026-09-20" })),
        { path: "promises\\2021-2026\\casse.json", data: {} },
      ],
    });
    const rules = validateCatalogue(input).issues.map((issue) => issue.rule);
    expect(rules.filter((rule) => rule === "V-16")).toHaveLength(2);
    expect(hasErrors(validateCatalogue(input).issues)).toBe(true);
  });

  it("allows them from 2026-09-24", () => {
    const value = commitment({ lastVerified: "2026-09-20" });
    expect(issuesOf(one(value, "2026-09-24"))).not.toContain("V-16:error");
  });

  it("never blocks the 2026-2031 mandate", () => {
    const current = commitment({
      mandate: "2026-2031",
      deadline: "2031-10-01",
      evidence: [],
      lastVerified: "2026-09-20",
    });
    expect(issuesOf(one(current, "2026-09-23"))).toEqual([]);
  });
});
