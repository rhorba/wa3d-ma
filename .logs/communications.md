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
