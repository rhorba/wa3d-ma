import type { Metadata } from "next";
import { ltr } from "@/components/ui/ltr";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommitmentActions } from "@/components/detail/CommitmentActions";
import { EvidenceTimeline } from "@/components/detail/EvidenceTimeline";
import { ProgressPanel } from "@/components/detail/ProgressPanel";
import { QuoteBlock } from "@/components/detail/QuoteBlock";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StatusMark } from "@/components/ui/StatusMark";
import { routing } from "@/i18n/routing";
import { loadCatalogue } from "@/lib/catalogue/load";
import type { Commitment } from "@/lib/catalogue/schema";
import { currentStatus } from "@/lib/catalogue/status";
import { todayInCasablanca } from "@/lib/catalogue/validate";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { enabledMandates } from "@/lib/mandates";
import { alternates, openGraph, truncate } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; mandate: string; id: string }> };

// FR-1: /{locale}/{mandate}/{id} is a permanent, citable URL. Only commitments of enabled mandates
// are built; any other id (or the embargoed archive) is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const { byMandate } = loadCatalogue();
  return routing.locales.flatMap((locale) =>
    enabledMandates(env().archiveEnabled).flatMap((mandate) =>
      (byMandate.get(mandate) ?? []).map((commitment) => ({ locale, mandate, id: commitment.id })),
    ),
  );
}

function commitmentOf(mandate: string, id: string): Commitment {
  const commitment = loadCatalogue().byId.get(id);
  const enabled = enabledMandates(env().archiveEnabled) as string[];
  if (!commitment || commitment.mandate !== mandate || !enabled.includes(mandate)) notFound();
  return commitment;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, mandate, id } = await params;
  const commitment = commitmentOf(mandate, id);
  const lang = locale === "ar" ? "ar" : "fr";
  const tStatus = await getTranslations({ locale, namespace: "status" });
  const title = `${commitment.title[lang]} · Wa3d.ma`;
  // Status first, then the promise in its own words: what a reader needs from a search result.
  const description = truncate(
    `${tStatus(currentStatus(commitment))} · ${commitment.quote[lang].text}`,
  );
  const path = `/${mandate}/${id}`;
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: openGraph(locale, { title, description, url: `/${locale}${path}`, type: "article" }),
  };
}

// "(passée)" is computed when the page is built; every data change rebuilds the site (SDR-1).
const BUILT_ON = todayInCasablanca();

export default async function CommitmentPage({ params }: Props) {
  const { locale, mandate, id } = await params;
  setRequestLocale(locale);
  const commitment = commitmentOf(mandate, id);
  const lang = locale === "ar" ? "ar" : "fr";
  const t = await getTranslations("detail");
  const tStatus = await getTranslations("status");
  const tTheme = await getTranslations("theme");
  const tNav = await getTranslations("nav");
  const status = currentStatus(commitment);
  const { indicators } = loadCatalogue();

  return (
    <>
      <SiteHeader mandate={commitment.mandate} path={`/${mandate}/${id}`} />
      <main id="main" className="mx-auto max-w-[1120px] px-4">
        <div className="max-w-[680px]">
          <nav aria-label={t("breadcrumb")} className="pt-6 text-sm text-ink-muted">
            <a href={`/${locale}/${mandate}`}>{tNav.rich("mandate", { mandate, ltr })}</a>
            <span aria-hidden="true" className="mx-2">
              ›
            </span>
            <a href={`/${locale}/${mandate}?theme=${commitment.theme}`}>
              {tTheme(commitment.theme)}
            </a>
          </nav>

          <div className="pt-8 pb-6">
            <h1 className="mb-3 text-xl md:text-2xl">{commitment.title[lang]}</h1>
            <p className="flex items-center gap-2 text-md font-semibold" data-testid="status">
              <StatusMark status={status} />
              {tStatus(status)}
            </p>
            <a
              href={`/${locale}/methodologie#statut-${status}`}
              className="mt-2 inline-block text-sm"
            >
              {t("statusHelp")}
            </a>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <dt className="text-ink-muted">{t("deadline")}</dt>
                <dd data-testid="deadline">
                  <bdi>{formatDate(commitment.deadline)}</bdi>
                  {BUILT_ON > commitment.deadline && <> {t("deadlinePassed")}</>}
                </dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="text-ink-muted">{t("lastVerified")}</dt>
                <dd data-testid="last-verified">
                  <bdi>{formatDate(commitment.lastVerified)}</bdi>
                </dd>
              </div>
            </dl>
          </div>

          <QuoteBlock commitment={commitment} />
          <ProgressPanel commitment={commitment} indicators={indicators} />
          <EvidenceTimeline commitment={commitment} />
          <CommitmentActions commitment={commitment} />
        </div>
      </main>
    </>
  );
}
