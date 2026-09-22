# Risk Log
<!-- Tracks risks identified and their mitigations -->
<!-- Format: ### [YYYY-MM-DD HH:MM] SECURITY/PERFORMANCE/DEPENDENCY — Title -->

### [2026-09-18] SCHEDULE — Archive may miss 24 Sept embargo lift
- 🔴 doc chain leaves little build time before 2026-09-24. Accepted by user. Mitigation: archive can go live any day after 24 Sept; embargo is a floor, not a deadline. Primary 2026-2031 mandate (~Oct 2026) unaffected.
### [2026-09-18] SEO — No domain owned
- wa3d.ma not owned; risk it gets taken. Mitigation: build on *.vercel.app, all URLs from NEXT_PUBLIC_SITE_URL so a swap is one env change.

### [2026-09-21] NEUTRALITY — Public repo exposes 2021-2026 dataset before embargo
- Site stays dark via flag, but JSON on main is readable on GitHub. Recommended: dataset on a branch until 2026-09-24 (doubles as user-verification gate).
### [2026-09-21] PERFORMANCE — Vercel Hobby 100 GB/month transfer
- ~24 GB typical; 3+ viral days/month approach limit. Fallback: Cloudflare Pages (needs own domain).
### [2026-09-21] SECURITY — ADR-3 flaw: branches in a public repo are public
- Fix: 2021-2026 dataset on a LOCAL-only branch until 2026-09-24; push/PR after verification. SEC-8 CI guard.
### [2026-09-21] SECURITY — Admin-plane accounts are the crown jewels
- 2FA on GitHub/Vercel/registrar + noreply commit email required before first push (user action).
### [2026-09-21] PERFORMANCE — NFR-1 list-page JS < 100 KB likely infeasible as written
- Empty Next 15 + React 19 page already ships ~102 kB shared First Load JS. Decide at Story 2.3/3.3 with a real list page: raise budget (e.g. <= 130 KB total, island <= 15 KB) or keep and trim. User decision.
### [2026-09-22] DEPENDENCY — OneDrive sync interferes with .next build cache (local only)
- EINVAL readlink on .next/diagnostics; fixed by rm -rf .next. CI/prod unaffected. Option for the user: exclude .next and node_modules from OneDrive sync, or move the repo outside OneDrive.

### [2026-09-22] RISK — Branch protection includes admins: an urgent content correction now needs a PR + ~4 min of green CI (accepted, user choice). Vercel Instant Rollback (R2) stays available for emergencies.
