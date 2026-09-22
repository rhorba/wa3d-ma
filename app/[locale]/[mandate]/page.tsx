import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MandateList } from "@/components/list/MandateList";
import { routing } from "@/i18n/routing";
import { loadCatalogue } from "@/lib/catalogue/load";
import type { Mandate } from "@/lib/catalogue/schema";
import { env } from "@/lib/env";
import { enabledMandates } from "@/lib/mandates";
import { alternates, openGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; mandate: string }> };

// SDR-1 / FR-9: only enabled mandates are built; anything else (including the embargoed
// archive) is a 404 because no page exists for it.
export const dynamicParams = false;

export function generateStaticParams() {
  const mandates = enabledMandates(env().archiveEnabled);
  return routing.locales.flatMap((locale) => mandates.map((mandate) => ({ locale, mandate })));
}

function mandateOf(value: string): Mandate {
  const mandate = enabledMandates(env().archiveEnabled).find((item) => item === value);
  if (!mandate) notFound();
  return mandate;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, mandate } = await params;
  const t = await getTranslations({ locale, namespace: "list" });
  const count = loadCatalogue().byMandate.get(mandate as Mandate)?.length ?? 0;
  const title = `${t("heading", { mandate })} · Wa3d.ma`;
  const description = t("description", { count, mandate });
  // An enabled but empty mandate is not worth indexing yet (ADR-10).
  return {
    title,
    description,
    alternates: alternates(locale, `/${mandate}`),
    openGraph: openGraph(locale, { title, description, url: `/${locale}/${mandate}` }),
    robots: count === 0 ? { index: false } : undefined,
  };
}

export default async function MandatePage({ params }: Props) {
  const { locale, mandate: raw } = await params;
  setRequestLocale(locale);
  const mandate = mandateOf(raw);
  return (
    <>
      <SiteHeader mandate={mandate} path={`/${mandate}`} />
      <MandateList mandate={mandate} />
    </>
  );
}
