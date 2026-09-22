# PRD: Wa3d.ma (وعد) — Government Promise Tracker
**Version**: 1.1 | **Date**: 2026-09-21 | **Author**: PM | **Status**: Approved (2026-09-21)

> Source: `HANDOFF.md` (scoping session, 2026-09-18) + kickoff answers logged in `.logs/communications.md`.

## 1. Problem Statement
Moroccans have no independent, durable way to check what the government promised against what it did. The only tracker is the government's own self-reported "suivi du programme gouvernemental" on cg.gov.ma, and the press publishes one-off bilans that go stale. Wa3d.ma tracks the commitments of the government formed after the 23 Sept 2026 legislative elections across its 5-year mandate. Every status is tied to a verbatim quote and an official source.

## 2. Goals & Success Metrics
| Goal | Metric | Target |
|---|---|---|
| G1 Trustworthy: every claim is checkable | % of evidence entries with an official source URL (CI-enforced) | 100% |
| G2 Neutral: no editorialising | Evidence notes containing banned judgement words (CI lint list, FR+AR) | 0 |
| G3 Fresh: nothing silently goes stale | % of commitments with "Dernière vérification" ≤ 45 days old | ≥ 90% |
| G4 Timely: new mandate tracked fast | Time from programme presented to Parliament → 2026-2031 catalogue live | ≤ 72 h |
| G5 Findable: civic/SEO reach | Commitment detail pages indexed (Google Search Console) | ≥ 90% of published pages within 30 days of launch |
| G6 Accessible to all readers | Lighthouse Accessibility + Performance on list & detail, FR and AR | ≥ 95 each |

*No revenue goal: the project is civic, SEO and reputation.*

## 3. Users & User Stories
**Personas**: *Citizen* (mobile, FR or AR, arrives from search or social media) · *Journalist/researcher* (needs the source and a citable, stable link) · *Student/NGO* (needs the full picture by theme).

- [ ] US-1: As a citizen, I want to see all commitments of the current government filtered by theme and status, so that I can see at a glance where things stand.
- [ ] US-2: As a citizen, I want to read the exact words of a commitment in French or Arabic, so that I judge the promise itself and not someone's summary of it.
- [ ] US-3: As a journalist, I want each commitment's origin (programme document + page) and every evidence entry's official source, so that I can verify and cite it.
- [ ] US-4: As a researcher, I want a progress bar from baseline to latest official value to target for measurable commitments, so that I can see the distance travelled and what remains.
- [ ] US-5: As any reader, I want to see when each commitment was last verified, so that I know how current the information is.
- [ ] US-6: As an Arabic reader, I want the whole site in Arabic with correct right-to-left layout, so that I am not a second-class user.
- [ ] US-7: As a researcher, I want to switch between the 2026-2031 mandate and the 2021-2026 archive, so that I can compare what governments achieved.
- [ ] US-8: As a journalist, I want a stable URL per commitment that never changes, so that my citations do not break.
- [ ] US-9: As any reader, I want to understand how statuses are decided and sourced, so that I can trust or challenge the method.

## 4. Scope
### In Scope (MVP)
- **List page**: all commitments of a mandate, with filters by theme and status kept in URL params, counts per status, and a mandate switcher.
- **Detail page per commitment**: verbatim quote (FR + AR), origin link (document + page), theme, target and deadline, current status, progress bar (metric-bound only), evidence timeline, "Dernière vérification" date.
- **Méthodologie page**: status definitions (§5.3), sourcing rules, neutrality rules, translation policy, and how to report an error (link to open a GitHub issue on the public repo).
- **Languages**: FR (primary, default) and AR (full RTL).
- **Mandates**: `2021-2026` archive (hidden until the embargo lifts, see FR-9) and `2026-2031` primary (ingested after the programme is presented to Parliament, ~Oct 2026).
- **Catalogue as code**: one JSON file per commitment, validated in CI; git history is the public audit trail.
- **Metric data**: HCP / BAM / World Bank values fetched at curation time and committed as JSON. No live API calls at runtime.

### Out of Scope
- Party comparison, manifesto comparator, pre-vote scorecard, voting advice.
- Citizen ratings, comments, submissions forms, accounts, auth, admin UI, CMS, database.
- Per-MP or per-minister tracking; subjective grades or scores; an overall "% of promises kept" headline score (it would imply commitments are of equal weight).
- English UI (deferred; HANDOFF lists EN as optional).
- OG share images per commitment (later sprint); newsletter; analytics beyond Search Console.

## 5. Requirements
### 5.1 Functional
- **FR-1** Each commitment has a stable kebab-case `id`, unique across all mandates, which is never renamed or reused. Its URL is `/{locale}/{mandate}/{id}`.
- **FR-2** The quote is stored verbatim in both FR and AR. The source-language text is exact. If no official translation exists, our own translation is shown labelled "traduction Wa3d" / "ترجمة وعد" with a link to the source-language original.
- **FR-3** Every commitment has an origin: the programme document's name, URL and page number (or a speech transcript URL if no document exists).
- **FR-4** Current status = the status of the latest-dated evidence entry. It is never stored separately. A commitment with no evidence is `not_started`.
- **FR-5** Every evidence entry has a date, a status, an FR + AR note and an **official** source (see §5.3). Press links are allowed only as a secondary pointer next to an official source.
- **FR-6** Metric-bound commitments show baseline → latest official value → target, with the source and date of each number. The live indicator never changes the status (ADR-2).
- **FR-7** Editorial commitments (no quantified target) show a status only. A target is never invented.
- **FR-8** Missing data displays "Données indisponibles" / "البيانات غير متوفرة", never a blank or zero.
- **FR-9** Archive embargo: when `NEXT_PUBLIC_ARCHIVE_ENABLED` is not `true`, `2021-2026` pages return 404, are left out of the sitemap, and are absent from the mandate switcher.
- **FR-10** List filters (theme, status) live in the URL, so a filtered view can be shared.
- **FR-11** CI rejects the catalogue if: an id is duplicated, FR or AR text is missing, an evidence entry has no source URL, evidence dates are not ascending, an `indicatorId` is unknown, or a note uses a banned judgement word.
- **FR-12** A sitemap and per-page metadata (title, description, canonical, `hreflang` FR/AR) are generated from `NEXT_PUBLIC_SITE_URL`.

### 5.2 Non-Functional
- **NFR-1 Performance**: static pages, LCP < 2.0 s on mid-range mobile over 4G, JS ≤ 130 KB gzipped on the list page, of which the filters island ≤ 15 KB (budget revised 2026-09-21: the Next.js + React runtime alone is ~102 KB). Self-hosted fonts are subset and not preloaded (Story 3.3).
- **NFR-2 Security**: no user input, no secrets, strict security headers (CSP, HSTS). Details in the Security doc.
- **NFR-3 Accessibility**: WCAG 2.2 AA in both FR and AR. Status is never conveyed by colour alone.
- **NFR-4 Neutrality**: identical rules for any coalition. Party names appear only as the programme's author.
- **NFR-5 Durability**: the site must remain buildable and correct for 5+ years with minimal maintenance. It has no runtime dependencies on external APIs.
- **NFR-6 Quality**: ≥ 80% combined unit + integration coverage; E2E tests in FR and AR.

### 5.3 Status definitions (the core of neutrality)
| Status | FR label | Applies when (all require an official source) |
|---|---|---|
| `not_started` | Non engagé | No official act found toward the commitment. |
| `in_progress` | En cours | An official act exists (bill tabled, decree, budget line, programme launched) and the deadline has not passed. |
| `achieved` | Réalisé | An official source shows the target met, or the act promised adopted and in force. |
| `partial` | Partiellement réalisé | Deadline passed; an official source shows part of the target met or part of the act adopted. |
| `not_achieved` | Non réalisé | Deadline passed; no official source shows the target met or the act adopted. |
| `abandoned` | Abandonné | An official statement or act withdraws or replaces the commitment. |

**Official sources**: Bulletin Officiel, cg.gov.ma, ministries, HCP, Bank Al-Maghrib, Cour des comptes, Parliament (chambredesrepresentants.ma / chambredesconseillers.ma), Loi de finances, World Bank / IMF for internationally reported indicators.

## 6. Constraints & Assumptions
- **Budget ≈ 0**: Vercel Hobby plan, public GitHub repo, no paid APIs.
- **Solo curator** (the user). All data changes go through PRs; the 2021-2026 dataset is ⛔ verified by the user before merge.
- **Domain**: not owned yet; run on `https://wa3d-ma.vercel.app` until then. All absolute URLs come from `NEXT_PUBLIC_SITE_URL`.
- cg.gov.ma deep pages return HTTP 401 to automated requests, so curation is manual and scraping is never a dependency.
- *Assumption*: the 2026-2031 programme is presented to Parliament around Oct 2026 as a PDF or a speech transcript.
- *Assumption*: the Oct 2021 programme PDF is still reachable at a stable URL (to confirm during dataset curation, and archive a copy if not).

## 7. Risks
| Risk | P | I | Mitigation |
|---|---|---|---|
| Perceived as partisan | M | H | Verbatim quotes, adjective-free notes (CI lint), official sources only, embargo, same rules for any coalition, public Méthodologie page |
| Programme published late or only as a speech | M | M | The sprint starts on publication; a speech transcript counts as origin |
| cg.gov.ma blocks automated requests (401) | H | L | Manual curation, stable PDF URLs, no scraper |
| Vague commitments with no target | H | M | Editorial status only; a target is never invented |
| Evidence stale over 5 years | H | M | "Dernière vérification" shown; monthly review checklist; G3 metric |
| Archive misses 24 Sept (🔴 docs chosen) | H | L | The embargo is only a floor, so the archive can go live any day after it |
| `wa3d.ma` domain taken by someone else | M | M | Buy early; single env var for the URL swap |
| Wrong or unfair status published | M | H | PR review, source link on every entry, GitHub-issue correction route, git history shows every change |

## 8. Timeline
| Milestone | Target Date |
|---|---|
| PRD approved | 2026-09-18 |
| All 10 foundation docs approved + pushed | ~2026-09-21 |
| Sprint 1 (engine + 2021-2026 dataset) start | after the docs push |
| 2021-2026 archive public (embargo lifted) | ≥ 2026-09-24, after user dataset verification |
| 2026-2031 catalogue live | ≤ 72 h after the programme is presented to Parliament (~Oct 2026) |

## 9. Resolved Questions (2026-09-21)
1. **Status definitions (§5.3)**: kept as drafted. `partial` and `not_achieved` apply the same way to metric and editorial commitments.
2. **Méthodologie page**: kept in MVP scope.
3. **Translation provenance (FR-2)**: allowed when labelled "traduction Wa3d" / "ترجمة وعد" and linked to the original.
4. **Correction contact**: no email. The site links to "open an issue" on the public GitHub repo (`NEXT_PUBLIC_REPO_URL`). Accepted trade-off: reporting needs a GitHub account.

## PRD Validation Checklist
- [x] Problem clearly stated
- [x] Success metrics are measurable
- [x] Scope has explicit out-of-scope items
- [x] User stories follow As a / I want / So that
- [x] Requirements are testable
- [x] Risks identified with mitigations
