import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommitmentFilters, type FilterLabels } from "@/components/filters/CommitmentFilters";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CommitmentRow } from "@/components/list/CommitmentRow";
import { StatusCounts } from "@/components/list/StatusCounts";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { routing } from "@/i18n/routing";
import { loadCatalogue } from "@/lib/catalogue/load";
import { STATUSES, THEMES, type Mandate } from "@/lib/catalogue/schema";
import { currentStatus, statusCounts } from "@/lib/catalogue/status";
import { env } from "@/lib/env";
import { groupByTheme, rowProgress } from "@/lib/list";
import { enabledMandates } from "@/lib/mandates";

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
  const empty = (loadCatalogue().byMandate.get(mandate as Mandate)?.length ?? 0) === 0;
  // An enabled but empty mandate is not worth indexing yet (ADR-10).
  return {
    title: `${t("heading", { mandate })} · Wa3d.ma`,
    robots: empty ? { index: false } : undefined,
  };
}

export default async function MandatePage({ params }: Props) {
  const { locale, mandate: raw } = await params;
  setRequestLocale(locale);
  const mandate = mandateOf(raw);
  const t = await getTranslations("list");
  const tTheme = await getTranslations("theme");
  const tStatus = await getTranslations("status");
  const tFilters = await getTranslations("filters");
  const { byMandate, indicators } = loadCatalogue();
  const commitments = byMandate.get(mandate) ?? [];
  const programme = commitments[0]?.origin;
  const labels: FilterLabels = {
    theme: tFilters("theme"),
    status: tFilters("status"),
    apply: tFilters("apply"),
    reset: tFilters("reset"),
    noResults: tFilters("noResults"),
    shown: { one: tFilters("shownOne"), other: tFilters("shownOther") },
    active: { one: tFilters("activeOne"), other: tFilters("activeOther") },
    themes: Object.fromEntries(
      THEMES.map((theme) => [theme, tTheme(theme)]),
    ) as FilterLabels["themes"],
    statuses: Object.fromEntries(
      STATUSES.map((status) => [status, tStatus(status)]),
    ) as FilterLabels["statuses"],
  };
  const presentThemes = THEMES.filter((theme) => commitments.some((c) => c.theme === theme));

  return (
    <>
      <SiteHeader mandate={mandate} path={`/${mandate}`} />
      <main id="main" className="mx-auto max-w-[1120px] px-4">
        <div className="pt-8 pb-6">
          <p className="label-caps mb-2 text-ink-muted">{t("eyebrow", { mandate })}</p>
          <h1 className="mb-3 text-xl md:text-2xl">{t("heading", { mandate })}</h1>
          {commitments.length === 0 ? (
            <div className="max-w-[680px]" data-testid="pending-mandate">
              <p className="font-semibold">{t("pendingTitle")}</p>
              <p className="mt-2">{t("pendingText")}</p>
              <p className="mt-4">
                <a href={`/${locale}/methodologie`}>{t("pendingMethodology")}</a>
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-muted">
                {t.rich("lede", {
                  count: commitments.length,
                  link: (chunks) =>
                    programme ? <ExternalLink href={programme.url}>{chunks}</ExternalLink> : chunks,
                })}
              </p>
              <StatusCounts counts={statusCounts(commitments)} />
            </>
          )}
        </div>

        {commitments.length > 0 && (
          <div className="list-layout">
            <CommitmentFilters
              listId="commitments"
              rows={commitments.map((c) => ({
                id: c.id,
                theme: c.theme,
                status: currentStatus(c),
              }))}
              themes={presentThemes}
              statuses={[...STATUSES]}
              labels={labels}
            />
            <div id="commitments" className="commitments">
              <p className="static-count mt-3 text-sm text-ink-muted" data-testid="result-count">
                {t("total", { count: commitments.length })}
              </p>
              {/* Without JavaScript the list is grouped by theme with a jump index (UX Flow 2). The filter
                island flattens it back to programme order via CSS (data-enhanced, globals.css). */}
              <div className="commitment-list mt-3" data-testid="commitment-list">
                <nav
                  aria-label={t("themes")}
                  className="theme-index mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm"
                >
                  {groupByTheme(commitments).map((group) => (
                    <a key={group.theme} href={`#theme-${group.theme}`}>
                      {tTheme(group.theme)}
                    </a>
                  ))}
                </nav>
                {groupByTheme(commitments).map((group) => (
                  <section
                    key={group.theme}
                    aria-labelledby={`theme-${group.theme}`}
                    className="theme-group"
                  >
                    <h2
                      id={`theme-${group.theme}`}
                      className="label-caps mt-6 mb-2 font-semibold text-ink"
                    >
                      {tTheme(group.theme)}
                    </h2>
                    <ol className="border-b border-rule">
                      {group.items.map(({ commitment, position }) => (
                        <CommitmentRow
                          key={commitment.id}
                          commitment={commitment}
                          progress={rowProgress(commitment, indicators)}
                          position={position}
                        />
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
