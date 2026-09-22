# Activity Log
<!-- Tracks completed tasks, milestones, and deliverables -->
<!-- Format: ### [YYYY-MM-DD HH:MM] COMPLETED/MILESTONE — Title -->

### [2026-09-18] PLAN — Foundation docs (🔴), awaiting confirmation
- B1 PRD · B2 System Design, Architecture · B3 Security, Database · B4 UX, UI (+ design loop) · B5 Test Strategy, DevOps, Stories · B6 .env.example, commit, GitHub repo, push. Each doc = own approval gate.

### [2026-09-18] COMPLETED — Task 1.1 PRD draft
- docs/prd-wa3d-ma.md v1.0 Draft: 9 user stories, FR-1..12, NFR-1..6, status definitions, 4 open questions. Awaiting user approval (gate).


### [2026-09-21] COMPLETED — PRD v1.1 approved by user

### [2026-09-21] COMPLETED — Task 2.1 System Design draft
- docs/system-design-wa3d-ma.md v1.0 Draft: SSG only, client filter island, build-time embargo flag, committed indicator snapshots, Vercel Hobby + Cloudflare Pages fallback, build-time freshness report. Awaiting approval (gate).

### [2026-09-21] COMPLETED — System Design v1.0 approved by user

### [2026-09-21] COMPLETED — Task 2.2 Architecture draft
- docs/architecture-wa3d-ma.md v1.0 Draft: 10 ADRs, layered lib/ (pure domain + load.ts), single client island, routes table, fitness functions. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Architecture v1.0 approved by user

### [2026-09-21] COMPLETED — Task 3.1 Security Baseline draft
- docs/security-wa3d-ma.md v1.0 Draft: STRIDE, SEC-1..9 (headers, CSP unsafe-inline decision, official-domain allowlist, supply chain, repo settings, noreply email, embargo check). Found ADR-3 flaw: pushed branches are public. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Security Baseline v1.0 approved; ADR-3 amended (local-only data branch)

### [2026-09-21] COMPLETED — Task 3.2 Database Design draft
- docs/database-wa3d-ma.md v1.0 Draft: zod schema (Commitment/Evidence/Source/Indicator), V-1..V-16 rules (V-9 enforces status defs vs deadline), in-memory lookups, schemaVersion migrations. Open: title field, Source.accessed rename, 2021-2026 mandate end date TBC. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Database Design v1.0 approved by user

### [2026-09-21] COMPLETED — Task 4.1 UX Foundation draft
- docs/ux-wa3d-ma.md v1.0 Draft: 3 personas, IA (4-item nav), 5 flows, lo-fi wireframes (list, detail, empty mandate, 404, méthodologie), states, 11 interaction rules (counts not scores, programme order, Western digits in AR, no-JS fallback). Awaiting approval (gate).

### [2026-09-21] COMPLETED — UX Foundation v1.0 approved by user

### [2026-09-21] MILESTONE — Task 4.2 UI draft + design loop round 1 started
- docs/ui-wa3d-ma.md (aesthetic "the public record": ink/paper/sepia, Plex Sans + Source Serif 4 / Plex Arabic + Noto Naskh, ink-only status shapes). Mockups docs/design/mockups (list FR, detail FR/AR), renders shots/r1, brief docs/design/brief.md. 3 fresh-context critics (sonnet) launched.

### [2026-09-21] MILESTONE — Design loop round 1 complete (3/3 FAIL)
- Brief: 4 findings, System: 1, Craft: 9. Accepted 8 fixes (desktop reset, sourced baseline/target, press labelled secondary, cite block open, counts restructured, tick removed, help link demoted, mobile active tag). Rejected: Craft 2 (conflicts neutrality), 3 (not in render), 7-9 (RTL already correct, verified by zoomed crops). Round 2 launched.

### [2026-09-21] MILESTONE — Design loop round 2 complete (Brief PASS, Craft PASS, System FAIL)
- Fixed: AR breadcrumb glyph (bidi-mirrored ‹ → ›), target year, footer gap, desktop facets as ruled list, bar/label proximity; System: cite box off white surface, secondary-link variant documented in UI §3. Rejected again: AR fill/rail claims (verified by crop; System critic pixel-confirmed mirroring correct). Round 3 launched on shots/r3.

### [2026-09-21] COMPLETED — Design loop closed after round 3 (Brief PASS, System PASS, Craft FAIL: false positive + taste)
- Final fixes: status-line flex, per-number source lines, regular-weight mobile filter buttons. Renders shots/final. UI doc §7 logs all rounds, accepted/rejected findings, residual risks (AR copy review, unrendered screens, critics misread RTL on downscaled renders). Awaiting user approval of UI v1.0 + DB v1.1.

### [2026-09-21] COMPLETED — UI Foundation v1.0 + Database v1.1 approved by user

### [2026-09-21] COMPLETED — Task 5.1 Test Strategy draft
- docs/test-strategy-wa3d-ma.md v1.0 Draft: risk table (status/validator/allowlist/embargo = Maximum), pyramid + 80% gate + 100% branches on status/progress/validate, decision tables + V-9 boundaries + Casablanca-timezone "today", property tests, Gherkin for US-1..9, adversarial URL/Unicode table, release gates, e2e:record. Proposes V-17 (bidi/zero-width chars). Awaiting approval (gate).

### [2026-09-21] COMPLETED — Test Strategy v1.0 approved; DB v1.2 (V-17) approved

### [2026-09-21] COMPLETED — Task 5.2 DevOps Foundation draft
- docs/devops-wa3d-ma.md v1.0 Draft: local/preview/prod, 8 CI jobs (quality, catalogue, test, security, e2e+route check, embargo-smoke, lighthouse, real-data-smoke), monthly-review workflow, dependabot, repo hardening checklist, runbooks R1-R5. New env WA3D_DATA_DIR (CI-only). Branch master→main rename needed. Awaiting approval (gate).

### [2026-09-21] COMPLETED — DevOps Foundation v1.0 approved (env values confirmed)

### [2026-09-21] COMPLETED — Task 5.3 Stories draft
- docs/stories-wa3d-ma.md v1.0 Draft: 6 epics, 31 stories (max L; dataset split 4.3a-c), Gherkin per story, 4 sprints (engine ~4d, pages+CI ~4.5d, dataset+launch ~5d, 2026-2031 triggered), traceability FR/NFR/US. Archive realistic go-live early Oct. Awaiting approval (gate), then .env.example + docs commit + push.

### [2026-09-21] MILESTONE — All 10 foundation docs approved (Stories v1.0 approved)

### [2026-09-21] PUSH — Foundation pushed to github.com/rhorba/wa3d-ma (public, main)
- Commits bf328ca (docs: foundation documents) + e92133e (chore: CTS framework, handoff, logs). Branch master→main renamed; repo-local email set to GitHub noreply (SEC-7). Pre-push scan: no personal email/secrets.
- CI status: no workflows yet (arrive with Story 3.1), nothing to monitor.

### [2026-09-21] PLAN — Sprint 1 confirmed by user
- Batches: A (PR1 scaffold, PR2 CI) · B (PR3-5 schema/status/progress) · C (PR6-9 validator) · D (PR10 loader, PR11 CLI + catalogue job, PR12 guide, SHIP). Checkpoint after each batch.

### [2026-09-21] COMPLETED — Story 0.1 scaffold (PR 1)
- Next 15.5.25/React 19.1/next-intl 4/zod 4.6.5/Tailwind 4/Vitest 5/Playwright 1.63, lockfile seeded from da3m-ma (7-day release-age guard blocked prettier 3.9.8). ESLint fitness rules (pure domain imports, react/no-danger, process.env only in lib/env.ts). lib/env.ts validated at next.config load (prerender errors are redacted, so config-time check gives readable failures). Local: lint/types/format OK, 17 tests, coverage 100%, build all static, e2e 6/6. No CI yet (arrives PR 2).

### [2026-09-21] CI — PR #2 run 35636081083 GREEN (4/4 jobs)
### [2026-09-21] CI — main after #2 RED: security job
- Cause: setup-node cache: pnpm in a job that never installs; no cache on main → post-step "Path Validation Error". Fix: drop cache from security job (fix/ci-security-cache).

### [2026-09-21] CI — main after #3 GREEN (4/4). Issue closed.

### [2026-09-21] MILESTONE — Batch A complete (PR #1 scaffold, #2 CI, #3 CI fix)
- Note: python edits on Windows write CRLF; use newline="" from now on (.gitattributes keeps the index LF).

### [2026-09-21] COMPLETED — Story 1.1 schema (PR feature/1.1-schema)
- lib/catalogue/schema.ts (DB v1.2: strict objects, https URLs, NFC text, titles <= 90, baseline.source) + tests/builders.ts (fictional). 34 schema tests. Note: tools turned a \u0301 escape into an invisible literal; test now builds it with String.fromCodePoint (V-17 relevance).

### [2026-09-21] COMPLETED — Story 1.2 status derivation
- lib/catalogue/status.ts: currentStatus (latest entry or not_started), statusCounts (fixed order, zeros kept). Decision table + 2 fast-check properties. 100% threshold on status.ts added to vitest config. Coverage total 100%.

### [2026-09-21] COMPLETED — Story 1.3 progress
- lib/catalogue/progress.ts: ratio baseline→latest→target, both directions, clamped [0,1], null when no post-baseline value (FR-8) or zero distance. 6 examples + 2 properties (bounds, monotonic). 100% threshold added.

### [2026-09-21] CI — PRs #4, #5, #6 and main after each: GREEN

### [2026-09-21] MILESTONE — Batch B complete (schema #4, status #5, progress #6); coverage 100%

### [2026-09-21] COMPLETED — Story 1.4 validator core (V-1..V-6)
- validate.ts (pipeline, issues sorted, hasErrors, todayInCasablanca) + rules/types.ts + rules/structure.ts. 23 tests incl. 23:30 UTC = next day in Casablanca, fuzz 200 runs. 100% thresholds on validate.ts + rules/**. Total 94 tests, 100% coverage.

### [2026-09-21] COMPLETED — Story 1.5 V-7 allowlist + V-17 hidden characters
- rules/sources.ts: dot-boundary host match via WHATWG URL (userinfo/IDN/trailing-dot/look-alike table), archiveUrl only web.archive.org, pointers exempt; V-17 via numeric code-point ranges. data/official-domains.json v0.
- Tooling hazard hit twice: escapes written as \u202A turned into literal invisible chars (in the V-17 regex itself, then in a comment). Fix: numeric ranges + scripts/check-hidden.ts in the fitness gate (reuses firstHiddenCodePoint); verified it fails on a planted U+202E. 119 tests, 100% coverage.

### [2026-09-21] COMPLETED — Story 1.6 V-8, V-9, V-11, V-12
- rules/consistency.ts + MANDATE_START (2021-10-07; 2026-2031 placeholder 2026-09-24). Full V-9 boundary table (14 cases). V-3 test isolated (V-8 correctly flagged builder evidence predating 2026-2031). 147 tests, 100%.

### [2026-09-21] COMPLETED — Story 1.7 V-10 + V-13..V-16
- rules/neutrality.ts (FR accent/case, AR tashkeel/letter variants/proclitics, whole-word + phrases), freshness.ts (daysBetween, staleCommitments), rules/lifecycle.ts (V-13/14/15 warnings, V-16 embargo error incl. invalid files). data/banned-words.json v0 (23 FR, 16 AR). Builders: today 2026-09-30, evidence default achieved; earlier error tests filter warnings. 176 tests, 100%.

### [2026-09-21] CI — PRs #7-#10 and main after each: GREEN

### [2026-09-21] MILESTONE — Batch C complete (validator V-1..V-17: #7 core, #8 security, #9 consistency, #10 neutrality/lifecycle); 176 tests, 100% coverage

### [2026-09-21] COMPLETED — Story 1.8 loader, mandates, fixtures
- lib/catalogue/load.ts (readCatalogue/buildCatalogue/loadCatalogue memo, CatalogueError, programme order, V-1 on unparsable JSON, reference lists always from data/, embargo only for data/), lib/mandates.ts (enabledMandates, defaultMandate ADR-10), server-only (+ vitest stub; CLI must use tsx --conditions=react-server). Fictional fixture: 10 commitments (all themes/statuses/provenances), 2 indicators, 2 intended warnings. Integration: 13 broken-catalogue scenarios generated in temp dirs. 205 tests; total branches 97.6%.

### [2026-09-21] COMPLETED — Story 1.9 catalogue CLI + CI catalogue job
- scripts/catalogue.ts (validate exit 1 on errors; freshness; links HEAD→GET fallback, warnings only), lib/catalogue/report.ts (formatting, markdown summary, sourceLinks, checkLinks with injectable fetch). CI job validates data/ and the fixtures, writes the job summary. 217 tests.

### [2026-09-21] COMPLETED — Story 4.1 curation guide + reference lists v1
- docs/curation-guide.md (10 sections: layout, adding a commitment, statuses table, neutral notes, sources/archives, freshness, PR checks, embargo branch, correction issues, checklist). Lists v1 approved by user; inflected forms added. 218 tests.

### [2026-09-21] MILESTONE — Sprint 1 SHIP
- VERIFY on main 1b533db: lint/types/format/fitness ok, 218 tests, coverage 100% lines / 97.3% branches (>= 80%), catalogue:validate data/ clean, pnpm audit clean, build static, e2e 6/6, CI green.
- Recording (rule 9): not applicable, Sprint 1 has no user-facing pages (first recording at v1.0, Story 4.5).
- Retro: ✅ PR-per-story kept every change CI-gated and reviewable; property + adversarial tests caught real edge cases (V-3/V-8 interplay, AR feminine forms, phrase at end of text). ❌ Tooling silently turned \u escapes into invisible characters (twice) and bash heredocs with apostrophes failed; one red main run from a CI cache setting. 💡 Keep numeric code points + the fitness hidden-char scan; use the Write tool for multi-line files; watch main after every merge (did).

### [2026-09-21] PLAN — Sprint 2 confirmed by user
- A: 2.1 layout, 3.2 CI e2e (moved up) · B: 2.2 list, 2.3 filters · C: 2.4, 2.5 detail · D: 2.6 home/404/méthodologie, 2.7 SEO · E: 3.3 Lighthouse (+NFR-1), 3.4 hardening, 3.5 Vercel (needs vercel login) · SHIP incl. design check + recording v0.2.

### [2026-09-21] COMPLETED — Story 2.1 layout, i18n, tokens, headers
- UI tokens in Tailwind @theme, next/font self-hosted (Plex, Source Serif 4, Plex Arabic, Noto Naskh), SiteHeader (mandate menu, méthodologie, same-page language toggle), SiteFooter (neutrality, correction link, build date in bdi), StatusMark, ExternalLink (secondary variant), lib/format.ts, SEC-1 headers + CSP (no upgrade-insecure-requests: HSTS covers prod, breaks local e2e). No NextIntlClientProvider (JS budget). E2E 14/14; fonts verified by computed style.

### [2026-09-21] COMPLETED — Story 3.2 CI e2e, route check, embargo smoke
- CI jobs: e2e (fixture build, archive on, route-check, Playwright FR/AR desktop+mobile incl. axe) and embargo-smoke (archive off, @embargo specs). scripts/route-check.sh verified both ways. Local: e2e 18/18, embargo 10/10.

### [2026-09-21] CI — PR #16 (3.2) 7/7 jobs GREEN; main GREEN

### [2026-09-21] MILESTONE — Sprint 2 Batch A complete (#15 layout, #16 CI e2e/route/embargo)

### [2026-09-22] CI — main RED after #16 (next/font/google fetch), fixed by #17 self-hosted fonts; main GREEN 7/7 jobs

### [2026-09-22] MILESTONE — Sprint 2 Batch A complete (#15 layout, #16 CI e2e/route/embargo, #17 local fonts)
- Lesson: my local font probe first hit a stale server on :3200 (cleanup failed silently); now verify ports are free after every local server run.

### [2026-09-22] COMPLETED — Story 2.2 list page
- /{locale}/{mandate}: counts (fixed order, equal cells, no score), programme-order rows (theme, title, status mark, mini progress floor %, noData/noTarget, verified date in bdi), pending-mandate state (noindex), theme-grouped no-JS markup flattened by CSS once the island marks it enhanced. lib/list.ts (100%). E2E 36/36 incl. axe on list FR/AR.

### [2026-09-22] COMPLETED — Story 2.3 filters island
- lib/filters.ts (parse/serialize/match/toggle, 100%, round-trip property), lib/catalogue/constants.ts (zod-free vocabularies for browser code), CommitmentFilters (only use client: URL sync via replaceState, rows hidden, aria-live count, zero results + reset, desktop ruled facets, mobile <dialog> sheet, hidden until hydrated). List page JS 105 kB total, island ~1.5 kB (budget 130/15). Fixed desktop grid gap (grid-template-rows: auto 1fr). E2E 48/48.

### [2026-09-22] CI — PR #19 (2.3) and main: GREEN

### [2026-09-22] MILESTONE — Sprint 2 Batch B complete (#18 list, #19 filters)

### [2026-09-22] COMPLETED — Story 2.4 detail page (header, quote, progress)
- /{locale}/{mandate}/{id} static per enabled mandate (dynamicParams=false, wrong mandate → 404): breadcrumb (theme link pre-filters list), title, status + definition link, deadline (passée at build), lastVerified, verbatim quote + provenance (wa3d label + original in details, official/original notes), source opens PDF at #page=N, progress panel metric/no-data/editorial with units. lib/detail.ts 100%. E2E 72/72, axe on 2 detail pages.

### [2026-09-22] COMPLETED — Story 2.5 timeline, citation, correction link
- EvidenceTimeline (newest first, current marker, notes split on blank lines as text, official source + archive, dotted secondary press pointers, empty state), CommitmentActions (Citer open with permalink from NEXT_PUBLIC_SITE_URL, correction.yml issue link prefilled with id/page, public note, back link to pre-filtered list). Fixture fictif-autre carries an escaping test note. E2E 84/84.
