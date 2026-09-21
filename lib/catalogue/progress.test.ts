import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { indicator, source } from "@/tests/builders";
import { progress } from "./progress";
import type { Target } from "./schema";

function target(overrides: Partial<Target> = {}): Target {
  return {
    indicatorId: "indicateur-fictif",
    baseline: { value: 0, year: 2021, source: source() },
    value: 1_000_000,
    direction: "increase",
    ...overrides,
  };
}

const values = (...points: [year: number, value: number][]) =>
  indicator({
    values: points.map(([year, value]) => ({
      year,
      period: "Y" as const,
      value,
      source: source(),
    })),
  });

describe("progress", () => {
  it("measures the distance covered towards an increase target", () => {
    const result = progress(target(), values([2021, 0], [2025, 620_000]));
    expect(result?.ratio).toBeCloseTo(0.62);
    expect(result?.latest.year).toBe(2025);
  });

  it("measures a decrease target the same way (e.g. unemployment 12% → 9%)", () => {
    const unemployment = target({
      baseline: { value: 12, year: 2021, source: source() },
      value: 9,
      direction: "decrease",
    });
    expect(progress(unemployment, values([2021, 12], [2024, 10.5]))?.ratio).toBeCloseTo(0.5);
  });

  it("uses the latest value after the baseline year, not the first", () => {
    const result = progress(target(), values([2022, 100_000], [2023, 300_000], [2025, 620_000]));
    expect(result?.latest.value).toBe(620_000);
  });

  it("clamps at the target and at the baseline", () => {
    expect(progress(target(), values([2025, 1_200_000]))?.ratio).toBe(1);
    expect(progress(target(), values([2025, -50_000]))?.ratio).toBe(0);
  });

  it("returns null when there is no value after the baseline year (FR-8: Données indisponibles)", () => {
    expect(progress(target(), values([2020, 5], [2021, 0]))).toBeNull();
  });

  it("returns null rather than NaN when baseline equals target", () => {
    const flat = target({ value: 0 });
    expect(progress(flat, values([2025, 10]))).toBeNull();
  });

  const finite = fc.double({ min: -1e9, max: 1e9, noNaN: true, noDefaultInfinity: true });

  it("property: the ratio is always within [0, 1] or null, never NaN", () => {
    fc.assert(
      fc.property(finite, finite, finite, (baseline, goal, latest) => {
        const result = progress(
          target({ baseline: { value: baseline, year: 2021, source: source() }, value: goal }),
          values([2025, latest]),
        );
        return result === null || (result.ratio >= 0 && result.ratio <= 1);
      }),
    );
  });

  it("property: a better latest value never lowers the ratio (both directions)", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        finite,
        finite,
        fc.boolean(),
        (gap, a, b, increase) => {
          const baseline = 100;
          const goal = increase ? baseline + gap : baseline - gap;
          const t = target({
            baseline: { value: baseline, year: 2021, source: source() },
            value: goal,
            direction: increase ? "increase" : "decrease",
          });
          const [worse, better] = increase
            ? [Math.min(a, b), Math.max(a, b)]
            : [Math.max(a, b), Math.min(a, b)];
          const r1 = progress(t, values([2025, worse]))!.ratio;
          const r2 = progress(t, values([2025, better]))!.ratio;
          return r2 >= r1;
        },
      ),
    );
  });
});
