import { staleCommitments } from "./freshness";
import type { Commitment, Indicator, Source } from "./schema";
import type { Issue } from "./validate";

// Presentation of validator results for the CLI, the CI job summary and the monthly review issue.

export function countBySeverity(issues: readonly Issue[]): { errors: number; warnings: number } {
  const errors = issues.filter((issue) => issue.severity === "error").length;
  return { errors, warnings: issues.length - errors };
}

/** One line per issue, errors first, for the terminal. */
export function formatIssues(issues: readonly Issue[]): string {
  const ordered = [...issues].sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1,
  );
  return ordered
    .map(
      (issue) =>
        `${issue.severity === "error" ? "✗" : "⚠"} ${issue.rule} ${issue.file}: ${issue.message}`,
    )
    .join("\n");
}

const escapeCell = (text: string) => text.replaceAll("|", "\\|").replaceAll("\n", " ");

/** A Markdown table for GitHub (job summary, monthly review issue). */
export function issuesToMarkdown(title: string, issues: readonly Issue[]): string {
  const { errors, warnings } = countBySeverity(issues);
  const header = `### ${title}\n\n${errors} error(s), ${warnings} warning(s)\n`;
  if (issues.length === 0) return `${header}\nNothing to report.\n`;
  const rows = issues.map(
    (issue) =>
      `| ${issue.severity} | ${issue.rule} | \`${escapeCell(issue.file)}\` | ${escapeCell(issue.message)} |`,
  );
  return `${header}\n| Severity | Rule | File | Message |\n|---|---|---|---|\n${rows.join("\n")}\n`;
}

/** Stale (V-13) and overdue (V-14) commitments as Markdown, for the monthly review. */
export function freshnessToMarkdown(
  commitments: readonly Commitment[],
  issues: readonly Issue[],
  today: string,
): string {
  const stale = staleCommitments(commitments, today);
  const overdue = issues.filter((issue) => issue.rule === "V-14");
  const staleRows = stale.map((c) => `| \`${c.id}\` | ${c.mandate} | ${c.lastVerified} |`);
  return [
    `### Fraîcheur au ${today}`,
    "",
    `**${stale.length} engagement(s) non vérifié(s) depuis plus de 45 jours**`,
    ...(stale.length
      ? ["", "| Engagement | Mandat | Dernière vérification |", "|---|---|---|", ...staleRows]
      : []),
    "",
    `**${overdue.length} engagement(s) échu(s) encore « non engagé » ou « en cours »**`,
    ...overdue.map((issue) => `- \`${issue.file}\`: ${escapeCell(issue.message)}`),
    "",
  ].join("\n");
}

export type SourceLink = { file: string; field: string; url: string };

/** Every source URL (and archive URL) that backs a claim, for the link checker. */
export function sourceLinks(
  commitments: readonly Commitment[],
  indicators: readonly Indicator[],
): SourceLink[] {
  const links: SourceLink[] = [];
  const add = (file: string, field: string, source: Source) => {
    links.push({ file, field: `${field}.url`, url: source.url });
    if (source.archiveUrl)
      links.push({ file, field: `${field}.archiveUrl`, url: source.archiveUrl });
  };
  for (const c of commitments) {
    const file = `promises/${c.mandate}/${c.id}.json`;
    add(file, "origin", c.origin);
    if (c.target) add(file, "target.baseline.source", c.target.baseline.source);
    c.evidence.forEach((entry, index) => add(file, `evidence[${index}].source`, entry.source));
  }
  for (const i of indicators) {
    i.values.forEach((entry, index) =>
      add(`indicators/${i.id}.json`, `values[${index}].source`, entry.source),
    );
  }
  return links;
}

export type LinkResult = { url: string; ok: boolean; status?: number; error?: string };
type Fetch = (
  url: string,
  init: { method: string; redirect: "follow"; signal: AbortSignal },
) => Promise<{ status: number }>;

/**
 * Checks each distinct URL once: HEAD first, GET when the server refuses HEAD.
 * Results are warnings only: some official sites (cg.gov.ma) answer 401 to automated requests.
 */
export async function checkLinks(
  urls: readonly string[],
  fetchImpl: Fetch = fetch,
  { timeoutMs = 10_000, concurrency = 5 } = {},
): Promise<LinkResult[]> {
  const unique = [...new Set(urls)];
  const results: LinkResult[] = new Array(unique.length);
  const request = (url: string, method: string) =>
    fetchImpl(url, { method, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });

  let next = 0;
  const worker = async () => {
    while (next < unique.length) {
      const index = next++;
      const url = unique[index] as string;
      try {
        let { status } = await request(url, "HEAD");
        if (status === 403 || status === 405 || status === 501)
          ({ status } = await request(url, "GET"));
        results[index] = { url, ok: status < 400, status };
      } catch (error) {
        results[index] = { url, ok: false, error: (error as Error).message };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return results;
}
