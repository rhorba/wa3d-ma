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

### [2026-09-22] DECISION — Sprint 3 BRAINSTORM (user choices): I find the Oct 2021 programme (official FR+AR, archived); pilot ~15 flagship commitments across 9 themes, then grow; I draft entries + evidence, user verifies (4.4); mandate end stays placeholder 2026-09-23 until the next government is appointed (later data PR).

### [2026-09-22] DECISION — Sprint 3 pilot approved by user: 16 commitments from the official AR programme (cg.gov.ma PDF, 86 p.): p.24 ten flagship (#1-#10), p.50 AMO, Madkhoul al-Karama, family allowances, RSU, family medicine/hospital networks, p.68 Awrach 250,000 jobs, p.79 water. Housing: no commitment in the programme (theme stays empty). Quotes: AR original, FR wa3d_translation (no official FR version found).

### [2026-09-22] DECISION — Mandate-end commitments show their latest official status at launch (e.g. En cours with the latest official figures); they are settled (Réalisé / Partiellement / Non réalisé) only when official full-period data is published; V-14 flags them monthly until then (user choice).

### [2026-09-22] DECISION — Launch timing: user asked to "launch now"; after the embargo (ADR-3/SEC-8, election 2026-09-23) and missing 4.4 verification were laid out, user chose: launch on 2026-09-24 after their worksheet check. Embargo kept.

### [2026-09-23] DECISION — Batch C BRAINSTORM: 🔴 C (user choice): AR bidi isolation of source titles + citation, FR guillemet no-break, Story 2.8 mandate range shown LTR 2021-2026 on AR pages. User asks Claude to re-check and sign off .verification/.
- [2026-09-24] BRAINSTORM: user chose "go live today" (R1 now; 6 unarchived sources keep live URLs, retry later).
- [2026-09-24] Search Console verification = HTML file in public/ (no code, no env var; meta-tag or DNS not possible/needed on vercel.app). Keep the file permanently.

### [2026-09-26] DECISION
- Approach: Claude drives Chrome (user session) for Search Console + correction form; Wayback retry from shell.

### [2026-10-02] DECISION — BRAINSTORM (user choices): (1) keep the 2026-09-23 placeholder until the full cabinet is appointed by dahir, then one data PR; (2) monthly review: 403 from official domains goes to a separate "blocked, check by hand" list (unit-tested); (3) end-of-mandate verdicts for the 14 overdue commitments start after the end date is set; close #47 with a note.

### [2026-10-04] DECISION — Session scope: batch checks 1-3 (GSC G5 baseline, Wayback retry cg.gov.ma x2, cabinet/2026-2031 programme watch). BRAINSTORM: single option (read-only checks); any data change goes to its own PLAN gate.

### [2026-10-04] DECISION — Indexing: option B (keep ADR-10; home hreflang alternates point to the mandate page; Request indexing on /fr|ar/2021-2026). Fallback: if still not indexed ~2026-10-14, 308 home -> mandate (option A).

### [2026-10-04] DECISION — Wayback: stop retrying the 2 cg.gov.ma URLs; accept local SHA-256 copies as provenance (programme PDF 9401e0c0...143280 already in the 2026-09-22 verification report; node/10717 to be captured).

### [2026-10-06] DECISION — Brand assets: option B (favicon set + static per-locale OG image), mark = "و" (Noto Naskh, ink #1B1B18 on paper #F7F5F0). Chosen by user. Rationale: no favicon/preview card today; share previews matter for a civic site; per-commitment dynamic cards deferred (YAGNI, no share traffic yet).

### [2026-10-06] DECISION — CVE-2026-93749 fix: option A (lockfile-only `pnpm update source-map-js` to 1.2.2, branch fix/source-map-js-cve), chosen by user. Plan: update -> verify (lint/types/tests/coverage/build/trivy-equivalent audit) -> PR -> CI green -> merge -> rebase #52.

### [2026-10-06] DECISION — CVE-2026-93749: option A (wait for the 7-day release-age window; bump source-map-js to 1.2.2 after 2026-10-07 14:08 UTC on fix/source-map-js-cve). Security scans job stays red until then; no merges. Risk accepted: build-time-only DoS on our own CSS source maps. Brand assets proceed on their branch meanwhile.

### [2026-10-14] DECISION
- Session order A -> B -> C: GSC indexing recheck, news check, logs PR. No code planned; PLAN = checks only.

### [2026-10-16] DECISION — Cabinet appointed 2026-10-16 (El Mansouri, oath at Royal Palace). BRAINSTORM: user chose B = (A) end-date data PR: 14 placeholder deadlines 2026-09-23 -> 2026-10-16 with official source, then (B) end-of-mandate verdicts batch per commitment (settle only where official full-period data exists; rest stay V-14 flagged). R4 programme takes priority if published.

### [2026-10-16] DECISION — Batch 2 verdict policy (user): Q1 wait (AMO, protection sociale, préscolaire stay En cours until CdC 2025-2026 / rentrée 2026 data); Q2 allocations = partial; Q3 eau = partial (CdC end-2024 data); Q4 default: entry dated on the day of the finding, the note cites the source and its date; Q5 Gini/pauvreté/PISA wait, yearly review.

### [2026-10-16] DECISION — Q1/Q3 alignment (user chose b): AMO, protection sociale and eau all settled now as partial on Cour des comptes RA 2024-2025 (end-2024 data). Préscolaire (maroc.ma source) keeps waiting for rentrée 2026 figure.

### [2026-10-16] DECISION — Vercel missed prod deploy for #59: user chose C (wait; next merge to main deploys it). Verify prod shows 16/10/2026 after the verdicts PR merges.

### [2026-10-17] DECISION — User approved AR notes for the 4 entries and the split (PR 1 = 4 verdicts now; PR 2 = GST, amazighe, Awrach when official sources are found).

### [2026-10-17] DECISION — PR 2 scope: user chose C (ship GST entry now; amazighe + Awrach stay En cours until an official source is reachable; yearly review). GST AR note shipped on user go-ahead.

### [2026-10-19] DECISION — Awrach (user): A park; stays En cours with V-14 warning, yearly review (ministry performance report / CdC). R4 prep (user): Q1 batch 1 = ~15 flagship commitments; Q2 deadline placeholder 2031-10-16 until next government; Q3 if only an official FR text exists: FR original, AR wa3d_translation.

### [2026-10-20] DECISION — User chose C: logs PR + R4 prep worksheet (press placeholders, nothing on main until official text) + GSC Page indexing recheck today.

### [2026-10-20] DECISION — R4 prep (user): list of 15 approved; deadline 2031-10-16 placeholder for all (explicit years kept in target text); yearly targets #6 #7 #9 = one entry on the full mandate + note "cible annuelle".

### [2026-10-20] DECISION — G5 (user chose A): keep target 33/36 sitemap URLs indexed (>= 90%), move date from 2026-10-24 to 2026-11-21 (pace ~+1/day, Google-side). No code change; next recheck ~2026-10-28.

### [2026-10-21] DECISION — R4 fallback (user, option C): if the official 2026-2031 programme text is not published by 2026-10-22 14:00 UTC, R4 is logged once as missed; the 72 h clock restarts at official-text publication (not the 2026-10-19 speech). No press wording in data/ (FR-5); /{fr,ar}/2026-2031 stay noindex (ADR-10). Checks twice daily (~08:00 and ~18:00 UTC): cg.gov.ma, chambredesrepresentants.ma ProgrammeGouv19102026, chambredesconseillers.ma, sgg.gov.ma.

### [2026-10-21] DECISION — vite GHSA-698v-4r3x-3vcv: declare vite ^8.3.4 as a direct devDependency (peer of vitest) instead of a pnpm override; the override only rewrote the peer range and Dependabot (direct-only) could not update it. PR #65.
### [2026-10-22] DECISION — User chose B: logs PR + pre-match R4 worksheet against the third-party full-text PDF (jarida-tarbawiya.com -> Google Drive). PDF kept in .verification/ only, labelled unofficial; nothing in data/ until official publication (FR-5).

### [2026-10-24] DECISION — Session scope B: housekeeping (#67 rebase) + R4 official-text check. User picked B.

### [2026-10-24] DECISION — R4 clock start = PG-2026-2031.pdf last-modified 2026-10-23 11:04 UTC (node/13059 has no own date; earliest official evidence). Deadline 2026-10-26 11:04 UTC.

### [2026-10-24] DECISION — R4 batch 1 vs official text (user): #4 -> neet-moins-50-pourcent (p.70/92); #6 -> apprentissage-150-200-mille (p.93, yearly note kept); #7 -> premiere-experience-500000-jeunes (~500 000 over 5 years, no yearly note); #1 wording "gradual minimum monthly support"; #12 -> 52% installed electrical capacity by 2030. Language: official text AR only -> AR original, FR wa3d_translation. Batch stays 15; deadline 2031-10-16 for all.

### [2026-10-25] DECISION — Session scope C: batch-2 commitments (2026-2031) + dev-only deps advisories (@vitest/mocker, ip-address) + archive retry for PG-2026-2031.pdf (Wayback first; second archive only with user-approved V-7 rule change).

### [2026-10-25] DECISION — Archive: user tries SPN from own browser, else wait (retry weekly), V-7 unchanged. Page bug: separate fix PR first (+6 on 15 batch-1 origin.page, curation guide states page = PDF index). Batch 2: all 5 approved (1M jobs, unemployment 7%, women activity 21.2%, learnings x2, 26M tourists).
