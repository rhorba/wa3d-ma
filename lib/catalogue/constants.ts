// Catalogue vocabularies with no dependencies, so browser code (the filter island) can import
// them without pulling zod into the bundle. schema.ts builds its enums from these.

export const MANDATES = ["2021-2026", "2026-2031"] as const;
export const THEMES = [
  "employment",
  "social_protection",
  "health",
  "education",
  "economy",
  "governance",
  "housing",
  "water_energy",
  "other",
] as const;
// Fixed display order (PRD §5.3, UX rule 2): never re-sorted by value.
export const STATUSES = [
  "not_started",
  "in_progress",
  "achieved",
  "partial",
  "not_achieved",
  "abandoned",
] as const;
export const PROVENANCES = ["original", "official_translation", "wa3d_translation"] as const;
export const UNITS = ["percent", "count", "thousand", "mad_billion", "rank", "ratio"] as const;

export type Mandate = (typeof MANDATES)[number];
export type Theme = (typeof THEMES)[number];
export type Status = (typeof STATUSES)[number];
