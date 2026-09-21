# Stories: Wa3d.ma (وعد)
**PRD**: docs/prd-wa3d-ma.md (v1.1) · **Architecture**: docs/architecture-wa3d-ma.md · **Tests**: docs/test-strategy-wa3d-ma.md · **DevOps**: docs/devops-wa3d-ma.md
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: Scrum Master + Test Architect | **Status**: Approved (2026-09-21)

> Solo developer, so there are no ceremonies (YAGNI). Stories are grouped into session-sized batches with a checkpoint after each.
> Sizes: **S** ≤ 2 h · **M** ≈ half a day · **L** ≈ 1 day (the maximum; anything bigger is split).
> Every story's **Definition of Done**: its acceptance tests are written and passing, lint/types are clean, coverage stays ≥ 80%, CI is green, and it's logged in `.logs/`.

## Epic 0: Project scaffold
### Story 0.1: Scaffold the app and tooling
**Priority**: Must · **Size**: M · **Specialist**: Tech Lead / Frontend Dev
As the developer, I want the project skeleton to match da3m-ma, so that every later story plugs into a working build, test and lint setup.
```gherkin
Given a fresh clone
When I run pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build
Then all commands succeed on an empty catalogue
And .env.example lists NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_ARCHIVE_ENABLED, NEXT_PUBLIC_REPO_URL, WA3D_DATA_DIR
And lib/env.ts rejects a non-https NEXT_PUBLIC_SITE_URL at build time
```
**Tech notes**: Next 15.5 / React 19.1 / next-intl 4 / zod 4 / Tailwind 4 / Vitest 5 (`unit` + `integration` projects) / Playwright / pnpm 10 / Node 22 / ESM, pinned like da3m-ma (Architecture §1). ESLint rules for the fitness functions (Architecture §8). `poweredByHeader: false`. ADR-6.
**Dependencies**: none.

## Epic 1: Catalogue engine (the rules that decide what the site says)
### Story 1.1: Data schema and types
**Must · S · Backend Dev**. As the curator, I want one strict schema for commitments and indicators, so that a typo can never reach the site.
```gherkin
Given the valid fixture catalogue
When each file is parsed with the Commitment / Indicator schema
Then all pass, and a file with an unknown key, an http URL or a non-NFC string fails
```
**Tech notes**: Database §3 (v1.2, including `baseline.source`), `lib/catalogue/schema.ts`, pure (zod only). **Deps**: 0.1.

### Story 1.2: Status derivation and counts
**Must · S · Backend Dev**. As a reader, I want the status to always be the latest sourced evidence, so that it can never contradict its sources (FR-4).
```gherkin
Given the decision table in Test Strategy §3.1
Then currentStatus returns not_started for [] and the latest entry's status otherwise
And statusCounts sums to the number of commitments (property test)
```
**Tech notes**: ADR-2, `status.ts`, 100% branches. **Deps**: 1.1.

### Story 1.3: Progress calculation
**Must · S · Backend Dev**. As a researcher, I want progress from baseline to target computed consistently, so that bars are comparable (FR-6, FR-8).
```gherkin
Given increase and decrease targets
Then progress() is within [0,1], monotonic, clamps at the target, and returns null with no value after baseline.year
```
**Tech notes**: `progress.ts`, fast-check, 100% branches. **Deps**: 1.1.

### Story 1.4: Validator: structure and dates (V-1…V-6)
**Must · M · Backend Dev**. As the curator, I want structural mistakes caught before merge, so that URLs and dates are trustworthy (FR-1, FR-11).
```gherkin
Given one invalid fixture per rule V-1…V-6
Then validateCatalogue returns exactly that rule's error and nothing else
And "today" for V-6 is computed in Africa/Casablanca (00:30 Morocco time is not in the future)
And validateCatalogue never throws on arbitrary JSON (fuzz)
```
**Deps**: 1.1.

### Story 1.5: Validator: security rules (V-7 allowlist, V-17 hidden characters)
**Must · M · Backend Dev + Security Engineer**. As the publisher, I want only official sources and no hidden Unicode tricks, so that the neutrality chain can't be forged (FR-5, SEC-3).
```gherkin
Given the adversarial URL table (Test Strategy §4): evilgov.ma, gov.ma.evil.com, gov.ma@evil.com, IDN homoglyph, trailing dot, uppercase
Then only dot-boundary suffix matches on the parsed hostname pass
And text containing U+202E or U+200B is rejected while U+200C is accepted
```
**Tech notes**: `data/official-domains.json` (Security SEC-3 list). **Deps**: 1.4.

### Story 1.6: Validator: cross-field rules (V-8, V-9, V-11, V-12)
**Must · M · Backend Dev**. As a reader, I want statuses that respect their own definitions, so that "Non réalisé" never appears before a deadline (PRD §5.3).
```gherkin
Given the V-9 boundary table (deadline 2026-09-23)
Then in_progress on the deadline date fails and partial on the deadline date passes
And an unknown indicatorId, a direction contradicting baseline/target, or unordered indicator values fail
```
**Deps**: 1.4.

### Story 1.7: Validator: neutrality lint and warnings (V-10, V-13…V-16)
**Must · M · Backend Dev + Copywriter**. As the publisher, I want judgement words blocked and stale entries flagged, so that the tone stays factual and nothing silently goes stale (G2, G3, SEC-8).
```gherkin
Given banned-words.json with FR and AR entries
Then "RÉUSSITE" and "نَجَاح" (with tashkeel) are caught, and neutral words containing them as substrings are not
And lastVerified 46 days old warns while 45 days does not
And a 2021-2026 folder with the clock at 2026-09-23 errors (V-16), but not at 2026-09-24
```
**Tech notes**: initial word list drafted in Story 4.1 and reviewed by you. **Deps**: 1.4.

### Story 1.8: Loader, mandates and fixtures
**Must · M · Backend Dev + Tester**. As the build, I want one validated, memoised catalogue, so that invalid data can never be deployed (ADR-7).
```gherkin
Given WA3D_DATA_DIR=tests/fixtures/catalogue/valid
When loadCatalogue() runs
Then byMandate, byId and indicators are built, and an invalid fixture folder makes it throw
And enabledMandates hides 2021-2026 unless NEXT_PUBLIC_ARCHIVE_ENABLED is "true"; defaultMandate follows ADR-10
```
**Tech notes**: fixtures cover every theme, status, provenance and edge case (Test Strategy §2). `server-only`. **Deps**: 1.2–1.7.

### Story 1.9: Catalogue CLI
**Must · S · Backend Dev**. As the curator, I want `pnpm catalogue:validate | freshness | links`, so that I can check my work locally and in CI.
```gherkin
When I run pnpm catalogue:validate on a catalogue with one error and one warning
Then it prints both with file paths and exits 1; with only warnings it exits 0
```
**Deps**: 1.8.

## Epic 2: Pages (FR + AR)
### Story 2.1: Layout, i18n and design tokens
**Must · M · Frontend Dev**. As an Arabic reader, I want the whole site properly right-to-left, so that I am not a second-class user (US-6).
```gherkin
Given /fr and /ar
Then <html lang dir> is set per locale, fonts are self-hosted via next/font, the header and footer match the UI doc
And the security headers (SEC-1) are present on every response and every route is static
```
**Tech notes**: ADR-5 (no middleware, `setRequestLocale`, `/`→`/fr` redirect), UI §2 tokens in Tailwind 4 `@theme`, status mark SVGs, message-file parity test. **Deps**: 0.1.

### Story 2.2: List page (static)
**Must · M · Frontend Dev**. As a citizen, I want every commitment of a mandate with neutral counts, so that I see where things stand (US-1, US-7).
```gherkin
Given the fixture mandate
Then counts show all six statuses in the fixed order with equal weight and no overall percentage
And rows follow programme order, each with theme, title, status, mini progress (metric only) and "Vérifié le"
And without JavaScript the rows are grouped by theme with a jump-link index
```
**Deps**: 1.8, 2.1.

### Story 2.3: Filters (the only client island)
**Must · M · Frontend Dev**. As a student, I want to filter by theme and status and share the view (FR-10).
```gherkin
Then the Test Strategy "Browse commitments" scenarios pass (share URL, zero results + reset, invalid params ignored)
And the result count is announced (aria-live), mobile uses a <dialog> sheet, desktop a ruled facet list
And list-page JS stays < 100 KB gzip
```
**Tech notes**: pure `lib/filters.ts` (parse / apply / serialise) unit-tested; `history.replaceState`. **Deps**: 2.2.

### Story 2.4: Detail page: header, quote, progress
**Must · M · Frontend Dev**. As a citizen, I want to read the exact promise and see how far it got (US-2, US-4, US-5).
```gherkin
Then the "Read one commitment" scenarios pass: verbatim quote + source page, status + definition link on its own line,
  deadline, lastVerified, sourced baseline/latest/target, "sans cible chiffrée" for editorial, "Données indisponibles" when data is missing,
  "ترجمة وعد" + original for wa3d translations
```
**Tech notes**: ADR-8 (text only, https links, `rel=noopener noreferrer`). **Deps**: 2.1, 1.8.

### Story 2.5: Detail page: timeline, cite, report
**Must · M · Frontend Dev**. As a journalist, I want every step sourced and a citable link (US-3, US-8, US-9).
```gherkin
Then the timeline is newest-first, each entry has an official source link, and press pointers use the secondary link style
And "Citer" is open with the canonical URL, and the report link points to the correction.yml issue form with the id prefilled
And a note in <script> is rendered as literal text (integration test)
```
**Deps**: 2.4.

### Story 2.6: Home, empty mandate, 404, Méthodologie
**Must · M · Frontend Dev + Copywriter**. As any reader, I want to understand the method and never hit a dead end (US-9, ADR-10).
```gherkin
Then home shows the newest mandate with commitments (canonical → mandate URL); an empty mandate shows "publication attendue" with noindex
And unknown ids and embargoed mandates return the 404 page
And /fr/methodologie has anchors #statut-<status> for all six statuses, the sourcing, neutrality and translation rules, and the public-issue notice
```
**Deps**: 2.2.

### Story 2.7: SEO
**Must · S · Frontend Dev**. As the project, I want commitment pages found and cited correctly (FR-12, G5).
```gherkin
Then every page has title, description, canonical and hreflang fr/ar from NEXT_PUBLIC_SITE_URL
And sitemap.xml lists only enabled, non-empty mandates in both locales; robots.txt points to it
```
**Deps**: 2.2, 2.4.

### Story 2.8: Arabic copy review
**Should · S · You (native review) + Copywriter**. As an Arabic reader, I want natural, neutral Arabic labels.
```gherkin
Given messages/ar.json and the six AR status labels (UI §2 drafts)
When you review them
Then corrections are merged and the parity test still passes
```
**Deps**: 2.6.

## Epic 3: CI/CD and hardening
### Story 3.1: CI: quality, catalogue, test, security
**Must · M · DevOps**. As the maintainer, I want every PR checked automatically (DevOps §3, SEC-4).
```gherkin
Given a PR
Then the quality, catalogue, test (80% gate) and security jobs run with SHA-pinned actions and read-only permissions, and a failing gate blocks merge
```
**Deps**: 0.1, 1.9.

### Story 3.2: CI: E2E, route check, embargo smoke
**Must · M · DevOps + Tester**. As the maintainer, I want the real build tested in both languages and the embargo proven.
```gherkin
Then e2e runs on a fixture build (FR + AR, mobile + desktop, axe, headers), the route check fails on any dynamic route,
  and embargo-smoke proves the archive 404s and is absent from the sitemap with the flag unset
```
**Deps**: 2.2–2.7, 3.1.

### Story 3.3: CI: Lighthouse budgets
**Must · S · DevOps**. As a mobile reader, I want the site fast and accessible (G6, NFR-1).
```gherkin
Then lhci asserts perf ≥ 0.95, a11y ≥ 0.95 (median of 3) on list + detail FR + AR, and list JS < 100 KB
```
**Deps**: 3.2.

### Story 3.4: Repo hardening, templates, monthly review
**Must · S · DevOps + Security Engineer**. As the publisher, I want the publishing chain locked down (SEC-5, SEC-6, G3).
```gherkin
Then branch protection, secret scanning + push protection, private vulnerability reporting, the correction.yml issue form,
  SECURITY.md, dependabot.yml and the monthly-review workflow are in place, and the monthly review can be run manually
```
**Deps**: 3.1; your one-time actions in DevOps §5.

### Story 3.5: Vercel project and first deploy
**Must · S · Deployment + you**. As the project, I want production live on the placeholder URL with the archive dark.
```gherkin
Given the Vercel project with the §2 env vars (archive flag false)
When main is deployed
Then https://wa3d-ma.vercel.app serves the home empty state or 2026-2031 "publication attendue", with the security headers present
```
**Deps**: 3.2.

## Epic 4: 2021-2026 dataset and archive launch
### Story 4.1: Curation guide and reference lists
**Must · S · PM + Copywriter**. As the curator, I want written rules, so that every entry is curated the same way for any coalition.
```gherkin
Then docs/curation-guide.md covers adding a commitment, writing neutral titles and notes, statuses vs deadlines, sources and archive links, translation provenance
And data/banned-words.json (FR + AR) and data/official-domains.json have first versions for your review
```
**Deps**: 1.1 (can start in Sprint 1 so curation starts early).

### Story 4.2: Indicators
**Must · M · Backend Dev**. As a researcher, I want official values behind every progress bar (FR-6, SDR-4).
```gherkin
When I run pnpm fetch:indicators
Then World Bank values are written to data/indicators/*.json with source + accessed date; HCP/BAM values are entered by hand with source URLs
And every indicator validates (V-1, V-7, V-12)
```
**Deps**: 1.9.

### Stories 4.3a–c: Curate the 2021-2026 dataset (local-only branch `data/2021-2026`)
**Must · 3 × L · Curator (you + me)**. As a reader, I want the 2021 programme's commitments with verbatim quotes and official evidence.
- **4.3a** Employment + economy · **4.3b** Social protection + health + education · **4.3c** Governance, housing, water/energy, other
```gherkin
Given the Oct 2021 programme PDF (archived copy stored if the URL is unstable)
Then each commitment has a verbatim FR/AR quote with provenance, an origin page, sourced evidence, and passes pnpm catalogue:validate locally
And nothing from this branch is pushed before 2026-09-24 (ADR-3, SEC-8)
```
**Tech notes**: confirm the mandate end date (DB §3 placeholder 2026-09-23). **Deps**: 1.9, 4.1, 4.2.

### Story 4.4: Dataset verification ⛔
**Must · M · You**. As the publisher, I want a human check of every entry before anything is public.
```gherkin
Given a verification worksheet listing every commitment, quote, status and source
When you check each line against its source
Then corrections are applied and you sign off in writing (logged)
```
**Deps**: 4.3a–c.

### Story 4.5: Lift the embargo and ship v1.0
**Must · S · Deployment**. As a citizen, I want the 2021-2026 archive online.
```gherkin
Given the date is ≥ 2026-09-24 and 4.4 is signed off
When runbook R1 runs (push, PR, green CI including real-data-smoke, flag true, merge)
Then the archive is live in FR + AR, the sitemap is submitted, and .recordings/v1.0-<date>.webm is recorded (rule 9) and pushed
```
**Deps**: 4.4, 3.5.

## Epic 5: 2026-2031 mandate (triggered by the programme's presentation to Parliament)
### Story 5.1: Ingest the 2026-2031 programme within 72 h
**Must · L (split per theme at the time) · Curator**. As a citizen, I want the new government's commitments tracked from day one (G4).
```gherkin
Given the programme is presented (PDF or speech transcript)
When runbook R4 runs
Then the 2026-2031 catalogue is live within 72 h and the home page switches to it automatically
```
**Deps**: v1.0 shipped.

## Sprint Allocation
| Sprint | Goal | Stories | Estimated effort |
|---|---|---|---|
| **1** | The engine that decides what the site can say | 0.1, 1.1–1.9, 3.1, 4.1 | ~4 days |
| **2** | The site, in both languages, shipped dark | 2.1–2.7, 3.2–3.5 | ~4.5 days |
| **3** | The 2021-2026 archive, verified and live (≥ 24 Sept) | 4.2, 4.3a–c, 4.4, 2.8, 4.5 | ~5 days (+ your verification time) |
| **4** | 2026-2031 tracked within 72 h | 5.1 | triggered (~Oct 2026) |

Each sprint ends with SHIP: coverage report, security check, push, CI green (rules 6, 7, 11). Sprint 3 ends v1.0, which includes the recording (rule 9).
**Timing honesty**: the archive realistically goes live in early October, not on 24 Sept. As logged earlier, 24 Sept is the earliest possible date, not a deadline. If the 2026-2031 programme arrives before Sprint 3 ends, Story 5.1 takes priority (G4 is time-boxed; the archive is not).

## Traceability (PRD → story)
| Requirement | Stories |
|---|---|
| FR-1 stable ids/URLs | 1.1, 1.4, 2.4, 2.7 |
| FR-2 verbatim quote + provenance | 1.1, 2.4, 4.3 |
| FR-3 origin | 1.1, 2.4 |
| FR-4 derived status | 1.2 |
| FR-5 official sources | 1.5, 2.5 |
| FR-6 sourced numbers | 1.1, 1.3, 2.4, 4.2 |
| FR-7 editorial, no invented target | 1.1, 2.4 |
| FR-8 "Données indisponibles" | 1.3, 2.4 |
| FR-9 embargo | 1.7, 1.8, 2.6, 2.7, 3.2, 4.5 |
| FR-10 URL filters | 2.3 |
| FR-11 CI rules | 1.4–1.7, 1.9, 3.1 |
| FR-12 SEO | 2.7 |
| NFR-1 performance / NFR-3 a11y | 2.1–2.3, 3.3 |
| NFR-2 security | 1.5, 2.1, 2.5, 3.1, 3.4 |
| NFR-4 neutrality | 1.7, 2.2, 4.1, 4.4 |
| NFR-6 quality | all (DoD), 3.1–3.3 |
| US-1…US-9 | 2.2–2.7 (scenarios in Test Strategy §3.2) |

## Story Validation Checklist
- [x] Every PRD requirement maps to at least one story
- [x] Every story has testable acceptance criteria (Gherkin, keyed to the Test Strategy)
- [x] Dependencies identified and ordered
- [x] No story larger than L (the dataset is split into three)
- [x] Architecture decisions referenced in technical notes
- [x] Security requirements reflected (1.5, 2.1, 2.5, 3.1, 3.4, SEC-8 in 4.3)
