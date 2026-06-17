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

**Baseline Rule removal (all three variants):** `Button.jsx`/`Button.tsx` expose `variant: primary | secondary | tertiary` — all three currently use the Baseline Rule 3px bottom-border lift from SUG-116. **This epic removes the Baseline Rule from all three variants.** Primary and secondary retain their solid / outlined fills but drop the 3px lift and hover-lift entirely. Tertiary is additionally redesigned to the ghost treatment (see below). The SUG-173 FilterBar drawer introduced `filterDrawerClearBtn` / `filterDrawerDoneBtn` as bespoke CSS in `pages.module.css`; the clear button migrates to `<Button variant="tertiary">` (ghost) and the done button migrates to `<Button variant="primary">` — both without the Baseline Rule — once this ships. This is the canonical example of a primary + ghost tertiary button pair in a drawer footer context.

**Tertiary redesign (ghost treatment):** The tertiary variant is being redesigned to fulfil the ghost role: 1px all-round border, transparent background, no Baseline Rule, no hover lift. Signal color is theme-aware — brand pink (`--st-color-brand-primary`) in light, lime (`--st-color-lime`) in dark. The current tertiary CSS has a partial dark-mode ghost override using stale token names (`--st-code-color-button-ghost`, `--st-code-border-ghost`) — these are removed and replaced with the correct tokens in this epic. The variant string stays `tertiary`; no new `ghost` variant string is added.

**`icon` prop (all three variants):** The optional `icon` prop (ReactNode) and `iconPosition: 'left' | 'right'` (default `'left'`) are added to the base `Button` component and apply equally to primary, secondary, and tertiary. The icon renders in the existing `gap: var(--st-space-2)` flex row at `1em` so it scales with the size variant. The FilterBar drawer done/clear pair is the reference implementation (icon-left on primary, icon-left on ghost tertiary).

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

### A — Button redesign: Baseline Rule removal, ghost tertiary, icon prop (all variants)

- [ ] **Phase 0 mock (Button)** — produce `docs/drafts/SUG-174-button-tertiary-icon-mock.html` showing: all three variants (primary, secondary, tertiary/ghost) in all three sizes (light + dark theme), Baseline Rule removed on primary and secondary — solid/outlined fills retained but no 3px lift, tertiary ghost hover/active states showing pink vs lime signal, icon-left and icon-right layouts on all three variants (lucide examples), drawer footer context: primary + ghost tertiary pair with icons. Hard stop — no CSS until approved.
- [ ] **Baseline Rule removal — primary + secondary** — update both `Button.module.css` files: remove the 3px `border-bottom` lift and any corresponding `translateY` hover offset from `variant="primary"` and `variant="secondary"`. Retain all other fill, border, and color rules for those variants.
- [ ] **`tertiary` variant redesign (ghost)** — update both `Button.module.css` files: 1px solid `--st-color-border-medium`, transparent bg, `--st-color-text-muted` text, no 3px bottom border rule, no hover lift. Signal (hover + active): light theme → `--st-color-brand-primary` (pink) border + text; dark theme (`[data-theme="dark-pink-moon"]`) → `--st-color-lime` border + text. Remove the stale `--st-code-color-button-ghost` / `--st-code-border-ghost` token references currently in the dark-mode tertiary block.
- [ ] **`icon` prop (all variants)** — optional `icon` prop (ReactNode) and `iconPosition: 'left' | 'right'` (default `'left'`). Renders icon in the existing `gap: var(--st-space-2)` flex row at `1em`. Applies equally to primary, secondary, and tertiary — no variant-specific icon logic.
- [ ] **`filterDrawerClearBtn` + `filterDrawerDoneBtn` migration** — grep callers, remove classes from `pages.module.css`, replace in `ArchivePage.jsx` with `<Button variant="tertiary" icon={<X size={14} />}>Clear</Button>` and `<Button variant="primary" icon={<Check size={14} />}>Done</Button>` (lucide examples — confirm exact icon choice at implementation)
- [ ] **Button Storybook update** — primary/secondary/tertiary row without Baseline Rule (before/after callout), tertiary ghost story (light + dark side by side, signal-color switch), icon-left and icon-right stories on all three variants, drawer footer pair (primary + ghost tertiary with icons)

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

### D — Rogue icon button audit + migration

This scope runs after `IconButton` (B) ships so the DS standard exists to migrate to. Greps are run at the start of this phase to establish the full inventory — nothing is migrated speculatively.

- [ ] **Audit** — run the following grep set to surface all bespoke icon-only button implementations:
  ```bash
  # Inline button/a elements with only an icon child (no visible text)
  grep -rn "aria-label" apps/web/src/components/ apps/web/src/pages/ --include="*.jsx" --include="*.tsx"
  grep -rn "IconBtn\|icon-btn\|iconBtn\|iconButton\|icon_btn" apps/web/src/components/ apps/web/src/pages/ --include="*.module.css"
  grep -rn "rounded-full\|border-radius.*50%\|border-radius.*var(--st-radius-full)" apps/web/src/components/ apps/web/src/pages/ --include="*.module.css"
  ```
  Produce an **Audit table** listing: file path, component/class name, current shape (square / circular / irregular), current size, what it does, and migration verdict (migrate to `<IconButton shape="square">` / `<IconButton shape="circular">` / keep-bespoke with reason).

- [ ] **Migration** — for every item with verdict `migrate`, replace with `<IconButton>` and remove the bespoke CSS class. Known candidates at time of writing (may expand after audit):
  - `SegmentedControl.module.css` `.iconBtn` / `.iconBtnActive` — already scoped in B
  - `ThemeToggle.jsx` circular toggle — already scoped in B
  - `Header.jsx` hamburger — already scoped in B
  - Any other icon-only `<button>` or `<a>` elements that emerge from the grep

- [ ] **Bespoke retention allowlist** — document any icon buttons that legitimately cannot use `<IconButton>` (e.g. a button that renders inside a third-party library slot). State the reason in a comment in the source file.

- [ ] **Storybook audit story** — add a `Patterns/IconButtonAudit` story that renders every migrated call site side by side with its replacement, confirming visual parity before the bespoke class is deleted.

Logical sequence within the branch:
1. Phase 0 mock gate for Button (all three variants, icon prop, drawer context) — handoff covers IconButton; confirm Button ghost + primary/secondary Baseline Rule removal is also covered
2. **A** — Baseline Rule removal from primary + secondary; ghost tertiary CSS; icon prop on all variants (both `Button.module.css` files in sync); bespoke drawer migration
3. **B** — `IconButton` component; SegmentedControl refactor; ThemeToggle + hamburger migrations; stories
4. **C** — `Select`, `Checkbox`, `Radio`, `Switch` components + stories
5. **D** — Rogue icon button audit; migration; bespoke retention allowlist; audit story
6. Token validation + style-mirror check + Chromatic

## Acceptance criteria

### Button (A)
- [ ] Phase 0 mock approved before any Button CSS is written
- [ ] `<Button variant="primary">` and `<Button variant="secondary">` render without 3px bottom border lift or hover-lift — solid/outlined fills otherwise unchanged
- [ ] `<Button variant="tertiary">` renders with 1px border, transparent bg, no 3px bottom rule, no hover lift
- [ ] Light theme: tertiary hover/active signal is brand pink (`--st-color-brand-primary`)
- [ ] Dark theme: tertiary hover/active signal is lime (`--st-color-lime`)
- [ ] Stale `--st-code-color-button-ghost` / `--st-code-border-ghost` references removed — `pnpm validate:tokens` passes with zero undefined-token errors
- [ ] `<Button variant="primary" icon={<Icon />}>`, `<Button variant="secondary" icon={<Icon />}>`, and `<Button variant="tertiary" icon={<Icon />}>` all work with `iconPosition="left"` and `iconPosition="right"` at all sizes
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

### Rogue icon button audit (D)
- [ ] Audit table produced listing every bespoke icon-only button across `apps/web/src/components/` and `apps/web/src/pages/` with migration verdict
- [ ] All items with verdict `migrate` replaced with `<IconButton shape="square">` or `<IconButton shape="circular">` as appropriate
- [ ] Bespoke-retention items carry an in-code comment explaining why `<IconButton>` doesn't apply
- [ ] `Patterns/IconButtonAudit` Storybook story shows before/after parity for each migration
- [ ] No orphaned bespoke icon button CSS classes remain after migration (validate with grep)

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

- Does not change primary or secondary Button fills, borders, or color scheme — only the Baseline Rule lift is removed
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
