# UX Foundation: Wa3d.ma (وعد)
**PRD Reference**: docs/prd-wa3d-ma.md (v1.1) · **Data**: docs/database-wa3d-ma.md (v1.0)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: UX Designer | **Status**: Approved (2026-09-21)

> UX stance: **a reference work, not a news feed.** Readers come to check one thing (a promise, a status, a source),
> so every page answers "what was promised, where does it stand, how do we know" in that order.
> No rankings, no overall score, no emotional framing. The design must look equally fair to any coalition.

## 1. User Personas (from PRD §3)
| Persona | Role | Goal | Pain point | Context |
|---|---|---|---|---|
| **Salma, citizen (primary)** | 20-45, arrives from a WhatsApp/Facebook link or a Google search | "Did they do the thing they promised?" in < 30 s | Bilans in the press contradict each other and look partisan | Mid-range Android, 4G, FR or AR, reads on the go |
| **Youssef, journalist** | Covers politics or the economy | Verify a status and cite it with a stable link and the official source | cg.gov.ma pages are hard to reach; sources are scattered | Desktop, often FR, copies links into articles |
| **Student / NGO (edge)** | Research or advocacy by theme | The full picture for one theme across a mandate | Has to rebuild the list from PDFs | Desktop, filters and compares mandates |

## 2. Information Architecture / Site Map
```
wa3d.ma
├── /fr  ·  /ar                         Home = list of the newest published mandate (ADR-10)
│   ├── /{mandate}                      List: all commitments of 2026-2031 or 2021-2026
│   │   └── /{mandate}/{id}             Detail: one commitment
│   ├── /methodologie                   How statuses are decided, sources, neutrality, translation, corrections
│   └── (404)
└── External: GitHub issue form (corrections) · official source documents
```
**Global navigation** (every page, 4 items, well under the ≤ 7 rule):
`Wa3d.ma` logo (home) · **Mandate switcher** · **Méthodologie** · **Language toggle** (`العربية` / `Français`, same page in the other locale).
**Footer**: one-line neutrality statement · Méthodologie · Signaler une erreur · Code source & historique (GitHub) · "Site mis à jour le {build date}".
Depth ≤ 3 levels (home → list → detail). The detail page has a breadcrumb: `Mandat 2021-2026 › Emploi › {title}`.

## 3. Core User Flows

### Flow 1: Check one promise from a shared link (Salma, US-2/US-4/US-5)
```
(WhatsApp link) → [Detail page, FR or AR]
   1. Title + status badge + "Dernière vérification" visible without scrolling (360×640)
   2. Verbatim quote (+ "Traduction Wa3d" label and "Voir le texte original" if applicable)
   3. Progress bar (metric) or "Engagement sans cible chiffrée" (editorial)
   4. Evidence timeline, newest first, each entry with its official source
   → <Wants more?> → breadcrumb "Emploi" → [List filtered by theme]
   → <Other language?> → toggle → same commitment in AR (RTL)
```
Error/edge paths: unknown or embargoed id → 404 with a link to the list · no evidence yet → "Aucun acte officiel relevé à ce jour" (status `not_started`) · indicator has no recent value → "Données indisponibles" with the last known value and year.

### Flow 2: Browse by theme and status (Student, US-1/US-7)
```
(Home or /{mandate}) → [List]
   1. Header: mandate name, period, counts per status (fixed order, text + icon)
   2. Filter chips: Thème (9) · Statut (6); multi-select within a group, AND across groups
   3. Results update instantly; "12 engagements affichés sur 48" (announced to screen readers)
   4. URL becomes /fr/2021-2026?theme=employment&status=partial → shareable (FR-10)
   → open a card → [Detail] → Back → list with the same filters (they are in the URL)
   → <Zero results?> → "Aucun engagement ne correspond à ces filtres" + [Réinitialiser les filtres]
   → <Switch mandate?> → switcher keeps the filters if they are valid for the other mandate
```
Without JavaScript: the list is grouped by theme with a jump-link index at the top, so it stays usable. The filter chips are hidden (they only work with JS).

### Flow 3: Verify and cite (Youssef, US-3/US-8)
```
[Detail] → "Source : Programme gouvernemental 2021-2026, p. 12" → opens the PDF at #page=12 (new tab)
         → each evidence entry → "Source officielle : Bulletin officiel n° …" (new tab) · "Copie archivée" if the link is dead
         → "Citer cet engagement" block (<details>, no JS): canonical URL + a ready citation line
             « Wa3d.ma, "Création d'un million d'emplois nets", statut au 22/09/2026, https://wa3d.ma/fr/2021-2026/creation-un-million-emplois »
```

### Flow 4: Report an error (US-9)
```
[Detail] → "Signaler une erreur sur cet engagement" (with the note: « Public, nécessite un compte GitHub »)
         → GitHub issue form, prefilled with the commitment id and URL (new tab)
[Méthodologie] → "Comment signaler une erreur" explains the process, that issues are public, and that corrections need an official source
```

### Flow 5: Understand the method (US-9)
```
[Any status badge] → link → [Méthodologie #statuts] (definition of that status, anchored)
[Méthodologie]: 1 Ce que nous suivons · 2 Les six statuts · 3 Sources acceptées · 4 Neutralité · 5 Traductions · 6 Signaler une erreur · 7 Historique des modifications (link to GitHub)
```

## 4. Key Screen Wireframes (lo-fi, mobile first 360 px; AR mirrors horizontally)
> All names, counts, figures and dates in the wireframes are **fictitious placeholders**, not data.

### Screen: List (`/fr/2021-2026`)
```
┌────────────────────────────────────┐
│ Wa3d.ma        Méthodologie  العربية│  header (sticky on scroll-up only)
│ [Mandat 2021-2026 ▾]               │  switcher (native <select> or menu)
├────────────────────────────────────┤
│ Gouvernement 2021-2026             │  H1
│ Programme présenté le {date}       │  origin link
│ 48 engagements suivis              │
│ ┌────────────────────────────────┐ │
│ │ ○ Non engagé 12  ▷ En cours 0   │ │  counts in the fixed §5.3 order,
│ │ ✓ Réalisé 9   ◐ Partiel 11      │ │  same size and weight each,
│ │ ✕ Non réalisé 14  ⊘ Abandonné 2 │ │  never a % or a score
│ └────────────────────────────────┘ │
│ Filtrer  [Thème ▾] [Statut ▾]      │  chips open a sheet (mobile)
│ Emploi · Santé ×   [Réinitialiser] │  active filters, removable
│ 12 engagements affichés sur 48     │  aria-live
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │  CARD (whole card is one link)
│ │ EMPLOI                          │ │  theme label
│ │ Création d'un million d'emplois │ │  title (neutral label)
│ │ nets                            │ │
│ │ ◐ Partiellement réalisé         │ │  status: icon + text
│ │ ▓▓▓▓▓▓░░░░ 62 % de la cible     │ │  metric only; "Sans cible chiffrée" otherwise
│ │ Vérifié le 12/09/2026           │ │
│ └────────────────────────────────┘ │
│ ┌──────── next card ─────────────┐ │
├────────────────────────────────────┤
│ footer                             │
└────────────────────────────────────┘
Desktop ≥ 1024 px: filters in a left column (right in AR), cards in 2 columns.
Card order: programme order (origin page, then id). Neutral: no "worst first" or "best first".
```

### Screen: Detail (`/fr/2021-2026/creation-un-million-emplois`)
```
┌────────────────────────────────────┐
│ header                             │
│ Mandat 2021-2026 › Emploi          │  breadcrumb
├────────────────────────────────────┤
│ Création d'un million d'emplois    │  H1
│ nets                               │
│ ◐ Partiellement réalisé  (?)       │  (?) → Méthodologie#partial
│ Échéance : 23/09/2026 (passée)     │
│ Dernière vérification : 12/09/2026 │
├────────────────────────────────────┤
│ CE QUI A ÉTÉ PROMIS                │
│ ┃ « …texte exact du programme… »   │  blockquote, verbatim
│ Source : Programme gouvernemental  │
│ 2021-2026, p. 12 ↗                 │
│ [Traduction Wa3d] Voir l'original ▸│  only if provenance = wa3d_translation
├────────────────────────────────────┤
│ OÙ EN EST-ON                       │  metric commitments only
│ 2021        2025          Cible    │
│ 0 ─────────▓▓▓▓▓▓▓▓──────── 1 000 000
│          620 000 (2025, HCP ↗)     │  every number: source + year
│ ou : « Engagement sans cible       │  editorial
│ chiffrée : seul le statut est suivi »
├────────────────────────────────────┤
│ CHRONOLOGIE (plus récent d'abord)  │
│ ● 14/03/2026  Partiellement réalisé│
│   Note factuelle, sans adjectif.   │
│   Source officielle : HCP ↗        │
│   Voir aussi : Le Matin ↗          │  pointers, visibly secondary
│ │                                  │
│ ● 02/02/2022  En cours             │
│   …                                │
├────────────────────────────────────┤
│ ▸ Citer cet engagement             │  <details>
│ Signaler une erreur ↗              │
│ (public, compte GitHub requis)     │
│ ← Tous les engagements Emploi      │
├────────────────────────────────────┤
│ footer                             │
└────────────────────────────────────┘
```

### Screen: Mandate not yet published (`/fr/2026-2031` before ingestion)
```
│ Gouvernement 2026-2031                                  │
│ Le programme gouvernemental n'a pas encore été présenté │
│ au Parlement. Les engagements seront publiés dans les   │
│ 72 h suivant sa présentation.                           │
│ [Consulter le mandat 2021-2026 →]  (only if enabled)    │
│ [Comment nous travaillons →]                            │
```

### Screen: 404
```
│ Page introuvable                                        │
│ Cet engagement n'existe pas ou n'est pas encore publié. │
│ [Voir tous les engagements →]  [Méthodologie]           │
```

### Screen: Méthodologie
A single long page with a sticky in-page table of contents (7 anchored sections). Each status gets its own anchor (`#statut-partial`) with the same icon + label as the badge, so the badge → definition link lands on the right place.

## 5. Screen States
Static pages have no loading or network-error states. Pages are either built or they 404.

| Screen | Empty | Partial data | Error / not found | Other |
|---|---|---|---|---|
| List | Mandate enabled, 0 commitments → "publication attendue" screen, `noindex` | — | Embargoed or unknown mandate → 404 | Filters with 0 results → message + reset · no JS → grouped-by-theme list, chips hidden |
| Detail | No evidence → status `not_started` + "Aucun acte officiel relevé à ce jour" | Indicator without a value after baseline → "Données indisponibles" + last known value and year (FR-8) | Unknown id → 404 | Deadline passed → "(passée)" · translation → label + original · dead source → "Copie archivée" link if present |
| Home | No enabled mandate has data → short explanation of the project + Méthodologie link | — | — | Canonical → mandate URL |
| Méthodologie | — | — | — | Anchors for each status |

## 6. Interaction & Content Rules (for UI and Frontend)
1. **Status is never colour alone**: every badge = icon + text label. The six icons are distinct shapes (NFR-3).
2. **Counts, not scores**: status counts in the fixed §5.3 order, equal visual weight. No percentage of "promises kept", no ranking, no red/green framing of good/bad.
3. **Programme order** for lists by default. There is no sort control in the MVP (YAGNI; a sort by status would invite "worst first" framing).
4. **Every number shows its source and year** in the same visual block (FR-6).
5. **Dates**: `dd/mm/yyyy` in FR. In AR the same format, and Western digits in both languages (usual in Moroccan Arabic press). Numbers and dates inside AR text are wrapped with `dir="ltr"` / `<bdi>` so they don't scramble.
6. **Filters**: chips as toggle buttons (`aria-pressed`). On mobile they open a bottom sheet with an "Appliquer" button. The result count sits in an `aria-live="polite"` region. The URL is updated with `history.replaceState` (no history spam).
7. **External links** open in a new tab, marked ↗, with visually hidden text "(nouvel onglet)".
8. **Language toggle** goes to the same page in the other locale, never to the home page.
9. **Mandate switcher** hides embargoed mandates and shows empty ones with the label "publication attendue".
10. **Tap targets** ≥ 44×44 px. There is a skip-link to the main content. Focus is always visible.
11. **Text length**: card titles ≤ 90 chars (schema). Long quotes are shown in full on the detail page, never truncated (verbatim rule).

## UX Validation Checklist
- [x] Personas match PRD target users (3, no extra depth)
- [x] All PRD user stories map to a flow (US-1/7 → F2 · US-2/4/5 → F1 · US-3/8 → F3 · US-6 → toggle + RTL rules · US-9 → F4/F5)
- [x] Wireframes cover the happy path + empty, partial, 404 and no-JS states
- [x] Navigation is 4 items, ≤ 3 levels, with a breadcrumb on detail pages
