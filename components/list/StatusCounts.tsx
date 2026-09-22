import { getTranslations } from "next-intl/server";
import { StatusMark } from "@/components/ui/StatusMark";
import type { Status } from "@/lib/catalogue/schema";

/**
 * UX rule 2: counts, never a score. All six statuses in the fixed §5.3 order, each cell the same
 * size and weight (count above mark + label); no percentage of "promises kept".
 */
export async function StatusCounts({ counts }: { counts: Record<Status, number> }) {
  const t = await getTranslations("status");
  const tl = await getTranslations("list");
  return (
    <ul
      aria-label={tl("countsLabel")}
      data-testid="status-counts"
      className="status-counts mt-6 grid grid-cols-2 border-y border-rule md:grid-cols-3 lg:grid-cols-6"
    >
      {(Object.entries(counts) as [Status, number][]).map(([status, count]) => (
        <li
          key={status}
          data-status={status}
          className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 py-3 pe-4 text-sm leading-snug"
        >
          <span className="col-span-2 text-lg leading-tight font-semibold">
            <bdi>{count}</bdi>
          </span>
          <StatusMark status={status} />
          <span>{t(status)}</span>
        </li>
      ))}
    </ul>
  );
}
