import { daysBetween, FRESHNESS_DAYS } from "../freshness";
import { currentStatus } from "../status";
import type { RuleContext } from "./types";

// ADR-3 / SEC-8: nothing from the 2021-2026 archive may exist on a pushed ref before the embargo lifts.
export const EMBARGO_LIFTS_ON = "2026-09-24";
const EMBARGOED_FOLDER = "promises/2021-2026/";

/** V-13 (warning): last verified more than 45 days ago (PRD G3). */
export function checkFreshness({ input, commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const age = daysBetween(value.lastVerified, input.today);
    if (age > FRESHNESS_DAYS) {
      report(
        "V-13",
        file,
        `last verified ${age} days ago (${value.lastVerified}); re-check it`,
        "warning",
      );
    }
  }
}

/** V-14 (warning): the deadline has passed but the status still says it is pending. */
export function checkOverdue({ input, commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const status = currentStatus(value);
    if (input.today > value.deadline && (status === "not_started" || status === "in_progress")) {
      report(
        "V-14",
        file,
        `deadline ${value.deadline} has passed and the status is still "${status}"; add an evidence entry`,
        "warning",
      );
    }
  }
}

/** V-15 (warning): a metric commitment whose indicator has no value after the baseline year (FR-8). */
export function checkMissingData({ commitments, indicators, report }: RuleContext): void {
  const byId = new Map(indicators.map(({ value }) => [value.id, value]));
  for (const { file, value } of commitments) {
    const target = value.target;
    const indicator = target && byId.get(target.indicatorId);
    if (target && indicator && !indicator.values.some((v) => v.year > target.baseline.year)) {
      report(
        "V-15",
        file,
        `indicator "${indicator.id}" has no value after ${target.baseline.year}; the page will show "Données indisponibles"`,
        "warning",
      );
    }
  }
}

/** V-16 (error): 2021-2026 files present before the embargo lifts, valid or not (SEC-8). */
export function checkEmbargo({ input, report }: RuleContext): void {
  if (input.today >= EMBARGO_LIFTS_ON) return;
  for (const { path } of input.commitments) {
    if (path.replaceAll("\\", "/").startsWith(EMBARGOED_FOLDER)) {
      report(
        "V-16",
        path,
        `2021-2026 data must not be committed before ${EMBARGO_LIFTS_ON} (ADR-3)`,
      );
    }
  }
}
