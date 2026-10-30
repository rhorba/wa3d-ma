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

### [2026-09-26] OPEN: 2 cg.gov.ma sources without Wayback copy
- Save Page Now returns 520 for cg.gov.ma (3rd failure). Local SHA-256 of the programme PDF is logged. Options later: retry, or accept the SHA + local copy as provenance.

### [2026-10-02] ISSUE — Monthly review flags 7 cg.gov.ma links as 403 (false positive: runner IP blocked; origin 200 locally). Also 14 overdue in_progress commitments need end-of-mandate evidence/verdicts.

### [2026-10-02] ISSUE — CI red on #48: validate.test.ts hard-coded UTC+1 for 2026-09-21. Morocco moved to plain UTC on 2026-09-20 (IANA tzdata 2026c); runner Node 22.23.3 has it, local Node 22.23.1 (tz 2026a) does not. Fix: pre-switch date for the UTC+1 case + post-switch case gated on process.versions.tz >= 2026c. Code (Intl, Africa/Casablanca) was already correct.

### [2026-10-06] ISSUE (low) — GSC "Request indexing" returns Quota Exceeded on the first request of the day (2026-10-04 and 2026-10-06). Likely a reduced quota on a new property. Workaround: rely on sitemap (Success, 36 discovered) + internal links; retry manual requests at most once per day. Not a site bug.

### [2026-10-06] ISSUE (high, CI RED) — PR #52 (logs only) Security scans fail: Trivy SCA flags source-map-js 1.2.1 CVE-2026-93749 (HIGH, DoS via malformed indexed source maps), fixed in 1.2.2 (published 2026-09-30). Transitive prod dep: next 15.5.25 -> postcss 8.5.28 -> source-map-js ^1.2.1. New advisory, not caused by #52; main will fail too on next run. Brand work paused per rule 11.

### [2026-10-06] BLOCKER — option A blocked by our own supply-chain policy: .npmrc minimum-release-age=10080 (7 days); source-map-js 1.2.2 published 2026-09-30 14:08 UTC -> resolvable from 2026-10-07 14:08 UTC. `pnpm update` kept 1.2.1 and drifted unrelated deps (rolldown 1.2.8->1.2.11, oxc types); lockfile reverted, nothing committed.

### [2026-10-07] ISSUE — pnpm audit: new HIGH sharp <0.35.5 (GHSA-wq5f-xc86-pv6w, librsvg CVE-2026-96889) via next 15.5.25 (prod, optional dep). Fix 0.35.5 published 2026-09-27 (past release-age). basic-ftp 6.2.1 (dev, 2026-08-27) also installable now.

### [2026-10-16] ISSUE — Vercel production deploy not triggered for main c5b899d (#59) after 20+ min; no Vercel status on the commit; prod still shows 23/09/2026. Preview deploys work.

### [2026-10-17] ISSUE — PR 2 sources: finances.gov.ma unreachable from this machine (connection fails); cg.gov.ma refuses automated requests (guide §5). GST, amazighe and Awrach official sources need a manual download.

### [2026-10-17] ISSUE — A (manual source download): finances.gov.ma also fails to load in Chrome (user network); hcp.ma loads fine. Budget-execution reports (PLF 2026, loi de règlement 2024 n° 04.26) only hosted there. Paused, asked user.
### [2026-10-24] ISSUE — Wayback snapshot from user (web/20261024063233, URL with __cf_chl_rt_tk) = Cloudflare "Just a moment..." challenge page (id_ raw 403, 3720 B gzip HTML), not the PDF. Not usable as archiveUrl; origin.archiveUrl omitted (optional), follow-up. Local SHA-256 copy kept in .verification/sources/official/.

### [2026-10-25] ISSUE — Wayback SPN for cg.gov.ma PG-2026-2031.pdf returns 520; CDX empty. archiveUrl stays empty on 15 (soon 20) 2026-2031 entries. Awaiting user choice (wait / second archive + V-7 change / user-side SPN).

### [2026-10-25] BUG — 2026-2031 batch-1 origin.page = printed page number, but withPage() (lib/detail.ts:53) and worksheet link #page=N open PDF index N; printed = index - 6 in PG-2026-2031.pdf -> all 15 prod "open at page" links land 6 pages early. 2021-2026 uses PDF index (correct). Fix proposed: +6 on 15 entries; awaiting user decision.
### [2026-10-26] ISSUE — Awrach (2021-2026, deadline 2026-10-16 passed): no official final tally on V-7 domains; last evidence in_progress 2023-03-06. Decision needed: keep searching (chambredesrepresentants Q&A, ANAPEC) vs. not_achieved per guide §4 rule ("no official source shows it met").
### [2026-10-26] ISSUE — git stash -u failed mid-way (OneDrive lock on tests/unit/, Permission denied); working tree intact, duplicate stash dropped. Avoid stash -u on this repo; branch with uncommitted logs instead.
### [2026-10-26] ISSUE — #77 BEHIND main after #76 merge (strict checks + linear history); rebased via gh pr update-branch --rebase, CI re-running.

### [2026-10-30] ISSUE (process) — auto mode denies `gh pr merge` (Merge Without Review): user must merge PRs or add a Bash permission rule.
