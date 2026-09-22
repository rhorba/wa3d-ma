import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Commitment, Indicator } from "@/lib/catalogue/schema";
import { progressPanel, withPage } from "@/lib/detail";
import { formatNumber } from "@/lib/format";

type Props = { commitment: Commitment; indicators: ReadonlyMap<string, Indicator> };

/** UI §3 progress bar: baseline → latest official value → target, each with its year and source. */
export async function ProgressPanel({ commitment, indicators }: Props) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "fr";
  const t = await getTranslations("detail");
  const tUnit = await getTranslations("unit");
  const panel = progressPanel(commitment, indicators);
  const number = (indicator: Indicator | undefined, value: number) =>
    indicator
      ? tUnit(indicator.unit, { value: formatNumber(value, indicator.decimals) })
      : formatNumber(value);

  return (
    <section
      aria-labelledby="h-progress"
      className="border-t border-rule py-6"
      data-testid="progress"
    >
      <h2 id="h-progress" className="label-caps mb-4 font-semibold">
        {t("progress")}
      </h2>

      {panel.kind === "editorial" && <p data-testid="editorial">{t("editorial")}</p>}

      {panel.kind === "no-data" && (
        <div data-testid="no-data">
          <p className="font-semibold">{t("noData")}</p>
          {panel.lastKnown && (
            <p className="mt-2 text-sm text-ink-muted">
              {t("noDataText", {
                year: panel.baselineYear,
                value: number(panel.indicator, panel.lastKnown.value),
                lastYear: panel.lastKnown.year,
              })}
            </p>
          )}
        </div>
      )}

      {panel.kind === "metric" && (
        <>
          <div
            role="img"
            aria-label={t("progressLabel", {
              latest: number(panel.indicator, panel.latest.value),
              target: number(panel.indicator, panel.target.value),
              percent: Math.floor(panel.ratio * 100),
              baseline: panel.baseline.year,
            })}
            className="relative h-2 bg-rule"
          >
            <span
              className="absolute inset-y-0 start-0 bg-ink"
              style={{ width: `${panel.ratio * 100}%` }}
            />
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt>{t("baseline")}</dt>
              <dd className="text-base font-semibold">
                <bdi>{number(panel.indicator, panel.baseline.value)}</bdi>
              </dd>
              <dd className="text-ink-muted">
                <bdi>{panel.baseline.year}</bdi>
                <span className="block">
                  <ExternalLink href={panel.baseline.source.url}>
                    {panel.baseline.source.name}
                  </ExternalLink>
                </span>
              </dd>
            </div>
            <div className="text-center">
              <dt>{t("latest")}</dt>
              <dd className="text-base font-semibold">
                <bdi>{number(panel.indicator, panel.latest.value)}</bdi>
              </dd>
              <dd className="text-ink-muted">
                <bdi>
                  {panel.latest.year}
                  {panel.latest.period !== "Y" ? ` ${panel.latest.period}` : ""}
                </bdi>
                <span className="block">
                  <ExternalLink href={panel.latest.source.url}>
                    {panel.latest.source.name}
                  </ExternalLink>
                </span>
              </dd>
            </div>
            <div className="text-end">
              <dt>{t("target")}</dt>
              <dd className="text-base font-semibold">
                <bdi>{number(panel.indicator, panel.target.value)}</bdi>
              </dd>
              <dd className="text-ink-muted">
                <bdi>{panel.target.year}</bdi>
                <span className="block">
                  <ExternalLink href={withPage(commitment.origin.url, commitment.origin.page)}>
                    {commitment.origin.page
                      ? t("page", { page: commitment.origin.page })
                      : commitment.origin.name}
                  </ExternalLink>
                </span>
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-ink-muted">
            {panel.indicator.name[lang]}
            {panel.direction === "decrease" && (
              <>
                {" · "}
                {t("decreaseCaption", {
                  baseline: number(panel.indicator, panel.baseline.value),
                  target: number(panel.indicator, panel.target.value),
                })}
              </>
            )}
          </p>
        </>
      )}
    </section>
  );
}
