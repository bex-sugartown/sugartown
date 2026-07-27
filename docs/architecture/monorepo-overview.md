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

### External Build Commands Must Route Through Turbo

`dependsOn: ["^build"]` only fires when a task is invoked *through Turbo* (`turbo run build`, or `pnpm build` at the workspace root, which calls it). It does **not** fire when something outside the monorepo — a hosting platform, a CI step, a Dockerfile — runs a workspace member's own `build` script directly (e.g. `cd apps/web && pnpm build`, or a platform's "base directory" setting scoping the build command to one app). That invocation never touches `turbo.json`, so internal workspace dependencies (`packages/design-system`, etc.) never build first.

This matters because generated build output (`dist/`) is correctly gitignored — it's not in the git checkout a fresh CI/deploy environment starts from. If a workspace member imports another workspace member's built output (e.g. `apps/web` importing `@sugartown/design-system/styles.css` from `packages/design-system/dist/`) and the external build command bypasses Turbo, the import fails to resolve because nothing built it. Both `apps/web`'s Netlify deploy and the Storybook (`pinkmoon`) Netlify deploy hit exactly this failure independently — each site's build command called a leaf script (`pnpm build` scoped to `apps/web`, `pnpm storybook:build` scoped to `apps/storybook`) instead of the Turbo-aware root command. Full incident: `docs/briefs/PROJ-005-monorepo-prd.md` §7, Risk: Build Orchestration Bypass.

**Rule for any new external build integration (hosting platform, CI job, Dockerfile):** either invoke `turbo run build --filter=<workspace>...` (the `...` suffix pulls in dependencies) from the monorepo root, or, if the platform requires a leaf-scoped command, make that leaf's own `build` script self-sufficient by building its internal workspace dependencies first (e.g. `pnpm --filter @sugartown/design-system build && vite build`). Prefer the Turbo-routed form — it stays correct automatically as the dependency graph changes; a hardcoded leaf-script prefix has to be remembered and updated by hand at every consuming leaf.

### Shell Scripts in CI Must Be Tested Under `dash`

macOS `/bin/sh` is bash in POSIX mode; Ubuntu CI runners use `dash`. They differ in ways that fail silently. Most consequential: the POSIX **dot command is a special builtin**, so `. ./missing-file` exits a non-interactive shell immediately, and a trailing `2>/dev/null` suppresses the message without suppressing the exit. dash exits `2`, macOS `sh` exits `1`, both abort before the next line.

**Materialized 2026-06-21 → 2026-07-27:** `apps/storybook/scripts/chromatic.sh` opened with `set -a; . ./.env 2>/dev/null; set +a`. `.env` is gitignored, so it never exists in CI. The script died before its first `echo` on every run for five weeks, and because it produced no output the failure read as a Chromatic problem rather than a shell one. VRT did not run in CI for that entire period, and a design-system regression reached production during it (SUG-247).

**Rule:** any shell script invoked by CI must be run once under `dash`, with CI's assumptions (no `.env`, no local caches), before it is relied on — `dash script.sh`, or `docker run --rm -v "$PWD":/w -w /w debian:stable-slim sh script.sh`. Guard optional sourcing explicitly: `[ -f ./.env ] && { set -a; . ./.env; set +a; }`.

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
| 2026-07-27 | Added "External Build Commands Must Route Through Turbo" — both Netlify sites (`apps/web`, Storybook) broke independently because their build commands bypassed Turbo's `dependsOn` dependency ordering |
| 2026-07-27 | Added "Shell Scripts in CI Must Be Tested Under `dash`" — `chromatic.sh` sourced a gitignored `.env` via the POSIX dot special-builtin, killing the script before its first line on every CI run for five weeks (SUG-255) |
