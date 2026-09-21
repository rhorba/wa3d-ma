import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { todayInCasablanca } from "@/lib/catalogue/validate";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";

// The build date is the date the pages were generated: every deploy rebuilds them (SDR-1).
const BUILT_ON = todayInCasablanca();

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const { repoUrl } = env();

  return (
    <footer role="contentinfo" className="mt-12 border-t border-rule py-8 text-sm text-ink-muted">
      <div className="mx-auto max-w-[1120px] px-4">
        <p>{t("neutrality")}</p>
        <nav aria-label={t("label")} className="my-3 flex flex-wrap gap-x-4 gap-y-2">
          <a href={`/${locale}/methodologie`}>{t("methodology")}</a>
          <ExternalLink href={`${repoUrl}/issues/new?template=correction.yml`}>
            {t("report")}
          </ExternalLink>
          <ExternalLink href={repoUrl}>{t("source")}</ExternalLink>
        </nav>
        <p>
          {t("updated")} <bdi>{formatDate(BUILT_ON)}</bdi>
        </p>
      </div>
    </footer>
  );
}
