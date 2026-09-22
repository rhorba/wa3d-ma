# UI Foundation: Wa3d.ma (وعد)
**UX Reference**: docs/ux-wa3d-ma.md (v1.0, Approved)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: UI Designer | **Status**: Approved (2026-09-21)

## 1. Design Approach
- **Strategy**: Tailwind CSS 4 with the custom token layer below. **No component library**: the UI needs a native `<details>` disclosure, a `<dialog>` sheet, toggle chips and links, and nothing more (YAGNI, JS budget).
- **Named aesthetic, "the public record"**: an annotated official gazette. A serif carries the words that were *promised* (quotes); a sober sans carries the *facts* (statuses, dates, sources). Hairline rules instead of cards and shadows. Near-black ink on warm paper, **one** sepia accent reserved for links and focus. Status is expressed through **shape and words, never colour**. It should feel like a document you could print and file, not an app or a campaign.
- **Three references** (principles borrowed, none copied):
  - A. **Bulletin Officiel / legal gazette typesetting** → type pairing, numbered hairline rules, restraint.
  - B. **Archival paper and iron-gall ink** → palette: warm off-white, ink black, one sepia.
  - C. **GOV.UK Design System** → layout: content-first single column, plain language, generous tap targets, visible focus.
- **Neutrality constraint (non-negotiable)**: no colour may be read as a party colour or as a good/bad verdict. That rules out saturated blue (RNI), red (Istiqlal/USFP), green (MP, and "success"), orange, and purple. Status marks are all the same ink colour.

## 2. Design Tokens
```css
:root {
  /* Colour: ink, paper, sepia */
  --color-paper:       #F7F5F0;  /* page background */
  --color-surface:     #FFFFFF;  /* only the filter sheet and the quote block */
  --color-ink:         #1B1B18;  /* text, status marks, progress fill: 15.8:1 on paper */
  --color-ink-muted:   #5B5850;  /* metadata, captions: 6.5:1 on paper */
  --color-rule:        #D6D1C4;  /* hairlines, progress track (decorative, not text) */
  --color-rule-strong: #8C877A;  /* chip borders, input borders: 3.3:1 on paper (UI component contrast ≥ 3:1) */
  --color-accent:      #8A5A12;  /* sepia: links, focus ring, active chip: 5.4:1 on paper, 4.9:1 on wash */
  --color-accent-ink:  #6B450C;  /* link hover / visited: 7.8:1 */
  --color-accent-wash: #F1E8D8;  /* active chip background, current-status row tint */

  /* Typography */
  --font-sans:        "IBM Plex Sans", system-ui, sans-serif;            /* UI, facts */
  --font-serif:       "Source Serif 4", Georgia, serif;                  /* H1 + quotes only */
  --font-sans-ar:     "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif;
  --font-serif-ar:    "Noto Naskh Arabic", "Amiri", serif;               /* AR H1 + quotes */
  /* Scale: minor third (1.2), base 16px. AR adds +1 step for body and quotes (smaller x-height). */
  --text-sm:   0.875rem;  /* 14px: metadata, captions, chip labels (the minimum) */
  --text-base: 1rem;      /* 16px: body, card titles on mobile */
  --text-md:   1.1875rem; /* 19px: quotes, card titles ≥ 768px */
  --text-lg:   1.4375rem; /* 23px: section headings (H2) */
  --text-xl:   1.75rem;   /* 28px: H1 on mobile */
  --text-2xl:  2.125rem;  /* 34px: H1 ≥ 768px */
  --leading-body: 1.55;  --leading-ar: 1.75;  --leading-heading: 1.2;
  /* Weights in use: 400, 600 (sans); 400 italic not used; 600 (serif H1); Naskh 400 only (AR H1 + quotes; 700 dropped for NFR-1, 2026-09-22). Fonts subset by scripts/subset-fonts.sh, not preloaded, font-display optional (no swap shift; slow first visits may show system fonts). Figures: tabular (tnum) everywhere. */
  --tracking-label: 0.06em;  /* uppercase theme labels and section labels only */

  /* Spacing: 4px base; steps in use */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;

  /* Shape and elevation */
  --radius: 2px;                                   /* everything: chips, buttons, sheet corners */
  --rule: 1px solid var(--color-rule);
  --shadow-sheet: 0 -4px 16px rgba(27,27,24,.12);  /* the ONLY shadow: mobile filter sheet */

  /* Motion */
  --duration: 150ms; --easing: cubic-bezier(.2,0,0,1);
}
@media (prefers-reduced-motion: reduce) { :root { --duration: 0ms; } }
```
**Dark mode**: not in the MVP (YAGNI). The tokens are CSS variables, so adding it later means one override block.

### Status marks (one SVG family, 16/20 px, all `--color-ink`, always followed by the text label)
| Status | Mark | FR label | AR label |
|---|---|---|---|
| `not_started` | dashed ring | Non engagé | لم يُشرع فيه |
| `in_progress` | ring + inner chevron (points to reading direction, flips in RTL) | En cours | قيد التنفيذ |
| `achieved` | solid disc | Réalisé | منجز |
| `partial` | half-filled disc (fill on the reading-start side) | Partiellement réalisé | منجز جزئياً |
| `not_achieved` | ring + horizontal bar | Non réalisé | غير منجز |
| `abandoned` | ring + diagonal slash | Abandonné | متخلى عنه |

The shapes stay distinguishable in greyscale and for colour-blind readers. No mark is "red" or "green" and none is bigger than the others. The AR labels are drafts, to be checked in the copy review.

## 3. Component Inventory
| Component | Reuse existing | Build new | Notes |
|---|---|---|---|
| Site header | — | Yes | Logo wordmark "Wa3d.ma" + "وعد" (Naskh, muted), separated by a space, no dot; in AR the order flips, mandate menu (`<details>` + links, works without JS), Méthodologie, language link |
| Mandate menu | native `<details>` | Yes (styling) | Lists enabled mandates; empty ones labelled "publication attendue" |
| Status count row | — | Yes | 6 items in §5.3 order, each a stacked cell: count (`--text-lg`, 600) above mark + label; equal weight; 2 columns on mobile, 3 on tablet, 6 on desktop |
| Filter chips + sheet | native `<dialog>` | Yes | **The only client island.** Toggle chips `aria-pressed`, sheet on < 768px. On ≥ 1024px the facets are a **ruled vertical list** in the side column (hairline between items, active = `--color-accent-wash` + 3px sepia rule on the reading-start edge + ✓). A "N filtre(s) actif(s) · Réinitialiser" line sits above the facets; on mobile the active filters show as tags in the same active treatment. |
| Commitment row | — | Yes | *Not a card*: a ruled row (hairline above), theme label, title, status, optional mini progress, "Vérifié le". The whole row is one link. |
| Status badge | — | Yes | Mark + label at `--text-md`; the "Comment ce statut est-il défini ?" link sits on its own line below, at `--text-sm` |
| Progress bar | — | Yes | 8px track `--color-rule`, fill `--color-ink`, no end tick; labels baseline/latest/target, **each with its year and source link** (target: deadline year + programme page). Direction-aware: `decrease` fills toward a lower target, with a caption saying so. |
| Quote block | `<blockquote>` | Yes (styling) | Serif, 3px sepia rule on the reading-start edge, source line below, provenance tag |
| Evidence timeline | `<ol>` | Yes | Date (tabular) + status mark + note + "Source officielle ↗" + secondary pointers (muted, smaller) |
| Disclosure ("Citer", "Voir l'original") | native `<details>` | — | Styled summary. "Citer" is open by default; the citation sits in a box on paper with a `--rule` border (no white surface) |
| External link | `<a>` | — | **Primary** (official sources, navigation): `--color-accent`, solid 1px underline. **Secondary** (press pointers only): `--color-ink-muted`, dotted underline, prefixed "Presse, pour information :". Both use a ↗ suffix (↖ in RTL) + visually hidden "(nouvel onglet)". |
| Footer | — | Yes | Neutrality line, links, build date |

## 4. Responsive Breakpoints
| Breakpoint | Width | Layout notes |
|---|---|---|
| Mobile | < 768px | Single column, 16px gutters, filters in a bottom sheet, count row 2 columns |
| Tablet | 768–1023px | Single column, max 680px measure, filters inline above the list, count row 3 columns |
| Desktop | ≥ 1024px | List: 240px filter column + list column (max 760px). Detail: 680px reading column, timeline beneath. Count row 6 columns. Max content 1120px. |

## 5. Accessibility Baseline
- Colour contrast: all text ≥ 4.5:1 (tokens above list the ratios), UI component borders ≥ 3:1.
- Status is never colour-only: mark + text label always (NFR-3, UX rule 1).
- Focus: 2px `--color-accent` outline, 2px offset, on every interactive element, never removed.
- Semantic HTML first: `<nav>`, `<main>`, `<ol>` timeline, `<blockquote cite>`, `<details>`, `<dialog>`. ARIA only for `aria-pressed` chips and the `aria-live` result count.
- RTL: logical properties only (`margin-inline-start`, `border-inline-start`, `inset-inline`). Directional icons (chevrons, ↗, progress fill) mirror. Numbers and dates are wrapped in `<bdi>`.
- Minimum text size 14px. Tap targets ≥ 44×44px.
- Print: `@media print` hides header/filters/footer and shows each link's URL after it (the "file it" test).

## 6. Explicit Out-of-Bounds (enforced by the System critic)
1. No gradients anywhere.
2. No saturated blue, red, green, orange or purple anywhere. Nothing outside the tokens in §2.
3. No colour-coded statuses. All status marks are `--color-ink`.
4. No cards with shadows. Rows are separated by hairline rules. The only shadow is the mobile filter sheet.
5. No percentage "score" or "promises kept" headline anywhere.
6. No photos, illustrations, party logos or politicians' faces.
7. No emoji in the UI.
8. No Inter/Roboto. Serif is used only for H1 and quotes.
9. Radius is 2px everywhere, with no pills.
10. At most one accent colour on screen (sepia), and it's used only for links, focus and the active filter state.
11. Must mirror correctly in RTL and stay legible when printed in greyscale.

## 7. Design Loop Log
Mockups: `docs/design/mockups/` (list FR, detail FR, detail AR; all data fictitious) · brief: `docs/design/brief.md` · renders: `docs/design/mockups/shots/r1…r3`, `rfinal/` · render script: `node docs/design/mockups/render.mjs <round>`.
Critics: 3 fresh-context subagents per round (Brief / System / Craft), shown only the renders plus the brief or this document.

| Round | Brief | System | Craft | Accepted fixes | Rejected (why) |
|---|---|---|---|---|---|
| 1 | FAIL (4) | FAIL (1) | FAIL (9) | Desktop filter reset; every progress number sourced (→ DB v1.1 `baseline.source`); press links labelled secondary; "Citer" block open with text; count row restructured (count above mark + label); stray target tick removed; status help link on its own line; mobile active-filter tag = active chip treatment | Emphasise "Non réalisé" count (breaks neutrality); orphan "Autres" (not in render); AR quote marks, AR fill, AR rail (already correct, verified by zoomed crops) |
| 2 | PASS (2 minor) | FAIL (2) | PASS (5) | AR breadcrumb glyph (bidi-mirrored `‹` rendered as `›`); target shows its year; footer gap tightened; desktop facets as a ruled vertical list; bar/label proximity; citation box moved off white surface; secondary-link variant documented (§3) | AR fill/rail (again false: System critic pixel-confirmed mirroring) |
| 3 | PASS | PASS (2 minor) | FAIL (4) | Status line `display:flex` so the help link sits below on desktop; each progress source on its own line; mobile filter buttons at regular weight; wordmark spec aligned with the render | AR fill (false for the 3rd time, re-verified on the current build); boxed "ترجمة وعد" tag (provenance should stand out); active facet treatment (documented, accepted by System critic) |

**Closed after round 3** on diminishing returns: 2/3 critics passed, and the third's remaining findings were a repeated false positive plus taste calls already weighed.
**Residual risks**: (1) Arabic copy (status labels, UI strings) still needs a native-speaker copy review; (2) the filter sheet (mobile `<dialog>`), 404, Méthodologie and "publication attendue" screens were specified but not rendered, so the first build of each should be checked against this document; (3) critics consistently misread RTL direction on downscaled full-page renders, so future loops should give critics region crops for RTL checks.

## UI Validation Checklist
- [x] Design approach chosen (Tailwind + tokens, no component library, justified)
- [x] Tokens cover all UX wireframe screens
- [x] Component inventory complete
- [x] Responsive strategy for all breakpoints
- [x] Accessibility baseline confirmed
- [x] Design loop run: 3 rounds, closed on diminishing returns (see §7)
