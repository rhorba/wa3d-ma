# Security policy · Politique de sécurité

Wa3d.ma is a static site: no accounts, no database, no forms, no cookies. Every page is built from the files in `data/` and served by Vercel with a strict Content Security Policy.

## Report a vulnerability · Signaler une faille

Please report privately through **[GitHub private vulnerability reporting](https://github.com/rhorba/wa3d-ma/security/advisories/new)**. Do not open a public issue.

Merci de signaler toute faille en privé via le lien ci-dessus, jamais dans une issue publique.

Include the affected URL or file, the steps to reproduce and the impact. This is a volunteer project: reports are acknowledged within 7 days on a best-effort basis. There is no bug bounty.

## In scope

- The site at https://wa3d-ma.vercel.app (and its future own domain) and the code in this repository
- Anything that could let someone change what the site publishes without a reviewed pull request: the CI workflows, dependencies, the build
- Missing or bypassable security headers (CSP, HSTS, frame protection)

## Not a security issue

- **A wrong status, date, figure or source** on a commitment: use the public [correction form](https://github.com/rhorba/wa3d-ma/issues/new?template=correction.yml). Corrections need an official source.
- Reports from automated scanners without a demonstrated impact, and denial of service against Vercel.
