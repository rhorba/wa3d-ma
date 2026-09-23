import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Commitment } from "@/lib/catalogue/schema";
import { withPage } from "@/lib/detail";

/** FR-2 / FR-3: the verbatim promise, its provenance and the document it comes from. */
export async function QuoteBlock({ commitment }: { commitment: Commitment }) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "fr";
  const other = lang === "fr" ? "ar" : "fr";
  const t = await getTranslations("detail");
  const quote = commitment.quote[lang];
  const { origin } = commitment;

  return (
    <section aria-labelledby="h-promised" className="border-t border-rule py-6">
      <h2 id="h-promised" className="label-caps mb-4 font-semibold">
        {t("promised")}
      </h2>
      <blockquote
        lang={lang}
        cite={origin.url}
        className="border-s-[3px] border-accent bg-surface p-4 font-[family-name:var(--font-serif)] text-md leading-relaxed rtl:font-[family-name:var(--font-serif-ar)] rtl:text-[1.3125rem] rtl:leading-loose"
        data-testid="quote"
      >
        {quote.text}
      </blockquote>
      <p className="mt-3 text-sm text-ink-muted">
        {t("source")}{" "}
        <ExternalLink href={withPage(origin.url, origin.page)}>
          <bdi>{origin.name}</bdi>
          {origin.page ? <>, {t("page", { page: origin.page })}</> : null}
        </ExternalLink>
        {origin.archiveUrl && (
          <>
            {" · "}
            <ExternalLink href={origin.archiveUrl} variant="secondary">
              {t("archived")}
            </ExternalLink>
          </>
        )}
      </p>
      <p className="mt-2 text-sm" data-testid="provenance">
        {quote.provenance === "wa3d_translation" ? (
          <span className="inline-block border border-rule-strong px-2 text-ink">
            {t("provenance.wa3d_translation")}
          </span>
        ) : (
          <span className="text-ink-muted">{t(`provenance.${quote.provenance}`)}</span>
        )}
      </p>
      {quote.provenance !== "original" && (
        <details className="mt-2 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-accent">
            {t("showOriginal")}
          </summary>
          <blockquote
            lang={other}
            dir={other === "ar" ? "rtl" : "ltr"}
            className="border-s-[3px] border-rule-strong bg-surface p-4 text-base"
            data-testid="original-quote"
          >
            {commitment.quote[other].text}
          </blockquote>
        </details>
      )}
    </section>
  );
}
