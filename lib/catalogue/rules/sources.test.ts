import { describe, expect, it } from "vitest";
import {
  catalogueInput,
  commitment,
  commitmentFile,
  evidence,
  indicator,
  indicatorFile,
  source,
} from "@/tests/builders";
import officialDomains from "@/data/official-domains.json";
import { validateCatalogue } from "../validate";
import { isOnAllowlist } from "./sources";

const ALLOWLIST = ["gov.ma", "hcp.ma"];
const cyrillicO = String.fromCodePoint(0x43e);

describe("isOnAllowlist (Test Strategy §4 adversarial table)", () => {
  it.each([
    ["exact domain", "https://gov.ma/x", true],
    ["subdomain", "https://www.cg.gov.ma/programme.pdf", true],
    ["uppercase host", "https://WWW.HCP.MA/x", true],
    ["trailing dot", "https://gov.ma./x", true],
    ["look-alike prefix", "https://evilgov.ma/x", false],
    ["allowlisted name as a subdomain of another site", "https://gov.ma.evil.com/x", false],
    ["userinfo trick", "https://gov.ma@evil.com/x", false],
    ["allowlisted name in the query", "https://evil.com/?u=gov.ma", false],
    ["IDN homoglyph (Cyrillic o)", `https://g${cyrillicO}v.ma/x`, false],
    ["unparsable", "not a url", false],
  ])("%s → %s", (_label, url, expected) => {
    expect(isOnAllowlist(url, ALLOWLIST)).toBe(expected);
  });

  it("ignores empty or dotted allowlist entries instead of matching everything", () => {
    expect(isOnAllowlist("https://evil.com/x", ["", "."])).toBe(false);
    expect(isOnAllowlist("https://www.hcp.ma/x", [".hcp.ma."])).toBe(true);
  });
});

describe("V-7 official sources", () => {
  const rules = (input: ReturnType<typeof catalogueInput>) =>
    validateCatalogue(input).issues.map((issue) => `${issue.rule} ${issue.message}`);

  it("rejects a press site used as the official source of an evidence entry", () => {
    const value = commitment({
      evidence: [evidence({ source: source({ url: "https://lematin.ma/article" }) })],
    });
    expect(rules(catalogueInput({ commitments: [commitmentFile(value)] }))).toEqual([
      'V-7 evidence[0].source.url host "lematin.ma" is not an official domain (data/official-domains.json)',
    ]);
  });

  it("checks the origin, the baseline source and indicator sources", () => {
    const value = commitment({
      origin: { ...commitment().origin, url: "https://blog.example/programme.pdf" },
      target: {
        indicatorId: "indicateur-fictif",
        baseline: { value: 0, year: 2021, source: source({ url: "https://stats.example/x" }) },
        value: 10,
        direction: "increase",
      },
    });
    const badIndicator = indicator({
      values: [
        { year: 2025, period: "Y", value: 1, source: source({ url: "https://stats.example/y" }) },
      ],
    });
    const found = rules(
      catalogueInput({
        commitments: [commitmentFile(value)],
        indicators: [indicatorFile(badIndicator)],
      }),
    );
    expect(found.filter((line) => line.startsWith("V-7"))).toHaveLength(3);
    expect(found.join("\n")).toMatch(/origin\.url/);
    expect(found.join("\n")).toMatch(/target\.baseline\.source\.url/);
    expect(found.join("\n")).toMatch(/values\[0\]\.source\.url/);
  });

  it("exempts press pointers (secondary links only)", () => {
    const value = commitment({
      evidence: [evidence({ pointers: [{ name: "Presse", url: "https://lematin.ma/a" }] })],
    });
    expect(rules(catalogueInput({ commitments: [commitmentFile(value)] }))).toEqual([]);
  });

  it("only accepts web.archive.org for archived copies", () => {
    const archived = (archiveUrl: string) =>
      commitment({ evidence: [evidence({ source: source({ archiveUrl }) })] });
    const ok = archived("https://web.archive.org/web/2026/https://www.hcp.ma/x");
    const bad = archived("https://archive.evil.example/x");
    expect(rules(catalogueInput({ commitments: [commitmentFile(ok)] }))).toEqual([]);
    expect(rules(catalogueInput({ commitments: [commitmentFile(bad)] }))).toEqual([
      "V-7 evidence[0].source.archiveUrl must be a web.archive.org copy",
    ]);
  });

  it("the shipped allowlist accepts the Security doc's official sources and rejects press", () => {
    const domains = officialDomains.domains;
    for (const url of [
      "https://www.sgg.gov.ma/BO/x.pdf",
      "https://www.cg.gov.ma/fr/x",
      "https://www.finances.gov.ma/x",
      "https://www.hcp.ma/x",
      "https://www.bkam.ma/x",
      "https://www.courdescomptes.ma/x",
      "https://www.chambredesrepresentants.ma/x",
      "https://www.chambredesconseillers.ma/x",
      "https://data.worldbank.org/x",
      "https://www.imf.org/x",
      "https://www.anapec.org/x",
      "https://www.cnss.ma/x",
      "https://www.one.org.ma/x",
      "https://www.ondh.ma/x",
      "https://www.cese.ma/x",
    ]) {
      expect(isOnAllowlist(url, domains), url).toBe(true);
    }
    for (const url of ["https://www.hespress.com/x", "https://lematin.ma/x", "https://x.com/x"]) {
      expect(isOnAllowlist(url, domains), url).toBe(false);
    }
  });
});

describe("V-17 hidden characters", () => {
  const withNote = (fr: string) =>
    catalogueInput({
      commitments: [
        commitmentFile(commitment({ evidence: [evidence({ note: { fr, ar: "واقعة" } })] })),
      ],
    });
  const hidden = (codePoint: number) => `Fait ${String.fromCodePoint(codePoint)}daté.`;

  it.each([
    [0x202e, "RIGHT-TO-LEFT OVERRIDE"],
    [0x202a, "LEFT-TO-RIGHT EMBEDDING"],
    [0x2067, "RIGHT-TO-LEFT ISOLATE"],
    [0x200b, "ZERO WIDTH SPACE"],
    [0x200d, "ZERO WIDTH JOINER"],
    [0x2060, "WORD JOINER"],
    [0xfeff, "BYTE ORDER MARK"],
  ])("rejects U+%s (%s) and names the field", (codePoint) => {
    const issues = validateCatalogue(withNote(hidden(codePoint))).issues;
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      rule: "V-17",
      message: `evidence[0].note.fr contains a hidden character (U+${codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")})`,
    });
  });

  it("allows U+200C ZERO WIDTH NON-JOINER", () => {
    expect(validateCatalogue(withNote(hidden(0x200c))).issues).toEqual([]);
  });

  it("checks every string, including titles and indicator names", () => {
    const rlo = String.fromCodePoint(0x202e);
    const input = catalogueInput({
      commitments: [commitmentFile(commitment({ title: { fr: `Titre${rlo}`, ar: "عنوان" } }))],
      indicators: [indicatorFile(indicator({ name: { fr: "Nom", ar: `اسم${rlo}` } }))],
    });
    const messages = validateCatalogue(input).issues.map((issue) => issue.message);
    expect(messages).toEqual([
      "name.ar contains a hidden character (U+202E)",
      "title.fr contains a hidden character (U+202E)",
    ]);
  });
});
