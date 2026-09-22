import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MandateList } from "@/components/list/MandateList";
import { loadCatalogue } from "@/lib/catalogue/load";
import { env } from "@/lib/env";
import { defaultMandate } from "@/lib/mandates";

type Props = { params: Promise<{ locale: string }> };

const homeMandate = () => defaultMandate(loadCatalogue().byMandate, env().archiveEnabled);

// ADR-10: the home page is the newest published mandate; its canonical URL is the mandate page,
// so search engines do not see the same list twice.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const mandate = homeMandate();
  return mandate ? { alternates: { canonical: `/${locale}/${mandate}` } } : {};
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const mandate = homeMandate();

  if (mandate) {
    return (
      <>
        <SiteHeader mandate={mandate} path="" />
        <MandateList mandate={mandate} />
      </>
    );
  }

  // No enabled mandate has commitments yet (before the embargo lifts and the 2026-2031 programme).
  const t = await getTranslations("home");
  return (
    <>
      <SiteHeader path="" />
      <main id="main" className="mx-auto max-w-[680px] px-4 py-8" data-testid="home-intro">
        <p className="label-caps mb-2 text-ink-muted">Wa3d.ma</p>
        <h1 className="mb-4 text-xl md:text-2xl">{t("heading")}</h1>
        {(t.raw("intro") as string[]).map((paragraph) => (
          <p key={paragraph} className="mb-3">
            {paragraph}
          </p>
        ))}
        <p className="mt-6 border-t border-rule pt-6 text-sm text-ink-muted">{t("upcoming")}</p>
        <p className="mt-4">
          <a href={`/${locale}/methodologie`}>{t("methodology")}</a>
        </p>
      </main>
    </>
  );
}
