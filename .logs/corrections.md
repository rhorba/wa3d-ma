# Corrections & Plan Changes
<!-- Tracks scope changes, pivots, plan adjustments -->
<!-- Format: ### [YYYY-MM-DD HH:MM] SCOPE_CHANGE/PIVOT/REPLAN — Title -->


### [2026-09-21] SCOPE_CHANGE — DB schema v1.1: target.baseline.source
- Found by Brief critic: baseline number had no source (FR-6). Added Source to baseline + V-7 coverage. Needs user re-approval.

### [2026-09-23] CORRECTION — AR "scrambled source title / citation URL" was a misdiagnosis
- Before/after crops: both lines follow correct RTL wrapping (the French name's end, then "، ص. 50"; the date right of the URL). Only real defects: mandate range "2026-2021" (AL + ES + AN bidi rule) and FR guillemets wrapping. <bdi> on source names + citation URL kept as a free safeguard; PR says so.
