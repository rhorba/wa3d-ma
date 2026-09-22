import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { STATUSES, THEMES } from "./catalogue/schema";
import {
  activeCount,
  matchesFilters,
  NO_FILTERS,
  parseFilters,
  serializeFilters,
  toggle,
  type Filters,
} from "./filters";

describe("parseFilters", () => {
  it("reads comma-separated and repeated values in canonical order", () => {
    expect(parseFilters("?theme=health,employment&status=partial")).toEqual({
      themes: ["employment", "health"],
      statuses: ["partial"],
    });
    expect(parseFilters("theme=health&theme=education").themes).toEqual(["health", "education"]);
  });

  it("ignores unknown values instead of failing (Test Strategy: invalid params)", () => {
    expect(parseFilters("?theme=<script>&status=foo,partial")).toEqual({
      themes: [],
      statuses: ["partial"],
    });
    expect(parseFilters("")).toEqual(NO_FILTERS);
  });

  it("accepts URLSearchParams", () => {
    expect(parseFilters(new URLSearchParams("status=achieved")).statuses).toEqual(["achieved"]);
  });
});

describe("serializeFilters", () => {
  it("produces a shareable, canonical query string", () => {
    expect(serializeFilters({ themes: ["health", "employment"], statuses: ["partial"] })).toBe(
      "?theme=employment,health&status=partial",
    );
    expect(serializeFilters(NO_FILTERS)).toBe("");
    expect(serializeFilters({ themes: [], statuses: ["abandoned"] })).toBe("?status=abandoned");
  });

  const filters = fc.record({
    themes: fc.subarray([...THEMES]),
    statuses: fc.subarray([...STATUSES]),
  });

  it("property: parse(serialize(f)) returns the same selection", () => {
    fc.assert(
      fc.property(filters, (value: Filters) => {
        expect(parseFilters(serializeFilters(value))).toEqual(value);
      }),
    );
  });
});

describe("matchesFilters", () => {
  const row = { theme: "health", status: "partial" } as const;

  it("matches everything without filters", () => {
    expect(matchesFilters(row, NO_FILTERS)).toBe(true);
  });

  it("ORs within a group and ANDs across groups", () => {
    expect(matchesFilters(row, { themes: ["health", "housing"], statuses: [] })).toBe(true);
    expect(matchesFilters(row, { themes: ["health"], statuses: ["achieved"] })).toBe(false);
    expect(matchesFilters(row, { themes: ["housing"], statuses: ["partial"] })).toBe(false);
    expect(matchesFilters(row, { themes: ["health"], statuses: ["partial", "achieved"] })).toBe(
      true,
    );
  });
});

describe("helpers", () => {
  it("toggles a value in or out", () => {
    expect(toggle(["a", "b"], "a")).toEqual(["b"]);
    expect(toggle(["b"], "a")).toEqual(["b", "a"]);
  });

  it("counts active filters", () => {
    expect(activeCount({ themes: ["health"], statuses: ["partial", "achieved"] })).toBe(3);
  });
});
