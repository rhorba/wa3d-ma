import { getLocale, getTranslations } from "next-intl/server";
import { CommitmentFilters, type FilterLabels } from "@/components/filters/CommitmentFilters";
import { CommitmentRow } from "@/components/list/CommitmentRow";
import { StatusCounts } from "@/components/list/StatusCounts";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { loadCatalogue } from "@/lib/catalogue/load";
import { STATUSES, THEMES, type Mandate } from "@/lib/catalogue/schema";
import { currentStatus, statusCounts } from "@/lib/catalogue/status";
import { groupByTheme, rowProgress } from "@/lib/list";

/** The body of a mandate's list (UX §4 "List"), shared by /{locale}/{mandate} and the home page (ADR-10). */
export async function MandateList({ mandate }: { mandate: Mandate }) {
  const locale = await getLocale();
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
  const groups = groupByTheme(commitments);

  return (
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
            rows={commitments.map((c) => ({ id: c.id, theme: c.theme, status: currentStatus(c) }))}
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
                {groups.map((group) => (
                  <a key={group.theme} href={`#theme-${group.theme}`}>
                    {tTheme(group.theme)}
                  </a>
                ))}
              </nav>
              {groups.map((group) => (
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
  );
}
