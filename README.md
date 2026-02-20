# Sugartown Monorepo

> Mini-monorepo: React + Sanity Studio, pnpm workspaces, Turborepo

## Workspaces

| Workspace | Role | Dev URL |
|---|---|---|
| `apps/web` | React 19 + Vite 7 SPA | http://localhost:5173 |
| `apps/studio` | Sanity Studio v5 (CMS) | http://localhost:3333 |
| `packages/design-system` | CMS-agnostic component library | — |

## Quick Start

```bash
pnpm install
pnpm dev          # web + studio concurrently
```

## Key Commands

```bash
pnpm lint                # ESLint across all workspaces
pnpm typecheck           # TypeScript across all workspaces
pnpm validate:urls       # Validate canonical URLs and nav (requires Sanity env vars)
pnpm validate:filters    # Validate archive filter models (requires Sanity env vars)
pnpm build               # Production build across all workspaces
pnpm format              # Prettier (not a CI gate — run locally)
```

## Architectural Boundaries

1. `packages/` cannot import from `apps/`
2. `apps/web` cannot import from `apps/studio`
3. `packages/design-system` is CMS-agnostic — no Sanity imports

These boundaries are enforced by ESLint rules in `packages/eslint-config/boundaries.js`.

## Documentation

All architectural, schema, and operational docs live in `/docs`:

| Doc | Path |
|---|---|
| Monorepo overview | `docs/architecture/monorepo-overview.md` |
| Sanity data flow | `docs/architecture/sanity-data-flow.md` |
| Schema reference | `docs/schemas/schema-reference.md` |
| URL namespace | `docs/routing/url-namespace.md` |
| GROQ query reference | `docs/queries/groq-reference.md` |
| CI pipeline | `docs/operations/ci.md` |

## CI

GitHub Actions runs on every push and PR to `main`:

```
install → lint → typecheck → validate:urls → validate:filters → build
```

Any step failure halts the pipeline. See `docs/operations/ci.md` for details.

## Release

See `RELEASE_CHECKLIST.md` before every merge to `main`.

## Sanity Project

| Field | Value |
|---|---|
| Project ID | `poalmzla` |
| Dataset | `production` |
