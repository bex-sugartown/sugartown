---
**Epic:** SUG-180 — Multi-brand DS theming convention — theme file contract, CONSUMING.md, validate:style-mirror
**Linear Issue:** [SUG-180](https://linear.app/sugartown/issue/SUG-180/multi-brand-ds-theming-convention-theme-file-contract-consumingmd)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-180 — Multi-brand DS theming convention — theme file contract, CONSUMING.md, validate:style-mirror

Formalise the multi-brand theming convention for `packages/design-system` by writing `CONSUMING.md`, creating `theme.shop.css` as a reference implementation, and registering it in `validate:style-mirror`.

## Background

`packages/design-system` already supports multi-brand theming in principle: `theme.pink-moon.css` exists and is mirrored to both `apps/web/src/design-system/styles/` and `packages/design-system/src/styles/`, enforced by `validate:style-mirror`. Pink Moon and Light are the only two themes that exist.

What is missing is a written contract: what a new consuming app does to apply a brand theme, which tokens are required overrides vs optional, how to register the theme file so drift is caught in CI, and how to add the theme to Storybook's theme switcher.

`theme.shop.css` is partly covered by SUG-179 (which creates it as a Stage 1 deliverable). This epic formalises the convention and closes the documentation gap so a third brand (a future client site, `apps/shop` at Stage 3) can self-serve without archaeology.

Note: `theme.shop.css` creation may land in SUG-179 before this epic runs. If so, Phase 1 here becomes a verification and documentation pass only.

## Objective

After this epic:
- `packages/design-system/CONSUMING.md` exists and is complete — a new engineer can apply a brand theme by reading one document
- `theme.shop.css` exists in both style dirs, registered in `validate:style-mirror`, and visible in Storybook's theme switcher
- The Mirrored File Registry in `CLAUDE.md` is updated to include `theme.shop.css`
- No component file is modified — theming is CSS-only

## Scope

- [ ] Write `packages/design-system/CONSUMING.md` covering: pnpm workspace install, theme file creation (semantic `--st-*` tokens only, no primitives, no raw colours), `[data-theme]` attribute convention, required vs optional token overrides, style-mirror registration steps — layer: documentation
- [ ] Create `theme.shop.css` in both `apps/web/src/design-system/styles/` and `packages/design-system/src/styles/` if not already created by SUG-179 — layer: DS tokens / theme
- [ ] Register `theme.shop.css` in `apps/web/scripts/validate-style-mirror.js` — layer: tooling
- [ ] Confirm `validate:style-mirror` passes with zero drift — layer: tooling verification
- [ ] Add `shop` theme option to Storybook's theme switcher (alongside `default` and `dark-pink-moon`) — layer: Storybook

## Acceptance criteria

- [ ] `packages/design-system/CONSUMING.md` exists and covers all five documented areas (install, theme file, `[data-theme]`, required overrides, style-mirror registration)
- [ ] `theme.shop.css` exists in both style dirs with at least one semantic token override (no raw colours)
- [ ] `pnpm validate:style-mirror` passes — zero drift between web and DS package copies of `theme.shop.css`
- [ ] Storybook theme switcher shows `shop` option and applies the theme visually
- [ ] `CLAUDE.md` Mirrored File Registry updated to include `theme.shop.css`
- [ ] No component source file modified

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes to the web app. Storybook is the verification surface.

## Technical notes

**Coordination with SUG-179:** SUG-179 creates `theme.shop.css` as an AC. This epic may run after SUG-179 ships and simply verify + document. Check whether `theme.shop.css` exists in both locations before attempting to create it.

**theme.shop.css constraints (CLAUDE.md):**
- Only `var(--st-primitive)` references as values — no hex, rgba, or hsla
- Only overrides of existing `--st-*` semantic tokens — no new token names introduced
- Byte-identical in both style dirs
- A new Contentful-facing brand colour primitive (e.g. `--st-color-shop-700`) must be added to `tokens.json` and built via `pnpm tokens:build` before being referenced in the theme file

**validate:style-mirror registration:** read `apps/web/scripts/validate-style-mirror.js` at activation to see the exact registration pattern (file list or glob) before adding `theme.shop.css`.

**Storybook theme switcher:** Activation audit: read `apps/storybook/.storybook/preview.ts` or equivalent to find where theme options are declared, then add `shop` following the same pattern.

**Model & Mode [REQUIRED]:** `/model sonnet` — documentation writing, CSS file creation, and tooling config. No architecture decisions required.

## Non-Goals

- No new `--st-*` token names introduced by the theme file itself — token names are Sugartown namespace; theme files only override values
- No `CONSUMING.md` for external npm publish — external distribution is deferred per PRD Non-Goals
- No Stage 3 (`apps/shop`) integration — that is SUG-181 scope

## Related

- **Linear:** [SUG-180](https://linear.app/sugartown/issue/SUG-180/multi-brand-ds-theming-convention-theme-file-contract-consumingmd)
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 1 (Multi-brand DS)
- **Mirrored File Registry:** `CLAUDE.md` §Mirrored File Registry
- **Token pipeline:** `tokens/source/tokens.json` + `pnpm tokens:build`
- **Epic template:** `docs/epic-template.md`
