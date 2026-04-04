# Tooling Upgrade Template

> Use this template for major dependency upgrades (Storybook, Vite, React, Node,
> pnpm, Turborepo). These don't need the full section-builder epic template but
> still require scoping, acceptance criteria, and a clean close-out.
>
> Copy this file, fill in each section, and save as
> `docs/backlog/SUG-{N}-{descriptive-name}.md`.

---

**Linear Issue:** SUG-XX
## UPGRADE NAME: [REQUIRED]

---

## Context [REQUIRED]

> Current version, target version, and why the upgrade is happening.
> List any breaking changes from the migration guide that affect this repo.

---

## Scope [REQUIRED]

> Checklist of changes needed. Every item maps to a file in Files Modified.

- [ ] Update package versions in `package.json`
- [ ] Update config files for new API/syntax
- [ ] Remove deprecated packages/config
- [ ] Re-resolve lockfile (`pnpm install`)
- [ ] Verify startup (zero warnings)
- [ ] Verify build (`pnpm build`)

---

## Non-Goals [REQUIRED]

> What this upgrade explicitly does NOT include (e.g. adopting new features,
> migrating to new APIs that aren't required for compatibility).

---

## Files Modified [REQUIRED]

| File | Action |
|------|--------|
| `path/to/package.json` | UPDATE |
| `path/to/config` | UPDATE |
| `pnpm-lock.yaml` | UPDATE |

---

## Migration Decisions [REQUIRED]

> For each breaking change or deprecated API: document what changed and what
> action was taken (removed, replaced, deferred).

| Old | New / Status | Action |
|-----|-------------|--------|
| `old-package@v1` | Built into core / replaced by X | Removed / Replaced |

---

## Acceptance Criteria [REQUIRED]

> Testable outcomes. Must include startup health and build success.

- [ ] Dev server starts with **zero** warnings related to the upgraded tool
- [ ] Build completes without errors
- [ ] All existing functionality continues to work (stories render, tests pass, etc.)
- [ ] Lockfile committed and pushed

---

## Post-Upgrade Close-Out

> Same as standard epic close-out (CLAUDE.md §Epic close-out sequence):
> commit, move doc, mini-release, update Linear, clean tree.
