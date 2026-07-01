---
**Epic:** SUG-192 — Chromatic story count audit — Phase 4 remainder
**Linear Issue:** [SUG-192](https://linear.app/sugartown/issue/SUG-192/chromatic-story-count-audit-phase-4-remainder-callout-tile-scorering)
**Status:** In Progress (Callout done, StatCard docs/footer done, ScoreRing done, 3 components remaining)
**Priority:** 🟡 Medium
**Follows from:** SUG-191
---

# SUG-192 — Chromatic story count audit — Phase 4 remainder

Six components left over from SUG-191 Phase 4 that still exceed the 3-story cap established in `docs/conventions/chromatic-conventions.md`.

## Background

SUG-191 established the convention (one story per named visual variant, Controls for everything else, single `Snapshot (Chromatic)` for VRT) and audited the highest-count files. The six below were deferred at SUG-191 close-out.

## Scope

| Component | File | Current count | Target | Status |
|-----------|------|--------------|--------|--------|
| Callout | `apps/web/src/design-system/components/callout/Callout.stories.tsx` | 7 | 3 | ✅ Done — merged redundant `default`/`info` variants (CSS-identical), migrated 9 live Sanity docs default→info, removed `default` from `calloutSection` schema |
| ~~Tile (StatCard)~~ → StatCard | `apps/web/src/components/StatCard.stories.jsx` (the live pattern — `apps/web/src/design-system/components/tile/Tile.stories.tsx` is the deprecated `Legacy/Tile` component, out of scope, still 7 stories, see SUG-149) | 4 | 1 | ✅ Done — added `tags:['autodocs']` + argTypes/options for every prop, `evidenceType` (last field on `outcomeItem`) now renders via StatCard's `foot` (bottom-aligned footer, matches Card/ContentCard) instead of `chip`, consolidated Minimal Value/With Trend/Loading into one Default story with all fields populated |
| ScoreRing | `packages/design-system/src/components/ScoreRing/ScoreRing.stories.tsx` (the row's original path, `apps/web/src/design-system/components/score-ring/`, has no `.stories.tsx` — that dir is the web adapter, undocumented) | 7 | 2 | ✅ Done — `good` (score 96) promoted to meta-level `args` as the `Default` story; removed Warn/Poor/BoundaryEdge/LargeSize/NoLabel (all covered by the `score`/`category` Controls); kept `All three categories` |
| FilterBar | `apps/web/src/design-system/components/filter-bar/FilterBar.stories.tsx` | 5 | 3 | ⏳ Pending |
| Accordion | `apps/web/src/design-system/components/accordion/Accordion.stories.tsx` | 5 | 3 | ⏳ Pending |
| PageSections | `apps/web/src/components/PageSections.stories.tsx` | 11 | TBD — review for docs/snapshot consolidation | ⏳ Pending |

Each file needs a per-story decision. Do not blanket-delete — check whether each story's visual state is covered by an existing story's Controls before removing.

## Convention reference

`docs/conventions/chromatic-conventions.md` §4 — Stories = variants. Props = everything else.

- One story per named visual variant
- States (disabled, loading, error), sizes, edge cases → Controls panel
- Single `Snapshot (Chromatic)` story for VRT
- Dark mode → theme toolbar, not a story export
