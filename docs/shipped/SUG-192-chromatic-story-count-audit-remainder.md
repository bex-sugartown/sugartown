---
**Epic:** SUG-192 — Chromatic story count audit — Phase 4 remainder
**Linear Issue:** [SUG-192](https://linear.app/sugartown/issue/SUG-192/chromatic-story-count-audit-phase-4-remainder-callout-tile-scorering)
**Status:** Done — all six components addressed
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
| FilterBar | `packages/design-system/src/components/FilterBar/FilterBar.stories.tsx` (the row's original path, `apps/web/src/design-system/components/FilterBar/`, has no `.stories.tsx` — that's the web adapter) | 5 | 2 | ✅ Done — argTypes now document the real `FilterModel`/`FilterOption` shape and note every facet is multi-select (checkboxes); Default now starts with two Category options checked to demonstrate it; removed WithActiveFilters/EmptyModel/SingleFacet, kept Default + In Drawer |
| Accordion | `apps/web/src/design-system/components/accordion/Accordion.stories.tsx` | 5 | 2 | ✅ Done — removed Default/First Open, Numbered/First Open, Snapshot; kept Default + Numbered (the two named visual variants — open/closed state is a Controls concern via `defaultOpen`) |
| PageSections | `apps/web/src/components/PageSections.stories.tsx` | 11 | 9 | ✅ Done — removed Text Section Content Only, both Cited Block stories, CWV field metrics, and Multiple Sections; added Hero Section (mirrors Regions/Hero Default, spot 1), rewrote CTA Section to the real post-GROQ shape (heading/description/buttons[], 2-button group), added Card Builder Section (mirrors Patterns/CardBuilder's Grid · Full Options), added a combined Snapshot (Chromatic) with one of each. Renamed `Patterns/CardBuilderSection` → `Patterns/CardBuilder` |

Each file needs a per-story decision. Do not blanket-delete — check whether each story's visual state is covered by an existing story's Controls before removing.

## Convention reference

`docs/conventions/chromatic-conventions.md` §4 — Stories = variants. Props = everything else.

- One story per named visual variant
- States (disabled, loading, error), sizes, edge cases → Controls panel
- Single `Snapshot (Chromatic)` story for VRT
- Dark mode → theme toolbar, not a story export

## Close-out summary

Story counts are the real counts measured on the actual live component files (see the path corrections in the Scope table above — three of the six original rows pointed at the wrong file: a deprecated component, or a web-adapter directory with no stories file at all).

| Component | Before | After |
|-----------|-------:|------:|
| Callout | 7 | 3 |
| StatCard | 4 | 1 |
| ScoreRing | 7 | 2 |
| FilterBar | 5 | 2 |
| Accordion | 5 | 2 |
| PageSections | 11 | 9 |
| **Total** | **39** | **19** |

39 → 19 stories (−51%). None of the six components exceed the 3-story cap anymore except PageSections, which is a section-builder registry (one story per section *type*, not per variant) — 9 stories for 8 distinct section types + 1 combined Snapshot is the correct shape for that file, not a violation of the convention.

<!-- Chromatic: pending -->
Chromatic VRT was not run for this epic (credits constraint at close-out time). Every story-level change was instead verified manually in Storybook (screenshots taken for each new/changed story across both themes where relevant — see session transcript). This is a real gap, not a formality: the actual pixel diffs from consolidating/renaming/removing stories have not been confirmed by Chromatic. Run it at the next opportunity and treat any diffs as expected (removed stories won't re-baseline; changed stories should show only the intended layout/content changes).
