import type { Commitment, Indicator } from "../schema";

// Rule ids from docs/database-wa3d-ma.md §4 (V-1…V-17).
export type RuleId = `V-${number}`;
export type Severity = "error" | "warning";

export type Issue = {
  rule: RuleId;
  severity: Severity;
  /** Path relative to the data folder, e.g. "promises/2021-2026/<id>.json". */
  file: string;
  message: string;
};

export type CatalogueFile = { path: string; data: unknown };

export type CatalogueInput = {
  commitments: CatalogueFile[];
  indicators: CatalogueFile[];
  /** data/official-domains.json (SEC-3). */
  officialDomains: string[];
  /** data/banned-words.json (V-10). */
  bannedWords: { fr: string[]; ar: string[] };
  /** Today's date in Africa/Casablanca, "YYYY-MM-DD" (injected so tests can freeze it). */
  today: string;
  /** V-16 applies to the real catalogue only; fictional test fixtures are exempt (ADR-3). */
  enforceEmbargo: boolean;
};

export type Parsed<T> = { file: string; value: T };

export type RuleContext = {
  input: CatalogueInput;
  commitments: Parsed<Commitment>[];
  indicators: Parsed<Indicator>[];
  report: (rule: RuleId, file: string, message: string, severity?: Severity) => void;
};
