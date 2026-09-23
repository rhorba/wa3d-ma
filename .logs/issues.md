# Issue Log
<!-- Tracks bugs, errors, blockers with status -->
<!-- Format: ### [YYYY-MM-DD HH:MM] BUG/BLOCKER/ERROR — Title -->


### [2026-09-21] ERROR — CI red on main: security job cache post-step
- Status: RESOLVED in #3 (9d92f78); main green. Not a security finding.

### [2026-09-21] ERROR — CI red on main after #16: next/font/google fetch failed during build
- "An error occurred in next/font: Cannot read properties of null". Build depended on Google Fonts at build time: violates SDR-4/NFR-5 (build never touches the network). Fix: commit OFL font files, next/font/local. RESOLVED in #17 (883671e); main green 7/7.

### [2026-09-22] ISSUE — Story 3.3: perf below 0.95 locally (FR 0.93-0.94, AR 0.88-0.89); fonts on FCP path. Font preloads disabled (preload:false). User chose: subset + trim fonts.

### [2026-09-22] ISSUE — Story 3.5 first production deploy (dpl_5behGwsLFtcvZf77pBPVau53y1gB, 6eb0bf2): single-segment unknown URLs (/nope, /favicon.ico) answered 500 on Vercel (X-Matched-Path /500), 404 locally. Cause: [locale] lacked dynamicParams=false, so Vercel rendered unknown locales on demand. Fix PR: dynamicParams=false on [locale] layout + e2e for /nope, /favicon.ico, /en (116/116).

### [2026-09-22] ISSUE — Sprint 2 design check: with display optional and no preload, first visits rendered system fonts (prod /ar cold on a fast link, /fr cold on 4G); designed faces only from cache. User chose per-locale preload + optional.

### [2026-09-22] ISSUE — real-data-smoke CI job (DevOps §3, needed by runbook R1) was never implemented; added to Sprint 3 Batch A.

### [2026-09-22] ISSUE — Rebase of #37: a failed regex conflict fix did not stop the command chain, so a package.json with conflict markers was pushed to the PR branch (never main). Fixed within minutes by amend + force-push. Lesson: resolve conflicts with the Edit tool and run multi-step shell with set -e.

### [2026-09-22] ISSUE — Wayback Machine cannot fetch cg.gov.ma (save returns 523; likely bot/geo block). Programme PDF kept locally in .sources/ with SHA-256 9401e0c0359f5f786f43540ad9e23909411bcab0eff2502601e967dcbc143280 (downloaded 2026-09-22, 3 492 634 bytes, created 2022-10-06). Entries on cg.gov.ma carry no archiveUrl for now (worksheet flags them); retry later.

### [2026-09-22] ISSUE — Wayback save failed for all 14 non-cg sources (13 x HTTP 500, 1 x 429), incl. maroc.ma: anonymous SPN refused from this connection. archiveUrl left empty (optional; worksheet flags). Options: user saves via browser (list in .sources/archive-todo.txt) or one slow retry before launch.

### [2026-09-23] ISSUE — AR pages: French source titles and the citation URL are not bidi-isolated
- detail AR: source title parentheses and citation URL looked scrambled (see corrections.md: misdiagnosis). Mandate reads "2026-2021" (Story 2.8, open). Fix in components with <bdi>/dir=ltr, fixture tests.
### [2026-09-23] ISSUE — FR: guillemets with a normal space can wrap alone on a list row; the data files use « x » with normal spaces.
