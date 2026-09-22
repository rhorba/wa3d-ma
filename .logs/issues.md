# Issue Log
<!-- Tracks bugs, errors, blockers with status -->
<!-- Format: ### [YYYY-MM-DD HH:MM] BUG/BLOCKER/ERROR — Title -->


### [2026-09-21] ERROR — CI red on main: security job cache post-step
- Status: RESOLVED in #3 (9d92f78); main green. Not a security finding.

### [2026-09-21] ERROR — CI red on main after #16: next/font/google fetch failed during build
- "An error occurred in next/font: Cannot read properties of null". Build depended on Google Fonts at build time: violates SDR-4/NFR-5 (build never touches the network). Fix: commit OFL font files, next/font/local. RESOLVED in #17 (883671e); main green 7/7.

### [2026-09-22] ISSUE — Story 3.3: perf below 0.95 locally (FR 0.93-0.94, AR 0.88-0.89); fonts on FCP path. Font preloads disabled (preload:false). User chose: subset + trim fonts.

### [2026-09-22] ISSUE — Story 3.5 first production deploy (dpl_5behGwsLFtcvZf77pBPVau53y1gB, 6eb0bf2): single-segment unknown URLs (/nope, /favicon.ico) answered 500 on Vercel (X-Matched-Path /500), 404 locally. Cause: [locale] lacked dynamicParams=false, so Vercel rendered unknown locales on demand. Fix PR: dynamicParams=false on [locale] layout + e2e for /nope, /favicon.ico, /en (116/116).
