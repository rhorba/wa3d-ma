import type { ZodType } from "zod";
import { Commitment, Indicator } from "./schema";
import {
  checkEvidenceOrder,
  checkFileLocations,
  checkNoFutureDates,
  checkQuoteProvenance,
  checkUniqueIds,
} from "./rules/structure";
import {
  checkIndicatorOrder,
  checkStatusAgainstDeadline,
  checkTargets,
  checkVerificationDates,
} from "./rules/consistency";
import { checkHiddenCharacters, checkOfficialSources } from "./rules/sources";
import type { CatalogueInput, Issue, Parsed, RuleContext, Severity } from "./rules/types";

export type { CatalogueFile, CatalogueInput, Issue, RuleId, Severity } from "./rules/types";

export type ValidationResult = {
  issues: Issue[];
  commitments: Commitment[];
  indicators: Indicator[];
};

// ADR-7: one validation pipeline shared by the CLI, the build (load.ts) and the tests.
// Errors fail CI and the build; warnings are only reported (SDR-6).
const RULES: ((context: RuleContext) => void)[] = [
  checkFileLocations, // V-2
  checkUniqueIds, // V-3
  checkQuoteProvenance, // V-4
  checkEvidenceOrder, // V-5
  checkNoFutureDates, // V-6
  checkOfficialSources, // V-7
  checkVerificationDates, // V-8
  checkStatusAgainstDeadline, // V-9
  checkTargets, // V-11
  checkIndicatorOrder, // V-12
  checkHiddenCharacters, // V-17
];

export function validateCatalogue(input: CatalogueInput): ValidationResult {
  const issues: Issue[] = [];
  const report = (
    rule: Issue["rule"],
    file: string,
    message: string,
    severity: Severity = "error",
  ) => issues.push({ rule, severity, file, message });

  // V-1: files that don't match the schema are reported and excluded from the other rules.
  const parse = <T>(files: CatalogueInput["commitments"], schema: ZodType<T>) => {
    const parsed: Parsed<T>[] = [];
    for (const { path, data } of files) {
      const result = schema.safeParse(data);
      if (result.success) parsed.push({ file: path, value: result.data });
      else {
        for (const problem of result.error.issues) {
          const at = problem.path.map(String).join(".") || "(root)";
          report("V-1", path, `${at}: ${problem.message}`);
        }
      }
    }
    return parsed;
  };

  const context: RuleContext = {
    input,
    commitments: parse<Commitment>(input.commitments, Commitment),
    indicators: parse<Indicator>(input.indicators, Indicator),
    report,
  };
  for (const rule of RULES) rule(context);

  issues.sort((a, b) => a.file.localeCompare(b.file) || ruleNumber(a) - ruleNumber(b));
  return {
    issues,
    commitments: context.commitments.map(({ value }) => value),
    indicators: context.indicators.map(({ value }) => value),
  };
}

const ruleNumber = (issue: Issue) => Number(issue.rule.slice(2));

export const hasErrors = (issues: readonly Issue[]) =>
  issues.some((issue) => issue.severity === "error");

/** "YYYY-MM-DD" in Morocco's time zone: a curator entering today's date just after midnight is not in the future. */
export function todayInCasablanca(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
