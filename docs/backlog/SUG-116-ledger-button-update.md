# SUG-116 · Ledger Button Update — Baseline Rule, sm/md/lg sizes, Storybook snapshot

**Linear Issue:** [SUG-116](https://linear.app/sugartown/issue/SUG-116/ledger-button-update-baseline-rule-smmdlg-sizes-storybook-snapshot)
**Status:** Backlog
**Priority:** High
**Epic strategy:** merge-as-you-go (single phase)

---

## Background

Design handoff approved 2026-05-15. Moves the Pink Moon Button from "Due Date Slip" (3px top-edge stripe, `border-top`) to "Baseline Rule" (3px bottom-edge stripe, `border-bottom`).

The top stripe reads like a folder tab — optical weight pulls upward. The baseline rule grounds the stamp and aligns with the Ledger Tradition physical reference (the ruled line at the foot of a ledger entry, not the header).

Handoff bundle: `docs/drafts/design_handoff_ledger_button_update/` (local only, gitignored).
Handoff treatment shipped: **Treatment 02 — Baseline Rule**.

---

## Scope

### Phase 0
No HTML mock required — handoff ships a complete `Button Update.html` reference canvas with all states. Review the canvas (`docs/drafts/design_handoff_ledger_button_update/Button Update.html`) before writing any CSS. Visual QA gate applies at close-out.

### Phase 1 — Token changes (Option B: rename)

In `tokens/source/tokens.json`:

| Action | Token | Value |
|--------|-------|-------|
| Add | `--st-color-button-rule-primary` | `var(--st-color-pink-700)` (`#b30054`) |
| Add | `--st-color-button-rule-secondary` | `var(--st-color-lime-500)` (`#b8e000`) |
| Add | `--st-color-button-rule-tertiary` | `var(--st-color-neutral-300)` (`#c6c6c8`) |
| Remove | `--st-shadow-button-edge-primary` | Only used in Button CSS — safe to remove |
| Remove | `--st-shadow-button-edge-secondary` | Only used in Button CSS — safe to remove |
| Update | `--st-shadow-button-active` | `0 10px 22px rgba(0,0,0,0.10)` (was `0 2px 6px rgba(0,0,0,0.08)`) |

Run `pnpm tokens:build` after editing `tokens.json` to regenerate both `tokens.css` files.

### Phase 2 — CSS changes

Apply to **both** CSS files (they must stay in sync):
- `packages/design-system/src/components/Button/Button.module.css`
- `apps/web/src/design-system/components/button/Button.module.css`

| Property | Old | New |
|----------|-----|-----|
| Stripe edge | `border-top: 3px solid transparent` | `border-bottom: 3px solid transparent` |
| Padding (md) | `10px 20px 8px` | `9px 22px 11px` |
| Primary stripe color | `var(--st-shadow-button-edge-primary)` | `var(--st-color-button-rule-primary)` |
| Secondary stripe color | `var(--st-shadow-button-edge-secondary)` | `var(--st-color-button-rule-secondary)` |
| Tertiary stripe color | `var(--st-color-softgrey-400)` | `var(--st-color-button-rule-tertiary)` |
| Hover lift | `translateY(-1px)` | `translateY(-3px)` |
| Hover shadow (all) | `var(--st-shadow-button-active)` | `0 10px 22px rgba(0,0,0,0.10)` (via updated token) |
| Hover shadow (primary) | — | Add `0 10px 24px rgba(255,36,125,0.28)` |
| Transition | `transform 0.2s, box-shadow 0.2s, background-color 0.2s` | `transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease, color 150ms ease, border-color 150ms ease` |
| Disabled opacity | `0.5` | `0.45` |
| Disabled selector | `.button:disabled` | `.button:disabled, .button[aria-disabled="true"]` |
| Disabled pointer-events | — | Add `pointer-events: none` |
| Dark tertiary | `border-top-color` | `border-bottom-color` |
| Dark tertiary hover | `var(--st-shadow-button-active-dark)` | `0 10px 22px rgba(0,0,0,0.40)` (open decision: match new lift) |

### Phase 3 — Size variants (new)

Add `.sm` and `.lg` modifier classes to both CSS files:

```css
.sm { font-size: 0.65rem; padding: 8px 14px 9px; }
/* .md is default — see base .button spec */
.lg { font-size: 0.82rem; padding: 13px 28px 15px; }
```

Wire `size` prop:
- `packages/design-system/src/components/Button/Button.tsx` — add `size?: 'sm' | 'md' | 'lg'` to `ButtonProps`, apply `styles[size]` class
- `apps/web/src/design-system/components/button/Button.jsx` — add `size = 'md'` prop, apply `styles[size]` class

### Phase 4 — Storybook

Update `packages/design-system/src/components/Button/Button.stories.tsx`:

- Update `Snapshot` story to include:
  - Row 1: Variants (Primary, Secondary, Tertiary — default size)
  - Row 2: States (Default, Hover, Disabled — primary variant)
  - Row 3: Sizes (sm, md, lg — secondary variant)
  - Row 4: Long label (primary, 8+ word string)
- Update `AllVariants` story description to remove "Due Date Slip" → "Baseline Rule"
- Update component `description` in meta to reflect baseline rule

---

## Files

| File | Change |
|------|--------|
| `tokens/source/tokens.json` | Add 3 button-rule tokens, remove 2 edge tokens, update shadow-button-active |
| `packages/design-system/src/styles/tokens.css` | Regenerated via `pnpm tokens:build` |
| `apps/web/src/design-system/styles/tokens.css` | Regenerated via `pnpm tokens:build` |
| `packages/design-system/src/components/Button/Button.module.css` | CSS spec update + sm/lg |
| `packages/design-system/src/components/Button/Button.tsx` | Add `size` prop |
| `apps/web/src/design-system/components/button/Button.module.css` | Mirror of DS update |
| `apps/web/src/design-system/components/button/Button.jsx` | Add `size` prop |
| `packages/design-system/src/components/Button/Button.stories.tsx` | Snapshot story update |

---

## Acceptance Criteria

- [ ] Stripe is on the bottom edge in all three variants (no `border-top` references remain in Button CSS)
- [ ] `sm` / `md` / `lg` size prop works in DS component and web adapter
- [ ] `--st-shadow-button-edge-primary/secondary` removed from `tokens.json` and all CSS references
- [ ] Dark tertiary uses `border-bottom-color`, not `border-top-color`
- [ ] Storybook snapshot story covers variants + states + sizes + long label
- [ ] `pnpm validate:tokens` → zero errors
- [ ] `pnpm validate:tokens:strict` → zero hardcoded color violations
- [ ] Visual QA: Storybook matches design canvas `Button Update.html` Treatment 02 pixel-for-pixel
- [ ] Chromatic VRT re-baselined (Build N passes)
