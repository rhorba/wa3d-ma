# Test Strategy: Wa3d.ma (وعد)
**References**: PRD v1.1 (user stories US-1…US-9, FR-1…FR-12) · Architecture v1.0 · Database v1.2 (V-1…V-17) · Security v1.0 (SEC-1…SEC-9) · UX/UI v1.0
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: Test Architect | **Status**: Approved (2026-09-21)

> The riskiest failure is not a crash, it's **the site stating something false or unfair**. So the maximum rigour
> goes to the code that decides what a status is and what data is allowed in: status derivation, the validator
> and the official-source allowlist. The pages are thin and get standard coverage plus E2E in both languages.
> The stories doc comes after this one in the plan; each acceptance scenario below is keyed to a PRD user story, and the Scrum Master will reference these ids.

## 1. Risk Assessment
Risk = Impact + Change frequency + Complexity (each 1–5).

| Component | Impact | Freq | Cplx | Risk | Test level |
|---|---|---|---|---|---|
| Status derivation + V-9 status/deadline rules (`lib/catalogue/status.ts`, part of `validate.ts`) | 5 | 2 | 3 | 10 | **Maximum**: 100% branches, decision table, property tests |
| Catalogue validator V-1…V-17 (`validate.ts`) | 5 | 3 | 4 | 12 | **Maximum**: one passing + one failing fixture per rule, fuzz |
| Official-domain allowlist V-7 / SEC-3 | 5 | 1 | 3 | 9 | **Maximum** (security): adversarial URL table |
| Embargo (flag → static params, sitemap, switcher) / V-16 | 5 | 1 | 2 | 8 | **Maximum** (neutrality): unit + integration + embargo build smoke |
| Banned-word lint V-10 (FR + AR normalisation) | 4 | 2 | 3 | 9 | **High** |
| Progress calculation (`progress.ts`) | 4 | 1 | 3 | 8 | **High**: property tests |
| Filter logic + island (`lib/filters.ts` + `CommitmentFilters`) | 3 | 3 | 3 | 9 | **High**: unit (pure) + E2E |
| i18n / RTL (message parity, `dir`, `<bdi>`, toggle) | 4 | 3 | 2 | 9 | **High**: unit parity + AR E2E + axe |
| Env parsing (`lib/env.ts`) | 4 | 1 | 1 | 6 | Standard |
| SEO: metadata, canonical, hreflang, sitemap, robots | 3 | 1 | 2 | 6 | Standard |
| Security headers (SEC-1) | 4 | 1 | 1 | 6 | Standard: integration on the built app |
| Freshness report V-13/V-14 | 2 | 1 | 2 | 5 | Standard |
| Méthodologie, 404, empty-mandate pages | 2 | 1 | 1 | 4 | Minimal: smoke + axe |

## 2. Test Pyramid Targets
| Layer | Scope | Target | Tooling |
|---|---|---|---|
| Unit | Pure domain: `lib/catalogue/*` (except `load.ts`), `lib/filters.ts`, `lib/mandates.ts`, `lib/env.ts`, `lib/seo.ts` | ≥ 90% lines of `lib/`; **100% branches** in `status.ts`, `progress.ts`, `validate.ts` | Vitest 5, fast-check |
| Integration | `loadCatalogue()` on fixture folders; `generateStaticParams` / `sitemap()` with the flag on and off; server components rendered to static HTML with the fixture catalogue; message-file parity | Every route's data path and every page component rendered at least once | Vitest (`node` env) + `react-dom/server` |
| E2E | Against the **production build** (`next build && next start`) with the fixture catalogue, Chromium, mobile (390×844) + desktop (1280×900), **FR and AR** | Critical journeys in §3 | Playwright + `@axe-core/playwright` |
| Performance / a11y budgets | List + detail, FR + AR, mobile preset | Lighthouse perf ≥ 95, a11y ≥ 95 (median of 3 runs); list-page JS < 100 KB gzip | `@lhci/cli` |
| **Combined gate** | Unit + integration, `coverage.include = lib/**/*.ts` | **≥ 80% lines, statements, functions, branches**: non-negotiable, CI blocks merge | Vitest v8 coverage |

Vitest config mirrors da3m-ma (`projects: unit | integration`), without testcontainers.

**Fixtures** (`tests/fixtures/catalogue/`, clearly fictional, e.g. "Engagement fictif A"):
- `valid/`: both mandates. Every theme, every status as current status, metric + editorial, all three provenances, empty evidence, an indicator with no value after baseline, `decrease` direction, a pointer.
- `invalid/<rule-id>/`: one minimal catalogue per V-rule that breaks **only** that rule.
- The indicator and allowlist fixtures live alongside.

Tests freeze the clock with `vi.setSystemTime`.

## 3. ATDD Acceptance Scenarios
### 3.1 Domain rules (unit)
**Status derivation decision table (ADR-2, FR-4)**

| Evidence | Expected `currentStatus` |
|---|---|
| `[]` | `not_started` |
| one entry, status X | X (for each of the 6 statuses) |
| entries A (2022) then B (2024), in file order | B |
| same entries, file order reversed | **rejected by V-5** before derivation (derivation assumes a validated catalogue) |

**V-9 deadline boundaries** (deadline = 2026-09-23)

| Evidence date | not_started / in_progress | partial / not_achieved | achieved / abandoned |
|---|---|---|---|
| 2026-09-22 | ✅ | ❌ V-9 | ✅ |
| 2026-09-23 (the deadline itself) | ❌ V-9 | ✅ | ✅ |
| 2026-09-24 | ❌ V-9 | ✅ | ✅ |

**Other boundaries**:
- Freshness V-13: `lastVerified` 45 days ago → no warning; 46 days ago → warning.
- V-6 "today" is computed in **Africa/Casablanca**: an entry dated today at 00:30 Morocco time (23:30 UTC the day before) is **not** in the future.
- V-5: two entries on the same date → error.

**Property tests (fast-check)**:
- Appending an evidence entry dated after all others makes `currentStatus` equal that entry's status.
- `progress()` is always in `[0, 1]` or `null`, never `NaN`.
- `progress()` is monotonic in the latest value (increasing for `increase`, decreasing for `decrease`), clamps at the target, and returns `null` when the indicator has no value after `baseline.year` (FR-8).
- `validateCatalogue()` never throws on arbitrary JSON: it returns issues (fuzz with `fc.json()`).
- `statusCounts()` sums to the number of commitments.

### 3.2 User journeys (Gherkin → Playwright unless marked)
```gherkin
Feature: Browse commitments (US-1, FR-10)
  Scenario: Filter by theme and status and share the view
    Given the fixture mandate "2021-2026" is enabled
    When I open /fr/2021-2026 and select theme "Emploi" and status "Partiellement réalisé"
    Then only matching rows are visible and the count reads "N engagements affichés sur M"
    And the URL is /fr/2021-2026?theme=employment&status=partial
    When I open that URL in a new page
    Then the same filters are active and the same rows are visible

  Scenario: Zero results and reset
    When I apply filters that match nothing
    Then I see "Aucun engagement ne correspond à ces filtres" and a reset action
    When I reset
    Then all M rows are visible and the URL has no filter params

  Scenario: Invalid params are ignored, not fatal
    When I open /fr/2021-2026?theme=<script>&status=foo
    Then the page renders all rows with no active filter

  Scenario: Without JavaScript the list stays usable
    Given JavaScript is disabled
    When I open /fr/2021-2026
    Then rows are grouped by theme with a jump-link index and the filter chips are hidden

  Scenario: Counts are neutral
    Then the six status counts appear in the order Non engagé, En cours, Réalisé, Partiellement réalisé, Non réalisé, Abandonné
    And no percentage-of-promises-kept figure appears anywhere on the page

Feature: Read one commitment (US-2, US-4, US-5, FR-2, FR-6, FR-7, FR-8)
  Scenario: Metric commitment shows sourced progress
    When I open a metric fixture commitment
    Then I see the verbatim quote, its source document with page, the status with its definition link
    And a progress bar whose baseline, latest value and target each show a year and a source link
    And "Dernière vérification" shows the lastVerified date

  Scenario: Editorial commitment never shows a target
    When I open an editorial fixture commitment
    Then no progress bar is rendered and "Engagement sans cible chiffrée" is shown

  Scenario: Missing indicator data
    When I open a metric commitment whose indicator has no value after the baseline year
    Then "Données indisponibles" is shown with the last known value and year, never 0 or blank

  Scenario: Translation is labelled
    When I open /ar/... for a commitment whose Arabic quote has provenance "wa3d_translation"
    Then the label "ترجمة وعد" is visible and "عرض النص الأصلي" reveals the French original

Feature: Verify and cite (US-3, US-8, FR-1, FR-5)
  Scenario: Every evidence entry links an official source
    Then each timeline entry has a "Source officielle" link whose host is on the allowlist
    And press pointers are rendered after it with the secondary link style
  Scenario: Stable, citable URL
    Then the canonical link equals NEXT_PUBLIC_SITE_URL + /fr/<mandate>/<id>
    And the "Citer" block contains that URL

Feature: Arabic and RTL (US-6)
  Scenario: Same page in the other language
    Given I am on /fr/2021-2026/<id>
    When I use the language toggle
    Then I am on /ar/2021-2026/<id> with <html lang="ar" dir="rtl">
  Scenario: No layout scrambling
    Then dates and numbers are wrapped in <bdi>, the breadcrumb separator and external-link glyph are mirrored
    And axe reports no violations on the AR list and detail pages

Feature: Mandates and embargo (US-7, FR-9, ADR-10)
  Scenario: Embargoed archive is invisible (integration + embargo build smoke)
    Given NEXT_PUBLIC_ARCHIVE_ENABLED is not "true"
    Then /fr/2021-2026 and /fr/2021-2026/<id> return 404
    And sitemap.xml contains no 2021-2026 URL and the mandate switcher has no 2021-2026 entry
  Scenario: Empty mandate
    Given 2026-2031 is enabled but has no commitments
    Then /fr/2026-2031 shows "publication attendue", has <meta name="robots" content="noindex">
    And the home page shows the newest mandate that has commitments
  Scenario: Unknown id
    Then /fr/2021-2026/does-not-exist returns 404 with a link back to the list

Feature: Method and corrections (US-9)
  Scenario: Status definitions are one click away
    When I click the status definition link on a detail page
    Then I land on /fr/methodologie#statut-<status>
  Scenario: Report an error
    Then the report link points to NEXT_PUBLIC_REPO_URL/issues/new?template=correction.yml with the commitment id prefilled
    And the text "public" and "compte GitHub" is shown next to it
```

## 4. Adversarial Checklist (high-risk components)
**Catalogue input** (the only "user input" is a PR):

| Attack | Expected | Where |
|---|---|---|
| `note` contains `<script>alert(1)</script>` or `<img onerror>` | Rendered as literal text (integration render asserts escaped output) | ADR-8 |
| `source.url` = `javascript:…`, `data:…`, `http://gov.ma/…` | V-1 rejects (https only) | SEC-3 |
| Host tricks: `evilgov.ma`, `gov.ma.evil.com`, `https://gov.ma@evil.com/`, `https://evil.com/?u=gov.ma`, `https://gov.ma.`, uppercase `GOV.MA` | Only a dot-boundary suffix match on the parsed `URL.hostname` passes; the trailing dot is normalised; case-insensitive | V-7 |
| IDN homoglyph (`gоv.ma` with Cyrillic о) | Punycode host (`xn--…`) is not on the allowlist → rejected | V-7 |
| Bidi controls (U+202A–U+202E, U+2066–U+2069) or zero-width chars (U+200B, U+FEFF) hidden in `quote`, `note` or `title` | **New rule V-17: rejected.** U+200C ZWNJ is allowed. | proposed → DB |
| Non-NFC Arabic (decomposed hamza) | V-1 refine rejects | DB §3 |
| Banned word evasion: `réussite` vs `REUSSITE`, AR with tashkeel `نَجَاح`, alef variants | Caught after normalisation; false-positive check: substrings inside longer neutral words are **not** flagged (whole-word match) | V-10 |
| Impossible dates `2026-02-30`, `2026-13-01` | Rejected | V-1 |
| Id tricks: `Emploi`, `emploi--x`, `-x`, 61 chars, `../x` | Rejected by the id regex; file name must equal id | V-1/V-2 |
| Duplicate id in the other mandate | V-3 error | V-3 |
| Embargoed folder on `main` before 2026-09-24 | V-16 error (clock frozen at 2026-09-23 and 2026-09-24 in tests) | SEC-8 |

**Runtime surface**:
- Response headers on `/`, a list page and a detail page include the exact SEC-1 set, and there is no `x-powered-by`.
- A `next build` route check fails CI if any route is not static (ƒ).
- `grep` gates: exactly one `'use client'` (in `components/filters/`), no `dangerouslySetInnerHTML`, `process.env` only in `lib/env.ts`.

## 5. Release Gate Criteria (every merge to `main`; the SHIP phase re-checks)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm format:check` pass
- [ ] `pnpm catalogue:validate` passes (0 errors; warnings listed in the PR summary)
- [ ] Unit + integration pass; **combined coverage ≥ 80%**; 100% branches in `status.ts`, `progress.ts`, `validate.ts`
- [ ] E2E pass in FR and AR, mobile and desktop; axe shows 0 serious or critical violations
- [ ] Embargo smoke passes (build with the flag unset → archive URLs 404, absent from the sitemap)
- [ ] Lighthouse perf and a11y ≥ 95 (median of 3) on list + detail, FR + AR; list JS < 100 KB gzip
- [ ] Route check: all routes static; grep gates clean
- [ ] `pnpm audit --audit-level=critical` clean (SEC-4); no open critical/high security findings
- [ ] **Data PRs only** (e.g. `data/2021-2026`): the full suite runs against the real dataset, plus **user sign-off** on the dataset (ADR-3)
- [ ] **Version completion** (CLAUDE.md rule 9): `pnpm e2e:record` records the critical journeys (browse + filter FR, detail FR, detail AR, language toggle, embargo 404, Méthodologie) to `.recordings/v<version>-<date>.webm`, logged in `.logs/activity.md`

## 6. Proposed Change from This Review
- **V-17 (new validator rule)**: reject Unicode bidi-control and zero-width characters (except ZWNJ) in every text field. A hidden U+202E can visually reverse a quote or a note in the browser while the JSON diff looks harmless in review, and that is a neutrality attack vector. This is a small addition to the Database doc (§4) and needs your OK.

## Test Strategy Validation Checklist
- [x] Every user story maps to at least one acceptance scenario (US-1…US-9 in §3.2)
- [x] Coverage gate ≥ 80% confirmed and CI-enforced (§2, §5)
- [x] Adversarial review planned for high-risk components (§4)
- [x] Release gate criteria documented (§5), to be agreed with the user at this gate
