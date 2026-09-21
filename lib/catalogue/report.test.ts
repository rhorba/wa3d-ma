import { describe, expect, it } from "vitest";
import { commitment, evidence, indicator, source } from "@/tests/builders";
import {
  checkLinks,
  countBySeverity,
  formatIssues,
  freshnessToMarkdown,
  issuesToMarkdown,
  sourceLinks,
} from "./report";
import type { Issue } from "./validate";

const error: Issue = {
  rule: "V-7",
  severity: "error",
  file: "promises/2021-2026/a.json",
  message: "bad | host",
};
const warning: Issue = {
  rule: "V-13",
  severity: "warning",
  file: "promises/2021-2026/b.json",
  message: "stale",
};

describe("issue formatting", () => {
  it("counts by severity", () => {
    expect(countBySeverity([error, warning, warning])).toEqual({ errors: 1, warnings: 2 });
  });

  it("prints errors before warnings, one per line", () => {
    expect(formatIssues([warning, error])).toBe(
      "✗ V-7 promises/2021-2026/a.json: bad | host\n⚠ V-13 promises/2021-2026/b.json: stale",
    );
    expect(formatIssues([warning, warning]).split("\n")).toHaveLength(2);
  });

  it("renders a Markdown table with escaped pipes", () => {
    const md = issuesToMarkdown("Catalogue (data)", [error, warning]);
    expect(md).toContain("1 error(s), 1 warning(s)");
    expect(md).toContain("| error | V-7 | `promises/2021-2026/a.json` | bad \\| host |");
  });

  it("says so when there is nothing to report", () => {
    expect(issuesToMarkdown("Catalogue", [])).toContain("Nothing to report.");
  });
});

describe("freshness report", () => {
  it("lists stale and overdue commitments", () => {
    const stale = commitment({ id: "ancien", lastVerified: "2026-07-01" });
    const fresh = commitment({ id: "recent", lastVerified: "2026-09-20" });
    const overdue: Issue = {
      rule: "V-14",
      severity: "warning",
      file: "promises/2021-2026/x.json",
      message: "overdue",
    };
    const md = freshnessToMarkdown([stale, fresh], [overdue, warning], "2026-09-30");
    expect(md).toContain("**1 engagement(s) non vérifié(s) depuis plus de 45 jours**");
    expect(md).toContain("| `ancien` | 2021-2026 | 2026-07-01 |");
    expect(md).not.toContain("recent");
    expect(md).toContain("- `promises/2021-2026/x.json`: overdue");
  });

  it("omits the table when nothing is stale", () => {
    expect(freshnessToMarkdown([commitment()], [], "2026-09-30")).not.toContain("| Engagement |");
  });
});

describe("sourceLinks", () => {
  it("collects origin, evidence, baseline, archive and indicator URLs with their location", () => {
    const value = commitment({
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 0, year: 2021, source: source({ url: "https://www.hcp.ma/base.pdf" }) },
        value: 1,
        direction: "increase",
      },
      evidence: [evidence({ source: source({ archiveUrl: "https://web.archive.org/web/x" }) })],
    });
    const links = sourceLinks([value], [indicator()]);
    expect(links.map((l) => l.field)).toEqual([
      "origin.url",
      "target.baseline.source.url",
      "evidence[0].source.url",
      "evidence[0].source.archiveUrl",
      "values[0].source.url",
      "values[1].source.url",
    ]);
    expect(links[0]?.file).toBe("promises/2021-2026/engagement-fictif-a.json");
    expect(links.at(-1)?.file).toBe("indicators/indicateur-fictif.json");
  });
});

describe("checkLinks", () => {
  const fakeFetch =
    (responses: Record<string, number | Error>, calls: string[] = []) =>
    async (url: string, init: { method: string }) => {
      calls.push(`${init.method} ${url}`);
      const key = `${init.method} ${url}`;
      const response = responses[key] ?? responses[url];
      if (response instanceof Error) throw response;
      return { status: response ?? 200 };
    };

  it("checks each distinct URL once and reports failures", async () => {
    const calls: string[] = [];
    const results = await checkLinks(
      ["https://a.gov.ma/", "https://a.gov.ma/", "https://b.gov.ma/", "https://c.gov.ma/"],
      fakeFetch({ "https://b.gov.ma/": 404, "https://c.gov.ma/": new Error("timeout") }, calls),
    );
    expect(results).toEqual([
      { url: "https://a.gov.ma/", ok: true, status: 200 },
      { url: "https://b.gov.ma/", ok: false, status: 404 },
      { url: "https://c.gov.ma/", ok: false, error: "timeout" },
    ]);
    expect(calls.filter((c) => c.endsWith("a.gov.ma/"))).toHaveLength(1);
  });

  it.each([403, 405, 501])("retries with GET when HEAD answers %s", async (status) => {
    const calls: string[] = [];
    const results = await checkLinks(
      ["https://d.gov.ma/"],
      fakeFetch({ "HEAD https://d.gov.ma/": status, "GET https://d.gov.ma/": 200 }, calls),
    );
    expect(results[0]).toMatchObject({ ok: true, status: 200 });
    expect(calls).toEqual(["HEAD https://d.gov.ma/", "GET https://d.gov.ma/"]);
  });

  it("returns nothing for no URLs", async () => {
    expect(await checkLinks([], fakeFetch({}))).toEqual([]);
  });
});
