---
**Epic:** SUG-174 — DS primitive expansion — IconButton, form controls, Button ghost + icon
**Linear Issue:** [SUG-174](https://linear.app/sugartown/issue/SUG-174/button-component-redesign-sharp-rectangle-ghost-variant-icon-support)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Design handoff:** `docs/drafts/design_handoff_iconbutton_form-inputs/` (comp-iconbutton.html, comp-inputs.html, README.md)
---

# SUG-174 — DS primitive expansion — IconButton, form controls, Button ghost + icon

Expanded scope from original epic. The design handoff at `docs/drafts/design_handoff_iconbutton_form-inputs/` introduced two additions beyond the original ghost Button work: a unified `IconButton` primitive that consolidates three scattered icon-only button implementations, and four form selection controls (`Select`, `Checkbox`, `Radio`, `Switch`). The original ghost Button variant and bespoke button migration are retained as-is.

## Background

**Tertiary redesign (ghost treatment):** `Button.jsx`/`Button.tsx` expose `variant: primary | secondary | tertiary` — all using the Baseline Rule 3px bottom-border lift from SUG-116. The tertiary variant is being redesigned to fulfil the ghost role: 1px all-round border, transparent background, no Baseline Rule, no hover lift. Signal color is theme-aware — brand pink (`--st-color-brand-primary`) in light, lime (`--st-color-lime`) in dark. The SUG-173 FilterBar drawer introduced `filterDrawerClearBtn` / `filterDrawerDoneBtn` as bespoke CSS in `pages.module.css`; they migrate to `<Button variant="tertiary">` once this ships. The current tertiary CSS has a partial dark-mode ghost override using stale token names (`--st-code-color-button-ghost`, `--st-code-border-ghost`) — these are removed and replaced with the correct tokens in this epic. The variant string stays `tertiary`; no new `ghost` variant string is added.

**New scope (IconButton):** Three icon-only button implementations exist independently today:
- `SegmentedControl.module.css` `.iconBtn` / `.iconBtnActive` — the archive grid/list/graph toggle
- `ThemeToggle.jsx` — global header theme toggle (circular, lucide `moon`)
- `Header.jsx` hamburger — mobile menu trigger (square, lucide `menu`)

All three share the same 32px × 32px, `--st-index-cell-inactive-color` border, `--st-color-text-muted` icon color, `--st-color-brand-primary` active/hover signal base. They should share one component. The existing `IconButton.stories.tsx` documents the pattern with inline styles — it is a placeholder, not a shipped component.

**Token discrepancy to resolve at activation:** The existing stories use `--st-color-border-subtle` for the resting border; the design handoff spec uses `--st-index-cell-inactive-color`. The handoff is the authority — `--st-index-cell-inactive-color` matches SegmentedControl's actual production CSS. Confirm the token resolves correctly in dark theme (`rgba(255,255,255,0.18)`) and update the stories accordingly.

**New scope (form selection controls):** `Select`, `Checkbox`, `Radio`, `Switch` do not exist as DS primitives. Text `Input`, `Textarea`, `Label`, `HelperText`, and `ErrorMessage` already exist — they are explicitly out of scope here. The `FilterBar .optionCheckbox` is the canonical checked-checkbox reference; the new `Checkbox` must match it exactly.

**Design handoff fidelity:** High-fidelity. Colors, spacing, radii, and states are final and token-exact in the HTML prototypes. The task is to recreate pixel-for-pixel using CSS Modules and DS token conventions, not copy the prototype CSS verbatim.

## Objective

After this epic:

1. A new `IconButton` DS primitive (`apps/web/src/components/IconButton/`) consolidates ThemeToggle, the hamburger, and the SegmentedControl icon buttons under a single component. `SegmentedControl`'s icon variant is refactored to compose `IconButton`. `ThemeToggle` and the `Header` hamburger are migrated to the same component.
2. Four new form selection-control primitives ship: `Select`, `Checkbox`, `Radio`, `Switch` — all styled to the Pink Moon spec in the handoff, all reusing the existing `Field` wrapper.
3. The DS `Button` `tertiary` variant is redesigned to the ghost treatment (1px border, transparent bg, no Baseline Rule, theme-aware signal: pink light / lime dark). An `icon` prop is added. Bespoke button classes from SUG-173 are deleted and migrated to `<Button variant="tertiary">`.
4. The existing `IconButton.stories.tsx` is replaced by a proper story for the new component.

No Sanity schema, GROQ, or content changes.

## Scope

### A — Button tertiary redesign + icon prop

- [ ] **Phase 0 mock (Button)** — produce `docs/drafts/SUG-174-button-tertiary-icon-mock.html` showing: tertiary in all three sizes (light + dark theme), tertiary hover/active states showing pink vs lime signal, icon-left and icon-right layouts, tertiary alongside primary (drawer footer context). Hard stop — no CSS until approved.
- [ ] **`tertiary` variant redesign** — update both `Button.module.css` files: 1px solid `--st-color-border-medium`, transparent bg, `--st-color-text-muted` text, no 3px bottom border rule, no hover lift. Signal (hover + active): light theme → `--st-color-brand-primary` (pink) border + text; dark theme (`[data-theme="dark-pink-moon"]`) → `--st-color-lime` border + text. Remove the stale `--st-code-color-button-ghost` / `--st-code-border-ghost` token references currently in the dark-mode tertiary block.
- [ ] **`icon` prop** — optional `icon` prop (ReactNode) and `iconPosition: 'left' | 'right'` (default `'left'`). Renders icon in the existing `gap: var(--st-space-2)` flex row. Icon SVGs sized to `1em` to scale with size variant.
- [ ] **`filterDrawerClearBtn` + `filterDrawerDoneBtn` migration** — grep callers, remove classes from `pages.module.css`, replace in `ArchivePage.jsx` with `<Button variant="tertiary">` and `<Button variant="primary">`
- [ ] **Button Storybook update** — tertiary story (light + dark side by side to show signal-color switch), icon-left story, icon-right story, tertiary+primary pair

### B — IconButton primitive

- [ ] **`IconButton` component** — `apps/web/src/components/IconButton/IconButton.tsx` + `IconButton.module.css` + `index.ts`. Props: `shape?: 'square' | 'circular'` (default `'square'`), `size?: 'sm' | 'md' | 'lg'` (default `'md'`), `as?: 'button' | 'a'`, `href?: string`, `aria-label: string` (required), `aria-pressed?: boolean`, `disabled?: boolean`, `children: ReactNode` (the icon SVG).
- [ ] **Sizes** — sm: 28×28 / 14px icon · md: 32×32 / 16px icon · lg: 40×40 / 20px icon
- [ ] **States** — default (`--st-index-cell-inactive-color` border + `--st-color-text-muted` icon) · hover (brand-primary border + icon) · active/`aria-pressed="true"` (brand-primary border + icon, no fill) · disabled (inactive-color border + icon, `cursor: not-allowed; pointer-events: none`) · focus-visible (`outline: 2px solid var(--st-color-brand-primary); outline-offset: 2px`)
- [ ] **Custom archive-switcher SVGs** — copy grid, list, knowledge-graph custom glyphs verbatim from `comp-iconbutton.html` (they are fill SVGs on a `0 0 16 16` viewBox, not lucide)
- [ ] **SegmentedControl refactor** — remove `.iconBtn` / `.iconBtnActive` internal CSS from `SegmentedControl.module.css`; replace usage in `SegmentedControl.jsx` icon-variant render path with `<IconButton>` (toggle group: `role="group"`, each with `aria-pressed`)
- [ ] **ThemeToggle migration** — refactor `ThemeToggle.jsx` to render `<IconButton shape="circular" size="md">` wrapping the lucide Moon/Sun icon
- [ ] **Header hamburger migration** — refactor `Header.jsx` mobile hamburger to render `<IconButton shape="square" size="lg" aria-expanded={...}>` wrapping the lucide Menu icon
- [ ] **`IconButton.stories.tsx` replacement** — delete the inline-style placeholder; create a proper story (`Components/IconButton`) covering: shape pair, all three sizes, all states (default/hover/active/disabled), toggle group, mobile header mock — matching the `comp-iconbutton.html` sections. Dark mode story required.

### C — Form selection controls

> Build each in `apps/web/src/components/<Name>/` with `<Name>.tsx`, `<Name>.module.css`, `index.ts`, `<Name>.stories.tsx`. Storybook title: `Components/Inputs/<Name>` (e.g. `Components/Inputs/Select`). All live inside the existing `Field` wrapper and reuse its `.label`, `.helperText`, `.errorMessage` classes.

- [ ] **`Select`** — native `<select>` with custom chevron (`7×7px` box, `border-right`/`border-bottom` 1.5px `--st-color-text-muted`, rotated 45°, `pointer-events: none`). `appearance: none`. Padding `--st-space-2 --st-space-3` + `padding-right: 34px`. `border-radius: 0`. Border `--st-color-border-default`. Focus: `--st-color-focus` border + `box-shadow: 0 0 0 2px color-mix(in srgb, var(--st-color-focus) 18%, transparent)`.
- [ ] **`Checkbox`** — match `FilterBar .optionCheckbox` exactly. `appearance: none`, 16×16px, `border-radius: 0`, `--st-color-border-medium` border, `--st-color-bg-surface` bg. Checked: `--st-color-brand-primary` bg + border; white check via `::after` (4×8px, `border-right`/`border-bottom` 2px `#fff`, ~45° rotation). `focus-visible` ring 30% color-mix. Disabled: `opacity: 0.5; cursor: not-allowed`. Row layout: `flex; align-items: center; gap: --st-space-2`.
- [ ] **`Radio`** — same row + box as Checkbox but `border-radius: var(--st-radius-full)`. Checked: `--st-color-focus` ring border; centered 8×8px `--st-color-focus` dot via `::after` (no ring fill). Group via shared `name`.
- [ ] **`Switch`** — track: 34×18px, `--st-color-bg-surface` bg, `--st-color-border-medium` border, `border-radius: 0` (Pink Moon sharp). Knob: 12×12px square, 3px inset, `--st-color-text-muted`. Checked: track + border → `--st-color-focus`; knob `#fff`, translated +16px. `focus-visible` ring 30% on track. Transition: 0.15s ease on `transform`, `background`, `border-color`. Layout: label left, switch right (`justify-content: space-between`). Optional mono hint line (`--st-font-mono`, 10px, `--st-color-text-muted`).
- [ ] **Storybook stories for each** — default, checked/on, disabled, with error state, with helper text, dark mode (`dark-pink-moon`) for all four.

## Phases

Single close-out — all items ship together on one branch.

Logical sequence within the branch:
1. Phase 0 mock gate for Button ghost (if needed — handoff covers IconButton; confirm if Button ghost is also covered)
2. **A** — Button ghost CSS + icon JSX (both `Button.module.css` files in sync); bespoke migration
3. **B** — `IconButton` component; SegmentedControl refactor; ThemeToggle + hamburger migrations; stories
4. **C** — `Select`, `Checkbox`, `Radio`, `Switch` components + stories
5. Token validation + style-mirror check + Chromatic

## Acceptance criteria

### Button (A)
- [ ] Phase 0 mock approved before any Button CSS is written
- [ ] `<Button variant="tertiary">` renders with 1px border, transparent bg, no 3px bottom rule, no hover lift
- [ ] Light theme: tertiary hover/active signal is brand pink (`--st-color-brand-primary`)
- [ ] Dark theme: tertiary hover/active signal is lime (`--st-color-lime`)
- [ ] Stale `--st-code-color-button-ghost` / `--st-code-border-ghost` references removed — `pnpm validate:tokens` passes with zero undefined-token errors
- [ ] `<Button variant="tertiary" icon={<Icon />}>` and `iconPosition="right"` work at all sizes
- [ ] `filterDrawerClearBtn` and `filterDrawerDoneBtn` deleted from `pages.module.css`; no remaining callers
- [ ] Both `Button.module.css` files byte-identical — `pnpm validate:style-mirror` passes

### IconButton (B)
- [ ] `<IconButton shape="square" size="md">` — default, hover, active, disabled states correct in Storybook
- [ ] `<IconButton shape="circular" size="lg">` — ThemeToggle renders using the component
- [ ] `<IconButton as="a" href="...">` — knowledge-graph archive switcher works as a link
- [ ] SegmentedControl icon-variant renders correctly using `<IconButton>` — no visual regression
- [ ] Archive grid/list/graph toggle group: `aria-pressed` state management preserved after refactor
- [ ] `Header.jsx` hamburger uses `<IconButton>`; `aria-expanded` propagates correctly
- [ ] Old `IconButton.stories.tsx` inline-style placeholder replaced by component-backed story
- [ ] Dark mode story passes Chromatic

### Form controls (C)
- [ ] `Select` renders with custom chevron, correct focus ring, no browser chrome
- [ ] `Checkbox` checked state matches `FilterBar .optionCheckbox` visually — compare side by side in Storybook
- [ ] `Radio` group: only one checked at a time; checked dot renders correctly
- [ ] `Switch` knob translates on checked; sharp track (no radius)
- [ ] All four controls: `focus-visible` ring visible at 2px pink
- [ ] All four controls: disabled state correct (0.5 opacity + not-allowed)
- [ ] All four controls: error state (red `ErrorMessage`, `aria-invalid` on control, `aria-describedby` linking to error)
- [ ] All four controls: dark mode (`dark-pink-moon`) confirmed in Storybook
- [ ] `pnpm validate:tokens --strict-colors` — zero hardcoded colour violations across all new CSS

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach. At minimum: Header (hamburger, ThemeToggle), every archive page (SegmentedControl icon toggle), FilterBar drawer (ghost Button migration), any page with a Form. Build the walkthrough table per `docs/epic-template.md` §Human QA Walkthrough. Datestamp with real published slugs.

## Technical notes

**No schema changes.** No Sanity content changes. No GROQ changes.

**Button mirrored file constraint:** `Button.module.css` exists in both `apps/web/src/design-system/components/Button/` and `packages/design-system/src/components/Button/`. Both must be updated identically in the same commit — `pnpm validate:style-mirror` enforces this.

**IconButton lives in `apps/web/src/components/`** (app-level composite), not in the DS package or web adapter layer. It is a React component that uses `--st-*` tokens and lucide-react icons. It does NOT need a DS-package mirror at this stage.

**SegmentedControl refactor caution:** The `.iconBtnActive` state in SegmentedControl is driven by the parent component's `activeView` state. After refactoring to `<IconButton>`, the active signal must pass through `aria-pressed` — confirm the SegmentedControl render logic passes `aria-pressed={activeView === view.id}` to each `<IconButton>`. The CSS active state in `IconButton.module.css` targets `[aria-pressed="true"]`, not a separate class.

**`--st-index-cell-inactive-color` dark-theme value:** Resolves to `rgba(255,255,255,0.18)` in dark-pink-moon. Verify the resting border is visible on the dark canvas before close-out — the semi-transparent value is lighter than `--st-color-border-medium` and may need a theme override if contrast is insufficient.

**Checkbox `::after` white check:** The `#fff` value in the check pseudo-element is intentional and exempt from `--strict-colors` — it is a fixed-white mark on a brand-pink filled box, not a themeable surface color. Document this in a comment if the validator flags it.

**Bespoke CSS intentionally left in place until this epic ships.** `filterDrawerClearBtn` and `filterDrawerDoneBtn` are correct for SUG-173 — do not migrate them until the ghost variant exists.

**Bespoke button audit (at migration time):**
```bash
grep -rn "filterDrawerClearBtn\|filterDrawerDoneBtn" apps/web/src
```
Expected: one caller each (`ArchivePage.jsx`). Migrate all callers before deleting the classes.

**Model & Mode:** `/model opusplan` — Opus plans token decisions, API shapes, and SegmentedControl refactor strategy; Sonnet executes.

## Non-Goals

- Does not change primary, secondary, or tertiary Button variant visuals (Baseline Rule stays)
- Does not add animated icon transitions
- Does not add a `danger` / `destructive` Button variant
- Does not touch Button's link/router rendering logic
- Does not implement text `Input`, `Textarea`, `Label`, `HelperText`, or `ErrorMessage` — these already exist as DS primitives
- Does not add a `DatePicker`, `FileUpload`, or any other control not in the handoff
- Does not migrate existing form usages on existing pages (the new controls are additive — callers opt in)

## Related

- **Linear:** [SUG-174](https://linear.app/sugartown/issue/SUG-174/button-component-redesign-sharp-rectangle-ghost-variant-icon-support)
- **Design handoff:** `docs/drafts/design_handoff_iconbutton_form-inputs/` — `README.md`, `comp-iconbutton.html`, `comp-inputs.html`
- **Reference — ghost Button:** `filterDrawerClearBtn` + `filterDrawerDoneBtn` in `apps/web/src/pages/pages.module.css` (SUG-173)
- **Reference — Checkbox:** `FilterBar .optionCheckbox` in `apps/web/src/components/FilterBar/FilterBar.module.css`
- **Reference — IconButton base:** `SegmentedControl.module.css` `.iconBtn` / `.iconBtnActive`
- **Existing partial:** `apps/web/src/components/IconButton.stories.tsx` (inline-style placeholder — to be replaced)
- **Prior Button epic:** [SUG-116](https://linear.app/sugartown/issue/SUG-116) — Baseline Rule treatment
- **Epic template:** `docs/epic-template.md`
