import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";

// notFound() called inside a locale page (e.g. a commitment under the wrong mandate) renders this
// localized page; URLs that match no page at all get the bilingual app/not-found.tsx.
export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  return (
    <>
      <SiteHeader path="" />
      <main id="main" className="mx-auto max-w-[680px] px-4 py-16">
        <h1 className="mb-3 text-xl md:text-2xl">{t("title")}</h1>
        <p>{t("text")}</p>
        <p className="mt-4 flex flex-wrap gap-4">
          <a href={`/${locale}`}>{t("home")}</a>
          <a href={`/${locale}/methodologie`}>{t("methodology")}</a>
        </p>
      </main>
    </>
  );
}
