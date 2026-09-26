# Session Log
<!-- Tracks session starts and ends for resumption -->
<!-- Format: ### [YYYY-MM-DD HH:MM] SESSION_START/SESSION_END -->

### [2026-09-18] SESSION_START
- New project. CTS installed from Desktop/CTS (bccc620) into skills/, CLAUDE.md + QUICKSTART.md at root, .logs initialised, git init.
- Context source: HANDOFF.md (scoping session, same day). Workflow: 🚀 New Project → foundation docs first.

### [2026-09-18] SESSION_END
- Completed: CTS installed (skills/, CLAUDE.md, QUICKSTART.md, .logs/, git init); UNDERSTAND (stack = da3m-ma, Vercel + GitHub rhorba/wa3d-ma, env-flag embargo, placeholder URL https://wa3d-ma.vercel.app); morocco2030 staged scoping edits discarded; BRAINSTORM → 🔴 COMPREHENSIVE (per-doc gates + design loop); PLAN confirmed (6 batches); Task 1.1 PRD drafted.
- In progress: docs/prd-wa3d-ma.md v1.0 Draft, awaiting user approval.
- Blocked on user: PRD §9 open questions: (1) status definitions, esp. partial vs not_achieved; (2) keep Méthodologie page?; (3) "traduction Wa3d" allowed?; (4) correction email address.
- Next: apply answers → mark PRD Approved → Batch 2: System Design (2.1), then Architecture (2.2). Nothing committed yet; no remote. Domain wa3d.ma not owned (consider buying).


### [2026-09-21] SESSION_START
- Resumed: PRD §9 answers collected via wizard, applied to PRD v1.1.

### [2026-09-21] SESSION_END
- Completed: PRD v1.1 answers + approval; System Design, Architecture (ADR-3 amended), Security, Database v1.2 (baseline.source, V-17), UX, UI (3-round design loop, mockups in docs/design), Test Strategy, DevOps, Stories — all approved. .env.example, .gitignore, public repo rhorba/wa3d-ma created, pushed.
- Next: Sprint 1 (engine): Story 0.1 scaffold → 1.1-1.9 → 3.1 CI → 4.1 curation guide. Each story: UNDERSTAND→…→SHIP per CLAUDE.md.
- User actions pending: 2FA on GitHub/Vercel; GitHub email privacy settings ("Keep my email private" + block pushes exposing email); Vercel import + env vars (Sprint 2, Story 3.5); confirm 2021-2026 mandate end date during curation.

### [2026-09-21] SESSION_START
- Resumed after foundation push (1ca0e7e). Starting Sprint 1 (engine).

### [2026-09-21] SESSION_END
- Completed: Sprint 1 (engine) end to end, 13 PRs merged, CI green, reference lists v1 approved, curation guide written.
- Open decisions for later: NFR-1 JS budget (Story 2.3/3.3); 2021-2026 mandate end date and 2026-2031 start date (curation).
- User actions still pending: 2FA on GitHub/Vercel; GitHub email privacy settings; Vercel import (Story 3.5).
- Next: Sprint 2 (pages + CI E2E/Lighthouse + repo hardening + first deploy), starting with UNDERSTAND/BRAINSTORM/PLAN.

### [2026-09-21] SESSION_START
- Resumed after Sprint 1 ship (103f2a3). Starting Sprint 2 (pages + CI + deploy).

### [2026-09-22] SESSION_END
- Completed (Sprint 2, Batches A-D): #15 layout/tokens/headers, #16 CI e2e + route check + embargo smoke, #17 self-hosted fonts (CI fix), #18 list, #19 filters island, #20-#21 commitment page, #22 home/404/méthodologie, #23 SEO. main 5b2c7f3 GREEN (7 jobs). E2E 110/110, embargo 10/10, unit 250, JS 103-105 kB (budget 130).
- Next (Batch E): 3.3 Lighthouse CI (+ update PRD NFR-1 to 130 KB / island 15 KB), 3.4 repo hardening (branch protection, squash-only, delete-on-merge, dependabot, private vuln reporting, SECURITY.md, correction.yml with field ids commitment/page, monthly-review workflow), 3.5 Vercel deploy. Then SHIP: full verify, coverage → metrics, design check vs mockups, recording .recordings/v0.2-<date>.webm, push, CI green.
- User actions pending: `! vercel login` at 3.5; optional `! gh auth refresh -h github.com -s user` to verify 2FA/email privacy; consider excluding .next and node_modules from OneDrive sync.
- Open questions: AR rendering of mandate ranges (bdi vs natural bidi) for Story 2.8; 2021-2026 end / 2026-2031 start dates during curation.

### [2026-09-22] SESSION_START
- Resumed at Sprint 2 Batch E (e2ecc2e). Story 3.3 Lighthouse CI: UNDERSTAND.

### [2026-09-22] SESSION_END
- Completed: Sprint 2 Batch E + SHIP. 3.3 Lighthouse CI (#25), 3.4 repo hardening + settings (#26, #29), 3.5 Vercel project + first deploy (via user browser) with /nope 500 fix (#30, #31), dev-dep alerts (#32), per-locale font preload after design check (#33), recording v0.2 + e2e:record (this PR).
- Production: https://wa3d-ma.vercel.app (archive dark). main protected: PR + 8 green checks, strict.
- Next: Epic 4 (2021-2026 dataset, local branch data/2021-2026) and runbook R1 embargo lift on/after 2026-09-24 with user sign-off; Story 2.8 (AR mandate range bidi); favicon with brand work.
- User actions pending: 2FA on GitHub/Vercel (unverified); confirm 2021-2026 end / 2026-2031 start dates during curation; one manual check that the correction form opens prefilled.

### [2026-09-22] SESSION_START
- Resumed after Sprint 2 ship (5a97e16). CI main GREEN + Vercel deploy success for 5a97e16. Starting Sprint 3 (Epic 4) UNDERSTAND.

### [2026-09-22] SESSION_END
- Completed: Sprint 3 Batch A (#35 fetch:indicators, #36 real-data-smoke now a required check, #37 catalogue:worksheet; Dependabot #27 merged after SHA check). Batch B: official AR programme found (cg.gov.ma, SHA-256 logged), 16-commitment pilot approved, drafted with official sources on LOCAL branch data/2021-2026 (4d3b6f9, c387985; never pushed), validate as of 2026-09-24: 0 errors, 14 V-14 (agreed). Verification pass by Claude at user request: 1 error fixed; report + worksheet in .verification/ (git-ignored).
- Decisions: FR quotes = traduction Wa3d; latest official status until full-period data; launch on 2026-09-24 after user check (embargo kept).
- Next (on/after 2026-09-24): user signs the report (or asks changes: #13 RSU verdict, §4 choices) -> runbook R1: build on real data, visual FR/AR check of the 16 pages, push data/2021-2026, PR, 9 green checks incl. real-data-smoke, flag true in Vercel, merge, prod checks, v1.0 recording, Search Console (user). Update mandate end date once the next government is appointed.
- Open: Wayback archives failed (cg.gov.ma 523; others 500/429), list in .sources/archive-todo.txt. User actions still pending: 2FA confirm, correction-form manual check.

### [2026-09-23] SESSION_START
- Resumed at Sprint 3 Batch C (go-live prep). Data branch rebased on origin/main 972a0e3 (still local only). Embargo lift R1 not before 2026-09-24 + user sign-off.

### [2026-09-23] SESSION_END
- Completed: go-live dry run (private build from a copy of data/, real-data crawl 200 + axe, visual FR/AR); Story 4.4 second verification pass + sign-off (Claude on the user's written instruction, not independent human verification); 15/21 sources archived on the local data branch (9af086c); #39 (AR mandate range LTR, Story 2.8; FR guillemets no-break; real-date catalogue test) merged 4145647, main GREEN, production checked (archive dark).
- Next (2026-09-24, data PR only): rebase data/2021-2026 on main, push, PR, 9 green checks incl. real-data-smoke; user sets NEXT_PUBLIC_ARCHIVE_ENABLED=true (Production) before merge; merge; prod checks; v1.0 recording; Search Console (user).
- Open: 6 sources without archive (.sources/archive-todo.txt); user: 2FA confirm, correction-form manual check; favicon with brand work; mandate end date once the next government is appointed.

### [2026-09-24] SESSION_START
- Resumed for go-live (runbook R1). data/2021-2026 is 3 commits ahead of origin/main 9098a02, 0 behind (no rebase needed). main CI GREEN.

### [2026-09-24] SESSION_END
- Completed: runbook R1 end to end. #41 dataset (16 commitments + 2 indicators) pushed, CI green, sign-off comment (Claude on user instruction), Vercel NEXT_PUBLIC_ARCHIVE_ENABLED=true (Config, Production only; Preview unset = embargoed), merged 1e66bdc, prod checks OK: ARCHIVE LIVE. #42 v1.0 recording + Search Console HTML verification file; property verified; sitemap submitted. #43 Wayback links for 4 more sources (19/21).
- Open: Search Console sitemap showed "Couldn't fetch" at submit (new property; sitemap valid): recheck on/after 2026-09-26. 2 cg.gov.ma sources without Wayback copy (.sources/archive-todo.txt). Monitor PRD G5 (>= 90% of pages indexed by 2026-10-24).
- Next: R4 2026-2031 ingestion within 72 h of the new programme; update 2021-2026 end date once the next government is appointed; favicon/brand work.
- Notes: merges need the user (auto-mode blocks gh pr merge). User actions still pending: 2FA confirm, correction-form manual check.

### [2026-09-26] SESSION_START
- Resumed after v1.0 go-live (47b5691). Checking main CI and open items (Search Console sitemap recheck due today).

### [2026-09-26] SESSION_END
- Completed: post-launch checks. GSC sitemap Success (36 pages); Page indexing still processing; correction form prefill verified in browser (user manual check closed); Wayback cg.gov.ma still 520 (19/21). Tests 275, coverage 99.82%.
- Next: recheck GSC Page indexing on/after 2026-10-01 and track G5 (>= 90% indexed by 2026-10-24); R4 2026-2031 ingestion within 72 h of the new programme; update 2021-2026 end date; favicon/brand work.
- User actions pending: 2FA confirm; merge the logs PR.
