# Security Baseline: Wa3d.ma (وعد)
**Architecture Reference**: docs/architecture-wa3d-ma.md (v1.0, Approved)
**Version**: 1.0 | **Date**: 2026-09-21 | **Author**: Security Engineer | **Status**: Approved (2026-09-21)

> Stage: solo civic MVP with no users, no input and no secrets at runtime. The classic web attack surface is tiny.
> The real assets are **the integrity of what the site says** and **the accounts that can change it**, so most
> controls in this document protect the publishing chain (GitHub → CI → Vercel → DNS), not the pages.

## 1. Threat Model (5-Minute)
- **What are we building?** A static site that publishes sourced statements about whether the Moroccan government kept its promises.
- **Who would attack it?**
  1. **Politically motivated actors** (partisan trolls, activists, possibly organised influence operations) who want to discredit the site or make it say something false.
  2. Opportunistic attackers: credential stuffing, dependency malware, defacement for fun.
  3. Abusive "reporters" who flood correction issues or harass the curator.
- **Worst outcomes** (most to least severe):
  1. A false or altered status/quote is published under the Wa3d.ma name (reputation and possible legal exposure).
  2. The GitHub, Vercel or domain account is taken over, and the attacker defaces the site or serves malware.
  3. Embargoed content is published before 24 Sept (neutrality breach).
  4. The site goes offline (bandwidth exhaustion pausing the Hobby project).
- **Not in play**: data theft (there is no personal data), auth bypass (there is no auth), SQL/NoSQL injection (there is no DB), SSRF (there is no server).

## 2. STRIDE Analysis (top risks only)
| Threat | Component | Mitigation | Status |
|---|---|---|---|
| **Spoofing** | GitHub / Vercel / registrar accounts | 2FA with passkey or TOTP on all three, no SMS. Recovery codes stored offline. No other collaborators with write access. | TODO (user, before first push) |
| **Spoofing** | Look-alike site or fake "Wa3d" social accounts | Own the domain early (PRD risk). Canonical URLs everywhere. Out of scope beyond that. | Accepted |
| **Tampering** | Catalogue data via PR | Branch protection on `main`: PR required, CI must pass, no force-push or deletion. CI validator (ADR-7) + **official-source domain allowlist** (SEC-3). Fork PRs cannot see secrets (there are none anyway). | TODO (DevOps) |
| **Tampering** | Dependencies / build (supply chain) | Frozen `pnpm-lock.yaml`. pnpm 10 blocks install scripts except an explicit allowlist. `pnpm audit` in CI. Dependabot security updates. GitHub Actions pinned by commit SHA, `permissions: contents: read`, trigger `pull_request` only (never `pull_request_target`). | TODO (DevOps) |
| **Tampering** | Evidence link targets (5-year link rot → expired domain bought by an attacker) | https-only + allowlist of official domains (SEC-3). Optional `archiveUrl` (Wayback Machine) per source, handed to the DBA. Monthly review checks the links. | TODO |
| **Tampering** | Content in the browser (XSS) | ADR-8: text-only rendering, `react/no-danger` lint, no user input, CSP (SEC-1). | Designed |
| **Repudiation** | "Who changed this status, and why?" | Git history is the public audit trail. Every evidence entry carries its source. Squash-merge PRs with descriptive titles. | Designed |
| **Info Disclosure** | Embargoed 2021-2026 data | **The branch must not be pushed before 2026-09-24** (see §7 correction to ADR-3). Build flag as a second layer. | TODO |
| **Info Disclosure** | Curator privacy (politically exposed project) | Commit with the GitHub `noreply` email, not a personal address (SEC-7). No personal email on the site. | TODO (user) |
| **Info Disclosure** | Reporters' identity | GitHub issues are public. The Méthodologie page says so explicitly before linking. | TODO (content) |
| **DoS** | Bandwidth exhaustion → Hobby project paused | Vercel Firewall (included in Hobby): enable Attack Challenge Mode when an attack happens. Fallback re-host on Cloudflare Pages (SDR-5). Static pages have no expensive origin to overload. | Designed |
| **DoS** | Issue flooding / harassment | GitHub "Temporary interaction limits" and issue locking. The curator has no response SLA. | Accepted |
| **Elevation of Privilege** | CI workflow | Read-only token, no secrets, no deploy credentials in CI (Vercel deploys through its own Git integration). | Designed |

## 3. Authentication Strategy
- **Type**: none. The public site has no accounts (PRD out of scope).
- **The authentication that matters** is on the admin planes:

| Account | Control |
|---|---|
| GitHub `rhorba` | 2FA with passkey/security key (TOTP as fallback). Recovery codes offline. Personal access tokens: none or fine-grained with expiry. |
| Vercel | Sign in with GitHub (inherits 2FA) or its own 2FA. |
| Domain registrar (when bought) | 2FA, registrar lock, auto-renew on. DNSSEC if the `.ma` registrar supports it. |

- **MFA**: required on all three (above).
- **Password policy / sessions**: not applicable to the site.

## 4. Authorization Model
- **Pattern**: simple roles, on GitHub only.
- **Roles**: Owner/curator = `rhorba` (sole write access). Everyone else = read + fork + open issues/PRs.
- **Resource-level checks**: not applicable (no runtime resources). The only protected operation is "merge to `main`", guarded by branch protection + CI.

## 5. Data Protection
- **PII fields**: none collected or stored by the site. No cookies, no analytics, no forms, no local storage.
- **Third parties that see visitor data**: Vercel (request logs with IP, as hosting provider) and GitHub (only for people who choose to open an issue).
- **Morocco Law 09-08 (CNDP)**: the site does no processing of personal data of its own, so there is no CNDP declaration and no cookie banner. Re-evaluate if analytics, a newsletter or a contact form is ever added.
- **Public figures**: ministers or party names appear only as authors of an official programme (content rules). There is no data about private individuals.
- **Encryption in transit**: HTTPS only, HSTS (SEC-1). TLS is managed by Vercel.
- **Encryption at rest**: not applicable (public data only).
- **Secrets management**: **there are no secrets**. All three env vars are public `NEXT_PUBLIC_*` values. `.env` stays git-ignored anyway, and `.env.example` is committed.

## 6. Security Requirements for the Dev Team
**SEC-1 Headers** (`next.config.ts` `headers()`, on every path; `poweredByHeader: false`):
```
Strict-Transport-Security: max-age=63072000; includeSubDomains      (add "; preload" only once the own domain is live)
Content-Security-Policy:   default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
                           img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none';
                           base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
X-Content-Type-Options:    nosniff
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```
**CSP decision (SEC-D1)**: statically generated Next.js pages contain inline RSC bootstrap scripts, and nonces require per-request rendering, which SDR-1 forbids.
- 🟢 **Chosen**: `'unsafe-inline'` for scripts, with every other directive locked down.
- 🟡 Rejected for now: per-page script hashes computed after the build.
- 🔴 Rejected: nonces via middleware.

The compensating controls are: no user input anywhere, text-only rendering (ADR-8), `react/no-danger` lint, no third-party scripts, `connect-src 'self'` (limits exfiltration), and `form-action 'none'`. Re-evaluate if any third-party script or user-generated content is ever added.

**SEC-2 Rendering**: follow ADR-8 exactly. External links use `rel="noopener noreferrer"`. No `target="_blank"` without it.
**SEC-3 Official-source allowlist (zod refinement, enforces PRD FR-5)**: `evidence[].source.url` and `origin.url` must be `https:`, and their host must end with an allowlisted domain. The list is kept in `data/official-domains.json` and changed only by PR:
`gov.ma`, `sgg.gov.ma`, `cg.gov.ma`, `finances.gov.ma`, `hcp.ma`, `bkam.ma`, `courdescomptes.ma`, `chambredesrepresentants.ma`, `chambredesconseillers.ma`, `maroc.ma`, `worldbank.org`, `imf.org` (the DBA may extend it). Press appears only in `pointers[]`, which is https-only but not allowlisted.
**SEC-4 Supply chain**: exact versions for `next`, `react` and `next-intl` (as in da3m-ma). `pnpm install --frozen-lockfile` in CI. `pnpm audit --audit-level=critical` fails CI, and `high` is reported. Dependabot security updates on. Actions pinned by SHA. Workflow `permissions: contents: read`.
**SEC-5 Repo settings**: branch protection on `main` (PR required, required status checks, no force-push or deletion). Secret scanning + push protection on (free for public repos). Private vulnerability reporting on, with a `SECURITY.md` pointing to it.
**SEC-6 Correction issues**: an issue form (`.github/ISSUE_TEMPLATE/correction.yml`) with required fields: commitment id, what is wrong, official source URL. A notice says the issue is public. Blank issues are disabled.
**SEC-7 Curator privacy**: before the first commit, set `git config user.email "<id>+rhorba@users.noreply.github.com"` and enable "Keep my email address private" plus "Block command line pushes that expose my email" on GitHub.
**SEC-8 Embargo**: nothing from the 2021-2026 dataset goes on any pushed ref (branch, tag, PR, gist) before 2026-09-24. A CI check on `main` fails if `data/promises/2021-2026/` exists while the date is before 2026-09-24 (belt and braces).
**SEC-9 Vercel**: keep Deployment Protection on (the default) for preview deployments. Production is public. No Vercel tokens stored anywhere.

## 7. Correction to ADR-3 (Architecture)
ADR-3 puts the dataset on the branch `data/2021-2026`. **Every branch pushed to a public GitHub repo is public**, so pushing that branch leaks the data just as much as merging it would. The fix:
- Curate on a **local-only** branch until 2026-09-24. The project folder is inside OneDrive, which gives it an off-machine backup.
- Run `pnpm catalogue:validate` and the tests locally.
- Push and open the PR on or after 24 Sept, after you have verified the data, and let CI run on it.

With this correction, ADR-3's intent holds. I'll append this note to ADR-3 once you approve this doc.

## 8. Incident Response (lightweight)
| Scenario | Contain | Recover |
|---|---|---|
| Wrong or false status published | Revert the PR on `main` (auto-redeploy in ~2 min) | Correct with sources, then add a dated evidence note explaining the correction (transparency) |
| Account compromise | Revoke sessions and tokens, rotate 2FA, check GitHub audit log and Vercel deployments | Roll back production to the last known-good deployment in Vercel ("Instant Rollback"), force-review recent commits |
| Malicious dependency | Pin to the previous version, rebuild | Check what the build shipped; pages are static, so there is no server to compromise |
| Bandwidth attack | Vercel Firewall Attack Challenge Mode | Move DNS to the Cloudflare Pages fallback if the project is paused |

## Security Validation Checklist
- [x] Threat model completed and top risks addressed
- [x] Auth strategy chosen and justified (none on the site; 2FA on admin planes)
- [x] Authorization model defined with roles (GitHub owner only)
- [x] PII fields identified with protection plan (none collected)
- [x] Security requirements handed off (SEC-1…SEC-9 → Dev, DevOps, DBA, UX content)

**Verdict**: ⚠️ Conditional pass. The design is sound. It is conditional on the user actions (2FA, noreply email) and the SEC-5/SEC-8 settings being in place before the first push.
