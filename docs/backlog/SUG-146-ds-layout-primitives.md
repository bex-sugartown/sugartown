**Linear Issue:** [SUG-146](https://linear.app/sugartown/issue/SUG-146/ds-epic-3-layout-primitives-codify)

## EPIC SUG-146: DS Epic 3 — Layout primitives & Storybook re-bucketing

**Source:** Component Naming Audit handoff — `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/docs/layout-primitives.md`

**Dependency:** SUG-144 (Card/Tile) should land before Phase 3 region recomposition, since regions compose layout primitives that build on `Box`. SUG-144 Phase 0 (`Box` if extracted there) must complete first.

**Note:** `Box` is the critical-path unlocker — codify it first. Everything else composes it.

---

## Model & Mode

Use `opusplan` for planning phases. Sonnet executes from Files to Modify onward.

---

## Pre-Execution Completeness Gate

- [ ] Phase 0 drift audit completed before any primitive is codified (grep for hand-rolled flex/grid/max-width/elevation across content layouts; catalogue variants)
- [ ] DECISION-NEEDED resolved: `Flex` — codify as a standalone primitive, or fold into `Stack` (which handles both axes)? Check audit note + Radix/Atlassian precedent.
- [ ] DECISION-NEEDED resolved: `Container` — standalone primitive or a prop/variant of `Page`? Confirm before Phase 1.
- [ ] Current `TwoColumnLayout` call-sites catalogued: `grep -r "TwoColumnLayout" apps/web/src/`
- [ ] Current `Layout/*` Storybook entries listed before Phase 2 re-bucketing
- [ ] Token audit: all new component CSS uses `--st-*` tokens only; `pnpm validate:tokens --strict-colors` green
- [ ] Dark mode treatment documented for Surface and Box (elevation tokens)
- [ ] Web adapter sync scoped for each new DS primitive
- [ ] Atomic Reuse Gate: confirm no existing equivalent for Box, Page, Stack, Flex, Columns, Surface, AppShell across all 5 layers

---

## Context

The Storybook `Layout/*` group contains no layout primitives. It holds:

| Entry | What it actually is |
|-------|---------------------|
| `Header` | Region — `banner` landmark |
| `Footer` | Region — `contentinfo` landmark |
| `Hero` | Region — page intro composite |
| `Preheader` | Region — metadata strip |
| `MobileNav` | Region — `navigation` landmark |
| `PageSections` | Orchestrator — maps `sections[]` → components |
| `TwoColumnLayout` | Config baked into a name — "two column" is `Columns count={2}` |

Real layout primitives (the boxes and arrangement mechanics) are buried inside these components as hand-rolled CSS. The audit's To-codify rows: **Box · Page · Container · AppShell · Surface · Stack · Flex** (plus existing **Grid**, **Columns** replacing TwoColumnLayout).

Audit rows in play:

| Component | Audit status | Action |
|-----------|-------------|--------|
| Box | To codify | Token-aware style base; unblocks others |
| Page | To codify | Width / gutters / regions wrapper |
| Container | To codify | Max-width centering (or fold into Page) |
| AppShell | To codify | UI shell / Frame |
| Surface | To codify | Elevation container |
| Stack | To codify | 1-axis spacing |
| Flex | To codify | Flex wrapper (or fold into Stack) |
| Columns | To codify | N-column split; replaces TwoColumnLayout |
| TwoColumnLayout | Diverges | Retire → `Columns count={2}` |
| Grid | In system | Existing; keep |

---

## Objective

After this epic: `Primitives/Layout` in Storybook contains only arrangement mechanics (Box, Page, Container, Stack, Columns, Grid, Surface, AppShell) with no content or use-case names. The old `Layout` group is gone — its entries live under `Regions` (Header, Footer, Hero, Preheader, MobileNav) or `Patterns` (PageSections, DetailLayout). `TwoColumnLayout` is deleted; usages become `Columns count={2}`. Each Region composes layout primitives instead of hand-rolling flex/grid CSS. The drift catalogue from Phase 0 resolves to one token/primitive per concept.

No data layer, query layer, or route changes.

---

## Doc Type Coverage Audit

No Sanity schema changes.

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | No section builder changes |
| `article` | No | No section builder changes |
| `caseStudy` | No | No section builder changes |
| `node` | No | No section builder changes |
| `archivePage` | No | No section builder changes |

---

## Schema Field Proposal

N/A — no Sanity schema changes.

---

## Scope

### Phase 0 — Drift audit (MUST complete before codifying)

- [ ] `grep -rn "display: flex\|display: grid\|max-width:\|box-shadow:" apps/web/src/ packages/design-system/src/` — catalogue variants
- [ ] Record findings: how many distinct flex patterns? How many column-gap values? How many elevation shadows?
- [ ] Output a drift catalogue: "5 distinct flex contexts → candidate for Stack/Flex primitive"; "3 shadow variants → candidate for Surface tokens"
- [ ] Present catalogue before Phase 1 begins — this sizes the real work and prevents codifying a primitive that just re-bakes drift

### Phase 1 — Codify layout primitives (dependency order: Box first)

- [ ] `packages/design-system/src/components/Box/` — token-aware style base; all spacing/color/radius props map to `--st-*` tokens. Story: `Primitives/Layout/Box`. Registry row.
- [ ] `packages/design-system/src/components/Page/` — width + gutters + region container (wraps content at `--st-width-*`). Story + registry.
- [ ] `packages/design-system/src/components/Container/` — max-width centering; or: verify it folds into Page as a prop. Decision must be made before Phase 1.
- [ ] `packages/design-system/src/components/Stack/` — 1-axis spacing (`direction`, `gap` props mapping to `--st-space-*`). Story + registry.
- [ ] `packages/design-system/src/components/Columns/` — N-column split (`count`, `gap` props). `TwoColumnLayout` becomes `Columns count={2}`. Story + registry.
- [ ] `packages/design-system/src/components/Surface/` — elevation container (`elevation` prop mapping to shadow tokens). Story + registry.
- [ ] `packages/design-system/src/components/AppShell/` — UI shell / frame; header + sidebar + main + footer regions. Story + registry.
- [ ] `Flex` — if standalone: `packages/design-system/src/components/Flex/`. If folded into Stack: add `direction` prop to Stack. Decision from DECISION-NEEDED.
- [ ] Web adapter for each new primitive
- [ ] `pnpm validate:tokens --strict-colors` green for each

### Phase 2 — Re-bucket Storybook (behaviour-neutral)

- [ ] Move `Header`, `Footer`, `Hero`, `Preheader`, `MobileNav` stories → `Regions` group
- [ ] Move `PageSections` story → `Patterns` (or `Renderers`)
- [ ] Retitle the old `Layout` group — nothing called "Layout" should contain content-bound components
- [ ] No component logic changes in this phase; only story `title:` strings

### Phase 3 — Recompose regions onto the primitives

- [ ] Refactor each Region to compose `Page`/`Grid`/`Stack`/`Surface` instead of bespoke layout CSS
- [ ] Replace `TwoColumnLayout` usages with `Columns` (or `DetailLayout` pattern if it has reading-rail semantics)
- [ ] Delete duplicated layout CSS as each region is migrated
- [ ] `DetailLayout` pattern if needed: `Columns count={2}` with reading-rail + sidebar semantics

### Phase 4 — Close out

- [ ] Registry rows for all new layout primitives; Regions/Patterns reclassified
- [ ] Audit flips: Box/Page/Stack/Flex(+Stack)/Columns/Surface/AppShell → In system; TwoColumnLayout → retired
- [ ] Drift catalogue from Phase 0 resolved: confirm one token/primitive per concept

---

## Query Layer Checklist

Not applicable — no GROQ changes.

---

## Non-Goals

- No Sanity schema changes
- No new routes or page templates
- `DetailLayout` is in scope only if `TwoColumnLayout` has reading-rail semantics that require a named pattern; otherwise it's `Columns count={2}` with no new component
- `imageGallery` / carousel — tracked in SUG-98
- Toolbar extraction from FilterBar — Epic 5 (SUG stragglers)

---

## Technical Constraints

- **Box is the foundation**: `Page`, `Container`, `Surface`, and others all build on `Box`. Codify Box before touching the others.
- Tokens only; no raw hex/rgba in any component CSS. `pnpm validate:tokens --strict-colors` must pass.
- `container-type: inline-size` guardrail (CLAUDE.md): before applying to any layout primitive, verify it does not conflict with `margin: auto` or flex-grow negotiation.
- Web adapter sync mandatory for each new DS primitive.
- Phase 2 Storybook re-bucketing is a `title:` string change only — zero logic changes. If a story's `default` export `title` changes, Chromatic will diff it as a new story; document this in the Chromatic review.
- `TwoColumnLayout` deprecation: one minor with console.warn, then delete. Codemod all usages in the same PR.

**DECISION-NEEDED items:**
1. `Flex` standalone vs folded into `Stack` as `direction` prop — resolve at Phase 0 output
2. `Container` standalone vs `Page` prop — resolve before Phase 1

---

## Files to Modify

**DS primitives (create)**
- `packages/design-system/src/components/Box/Box.tsx` — CREATE
- `packages/design-system/src/components/Box/Box.module.css` — CREATE
- `packages/design-system/src/components/Box/index.ts` — CREATE
- `packages/design-system/src/components/Page/Page.tsx` — CREATE
- `packages/design-system/src/components/Page/Page.module.css` — CREATE
- `packages/design-system/src/components/Page/index.ts` — CREATE
- `packages/design-system/src/components/Container/` — CREATE (or add prop to Page)
- `packages/design-system/src/components/Stack/Stack.tsx` — CREATE
- `packages/design-system/src/components/Stack/Stack.module.css` — CREATE
- `packages/design-system/src/components/Stack/index.ts` — CREATE
- `packages/design-system/src/components/Columns/Columns.tsx` — CREATE
- `packages/design-system/src/components/Columns/Columns.module.css` — CREATE
- `packages/design-system/src/components/Columns/index.ts` — CREATE
- `packages/design-system/src/components/Surface/Surface.tsx` — CREATE
- `packages/design-system/src/components/Surface/Surface.module.css` — CREATE
- `packages/design-system/src/components/Surface/index.ts` — CREATE
- `packages/design-system/src/components/AppShell/AppShell.tsx` — CREATE
- `packages/design-system/src/components/AppShell/AppShell.module.css` — CREATE
- `packages/design-system/src/components/AppShell/index.ts` — CREATE
- `packages/design-system/src/components/Flex/` — CREATE (if standalone decision)
- `packages/design-system/src/index.ts` — add new exports
- `packages/design-system/src/components/TwoColumnLayout/index.ts` — MODIFY (deprecation warning)

**Web adapters**
- `apps/web/src/design-system/components/Box/` — CREATE
- `apps/web/src/design-system/components/Page/` — CREATE
- `apps/web/src/design-system/components/Stack/` — CREATE
- `apps/web/src/design-system/components/Columns/` — CREATE
- `apps/web/src/design-system/components/Surface/` — CREATE
- `apps/web/src/design-system/components/AppShell/` — CREATE
- `apps/web/src/design-system/index.js` — add exports

**Web patterns**
- `apps/web/src/components/TwoColumnLayout.jsx` — MODIFY (deprecation) then DELETE
- `apps/web/src/components/DetailLayout.jsx` — CREATE (if needed)
- Region components — MODIFY (recompose onto layout primitives)

**Storybook**
- `apps/storybook/src/stories/Box.stories.jsx` — CREATE
- `apps/storybook/src/stories/Page.stories.jsx` — CREATE
- `apps/storybook/src/stories/Stack.stories.jsx` — CREATE
- `apps/storybook/src/stories/Columns.stories.jsx` — CREATE
- `apps/storybook/src/stories/Surface.stories.jsx` — CREATE
- `apps/storybook/src/stories/AppShell.stories.jsx` — CREATE
- Existing region stories — MODIFY `title:` to `Regions/...`
- `PageSections` story — MODIFY `title:` to `Patterns/...`
- `TwoColumnLayout` story — DELETE

**Docs**
- `docs/conventions/component-registry.md` — UPDATE

---

## Deliverables

1. Drift catalogue from Phase 0 (documented, not just done in memory)
2. Box, Page, Stack, Columns, Surface, AppShell — DS primitive + web adapter + Storybook story + registry row for each
3. Flex or Stack `direction` prop — decision recorded + implemented
4. `Primitives/Layout` Storybook group contains only mechanics
5. `Regions` Storybook group contains Header, Footer, Hero, Preheader, MobileNav
6. `Patterns` Storybook group contains PageSections (+ DetailLayout if created)
7. `TwoColumnLayout` retired; all usages replaced with `Columns`

---

## Acceptance Criteria

- [ ] `Primitives/Layout` in Storybook contains only mechanics — no content, no use-case names, no column counts
- [ ] The old `Layout` group no longer exists (all entries re-bucketed)
- [ ] No Region or Pattern hand-rolls flex/grid/max-width/elevation — they compose layout primitives
- [ ] `TwoColumnLayout` deleted; `grep -r "TwoColumnLayout" apps/web/src/` returns nothing
- [ ] Drift catalogue from Phase 0 is resolved: one token/primitive per concept
- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] Storybook: all new layout primitive stories render without console errors; dark-pink-moon theme verified
- [ ] Phase 2 Chromatic diff shows only story title renames (no visual change) for re-bucketed Region stories

---

## Visual QA Gate

Agent prepares:
1. Storybook screenshots of each new primitive (default + dark-pink-moon)
2. Before/after for re-bucketed stories — confirm visual parity (Phase 2 should be zero visual change)
3. Token compliance grep: zero hardcoded values in new CSS files
4. At least 2 routes spot-checked with regions recomposed onto layout primitives

Human gate: wait for "Visual QA approved" before close-out.

---

## Risks / Edge Cases

- Phase 0 drift audit may reveal more or fewer distinct layout patterns than expected — scope may need adjustment.
- Phase 2 Storybook re-bucketing will create new Chromatic baselines for renamed stories. Review carefully — if a story visually drifted and was never caught, the rename surfaces it.
- `TwoColumnLayout` usages in Sanity Studio (if any) are out of scope — check if it's used as a section type vs a web component only.
- Region recomposition in Phase 3 is the highest risk phase — regression-test all page templates after each region refactor.

---

## Post-Epic Close-Out

1. Visual QA gate — produce comparison table; wait for "Visual QA approved"
2. Chromatic VRT — run; review re-bucketing diffs + any unexpected visual changes
3. Flip audit rows: Box/Page/Stack/Columns/Surface/AppShell → `present`; Flex → `present` or recorded as folded into Stack; TwoColumnLayout → retired
4. Move `docs/backlog/SUG-146-ds-layout-primitives.md` → `docs/shipped/`
5. `/mini-release SUG-146`
6. Transition SUG-146 to Done in Linear
