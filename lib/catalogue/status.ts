import { STATUSES, type Commitment, type Status } from "./schema";

// ADR-2: the status is never stored. It is the status of the latest-dated evidence entry,
// or not_started when there is none (FR-4). Assumes a validated catalogue: V-5 guarantees
// evidence is strictly ascending by date, so the last entry is the latest.
export function currentStatus(commitment: Pick<Commitment, "evidence">): Status {
  return commitment.evidence.at(-1)?.status ?? "not_started";
}

/** Counts per status in the fixed display order (UX rule 2); every status is present, even at 0. */
export function statusCounts(
  commitments: readonly Pick<Commitment, "evidence">[],
): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<
    Status,
    number
  >;
  for (const commitment of commitments) counts[currentStatus(commitment)] += 1;
  return counts;
}
