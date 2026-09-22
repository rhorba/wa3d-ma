# Issue Log
<!-- Tracks bugs, errors, blockers with status -->
<!-- Format: ### [YYYY-MM-DD HH:MM] BUG/BLOCKER/ERROR — Title -->


### [2026-09-21] ERROR — CI red on main: security job cache post-step
- Status: RESOLVED in #3 (9d92f78); main green. Not a security finding.

### [2026-09-21] ERROR — CI red on main after #16: next/font/google fetch failed during build
- "An error occurred in next/font: Cannot read properties of null". Build depended on Google Fonts at build time: violates SDR-4/NFR-5 (build never touches the network). Fix: commit OFL font files, next/font/local. RESOLVED in #17 (883671e); main green 7/7.
