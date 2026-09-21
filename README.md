# Wa3d.ma (وعد)

Independent, non-partisan tracker of the Moroccan government's commitments: verbatim quotes,
official sources, statuses derived from dated evidence. French and Arabic (RTL).

All design decisions live in [`docs/`](docs/) (start with the PRD and the architecture).

## Develop

```sh
pnpm install
cp .env.example .env.local   # public build-time values, no secrets
pnpm dev                     # http://localhost:3000/fr
```

| Command                                              | What it does                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | Static checks (include the architecture fitness rules)        |
| `pnpm test`                                          | Unit + integration tests with the 80% coverage gate           |
| `pnpm build && pnpm e2e`                             | Production build, then Playwright (FR + AR, desktop + mobile) |

Corrections to the data: open an issue using the "Correction" form (public, needs a GitHub account).
