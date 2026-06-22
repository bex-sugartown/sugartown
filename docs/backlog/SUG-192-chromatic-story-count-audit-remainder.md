---
**Epic:** SUG-192 — Chromatic story count audit — Phase 4 remainder
**Linear Issue:** [SUG-192](https://linear.app/sugartown/issue/SUG-192/chromatic-story-count-audit-phase-4-remainder-callout-tile-scorering)
**Status:** Backlog
**Priority:** 🟡 Medium
**Follows from:** SUG-191
---

# SUG-192 — Chromatic story count audit — Phase 4 remainder

Six components left over from SUG-191 Phase 4 that still exceed the 3-story cap established in `docs/conventions/chromatic-conventions.md`.

## Background

SUG-191 established the convention (one story per named visual variant, Controls for everything else, single `Snapshot (Chromatic)` for VRT) and audited the highest-count files. The six below were deferred at SUG-191 close-out.

## Scope

| Component | File | Current count | Target |
|-----------|------|--------------|--------|
| Callout | `apps/web/src/design-system/components/callout/Callout.stories.tsx` | 7 | 3 |
| Tile (StatCard) | `apps/web/src/design-system/components/tile/Tile.stories.tsx` | 7 | 3 |
| ScoreRing | `apps/web/src/design-system/components/score-ring/ScoreRing.stories.tsx` | 7 | 3 |
| FilterBar | `apps/web/src/design-system/components/filter-bar/FilterBar.stories.tsx` | 5 | 3 |
| Accordion | `apps/web/src/design-system/components/accordion/Accordion.stories.tsx` | 5 | 3 |
| PageSections | `apps/web/src/components/PageSections.stories.tsx` | 11 | TBD — review for docs/snapshot consolidation |

Each file needs a per-story decision. Do not blanket-delete — check whether each story's visual state is covered by an existing story's Controls before removing.

## Convention reference

`docs/conventions/chromatic-conventions.md` §4 — Stories = variants. Props = everything else.

- One story per named visual variant
- States (disabled, loading, error), sizes, edge cases → Controls panel
- Single `Snapshot (Chromatic)` story for VRT
- Dark mode → theme toolbar, not a story export
