import { describe, expect, it } from "vitest";
import { commitment, indicator, source } from "@/tests/builders";
import type { Target } from "./catalogue/schema";
import { groupByTheme, rowProgress } from "./list";

describe("groupByTheme", () => {
  it("keeps programme order inside each theme and orders themes by first mention", () => {
    const list = [
      commitment({ id: "a", theme: "health" }),
      commitment({ id: "b", theme: "employment" }),
      commitment({ id: "c", theme: "health" }),
    ];
    const groups = groupByTheme(list);
    expect(groups.map((g) => g.theme)).toEqual(["health", "employment"]);
    expect(groups[0]?.items.map((i) => [i.commitment.id, i.position])).toEqual([
      ["a", 0],
      ["c", 2],
    ]);
    expect(groups[1]?.items.map((i) => i.position)).toEqual([1]);
  });

  it("returns no groups for an empty mandate", () => {
    expect(groupByTheme([])).toEqual([]);
  });
});

describe("rowProgress", () => {
  const target = (overrides: Partial<Target> = {}): Target => ({
    indicatorId: "indicateur-fictif",
    baseline: { value: 0, year: 2021, source: source() },
    value: 1_000_000,
    direction: "increase",
    ...overrides,
  });
  const indicators = new Map([["indicateur-fictif", indicator()]]); // 2025 value: 620 000

  it("is editorial without a target (FR-7)", () => {
    expect(rowProgress(commitment(), indicators)).toEqual({ kind: "editorial" });
  });

  it("rounds the percentage down, so it never overstates progress", () => {
    const value = commitment({ target: target({ value: 1_000_001 }) });
    expect(rowProgress(value, indicators)).toEqual({ kind: "metric", percent: 61, reached: false });
    expect(rowProgress(commitment({ target: target() }), indicators)).toEqual({
      kind: "metric",
      percent: 62,
      reached: false,
    });
  });

  it("marks a reached target", () => {
    const value = commitment({ target: target({ value: 600_000 }) });
    expect(rowProgress(value, indicators)).toEqual({ kind: "metric", percent: 100, reached: true });
  });

  it("says data is unavailable rather than showing 0 (FR-8)", () => {
    const noLaterValue = commitment({
      target: target({ baseline: { value: 0, year: 2025, source: source() } }),
    });
    expect(rowProgress(noLaterValue, indicators)).toEqual({ kind: "no-data" });
    expect(
      rowProgress(commitment({ target: target({ indicatorId: "inconnu" }) }), indicators),
    ).toEqual({
      kind: "no-data",
    });
  });
});
