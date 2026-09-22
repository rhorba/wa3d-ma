# System Design: Wa3d.ma (وعد)
**PRD Reference**: docs/prd-wa3d-ma.md (v1.1, Approved)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: System Designer | **Status**: Approved (2026-09-21)

> The system has one runtime job: serve pre-rendered pages from a CDN. Everything that computes something
> (validation, status derivation, indicator values) happens at **curation time** or **build time**, never
> when a reader loads a page. That single choice covers NFR-1 (speed), NFR-2 (attack surface) and NFR-5 (5-year durability).

## 1. Non-Functional Requirements
| Attribute | Target | Notes |
|---|---|---|
| Availability | 99.9% best effort | Inherited from Vercel's CDN. Hobby has no contractual SLA, which is acceptable for a civic site with no transactions. |
| Latency (TTFB, p95) | < 200 ms from Morocco | Static HTML is served from the nearest edge (Paris/Madrid). |
| LCP | < 2.0 s, mid-range mobile on 4G | PRD NFR-1. Measured with Lighthouse in CI (see Test Strategy). |
| JS on list page | ≤ 130 KB gzipped (island ≤ 15 KB) | PRD NFR-1 (revised 2026-09-21). Only the filter UI hydrates. |
| Throughput | ~30 RPS peak (see §6) | Served by the CDN. Nothing at the origin scales with traffic. |
| Data volume | < 5 MB catalogue, ~1,200 pages | ~300 commitments × 2 mandates × 2 locales at the 5-year horizon. |
| Retention | Forever | Git history is the public audit trail (HANDOFF ADR-1). Nothing is deleted. |
| Recovery (RTO) | ≤ 1 h | Redeploy from git, or re-host the same build elsewhere (SDR-5). |
| Recovery (RPO) | 0 | Git is the only source of truth: GitHub remote + local clone. There is no runtime state to lose. |
| Freshness | ≥ 90% of commitments verified ≤ 45 days ago | PRD G3. Reported by a build-time check (SDR-6). |

## 2. Component Topology
```
 ── CURATION PATH (write, human, through a PR) ─────────────────────────────────
 [Curator] ──edit JSON──► data/promises/<mandate>/<id>.json
     │                    data/indicators/<indicatorId>.json
     │  pnpm fetch:indicators  (manual, run by the curator)
     │     ├─► World Bank API (JSON)
     │     └─► HCP / BAM: entered by hand, with source URL + date
     ▼
 [GitHub PR] ──► [GitHub Actions CI]
                   ├─ zod schema + catalogue rules (PRD FR-11)
                   ├─ banned judgement-word lint (FR + AR)
                   ├─ lint · typecheck · unit/integration tests · coverage ≥ 80%
                   └─ build + E2E (FR, AR/RTL)
     ▼ merge to main
 [Vercel build]  NEXT_PUBLIC_SITE_URL · NEXT_PUBLIC_ARCHIVE_ENABLED · NEXT_PUBLIC_REPO_URL
     └─ next build → static HTML for every locale × mandate × commitment + sitemap.xml
     ▼
 ── READ PATH (runtime, anonymous) ─────────────────────────────────────────────
 [Browser FR/AR] ──HTTPS──► [Vercel Edge CDN] ──► pre-rendered HTML + hashed JS/CSS
                              (security headers: CSP, HSTS, …)
                 ◄── no server functions, no DB, no third-party calls at runtime

 ── FEEDBACK PATH ──────────────────────────────────────────────────────────────
 [Reader] ──"Signaler une erreur"──► GitHub issue (template) ──► curator ──► PR
 [Google Search Console] ◄── sitemap.xml
```
Only the boxes above get built. There is no API gateway, load balancer, cache, queue or database: a static site has nothing for them to do.

## 3. Integration Patterns
| Integration | Pattern | When | Reason |
|---|---|---|---|
| World Bank Indicators API | REST GET via a script run by the curator → committed JSON | Curation time | Stable public API. Committing the snapshot means the build and runtime never depend on it (NFR-5). |
| HCP, Bank Al-Maghrib | Manual entry: value, date, source URL | Curation time | No stable machine API, and 401s like cg.gov.ma's are likely. Scraping is never a dependency (PRD §6). |
| cg.gov.ma, BO, Parliament, ministries | Links only (evidence `source.url`) | — | Never fetched. They are cited, not integrated. |
| GitHub Issues | Outbound link with a pre-filled issue template (`NEXT_PUBLIC_REPO_URL`) | Runtime (link only) | Correction route (PRD §9.4). No form, and we store no user input. |
| Vercel ← GitHub | Git integration: preview deploy per PR, production deploy on merge to `main` | Every push | Managed, zero configuration. |
| Google Search Console | Sitemap submission | After launch | PRD G5. |

## 4. Scalability Strategy
- **Scaling approach**: none needed. Pages are static files on a CDN, so read load never reaches an origin.
- **Cache strategy**: the CDN only. HTML is cached until the next deploy (each deploy invalidates it), and hashed assets are immutable. No Redis, no ISR.
- **Queue strategy**: none. Nothing is asynchronous at runtime.
- **Build scaling**: ~1,200 pages build in minutes. Re-evaluate only if builds approach Vercel's 45-minute limit, which is not expected at this catalogue size.

## 5. System Design Decision Records

### SDR-1: Fully static rendering (SSG), no server runtime
- **NFR Driver**: NFR-1 performance, NFR-2 attack surface, NFR-5 durability.
- **Options**: 🟢 SSG for every page · 🟡 ISR with revalidation · 🔴 SSR with live indicator fetches.
- **Decision**: 🟢. Every route is enumerated with `generateStaticParams` and `dynamicParams = false`, so an unknown id returns 404. No middleware, route handlers or server actions. `/` redirects to `/fr` through a static redirect rule, not middleware.
- **Alternatives**: ISR/SSR would add runtime failure modes and a server-side attack surface, and data only changes through PRs, which trigger a rebuild anyway.
- **Re-evaluate when**: content needs to change more often than a deploy is practical (not foreseen).

### SDR-2: List filters run client-side on a static page
- **NFR Driver**: FR-10 (filters in the URL), NFR-1 (JS ≤ 130 KB).
- **Options**: 🟢 one static list page per locale × mandate, with filtering in the browser from `?theme=&status=` · 🟡 pre-render every filter combination · 🔴 filter on the server per request.
- **Decision**: 🟢. The full list for one mandate (≤ ~300 short cards) is in the static HTML, so it works without JS and is indexable. A small client component reads the URL params, hides non-matching cards and updates the per-status counts. Shared filtered links work.
- **Alternatives**: 🟡 would mean themes × statuses × locales × mandates pages for little SEO value. 🔴 breaks SDR-1.
- **Re-evaluate when**: one mandate exceeds ~1,000 commitments, or the list page goes over its JS budget.

### SDR-3: Archive embargo is a build-time flag
- **NFR Driver**: FR-9, neutrality (HANDOFF ADR-3).
- **Decision**: `NEXT_PUBLIC_ARCHIVE_ENABLED` is read at build time. When it is not `true`, `2021-2026` is left out of `generateStaticParams`, the sitemap and the mandate switcher, so those URLs 404.
- **Trade-off**: flipping the flag requires a **redeploy**: change the env var in Vercel, then click "Redeploy". The DevOps runbook will document this.
- ⚠️ **Public repo caveat**: if the 2021-2026 JSON is on `main` in a public repo, anyone can read it on GitHub before 24 Sept, even though the site stays dark. Options: (a) accept it; (b) keep the dataset on a branch and merge it on or after 24 Sept; (c) keep the repo private until 24 Sept. **Recommendation: (b)**, because it also matches the "user verifies the dataset before merge" gate. The Architecture doc will record the final decision.
- **Re-evaluate when**: never. The flag becomes permanently `true` once the embargo lifts.

### SDR-4: Indicator values are committed snapshots
- **NFR Driver**: NFR-5 durability, FR-6 (source and date on every number).
- **Options**: 🟢 a script run by the curator writes `data/indicators/*.json` · 🟡 a scheduled GitHub Action opens a PR monthly · 🔴 runtime fetch.
- **Decision**: 🟢. Each value is stored with `{ value, year, source: { name, url, lastUpdated } }`. The build never touches the network.
- **Re-evaluate when**: manual refresh becomes a burden (more than ~20 metric commitments). Then upgrade to 🟡.

### SDR-5: Vercel Hobby hosting, kept portable
- **NFR Driver**: budget ≈ 0, RTO ≤ 1 h.
- **Decision**: Vercel Hobby (non-commercial use, which fits a civic project). The site stays portable because it uses no Vercel-only runtime features (SDR-1). Security headers are set in `next.config` `headers()`.
- **Trade-off / risk**: Hobby includes **100 GB/month** of transfer. At ~100 KB per page view that is ~1M page views per month: plenty normally, but repeated viral spikes could come close. **Fallback**: re-host the same build on Cloudflare Pages (unmetered bandwidth) and point DNS there. The fallback requires a domain of our own.
- **Re-evaluate when**: monthly transfer > 70 GB, or Vercel's terms change.

### SDR-6: Freshness and observability at build time, not runtime monitoring
- **NFR Driver**: G3 freshness, G5 findability.
- **Decision**: a build script reports commitments whose latest evidence is > 45 days old. It is a **warning** in CI and the PR summary, not a failure, so a stale entry never blocks an unrelated fix. At runtime we rely on Vercel deploy logs and Search Console only. Vercel Web Analytics stays off (PRD §4).
- **Alternatives**: uptime monitoring or APM would watch a CDN we don't operate. YAGNI.
- **Re-evaluate when**: a real outage goes unnoticed.

## 6. Capacity Estimate
```
Typical DAU:              2,000   (civic niche, search + social)
Pages per visit:          ~4
Viral-day DAU:            50,000  (programme presentation, bilan anniversaries)
Peak RPS (viral):         50,000 × 4 / 86,400 × 10 ≈ 23  → plan for ~30 RPS → trivial for a CDN
Transfer/month (typical): 2,000 × 4 × 100 KB × 30 ≈ 24 GB   (Hobby limit: 100 GB)
Transfer (one viral day): 50,000 × 4 × 100 KB     ≈ 20 GB   → 3+ viral days in a month approach the limit (SDR-5)
Storage:                  < 5 MB JSON in git; ~1,200 static pages per build
```

## 7. Hand-offs
- **→ Software Architect**: static routes (SDR-1), the client filter island (SDR-2), the build-time flag (SDR-3), and the final call on the public-repo caveat.
- **→ DBA**: data is JSON files, not a DB. Needs the schema for `Commitment` and `Indicator`, id rules and the file layout.
- **→ Security Engineer**: the attack surface is static pages, one client island and outbound links. Areas to cover: CSP, HSTS, supply chain (pnpm lockfile, CI actions), catalogue integrity (PR review), content injection from JSON (never render raw HTML).
- **→ DevOps**: the GitHub Actions pipeline in §2, Vercel env vars, the embargo redeploy runbook, and a bandwidth watch.
- **→ Test Architect**: catalogue validator, status derivation, embargo 404s, client filtering, FR/AR E2E, Lighthouse budgets.

## System Design Checklist
- [x] NFRs have measurable targets
- [x] Topology only contains boxes that will be built
- [x] Every external integration has a pattern and a failure story
- [x] Capacity estimated and limits identified (Vercel bandwidth)
- [x] YAGNI: no DB, cache, queue, gateway or runtime monitoring
