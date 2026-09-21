# Communications Log
<!-- Tracks key questions, user preferences, handoffs -->
<!-- Format: ### [YYYY-MM-DD HH:MM] PREFERENCE/HANDOFF/QUESTION — Title -->

### [2026-09-18] UNDERSTAND — Wa3d.ma kickoff
- What: post-election promise tracker (2026-2031 primary, 2021-2026 archive). Where: new project, empty repo. Size: large (new project).
- Scope, data model, 3 ADRs, content rules, risks and sprint 1 drafted in HANDOFF.md; treated as input to the PRD, not re-litigated.
- Open questions to user: stack, hosting/repo, env vars, morocco2030 cleanup.

### [2026-09-18] PREFERENCE — Kickoff answers
- Stack: same as da3m-ma (Next.js App Router + next-intl FR/AR RTL + zod + Vitest + Playwright, pnpm).
- Hosting: Vercel + new GitHub repo rhorba/wa3d-ma.
- Embargo: env flag NEXT_PUBLIC_ARCHIVE_ENABLED (default false), flipped manually on 2026-09-24.
- morocco2030 staged Wa3d scoping edits: discarded on user approval (5 files, all session-9 scoping, superseded by HANDOFF.md).


### [2026-09-21] HANDOFF — PM → System Designer
- Context: PRD v1.1 approved (static FR/AR tracker, catalogue-as-code, no runtime APIs, budget ≈ 0). Need: NFRs, topology, SDRs. Constraints: da3m-ma stack, build-time embargo flag, corrections via GitHub issues.

### [2026-09-21] HANDOFF — System Designer → Software Architect
- Context: System Design approved (SSG, client filter island, build-time embargo flag, Vercel Hobby). Need: structure, dependency rules, ADRs, routes, final call on embargo leak. Constraints: da3m-ma stack, no middleware/route handlers/server actions.

### [2026-09-21] HANDOFF — Software Architect → Security Engineer
- Context: Architecture approved (static, no auth/input/DB, text-only rendering). Need: threat model, headers/CSP, supply chain, accounts, data protection. Constraints: no nonce CSP (SSG), public repo, Vercel Hobby.

### [2026-09-21] HANDOFF — Security Engineer → DBA
- Context: Security approved (text-only data, https + official-domain allowlist, optional archiveUrl). Need: final JSON schema, ADR-9 fields, validation rules, layout, migrations. Constraints: zod 4, one file per entity, status derived, ids stable.

### [2026-09-21] HANDOFF — DBA → UX Designer
- Context: data model approved (title, quote+provenance, origin+page, target?, deadline, lastVerified, evidence). Need: personas, IA, flows, lo-fi wireframes, states. Constraints: static, one filter island, no score, status not by colour alone.

### [2026-09-21] HANDOFF — UX Designer → UI Designer (+ Design Loop)
- Context: UX approved. Need: named aesthetic, tokens, inventory, rendered mockups, 3 fresh critics. Constraints: party-neutral palette, no red/green, Tailwind 4, one island, AA, FR+AR.

### [2026-09-21] HANDOFF — UI Designer → Test Architect
- Context: all design docs approved. Need: risk-based strategy, >=80% gate, ATDD per US, adversarial plan, release gates, recording plan. Constraints: Vitest+Playwright, fictional fixtures, real dataset tested in its own PR.

### [2026-09-21] HANDOFF — Test Architect → DevOps/DevSecOps (+ Deployment)
- Context: test strategy approved; DB v1.2 (V-17). Need: envs, CI, security gates, Vercel, env vars, repo hardening, runbooks, CI monitoring. Constraints: Vercel git integration, SHA-pinned actions, da3m-ma CI pattern, no DB.

### [2026-09-21] HANDOFF — DevOps/DevSecOps → Scrum Master (+ Test Architect)
- Context: 9 docs approved. Need: epics, <=1-day stories with Gherkin, deps, sprints, traceability. Constraints: solo dev, user-verified dataset, embargo floor 24 Sept, 2026-2031 within 72 h.

### [2026-09-21] UNDERSTAND — Sprint 1 kickoff
- What: Sprint 1 = stories 0.1, 1.1-1.9, 3.1, 4.1 (~4 days). Where: continuation, repo pushed, no code. Size: large epic. Env vars: already collected (.env.example). Specialists: Tech Lead, Backend Dev, Tester, DevOps, Security Engineer (1.5), PM/Copywriter (4.1).

### [2026-09-21] HANDOFF — Scrum Master → Tech Lead (Story 0.1)
- Context: Sprint 1 plan confirmed, PR per story. Need: scaffold matching da3m-ma (Architecture §1), fitness ESLint rules (§8), lib/env.ts (ADR-6 + WA3D_DATA_DIR). Constraints: no middleware, pinned versions, pnpm 10, Node 22, ESM.

### [2026-09-21] HANDOFF — Tech Lead → DevOps/DevSecOps (Story 3.1)
- Context: scaffold merged 7bfefe0. Need: ci.yml quality(+grep gates)/test/security, SHA-pinned, first run watched. Constraints: read-only perms, frozen lockfile, skills/docs excluded from scanners.

### [2026-09-21] HANDOFF — DevOps → Backend Dev (Story 1.1)
- Context: Batch A done, CI green on main (9d92f78). Need: zod schemas per DB v1.2 §3 + test builders. Constraints: pure module (zod only, ESLint-enforced), strict objects, https URLs, NFC text; V-17 comes in 1.5.

### [2026-09-21] HANDOFF — Backend Dev (Batch B) → Backend Dev + Tester (Batch C, Story 1.4)
- Context: schema/status/progress merged (b271297), coverage 100%. Need: validateCatalogue skeleton (issues with rule/severity/file), V-1..V-6, Casablanca today, fuzz. Constraints: pure (zod only), today injected, exactly-one-rule-per-fixture tests.

### [2026-09-21] HANDOFF — Backend Dev → Backend Dev + Security Engineer (Story 1.5)
- Context: pipeline merged 7f70dfd. Need: V-7 allowlist, V-17, official-domains.json v0, adversarial table. Constraints: WHATWG URL parsing, pointers exempt, ZWNJ allowed.

### [2026-09-21] HANDOFF — Security Engineer → Backend Dev (Story 1.6)
- Context: V-7/V-17 merged 65b703d. Need: V-8 (lastVerified/mandate start), V-9 (status vs deadline boundaries), V-11 (indicator exists, direction), V-12 (indicator values order). Constraints: mandate start dates are placeholders except 2021-10-07 (DB §3 TBC).

### [2026-09-21] HANDOFF — Backend Dev → Backend Dev + Copywriter (Story 1.7)
- Context: ec0b6cc. Need: V-10 FR/AR (normalised whole-word + AR proclitics), V-13/14/15 warnings, V-16 embargo error, banned-words.json v0. Constraints: warnings never fail; no \u escapes in source.

### [2026-09-21] HANDOFF — Backend Dev → Backend Dev + Tester (Story 1.8)
- Context: validator complete 8928bce. Need: load.ts (fs, memo, throws on errors), mandates.ts (enabled/default, ADR-10), valid fixture catalogue. Constraints: server-only, reference lists always from data/, V-16 only enforced for the real data dir (fixtures are fictional).

### [2026-09-21] HANDOFF — Backend Dev → Backend Dev + DevOps (Story 1.9)
- Context: loader merged 653756a. Need: catalogue:validate|freshness|links CLI, CI catalogue job with job summary. Constraints: tsx --conditions=react-server, links are warnings only (gov sites 401 bots), logic in lib/ for coverage.

### [2026-09-21] HANDOFF — Backend Dev → PM + Copywriter (Story 4.1)
- Context: CLI merged 86fd8e0; validator enforces V-1..V-17. Need: docs/curation-guide.md (how to curate for any coalition), review official-domains.json + banned-words.json with the user. Constraints: neutrality rules from PRD/HANDOFF, ADR-3 local-only 2021-2026 branch.

### [2026-09-21] UNDERSTAND — Sprint 2 kickoff
- What: stories 2.1-2.7, 3.2, 3.3, 3.4, 3.5 (~4.5 days). Where: continuation 103f2a3. Env vars: collected. Specialists: Frontend Dev, UI/UX (design fidelity), Copywriter (FR/AR copy, Méthodologie), Tester, DevOps/Deployment, Security (headers, repo hardening). Open: NFR-1 JS budget; user prerequisites for 3.4/3.5.

### [2026-09-21] HANDOFF — Scrum Master → Frontend Dev + UI Designer (Story 2.1)
- Context: engine done; UI v1.0 approved (tokens, marks, mockups rfinal). Need: Tailwind @theme tokens, next/font, header/footer, status marks, SEC-1 headers, lang/dir. Constraints: static only, no client components here, AR mirrored with logical properties, Western digits.
