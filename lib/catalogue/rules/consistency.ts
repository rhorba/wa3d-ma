import { MANDATE_START, type IndicatorValue, type Status } from "../schema";
import type { RuleContext } from "./types";

/** V-8: lastVerified is not older than the latest evidence, and no evidence predates the mandate. */
export function checkVerificationDates({ commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const latest = value.evidence.at(-1);
    if (latest && value.lastVerified < latest.date) {
      report(
        "V-8",
        file,
        `lastVerified (${value.lastVerified}) is before the latest evidence (${latest.date})`,
      );
    }
    const start = MANDATE_START[value.mandate];
    value.evidence.forEach((entry, index) => {
      if (entry.date < start) {
        report(
          "V-8",
          file,
          `evidence[${index}] (${entry.date}) predates the ${value.mandate} mandate (${start})`,
        );
      }
    });
  }
}

// PRD §5.3: in progress / not started only make sense before the deadline; partial and
// not achieved can only be judged once it has passed. Achieved and abandoned apply any time.
const BEFORE_DEADLINE: readonly Status[] = ["not_started", "in_progress"];
const ON_OR_AFTER_DEADLINE: readonly Status[] = ["partial", "not_achieved"];

/** V-9: every evidence status respects its own definition relative to the deadline. */
export function checkStatusAgainstDeadline({ commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    value.evidence.forEach((entry, index) => {
      if (BEFORE_DEADLINE.includes(entry.status) && entry.date >= value.deadline) {
        report(
          "V-9",
          file,
          `evidence[${index}] is "${entry.status}" on ${entry.date}, but the deadline (${value.deadline}) has passed`,
        );
      }
      if (ON_OR_AFTER_DEADLINE.includes(entry.status) && entry.date < value.deadline) {
        report(
          "V-9",
          file,
          `evidence[${index}] is "${entry.status}" on ${entry.date}, before the deadline (${value.deadline})`,
        );
      }
    });
  }
}

/** V-11: the target's indicator exists and its direction agrees with baseline and target values. */
export function checkTargets({ commitments, indicators, report }: RuleContext): void {
  const known = new Set(indicators.map(({ value }) => value.id));
  for (const { file, value } of commitments) {
    const target = value.target;
    if (!target) continue;
    if (!known.has(target.indicatorId)) {
      report(
        "V-11",
        file,
        `target.indicatorId "${target.indicatorId}" has no data/indicators file`,
      );
    }
    const agrees =
      target.direction === "increase"
        ? target.value > target.baseline.value
        : target.value < target.baseline.value;
    if (!agrees) {
      report(
        "V-11",
        file,
        `target.direction "${target.direction}" contradicts baseline ${target.baseline.value} → target ${target.value}`,
      );
    }
  }
}

/** Position of a value within its year: months 1-12, quarters at their last month, annual last. */
function periodRank(period: IndicatorValue["period"]): number {
  if (period === "Y") return 13;
  const n = Number(period.slice(1));
  return period.startsWith("Q") ? n * 3 : n;
}

/** V-12: indicator values strictly ascending by (year, period), no duplicates. */
export function checkIndicatorOrder({ indicators, report }: RuleContext): void {
  for (const { file, value } of indicators) {
    value.values.forEach((entry, index) => {
      const previous = value.values[index - 1];
      if (!previous) return;
      const current = entry.year * 100 + periodRank(entry.period);
      const before = previous.year * 100 + periodRank(previous.period);
      if (current <= before) {
        report(
          "V-12",
          file,
          `values[${index}] (${entry.year} ${entry.period}) must come after values[${index - 1}] (${previous.year} ${previous.period})`,
        );
      }
    });
  }
}
