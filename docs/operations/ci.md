# CI Enforcement

## Purpose

Documents the CI pipeline configuration for the Sugartown monorepo — what runs, in what order, and what causes a build to fail.

## Context

CI is implemented as a GitHub Actions workflow (`.github/workflows/ci.yml`). The pipeline enforces lint, typecheck, URL validation, filter validation, and build in a deterministic order. Any step failure halts the pipeline and exits non-zero.

## Details

### Pipeline Order

```
1. Install dependencies    (pnpm install --frozen-lockfile)
2. Lint                    (pnpm lint)
3. Type check              (pnpm typecheck)
4. Validate URLs           (pnpm validate:urls)
5. Validate filters        (pnpm validate:filters)
6. Build                   (pnpm build)
```

Steps 2–6 run sequentially. A failure at any step stops the pipeline immediately.

### Fail Conditions

| Step | Fails when |
|---|---|
| `lint` | ESLint reports any error in any workspace |
| `typecheck` | TypeScript reports any type error in any workspace |
| `validate:urls` | Duplicate canonical URLs, missing slugs, or broken nav items detected |
| `validate:filters` | Any archive fails to produce a valid FilterModel |
| `build` | Any workspace build fails |

### Script Definitions

All scripts are defined in root `package.json` and delegated to Turborepo:

```json
{
  "scripts": {
    "lint":             "turbo run lint",
    "typecheck":        "turbo run typecheck",
    "validate:urls":    "pnpm --filter web validate:urls",
    "validate:filters": "pnpm --filter web validate:filters",
    "build":            "turbo run build"
  }
}
```

`validate:urls` and `validate:filters` run only in `apps/web` — they are not Turbo tasks because they require Sanity API access at runtime and are not cacheable build artifacts.

### Environment Variables Required

The validation scripts require Sanity credentials at CI time:

```
VITE_SANITY_PROJECT_ID     = poalmzla
VITE_SANITY_DATASET        = production
VITE_SANITY_API_VERSION    = (set in .env or CI secrets)
```

Set these as GitHub Actions secrets: `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION`.

### CI Configuration File

`.github/workflows/ci.yml` — see that file for the full workflow definition.

### Turbo Pipeline

`turbo.json` defines task dependency order:

```json
{
  "pipeline": {
    "build":     { "dependsOn": ["^build"] },
    "lint":      { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] }
  }
}
```

`^` means "dependency workspaces must complete this task first." This ensures packages build before apps that consume them.

### What Is Not Enforced in CI

- `pnpm format` — Prettier formatting is not a CI gate (run locally)
- Storybook build — not included in the main CI pipeline
- Deployment — CI validates only; deployment is manual

## Related Files

- `.github/workflows/ci.yml` — CI workflow definition
- `turbo.json` — Turbo pipeline configuration
- `package.json` — Root script definitions
- `apps/web/scripts/validate-urls.js` — URL validation logic
- `apps/web/scripts/validate-filters.js` — Filter model validation logic

## Change History

| Date | Change |
|---|---|
| 2026-02-20 | CI workflow created; validate:urls and validate:filters added to pipeline |
