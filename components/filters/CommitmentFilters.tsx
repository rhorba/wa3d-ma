"use client";

// SDR-2: the only client component. It enhances the static list: reads ?theme=&status= from the
// URL, hides non-matching rows, keeps the URL in sync (FR-10) and announces the result count.
// Labels arrive as props (no i18n runtime in the browser, NFR-1 budget); no dependencies.
import { useEffect, useRef, useState } from "react";
import type { Status, Theme } from "@/lib/catalogue/constants";
import {
  activeCount,
  matchesFilters,
  NO_FILTERS,
  parseFilters,
  serializeFilters,
  toggle,
  type Filters,
  type FilterableRow,
} from "@/lib/filters";

export type FilterLabels = {
  theme: string;
  status: string;
  apply: string;
  reset: string;
  noResults: string;
  /** "{shown}" and "{total}" are replaced; "one" is used when shown === 1. */
  shown: { one: string; other: string };
  active: { one: string; other: string };
  themes: Record<Theme, string>;
  statuses: Record<Status, string>;
};

type Props = {
  rows: (FilterableRow & { id: string })[];
  themes: Theme[];
  statuses: Status[];
  labels: FilterLabels;
  listId: string;
};

const fill = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export function CommitmentFilters({ rows, themes, statuses, labels, listId }: Props) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  // Enhance once: take the filters from the URL and switch the list to its flat layout.
  useEffect(() => {
    setFilters(parseFilters(window.location.search));
    document.getElementById(listId)?.setAttribute("data-enhanced", "");
    setReady(true);
  }, [listId]);

  const shown = rows.filter((row) => matchesFilters(row, filters));

  useEffect(() => {
    if (!ready) return;
    const visible = new Set(
      rows.filter((row) => matchesFilters(row, filters)).map((row) => row.id),
    );
    document
      .getElementById(listId)
      ?.querySelectorAll<HTMLElement>("li[data-id]")
      .forEach((item) => {
        item.hidden = !visible.has(item.dataset.id ?? "");
      });
    const { pathname, hash } = window.location;
    window.history.replaceState(null, "", `${pathname}${serializeFilters(filters)}${hash}`);
  }, [filters, ready, listId, rows]);

  const count = activeCount(filters);
  const summary = fill(shown.length === 1 ? labels.shown.one : labels.shown.other, {
    shown: shown.length,
    total: rows.length,
  });

  const chip = (
    group: "themes" | "statuses",
    value: Theme | Status,
    label: string,
    variant: "chip" | "row",
  ) => {
    const pressed = (filters[group] as string[]).includes(value);
    return (
      <button
        key={value}
        type="button"
        aria-pressed={pressed}
        data-variant={variant}
        className="filter-chip"
        onClick={() =>
          setFilters((current) => ({
            ...current,
            [group]: toggle(current[group] as string[], value),
          }))
        }
      >
        {pressed && (
          <span aria-hidden="true" className="text-accent">
            ✓
          </span>
        )}
        {label}
      </button>
    );
  };

  const groups = (variant: "chip" | "row") => (
    <>
      <fieldset className="filter-group">
        <legend className="label-caps mb-3 font-semibold">{labels.theme}</legend>
        <div className="filter-options" data-variant={variant}>
          {themes.map((theme) => chip("themes", theme, labels.themes[theme], variant))}
        </div>
      </fieldset>
      <fieldset className="filter-group">
        <legend className="label-caps mb-3 font-semibold">{labels.status}</legend>
        <div className="filter-options" data-variant={variant}>
          {statuses.map((status) => chip("statuses", status, labels.statuses[status], variant))}
        </div>
      </fieldset>
    </>
  );

  const reset = (
    <button type="button" className="filter-reset" onClick={() => setFilters(NO_FILTERS)}>
      {labels.reset}
    </button>
  );

  return (
    <>
      {/* Desktop (≥ 1024px): a ruled facet list in the side column. */}
      <aside
        hidden={!ready}
        className="filters-desktop"
        aria-label={`${labels.theme} · ${labels.status}`}
      >
        {count > 0 && (
          <p className="mb-6 text-sm">
            {fill(count === 1 ? labels.active.one : labels.active.other, { count })} · {reset}
          </p>
        )}
        {groups("row")}
      </aside>

      {/* Mobile and tablet: two buttons opening a bottom sheet. */}
      <div hidden={!ready} className="filters-mobile">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="filter-button"
            onClick={() => dialog.current?.showModal()}
          >
            {labels.theme}
            {filters.themes.length > 0 && ` · ${filters.themes.length}`}
          </button>
          <button
            type="button"
            className="filter-button"
            onClick={() => dialog.current?.showModal()}
          >
            {labels.status}
            {filters.statuses.length > 0 && ` · ${filters.statuses.length}`}
          </button>
        </div>
        {count > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {filters.themes.map((theme) => (
              <span key={theme} className="filter-tag">
                <span aria-hidden="true" className="text-accent">
                  ✓
                </span>
                {labels.themes[theme]}
              </span>
            ))}
            {filters.statuses.map((status) => (
              <span key={status} className="filter-tag">
                <span aria-hidden="true" className="text-accent">
                  ✓
                </span>
                {labels.statuses[status]}
              </span>
            ))}
            {reset}
          </div>
        )}
        <dialog
          ref={dialog}
          className="filter-sheet"
          aria-label={`${labels.theme} · ${labels.status}`}
        >
          {groups("chip")}
          <button
            type="button"
            className="filter-button w-full"
            onClick={() => dialog.current?.close()}
          >
            {labels.apply}
          </button>
        </dialog>
      </div>

      <div hidden={!ready} className="filters-status">
        <p className="text-sm text-ink-muted" aria-live="polite" data-testid="filter-count">
          {summary}
        </p>
        {ready && shown.length === 0 && (
          <p className="mt-4" data-testid="no-results">
            {labels.noResults} {reset}
          </p>
        )}
      </div>
    </>
  );
}
