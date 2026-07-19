# SUG-41 — Storybook Upgrade v7 to v10

**Linear Issue:** [SUG-41](https://linear.app/sugartown/issue/SUG-41/storybook-upgrade-storybook-9-10)
**Status:** In progress
**Epic type:** Tooling upgrade

---

## Context

Storybook was pinned to v7.6.10 in `apps/storybook/package.json` since the monorepo baseline. The design system package (`packages/design-system`) has 14 story files and `apps/web` has 1. Storybook 10 was released with all formerly-separate addons (essentials, interactions, links, blocks) absorbed into core.

The upgrade was initiated via `npx storybook@latest upgrade`, which updated the `storybook` CLI binary to v10.3.4 but left the package.json dependencies and config files referencing v7 addon packages that no longer exist.

### Files already modified (retroactive)

- `apps/storybook/package.json` — removed 6 v7 addon packages, pinned `storybook` and `@storybook/react-vite` to `^10.3.4`
- `apps/storybook/.storybook/main.ts` — removed `addons` array (all built-in), removed `docs.autodocs`
- `apps/storybook/.storybook/preview.ts` — type imports updated from `@storybook/react` to `@storybook/react-vite`, removed deprecated `argTypesRegex`
- `pnpm-lock.yaml` — re-resolved (net -4,033 lines)

---

## Objective

Upgrade the Storybook workspace from v7.6.x to v10.3.x. All 15 existing stories render without warnings. Config and dependencies are aligned with Storybook 10's built-in addon architecture.

---

## Scope

- [x] Update `storybook` and `@storybook/react-vite` to `^10.3.4`
- [x] Remove v7 addon packages absorbed into core (`addon-essentials`, `addon-interactions`, `addon-links`, `blocks`, `react`, `testing-library`)
- [x] Remove `addons` array from `main.ts` (all built-in in v10)
- [x] Remove deprecated `argTypesRegex` from `preview.ts`
- [x] Update type imports to `@storybook/react-vite`
- [x] Re-resolve `pnpm-lock.yaml`
- [ ] Verify all 15 stories render without errors or warnings
- [ ] Verify theme decorator still functions (dark, light, dark-pink-moon, light-pink-moon)
- [ ] Verify Storybook builds successfully (`storybook build`)

---

## Non-Goals

- CSF Factories migration (new v10 story format) — deferred, stories still use CSF3
- `@storybook/addon-vitest` integration — available but not required yet
- React 18 to 19 upgrade — separate concern, tracked under SUG-38
- Vite 5 to 7 upgrade — separate concern, tracked under SUG-38
- New component stories — tracked under SUG-38

---

## Files Modified

| File | Action |
|------|--------|
| `apps/storybook/package.json` | UPDATE — deps v7 → v10 |
| `apps/storybook/.storybook/main.ts` | UPDATE — remove addons array |
| `apps/storybook/.storybook/preview.ts` | UPDATE — fix imports, remove deprecated config |
| `pnpm-lock.yaml` | UPDATE — re-resolved |

---

## Acceptance Criteria

- [ ] `pnpm storybook` starts with **zero** "Could not resolve addon" warnings
- [ ] `pnpm storybook` starts with **zero** "unable to find package.json" warnings
- [ ] All 15 stories render in sidebar and display correctly
- [ ] Theme toolbar switches between all 4 themes without errors
- [ ] `storybook build` completes without errors

---

## Migration Decisions

| v7 Package | v10 Status | Action |
|------------|-----------|--------|
| `@storybook/addon-essentials` | Built into core | Removed |
| `@storybook/addon-interactions` | Built into core | Removed |
| `@storybook/addon-links` | Built into core | Removed |
| `@storybook/blocks` | Built into core | Removed |
| `@storybook/react` | Transitive dep of `react-vite` | Removed from direct deps |
| `@storybook/testing-library` | Replaced by built-in `@storybook/test` | Removed (no story files used it) |

---

## Relationship to SUG-38

SUG-38 (Storybook parity & deployment) is the broader epic covering:
- React 18 → 19
- Vite 5 → 7
- 25+ missing component stories
- Deployment to `pinkmoon.sugartown.io`

SUG-41 is a focused sub-scope: the Storybook version upgrade only. It unblocks SUG-38 but does not complete it.

---

*Retroactive epic doc created 2026-04-04 as a post-mortem action item.*
