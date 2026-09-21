import type { Indicator, IndicatorValue, Target } from "./schema";

export type Progress = {
  /** Share of the distance from baseline to target covered, clamped to [0, 1]. */
  ratio: number;
  /** The latest official value after the baseline year; shown with its year and source (FR-6). */
  latest: IndicatorValue;
};

// FR-6: baseline → latest official value → target. Returns null when the indicator has no value
// after the baseline year, so the UI shows "Données indisponibles" instead of a 0 (FR-8).
// Works for both directions: for a "decrease" target the denominator is negative too.
// The live value never changes the status (ADR-2); this only feeds the progress bar.
export function progress(target: Target, indicator: Pick<Indicator, "values">): Progress | null {
  // V-12 keeps values strictly ascending, so the last matching one is the latest.
  const latest = indicator.values.filter((value) => value.year > target.baseline.year).at(-1);
  if (!latest) return null;

  const distance = target.value - target.baseline.value;
  // V-11 guarantees a non-zero distance in a validated catalogue; never divide by zero anyway.
  if (distance === 0) return null;

  const ratio = (latest.value - target.baseline.value) / distance;
  return { ratio: Math.min(1, Math.max(0, ratio)), latest };
}
