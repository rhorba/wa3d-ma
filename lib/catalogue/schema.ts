import { z } from "zod";

// Catalogue schema: docs/database-wa3d-ma.md §3 (v1.2). Pure module: zod only.
// Cross-file and cross-field rules (V-2…V-17) live in validate.ts; this file is V-1.

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

export const Mandate = z.enum(MANDATES);

// First day of each mandate (V-8: no evidence before it). docs/database-wa3d-ma.md §3.
// 2021-2026: the government was appointed on 2021-10-07. 2026-2031: placeholder until the new
// government is appointed (TBC, ~Oct 2026); the day after the 2026-09-23 election is a safe lower bound.
export const MANDATE_START: Record<(typeof MANDATES)[number], string> = {
  "2021-2026": "2021-10-07",
  "2026-2031": "2026-09-24",
};
export const Theme = z.enum(THEMES);
export const Status = z.enum(STATUSES);
export const Provenance = z.enum(PROVENANCES);

/** "YYYY-MM-DD", a real calendar date. */
export const IsoDate = z.iso.date();
export const HttpsUrl = z.url({ protocol: /^https$/, error: "must be an https:// URL" });
/** Trimmed, non-empty, NFC-normalised text (no invisible Unicode drift between FR/AR edits). */
export const Text = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value === value.normalize("NFC"), "must be NFC-normalised Unicode");
export const Id = z
  .string()
  .max(60)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case: a-z, 0-9 and single hyphens");

export const Source = z.strictObject({
  name: Text,
  url: HttpsUrl,
  published: IsoDate.optional(),
  accessed: IsoDate,
  archiveUrl: HttpsUrl.optional(),
});

export const Localized = z.strictObject({ fr: Text, ar: Text });

export const QuoteText = z.strictObject({ text: Text, provenance: Provenance });

export const Pointer = z.strictObject({ name: Text, url: HttpsUrl });

export const Evidence = z.strictObject({
  date: IsoDate,
  status: Status,
  note: Localized,
  source: Source,
  pointers: z.array(Pointer).max(3).optional(),
});

export const Target = z.strictObject({
  indicatorId: Id,
  baseline: z.strictObject({
    value: z.number(),
    year: z.number().int(),
    source: Source,
  }),
  value: z.number(),
  direction: z.enum(["increase", "decrease"]),
});

export const Commitment = z.strictObject({
  schemaVersion: z.literal(1),
  id: Id,
  mandate: Mandate,
  theme: Theme,
  // Neutral label for cards, <title> and search results (DB §8): reuses the quote's own words.
  title: z.strictObject({ fr: Text.pipe(z.string().max(90)), ar: Text.pipe(z.string().max(90)) }),
  quote: z.strictObject({ fr: QuoteText, ar: QuoteText }),
  origin: Source.extend({ page: z.number().int().positive().optional() }),
  // Absent ⇒ editorial commitment: status only, never an invented target (FR-7).
  target: Target.optional(),
  deadline: IsoDate,
  lastVerified: IsoDate,
  // Status is derived from the latest entry (ADR-2); an empty list means not_started.
  evidence: z.array(Evidence),
});

export const IndicatorValue = z.strictObject({
  year: z.number().int(),
  period: z
    .string()
    .regex(/^(Y|Q[1-4]|M(0[1-9]|1[0-2]))$/, "must be Y, Q1-Q4 or M01-M12")
    .default("Y"),
  value: z.number(),
  source: Source,
});

export const Indicator = z.strictObject({
  schemaVersion: z.literal(1),
  id: Id,
  name: Localized,
  unit: z.enum(UNITS),
  decimals: z.number().int().min(0).max(2),
  values: z.array(IndicatorValue).min(1),
});

export type Mandate = z.infer<typeof Mandate>;
export type Theme = z.infer<typeof Theme>;
export type Status = z.infer<typeof Status>;
export type Provenance = z.infer<typeof Provenance>;
export type Source = z.infer<typeof Source>;
export type Evidence = z.infer<typeof Evidence>;
export type Target = z.infer<typeof Target>;
export type Commitment = z.infer<typeof Commitment>;
export type IndicatorValue = z.infer<typeof IndicatorValue>;
export type Indicator = z.infer<typeof Indicator>;
