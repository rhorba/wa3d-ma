import { describe, expect, it } from "vitest";
import { commitment, indicator, source } from "@/tests/builders";
import type { Target } from "./catalogue/schema";
import { progressPanel, withPage } from "./detail";

const target = (overrides: Partial<Target> = {}): Target => ({
  indicatorId: "indicateur-fictif",
  baseline: { value: 0, year: 2021, source: source() },
  value: 1_000_000,
  direction: "increase",
  ...overrides,
});
const indicators = new Map([["indicateur-fictif", indicator()]]);

describe("progressPanel", () => {
  it("is editorial without a target (FR-7)", () => {
    expect(progressPanel(commitment(), indicators)).toEqual({ kind: "editorial" });
  });

  it("gives baseline, latest and target with their years (FR-6)", () => {
    const panel = progressPanel(
      commitment({ target: target(), deadline: "2025-12-31" }),
      indicators,
    );
    expect(panel).toMatchObject({
      kind: "metric",
      ratio: 0.62,
      direction: "increase",
      baseline: { value: 0, year: 2021 },
      latest: { value: 620_000, year: 2025 },
      target: { value: 1_000_000, year: 2025 },
    });
  });

  it("shows the last known value when nothing was published after the baseline (FR-8)", () => {
    const panel = progressPanel(
      commitment({
        target: target({ baseline: { value: 620_000, year: 2025, source: source() } }),
      }),
      indicators,
    );
    expect(panel).toMatchObject({ kind: "no-data", baselineYear: 2025, lastKnown: { year: 2025 } });
  });

  it("handles an unknown indicator without inventing a value", () => {
    const panel = progressPanel(
      commitment({ target: target({ indicatorId: "inconnu" }) }),
      indicators,
    );
    expect(panel).toEqual({
      kind: "no-data",
      baselineYear: 2021,
      lastKnown: undefined,
      indicator: undefined,
    });
  });
});

describe("withPage", () => {
  it("opens a PDF at the cited page", () => {
    expect(withPage("https://www.cg.gov.ma/programme.pdf", 12)).toBe(
      "https://www.cg.gov.ma/programme.pdf#page=12",
    );
    expect(withPage("https://www.cg.gov.ma/doc.PDF?v=2", 3)).toBe(
      "https://www.cg.gov.ma/doc.PDF?v=2#page=3",
    );
  });

  it("leaves other links, links with a fragment and missing pages alone", () => {
    expect(withPage("https://www.hcp.ma/page", 12)).toBe("https://www.hcp.ma/page");
    expect(withPage("https://www.cg.gov.ma/p.pdf#x", 12)).toBe("https://www.cg.gov.ma/p.pdf#x");
    expect(withPage("https://www.cg.gov.ma/p.pdf", undefined)).toBe("https://www.cg.gov.ma/p.pdf");
  });
});
