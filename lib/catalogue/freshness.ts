import type { Commitment } from "./schema";

// PRD G3: a commitment counts as stale when it was last verified more than 45 days ago.
export const FRESHNESS_DAYS = 45;

const toUtcDay = (isoDate: string) =>
  Date.UTC(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10)),
  );

/** Whole days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcDay(to) - toUtcDay(from)) / 86_400_000);
}

/** Commitments last verified more than `days` days before `today`, oldest first. */
export function staleCommitments<T extends Pick<Commitment, "lastVerified">>(
  commitments: readonly T[],
  today: string,
  days: number = FRESHNESS_DAYS,
): T[] {
  return commitments
    .filter((commitment) => daysBetween(commitment.lastVerified, today) > days)
    .sort((a, b) => a.lastVerified.localeCompare(b.lastVerified));
}
