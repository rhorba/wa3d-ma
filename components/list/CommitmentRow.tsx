import { getLocale, getTranslations } from "next-intl/server";
import { StatusMark } from "@/components/ui/StatusMark";
import type { Commitment } from "@/lib/catalogue/schema";
import { currentStatus } from "@/lib/catalogue/status";
import { formatDate } from "@/lib/format";
import type { RowProgress } from "@/lib/list";

type Props = { commitment: Commitment; progress: RowProgress; position: number };

/** UI §3 "commitment row": a ruled row, not a card; the whole row is one link. */
export async function CommitmentRow({ commitment, progress, position }: Props) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "fr";
  const t = await getTranslations("list");
  const tStatus = await getTranslations("status");
  const tTheme = await getTranslations("theme");
  const status = currentStatus(commitment);

  return (
    <li
      className="border-t border-rule"
      style={{ order: position }}
      data-id={commitment.id}
      data-theme={commitment.theme}
      data-status={status}
    >
      <a
        href={`/${locale}/${commitment.mandate}/${commitment.id}`}
        className="group block py-4 text-ink no-underline"
      >
        <span className="row-theme label-caps text-ink-muted">{tTheme(commitment.theme)}</span>
        <span className="mt-1 mb-2 block leading-snug font-semibold group-hover:underline md:text-md">
          {commitment.title[lang]}
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <StatusMark status={status} />
            {tStatus(status)}
          </span>
          {progress.kind === "metric" && (
            <span className="inline-flex items-center gap-2 text-ink-muted">
              <span className="relative block h-1.5 w-22 bg-rule" aria-hidden="true">
                <span
                  className="absolute inset-y-0 start-0 bg-ink"
                  style={{ width: `${progress.percent}%` }}
                />
              </span>
              {progress.reached
                ? t("targetReached")
                : t("towardTarget", { percent: progress.percent })}
            </span>
          )}
          <span className="text-ink-muted">
            {progress.kind === "editorial" && <>{t("noTarget")} · </>}
            {progress.kind === "no-data" && <>{t("noData")} · </>}
            {t("verified")} <bdi>{formatDate(commitment.lastVerified)}</bdi>
          </span>
        </span>
      </a>
    </li>
  );
}
