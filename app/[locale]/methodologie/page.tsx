import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { StatusMark } from "@/components/ui/StatusMark";
import { STATUSES } from "@/lib/catalogue/schema";
import { env } from "@/lib/env";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

// US-9 and the main answer to the "perceived as partisan" risk (PRD §7): the method in public.
const SECTIONS = [
  "tracking",
  "statuses",
  "sources",
  "neutrality",
  "translations",
  "corrections",
  "history",
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return {
    title: `${t("title")} · Wa3d.ma`,
    description: t("lede"),
    alternates: alternates(locale, "/methodologie"),
  };
}

export default async function MethodologyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");
  const tStatus = await getTranslations("status");
  const { repoUrl } = env();
  const paragraphs = (key: string) =>
    (t.raw(key) as string[]).map((paragraph) => (
      <p key={paragraph} className="mb-3">
        {paragraph}
      </p>
    ));

  return (
    <>
      <SiteHeader path="/methodologie" />
      <main id="main" className="mx-auto max-w-[1120px] px-4 pb-8">
        <div className="max-w-[680px] pt-8 pb-6">
          <h1 className="mb-3 text-xl md:text-2xl">{t("title")}</h1>
          <p className="text-ink-muted">{t("lede")}</p>
        </div>
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,680px)] lg:gap-12">
          <nav aria-label={t("toc")} className="mb-8 text-sm lg:sticky lg:top-6 lg:self-start">
            <p className="label-caps mb-3 font-semibold">{t("toc")}</p>
            <ol className="grid gap-2">
              {SECTIONS.map((section, index) => (
                <li key={section}>
                  <a href={`#${section}`}>
                    <bdi>{index + 1}</bdi>. {t(`${section}.title`)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div>
            <section id="tracking" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("tracking.title")}</h2>
              {paragraphs("tracking.body")}
            </section>

            <section id="statuses" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("statuses.title")}</h2>
              <p className="mb-4">{t("statuses.intro")}</p>
              <dl className="border-b border-rule">
                {STATUSES.map((status) => (
                  <div
                    key={status}
                    id={`statut-${status}`}
                    className="scroll-mt-6 border-t border-rule py-4 target:bg-accent-wash"
                  >
                    <dt className="flex items-center gap-2 font-semibold">
                      <StatusMark status={status} />
                      {tStatus(status)}
                    </dt>
                    <dd className="mt-1 ps-7">{t(`statuses.definitions.${status}`)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="sources" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("sources.title")}</h2>
              {paragraphs("sources.body")}
              <p>
                <ExternalLink href={`${repoUrl}/blob/main/data/official-domains.json`}>
                  {t("sources.list")}
                </ExternalLink>
              </p>
            </section>

            <section id="neutrality" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("neutrality.title")}</h2>
              {paragraphs("neutrality.body")}
            </section>

            <section id="translations" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("translations.title")}</h2>
              {paragraphs("translations.body")}
            </section>

            <section id="corrections" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("corrections.title")}</h2>
              {paragraphs("corrections.body")}
              <p>
                <ExternalLink href={`${repoUrl}/issues/new?template=correction.yml`}>
                  {t("corrections.link")}
                </ExternalLink>
              </p>
            </section>

            <section id="history" className="border-t border-rule py-6">
              <h2 className="mb-4 text-lg font-semibold">{t("history.title")}</h2>
              {paragraphs("history.body")}
              <p>
                <ExternalLink href={`${repoUrl}/commits/main`}>{t("history.link")}</ExternalLink>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
