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

### [2026-09-22] CI — PRs #20, #21 and main: GREEN

### [2026-09-22] MILESTONE — Sprint 2 Batch C complete (#20 detail top, #21 timeline/cite/report)

### [2026-09-22] COMPLETED — Story 2.6 home, 404, Méthodologie
- Home = defaultMandate list (canonical → mandate URL) or intro when none (real data today); shared MandateList; passthrough root layout + bilingual root not-found for unknown URLs; localized [locale]/not-found; Méthodologie FR/AR (7 sections, sticky TOC, #statut-* anchors with definitions from PRD §5.3, links to domain list, correction form, git history); fonts moved to app/fonts.ts; @next/next/no-html-link-for-pages off (plain anchors by design). E2E 102/102; intro verified on real (empty) data build.

### [2026-09-22] COMPLETED — Story 2.7 SEO
- lib/seo.ts (alternates fr/ar/x-default, truncate, openGraph helper vs shallow metadata merge, sitemapEntries), app/sitemap.ts (enabled non-empty mandates + details + méthodologie, alternates, lastModified; never home or archive when embargoed), app/robots.ts; metadata on home/list/detail/méthodologie (canonical, hreflang, descriptions status-first, OG). Embargo spec now requires sitemap 200 without 2021-2026. E2E 110/110, embargo 10/10.

### [2026-09-22] CI — PR #23 (2.7) and main: GREEN

### [2026-09-22] MILESTONE — Sprint 2 Batch D complete (#22 home/404/méthodologie, #23 SEO): all pages built

### [2026-09-22] PHASE — Story 3.3 UNDERSTAND (DevOps + Test Architect)
- Scope: lhci on list + detail, FR + AR, mobile, median of 3; perf/a11y >= 0.95; list JS <= 130 KB (user decision 2026-09-21), island <= 15 KB; PRD NFR-1 wording update. No budget is enforced automatically today. No new env vars.

### [2026-09-22] PHASE — Story 3.3 PLAN confirmed (lhci config, bundle-budget script, lighthouse job, docs); EXECUTE
- HANDOFF DevOps -> Tech Lead: implement per plan; island = list-page chunks minus layout chunks.

### [2026-09-22] COMPLETED — Story 3.3 EXECUTE (Tech Lead) -> HANDOFF to Tester/DevOps for VERIFY
- lib/bundle-budget.ts (100%) + scripts/bundle-budget.ts (pnpm budget: list 104.3 KB, island 2.8 KB), lighthouserc.json (4 URLs x 3, median run), CI job lighthouse (artifact 7 d). Docs: PRD NFR-1, architecture, system design, stories, test strategy, devops, UI §2.
- Local lhci (Windows, noisy): FR 0.95-0.97, AR detail 0.95, AR list 0.94; a11y 1.0 everywhere. Before: FR 0.93-0.94, AR 0.88-0.89.
- VERIFY local: lint, types, format, fitness OK; unit+integration 255 passed (100% stmts, 97.2% branches); route check static; E2E 110/110; AR shaping checked by screenshot.

### [2026-09-22] CI — PR #25 run 1 RED: lighthouse list pages perf 0.85-0.86, CLS 0.23-0.26 from web font swap (fonts no longer preloaded); detail pages 0.97-0.98, budget OK. Fix: font-display optional (user choice).

### [2026-09-22] CI — PR #25 run 2: 8/8 GREEN; merged as 968dae8 (user said merge); main 8/8 GREEN

### [2026-09-22] MILESTONE — Story 3.3 shipped (#25)

### [2026-09-22] PHASE — Story 3.4 UNDERSTAND (DevOps + Security Engineer)
- Repo: public; secret scanning + push protection ON; OFF: branch protection, private vuln reporting, dependabot security updates, squash-only, delete-on-merge. Missing: ISSUE_TEMPLATE (correction.yml fields commitment/page used by CommitmentActions), config.yml, SECURITY.md, dependabot.yml, monthly-review.yml. No new env vars.

### [2026-09-22] PHASE — Story 3.4 PLAN confirmed; EXECUTE
- HANDOFF DevOps -> Tech Lead (files) -> DevOps (settings via gh api after merge). Security Engineer reviews SECURITY.md + form notice.

### [2026-09-22] COMPLETED — Story 3.4 files (EXECUTE) -> HANDOFF Tester for VERIFY
- correction.yml (bilingual, public notice first, required commitment/what/source, ids match CommitmentActions), config.yml (no blank issues, Méthodologie + private security links), SECURITY.md, dependabot.yml (npm security-only via limit 0, actions monthly grouped), monthly-review.yml (1st 08:00 UTC + dispatch, one issue per month, updates on re-run). tests/integration/repo-templates.test.ts.
- VERIFY local: actionlint 1.7.7 clean (checksum-verified binary; Docker down), lint/types/format/fitness OK, 259 tests, coverage 100% stmts / 97.2% branches.

### [2026-09-22] CI — PR #26 run 1 RED: Semgrep dependabot-missing-cooldown (2 blocking). Fix: cooldown default-days 7 on both ecosystems.

### [2026-09-22] CI — PR #26 run 2: 8/8 GREEN + dependabot check; merged as ce412f3; main 8/8 GREEN

### [2026-09-22] COMPLETED — Story 3.4 settings (DevOps via gh api)
- Squash-only (title/body), delete-on-merge; private vulnerability reporting ON; Dependabot alerts + security updates ON; label correction.
- Branch protection main: 8 required checks (app 15368), strict, enforce_admins, 0 reviews, linear history, no force-push/deletion. From now on every change to main goes through a PR.
- Smoke: monthly-review dispatched -> issue #28 created; re-run updated #28 (no duplicate); #28 closed as test.

### [2026-09-22] MILESTONE — Story 3.4 shipped (#26)

### [2026-09-22] PHASE — Story 3.5 UNDERSTAND (Deployment + DevOps)
- Vercel CLI 50.32.5 installed; no .vercel link; env vars known (.env.example), no secrets.

### [2026-09-22] COMPLETED — Story 3.5 first deploy (Deployment, via user browser session)
- Vercel project wa3d-ma imported from rhorba/wa3d-ma (Hobby), Next.js preset, env vars SITE_URL / ARCHIVE_ENABLED=false / REPO_URL for Production + Preview. First deploy dpl_5behGwsLFtcvZf77pBPVau53y1gB (6eb0bf2).
- Verified prod: / 308 -> /fr; /fr /ar /fr/methodologie /ar/methodologie 200; home intro FR/AR (no real data yet); /fr/2021-2026 and details 404 (embargo); sitemap = methodologie FR/AR only; robots OK; headers CSP (frame-ancestors none, base-uri none, form-action none), HSTS 2y, nosniff, Referrer-Policy, Permissions-Policy, COOP.
- Found + fixed: /nope 500 on Vercel -> PR #30 (dynamicParams=false on [locale]) merged 0b40ccd, CI 8/8 + Vercel green; prod /nope /en /favicon.ico 404 (bilingual page).
- Settings: Node.js 24.x -> 22.x (matches CI; applies from next deploy); Deployment Protection Standard (previews need Vercel login) confirmed.

### [2026-09-22] MILESTONE — Story 3.5 shipped: production live at https://wa3d-ma.vercel.app (archive dark)

### [2026-09-22] CI — PR #31 (logs) and #32 (dev-dep overrides) 8/8 + Vercel GREEN; main 3c39159 GREEN; production redeployed on Node 22.x, spot-checked (/ 308, /fr /ar 200, archive 404, /nope 404)

### [2026-09-22] COMPLETED — Dependabot alerts (5, all dev-only via @lhci/cli)
- #1-#3 tmp/uuid fixed by pnpm overrides (tmp 0.2.7, uuid 11.1.1; lhci verified). #4-#5 extract-zip dismissed not_used (only runs on puppeteer browser download, never in our lhci job; no patched version) - user choice.

### [2026-09-22] PHASE — Sprint 2 SHIP (Tester + Test Architect + DevOps): full verify, coverage, design check, recording v0.2

### [2026-09-22] COMPLETED — Sprint 2 SHIP verify
- Full verify on main 3c39159 then e0a7173: lint/types/format/fitness/catalogue OK; 262 tests, coverage 100% stmts / 97.22% branches; fixture build static; budget OK; E2E 116/116; embargo 10/10; pnpm audit high = 2 dismissed extract-zip only.
- Design check vs docs/design/mockups/shots/rfinal (list-fr desktop, detail-ar mobile): layout and anatomy match; deltas: fixture data, ↗ outside underline (cosmetic), AR mandate range order (Story 2.8 open question), system fonts on first visit (fixed #33, verified cold on prod AR + FR 4G).
- Recording: .recordings/v0.2-2026-09-22.webm (22 s: home, list, filters theme+status, detail FR, language toggle, detail AR, Méthodologie, 404). pnpm e2e:record added (playwright.record.config.ts, e2e/record, scripts/record.sh). Local next start serves root 404 unstyled; production 404 styled (checked).

### [2026-09-22] MILESTONE — Sprint 2 complete: site in FR + AR live at https://wa3d-ma.vercel.app with the archive dark

### [2026-09-22] CI — Dependabot PR #27 (actions group: checkout v7.0.1, setup-node v7.0.0, pnpm/action-setup v6.1.0, upload-artifact v7.0.1): 8/8 GREEN, all 4 pinned SHAs verified against official tags; branch updated for strict protection.

### [2026-09-22] PHASE — Sprint 3 PLAN confirmed (Batches A-D); EXECUTE Batch A (tooling)

### [2026-09-22] CI — PR #27 re-run after rebase 8/8 GREEN; merged

### [2026-09-22] COMPLETED — Story 4.2 tooling: pnpm fetch:indicators (lib/catalogue/world-bank.ts 100%, scripts/fetch-indicators.ts), curation guide "Indicator values". End-to-end on a scratch dir: SL.UEM.TOTL.ZS 7 values, catalogue 0 errors. Indicator data files come with the pilot on the local data branch.
### [2026-09-22] COMPLETED — real-data-smoke CI job (gap from DevOps §3): e2e/real-data.spec.ts @realdata (homes + every sitemap URL: 200 + axe), pnpm e2e:real-data, job on every PR with the archive on; default suite excludes @realdata (116). Local run on data/ passes.
### [2026-09-22] COMPLETED — Story 4.4 tooling: pnpm catalogue:worksheet (lib/catalogue/worksheet.ts 100% lines / 90% branches), output to git-ignored .verification/; refuses to run with validation errors. Fixture sheet: 9 commitments, 64 checks + sign-off.

### [2026-09-22] COMPLETED — Sprint 3 Batch B: 16 pilot commitments + 2 indicators drafted on LOCAL branch data/2021-2026 (4d3b6f9, no upstream); validate --today 2026-09-24: 0 errors, 14 V-14 (agreed). Worksheet .verification/worksheet-2021-2026-2026-09-24.md (118 checks) opened for the user (Story 4.4). HANDOFF Curator -> User (verification).

### [2026-09-22] COMPLETED — Story 4.4 verification pass by Claude at user request (not independent human verification): 16/16 AR quotes vs page images OK, 28 evidence entries + 8 indicator values re-checked against sources; 1 error fixed (AMO notes claimed "1er décembre 2022", not in the CESE source; c387985). Report .verification/verification-report-2021-2026-2026-09-22.md (git-ignored, embargoed content). Awaiting user written sign-off.

### [2026-09-23] PHASE — Sprint 3 Batch C UNDERSTAND (Deployment + Tester + UI): go-live dry run, nothing pushed
- Data branch rebased on origin/main 972a0e3. validate --today 2026-09-24: 0 errors, 14 V-14 (agreed). Unit/integration 272/273: tests/integration/load.test.ts pinned today=2026-09-21 on the real data/ folder -> would have made the data PR red; fixed locally to use the real date (as the build does).
- Private preview build from a scratchpad copy of data/ (embargo guard untouched): fully static, 32 detail pages, list JS 104.1 KB / island 2.8 KB, e2e:real-data 1/1 (all sitemap URLs 200 + axe). Screenshots of 38 pages x mobile + desktop.

### [2026-09-23] COMPLETED — Story 4.4 second verification pass + sign-off (Claude, on the user's written instruction; not independent human verification)
- Worksheet regenerated = identical; programme SHA-256 identical; 16/16 AR quotes vs page images; 21/21 sources 200, 35/35 cited figures found verbatim, 6 cg.gov.ma dates + BO 7147 bis confirmed.
- Wayback: 15/21 sources now archived, each snapshot opened and content-checked; 28 archiveUrl entries added (data branch, local). 6 remain in .sources/archive-todo.txt.
- §4 choices accepted as drafted (details in the git-ignored report). Report §6-7 + worksheet 119/119 ticked and signed "Claude on instruction of rhorba, 2026-09-23".
- The scanned law PDF (no text layer) re-read in the browser: the 3 evidence entries citing it confirmed; report §6 updated.

### [2026-09-23] COMPLETED — Batch C fix/ar-bidi-display (Frontend Dev -> HANDOFF Tester)
- Mandate range: messages nav.mandate / list.eyebrow / list.heading / cite.text mark values with <ltr>; t.rich renders <bdi dir="ltr">, t.markup strips it for the <title> (components/ui/ltr.tsx). FR guillemets: frenchSpacing/withFrenchSpacing applied in buildCatalogue after validation (files unchanged) + FR messages use  . Source names in <bdi>. Real-data test uses the real date.
- VERIFY local: lint/types OK, 275 unit/integration, fixture build, budget 104.1 KB / 2.8 KB, E2E 120/120 (+4). After-screenshots on a private data copy: AR mandate reads 2021-2026 in header, eyebrow, H1, breadcrumb.
### [2026-09-23] CI — PR #39 run 1: 9/9 + Vercel GREEN; squash-merged as 4145647 (user authorized). main 9/9 GREEN.
### [2026-09-23] COMPLETED — Production check after #39 (Deployment): Vercel deploy success; / 308, /fr /ar /methodologie 200; archive list/detail 404 and absent from sitemap (embargo holds); /nope 404; HSTS + CSP present; FR méthodologie serves « score ».

- [2026-09-24] UNDERSTAND (R1 go-live): R1 step 1 passes locally: catalogue:validate 0 errors / 14 V-14 (agreed), unit+integration 275/275, coverage 99.82% lines. 6 sources still without Wayback copy.
- [2026-09-24] PLAN confirmed: push data branch -> PR -> CI green -> user sets flag + signs off -> squash-merge -> prod checks -> v1.0 recording + logs PR -> Search Console (user).
- [2026-09-24] HANDOFF Orchestrator -> DevOps/Deployment: context R1 go-live, dataset verified locally; need push + PR + CI monitoring; constraint: no merge before user flag + sign-off.
- [2026-09-24] Pushed data/2021-2026 (4799db6), PR opened. CI monitoring started.
- [2026-09-24] CI PR #41: GREEN (all 9 CI jobs incl. real-data-smoke + Vercel preview). Waiting on user: flag in Vercel Production + sign-off in PR.
- [2026-09-24] R1 step 3: dataset sign-off comment on PR #41 (Claude on user instruction; data/ identical to 2026-09-23 signed version). R1 step 4: Vercel NEXT_PUBLIC_ARCHIVE_ENABLED recreated as Config, Production only, value true (old Secret-type var deleted: Vercel refuses Secret type for NEXT_PUBLIC_). Preview unset -> embargoed. No redeploy triggered.
- [2026-09-24] R1 step 5: PR #41 squash-merged (1e66bdc). CI main GREEN (run 35990058107), Vercel prod success. Prod checks: /fr/2021-2026, /ar/2021-2026, /sitemap.xml, /fr, /ar all 200; 16 detail links on FR list; sitemap has 32 archive detail URLs; AR detail page renders real data (status, baseline/latest/target, sources, archive links). ARCHIVE LIVE.
- [2026-09-24] Rule 9: v1.0 recording .recordings/v1.0-2026-09-24.webm (R5 fixture build, archive on, 1.5 MB).
- [2026-09-24] Search Console: URL-prefix property https://wa3d-ma.vercel.app/ added; HTML-file verification (public/googleb5242999b23fa791.html, excluded from prettier). Verify + sitemap submit after this PR deploys.
- [2026-09-24] CI PR #42 (recording + Search Console file + logs): GREEN. Merge blocked by auto-mode permission (merge without review): waiting for user.
- [2026-09-24] Wayback retry: 4 of 6 now archived (HCP a3816, a4059, a3890; maroc.ma dessalement), each snapshot opened and cited figure found. PR #43 (data/archive-links-4). Still missing: 2 cg.gov.ma (save endpoint 500).
- [2026-09-24] PR #42 merged by user (11:25Z); verification file live. Search Console: https://wa3d-ma.vercel.app/ ownership verified (HTML file). R1 step 6: sitemap.xml submitted; initial status "Couldn't fetch" (new property; sitemap checked: 200 application/xml, 36 URLs on host, robots Allow + Sitemap line). Recheck in 24-48 h. R1 COMPLETE.
- [2026-09-24] CI PR #43 (4 archive links) GREEN after update-branch. Waiting for user merge.
- [2026-09-24] PR #43 merged by user (11:34Z). main CI GREEN; prod shows new archive link (croissance-quatre-pourcent). VERIFY/SHIP: validate 0 errors, 275/275, CI green on #41 #42 #43 + main.

### [2026-09-26] PLAN (approved)
- 1 Wayback retry 2 cg.gov.ma URLs; 2 Search Console sitemap + Pages (G5); 3 correction form prefill check (no submit); 4 log, logs PR, push, CI.

### [2026-09-26] EXECUTE: post-launch checks
- Wayback retry (2 cg.gov.ma URLs): Save Page Now 520, origin 200, still no snapshot. Unchanged: 19/21 archived.
- Search Console: /sitemap.xml status Success, last read 2026-09-26, 36 pages discovered (the 2026-09-24 "Couldn't fetch" is resolved; no resubmit).
- Search Console Page indexing: "Processing data" (property 2 days old), no G5 baseline yet.
- Correction form: live link on /fr/2021-2026/generalisation-amo (FR + AR hrefs checked) opens correction.yml with title, commitment, page prefilled and label correction. Not submitted. Closes the pending user manual check.

### [2026-09-26] VERIFY
- No code/data change. npm test: 23 files, 275 tests pass; coverage 99.82 stmts / 96.78 branch / 100 funcs / 100 lines. Security: logs-only diff, no secrets.

### [2026-09-26] MILESTONE
- Post-launch checks done. Logs PR chore/logs-2026-09-26.
