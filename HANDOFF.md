# Wa3d.ma (وعد) — Session Handoff (2026-09-18)

> Written at the end of the scoping session. The next session installs the CTS framework from `Desktop/CTS`
> into this folder and turns this into the foundation docs. Nothing has been built yet.

## Decisions already made by the user
- **Idea F** from `Desktop/idea-pool-sept-2026.md`, and the first idea to pass its competitor + data-access check (2026-09-18).
- **Scope: post-election promise tracker.** It tracks the government that forms after the 23 Sept 2026 legislative elections, across its 5-year mandate. There is **no** manifesto comparator and **no** pre-vote scorecard.
- **Standalone project in this folder** under the CTS framework, *not* a feature inside `morocco2030`. This reverses the pool's "fold into morocco2030" note. `morocco2030` (github.com/rhorba/morocco2030) has reusable HCP/IMF/World Bank/BAM fetchers and FR/AR RTL patterns worth borrowing.
- ⚠️ `Desktop/morocco2030` still holds **uncommitted, staged** scoping edits from this session (CLAUDE.md, `.claude/.logs/*`, `.claude/sprint-backlog/sprint-6.md`). They duplicate this file. Discard them with `git restore --staged . && git checkout -- .` inside that folder.

## Probe findings
- No independent Moroccan promise tracker found in FR or AR searches. The only one is the government's self-reported "suivi du programme gouvernemental" on cg.gov.ma, whose deep pages return **HTTP 401** to automated requests (the homepage returns 200). The press only publishes one-off bilans (LesEco, Hespress, TelQuel, Maroc Hebdo, Challenge).
- The 2021 government programme had ~10 headline commitments: 1M jobs, women's activity >30%, 4% growth, generalised social protection, top-60 education ranking, among others. Actuals are available from HCP.
- 2026 manifestos for reference only (not in scope): PAM has 5 pacts and 20 engagements (350 bn DH), PJD 310 measures, UC 104 measures, and MP its "Contrat haraki".
- Money is roughly nil. It's a civic/SEO/reputation project.

## Draft scope (for the CTS docs)
- **Pages**: a list of commitments, filterable by theme and status, with a mandate switcher, plus a detail page per commitment. FR primary, AR with full RTL, EN optional.
- **Commitment card**: verbatim quote (FR + AR) with programme document + page, theme, target and deadline, status, and an evidence timeline showing the "Dernière vérification" date.
- **Metric-bound** commitments show a progress bar (baseline → latest official value → target) fed by HCP/BAM/World Bank. **Editorial** commitments get a status only, and never an invented target.
- **Mandates**: `2026-2031` (primary, ingested within 72h of the programme's presentation to Parliament, ~Oct 2026) and `2021-2026` (archive, **embargoed until 24 Sept 2026**).
- **Out of scope**: party comparison, voting advice, citizen ratings/comments, per-MP tracking, subjective grades, auth, admin UI.

## Draft data model
```ts
type Mandate = '2021-2026' | '2026-2031'
type CommitmentStatus = 'not_started' | 'in_progress' | 'achieved' | 'partial' | 'not_achieved' | 'abandoned'
type Source = { name: string; url: string; lastUpdated: string }
type Commitment = {
  id: string                                  // kebab-case, stable forever
  mandate: Mandate
  theme: 'employment' | 'social_protection' | 'health' | 'education' | 'economy'
       | 'governance' | 'housing' | 'water_energy' | 'other'
  quote: { fr: string; ar: string }           // verbatim
  origin: Source & { page?: number }
  target?: { indicatorId: string; baseline: { value: number; year: number }; value: number; direction: 'increase' | 'decrease' }
  deadline: string                            // ISO; mandate end if unspecified
  evidence: Array<{ date: string; status: CommitmentStatus; note: { fr: string; ar: string }; source: Source }>
}
// Current status = last evidence entry's status (never stored separately).
```

## Draft ADRs
1. **Catalogue as code**: one JSON file per commitment (`data/promises/<mandate>/<id>.json`), validated by a zod schema in CI. Updates go through PRs, and git history is the public audit trail. Rejected: DB + admin UI, headless CMS. Same pattern as Da3m.ma ADR-8.
2. **Status derived from evidence**: status comes from the last dated, sourced evidence entry. For metric commitments the live indicator drives only the progress bar, never the status.
3. **Post-election only + embargo**: nothing public before 24 Sept 2026, and the same rules apply to any coalition.

## Content rules
- Quote verbatim, never paraphrase into claims. Evidence notes state facts with no adjectives ("réussi", "échec", "trahie"). Party names appear only as the programme's author.
- Every status change needs an **official** source (BO, cg.gov.ma, ministry, HCP, BAM, Cour des comptes). Press is allowed only as a pointer to an official document.
- Missing data shows "Données indisponibles", and every number shows its source and date.

## Risks
| Risk | Mitigation |
|---|---|
| Perceived as partisan | Verbatim quotes, adjective-free evidence, official sources, embargo, same rules for any coalition |
| Programme published late or only as a speech | Sprint for 2026–2031 starts on publication; speech transcript counts as origin |
| cg.gov.ma blocks automated requests (401) | Manual curation, stable PDF URLs, no scraping dependency |
| Vague commitments with no target | Editorial status only; never invent targets |
| Evidence goes stale over 5 years | "Dernière vérification" date + monthly review checklist |

## Draft first build sprint
1. Types + zod schema + loader · 2. CI validator (unique ids, FR+AR present, every evidence has a source URL, dates ascending, indicatorId exists)
3. **2021–2026 dataset**, curated from the Oct 2021 programme → **STOP for user verification before merge**
4. List page (theme/status filters in URL params, counts, mandate switcher) · 5. Detail page (quote, origin link, progress bar, timeline)
6. FR/AR strings with neutral status labels · 7. Feature flag, off until 24 Sept · 8. Unit + page + E2E tests (FR and AR/RTL)
Later: 2026–2031 ingestion, OG share images per commitment.
