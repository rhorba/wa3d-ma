# DevOps Foundation: Wa3d.ma (وعد)
**Architecture**: docs/architecture-wa3d-ma.md (v1.0) · **Security**: docs/security-wa3d-ma.md (v1.0) · **Tests**: docs/test-strategy-wa3d-ma.md (v1.0)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: DevOps/DevSecOps + Deployment | **Status**: Approved (2026-09-21)

> The pipeline reuses da3m-ma's CI (the same pinned actions and scanners) minus Postgres. Deploys are Vercel's Git integration:
> CI never holds a deploy credential (SEC-9), and "deploy" means "merge to `main`".

## 1. Environment Strategy
| Environment | Purpose | Deploy trigger | Data |
|---|---|---|---|
| local | Development, curation (`pnpm dev`, `pnpm catalogue:validate`) | Manual | `data/` (and the local-only `data/2021-2026` branch until 24 Sept) |
| preview | Review each PR on a real URL (acts as staging) | Every push to a PR branch (Vercel) | Whatever the branch contains; **Deployment Protection on** (Vercel login required) |
| production | Public site | Merge to `main` (Vercel), after required checks pass | `data/` on `main` |

There is no separate staging environment (YAGNI): previews are per-PR, protected, and built exactly like production.
⚠️ **Git branch**: the local repo is on `master`, but the project convention is `main`. Rename it with `git branch -m master main` before the first push.

## 2. Environment Variables (CLAUDE.md rule 10), `.env.example`
| Variable | Scope | Value | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build, public | `https://wa3d-ma.vercel.app` | Vercel project name confirmed on 2026-09-22; becomes the own domain later (runbook R3) |
| `NEXT_PUBLIC_ARCHIVE_ENABLED` | build, public | `false` (set `true` on/after 2026-09-24 via runbook R1) | Read at build time (SDR-3) |
| `NEXT_PUBLIC_REPO_URL` | build, public | `https://github.com/rhorba/wa3d-ma` | Correction-issue links |
| `WA3D_DATA_DIR` | build, **CI/test only** | unset (= `data`); CI E2E sets `tests/fixtures/catalogue/valid` | New, non-public. Lets the same build run on fixtures. Parsed in `lib/env.ts` (ADR-6 extended by one var) |

There are **no secrets** in the project (Security §5). `.env` stays git-ignored, `.env.example` is committed, and nothing is hardcoded (`lib/env.ts` is the only reader).

## 3. CI Pipeline: `.github/workflows/ci.yml`
Triggers: `pull_request` + `push` to `main`. `permissions: contents: read`. `concurrency` cancels superseded runs. All actions are pinned by commit SHA (same pins as da3m-ma). Node 22, pnpm 10, `pnpm install --frozen-lockfile`. `NEXT_TELEMETRY_DISABLED=1`.

| Job | Steps | Blocks merge |
|---|---|---|
| `quality` | `pnpm lint` · `pnpm typecheck` · `pnpm format:check` · grep gates (one `'use client'`, no `dangerouslySetInnerHTML`, `process.env` only in `lib/env.ts`) | ✅ |
| `catalogue` | `pnpm catalogue:validate` on `data/` (V-1…V-17, including the V-16 embargo guard). Warnings (V-13…V-15) are written to the job summary. | ✅ (errors only) |
| `test` | `pnpm test` = Vitest unit + integration with v8 coverage; thresholds 80% global, 100% branches on `status.ts`/`progress.ts`/`validate.ts` | ✅ |
| `security` | Semgrep (`p/owasp-top-ten`, `p/typescript`) · Trivy fs (CRITICAL,HIGH) · Gitleaks (full history) · `pnpm audit --audit-level=critical`. Scanner images pinned by digest. `skills/` excluded. | ✅ |
| `e2e` | `playwright install chromium` → `WA3D_DATA_DIR=tests/fixtures/catalogue/valid NEXT_PUBLIC_ARCHIVE_ENABLED=true pnpm build` → **route check** (fails on any ƒ dynamic route in the build output) → `pnpm e2e` (FR + AR, mobile + desktop, axe, security headers). Uploads the Playwright report on failure. | ✅ |
| `embargo-smoke` | Build with fixtures and the flag **unset** → `next start` → assert 404 on 2021-2026 list/detail and no 2021-2026 URL in `/sitemap.xml` | ✅ |
| `lighthouse` | Own fixture build (same env as `e2e`) → `pnpm budget` (list JS ≤ 130 KB, filters island ≤ 15 KB, from the build manifest) → `lhci autorun` (`lighthouserc.json`): list + detail, FR + AR, mobile preset, 3 runs; assert perf ≥ 0.95, a11y ≥ 0.95 (median run), `resource-summary:script:size` ≤ 130 KB on the list pages. Reports uploaded as an artifact (7 days), never to public storage. | ✅ |
| `real-data-smoke` | Only when the PR changes `data/**`: build on `data/`, crawl every URL in the sitemap → all 200, axe with no serious/critical violations | ✅ (data PRs) |

Estimated wall time is ~6–8 minutes, since all jobs run in parallel.

**Other workflows**
- `.github/workflows/monthly-review.yml`: `schedule: cron '0 8 1 * *'` + `workflow_dispatch`. `permissions: contents: read, issues: write`. It runs `pnpm catalogue:freshness` (V-13/V-14) and `pnpm catalogue:links` (HEAD/GET every source URL, 10 s timeout, results as warnings, because government sites like cg.gov.ma return 401 to bots). It opens **one** issue, "Revue mensuelle AAAA-MM", listing stale commitments and unreachable links. This covers PRD G3 and the Security link-rot mitigation. No auto-fix.
- `.github/dependabot.yml`: security updates for npm (enabled in repo settings) + `github-actions` version updates **monthly** (keeps SHA pins current). No routine npm version bumps (framework-churn risk, Architecture §9).

## 4. Infrastructure
- **Hosting**: Vercel Hobby, Git integration with `rhorba/wa3d-ma`. Framework preset Next.js, Node 22, install `pnpm install --frozen-lockfile`, build `pnpm build`. Production branch `main`.
- **Compute**: none at runtime (SSG, SDR-1). The route check in CI keeps it that way.
- **Database**: none (JSON in git).
- **Secrets**: none. Vercel env vars hold only the public values in §2.
- **DNS / domain**: `*.vercel.app` until a domain is bought (runbook R3). Production live at https://wa3d-ma.vercel.app since 2026-09-22.
- **Fallback host** (SDR-5): Cloudflare Pages, documented only, not provisioned (YAGNI). It needs the own domain.

## 5. Repository Hardening (SEC-4, SEC-5, SEC-6, SEC-7): one-time setup checklist
**User actions (only you can do these):**
- [ ] 2FA (passkey/TOTP) on GitHub and Vercel; recovery codes stored offline
- [ ] GitHub → Settings → Emails: "Keep my email private" + "Block command line pushes that expose my email"; `git config user.email "<id>+rhorba@users.noreply.github.com"` in this repo **before the first commit**
- [x] Create the public repo `rhorba/wa3d-ma` (empty, no README)
- [x] Import it into Vercel, set the §2 env vars for Production and Preview, keep Deployment Protection on (2026-09-22: project `wa3d-ma` on the Hobby team, Node 22.x, Vercel Authentication = Standard Protection; the env vars are marked sensitive, so the dashboard does not show their values)

**Done by me via `gh` once the repo exists (you confirm each):**
- [x] Branch protection on `main`: PR required (0 reviews: solo maintainer), required checks = all 8 `ci.yml` jobs from GitHub Actions, strict (branch up to date), no force-push or deletion, linear history, include administrators (2026-09-22)
- [x] Secret scanning + push protection; private vulnerability reporting; Dependabot alerts + security updates (7-day cooldown in `dependabot.yml`)
- [x] Issues: disable blank issues; `.github/ISSUE_TEMPLATE/correction.yml` (commitment id, what is wrong, official source URL, a "this issue is public" notice); `config.yml` with a link to the Méthodologie page
- [x] `SECURITY.md` → private vulnerability reporting
- [x] Squash-merge only; delete the branch on merge

## 6. Security Scanning Gates
| Scanner | Scan type | Fail threshold |
|---|---|---|
| Semgrep | SAST (OWASP Top 10, TypeScript) | Any finding at `--error` level |
| Trivy | SCA: dependency CVEs | CRITICAL or HIGH |
| `pnpm audit` | SCA: npm advisories | CRITICAL (HIGH reported) |
| Gitleaks | Secrets in full history | Any |
| GitHub secret scanning + push protection | Secrets on push | Blocks the push |
| Grep gates + route check | Architecture fitness (ADR-8, ADR-6, SDR-1) | Any violation |

## 7. Monitoring Baseline
| Signal | Tool | Alert / threshold |
|---|---|---|
| CI status on every push | GitHub Actions + `gh run watch` (CLAUDE.md rule 11) | Red = stop other work, fix, re-push; each check logged in `.logs/activity.md` |
| Deploy status | Vercel email notifications | Failed production deploy |
| Freshness + link rot | `monthly-review` workflow issue | Any stale (> 45 d) or unreachable source |
| Bandwidth | Vercel Usage page, checked in the monthly review | > 70 GB in a month → prepare the Cloudflare fallback (SDR-5) |
| Indexing | Google Search Console (after launch) | < 90% of pages indexed 30 days after launch (PRD G5) |
| Uptime | none (static CDN; SDR-6) | re-evaluate if an outage goes unnoticed |

## 8. Runbooks
**R1 Lift the archive embargo** (on or after 2026-09-24, and only after you've verified the dataset):
1. On the local branch `data/2021-2026`: `pnpm catalogue:validate && pnpm test` pass.
2. `git push -u origin data/2021-2026` → open the PR. CI must be fully green, including `real-data-smoke`.
3. You sign off on the dataset in the PR (ADR-3 gate).
4. In Vercel → Settings → Environment Variables → Production: `NEXT_PUBLIC_ARCHIVE_ENABLED=true` (set **before** the merge, so the merge's deploy picks it up).
5. Squash-merge → production deploy (~2 min). Check `/fr/2021-2026`, `/ar/2021-2026`, a detail page and `/sitemap.xml`.
6. Search Console: submit the sitemap. Log in `.logs/activity.md`.

**R2 Rollback**: Vercel → Deployments → previous production → "Instant Rollback" (seconds). Then `git revert` the bad PR on `main` so git matches production again. For a wrong status, follow Security §8 (correct it with a dated evidence note).
**R3 Own-domain swap**: buy the domain (registrar lock, 2FA, auto-renew) → add it in Vercel → set `NEXT_PUBLIC_SITE_URL` → redeploy → add `preload` to HSTS (SEC-1) and submit to hstspreload.org → new Search Console property + sitemap → keep `wa3d-ma.vercel.app` redirecting to the domain.
**R4 2026-2031 ingestion** (within 72 h of the programme's presentation, PRD G4): a `data/2026-2031-programme` branch → curate → PR → CI + your sign-off → merge. The home page switches automatically (ADR-10). No embargo applies to the current mandate.
**R5 Version recording** (rule 9): `pnpm e2e:record` (Playwright `video: 'on'` on the critical journeys, fixture build) → the script copies the result to `.recordings/v<version>-<YYYY-MM-DD>.webm` → commit it → log it.

## DevOps Validation Checklist
- [x] Environments defined with deploy triggers (local / preview / production; preview replaces staging)
- [x] CI covers lint + types + catalogue + test (80% gate) + security + build + E2E + embargo + Lighthouse
- [x] Coverage gate configured (< 80% fails CI)
- [x] Secrets strategy confirmed (none exist; public env vars only; scanners guard against leaks)
- [x] Monitoring baseline defined with thresholds
- [x] Env vars listed for `.env.example` (rule 10); values proposed, awaiting your confirmation
