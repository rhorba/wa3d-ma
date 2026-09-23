import { getLocale, getTranslations } from "next-intl/server";
import { ltr } from "@/components/ui/ltr";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Commitment } from "@/lib/catalogue/schema";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";

/** US-8: a ready citation with the permanent URL. US-9: the public correction route. */
export async function CommitmentActions({ commitment }: { commitment: Commitment }) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "fr";
  const tCite = await getTranslations("cite");
  const tReport = await getTranslations("report");
  const tTheme = await getTranslations("theme");
  const { siteUrl, repoUrl } = env();
  const permalink = `${siteUrl}/${locale}/${commitment.mandate}/${commitment.id}`;
  // GitHub issue forms prefill fields from query parameters named after the field ids (Story 3.4).
  const report = `${repoUrl}/issues/new?${new URLSearchParams({
    template: "correction.yml",
    title: `[${commitment.id}] `,
    commitment: commitment.id,
    page: permalink,
  })}`;

  return (
    <section className="grid gap-2 border-t border-rule py-6 text-sm">
      <details open>
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-accent">
          {tCite("heading")}
        </summary>
        <p className="border border-rule px-4 py-3 break-words" data-testid="citation">
          {tCite.rich("text", {
            title: commitment.title[lang],
            date: formatDate(commitment.lastVerified),
            url: permalink,
            ltr,
          })}
        </p>
      </details>
      <p>
        <ExternalLink href={report}>{tReport("link")}</ExternalLink>
      </p>
      <p className="text-ink-muted">{tReport("note")}</p>
      <p>
        <a href={`/${locale}/${commitment.mandate}?theme=${commitment.theme}`}>
          <span aria-hidden="true" className="mirror me-1 inline-block">
            ←
          </span>
          {tReport("back", { theme: tTheme(commitment.theme) })}
        </a>
      </p>
    </section>
  );
}
