# Activity Log
<!-- Tracks completed tasks, milestones, and deliverables -->
<!-- Format: ### [YYYY-MM-DD HH:MM] COMPLETED/MILESTONE — Title -->

### [2026-09-18] PLAN — Foundation docs (🔴), awaiting confirmation
- B1 PRD · B2 System Design, Architecture · B3 Security, Database · B4 UX, UI (+ design loop) · B5 Test Strategy, DevOps, Stories · B6 .env.example, commit, GitHub repo, push. Each doc = own approval gate.

### [2026-09-18] COMPLETED — Task 1.1 PRD draft
- docs/prd-wa3d-ma.md v1.0 Draft: 9 user stories, FR-1..12, NFR-1..6, status definitions, 4 open questions. Awaiting user approval (gate).


### [2026-09-21] COMPLETED — PRD v1.1 approved by user

### [2026-09-21] COMPLETED — Task 2.1 System Design draft
- docs/system-design-wa3d-ma.md v1.0 Draft: SSG only, client filter island, build-time embargo flag, committed indicator snapshots, Vercel Hobby + Cloudflare Pages fallback, build-time freshness report. Awaiting approval (gate).

### [2026-09-21] COMPLETED — System Design v1.0 approved by user

### [2026-09-21] COMPLETED — Task 2.2 Architecture draft
- docs/architecture-wa3d-ma.md v1.0 Draft: 10 ADRs, layered lib/ (pure domain + load.ts), single client island, routes table, fitness functions. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Architecture v1.0 approved by user

### [2026-09-21] COMPLETED — Task 3.1 Security Baseline draft
- docs/security-wa3d-ma.md v1.0 Draft: STRIDE, SEC-1..9 (headers, CSP unsafe-inline decision, official-domain allowlist, supply chain, repo settings, noreply email, embargo check). Found ADR-3 flaw: pushed branches are public. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Security Baseline v1.0 approved; ADR-3 amended (local-only data branch)

### [2026-09-21] COMPLETED — Task 3.2 Database Design draft
- docs/database-wa3d-ma.md v1.0 Draft: zod schema (Commitment/Evidence/Source/Indicator), V-1..V-16 rules (V-9 enforces status defs vs deadline), in-memory lookups, schemaVersion migrations. Open: title field, Source.accessed rename, 2021-2026 mandate end date TBC. Awaiting approval (gate).

### [2026-09-21] COMPLETED — Database Design v1.0 approved by user

### [2026-09-21] COMPLETED — Task 4.1 UX Foundation draft
- docs/ux-wa3d-ma.md v1.0 Draft: 3 personas, IA (4-item nav), 5 flows, lo-fi wireframes (list, detail, empty mandate, 404, méthodologie), states, 11 interaction rules (counts not scores, programme order, Western digits in AR, no-JS fallback). Awaiting approval (gate).

### [2026-09-21] COMPLETED — UX Foundation v1.0 approved by user

### [2026-09-21] MILESTONE — Task 4.2 UI draft + design loop round 1 started
- docs/ui-wa3d-ma.md (aesthetic "the public record": ink/paper/sepia, Plex Sans + Source Serif 4 / Plex Arabic + Noto Naskh, ink-only status shapes). Mockups docs/design/mockups (list FR, detail FR/AR), renders shots/r1, brief docs/design/brief.md. 3 fresh-context critics (sonnet) launched.

### [2026-09-21] MILESTONE — Design loop round 1 complete (3/3 FAIL)
- Brief: 4 findings, System: 1, Craft: 9. Accepted 8 fixes (desktop reset, sourced baseline/target, press labelled secondary, cite block open, counts restructured, tick removed, help link demoted, mobile active tag). Rejected: Craft 2 (conflicts neutrality), 3 (not in render), 7-9 (RTL already correct, verified by zoomed crops). Round 2 launched.

### [2026-09-21] MILESTONE — Design loop round 2 complete (Brief PASS, Craft PASS, System FAIL)
- Fixed: AR breadcrumb glyph (bidi-mirrored ‹ → ›), target year, footer gap, desktop facets as ruled list, bar/label proximity; System: cite box off white surface, secondary-link variant documented in UI §3. Rejected again: AR fill/rail claims (verified by crop; System critic pixel-confirmed mirroring correct). Round 3 launched on shots/r3.

### [2026-09-21] COMPLETED — Design loop closed after round 3 (Brief PASS, System PASS, Craft FAIL: false positive + taste)
- Final fixes: status-line flex, per-number source lines, regular-weight mobile filter buttons. Renders shots/final. UI doc §7 logs all rounds, accepted/rejected findings, residual risks (AR copy review, unrendered screens, critics misread RTL on downscaled renders). Awaiting user approval of UI v1.0 + DB v1.1.

### [2026-09-21] COMPLETED — UI Foundation v1.0 + Database v1.1 approved by user

### [2026-09-21] COMPLETED — Task 5.1 Test Strategy draft
- docs/test-strategy-wa3d-ma.md v1.0 Draft: risk table (status/validator/allowlist/embargo = Maximum), pyramid + 80% gate + 100% branches on status/progress/validate, decision tables + V-9 boundaries + Casablanca-timezone "today", property tests, Gherkin for US-1..9, adversarial URL/Unicode table, release gates, e2e:record. Proposes V-17 (bidi/zero-width chars). Awaiting approval (gate).

### [2026-09-21] COMPLETED — Test Strategy v1.0 approved; DB v1.2 (V-17) approved

### [2026-09-21] COMPLETED — Task 5.2 DevOps Foundation draft
- docs/devops-wa3d-ma.md v1.0 Draft: local/preview/prod, 8 CI jobs (quality, catalogue, test, security, e2e+route check, embargo-smoke, lighthouse, real-data-smoke), monthly-review workflow, dependabot, repo hardening checklist, runbooks R1-R5. New env WA3D_DATA_DIR (CI-only). Branch master→main rename needed. Awaiting approval (gate).

### [2026-09-21] COMPLETED — DevOps Foundation v1.0 approved (env values confirmed)

### [2026-09-21] COMPLETED — Task 5.3 Stories draft
- docs/stories-wa3d-ma.md v1.0 Draft: 6 epics, 31 stories (max L; dataset split 4.3a-c), Gherkin per story, 4 sprints (engine ~4d, pages+CI ~4.5d, dataset+launch ~5d, 2026-2031 triggered), traceability FR/NFR/US. Archive realistic go-live early Oct. Awaiting approval (gate), then .env.example + docs commit + push.
