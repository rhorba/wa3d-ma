# Architecture: Wa3d.ma (وعد)
**PRD Reference**: docs/prd-wa3d-ma.md (v1.1, Approved) · **System Design**: docs/system-design-wa3d-ma.md (v1.0, Approved)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: Software Architect | **Status**: Approved (2026-09-21)

## 1. Overview
A statically generated Next.js 15 (App Router) site with a **small layered structure**: a pure domain layer (schema, status derivation, catalogue rules) that has no framework imports, a thin data-access layer that reads JSON files at build time, and presentation components. The same domain code runs in three places: the CI validator script, the Next.js build, and the unit tests. So an invalid catalogue cannot pass CI **and** cannot be built.

Stack (same as da3m-ma, versions pinned to match): Next.js 15.5 · React 19.1 · next-intl 4 · zod 4 · Tailwind CSS 4 · Vitest 5 + @vitest/coverage-v8 · Playwright · tsx · pnpm 10 · Node ≥ 22 · ESM.
Dropped from da3m-ma because this project doesn't need them: Clerk, Drizzle/Postgres, testcontainers, svix, middleware, API routes.

## 2. Architecture Decision Records

### ADR-1: Catalogue as code (from HANDOFF, confirmed)
- **Status**: Accepted
- **Context**: A solo developer curates the data, and git history must be the public audit trail.
- **Decision**: One JSON file per commitment at `data/promises/<mandate>/<id>.json`, one per indicator at `data/indicators/<indicatorId>.json`. Every change goes through a PR. The file name must equal the `id`.
- **Alternatives**: a DB with an admin UI, or a headless CMS. Both were rejected: runtime state, secrets, cost, and no public audit trail.
- **Consequences**: + free audit trail, + no runtime state. − a non-developer cannot curate without learning git (accepted; same as da3m-ma ADR-8).

### ADR-2: Status is derived from evidence (from HANDOFF, confirmed)
- **Status**: Accepted
- **Context**: A separately stored status can drift from the evidence behind it.
- **Decision**: `currentStatus(c)` = the status of the latest-dated evidence entry, or `not_started` if there is none. It is a pure function in `lib/catalogue/status.ts`, and no `status` field exists on a commitment. Indicator values drive **only** the progress bar.
- **Consequences**: + status can never contradict its evidence. − changing a status always means adding a dated, sourced evidence entry (intended).

### ADR-3: Embargo = build-time flag + dataset kept off `main` until it lifts
- **Status**: Accepted (closes System Design SDR-3's open point with option (b))
- **Context**: `NEXT_PUBLIC_ARCHIVE_ENABLED` hides the archive on the site, but a public repo would expose the JSON on GitHub.
- **Decision**: The 2021-2026 dataset is built on the branch `data/2021-2026` and opened as a PR. The PR is merged only after **(1)** you have verified it and **(2)** it is 2026-09-24 or later. The engine, tests and a small **fixture** catalogue (`tests/fixtures/catalogue/`, clearly fictional data) are on `main`. The flag stays as defence in depth and to control the timing of 2026-2031 publication.
- **Alternatives**: accept the leak (neutrality risk); a private repo until 24 Sept (extra step, and Vercel Hobby with a private repo works but the audit trail starts hidden).
- **Consequences**: + nothing embargoed is public anywhere. − E2E tests on `main` run against fixtures, not the real dataset, until the merge. The data PR's own CI run covers the real dataset.
- **Amended 2026-09-21 (Security §7)**: every pushed branch of a public repo is public. The branch `data/2021-2026` stays **local-only** until 2026-09-24; it is pushed and the PR opened only after user verification, on or after that date. SEC-8 CI guard blocks `data/promises/2021-2026/` on `main` before that date.

### ADR-4: Small layered structure, not Clean Architecture or DDD
- **Status**: Accepted
- **Context**: The domain is small: one aggregate (`Commitment` with its evidence), one reference entity (`Indicator`), no writes at runtime.
- **Decision**: Three layers with a one-way dependency rule (§3). No repositories, use cases or DI containers. The "repository" is a plain `loadCatalogue()` function.
- **Re-evaluate when**: a second data source or a runtime write path appears.

### ADR-5: next-intl in static mode, without middleware
- **Status**: Accepted
- **Context**: SDR-1 forbids server runtime code. next-intl normally detects the locale in middleware.
- **Decision**: `localePrefix: 'always'`, locales `['fr', 'ar']`, default `fr`. Every layout and page calls `setRequestLocale(locale)` and exports `generateStaticParams`. `/` → `/fr` is a permanent redirect in `next.config.ts` `redirects()`. There is no browser-language detection: a reader switches with the language toggle. `<html lang dir>` is set per locale (`ar` → `rtl`), reusing da3m-ma's `localeDirection()`.
- **Consequences**: + fully static and portable. − Arabic-browser visitors who land on `/` see French first (mitigated by a prominent "العربية" toggle). EN can be added later by adding a locale.

### ADR-6: Environment parsed once, validated at build
- **Status**: Accepted
- **Decision**: `lib/env.ts` parses `NEXT_PUBLIC_SITE_URL` (https URL), `NEXT_PUBLIC_ARCHIVE_ENABLED` (`"true"`/other → boolean, default false) and `NEXT_PUBLIC_REPO_URL` (https URL) with zod. An invalid value fails the build. Nothing else reads `process.env`, and an ESLint `no-restricted-syntax` rule enforces that.
- **Consequences**: a misconfigured Vercel env var produces a failed deploy, not a broken live site.

### ADR-7: One validation pipeline shared by CI, build and tests
- **Status**: Accepted
- **Decision**: `lib/catalogue/validate.ts` exports `validateCatalogue(files, indicators, bannedWords) → Issue[]`. It combines the zod schema (per file) with cross-file rules (FR-11: unique ids, ascending evidence dates, known `indicatorId`, banned words, file name = id, mandate folder = `mandate` field). `pnpm catalogue:validate` prints the issues and exits 1. `loadCatalogue()` calls the same function and **throws** on any error. Freshness (> 45 days) is a separate `warning` severity that never fails anything (SDR-6).
- **Consequences**: + the build cannot ship invalid data even if CI is bypassed.

### ADR-8: Data is rendered as text, never as HTML
- **Status**: Accepted (input to the Security doc)
- **Decision**: Quotes and notes are plain strings rendered as React text nodes, with no `dangerouslySetInnerHTML` and no Markdown. Paragraph breaks come from splitting on `\n\n`. Every URL in the data must be `https:` (zod refinement). External links get `rel="noopener noreferrer"`. ESLint bans `dangerouslySetInnerHTML` across the repo.
- **Consequences**: a malicious or careless PR cannot inject script, and the CSP can stay strict.

### ADR-9: Quote provenance and "last verified" are explicit data fields
- **Status**: Proposed. The DBA finalises the exact shape.
- **Context**: PRD FR-2 (translation labelled "traduction Wa3d") and US-5 ("Dernière vérification") are not representable in the HANDOFF draft model. A re-verification that changes nothing must not add a noise entry to the evidence timeline.
- **Decision (shape to confirm)**:
  - `quote: { fr: { text, provenance }, ar: { text, provenance } }` with `provenance: 'original' | 'official_translation' | 'wa3d_translation'`. Exactly one language must be `original`.
  - `lastVerified: ISODate` on the commitment. It must be ≥ the latest evidence date and ≤ the build date.
- **Consequences**: small deviation from the HANDOFF type, handed to the DBA doc.

### ADR-10: Home page = the newest published mandate
- **Status**: Accepted
- **Context**: Until the 2026-2031 programme is presented (~Oct 2026), that mandate has no commitments. Before 24 Sept, nothing is public at all.
- **Decision**: `/{locale}` renders the list of the **newest enabled mandate that has ≥ 1 commitment**, with `<link rel="canonical">` pointing to `/{locale}/{mandate}` to avoid duplicate content. If no mandate qualifies, it renders an explanatory empty state. A mandate that is enabled but empty (2026-2031 before ingestion) appears in the switcher as "Programme 2026-2031: publication attendue" and has a static page saying so. The empty-mandate page is `noindex`.
- **Consequences**: the site is useful from 24 Sept (archive) and switches to 2026-2031 automatically on the first data merge, with no code change.

## 3. Code Structure & Dependency Rule
```
app/                                   PRESENTATION (Next.js, server components by default)
├── [locale]/
│   ├── layout.tsx                     html lang/dir, fonts, header (mandate + language switch), footer
│   ├── page.tsx                       home → newest published mandate (ADR-10)
│   ├── not-found.tsx
│   ├── methodologie/page.tsx          static content from messages/*.json
│   └── [mandate]/
│       ├── page.tsx                   list (static HTML of all cards + <CommitmentFilters/> island)
│       └── [id]/page.tsx              detail
├── sitemap.ts · robots.ts
components/
├── commitment/  CommitmentCard, QuoteBlock, ProgressBar, EvidenceTimeline, StatusBadge, SourceLink
├── filters/     CommitmentFilters.tsx   ← the ONLY 'use client' component (SDR-2)
└── ui/          layout primitives
lib/                                   DOMAIN + DATA ACCESS
├── catalogue/
│   ├── schema.ts        zod schemas + inferred types (Commitment, Evidence, Source, …)   ┐ pure:
│   ├── status.ts        currentStatus(), statusCounts()                                  │ no next/*,
│   ├── progress.ts      progress(baseline, latest, target, direction) → 0..1 | null      │ no react,
│   ├── freshness.ts     staleCommitments(catalogue, today, 45)                           │ no node:fs
│   ├── validate.ts      validateCatalogue() — FR-11 rules (ADR-7)                        ┘
│   └── load.ts          'server-only'; reads data/ with node:fs, calls validate, memoised
├── mandates.ts          MANDATES, enabledMandates(env), defaultMandate(catalogue, env)
├── env.ts               zod-parsed env (ADR-6)
└── seo.ts               buildMetadata(), alternates/hreflang, absoluteUrl()
i18n/        routing.ts · request.ts · navigation.ts   (copied from da3m-ma, locales fr/ar)
messages/    fr.json · ar.json                           (UI strings, status labels, methodology text)
data/        promises/<mandate>/<id>.json · indicators/<id>.json · banned-words.json
scripts/     catalogue.ts (validate | freshness) · fetch-indicators.ts (World Bank → data/indicators)
tests/       unit/ · integration/ · fixtures/catalogue/
e2e/         Playwright specs (FR + AR/RTL)
```
**Dependency rule** (enforced by ESLint `no-restricted-imports` per directory):
```
app/ ──► components/ ──► lib/catalogue/*.ts (pure)
app/ ──► lib/catalogue/load.ts, lib/mandates.ts, lib/seo.ts ──► lib/env.ts
scripts/ ──► lib/catalogue/* (pure + load)
lib/catalogue/{schema,status,progress,freshness,validate}.ts ──► zod only
components/filters (client) ──► receives plain props { id, theme, status }[]; never imports load.ts
```

## 4. Data Model (summary; the DBA doc owns the full schema)
```
Mandate ('2021-2026' | '2026-2031')
   └─1:N─► Commitment (id, theme, quote{fr,ar}+provenance, origin, target?, deadline, lastVerified)
               └─1:N─► Evidence (date, status, note{fr,ar}, source, pointers?[])   ← ordered by date
Commitment.target.indicatorId ─N:1─► Indicator (id, unit, name{fr,ar}, values[{year, value, source}])
```

## 5. Routes (no API: the site has no endpoints)
| Route | Rendering | Content | Indexed |
|---|---|---|---|
| `/` | static redirect | → `/fr` (308) | no |
| `/{locale}` | SSG | Newest published mandate list (ADR-10), canonical → mandate URL | via canonical |
| `/{locale}/{mandate}` | SSG | List + counts + filter island (`?theme=&status=`) | yes (non-empty mandates) |
| `/{locale}/{mandate}/{id}` | SSG, `dynamicParams=false` | Detail: quote, origin, target, progress, timeline, last verified, report link | yes |
| `/{locale}/methodologie` | SSG | Status definitions, sourcing, neutrality, translation policy, how to report | yes |
| `/sitemap.xml` | SSG | Enabled mandates only, both locales, `hreflang` alternates | — |
| `/robots.txt` | SSG | Allow all, sitemap URL | — |
| anything else / embargoed mandate | SSG 404 | `not-found.tsx` | no |

"Signaler une erreur" = `${NEXT_PUBLIC_REPO_URL}/issues/new?template=correction.yml&title=[<id>]…` (outbound link, PRD §9.4).

## 6. Security Considerations (the Security doc will expand these)
- Authentication / authorization: none. No accounts and no runtime input.
- Data protection: no PII collected or stored. Correction reports live on GitHub under GitHub's terms.
- Controls: ADR-8 (text-only rendering, https-only URLs), strict CSP with no inline script beyond what Next requires, HSTS, frame-ancestors none, pinned lockfile, branch protection on `main` with required CI.
- Key risks: tampering with the catalogue through a PR (mitigated by review and CI), supply chain (dependencies, GitHub Actions pinned by SHA), reputational attacks through fake correction issues (curator triage).

## 7. Infrastructure
- Hosting: Vercel Hobby, production = `main`, preview deploys per PR. Env vars per §ADR-6.
- Database: none.
- CI/CD: GitHub Actions: install (frozen lockfile) → lint → typecheck → `catalogue:validate` → unit + integration with coverage ≥ 80% → build → Playwright E2E (FR + AR) → Lighthouse budgets. Vercel deploys on merge. Details in the DevOps doc.
- Monitoring: Vercel deploy status, CI freshness warnings (SDR-6), Search Console.

## 8. Architectural Fitness Functions (CI)
| Function | Threshold | Tool |
|---|---|---|
| Coverage (unit + integration) | ≥ 80% lines | Vitest v8 |
| Pure domain has no framework imports | 0 violations | ESLint `no-restricted-imports` |
| Only one client component | `'use client'` only in `components/filters/` | ESLint / grep check |
| No raw HTML | 0 `dangerouslySetInnerHTML` | ESLint `react/no-danger` |
| No direct env reads | `process.env` only in `lib/env.ts` | ESLint |
| List-page JS | ≤ 130 KB gzipped, island ≤ 15 KB | Lighthouse CI budget + `pnpm budget` |
| Lighthouse a11y / perf | ≥ 95 (FR + AR, list + detail) | Lighthouse CI |

## 9. Technical Risks
| Risk | Mitigation | Owner |
|---|---|---|
| next-intl static mode without middleware has edge cases (missing `setRequestLocale` makes a page dynamic) | Build check: `next build` output must show every route as ○/● static; CI fails on any ƒ route | Tech Lead |
| Framework churn over 5 years (Next majors) | Pinned versions; Dependabot **security** updates only; the site keeps running on the old build if an upgrade is postponed | DevOps |
| Real dataset only tested in its own PR (ADR-3) | The data PR runs the full CI including E2E against real data; fixtures cover every status/theme/edge case | Test Architect |
| ADR-9 model changes ripple into the validator | DBA doc finalises the shape before Sprint 1 task 1 | DBA |
| Arabic typography and RTL bugs (bars, timelines, mixed-direction numbers) | Logical CSS properties only (`ms-`/`me-`), `dir="ltr"` islands for numbers/dates where needed, AR E2E + visual review | UI / Frontend |

## Architecture Validation Checklist
- [x] Every PRD requirement has an architectural home (FR-1 routes · FR-2/US-5 ADR-9 · FR-4 ADR-2 · FR-9 ADR-3/10 · FR-10 SDR-2 · FR-11 ADR-7 · FR-12 §5 + lib/seo)
- [x] ADRs document all significant choices
- [x] Data model supports all user stories (US-1…US-9)
- [x] "API" design: routes cover all functional requirements; no endpoints needed
- [x] Security requirements addressed (ADR-6, ADR-8, §6)
- [x] NFRs have architectural support (SSG, single client island, budgets)
- [x] YAGNI: no DB, no DI, no repositories, no middleware, no CMS
