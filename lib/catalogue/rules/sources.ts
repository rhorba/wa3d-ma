import type { Commitment, Indicator, Source } from "../schema";
import type { RuleContext } from "./types";

// Archived copies must come from the Wayback Machine; anything else could send
// readers anywhere under a "Copie archivée" label (SEC-3).
const ARCHIVE_HOSTS = ["web.archive.org"];

/** The URL's hostname, lower-cased, without a trailing dot; punycode for IDNs (WHATWG URL). */
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

/** Dot-boundary suffix match: gov.ma matches cg.gov.ma, never evilgov.ma or gov.ma.evil.com. */
export function isOnAllowlist(url: string, allowlist: readonly string[]): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return allowlist.some((entry) => {
    const domain = entry.toLowerCase().replace(/^\.+|\.+$/g, "");
    return domain !== "" && (host === domain || host.endsWith(`.${domain}`));
  });
}

function commitmentSources(value: Commitment): [string, Source][] {
  return [
    ["origin", value.origin],
    ...(value.target
      ? ([["target.baseline.source", value.target.baseline.source]] as [string, Source][])
      : []),
    ...value.evidence.map((entry, index): [string, Source] => [
      `evidence[${index}].source`,
      entry.source,
    ]),
  ];
}

function indicatorSources(value: Indicator): [string, Source][] {
  return value.values.map((entry, index): [string, Source] => [
    `values[${index}].source`,
    entry.source,
  ]);
}

/**
 * V-7: every source that backs a claim is on an official domain (FR-5, SEC-3).
 * Press pointers are exempt: they are only secondary links next to an official source.
 */
export function checkOfficialSources({
  input,
  commitments,
  indicators,
  report,
}: RuleContext): void {
  const check = (file: string, sources: [string, Source][]) => {
    for (const [field, source] of sources) {
      if (!isOnAllowlist(source.url, input.officialDomains)) {
        report(
          "V-7",
          file,
          `${field}.url host "${hostOf(source.url)}" is not an official domain (data/official-domains.json)`,
        );
      }
      if (source.archiveUrl && !isOnAllowlist(source.archiveUrl, ARCHIVE_HOSTS)) {
        report("V-7", file, `${field}.archiveUrl must be a web.archive.org copy`);
      }
    }
  };
  for (const { file, value } of commitments) check(file, commitmentSources(value));
  for (const { file, value } of indicators) check(file, indicatorSources(value));
}

// Bidi embeddings/overrides/isolates and zero-width characters that can visually reorder or hide
// text while the JSON diff looks harmless in review. U+200C (ZWNJ) stays allowed. Written as
// numbers on purpose: an escaped regex can silently turn into the invisible characters themselves.
const HIDDEN_RANGES: readonly [number, number][] = [
  [0x202a, 0x202e], // LRE, RLE, PDF, LRO, RLO
  [0x2066, 0x2069], // LRI, RLI, FSI, PDI
  [0x200b, 0x200b], // ZERO WIDTH SPACE
  [0x200d, 0x200d], // ZERO WIDTH JOINER
  [0x2060, 0x2060], // WORD JOINER
  [0xfeff, 0xfeff], // ZERO WIDTH NO-BREAK SPACE (BOM)
];

/** The first hidden code point in the text, or undefined. */
export function firstHiddenCodePoint(text: string): number | undefined {
  for (const character of text) {
    const code = character.codePointAt(0) as number;
    if (HIDDEN_RANGES.some(([from, to]) => code >= from && code <= to)) return code;
  }
  return undefined;
}

function* strings(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) yield* strings(item, `${path}[${index}]`);
  } else if (value !== null && typeof value === "object") {
    for (const [key, item] of Object.entries(value))
      yield* strings(item, path ? `${path}.${key}` : key);
  }
}

const formatCodePoint = (code: number) => `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;

/** V-17: no hidden bidi-control or zero-width characters in any text field (Test Strategy §6). */
export function checkHiddenCharacters({ commitments, indicators, report }: RuleContext): void {
  for (const { file, value } of [...commitments, ...indicators]) {
    for (const [path, text] of strings(value, "")) {
      const hidden = firstHiddenCodePoint(text);
      if (hidden !== undefined) {
        report("V-17", file, `${path} contains a hidden character (${formatCodePoint(hidden)})`);
      }
    }
  }
}
