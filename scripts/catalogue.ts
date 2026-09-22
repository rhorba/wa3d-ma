// Catalogue CLI (Story 1.9). Run through package.json:
//   pnpm catalogue:validate  [--data-dir data]            errors exit 1, warnings are listed
//   pnpm catalogue:freshness [--data-dir data] [--markdown]  stale and overdue commitments
//   pnpm catalogue:links     [--data-dir data] [--markdown]  unreachable sources (warnings only)
//   pnpm catalogue:worksheet [--data-dir data] [--mandate 2021-2026]  verification worksheet (Story 4.4)
//                            written to .verification/ (git-ignored: it can hold embargoed content)
// Needs `tsx --conditions=react-server` because the loader is guarded by "server-only".
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { readCatalogue } from "../lib/catalogue/load";
import {
  checkLinks,
  countBySeverity,
  formatIssues,
  freshnessToMarkdown,
  issuesToMarkdown,
  sourceLinks,
} from "../lib/catalogue/report";
import { worksheetMarkdown } from "../lib/catalogue/worksheet";

const [command, ...args] = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const dataDir = option("data-dir") ?? "data";
const markdown = args.includes("--markdown");
// GitHub Actions job summary: shown on the run page, next to the logs.
const summaryFile = process.env.GITHUB_STEP_SUMMARY;

async function main(): Promise<number> {
  const result = readCatalogue({ dataDir, today: option("today") });

  if (command === "validate") {
    const { errors, warnings } = countBySeverity(result.issues);
    if (result.issues.length > 0) console.log(formatIssues(result.issues));
    console.log(
      `\n${result.commitments.length} commitment(s), ${result.indicators.length} indicator(s) in ${dataDir}: ${errors} error(s), ${warnings} warning(s)`,
    );
    if (summaryFile)
      appendFileSync(summaryFile, issuesToMarkdown(`Catalogue (${dataDir})`, result.issues));
    return errors > 0 ? 1 : 0;
  }

  if (command === "freshness") {
    const report = freshnessToMarkdown(result.commitments, result.issues, result.input.today);
    console.log(report);
    if (summaryFile && markdown) appendFileSync(summaryFile, report);
    return 0;
  }

  if (command === "worksheet") {
    const mandate = option("mandate") ?? "2021-2026";
    const { errors } = countBySeverity(result.issues);
    if (errors > 0) {
      console.error(
        `${errors} validation error(s): fix them before verifying (pnpm catalogue:validate).`,
      );
      return 1;
    }
    const sheet = worksheetMarkdown(
      mandate,
      result.commitments,
      result.indicators,
      result.input.today,
    );
    mkdirSync(".verification", { recursive: true });
    const file = `.verification/worksheet-${mandate}-${result.input.today}.md`;
    writeFileSync(file, sheet);
    console.log(`${file}: ${sheet.split("\n")[2]}`);
    return 0;
  }

  if (command === "links") {
    const links = sourceLinks(result.commitments, result.indicators);
    const results = await checkLinks(links.map((link) => link.url));
    const failing = results.filter((r) => !r.ok);
    const where = (url: string) =>
      links
        .filter((l) => l.url === url)
        .map((l) => `${l.file} ${l.field}`)
        .join("; ");
    const lines = failing.map((r) => `- ${r.url} (${r.status ?? r.error}): ${where(r.url)}`);
    const report = `### Liens\n\n${results.length} lien(s) vérifié(s), ${failing.length} injoignable(s)\n${lines.length ? `\n${lines.join("\n")}\n` : ""}`;
    console.log(report);
    if (summaryFile && markdown) appendFileSync(summaryFile, report);
    return 0; // warnings only
  }

  console.error(
    "Usage: catalogue <validate|freshness|links|worksheet> [--data-dir <dir>] [--markdown] [--mandate <id>] [--today YYYY-MM-DD]",
  );
  return 2;
}

main().then((code) => process.exit(code));
