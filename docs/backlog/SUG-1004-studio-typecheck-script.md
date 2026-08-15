---
**Epic:** SUG-1004 — apps/studio has no typecheck script
**GitHub Issue:** [#22](https://github.com/bex-sugartown/sugartown/issues/22)
**Status:** Backlog
**Priority:** 🟡 Medium
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-1004 — apps/studio has no typecheck script

## Background

Filed as GitHub issue #22 in February 2026 as "resolve pre-existing TypeScript errors in Studio
schemas" and never done. Rediscovered 2026-08-15 during migration Phase 2.

Measured 2026-08-15: `apps/studio/package.json` has **no `typecheck` script**. The repo-root
`pnpm typecheck` runs via Turbo across packages that define one, so Studio's schema TypeScript
is checked by nothing — not by `pnpm typecheck`, not by pre-commit, not by CI.

This is the same shape as SUG-257 and SUG-258 but a different gate:

| Issue | Package | Missing |
|---|---|---|
| SUG-257 | `apps/studio` | `lint` script — 86 pre-existing problems, measured 2026-07-27 |
| SUG-258 | `apps/web` | lint covers `.js/.jsx` only; 32 `.ts/.tsx` files ungated |
| **SUG-1004** | `apps/studio` | **`typecheck` script** |

All three are "a gate that was assumed to run and does not" — the dominant failure shape in
`docs/ai/agentic-caucus/incident-log.md` (6 of 14 incidents).

## Scope

- [ ] Add a `typecheck` script to `apps/studio/package.json`
- [ ] Run it and count the real error total. Do not estimate it — SUG-255 found CI undercounting
      lint errors 7 vs 84 because `turbo run` stops at the first failing package
- [ ] Fix, or record the count and wire it warn-only with a stated deadline
- [ ] Wire into CI once green
- [ ] Consider closing SUG-257 and SUG-1004 together — same package, same class of gap

## Non-Goals

- SUG-258's `apps/web` TypeScript lint coverage. Related, separately tracked.

## Related

- **GitHub:** [#22](https://github.com/bex-sugartown/sugartown/issues/22)
- SUG-257, SUG-258 — same shape, different packages
