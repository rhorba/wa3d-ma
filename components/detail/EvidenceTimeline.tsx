import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { StatusMark } from "@/components/ui/StatusMark";
import type { Commitment } from "@/lib/catalogue/schema";
import { formatDate } from "@/lib/format";

/**
 * UI §3 evidence timeline, newest first: the first entry is the current status (ADR-2). Notes are
 * plain text split on blank lines, never HTML (ADR-8). Press pointers stay visibly secondary (FR-5).
 */
export async function EvidenceTimeline({ commitment }: { commitment: Commitment }) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "fr";
  const t = await getTranslations("timeline");
  const tStatus = await getTranslations("status");
  const entries = [...commitment.evidence].reverse();

  return (
    <section
      aria-labelledby="h-timeline"
      className="border-t border-rule py-6"
      data-testid="timeline"
    >
      <h2 id="h-timeline" className="label-caps mb-4 font-semibold">
        {t("heading")}{" "}
        <span className="font-normal tracking-normal text-ink-muted normal-case">{t("order")}</span>
      </h2>
      {entries.length === 0 ? (
        <p data-testid="timeline-empty">{t("empty")}</p>
      ) : (
        <ol>
          {entries.map((entry, index) => (
            <li
              key={entry.date}
              className="relative ps-8 pb-6 before:absolute before:start-2 before:top-6 before:bottom-0 before:w-px before:bg-rule last:before:hidden"
              data-date={entry.date}
            >
              <span className="absolute start-0 top-0.5">
                <StatusMark status={entry.status} />
              </span>
              <p className="text-sm text-ink-muted">
                <bdi>{formatDate(entry.date)}</bdi>
                {index === 0 && <> · {t("current")}</>}
              </p>
              <p className="font-semibold">{tStatus(entry.status)}</p>
              {entry.note[lang].split(/\n{2,}/).map((paragraph, i) => (
                <p key={i} className="my-1">
                  {paragraph}
                </p>
              ))}
              <p className="text-sm">
                {t("source")}{" "}
                <ExternalLink href={entry.source.url}>
                  <bdi>{entry.source.name}</bdi>
                </ExternalLink>
                {entry.source.archiveUrl && (
                  <>
                    {" · "}
                    <ExternalLink href={entry.source.archiveUrl} variant="secondary">
                      {t("archived")}
                    </ExternalLink>
                  </>
                )}
              </p>
              {entry.pointers && entry.pointers.length > 0 && (
                <p className="mt-1 text-sm text-ink-muted" data-testid="pointers">
                  {t("press")}{" "}
                  {entry.pointers.map((pointer, i) => (
                    <span key={pointer.url}>
                      {i > 0 && " · "}
                      <ExternalLink href={pointer.url} variant="secondary">
                        <bdi>{pointer.name}</bdi>
                      </ExternalLink>
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
