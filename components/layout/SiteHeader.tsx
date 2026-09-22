import { getLocale, getTranslations } from "next-intl/server";
import { loadCatalogue } from "@/lib/catalogue/load";
import type { Mandate } from "@/lib/catalogue/schema";
import { env } from "@/lib/env";
import { enabledMandates } from "@/lib/mandates";

type Props = {
  /** The mandate the page belongs to, shown in the switcher; omitted on site-wide pages. */
  mandate?: Mandate;
  /** Path of the same page without the locale prefix, e.g. "/2021-2026" (UX rule 8). */
  path: string;
};

export async function SiteHeader({ mandate, path }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const other = locale === "fr" ? "ar" : "fr";
  const { byMandate } = loadCatalogue();
  const mandates = enabledMandates(env().archiveEnabled);

  return (
    <header role="banner" className="border-b border-rule">
      <div className="mx-auto flex min-h-14 max-w-[1120px] flex-wrap items-center gap-4 px-4">
        <a href={`/${locale}`} className="font-semibold text-ink no-underline">
          Wa3d.ma
          <span
            lang="ar"
            className="ms-2 font-[family-name:var(--font-wordmark)] font-normal text-ink-muted"
          >
            وعد
          </span>
        </a>
        <nav aria-label={t("main")} className="ms-auto flex items-center gap-4 text-sm">
          {mandates.length > 0 && (
            <details className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold">
                {mandate ? t("mandate", { mandate }) : t("mandates")}
                <span aria-hidden="true" className="text-ink-muted">
                  ▾
                </span>
              </summary>
              <ul className="absolute end-0 z-10 mt-1 min-w-56 border border-rule bg-surface py-1">
                {mandates.map((item) => (
                  <li key={item}>
                    <a
                      href={`/${locale}/${item}`}
                      aria-current={item === mandate ? "page" : undefined}
                      className="block min-h-11 px-3 py-2"
                    >
                      {t("mandate", { mandate: item })}
                      {(byMandate.get(item)?.length ?? 0) === 0 && (
                        <span className="text-ink-muted"> · {t("pending")}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <a href={`/${locale}/methodologie`} className="flex min-h-11 items-center">
            {t("methodology")}
          </a>
          <a
            href={`/${other}${path}`}
            lang={other}
            hrefLang={other}
            aria-label={t("otherLanguageName")}
            className="flex min-h-11 items-center"
          >
            {t("otherLanguage")}
          </a>
        </nav>
      </div>
    </header>
  );
}
