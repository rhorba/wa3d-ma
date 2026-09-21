import "server-only";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { env } from "../env";
import type { Commitment, Indicator, Mandate } from "./schema";
import {
  hasErrors,
  todayInCasablanca,
  validateCatalogue,
  type CatalogueFile,
  type CatalogueInput,
  type Issue,
} from "./validate";

// ADR-7: the build reads the catalogue once, validates it with the same pipeline as CI and
// throws on any error, so invalid data can never be deployed even if CI is bypassed.

export type Catalogue = {
  /** Commitments of each mandate, in programme order (origin page, then id; UX rule 3). */
  byMandate: Map<Mandate, Commitment[]>;
  byId: Map<string, Commitment>;
  indicators: Map<string, Indicator>;
  /** Non-blocking findings (V-13…V-15), surfaced by the CLI and CI summary. */
  warnings: Issue[];
};

export class CatalogueError extends Error {
  constructor(readonly issues: Issue[]) {
    super(
      `The catalogue has ${issues.length} error(s):\n` +
        issues.map((issue) => `  ${issue.rule} ${issue.file}: ${issue.message}`).join("\n"),
    );
    this.name = "CatalogueError";
  }
}

export type ReadOptions = {
  /** Folder holding promises/ and indicators/ (env WA3D_DATA_DIR, default "data"). */
  dataDir: string;
  /** Folder holding official-domains.json and banned-words.json: always the real lists. */
  referenceDir?: string;
  today?: string;
};

function jsonFiles(root: string, dir: string): string[] {
  const path = join(root, dir);
  if (!existsSync(path)) return [];
  return readdirSync(path).flatMap((entry) => {
    const child = join(dir, entry);
    if (statSync(join(root, child)).isDirectory()) return jsonFiles(root, child);
    return entry.endsWith(".json") ? [child] : [];
  });
}

function readJson(root: string, file: string): CatalogueFile | Issue {
  const path = relative(root, join(root, file)).replaceAll("\\", "/");
  try {
    return { path, data: JSON.parse(readFileSync(join(root, file), "utf8")) as unknown };
  } catch (error) {
    return {
      rule: "V-1",
      severity: "error",
      file: path,
      message: `invalid JSON: ${(error as Error).message}`,
    };
  }
}

const isIssue = (value: CatalogueFile | Issue): value is Issue => "rule" in value;

/** Reads and validates a catalogue folder. Returns every issue; never throws on bad data. */
export function readCatalogue(options: ReadOptions): {
  input: CatalogueInput;
  issues: Issue[];
  commitments: Commitment[];
  indicators: Indicator[];
} {
  const root = resolve(options.dataDir);
  const referenceDir = resolve(options.referenceDir ?? "data");
  const read = (dir: string) => jsonFiles(root, dir).map((file) => readJson(root, file));
  const promises = read("promises");
  const indicatorFiles = read("indicators");
  const lists = {
    domains: JSON.parse(readFileSync(join(referenceDir, "official-domains.json"), "utf8")) as {
      domains: string[];
    },
    words: JSON.parse(readFileSync(join(referenceDir, "banned-words.json"), "utf8")) as {
      fr: string[];
      ar: string[];
    },
  };

  const input: CatalogueInput = {
    commitments: promises.filter((file) => !isIssue(file)) as CatalogueFile[],
    indicators: indicatorFiles.filter((file) => !isIssue(file)) as CatalogueFile[],
    officialDomains: lists.domains.domains,
    bannedWords: { fr: lists.words.fr, ar: lists.words.ar },
    today: options.today ?? todayInCasablanca(),
    // The embargo protects the real dataset; fictional fixtures elsewhere are exempt (ADR-3).
    enforceEmbargo: root === referenceDir,
  };
  const result = validateCatalogue(input);
  const unreadable = [...promises, ...indicatorFiles].filter(isIssue);
  return { input, ...result, issues: [...unreadable, ...result.issues] };
}

const programmeOrder = (a: Commitment, b: Commitment) =>
  (a.origin.page ?? Number.MAX_SAFE_INTEGER) - (b.origin.page ?? Number.MAX_SAFE_INTEGER) ||
  a.id.localeCompare(b.id);

/** Validates and indexes a catalogue folder; throws CatalogueError on any error. */
export function buildCatalogue(options: ReadOptions): Catalogue {
  const { issues, commitments, indicators } = readCatalogue(options);
  if (hasErrors(issues))
    throw new CatalogueError(issues.filter((issue) => issue.severity === "error"));

  const byMandate = new Map<Mandate, Commitment[]>();
  for (const commitment of [...commitments].sort(programmeOrder)) {
    byMandate.set(commitment.mandate, [...(byMandate.get(commitment.mandate) ?? []), commitment]);
  }
  return {
    byMandate,
    byId: new Map(commitments.map((commitment) => [commitment.id, commitment])),
    indicators: new Map(indicators.map((indicator) => [indicator.id, indicator])),
    warnings: issues,
  };
}

let cached: Catalogue | undefined;

/** The build's catalogue: read once from env().dataDir and memoised for every page. */
export function loadCatalogue(): Catalogue {
  cached ??= buildCatalogue({ dataDir: env().dataDir });
  return cached;
}
