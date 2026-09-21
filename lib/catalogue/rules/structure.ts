import type { Commitment, Indicator, Source } from "../schema";
import type { Parsed, RuleContext } from "./types";

const normalise = (path: string) => path.replaceAll("\\", "/");

/** V-2: the file name equals the id, and a commitment sits in its mandate's folder. */
export function checkFileLocations({ commitments, indicators, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const expected = `promises/${value.mandate}/${value.id}.json`;
    if (normalise(file) !== expected) {
      report(
        "V-2",
        file,
        `must be stored as ${expected} (id "${value.id}", mandate "${value.mandate}")`,
      );
    }
  }
  for (const { file, value } of indicators) {
    const expected = `indicators/${value.id}.json`;
    if (normalise(file) !== expected) report("V-2", file, `must be stored as ${expected}`);
  }
}

/** V-3: ids are unique across all mandates (FR-1: a URL is a citation, forever). */
export function checkUniqueIds({ commitments, indicators, report }: RuleContext): void {
  const findDuplicates = <T extends { id: string }>(items: Parsed<T>[], kind: string) => {
    const firstFile = new Map<string, string>();
    for (const { file, value } of items) {
      const first = firstFile.get(value.id);
      if (first) report("V-3", file, `${kind} id "${value.id}" is already used by ${first}`);
      else firstFile.set(value.id, file);
    }
  };
  findDuplicates(commitments, "commitment");
  findDuplicates(indicators, "indicator");
}

/** V-4: exactly one quote language is the original text (FR-2). */
export function checkQuoteProvenance({ commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const originals = (["fr", "ar"] as const).filter(
      (lang) => value.quote[lang].provenance === "original",
    );
    if (originals.length !== 1) {
      report(
        "V-4",
        file,
        `exactly one quote language must be "original" (found ${originals.length})`,
      );
    }
  }
}

/** V-5: evidence dates strictly ascending, so the current status is never ambiguous (ADR-2). */
export function checkEvidenceOrder({ commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    value.evidence.forEach((entry, index) => {
      const previous = value.evidence[index - 1];
      if (previous && entry.date <= previous.date) {
        report(
          "V-5",
          file,
          `evidence[${index}] (${entry.date}) must be later than evidence[${index - 1}] (${previous.date})`,
        );
      }
    });
  }
}

function sourceDates(label: string, source: Source): [string, string][] {
  const dates: [string, string][] = [[`${label}.accessed`, source.accessed]];
  if (source.published) dates.push([`${label}.published`, source.published]);
  return dates;
}

function commitmentDates(value: Commitment): [string, string][] {
  return [
    ["lastVerified", value.lastVerified],
    ...sourceDates("origin", value.origin),
    ...(value.target ? sourceDates("target.baseline.source", value.target.baseline.source) : []),
    ...value.evidence.flatMap((entry, index): [string, string][] => [
      [`evidence[${index}].date`, entry.date],
      ...sourceDates(`evidence[${index}].source`, entry.source),
    ]),
  ];
}

function indicatorDates(value: Indicator): [string, string][] {
  return value.values.flatMap((entry, index) =>
    sourceDates(`values[${index}].source`, entry.source),
  );
}

/** V-6: nothing is dated in the future (today in Africa/Casablanca). Deadlines are exempt. */
export function checkNoFutureDates({ input, commitments, indicators, report }: RuleContext): void {
  const check = (file: string, dates: [string, string][]) => {
    for (const [field, date] of dates) {
      if (date > input.today)
        report("V-6", file, `${field} (${date}) is after today (${input.today})`);
    }
  };
  for (const { file, value } of commitments) check(file, commitmentDates(value));
  for (const { file, value } of indicators) check(file, indicatorDates(value));
}
