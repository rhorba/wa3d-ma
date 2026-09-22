import { STATUSES, THEMES, type Status, type Theme } from "./catalogue/constants";

// FR-10: list filters live in the URL (?theme=a,b&status=c) so a filtered view can be shared.
// Pure functions; the client island only wires them to the DOM.

export type Filters = { themes: Theme[]; statuses: Status[] };
export type FilterableRow = { theme: Theme; status: Status };

export const NO_FILTERS: Filters = { themes: [], statuses: [] };

function pick<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] {
  const requested = new Set(
    params
      .getAll(key)
      .flatMap((value) => value.split(","))
      .map((value) => value.trim()),
  );
  // Unknown values are ignored, never fatal; the result keeps the canonical order.
  return allowed.filter((value) => requested.has(value));
}

/** Reads filters from a query string; invalid values are dropped. */
export function parseFilters(search: string | URLSearchParams): Filters {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return { themes: pick(params, "theme", THEMES), statuses: pick(params, "status", STATUSES) };
}

/** Canonical query string ("" when nothing is selected), for history.replaceState. */
export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  const themes = THEMES.filter((theme) => filters.themes.includes(theme));
  const statuses = STATUSES.filter((status) => filters.statuses.includes(status));
  if (themes.length) params.set("theme", themes.join(","));
  if (statuses.length) params.set("status", statuses.join(","));
  const query = params.toString().replaceAll("%2C", ",");
  return query ? `?${query}` : "";
}

/** OR within a group, AND across groups; an empty group does not filter (UX Flow 2). */
export function matchesFilters(row: FilterableRow, filters: Filters): boolean {
  return (
    (filters.themes.length === 0 || filters.themes.includes(row.theme)) &&
    (filters.statuses.length === 0 || filters.statuses.includes(row.status))
  );
}

export function toggle<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export const activeCount = (filters: Filters) => filters.themes.length + filters.statuses.length;
