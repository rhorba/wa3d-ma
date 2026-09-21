import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";

type Props = { params: Promise<{ locale: string }> };

// Placeholder until Story 2.6 (home = newest published mandate, ADR-10).
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <SiteHeader path="" />
      <main id="main" className="mx-auto max-w-[680px] px-4 py-8">
        <h1 className="text-xl md:text-2xl">{t("title")}</h1>
        <p className="mt-3">{t("building")}</p>
      </main>
    </>
  );
}
