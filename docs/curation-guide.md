# Curation Guide: Wa3d.ma (وعد)
**References**: PRD §5.3 (statuses) · ADR-1/2/3 · Database v1.2 (schema, V-1…V-17) · Security SEC-3/SEC-8 · **Owner**: Curator · **Date**: 2026-09-21

> The one rule behind all the others: **the same rules for any coalition.** Quote the promise exactly,
> state facts without adjectives, cite an official source for every status, and let the dates decide.
> `pnpm catalogue:validate` enforces most of this guide; the rest is your judgement, written down here
> so it is applied the same way every time.

## 1. Where things live
| What | Where | Rule |
|---|---|---|
| A commitment | `data/promises/<mandate>/<id>.json` | File name = `id` (V-2). One file per commitment. |
| An indicator (numbers behind a progress bar) | `data/indicators/<id>.json` | Values in date order (V-12). |
| Official domains | `data/official-domains.json` | Only these can back a claim (V-7). |
| Banned judgement words | `data/banned-words.json` | FR + AR, checked in notes and titles (V-10). |

Every change goes through a pull request. Git history is the public audit trail: never rewrite it.

## 2. Adding a commitment
1. **Pick the id**: kebab-case, taken from the promise's own words, 60 characters max (e.g. `creation-un-million-emplois`). **An id is permanent**: it is a URL that journalists cite. Never rename or reuse one (V-3). A withdrawn commitment gets an `abandoned` evidence entry and stays.
2. **Quote it verbatim** in `quote.fr.text` and `quote.ar.text`, with « » in French and «» in Arabic. Copy it; do not retype or summarise it.
3. **Mark the provenance** of each language (V-4: exactly one `original`):
   - `original`: the programme's own text.
   - `official_translation`: a translation published by the government.
   - `wa3d_translation`: our translation, shown with the label "traduction Wa3d" / "ترجمة وعد". Use it only when no official translation exists.
4. **Origin**: the programme document, its URL and the **page** (`origin.page`). If the programme exists only as a speech, the official transcript is the origin.
5. **Title** (≤ 90 characters): a neutral label reusing the quote's own words. It states the promise, never a judgement.
   - ✅ "Création d'un million d'emplois nets"
   - ❌ "Le million d'emplois promis", "L'emploi, grand chantier du gouvernement"
6. **Theme**: one of employment, social protection, health, education, economy, governance, housing, water & energy, other.
7. **Deadline**: the date the programme gives. If none is given, use the **mandate end** (2021-2026: the day the next government is appointed; confirm it during curation, the current placeholder is 2026-09-23).
8. **Target** (only if the promise has a number): the indicator, the baseline value, year and **source**, the target value and the direction (`increase`/`decrease`, V-11). **Never invent a target** for a promise without a number (FR-7): it stays editorial, with a status only.

## 3. Evidence entries and statuses
Each entry is a dated official fact: `date` (the date of the act or publication, not the day you found it), `status`, a factual `note` in FR and AR, and an official `source`.
The current status is always the **latest** entry (ADR-2). You never edit a status: you add an entry. Entries are strictly in date order, never two on the same day (V-5).

| Status | Use it when (always with an official source) | Allowed |
|---|---|---|
| Non engagé `not_started` | No official act found toward the commitment | before the deadline |
| En cours `in_progress` | An official act exists (bill tabled, decree, budget line, programme launched) | before the deadline |
| Réalisé `achieved` | The target is met, or the promised act is adopted and in force | any time |
| Partiellement réalisé `partial` | Deadline passed; part of the target met or part of the act adopted | on or after the deadline |
| Non réalisé `not_achieved` | Deadline passed; no official source shows it met or adopted | on or after the deadline |
| Abandonné `abandoned` | An official statement or act withdraws or replaces the commitment | any time |

The "Allowed" column is enforced (V-9): "Non réalisé" can never appear before a deadline. When a deadline passes with the status still "Non engagé" or "En cours", the validator warns (V-14): add the entry that settles it.

## 4. Writing notes (neutrality)
- State **what happened, who published it and when**. No adjectives, no verdicts, no speculation.
  - ✅ « Le HCP publie un solde de 620 000 emplois nets créés entre 2021 et 2025. »
  - ❌ « Un bilan décevant », « Le gouvernement a tenu parole », « Enfin ! »
- Numbers carry their unit and period. Ministers and parties appear only as authors of an official act.
- The banned-word list (V-10) catches the obvious cases in both languages; it is a safety net, not a licence. If a note needs an adjective to make sense, it is not a fact yet.
- Write the Arabic note yourself or have it reviewed: never a machine translation without review.

## 5. Sources
- **Official only** for anything that backs a claim: origin, evidence, baseline and indicator values must be on `data/official-domains.json` (V-7). Adding a domain is a PR of its own, with the reason.
- **Press** may appear only in `pointers` (max 3), as "Presse, pour information", next to an official source. It never backs a status.
- **Archive every source**: save it on the Wayback Machine (web.archive.org/save) and put the copy in `archiveUrl` (only web.archive.org is accepted). Government pages move; the archive keeps citations alive for five years.
- `accessed` = the day you checked the source; `published` = the date printed on the document, if any.
- cg.gov.ma deep pages refuse automated requests: download the PDF manually, never scrape.

### Indicator values
- **World Bank series** (internationally reported figures): list them in `data/world-bank-series.json` (`id`, `series` code, FR/AR `name`, `unit`, `decimals`, first year `from`), then run `pnpm fetch:indicators`. It writes `data/indicators/<id>.json` with the World Bank page as source, the dataset's update date as `published` and today as `accessed`, then validates everything. Re-run it to refresh; review the diff before committing.
- **HCP, Bank Al-Maghrib, ministries**: enter the values by hand in `data/indicators/<id>.json`, one value per year (or `Q1`-`Q4`, `M01`-`M12`), each with the exact publication as `source` and its archive copy.
- Prefer the **national official figure** when the promise is about it (e.g. HCP unemployment, not the World Bank's modelled ILO estimate): the target must be measured with the series the programme itself refers to.

## 6. Re-verification and freshness
- Re-check every commitment at least every **45 days** (PRD G3). When nothing changed, update only `lastVerified`: do **not** add an evidence entry for "no change".
- `lastVerified` can never be older than the latest evidence entry (V-8) or later than today (V-6).
- The monthly review issue (opened on the 1st by CI) lists stale commitments and unreachable links. Work through it, one PR per batch.

## 7. Before opening a pull request
```sh
pnpm catalogue:validate        # 0 errors required; read the warnings
pnpm catalogue:freshness       # what needs re-checking
pnpm catalogue:links           # optional: unreachable sources (warnings)
```
- One theme or one batch per PR, with the list of sources in the description.
- CI must be green. The real-data smoke test runs on data PRs.
- **You** approve data PRs: every status and quote is checked against its source before merge.

## 8. The 2021-2026 archive (embargo, ADR-3)
- Curate on the **local-only** branch `data/2021-2026`. **Do not push it before 2026-09-24**: every pushed branch of a public repo is public (Security §7). The validator blocks 2021-2026 files on any pushed ref before that date (V-16).
- After curation: `pnpm catalogue:worksheet --mandate 2021-2026` writes `.verification/worksheet-2021-2026-<date>.md` (git-ignored: never commit it before the embargo lifts), one checkbox per quote, target, baseline, evidence entry and indicator value, each next to its source → check every line against its source, note any difference under it → corrections, then a fresh worksheet → your written sign-off (logged) → push and PR on or after 2026-09-24 → runbook R1 (DevOps §8).

## 9. Handling correction issues
Correction reports arrive as GitHub issues ("Correction" form, public).
1. Check the official source the reporter gives. No official source → thank them and explain the sourcing rule (link to Méthodologie).
2. If the report is right: fix it in a PR that references the issue. If a published status was wrong, add a dated entry explaining the correction rather than silently rewriting history (Security §8).
3. Reply with the same tone as the notes: factual, no argument. Lock or limit interactions if a thread turns abusive.

## 10. Quick checklist per commitment
- [ ] id permanent, kebab-case, from the promise's words
- [ ] quote verbatim in FR and AR, exactly one `original`
- [ ] origin document with URL and page, archived
- [ ] neutral title ≤ 90 characters
- [ ] deadline from the programme (or the mandate end)
- [ ] target only if the promise has a number; baseline sourced
- [ ] every evidence entry: dated, official source, archived, factual FR + AR note
- [ ] status consistent with the deadline (table in §3)
- [ ] `lastVerified` = today
- [ ] `pnpm catalogue:validate`: 0 errors
