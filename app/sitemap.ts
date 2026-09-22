import type { MetadataRoute } from "next";
import { loadCatalogue } from "@/lib/catalogue/load";
import { env } from "@/lib/env";
import { enabledMandates } from "@/lib/mandates";
import { sitemapEntries } from "@/lib/seo";

// FR-12 / FR-9: built at build time; the embargoed archive never appears.
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl, archiveEnabled } = env();
  return sitemapEntries({
    siteUrl,
    byMandate: loadCatalogue().byMandate,
    enabled: enabledMandates(archiveEnabled),
  });
}
