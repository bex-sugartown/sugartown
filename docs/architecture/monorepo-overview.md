# Monorepo Overview

## Purpose

Documents the top-level structure, tooling, and enforced boundaries of the Sugartown monorepo. This is the entry point for understanding how the repository is organized and why.

## Context

The Sugartown monorepo was assembled in January 2026 by merging two legacy repos (`sugartown-frontend`, `sugartown-sanity`) via git subtree into a single pnpm workspace with Turborepo orchestration. The monorepo baseline is tagged `v1.0.0-baseline` (commit `4a6f074`).

## Details

### Workspace Structure

```
sugartown/
├── apps/
│   ├── web/           # React 19 + Vite 7 frontend (SPA)
│   ├── studio/        # Sanity Studio v5 (CMS)
│   └── storybook/     # Component documentation (not yet active)
├── packages/
│   ├── design-system/ # Shared design tokens and components
│   ├── eslint-config/ # Shared ESLint rules with boundary enforcement
│   └── tsconfig/      # Shared TypeScript configurations
├── docs/              # Internal documentation (this directory)
├── turbo.json         # Turborepo pipeline configuration
└── package.json       # Workspace root — scripts and devDependencies
```

### Tooling

| Tool | Version | Role |
|---|---|---|
| pnpm | >=9.0.0 | Package manager and workspace orchestration |
| Turborepo | ^1.11.3 | Build pipeline caching and task orchestration |
| Node.js | >=20.0.0 | Runtime requirement |
| TypeScript | ^5.3.3 | Type checking across all workspaces |
| ESLint | Per-workspace | Linting with shared config and boundary enforcement |
| Prettier | ^3.1.1 | Code formatting |

### Enforced Architectural Boundaries

These are enforced via ESLint in `packages/eslint-config/boundaries.js`. Violations fail the lint step.

| Rule | Enforced |
|---|---|
| `packages/*` cannot import from `apps/*` | ✅ |
| `apps/web` cannot import from `apps/studio` | ✅ |
| `packages/design-system` cannot import Sanity or CMS libs | ✅ |
| `apps/web` accesses CMS only via `packages/content` (future) | Planned |

### Turbo Pipeline Order

```
typecheck → lint → build
```

Tasks with `dependsOn: ["^build"]` wait for dependency workspaces to build first. `dev` and `storybook` are persistent and not cached.

### Key Commands

```bash
pnpm dev              # Run web + studio concurrently
pnpm build            # Build all workspaces
pnpm lint             # Lint all workspaces
pnpm typecheck        # Type-check all workspaces
pnpm validate:urls    # Validate canonical URL registry (apps/web)
pnpm validate:filters # Validate filter models for all archives (apps/web)
pnpm format           # Format all files with Prettier
```

## Related Files

- `turbo.json` — Turborepo pipeline configuration
- `package.json` — Root workspace scripts
- `pnpm-workspace.yaml` — Workspace package declarations
- `packages/eslint-config/` — Boundary enforcement rules
- `docs/operations/ci.md` — CI enforcement details

## Change History

| Date | Change |
|---|---|
| 2026-01-31 | Monorepo baseline created from subtree merge |
| 2026-02-19 | v0.8.0 — routing, taxonomy, SEO, authorship complete |
| 2026-02-20 | Moved to `docs/architecture/` during doc consolidation |
