import type { MetadataRoute } from "next";
import type { Commitment, Mandate } from "./catalogue/schema";

// FR-12: canonical URLs, hreflang and the sitemap all derive from NEXT_PUBLIC_SITE_URL, so moving to
// an own domain is one env change (runbook R3). Relative paths here; Next resolves them against
// metadataBase (set in the locale layout).

export const LOCALES = ["fr", "ar"] as const;

/** Canonical for this locale plus the FR/AR alternates; French is the x-default (PRD: FR primary). */
export function alternates(locale: string, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: { fr: `/fr${path}`, ar: `/ar${path}`, "x-default": `/fr${path}` },
  };
}

/** Cuts at a word boundary under the limit, for meta descriptions (~155 characters). */
export function truncate(text: string, limit = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:]+$/, "")}…`;
}

export const OG_LOCALE: Record<string, string> = { fr: "fr_MA", ar: "ar_MA" };

type OpenGraphFields = {
  title?: string;
  description?: string;
  url?: string;
  type?: "website" | "article";
};

/**
 * Next merges metadata shallowly: a page's openGraph object replaces the layout's. Pages call this
 * so the site name and locale are never lost.
 */
export function openGraph(locale: string, fields: OpenGraphFields = {}) {
  return { siteName: "Wa3d.ma", locale: OG_LOCALE[locale], type: "website" as const, ...fields };
}

type SitemapInput = {
  siteUrl: string;
  byMandate: ReadonlyMap<Mandate, readonly Commitment[]>;
  /** Mandates with pages on the site (the archive only once the embargo lifts, FR-9). */
  enabled: readonly Mandate[];
};

const newest = (dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

/**
 * Every indexable page, once per locale, with its language alternates. Empty mandates are left out
 * (they are noindex until the programme is published, ADR-10) and so is the home page, whose
 * canonical is the newest mandate's list.
 */
export function sitemapEntries({
  siteUrl,
  byMandate,
  enabled,
}: SitemapInput): MetadataRoute.Sitemap {
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap =>
    LOCALES.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${siteUrl}/${l}${path}`])),
      },
    }));

  const pages: MetadataRoute.Sitemap = [...entry("/methodologie")];
  for (const mandate of enabled) {
    const commitments = byMandate.get(mandate) ?? [];
    if (commitments.length === 0) continue;
    pages.push(...entry(`/${mandate}`, newest(commitments.map((c) => c.lastVerified))));
    for (const commitment of commitments) {
      pages.push(...entry(`/${mandate}/${commitment.id}`, commitment.lastVerified));
    }
  }
  return pages;
}
