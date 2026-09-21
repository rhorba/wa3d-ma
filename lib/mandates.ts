import { MANDATES, type Commitment, type Mandate } from "./catalogue/schema";

/** Newest first: the order of the mandate switcher. */
export const MANDATES_NEWEST_FIRST: readonly Mandate[] = [...MANDATES].sort().reverse();

/** FR-9 / SDR-3: the 2021-2026 archive exists on the site only when the flag is on. */
export function enabledMandates(archiveEnabled: boolean): Mandate[] {
  return MANDATES_NEWEST_FIRST.filter((mandate) => mandate !== "2021-2026" || archiveEnabled);
}

/**
 * ADR-10: the home page shows the newest enabled mandate that has at least one commitment,
 * or null when none has (the home then explains the project instead).
 */
export function defaultMandate(
  byMandate: ReadonlyMap<Mandate, readonly Commitment[]>,
  archiveEnabled: boolean,
): Mandate | null {
  return (
    enabledMandates(archiveEnabled).find((mandate) => (byMandate.get(mandate)?.length ?? 0) > 0) ??
    null
  );
}
