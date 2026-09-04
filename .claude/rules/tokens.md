---
paths:
  - "tokens/**"
  - "**/*.css"
  - "apps/web/src/design-system/**"
  - "packages/design-system/**"
---
# Design tokens and theme files

Loads when a session reads token sources, any stylesheet, or design-system code. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

## DS Component Authoring — Token-First Rule (blocking)

Applies to any component CSS file in `apps/web/src/design-system/` or `packages/design-system/src/`. A hardcoded value bypasses the token graph: the theme system cannot override it and the validator cannot audit it.

**Verify every token name exists before writing it** — `grep "token-name" apps/web/src/design-system/styles/tokens.css`. Tokens are named by concept (`--st-font-family-narrative`), not by analogy (`--st-font-family-heading`). Pre-commit catches this, but catching it there costs a correction commit.

**Verify the computed value, not just the name.** For typography or spacing, grep the resolved value in `tokens.css` and cross-check it against `/story/foundations-typography-conventions--default` in Storybook. A name can exist at the wrong tier: `--st-font-heading-2` resolves to 2.25rem (36px), not the 48px page-H1 spec. Record the resolved value. A mismatch needs a new semantic token before implementation begins.

**No raw colour value in a component CSS file.** Every colour resolves through a `--st-*` token reference. If the token does not exist yet, add it to `tokens.css` first, in a separate commit.

**Inline CSS custom property injection on DS components is banned.** `style={{ '--st-table-header-bg': '#fff' }}` bypasses the token graph and has to be removed every time the token is renamed. To vary a visual zone from the call site, add a `tone` value: define the prop, add the token to `tokens.json`, apply it in the component CSS.

**Fallback syntax:** `var(--st-token, #hex)` is banned. The only permitted form is `var(--st-token, var(--st-primitive))`. If no matching primitive exists, add it to `tokens.css` first. If no fallback is needed, omit it.

**Token names are contracts, not descriptions.** A token used in 2+ distinct surfaces needs a name that works for all of them. A placement-specific name (`--st-card-folio-bg`) also used in FilterBar headers and MetadataCard label cells is renamed to the shared concept (`--st-card-label-bg`). Full rules: `docs/conventions/token-naming.md`.

**Theme files are override-only.** `theme.light.css`, `theme.pink-moon.css`, and any future theme file may only override existing `--st-*` names with other token references. They may not introduce a colour value (hex, rgba, hsla) with no primitive anchor in `tokens.css`; add the primitive first.

**A component with chip/badge/status colour states** defines all `--st-status-<state>-{bg,fg,border}` tokens for every state in `tokens.css`, plus light-theme overrides, before the component CSS is written. Not deferrable: Card's status chips accumulated 90 hardcoded values by skipping it.

**Trace the theme cascade before using any token for a `background`.** Pink Moon's dark block overrides semantic `--st-color-bg-surface*` tokens to semi-transparent `rgba()` values rather than the solid dark primitives in `tokens.css`:

1. `tokens.css` — default value
2. `theme.pink-moon.css` light block
3. `theme.pink-moon.css` dark block — most likely to surprise

If the dark-block value is `rgba(...)`, that token produces a glassmorphism wash, not a solid surface. Use a raw primitive (`--st-color-midnight-800`) or an alias pointing straight at one. Already overridden in dark-pink-moon: `--st-color-bg-surface`, `--st-color-bg-surface-strong`, `--st-card-bg`.

## Pre-Commit Checklist for CSS Token Changes

Both `tokens.css` files are **generated** — do not edit them directly. Edit `tokens/source/tokens.json` and run `pnpm tokens:build` to regenerate both files. The pre-commit hook blocks staged changes to these files if they already carry the "Do not edit directly" header.

Whenever `tokens/source/tokens.json` is edited, or whenever any component CSS file is created or modified:

1. Run `pnpm tokens:build` to regenerate both `tokens.css` files.
2. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
3. Run `pnpm validate:tokens --strict-colors` from `apps/web/` and confirm **zero hardcoded color violations** before committing.
4. Commit `tokens/source/tokens.json` + both generated `tokens.css` files together.

**Token pipeline (SUG-86):**
- Source of truth: `tokens/source/tokens.json`
- Build command: `pnpm tokens:build` (runs `sd.config.mjs` via Style Dictionary v5)
- Outputs: `apps/web/src/design-system/styles/tokens.css` + `packages/design-system/src/styles/tokens.css`
- Theme overrides (`theme.pink-moon.css`, `theme.light.css`, `theme.shop.css`) remain hand-authored — they are NOT generated files, but they ARE duplicated to both the web and DS-package style dirs and **must be kept byte-identical by hand** (see Mirrored File Registry below).

`validate:tokens` catches: undefined `var(--st-*)` references, renamed tokens with lingering references.
`validate:tokens --strict-colors` catches: raw hex, rgba, or hsla values in any component or theme CSS file outside `tokens.css`.
`validate:style-mirror` catches: drift between the duplicated DS style files (theme/tokens/globals/utilities) across web ↔ DS package.

**`validate:tokens` does not check theme-file parity.** It verifies that every `var(--st-*)` reference resolves, not that the two theme files carry the same override set — a token missing from one theme still resolves via the shared `tokens.css`, so drift is invisible to it. Parity is `validate:style-mirror`'s job. (2026-06-13: the DS-package copy of `theme.pink-moon.css` had decayed to a stale subset missing 93 tokens, breaking DS components in Storybook while production looked fine.)

### Mirrored File Registry (must-be-identical pairs)

Some files exist in two locations and **must be byte-identical**. Each must have a named enforcement mechanism — never rely on "remember to mirror it":

| File(s) | Locations | Source of truth | Enforced by |
|---------|-----------|-----------------|-------------|
| `tokens.css` | `apps/web/src/design-system/styles/` ↔ `packages/design-system/src/styles/` | generated from `tokens/source/tokens.json` | `pnpm tokens:build` + pre-commit "Do not edit directly" block + `validate:style-mirror` |
| `theme.pink-moon.css`, `theme.light.css`, `theme.shop.css`, `globals.css`, `utilities.css` | same two style dirs | **web copy is canonical** (hand-authored) | `validate:style-mirror` (pre-commit) |
When you edit a hand-authored mirrored file (any theme/style file), update **both** copies in the same commit, or `validate:style-mirror` will block the commit. When adding a new must-be-identical pair, register it here and wire it into `validate-style-mirror.js`. One pair was retired in SUG-224.

### Dark mode surface work — pre-flight

Before any structured-surface dark mode CSS pass (MetadataCard, Card, FilterBar, any component with label or folio strips), **inspect the reference component's computed values in the browser first**:

1. Open the reference component (e.g. standard `Card`) in Storybook on `dark-pink-moon` theme
2. Use DevTools to inspect computed `background-color`, `border-color`, and `color` on each visual zone (card bg, folio/label strip, body, dividers)
3. Record the exact computed values and trace them back to their tokens via `tokens.css` and `theme.pink-moon.css`

Only then write the target component's CSS. Working forward from token names without checking what they resolve to in dark theme produces glassmorphism surprises. (MetadataCard's dark mode took 3+ correction rounds this way.)
