# Decision Log
<!-- Tracks architecture decisions, approach selections, tool choices -->
<!-- Format: ### [YYYY-MM-DD HH:MM] ARCHITECTURE/APPROACH/TOOL — Title -->

### [2026-09-18] APPROACH — Foundation docs: BRAINSTORM presented
- 🟢 lean 10-doc chain, single review · 🟡 3 grouped review rounds · 🔴 per-doc gates + design loop. Recommended 🟢 (6 days to embargo lift).
- Awaiting user pick (gate).

### [2026-09-18] APPROACH — Foundation docs: 🔴 COMPREHENSIVE chosen
- Per-doc approval gate for all 10 docs + design-loop critic pass on UX/UI (rendered wireframes).
- Domain not owned yet → NEXT_PUBLIC_SITE_URL placeholder https://wa3d-ma.vercel.app until a domain is bought.


### [2026-09-21] APPROACH — PRD §9 open questions resolved
- Status defs kept as drafted · Méthodologie page kept · own translation allowed, labelled "traduction Wa3d" · corrections via GitHub issues (no email; new env NEXT_PUBLIC_REPO_URL). PRD → v1.1, awaiting final approval.

### [2026-09-21] ARCHITECTURE — Embargo: dataset on branch data/2021-2026 (SDR-3 option b)
- Merge only after user verification AND >= 2026-09-24. main carries engine + fictional fixtures.
### [2026-09-21] ARCHITECTURE — Data model additions proposed (ADR-9)
- quote.{fr,ar}.provenance (original|official_translation|wa3d_translation) + commitment.lastVerified. DBA to finalise.
### [2026-09-21] ARCHITECTURE — Home = newest published mandate (ADR-10); next-intl static, no middleware (ADR-5)

### [2026-09-21] SECURITY — CSP script-src unsafe-inline (SEC-D1)
- SSG forbids nonces; compensating controls: no input, text-only rendering, no 3rd-party scripts, connect-src self, form-action none.

### [2026-09-21] APPROACH — Sprint 1 delivery: 🔴 PR per story (user choice)
- 12 branches/PRs, each CI-gated and squash-merged. Options offered: 🟢 one PR, 🟡 PR per epic with CI first (recommended), 🔴 PR per story.

### [2026-09-21] SECURITY — archiveUrl restricted to web.archive.org (within V-7 / SEC-3 intent)
- Otherwise a "Copie archivée" link could point anywhere. Flagged to user.

### [2026-09-21] APPROACH — V-16 enforced only for the real catalogue (data/)
- Fixtures are fictional and include a 2021-2026 mandate; CI E2E builds them. CatalogueInput.enforceEmbargo=true only when dataDir is data/. Invalid-rule catalogues are generated in a temp dir by the integration test instead of committed invalid/<rule>/ folders (same coverage, cannot drift from the valid base).

### [2026-09-21] APPROACH — Reference lists v1 approved by user (Story 4.1)
- official-domains: v0 + anapec.org, cnss.ma, one.org.ma, ondh.ma, cese.ma. banned-words: v0 + FR décevant, encourageant, ambitieux, remarquable, insuffisant / AR مخيب، مشجع، طموح، ملحوظ، غير كاف, plus their feminine/plural forms (whole-word matching needs them; "غير كافية" slipped through in the test). Archives: web.archive.org only (confirmed).

### [2026-09-21] APPROACH — Sprint 2: 🔴 PR per story (user choice); NFR-1 budget = total <= 130 KB, island <= 15 KB (user choice)
- PRD NFR-1 to be updated in the Lighthouse story (3.3).

### [2026-09-21] AUDIT — setup for 3.4/3.5 (user asked to audit, "all permissions")
- OK: all commits noreply; secret scanning + push protection on. Unknown: 2FA + email privacy (gh token lacks user scope; user can run gh auth refresh -s user). To do in 3.4: dependabot security updates, private vuln reporting, branch protection, squash-only + delete branch on merge. Vercel CLI not logged in: user runs vercel login at 3.5.

### [2026-09-22] APPROACH — List markup grouped by theme, flattened by CSS when the island is active
- One DOM: theme sections (no-JS fallback, UX) become display:contents with row order = programme index once the filter island marks the list enhanced (2.3), giving the approved flat programme-order list. Themes ordered by first appearance in the programme.

### [2026-09-22] DECISION — Story 3.3 BRAINSTORM: 🔴 separate lighthouse job + island size script (user choice)

### [2026-09-22] DECISION — Story 3.3: fonts subset (scripts/subset-fonts.sh, ~-50% Arabic), not preloaded, wordmark-only Naskh face, AR H1 Naskh 700 -> 400 and 700 file dropped (user choice; UI §2 updated). Perf decided by CI numbers.

### [2026-09-22] DECISION — Story 3.3: font-display optional instead of swap (no layout shift; slow first visits may show system fonts) (user choice)

### [2026-09-22] DECISION — Story 3.4 BRAINSTORM: branch protection strict + up-to-date, admins included, 0 reviews (user choice)

### [2026-09-22] DECISION — Story 3.5 BRAINSTORM: Vercel project via dashboard import by user (user choice); PLAN shared: user imports + env vars, I verify URL/headers/embargo, docs via PR.

### [2026-09-22] DECISION — Fonts: plain @font-face from public/fonts (versioned .v1, Cache-Control immutable), React preload() per locale (FR 4 files ~55 KB, AR 6 files ~105 KB), display optional kept (user choice)
