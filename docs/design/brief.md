# Design Brief: Wa3d.ma (وعد) mockups

**What it is**: Wa3d.ma is an independent, non-partisan website that tracks whether the Moroccan government keeps the commitments in its official programme. It covers two mandates (2021-2026 as an archive, 2026-2031 as the current mandate) and is fully bilingual in French and Arabic (right-to-left).

**Who it is for**: (1) citizens on mid-range Android phones arriving from a WhatsApp or Google link, who want to know "did they do it?" in under 30 seconds; (2) journalists who must verify a status and cite it with an official source and a stable link; (3) students and NGOs browsing by theme.

**Screens under review** (all data is fictitious): list page for a mandate (mobile + desktop), detail page for one commitment (FR mobile, FR desktop, AR mobile).

**Non-negotiable requirements**
1. **Neutrality**: it must look equally fair to any coalition. No party colours, no red/green good/bad framing, no overall "% of promises kept" score or ranking, no emotive wording.
2. **List page**: mandate name and period; counts per status for all six statuses (Non engagé, En cours, Réalisé, Partiellement réalisé, Non réalisé, Abandonné) in that fixed order and with equal visual weight; theme + status filters with a visible active state, a reset action and a result count ("5 engagements affichés sur 48"); one row per commitment with theme, title, status, a progress indicator only for commitments with a numeric target, and a "Vérifié le" date.
3. **Detail page**, in this order: title; current status with a link explaining the status; deadline; last-verified date; the **verbatim quote** of the promise with its source document and page; for numeric targets, a progress bar showing baseline → latest official value → target, **each number with its year and source**; an evidence timeline (newest first) where every entry has a date, a status, a factual note and an **official source** link, with press links visibly secondary; a "cite this" block; a "report an error" link noting that it is public and needs a GitHub account; a way back to the list.
4. **Status is never conveyed by colour alone**: each status has a distinct shape plus a text label.
5. **Arabic page**: correctly mirrored RTL layout (breadcrumb, icons, progress bar direction, arrows), Arabic typography that is comfortable to read, and dates/numbers that don't scramble. When the quote is a translation, it is labelled "ترجمة وعد" and the original is reachable.
6. **Global**: header with wordmark, mandate switcher, Méthodologie link and language toggle; footer with a neutrality statement, Méthodologie, report-an-error and source-code links, and the site's last update date.
7. **Accessibility**: WCAG 2.2 AA contrast, tap targets ≥ 44 px, legible at 14 px minimum.

**What "done" looks like**: a reader can tell in one glance what was promised, where it stands and how we know. The page feels like a trustworthy public record (something you could print and file), not an app, a campaign or a news site.
