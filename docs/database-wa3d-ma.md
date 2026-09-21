# Database Design: Wa3d.ma (وعد)
**Architecture Reference**: docs/architecture-wa3d-ma.md (v1.0, Approved) · **Security**: docs/security-wa3d-ma.md (v1.0, Approved)
**Version**: 1.2 | **Date**: 2026-09-21 | **Author**: DBA | **Status**: Approved (2026-09-21) · v1.1 (`target.baseline.source`) and v1.2 (V-17) approved 2026-09-21

## 1. Database Selection
- **Engine**: none. The store is **JSON files in git**, validated by zod (ADR-1, ADR-7).
- **Rationale**: < 5 MB of public data, one writer, reads only at build time, and git provides history, review and backup. A database would add runtime state, secrets and cost for no benefit (YAGNI).
- **Hosting**: GitHub (remote) + local clone in OneDrive (second copy). RPO 0 (System Design §1).

## 2. Entity-Relationship Model
```
Mandate (code constant in lib/mandates.ts)
   └─1:N─► Commitment            data/promises/<mandate>/<id>.json
               ├─1:1─► Origin (Source + page)
               ├─0:1─► Target ──N:1──► Indicator      data/indicators/<indicatorId>.json
               └─1:N─► Evidence (ordered by date)          └─1:N─► IndicatorValue (ordered by year)
                           └─0:N─► Pointer (press, secondary)
Reference lists:  data/official-domains.json (SEC-3) · data/banned-words.json (FR-11, G2)
```
**Current status** is never stored. It is computed as `last(evidence).status ?? 'not_started'` (ADR-2).

## 3. Schema Design (zod 4 shapes, `lib/catalogue/schema.ts`)
```ts
const IsoDate  = z.iso.date()                                   // "YYYY-MM-DD", a real calendar date
const HttpsUrl = z.url({ protocol: /^https$/ })
const Text     = z.string().trim().min(1).refine(s => s === s.normalize('NFC'))   // no invisible Unicode drift
const Id       = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60)

const Mandate  = z.enum(['2021-2026', '2026-2031'])
const Theme    = z.enum(['employment','social_protection','health','education','economy',
                         'governance','housing','water_energy','other'])
const Status   = z.enum(['not_started','in_progress','achieved','partial','not_achieved','abandoned'])
const Provenance = z.enum(['original','official_translation','wa3d_translation'])     // ADR-9

const Source = z.object({
  name: Text,                    // "Programme gouvernemental 2021-2026", "HCP — Note ENE T2 2024"
  url: HttpsUrl,                 // + official-domain allowlist (V-7)
  published: IsoDate.optional(), // date on the document, if known
  accessed: IsoDate,             // date the curator last opened it (renamed from HANDOFF `lastUpdated`)
  archiveUrl: HttpsUrl.optional()  // web.archive.org copy (Security: link-rot)
})

const Localized = z.object({ fr: Text, ar: Text })
const QuoteText = z.object({ text: Text, provenance: Provenance })

const Evidence = z.object({
  date: IsoDate,                 // date of the official act or publication, not the curation date
  status: Status,
  note: Localized,               // facts only, no judgement words (V-10)
  source: Source,                // official (V-7)
  pointers: z.array(z.object({ name: Text, url: HttpsUrl })).max(3).optional()  // press, secondary only
})

const Commitment = z.object({
  schemaVersion: z.literal(1),
  id: Id,                                        // stable forever (FR-1)
  mandate: Mandate,
  theme: Theme,
  title: Localized,                              // neutral label ≤ 90 chars, for cards/titles/SEO (see §8)
  quote: z.object({ fr: QuoteText, ar: QuoteText }),   // verbatim (FR-2)
  origin: Source.extend({ page: z.number().int().positive().optional() }),   // FR-3
  target: z.object({                             // absent ⇒ editorial commitment (FR-7)
    indicatorId: Id,
    baseline: z.object({ value: z.number(), year: z.number().int(), source: Source }),   // amended 2026-09-21 (design loop): every number is sourced (FR-6)
    value: z.number(),
    direction: z.enum(['increase','decrease'])
  }).optional(),
  deadline: IsoDate,                             // mandate end if the programme gives none
  lastVerified: IsoDate,                         // ADR-9, US-5
  evidence: z.array(Evidence)                    // may be empty ⇒ not_started
}).strict()                                      // unknown keys are errors (catches typos)

const Indicator = z.object({
  schemaVersion: z.literal(1),
  id: Id,                                        // e.g. "unemployment-rate"
  name: Localized,
  unit: z.enum(['percent','count','thousand','mad_billion','rank','ratio']),
  decimals: z.number().int().min(0).max(2),
  values: z.array(z.object({
    year: z.number().int(),
    period: z.string().regex(/^(Y|Q[1-4]|M(0[1-9]|1[0-2]))$/).default('Y'),   // annual, quarter or month
    value: z.number(),
    source: Source                               // official (V-7)
  })).min(1)
}).strict()
```
Mandate constants (`lib/mandates.ts`, code, not data):

| id | start | end (default deadline) |
|---|---|---|
| `2021-2026` | 2021-10-07 (government appointed) | ⚠️ **TBC by the curator**: the date the next government is appointed. Placeholder `2026-09-23` (election day). |
| `2026-2031` | ⚠️ TBC (appointment, ~Oct 2026) | start + 5 years, TBC |

### Illustrative file (placeholders, not real data)
```json
{
  "schemaVersion": 1,
  "id": "creation-un-million-emplois",
  "mandate": "2021-2026",
  "theme": "employment",
  "title": { "fr": "Création d'un million d'emplois nets", "ar": "<عنوان محايد>" },
  "quote": {
    "fr": { "text": "<texte exact du programme>", "provenance": "original" },
    "ar": { "text": "<النص الحرفي>", "provenance": "official_translation" }
  },
  "origin": { "name": "Programme gouvernemental 2021-2026", "url": "https://<domaine officiel>/<programme>.pdf",
              "page": 12, "accessed": "2026-09-22", "archiveUrl": "https://web.archive.org/<...>" },
  "target": { "indicatorId": "net-jobs-created", "baseline": { "value": 0, "year": 2021, "source": { "name": "<source officielle>", "url": "https://<domaine officiel>/...", "accessed": "2026-09-22" } },
              "value": 1000000, "direction": "increase" },
  "deadline": "2026-09-23",
  "lastVerified": "2026-09-22",
  "evidence": [
    { "date": "2022-01-01", "status": "in_progress",
      "note": { "fr": "<fait daté, sans adjectif>", "ar": "<واقعة مؤرخة>" },
      "source": { "name": "<acte officiel>", "url": "https://<domaine officiel>/...", "accessed": "2026-09-22" } }
  ]
}
```

## 4. Validation Rules ("constraints"): `lib/catalogue/validate.ts`
Errors fail CI and the build (ADR-7). Warnings are reported only (SDR-6). The Test Architect gets one test per rule.

| Rule | Check | Severity |
|---|---|---|
| V-1 | File parses as JSON and matches the zod schema (strict, `schemaVersion` known) | error |
| V-2 | File name = `id`, folder = `mandate` | error |
| V-3 | `id` unique across **all** mandates (FR-1) | error |
| V-4 | Exactly one quote language has `provenance: "original"` (FR-2) | error |
| V-5 | Evidence dates strictly ascending (no two entries on the same date, so status is unambiguous) | error |
| V-6 | No date later than the build date (evidence, `lastVerified`, `accessed`, `published`) | error |
| V-7 | Every `origin`, `evidence[].source`, `target.baseline.source` and indicator `source` URL host ends with an entry of `official-domains.json` (SEC-3). `pointers` are exempt. | error |
| V-8 | `lastVerified` ≥ latest evidence date, and every evidence date ≥ mandate start | error |
| V-9 | Status matches §5.3 definitions against `deadline`: `not_started` / `in_progress` only **before** the deadline; `partial` / `not_achieved` only **on or after** it; `achieved` / `abandoned` any time | error |
| V-10 | No banned judgement word in `note` or `title` (FR + AR, whole word, case-insensitive; AR normalised: tashkeel removed, أ/إ/آ → ا, ة → ه, ى → ي) | error |
| V-11 | `target.indicatorId` exists; `direction` agrees with baseline vs target (`increase` ⇒ value > baseline) | error |
| V-12 | Indicator `values` strictly ascending by (year, period), no duplicates | error |
| V-13 | `lastVerified` older than 45 days | warning |
| V-14 | Deadline passed and current status still `not_started` / `in_progress` (needs a new evidence entry) | warning |
| V-15 | A metric commitment whose indicator has no value after `baseline.year` (the UI shows "Données indisponibles", FR-8) | warning |
| V-16 | SEC-8: `data/promises/2021-2026/` exists while the date is before 2026-09-24 | error |
| V-17 | No Unicode bidi-control (U+202A–U+202E, U+2066–U+2069) or zero-width characters (U+200B, U+200D, U+2060, U+FEFF) in any text field; U+200C ZWNJ allowed (added v1.2 from the Test Strategy adversarial review) | error |

## 5. "Indexes" (build-time in-memory lookups, `lib/catalogue/load.ts`)
`loadCatalogue()` reads every file once per build (memoised), validates, then builds:

| Structure | Key | Serves |
|---|---|---|
| `byMandate: Map<Mandate, Commitment[]>` sorted by theme, then id | mandate | list pages, counts, sitemap |
| `byId: Map<string, Commitment>` | id | detail pages, `generateStaticParams` |
| `indicators: Map<string, Indicator>` | indicatorId | progress bars |
| `statusCounts(mandate)` | derived | list header counts |

At ≤ ~600 files, a full scan costs milliseconds. Nothing more is needed.

## 6. Migration Plan
| Migration | Description | Reversible |
|---|---|---|
| `schemaVersion: 1` | Initial schema (this document) | n/a |
| Future `v1 → v2` | `scripts/migrate-catalogue.ts` rewrites **every** file in one PR. The validator accepts only the current version. The same PR updates the schema, the fixtures and the tests. | Yes: `git revert` of the PR |

Rules: never rename or delete an `id` (URLs are citations). A withdrawn commitment gets an `abandoned` evidence entry and stays in the catalogue. JSON is formatted by Prettier (2 spaces, trailing newline), and `format:check` in CI keeps git diffs readable.

## 7. Access Patterns
| Use case | Pattern | Structure |
|---|---|---|
| List page for a mandate (US-1, US-7) | all commitments of one mandate + counts | `byMandate`, `statusCounts` |
| Detail page (US-2…US-5, US-8) | one commitment + its indicator | `byId`, `indicators` |
| Static params / sitemap (FR-12) | enumerate enabled mandates × ids × locales | `byMandate` + `enabledMandates(env)` |
| Home (ADR-10) | newest enabled mandate with ≥ 1 commitment | `byMandate` |
| Freshness report (G3) | scan `lastVerified` | full scan in `scripts/catalogue.ts freshness` |
| Filter island (SDR-2) | `{ id, theme, status }[]` per mandate, passed as props | derived from `byMandate` |

## 8. Sensitive Data & Content Integrity
- **Encrypted fields**: none (all data is public by design). **Row-level security**: not applicable.
- **Personal data**: none. Public officials appear only as programme authors (content rules).
- **Integrity**: covered by PR review + V-1…V-16 + git history.
- ⚠️ **New field `title` (needs your OK)**: quotes are often too long for cards, `<title>` and search snippets, so each commitment needs a short label. To stay neutral, the curation guide will require that it **reuses the quote's own words** and states the promise, never a judgement ("Création d'un million d'emplois nets", not "Le million d'emplois promis"). V-10 also lints it.
- **Renamed field**: HANDOFF `Source.lastUpdated` → `accessed` (when the curator checked it) + optional `published` (date on the document). The single name was ambiguous.

## Database Validation Checklist
- [x] Engine choice justified (YAGNI: files, not a DB)
- [x] All PRD entities modelled with relationships
- [x] Normalised: indicators referenced by id, status derived, no duplication
- [x] "Indexes" limited to the lookups the pages actually need
- [x] Migration path defined, with rollback via `git revert`
- [x] Sensitive data assessed (none)
