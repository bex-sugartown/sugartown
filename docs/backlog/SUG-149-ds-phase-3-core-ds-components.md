**Linear Issue:** [SUG-149](https://linear.app/sugartown/issue/SUG-149/ds-phase-3-core-ds-components-container-page-stack-columns-surface)

## EPIC SUG-149: DS Phase 3 — Core DS components

**Replaces:** SUG-146 Phases 1–2 + SUG-144 Phase 1
**Depends on:** SUG-148 (all leaf primitives, especially Box)
**Unblocks:** SUG-150 (patterns compose Card and layout primitives)

Three parallel workstreams once Box is confirmed shipped. All gated on SUG-148 completing.

---

## Model & Mode

Use `opusplan` for the pre-execution gate. Sonnet executes.

---

## Pre-Execution Completeness Gate

- [ ] SUG-148 Done — all leaf primitives shipped, Box confirmed in registry
- [ ] SUG-147 drift catalogue reviewed — Container size token names confirmed (`reading`/`detail`/`archive`)
- [ ] Reuse audit for Container, Page, Stack, Columns, Surface, AppShell — grep all 5 layers
- [ ] `container-type` guardrail reviewed before applying to any layout primitive (CLAUDE.md)
- [ ] Token names verified to exist before use; if missing, add to `tokens/source/tokens.json` first
- [ ] Web adapter sync scoped for all new DS components
- [ ] Dark mode treatment documented: Surface elevation tokens; Stack gap tokens

---

## Workstream A — Layout primitives (from SUG-146 Phase 1)

**Decisions already locked (see SUG-146/SUG-147 decision records):**
- `Container` is standalone; `Page` composes it; `Page` carries NO `maxWidth` prop
- `Flex` is folded into `Stack` as a responsive `direction` prop — no standalone Flex
- `Container size` token names: `reading` (760px) / `detail` (1080px) / `archive` (960px) / `bleed` (no constraint)

### Box (verify shipped from SUG-148, then proceed)

### Container
- Standalone primitive built on Box
- Props: `size` (`reading` | `detail` | `archive` | `bleed`), `as`
- `size` maps to `--st-width-*` tokens only — no raw px values
- Full-bleed = `size="bleed"` or no Container wrapper
- Story: `Primitives/Layout/Container` — all size variants side by side

### Page
- Top-level scaffold: gutters + header/main/footer region slots
- Composes `Container` for its content region — does NOT re-implement max-width
- Props: `header`, `main`, `footer` slots; `gutter` (token key)
- Story: `Primitives/Layout/Page`

### Stack
- One-axis spacing with token gap
- Props: `gap` (spacing token key), `direction` (`vertical` | `horizontal`; responsive: `{ base: 'vertical', md: 'horizontal' }`), `align`, `justify`, `wrap`
- `gap` is a spacing-token key only — no raw numbers
- Absorbs `Flex` — there is no standalone Flex primitive
- Story: `Primitives/Layout/Stack` — vertical, horizontal, responsive direction, all gap sizes

### Columns
- N-column split; replaces TwoColumnLayout
- Props: `count` (number), `gap` (spacing token key), `collapse` (breakpoint at which to stack)
- `TwoColumnLayout` becomes `<Columns count={2}>`
- Story: `Primitives/Layout/Columns` — 2-col, 3-col, with collapse

### Surface
- Elevation container built on Box
- Props: `elevation` (0 | 1 | 2 | 3 — maps to shadow tokens), `as`
- Story: `Primitives/Layout/Surface` — all elevation levels, light + dark

### AppShell
- Full UI shell: header region + optional sidebar + main + footer
- Props: `header`, `sidebar`, `main`, `footer` slots; `sidebarWidth` (token key)
- Story: `Primitives/Layout/AppShell`

---

## Workstream B — Card re-codification (from SUG-144 Phase 1)

Re-codify `Card` as a pure container with slots and variants. No domain content of its own.

**Variants:** `elevated` | `listing` | `accent` (accent = 3px left rule + tinted header bg)

**Slots:** `media`, `header`, `body`, `footer`

- Remove any inlined ledger-footer content from Card — expose `footer` slot only
- Remove any container-level CSS that duplicates what Box provides — compose Box
- Stories: `Primitives/Card` — base, listing variant, accent variant, with-media, with-footer, all slots filled
- Web adapter: update `apps/web/src/design-system/components/Card/` to match

**Tile deprecation:**
- Add `console.warn` to `packages/design-system/src/components/Tile/index.ts`: "Tile is deprecated — use Card + Metric/Meter. See SUG-149."
- Do NOT delete yet — deletion happens in SUG-151 after all call sites migrated

---

## Workstream C — Storybook re-bucket (from SUG-146 Phase 2)

Behaviour-neutral — only `title:` strings in story default exports change. Zero logic changes.

- `Header` story: `Layout/Header` → `Regions/Header`
- `Footer` story: `Layout/Footer` → `Regions/Footer`
- `Hero` story: `Layout/Hero` → `Regions/Hero`
- `Preheader` story: `Layout/Preheader` → `Regions/Preheader`
- `MobileNav` story: `Layout/MobileNav` → `Regions/MobileNav`
- `PageSections` story: `Layout/PageSections` → `Patterns/PageSections`
- `TwoColumnLayout` story: DELETE (replaced by `Columns` story)

**Chromatic note:** re-bucketed stories will appear as new stories in Chromatic (new title = new baseline). Review carefully — if any story visually drifted before the rename, this surfaces it. Expected: zero visual changes, only new baselines.

---

## Commit strategy

1. `feat(ds): codify Container, Page, Stack, Columns, Surface, AppShell layout primitives`
2. `refactor(ds): re-codify Card as pure container + slots; deprecate Tile`
3. `refactor(storybook): re-bucket Layout/* → Regions + Patterns`

---

## Files to Modify

**DS layout primitives (create)**
- `packages/design-system/src/components/Container/Container.tsx` + css + `index.ts`
- `packages/design-system/src/components/Page/Page.tsx` + css + `index.ts`
- `packages/design-system/src/components/Stack/Stack.tsx` + css + `index.ts`
- `packages/design-system/src/components/Columns/Columns.tsx` + css + `index.ts`
- `packages/design-system/src/components/Surface/Surface.tsx` + css + `index.ts`
- `packages/design-system/src/components/AppShell/AppShell.tsx` + css + `index.ts`
- `packages/design-system/src/components/Tile/index.ts` — add deprecation warning
- `packages/design-system/src/components/Card/Card.tsx` + `Card.module.css` — MODIFY
- `packages/design-system/src/index.ts` — add new exports

**Web adapters (create/update)**
- `apps/web/src/design-system/components/Container/` — CREATE
- `apps/web/src/design-system/components/Page/` — CREATE
- `apps/web/src/design-system/components/Stack/` — CREATE
- `apps/web/src/design-system/components/Columns/` — CREATE
- `apps/web/src/design-system/components/Surface/` — CREATE
- `apps/web/src/design-system/components/AppShell/` — CREATE
- `apps/web/src/design-system/components/Card/Card.jsx` + css — UPDATE
- `apps/web/src/design-system/index.js` — add exports

**Storybook**
- `apps/storybook/src/stories/Container.stories.jsx` — CREATE
- `apps/storybook/src/stories/Page.stories.jsx` — CREATE
- `apps/storybook/src/stories/Stack.stories.jsx` — CREATE
- `apps/storybook/src/stories/Columns.stories.jsx` — CREATE
- `apps/storybook/src/stories/Surface.stories.jsx` — CREATE
- `apps/storybook/src/stories/AppShell.stories.jsx` — CREATE
- `apps/storybook/src/stories/Card.stories.jsx` — UPDATE (new slots/variants)
- `apps/storybook/src/stories/TwoColumnLayout.stories.jsx` — DELETE
- All region stories — UPDATE `title:` strings
- `PageSections` story — UPDATE `title:` string

**Docs**
- `docs/conventions/component-registry.md` — add layout primitive rows; update Card row

---

## Acceptance Criteria

- [ ] `Container`: `size` prop maps only to `--st-width-*` tokens; no raw px values; Page does NOT carry `maxWidth`
- [ ] `Stack`: `direction` accepts responsive object; `gap` accepts only spacing token keys, no raw numbers
- [ ] `Card`: renders no domain content — only slots + variants; grep confirms no inline ledger-footer content
- [ ] `Tile`: import produces `console.warn`
- [ ] `TwoColumnLayout` story deleted; `Columns` story present
- [ ] Re-bucketed stories: `Regions/` group contains all five landmark regions; `Patterns/` contains PageSections
- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] Storybook: all stories render without console errors on default + dark-pink-moon

---

## Visual QA Gate

Agent prepares: screenshots of Card variants + all layout primitives on default + dark-pink-moon; Chromatic diff reviewed for re-bucketed stories (expected: new baselines only, no visual changes); token compliance grep.

Human gate: "Visual QA approved" before close-out.

---

## Post-Epic Close-Out

1. Visual QA gate — Chromatic review of re-bucketed story baselines
2. Chromatic VRT
3. Audit flips: Container/Page/Stack/Columns/Surface/AppShell/Card → `present`; Flex → synonym pointer to Stack
4. Move `docs/backlog/SUG-149-ds-phase-3-core-ds-components.md` → `docs/shipped/`
5. `/mini-release SUG-149`
6. Transition SUG-149 to Done in Linear
