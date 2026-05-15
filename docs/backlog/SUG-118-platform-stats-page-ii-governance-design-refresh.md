---
**Epic:** SUG-118 — Platform Stats Page II — governance page design refresh
**Linear Issue:** [SUG-118](https://linear.app/sugartown/issue/SUG-118/platform-stats-page-ii-governance-page-design-refresh)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-118 — Platform Stats Page II — governance page design refresh

Implement Claude design-handoff tweaks for `/platform/governance`: rule-dot Chip system, sticky LaneHeader, StatGrid shared chassis, RoadmapTable thead + sticky behaviour, and Linear `labels` → `projects` (product field) data layer rename.

## Background

The `/platform/governance` page shipped in SUG-111/SUG-112 with a functional but rough DS surface — hand-rolled section headers, pink-filled label pills, a stats strip using custom markup, and a roadmap table with no column headers. A design pass (Claude handoff package, 2026-05-15: `Platform Stats Page II.zip`) specifies four tightly-coupled tweaks that tighten the Ledger Tradition / Pink Moon vocabulary:

1. **Chip system** — replace pink-filled pills with a rule-dot chassis; add `<PriorityChip>` sibling.
2. **Section heading hierarchy** — adopt the existing `<SectionLabel>` at all three call sites; add `<LaneHeader>` for roadmap lanes.
3. **Artifacts grid** — drop card chrome; share the `<StatGrid>` chassis with the top stats strip.
4. **Sticky lane sub-header + sticky column header** — `useStickyState` (IntersectionObserver) drives pinned/stuck states with pink lead bar, frosted backdrop, and thead shadow.

Additionally, the roadmap table's `Labels` column is renamed `Projects` and populated from Linear's **product/project** field (not labels), which will align with the `product` field in Sanity content documents.

**Reference implementations** are in `/tmp/platform-stats-ii/design_handoff_governance_tweaks/` (local only — not committed). The interactive prototype is `Platform Stats Page Tweaks.html` in that directory.

## Objective

After this epic, `/platform/governance` uses DS primitives throughout (no hand-rolled section headers, no inline stats markup, no custom priority pills), the roadmap table has a sticky column header and sticky lane headers driven by IntersectionObserver, and the data layer correctly sources project/product names from Linear's project field. New DS components (`PriorityChip`, `LaneHeader`, `StatGrid`, `useStickyState`) are added to `packages/design-system` with Storybook stories. The `Chip` component is refactored to the rule-dot chassis.

Layers touched: DS components, DS tokens, web page (`GovernancePage`), Linear stats collector (`linear.js`), Storybook stories.

## Scope

### Phase 1 — Tokens + DS primitives

- [ ] Add chip taxonomy dot tokens, project chip dot tokens, priority swatch tokens, and two sticky-shadow composites to `tokens/source/tokens.json` (via `pnpm tokens:build`) — tokens layer
- [ ] Refactor `<Chip>` to rule-dot chassis: transparent fill, `1px solid var(--st-color-rule-accent)` border, 6 px circular dot, IBM Plex Mono 10.5px/600/0.08em tracking/uppercase. New `kind` prop replaces `status`/`variant`. Find-replace all call sites — DS layer
- [ ] Add `<PriorityChip level="high|medium|low|none">` — same chassis, no border, 8 px square swatch, label HIGH/MEDIUM/LOW/NO PRIORITY — DS layer
- [ ] Add `<LaneHeader label count>` component with `useStickyState` wired internally — sticky at `top: 0; z-index: 4`; pinned state: 2 px pink lead bar, pink label text, `rgba(248,248,250,0.92)` frosted backdrop, `var(--st-shadow-subhead-pinned)`, `PINNED` badge fades in — DS layer
- [ ] Add `useStickyState(ref)` hook — 0-height sentinel + IntersectionObserver, returns `'default' | 'pinned'` — DS layer
- [ ] Add `<StatGrid columns={3|4}>` + `<StatGridCell label value signal? href? foot?>` — ruled cell grid chassis, `foot` slot for artifact mode with dashed top-rule — DS layer
- [ ] Add `level?: 'h2'|'h3'|'h4'` prop to `<SectionLabel>` defaulting to `h2` — DS layer (no visual change)

### Phase 2 — RoadmapTable + data layer

- [ ] Add `<thead>` to `<RoadmapTable>`: columns `ID · Title · Status · Priority · Projects`; `position: sticky; top: 38px`; `data-thead-stuck` attribute driven by `useStickyState` with `rootMargin: "-38px 0px 0px 0px"` — frontend layer
- [ ] Update `apps/web/scripts/stats/linear.js`: expose `projects` field per issue (Linear `team(id:).issues.nodes.projectName` or equivalent) in addition to existing fields — tooling layer
- [ ] Update `RoadmapTable` data contract: replace `labels: string[]` with `projects: { name: string; chipKind: ChipKind }[]`; add chip-kind mapping table keyed to known project names — frontend layer
- [ ] Rename `Labels` column to `Projects` in table header and render `<Chip kind="proj-*">` per project — frontend layer

### Phase 3 — GovernancePage call sites

- [ ] Replace all three hand-rolled `<header>` section bars with `<SectionLabel number label title meta level="h3">` — frontend layer
- [ ] Replace top stats strip with `<StatGrid columns={4}><StatGridCell …/></StatGrid>` — frontend layer
- [ ] Replace 3-up artifact card grid with `<StatGrid columns={4}>` with `foot` slot per cell — frontend layer
- [ ] Replace lane `<div>IN PROGRESS · N epics</div>` with `<LaneHeader label count>` — frontend layer
- [ ] Wrap each lane's `<RoadmapTable>` in an `overflow-y: auto` scroll container so `position: sticky` works — frontend layer
- [ ] Replace all pink-filled label pills with `<Chip kind=…>` — frontend layer
- [ ] Replace priority text/pills with `<PriorityChip level=…>` — frontend layer

### Phase 4 — Storybook + visual QA

- [ ] Update `Chip.stories.tsx`: full kind palette (taxonomy + project) + chips-in-table story — Storybook layer
- [ ] Add `PriorityChip.stories.tsx`: 4-level grid + in-table example — Storybook layer
- [ ] Add `LaneHeader.stories.tsx`: default + pinned states, `min-height: 200vh` interactive scroll story — Storybook layer
- [ ] Add `StatGrid.stories.tsx`: stats variant (4-col) + artifacts variant (4-col with `foot`) — Storybook layer
- [ ] Add `RoadmapTable.stories.tsx`: stuck thead variant — Storybook layer
- [ ] Visual QA against prototype in light + dark Pink Moon themes — frontend layer

## Phases

**Phase 1** — Tokens + DS primitives (new components, Chip refactor). Ships as a DS update with no GovernancePage changes yet.

**Phase 2** — RoadmapTable thead + data layer (projects field from Linear).

**Phase 3** — GovernancePage call sites (adopt new DS components throughout).

**Phase 4** — Storybook stories + visual QA. Chromatic run required before close-out.

Close-out: single mini-release after Phase 4.

## Acceptance criteria

- [ ] `<Chip kind="ds">` renders with transparent fill, rule-accent border, 6 px pink dot, no pink background fill
- [ ] `<PriorityChip level="high">` renders HIGH with pink square swatch, no border; `level="none"` renders dashed outline swatch
- [ ] `<LaneHeader>` pins when scrolled past viewport top — lead bar becomes 2 px pink, `PINNED` badge fades in within 200 ms
- [ ] Only one `<LaneHeader>` is in pinned state at a time during fast scroll
- [ ] Roadmap table `<thead>` is sticky at `top: 38px`; picks up `var(--st-shadow-thead-stuck)` when rows scroll beneath it
- [ ] Roadmap table `Projects` column renders `<Chip kind="proj-*">` populated from Linear project field (not labels)
- [ ] Top stats strip and artifacts row are both rendered via `<StatGrid>` — shared chassis confirmed by inspection
- [ ] All three governance section headers use `<SectionLabel level="h3">`
- [ ] Zero token validator errors after token additions (`pnpm validate:tokens`)
- [ ] Zero hardcoded color values (`pnpm validate:tokens --strict-colors`)
- [ ] Chromatic: no unintended visual regressions in light or dark Pink Moon theme

## Technical notes

- **Phase 0 mock gate:** The interactive prototype `Platform Stats Page Tweaks.html` (local: `/tmp/platform-stats-ii/design_handoff_governance_tweaks/`) serves as the Phase 0 mock. Open it in a browser before implementation. Visual QA table comparing prototype vs implementation is required before close-out.
- **Chip breaking change:** `status`/`variant` prop API changes to `kind`. Run `grep -r '<Chip' apps/web/src packages/design-system/src` at activation to find all call sites before refactoring.
- **Token additions are additive only** — safe to land on main without a feature flag.
- **Sticky requires scroll container:** `position: sticky` on `<LaneHeader>` and `<thead>` only works if the nearest scrollable ancestor is `overflow: auto/scroll`. The governance page currently has no explicit scroll container — one must be added wrapping each lane's table. Audit `GovernancePage.jsx` and its parent layout at activation.
- **`useStickyState` sentinel pattern:** inserts a 0-height `<div>` immediately before the sticky element. Must be removed on unmount. Reference: `/tmp/platform-stats-ii/design_handoff_governance_tweaks/components/useStickyState.example.ts`.
- **Linear `projects` field:** activation audit — run `grep -r 'labels' apps/web/scripts/stats/linear.js apps/web/src/components/RoadmapTable` to find all references before renaming.
- **Chip-kind mapping table:** project names from Linear ("Pink Moon", "Design System", "Reporting", etc.) need a hardcoded map to `proj-*` chip kinds. Define in `RoadmapTable.jsx` or a shared `chipKindMap.js` in `lib/`. Map should be the single source of truth — do not duplicate in Storybook fixtures.
- **Activation audits:**
  - Read `packages/design-system/src/components/Chip/` before refactoring — note current prop API.
  - Read `apps/web/src/components/RoadmapTable.jsx` (or wherever it lives) before adding thead.
  - Read `apps/web/src/pages/platform/GovernancePage.jsx` before replacing call sites.
  - Read `apps/web/scripts/stats/linear.js` before adding projects field.
- **Model recommendation:** `/model sonnet` — targeted component + page work, no schema changes.

### New token block (add to `tokens/source/tokens.json`)

```json
"chip-dot-ds":             "{color.pink}",
"chip-dot-design":         "{color.maroon}",
"chip-dot-schema":         "{color.sky-700}",
"chip-dot-infra":          "{color.midnight-500}",
"chip-dot-content":        "{color.seafoam-700}",
"chip-dot-ux":             "{color.lime-700}",
"chip-dot-bug":            "{color.crimson-500}",
"chip-dot-epic":           "{color.violet-600}",
"chip-dot-seo":            "{color.amber-700}",
"chip-dot-proj-pinkmoon":  "{color.pink}",
"chip-dot-proj-ds":        "{color.maroon}",
"chip-dot-proj-studio":    "{color.sky-700}",
"chip-dot-proj-reporting": "{color.amber-700}",
"chip-dot-proj-shopify":   "{color.lime-700}",
"chip-dot-proj-content":   "{color.seafoam-700}",
"chip-dot-proj-platform":  "{color.midnight-500}",
"chip-dot-proj-search":    "{color.violet-600}",
"chip-dot-proj-shop":      "{color.orange-500}",
"pri-high":                "{color.pink}",
"pri-med":                 "{color.amber-450}",
"pri-low":                 "{color.softgrey-400}"
```

Shadow composites are hand-authored in `theme.pink-moon.css` (not generated):
```css
--st-shadow-thead-stuck:
  inset 0 -1px 0 var(--st-color-ink),
  0 8px 12px -8px rgba(13, 18, 38, 0.30);

--st-shadow-subhead-pinned:
  0 1px 0 var(--st-color-rule-accent),
  0 8px 16px -10px rgba(13, 18, 38, 0.10);
```

## Non-Goals

- Linear deep-links from SUG-IDs in the ID column (flagged in handoff as next iteration).
- Empty-state for the In Progress lane (flagged as open question — deferred).
- `defineProjectChip()` builder for new projects (flagged in handoff — deferred post-launch).
- Changes to any other platform page — GovernancePage only.
- Sanity schema changes (the `product` field alignment is a data-layer rename in the collector, not a new schema field).

## Related

- **Linear:** [SUG-118](https://linear.app/sugartown/issue/SUG-118/platform-stats-page-ii-governance-page-design-refresh)
- **Design reference (local only):** `/tmp/platform-stats-ii/design_handoff_governance_tweaks/Platform Stats Page Tweaks.html`
- **Reference implementations (local only):** `/tmp/platform-stats-ii/design_handoff_governance_tweaks/components/`
- **Parent platform epic:** SUG-111 (Platform IA Phase II) — shipped v0.23.22
- **Epic template:** `docs/epic-template.md`
