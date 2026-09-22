import { describe, expect, it } from "vitest";
import { commitment } from "@/tests/builders";
import type { Commitment, Mandate } from "./catalogue/schema";
import { alternates, openGraph, sitemapEntries, truncate } from "./seo";

describe("alternates", () => {
  it("points the canonical at this locale and lists both languages, French as x-default", () => {
    expect(alternates("ar", "/2021-2026/x")).toEqual({
      canonical: "/ar/2021-2026/x",
      languages: { fr: "/fr/2021-2026/x", ar: "/ar/2021-2026/x", "x-default": "/fr/2021-2026/x" },
    });
  });
});

describe("openGraph", () => {
  it("always carries the site name and locale, with page fields on top", () => {
    expect(openGraph("ar", { title: "T", type: "article" })).toEqual({
      siteName: "Wa3d.ma",
      locale: "ar_MA",
      type: "article",
      title: "T",
    });
    expect(openGraph("fr")).toEqual({ siteName: "Wa3d.ma", locale: "fr_MA", type: "website" });
  });
});

describe("truncate", () => {
  it("keeps short text and collapses whitespace", () => {
    expect(truncate("  Un   texte\ncourt.  ")).toBe("Un texte court.");
  });

  it("cuts at a word boundary with an ellipsis", () => {
    const long = "mot ".repeat(60);
    const result = truncate(long, 50);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result).toMatch(/mot…$/);
  });

  it("cuts mid-word when there is no reasonable boundary", () => {
    expect(truncate("a".repeat(80), 20)).toBe(`${"a".repeat(19)}…`);
  });
});

describe("sitemapEntries", () => {
  const site = "https://wa3d-ma.vercel.app";
  const a = commitment({ id: "a", lastVerified: "2026-09-10" });
  const b = commitment({ id: "b", lastVerified: "2026-09-15" });
  const byMandate = new Map<Mandate, Commitment[]>([
    ["2021-2026", [a, b]],
    ["2026-2031", []],
  ]);

  it("lists méthodologie, non-empty mandates and their commitments in both locales", () => {
    const urls = sitemapEntries({
      siteUrl: site,
      byMandate,
      enabled: ["2026-2031", "2021-2026"],
    }).map((e) => e.url);
    expect(urls).toEqual([
      `${site}/fr/methodologie`,
      `${site}/ar/methodologie`,
      `${site}/fr/2021-2026`,
      `${site}/ar/2021-2026`,
      `${site}/fr/2021-2026/a`,
      `${site}/ar/2021-2026/a`,
      `${site}/fr/2021-2026/b`,
      `${site}/ar/2021-2026/b`,
    ]);
  });

  it("never lists a mandate that is not enabled (embargo, FR-9)", () => {
    const urls = sitemapEntries({ siteUrl: site, byMandate, enabled: ["2026-2031"] }).map(
      (e) => e.url,
    );
    expect(urls.some((url) => url.includes("2021-2026"))).toBe(false);
  });

  it("dates lists by their newest verification and gives language alternates", () => {
    const entries = sitemapEntries({ siteUrl: site, byMandate, enabled: ["2021-2026"] });
    const list = entries.find((e) => e.url === `${site}/fr/2021-2026`);
    expect(list?.lastModified).toBe("2026-09-15");
    expect(list?.alternates?.languages).toEqual({
      fr: `${site}/fr/2021-2026`,
      ar: `${site}/ar/2021-2026`,
    });
    expect(entries[0]?.lastModified).toBeUndefined();
  });
});
