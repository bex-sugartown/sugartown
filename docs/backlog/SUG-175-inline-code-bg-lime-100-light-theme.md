---
**Epic:** SUG-175 — Update inline `code` background to lime-100 (light theme)
**Linear Issue:** [SUG-175](https://linear.app/sugartown/issue/SUG-175/update-inline-code-background-to-lime-100-light-theme)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-175 — Update inline `code` background to lime-100 (light theme)

Change `--st-code-inline-bg` to `var(--st-color-lime-100)` in the light theme. Dark theme (Pink Moon dark block) remains unchanged.

## Background

**Current state:** In light mode, inline `<code>` elements render with `background-color: var(--st-color-softgrey-100)` — a neutral grey wash. This is set in `theme.light.css` and the Pink Moon light block in `theme.pink-moon.css`. In dark mode the token resolves to `rgba(209, 255, 29, 0.10)` (semi-transparent lime) from `tokens.css`, which is the approved dark-theme treatment.

**Why now:** The lime palette is the signal colour for code/technical content in the Pink Moon design language. Softgrey is neutral — it visually undersells inline code on white/light surfaces. Lime-100 (`#f2ffbf`) is the palest lime step, legible at WCAG AA contrast against dark text, and consistent with the brand signal treatment already in use on dark backgrounds.

**Reference surfaces:** `apps/web/src/design-system/styles/theme.light.css` (line 60), `apps/web/src/design-system/styles/theme.pink-moon.css` (line 89, light block). Both are mirrored to `packages/design-system/src/styles/`. No schema, GROQ, or Sanity content touched.

## Objective

After this epic, inline `<code>` in light mode has a soft lime background (`var(--st-color-lime-100)`) that visually signals technical content without the harshness of the full lime-400 used on dark surfaces. The dark theme retains its existing semi-transparent lime wash from `tokens.css`. Both mirrored theme files are updated identically. `pnpm validate:style-mirror` passes. No Storybook story change required (CodeBlock/inline code stories will pick up the token change automatically).

## Scope

- [ ] Update `theme.light.css` line 60: `--st-code-inline-bg` → `var(--st-color-lime-100)` — layer: DS theme CSS
- [ ] Mirror the same change to `packages/design-system/src/styles/theme.light.css` — layer: DS package mirror
- [ ] Update `theme.pink-moon.css` line 89 (light block only): `--st-code-inline-bg` → `var(--st-color-lime-100)` — layer: DS theme CSS
- [ ] Mirror the same change to `packages/design-system/src/styles/theme.pink-moon.css` — layer: DS package mirror
- [ ] `pnpm validate:style-mirror` passes (both theme files byte-identical across web ↔ DS package)
- [ ] `pnpm validate:tokens --strict-colors` passes (lime-100 is a token reference, not a hardcoded hex)

## Acceptance criteria

- [ ] In light theme, `:not(pre) > code` renders with `background-color` resolving to `#f2ffbf` (lime-100) — confirm via browser DevTools on any page with inline code
- [ ] In dark theme (Pink Moon dark), `:not(pre) > code` background is unchanged — still `rgba(209, 255, 29, 0.10)`
- [ ] `pnpm validate:style-mirror` passes — both `theme.light.css` and `theme.pink-moon.css` byte-identical across web and DS package
- [ ] `pnpm validate:tokens --strict-colors` passes — zero hardcoded colour violations

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

**No schema changes.** No Sanity content changes. No GROQ changes.

**Mirrored file constraint:** `theme.light.css` and `theme.pink-moon.css` each exist in two locations and must be byte-identical. Update `apps/web/src/design-system/styles/` first (source of truth), copy to `packages/design-system/src/styles/`, confirm byte-identical before committing. `pnpm validate:style-mirror` enforces this at pre-commit.

**Dark block in theme.pink-moon.css:** The file has a light block (lines ~85–130) and a dark block (`[data-theme="dark-pink-moon"]`, lines ~135+). Only the light block's `--st-code-inline-bg` changes. Confirm the dark block's override is NOT modified — it should continue inheriting the `rgba(209, 255, 29, 0.10)` from `tokens.css`.

**Token reference, not hardcoded value:** The value must be written as `var(--st-color-lime-100)`, not `#f2ffbf`. `--st-color-lime-100` is already defined in `tokens.css` (line 29).

**Model & Mode:** `/model sonnet` — this is a two-line CSS change with a clear token target. No planning phase required.

## Model & Mode [REQUIRED]

`/model sonnet` — two-line CSS change with confirmed token and location. No architecture decision needed.

## Non-Goals

- Does not change the dark theme `--st-code-inline-bg` (stays `rgba(209, 255, 29, 0.10)` from tokens.css)
- Does not change `--st-code-inline-color`, `--st-code-inline-border`, or any other code token
- Does not touch code block (`<pre><code>`) styling — only inline `:not(pre) > code`
- Does not add a new Storybook story (existing CodeBlock/inline code stories cover this automatically)

## Related

- **Linear:** [SUG-175](https://linear.app/sugartown/issue/SUG-175/update-inline-code-background-to-lime-100-light-theme)
- **Token definition:** `tokens/source/tokens.json` → `--st-color-lime-100: #f2ffbf`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Files to Modify at activation time
