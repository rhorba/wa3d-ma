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
