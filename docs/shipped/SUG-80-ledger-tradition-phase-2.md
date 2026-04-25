# SUG-80 — Ledger Tradition DS Refresh: Phase 2

**Linear Issue:** [SUG-80](https://linear.app/sugartown/issue/SUG-80/ledger-tradition-ds-refresh-phase-2-structural-callout-wcag-contrast)
**Status:** Backlog
**Priority:** Normal — schedule after SUG-79 Storybook audit
**Follows:** SUG-78 Phase 1 (shipped v0.22.6 — token-only, no structural changes)

---

## Problem

Phase 1 landed the token layer for Ledger Tradition (canvas bg, card borders, title font, chip treatment, FilterBar, inline code). Two categories of work were explicitly deferred:

1. **WCAG contrast** — the light blue-grey token scale (softgrey-*, charcoal-*) contains values that likely fail WCAG AA on the neutral-100 canvas and white card surfaces. The Chromatic accessibility panel flagged 75 issues in Build 12 (post-font-fix). These need a proper audit before they can be dismissed or fixed.

2. **Callout structural treatment** — the Ledger spec requires layout changes (left border → horizontal rule pair, label in CSS grid column) that are Token + Structural and cannot be done in CSS-only Phase 1.

---

## Phase 0 gate

### Work Item 1 (WCAG audit): no mock required
Token-only fixes after audit. Can proceed directly once audit is run.

### Work Item 2 (Callout): Phase 0 gate applies
HTML mock required at `docs/drafts/SUG-80-callout-ledger.html` before any JSX.

---

## Work Items

### 1 — WCAG contrast audit (token-only, no Phase 0 gate)

Run a full contrast audit against all `--st-*` colour tokens at `light-pink-moon`. Flag every pair that fails WCAG AA (4.5:1 normal text, 3:1 large/UI text).

Priority targets:
- `softgrey-*` and `charcoal-*` scale — suspected failures on white/neutral-100 canvas
- `--st-color-text-muted` and `--st-label-color` on card and canvas backgrounds
- Tag chip text (`--st-color-pink` / `var(--st-color-maroon)`) on chip bg
- Eyebrow pink on card white surface

**For each failure:** propose a replacement that passes AA and fits the Ledger neutral/hot-signal palette. No warm blue-greys — replacements should come from the neutral-* or ink scale.

Ship as a token-only commit. Run `pnpm validate:tokens --strict-colors` before committing.

### 2 — Callout: Ledger Tradition structural treatment

Spec (from Storybook "Callout — rubrication in prose" story, right panel):

- **Top:** 2px solid pink rubrication rule
- **Bottom:** 1px hairline `rule-accent`
- **Background:** none (structure via rules only, no tint wash)
- **Label:** mono uppercase, inline left in CSS grid column (not above body)
- **Body:** grid column beside label

New tokens needed (add to tokens.css before writing component CSS):
- `--st-callout-rule-top`
- `--st-callout-rule-bottom`
- `--st-callout-label-width`

Phase 0 HTML mock must be approved before any JSX or CSS changes to Callout.

### 3 — Deferred items audit

Read `docs/shipped/SUG-78-ledger-tradition-ds-refresh.md` and pull any items marked "Phase 2" or "deferred structural".

---

## Acceptance Criteria

- [ ] WCAG contrast audit complete — all failures documented
- [ ] All `light-pink-moon` token pairs pass WCAG AA at card and canvas surfaces
- [ ] Contrast token fixes committed with validator passing (zero errors, zero hardcoded colors)
- [ ] Chromatic Build N+1 approved after contrast fixes (diff should be small and intentional)
- [ ] Callout Phase 0 mock at `docs/drafts/SUG-80-callout-ledger.html` reviewed and approved
- [ ] Callout renders with horizontal rule pair + inline grid label
- [ ] No left-border callout styling remains in any CSS file

---

## Out of Scope

- Other component structural changes (defer to SUG-78 Phase 3 if needed)
- Dark mode contrast audit (separate pass — light-pink-moon first)
- New Callout variants
