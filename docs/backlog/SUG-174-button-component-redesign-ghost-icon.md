---
**Epic:** SUG-174 — Button component redesign — sharp rectangle, ghost variant, icon support
**Linear Issue:** [SUG-174](https://linear.app/sugartown/issue/SUG-174/button-component-redesign-sharp-rectangle-ghost-variant-icon-support)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-174 — Button component redesign — ghost variant + icon support

The DS Button currently ships three fill variants (primary pink, secondary lime, tertiary neutral) each with the "Baseline Rule" 3px bottom-border lift treatment from SUG-116. There is no ghost/outline variant, and no icon slot. Bespoke button CSS has already proliferated (e.g. `filterDrawerClearBtn` / `filterDrawerDoneBtn` in `pages.module.css` for SUG-173) because the DS primitive can't express the simple flat-rectangle style. This epic adds the ghost variant and icon support, then migrates bespoke button surfaces back to the DS primitive.

## Background

**Current state:** `Button.jsx` (web adapter) + `Button.tsx` (DS primitive) expose `variant: primary | secondary | tertiary` and `size: sm | md | lg`. All variants use the Baseline Rule (3px bottom border, hover lift -3px). No ghost/outline variant exists. No icon slot exists. The existing `secondary` variant is lime fill — not ghost.

**Why now:** The SUG-173 FilterBar drawer footer introduced `filterDrawerClearBtn` (1px border, transparent bg, muted text) and `filterDrawerDoneBtn` (brand fill, simpler than the Baseline Rule primary) as bespoke CSS in `pages.module.css`. The user identified these as the approved visual direction. The pattern will recur — every new surface that needs a secondary action will create another bespoke button.

**Reference surfaces:** `apps/web/src/pages/pages.module.css` (SUG-173 bespoke buttons), `apps/web/src/design-system/components/Button/Button.module.css`, `packages/design-system/src/components/Button/Button.module.css` (must stay byte-identical per mirrored file registry), DS Storybook `Button` story.

## Objective

After this epic: the DS Button has a `ghost` variant (1px all-round border, transparent background, no 3px rule, no hover lift) and an `icon` prop slot (renders an SVG child left or right of the label). All bespoke button CSS introduced in SUG-173 (`filterDrawerClearBtn`, `filterDrawerDoneBtn`) is removed from `pages.module.css` and replaced with DS Button calls. Both `Button.module.css` files (web adapter + DS package) are updated in sync. A Phase 0 mock locks the ghost visual treatment before any CSS is written.

Layers touched: DS component CSS · web adapter CSS · DS package CSS · `ArchivePage.jsx` (bespoke button migration) · Storybook stories. Sanity schema, GROQ, and content not touched.

## Scope

- [ ] **Phase 0 mock** — `docs/drafts/SUG-174-button-ghost-icon-mock.html` showing: ghost variant in all three sizes, ghost active/hover states, icon-left and icon-right layouts, ghost alongside primary (as in the drawer footer). Hard stop — no CSS until approved.
- [ ] **`ghost` variant** — added to both `Button.module.css` files: 1px solid `--st-color-border-medium`, transparent bg, `--st-color-text-muted` text, no border-bottom 3px rule, no hover lift. Hover: border-color → `--st-color-text-default`, color → `--st-color-text-default` — layer: DS component CSS
- [ ] **`icon` prop** — optional `icon` prop (ReactNode) and `iconPosition: 'left' | 'right'` (default `'left'`). Renders icon inline in the existing `gap: var(--st-space-2)` flex row — layer: DS component JSX (web adapter + DS package TSX)
- [ ] **`filterDrawerClearBtn` + `filterDrawerDoneBtn` migration** — remove bespoke classes from `pages.module.css`, replace with `<Button variant="ghost">Clear all</Button>` and `<Button variant="primary">Done</Button>` in `ArchivePage.jsx` — layer: frontend
- [ ] **Storybook story update** — add ghost variant story, icon story, ghost+primary side-by-side story to `Button.stories.tsx` — layer: Storybook
- [ ] **`pnpm validate:tokens --strict-colors` passes** — no hardcoded colours in new ghost CSS

## Phases

Single close-out — all items ship together on one branch.

Logical sequence within the branch:
1. Phase 0 mock (hard stop)
2. Ghost CSS + icon JSX (both files in sync)
3. Bespoke button migration in ArchivePage
4. Storybook stories
5. Validate + commit

## Acceptance criteria

- [ ] Phase 0 mock approved before any CSS is written
- [ ] `<Button variant="ghost">` renders with 1px border, transparent bg, no 3px bottom rule, no hover lift — confirmed in Storybook
- [ ] `<Button variant="ghost" icon={<SomeIcon />}>` renders icon left of label at correct size and gap
- [ ] `iconPosition="right"` renders icon right of label
- [ ] `filterDrawerClearBtn` and `filterDrawerDoneBtn` CSS classes deleted from `pages.module.css` — `pnpm validate:tokens` still passes
- [ ] ArchivePage drawer footer uses DS Button for both Clear all and Done
- [ ] Desktop and mobile archive pages render drawer footer correctly after migration
- [ ] Both `Button.module.css` files byte-identical (web adapter + DS package) — `pnpm validate:style-mirror` passes
- [ ] `pnpm validate:tokens --strict-colors` passes — zero hardcoded colour violations
- [ ] Storybook story renders ghost, icon-left, icon-right, ghost+primary pair without console errors
- [ ] Dark mode (`dark-pink-moon` theme) reviewed for ghost variant — confirmed or ghost dark-mode override added

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach (Button is rendered on Header, Hero, Form, PageSections CTA blocks, SchemaERD — check all callsites), and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

**No schema changes.** No Sanity content changes. No GROQ changes.

**Mirrored file constraint:** `Button.module.css` exists in both `apps/web/src/design-system/components/Button/` and `packages/design-system/src/components/Button/`. Both must be updated identically in the same commit — `pnpm validate:style-mirror` enforces this. Write the change once, copy to both, confirm byte-identical before committing.

**Icon sizing:** The DS Button uses `font-size: 0.72rem` (md). Icon SVGs should be sized to `1em` to inherit the text scale at each size variant. Do not hardcode pixel sizes.

**Ghost dark mode:** The existing tertiary variant has a `[data-theme="dark-pink-moon"]` override block. Check whether ghost needs the same. Minimum: verify contrast on the dark canvas is acceptable before close-out.

**Bespoke CSS intentionally left in place until this epic ships.** `filterDrawerClearBtn` and `filterDrawerDoneBtn` in `pages.module.css` are the correct implementation for SUG-173 — the DS Button has no ghost variant yet. Do not migrate them before the ghost variant exists. Migration is the close-out step of this epic, not a pre-condition.

**Bespoke button audit (at migration time):** Before deleting `filterDrawerClearBtn` and `filterDrawerDoneBtn` from `pages.module.css`, grep for any other callers in case the classes were reused:
```bash
grep -rn "filterDrawerClearBtn\|filterDrawerDoneBtn" apps/web/src
```
Expected: one caller each (`ArchivePage.jsx`). If more are found, migrate all before deleting the classes.

**Model & Mode:** `/model opusplan` — Opus plans the ghost token + CSS decisions and icon API shape, Sonnet executes after plan-mode exit.

## Non-Goals

- Does not change the primary, secondary, or tertiary variant visuals (Baseline Rule stays)
- Does not add animated icon transitions
- Does not redesign the hover lift behaviour on existing variants
- Does not add a `danger` or `destructive` variant
- Does not touch Button's link/router rendering logic

## Related

- **Linear:** [SUG-174](https://linear.app/sugartown/issue/SUG-174/button-component-redesign-sharp-rectangle-ghost-variant-icon-support)
- **Reference implementation:** `filterDrawerClearBtn` + `filterDrawerDoneBtn` in `apps/web/src/pages/pages.module.css` (SUG-173)
- **Prior Button epic:** [SUG-116](https://linear.app/sugartown/issue/SUG-116) — Baseline Rule treatment
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Files to Modify at activation time
