# Project Metrics
<!-- KPI snapshots over time -->
<!-- Format: ### [YYYY-MM-DD HH:MM] SPRINT_SNAPSHOT/DAILY_SNAPSHOT — Title -->


### [2026-09-21] SPRINT_SNAPSHOT — Sprint 1 (engine) shipped
- Commit on main: 1b533db. Stories: 0.1, 1.1-1.9, 3.1, 4.1 (12/12) in PRs #1-#13 (+#3 CI fix).
- Tests: 218 (13 files, unit + integration) · E2E 6/6 (desktop + mobile).
- Coverage (unit + integration, rule 6): statements 100%, lines 100%, functions 100%, branches 97.32%. 100% thresholds held on status, progress, validate, rules/**.
- Security: pnpm audit clean; CI Semgrep/Trivy/Gitleaks green; fitness gate incl. hidden-character scan.
- CI: every PR and every main run green except one red main run after #2 (cache config), fixed in #3.
- Build: all routes static; shared First Load JS 102 kB (NFR-1 budget risk logged).

### [2026-09-22] STORY_SNAPSHOT — Story 3.3 Lighthouse (CI run 35717489558)
- Perf/a11y (3 runs, mobile): FR list 0.95-0.99, AR list 0.97-0.99, FR detail 0.98, AR detail 0.98; a11y 1.0 everywhere; CLS <= 0.043; LCP 1.6-2.4 s.
- JS: list page 104.9 KB gzip (budget 130), filters island 2.8 KB (budget 15).
- Coverage: statements 100%, branches 97.2% (255 tests).

### [2026-09-22] SPRINT_SNAPSHOT — Sprint 2 (pages + CI + deploy) shipped
- Stories: 2.1-2.7, 3.2-3.5 in PRs #15-#23, #25, #26, #30 (+ fixes #17, #32, #33; logs #24, #29, #31).
- Tests: 262 unit + integration (22 files) · E2E 116 (FR/AR, desktop + mobile, axe) · embargo 10.
- Coverage (rule 6): statements 100%, lines 100%, functions 100%, branches 97.22%.
- Performance (CI Lighthouse, mobile, median of 3): perf 0.95-0.99, a11y 1.0 on list + detail FR/AR; list JS 104.9 KB (budget 130), island 2.8 KB (15).
- Security: CI Semgrep/Trivy/Gitleaks green; Dependabot 3 fixed, 2 dismissed not_used (extract-zip, dev-only); branch protection strict on main.
- Production: https://wa3d-ma.vercel.app live (archive dark), fonts preloaded per locale, designed faces on cold first visits.
- CI: red runs this sprint: #16 fonts (fixed #17), #25 run 1 CLS, #26 run 1 dependabot cooldown; all fixed before merge.

## 2026-09-24 (Sprint 3 close, v1.0 go-live)
- Coverage: 99.82% lines (unit + integration 275/275), gate 80%.
- Dataset live: 16 commitments + 2 indicators (2021-2026), 0 validation errors, 14 V-14 (agreed). Sources archived: 19/21.
- CI: all green on #41, #42, #43 and main; no red runs this session.
- Recording: .recordings/v1.0-2026-09-24.webm.

### [2026-09-26] SPRINT_SNAPSHOT (post-launch checks)
- Tests 275/275, coverage 99.82% stmts (>= 80%). Sitemap: 36 URLs, GSC Success. Indexing: pending (GSC processing). Wayback: 19/21.

### [2026-10-02] SPRINT_SNAPSHOT — fix/links-blocked-official: tests 280 (+5), coverage 99.83% statements, 96.87% branches, 100% lines.

### [2026-10-02] METRIC — Vercel 30-day transfer 1.74 GB (limit 100 GB, alert 70 GB). GSC: sitemap 36 discovered; indexed count not yet available.

### [2026-10-04] METRIC — GSC Page indexing report still "Processing data" (day 10). URL Inspection sample: /fr indexed, /ar indexed (both outside the sitemap; declare canonical -> /{locale}/2021-2026 per ADR-10, Google kept the home); /fr/2021-2026 "Crawled - currently not indexed"; /fr/2021-2026/generalisation-amo "URL is unknown to Google". G5 baseline (sitemap URLs indexed) still unknown; sample suggests low.

### [2026-10-04] SPRINT_SNAPSHOT — fix/home-hreflang: tests 281, coverage 99.83% statements, 96.87% branches, 100% lines; e2e 120/120.

### [2026-10-05] METRIC — GSC Page indexing report still "Processing data" (day 11). Sitemap last read 2026-10-04, Success, 36 discovered. URL Inspection: /fr/2021-2026 and /ar/2021-2026 now INDEXED (yesterday: crawled-not-indexed / not checked) -> 308 fallback dropped. Commitment sample (FR): medecine-famille-reseaux-hospitaliers indexed; activite-femmes-trente-pourcent, emploi-million-postes, protection-sociale-globale "URL is unknown to Google". Sitemap indexed so far: >= 3/36 confirmed (target 33/36 by 2026-10-24).

### [2026-10-06] METRIC — GSC Page indexing still "Processing data" (day 12). activite-femmes-trente-pourcent still unknown to Google. Sitemap indexed: >= 3/36 confirmed (target 33/36 by 2026-10-24).

### [2026-10-06] SPRINT_SNAPSHOT — feature/brand-assets: tests 283, coverage 99.83% statements, 96.87% branches, 100% lines; e2e 122/122.
