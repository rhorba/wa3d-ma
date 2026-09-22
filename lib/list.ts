import type { Commitment, Indicator, Theme } from "./catalogue/schema";
import { progress } from "./catalogue/progress";

export type ThemeGroup = { theme: Theme; items: { commitment: Commitment; position: number }[] };

/**
 * Groups commitments by theme for the no-JavaScript list (UX Flow 2). Input is already in
 * programme order; each item keeps its programme position so CSS can restore the flat order
 * once the filter island is active. Themes appear in the order the programme first mentions them.
 */
export function groupByTheme(commitments: readonly Commitment[]): ThemeGroup[] {
  const groups = new Map<Theme, ThemeGroup>();
  commitments.forEach((commitment, position) => {
    const group = groups.get(commitment.theme) ?? { theme: commitment.theme, items: [] };
    group.items.push({ commitment, position });
    groups.set(commitment.theme, group);
  });
  return [...groups.values()];
}

export type RowProgress =
  | { kind: "editorial" }
  | { kind: "no-data" }
  | { kind: "metric"; percent: number; reached: boolean };

/** What the list row shows under the status: never an invented target (FR-7), never a fake 0 (FR-8). */
export function rowProgress(
  commitment: Commitment,
  indicators: ReadonlyMap<string, Indicator>,
): RowProgress {
  if (!commitment.target) return { kind: "editorial" };
  const indicator = indicators.get(commitment.target.indicatorId);
  const result = indicator ? progress(commitment.target, indicator) : null;
  if (!result) return { kind: "no-data" };
  const percent = Math.floor(result.ratio * 100);
  return { kind: "metric", percent, reached: result.ratio >= 1 };
}
