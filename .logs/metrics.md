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
