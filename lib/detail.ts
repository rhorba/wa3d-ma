import { progress } from "./catalogue/progress";
import type { Commitment, Indicator, IndicatorValue, Source } from "./catalogue/schema";

export type ProgressPanel =
  | { kind: "editorial" }
  | {
      kind: "no-data";
      baselineYear: number;
      lastKnown: IndicatorValue | undefined;
      indicator: Indicator | undefined;
    }
  | {
      kind: "metric";
      indicator: Indicator;
      ratio: number;
      direction: "increase" | "decrease";
      baseline: { value: number; year: number; source: Source };
      latest: IndicatorValue;
      target: { value: number; year: number };
    };

/**
 * FR-6: every number on the detail page comes with its year and source. FR-7: an editorial
 * commitment never gets a target. FR-8: missing data shows the last known value, never a 0.
 */
export function progressPanel(
  commitment: Commitment,
  indicators: ReadonlyMap<string, Indicator>,
): ProgressPanel {
  const target = commitment.target;
  if (!target) return { kind: "editorial" };
  const indicator = indicators.get(target.indicatorId);
  const result = indicator ? progress(target, indicator) : null;
  if (!indicator || !result) {
    return {
      kind: "no-data",
      baselineYear: target.baseline.year,
      lastKnown: indicator?.values.at(-1),
      indicator,
    };
  }
  return {
    kind: "metric",
    indicator,
    ratio: result.ratio,
    direction: target.direction,
    baseline: target.baseline,
    latest: result.latest,
    target: { value: target.value, year: Number(commitment.deadline.slice(0, 4)) },
  };
}

/** Opens a PDF at the cited page (UX Flow 3); other documents are linked as they are. */
export function withPage(url: string, page: number | undefined): string {
  if (!page || !/\.pdf($|[?#])/i.test(url) || url.includes("#")) return url;
  return `${url}#page=${page}`;
}
