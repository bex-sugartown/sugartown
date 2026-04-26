**Linear Issue:** [SUG-83](https://linear.app/sugartown/issue/SUG-83/retire-deprecated-data-themelightdark-css-selectors-pink-moon-cleanup)
**Phase strategy:** single close-out (all changes on one branch, one mini-release)

# SUG-83 — Retire Deprecated `[data-theme="light/dark"]` CSS Selectors

---

## Model & Mode

Use `opusplan` for the planning phase. Each selector block requires a judgment call — delete vs. migrate — that benefits from Opus reading the full token context before deciding. Sonnet executes the mechanical edits once the audit table is locked.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No new components or utilities. This is a CSS-only cleanup. Every file listed in Files to Modify has been confirmed to exist at the stated path.
- [x] **Use case coverage** — The audit must cover all 15 affected files. Each `[data-theme="light"]` / `[data-theme="dark"]` block must be classified as: (a) **delete** — the visual effect is already provided by a `theme.pink-moon.css` token override, or (b) **migrate** — the override targets a real visual difference on light/dark canvas that `theme.pink-moon.css` does not currently cover. Classification must be documented in the Selector Audit Table before any edits.
- [x] **Layout contract** — Not applicable. No structural or layout changes.
- [x] **All prop value enumerations** — Not applicable.
- [x] **Correct audit file paths** — All paths verified. See Files to Modify.
- [x] **Dark / theme modifier treatment** — Scope of this epic: `light-pink-moon` (default) and `dark-pink-moon` only. Legacy `light` and `dark` selectors are being retired. Do not introduce any new `[data-theme="light"]` or `[data-theme="dark"]` selectors.
- [x] **Studio schema changes scoped** — None. Explicitly out of scope.
- [x] **Web adapter sync scoped** — Every DS component file changed must have its matching web adapter updated in the same commit.
- [x] **Composition overlap audit** — Not applicable.
- [x] **Atomic Reuse Gate** — Not applicable. No new components.

---

## Context

The Sugartown design system shipped two legacy themes (`light`, `dark`) before Pink Moon became the canonical identity. Those themes have since been replaced by `light-pink-moon` (default) and `dark-pink-moon`. As of 2026-04-26:

- `ThemeToggle.jsx` only cycles `light-pink-moon` ↔ `dark-pink-moon`
- `index.html` valid stored values trimmed to `['light-pink-moon', 'dark-pink-moon']` (SUG-82 cleanup)
- Storybook toolbar exposes only `light-pink-moon` and `dark-pink-moon`
- `ThemeGuide.stories.tsx` updated to document only the two active themes

The 39 dead selectors (`[data-theme="light"]` × 27, `[data-theme="dark"]` × 12) remain in component CSS files. They will never fire in the live site or Storybook. They are dead code and confuse future contributors reading component stylesheets.

---

## Objective

After this epic, no component CSS file in `apps/web/src/` or `packages/design-system/src/` contains a `[data-theme="light"]` or `[data-theme="dark"]` selector. Visual overrides that were valid (e.g. colour corrections needed for a light canvas) are either confirmed already covered by `theme.pink-moon.css` token values or migrated to `[data-theme="light-pink-moon"]`. The `theme.light.css` files are marked deprecated but not deleted (external DS consumers may reference them). Storybook `preview.ts` `THEME_BG` map is tidied to remove stale entries.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | CSS-only cleanup. No doc type rendering affected. |
| `article`   | No | Same. |
| `caseStudy` | No | Same. |
| `node`      | No | Same. |
| `archivePage` | No | Same. |

---

## Scope

### Phase 1 — Selector audit (Opus, plan mode, no edits yet)

Read every selector block listed in the Selector Audit Table below. For each, check whether `theme.pink-moon.css` already overrides the relevant tokens such that the visual effect is preserved in `light-pink-moon` without the selector. Populate the Action column before writing a single line of CSS.

### Phase 2 — Execute per-file (Sonnet, one commit per component pair)

For each file:
- [ ] Delete selector blocks classified **delete**
- [ ] Rename selector to `[data-theme="light-pink-moon"]` or `[data-theme="dark-pink-moon"]` for blocks classified **migrate**
- [ ] Update DS package file and web adapter in the same commit
- [ ] Run `pnpm validate:tokens --strict-colors` — zero violations before committing

### Phase 3 — Storybook + token file tidying

- [ ] Remove stale `'dark'` and `'light'` keys from `THEME_BG` map in `apps/storybook/.storybook/preview.ts`
- [ ] Add deprecation comment to top of `apps/web/src/design-system/styles/theme.light.css`
- [ ] Add deprecation comment to top of `packages/design-system/src/styles/theme.light.css`
- [ ] Review `[data-theme="light"]` block in `packages/design-system/src/styles/tokens.css` (~line 835) — if it duplicates `:root` defaults, remove it; otherwise mark as deprecated
- [ ] Review `[data-theme="dark"]` block in `apps/web/src/design-system/styles/tokens.css` (~line 744) — if it duplicates `:root` defaults, remove it; otherwise mark as deprecated

### Close-out

- [ ] `pnpm validate:tokens` — zero errors
- [ ] `pnpm validate:tokens --strict-colors` — zero violations
- [ ] Storybook renders Chip, Accordion, Callout, CodeBlock, Button stories without visual regressions in both toolbar themes
- [ ] Mini-release + ship doc + Linear Done

---

## Selector Audit Table

**Populate the Action column during Phase 1 before executing Phase 2.**

Legend: **D** = delete (already covered by pink-moon tokens) · **M** = migrate to `light-pink-moon`/`dark-pink-moon` · **?** = flag for human review

### `[data-theme="light"]` blocks

| File | Line | What the selector does | `theme.pink-moon.css` covers it? | Action |
|------|------|------------------------|----------------------------------|--------|
| `apps/web/src/components/DraftBadge.module.css` | 23 | Badge styling on light bg | | |
| `apps/web/src/components/PageSections.module.css` | 1010 | `hr` rule in `.st-html-section` | | |
| `apps/web/src/components/ContactForm.module.css` | 128–129 | Input / textarea on light bg | | |
| `apps/web/src/components/portableTextComponents.module.css` | 22 | Divider on light bg | | |
| `apps/web/src/pages/pages.module.css` | 248 | `.detailContent hr` | | |
| `apps/web/src/pages/pages.module.css` | 259 | `.metadataDivider` | | |
| `apps/web/src/design-system/components/accordion/Accordion.module.css` | 90, 95, 100 | Item / trigger / chevron on light | | |
| `apps/web/src/design-system/components/chip/Chip.module.css` | 117–120 | seafoam / lime / amber / grey chip colours on light | | |
| `packages/design-system/src/components/Accordion/Accordion.module.css` | 89, 94, 99 | Mirror of web accordion above | | |
| `packages/design-system/src/components/Chip/Chip.module.css` | 117–120 | Mirror of web chip above | | |
| `packages/design-system/src/components/Callout/Callout.module.css` | 100, 107, 114, 121 | info / tip / warn / danger variants on light | | |
| `packages/design-system/src/styles/tokens.css` | ~835 | `[data-theme="light"]` token block — check if it duplicates `:root` | | |

### `[data-theme="dark"]` blocks

| File | Line | What the selector does | Active in dark-pink-moon? | Action |
|------|------|------------------------|--------------------------|--------|
| `apps/web/src/components/PageSections.module.css` | 102, 107 | Hero greyscale overlay `::after` / `::before` on dark | | |
| `apps/web/src/components/PageSections.module.css` | 136 | `.heroPanel` on dark | | |
| `apps/web/src/components/PageSections.module.css` | 164 | `.heroImageless .heroEyebrow` on dark | | |
| `apps/web/src/design-system/components/button/Button.module.css` | 84, 96 | Tertiary button on dark | | |
| `apps/web/src/design-system/components/codeblock/CodeBlock.module.css` | 89, 96 | CodeBlock block / inline on dark | | |
| `packages/design-system/src/components/Button/Button.module.css` | 84, 96 | Mirror of web button above | | |
| `packages/design-system/src/components/CodeBlock/CodeBlock.module.css` | 91, 98 | Mirror of web codeblock above | | |
| `apps/web/src/design-system/styles/tokens.css` | ~744 | `[data-theme="dark"]` token block — check if it duplicates `:root` | | |

---

## Query Layer Checklist

Not applicable.

---

## Schema Enum Audit

Not applicable.

---

## Themed Colour Variant Audit

This epic *is* the theme cleanup. The audit table above IS the themed colour variant audit for this epic. No additional table needed.

---

## Non-Goals

- **Deleting `theme.light.css`** — external consumers of `@sugartown/design-system` may depend on it. Mark as deprecated with a comment; do not delete.
- **Adding new theme CSS** — this epic removes dead selectors; it does not create new theme overrides beyond migrating existing ones.
- **Visual redesign** — any block classified **migrate** must produce an identical visual result to the original `[data-theme="light"]` block. No styling changes.
- **Schema or GROQ changes** — none.

---

## Technical Constraints

**Monorepo / tooling**
- Run `pnpm validate:tokens --strict-colors` from `apps/web/` after every component CSS edit. Zero violations is the gate before committing.

**DS Component → Web Adapter sync (blocking)**
- Every edit to a file in `packages/design-system/src/components/*/` must have its matching file in `apps/web/src/design-system/components/*/` updated in the same commit. These are paired — never edit one without the other.

**Do not introduce new legacy selectors**
- No new `[data-theme="light"]` or `[data-theme="dark"]` selectors may be written anywhere in this epic. If a visual override is needed, use `[data-theme="light-pink-moon"]` or `[data-theme="dark-pink-moon"]`.

**Callout in packages/design-system — note**
- `packages/design-system/src/components/Callout/Callout.module.css` has four `[data-theme="light"]` variant blocks (info, tip, warn, danger). Read `theme.pink-moon.css` carefully before classifying these — the Callout was structurally rewritten in SUG-80 and its token coverage may differ from older components.

---

## Files to Modify

**Web app components**
- `apps/web/src/components/DraftBadge.module.css`
- `apps/web/src/components/PageSections.module.css`
- `apps/web/src/components/ContactForm.module.css`
- `apps/web/src/components/portableTextComponents.module.css`
- `apps/web/src/pages/pages.module.css`

**Web DS adapter**
- `apps/web/src/design-system/components/accordion/Accordion.module.css`
- `apps/web/src/design-system/components/chip/Chip.module.css`
- `apps/web/src/design-system/components/button/Button.module.css`
- `apps/web/src/design-system/components/codeblock/CodeBlock.module.css`

**DS package (must be synced with web adapter in same commit)**
- `packages/design-system/src/components/Accordion/Accordion.module.css`
- `packages/design-system/src/components/Chip/Chip.module.css`
- `packages/design-system/src/components/Button/Button.module.css`
- `packages/design-system/src/components/CodeBlock/CodeBlock.module.css`
- `packages/design-system/src/components/Callout/Callout.module.css`

**Token files**
- `apps/web/src/design-system/styles/tokens.css` — review/remove `[data-theme="dark"]` block
- `packages/design-system/src/styles/tokens.css` — review/remove `[data-theme="light"]` block

**Theme files (deprecation comment only — do not delete)**
- `apps/web/src/design-system/styles/theme.light.css`
- `packages/design-system/src/styles/theme.light.css`

**Storybook**
- `apps/storybook/.storybook/preview.ts` — remove `'dark'` and `'light'` from `THEME_BG` map

---

## Deliverables

1. **Zero `[data-theme="light"]` selectors** in all component CSS files (excluding `theme.light.css` itself)
2. **Zero `[data-theme="dark"]` selectors** in all component CSS files (excluding the `:root`-equivalent block in `tokens.css` if retained as deprecated)
3. **Selector audit table complete** — every block classified and actioned before merge
4. **`theme.light.css`** in both locations has a deprecation comment at the top
5. **Storybook `preview.ts` `THEME_BG`** has only `'light-pink-moon'` and `'dark-pink-moon'` keys
6. **Token validator clean** — `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` both zero after all changes

---

## Acceptance Criteria

- [ ] `grep -r '\[data-theme="light"\]' apps/web/src packages/design-system/src --include="*.css" | grep -v "theme.light.css"` returns zero results
- [ ] `grep -r '\[data-theme="dark"\]' apps/web/src packages/design-system/src --include="*.css" | grep -v "tokens.css"` returns zero results (or only a deprecated comment)
- [ ] Storybook: Chip, Accordion, Callout, Button, CodeBlock stories render without visual regression in `light-pink-moon` and `dark-pink-moon` — confirmed by screenshot comparison before/after
- [ ] `pnpm validate:tokens` from `apps/web/` — zero errors
- [ ] `pnpm validate:tokens --strict-colors` from `apps/web/` — zero violations
- [ ] No new `[data-theme="light"]` or `[data-theme="dark"]` selectors introduced anywhere
- [ ] Selector audit table is fully populated (no empty Action cells) and committed as part of the epic doc before any CSS changes land

---

## Visual QA Gate

### Evidence the agent must prepare:

1. **Storybook before/after screenshots** for each component that had selectors classified **migrate** (not **delete**). Confirm the migrated selector produces the same visual output in `light-pink-moon` as the original `[data-theme="light"]` did in the old `light` theme.

2. **Token compliance**: confirm zero new hardcoded values were introduced. Run `pnpm validate:tokens --strict-colors` and report result.

3. **Cross-surface check**: navigate to at least `/articles` and one detail page in the web app with `data-theme="light-pink-moon"` and `data-theme="dark-pink-moon"`. Confirm no visual regressions in Chip, Accordion, or Button rendering.

### Human gate
Agent presents evidence above. Bex reviews. Epic does not close until "Visual QA approved."

---

## Risks / Edge Cases

- [ ] **Callout variants** — the four Callout `[data-theme="light"]` blocks (info, tip, warn, danger) were written before SUG-80's structural rewrite. The token coverage may have changed. Read `Callout.module.css` and `theme.pink-moon.css` together before classifying these — do not assume they're covered.
- [ ] **Hero dark selectors in PageSections** — the `[data-theme="dark"]` blocks in `PageSections.module.css` (hero greyscale overlay, heroPanel, heroEyebrow) may need migrating to `[data-theme="dark-pink-moon"]` if those hero styles are intentional in dark mode. Verify against the live dark-pink-moon rendering before deleting.
- [ ] **`tokens.css` `[data-theme="dark"]` block** — if this block simply re-declares the same values as `:root`, it's a no-op and safe to remove. If it overrides anything differently, those overrides need to move to `theme.pink-moon.css`. Read the block before acting.
- [ ] **External DS consumers** — `packages/design-system` is a published package. Removing selectors from it is a breaking change for any external consumer relying on `[data-theme="light"]` overrides. Mitigate by keeping `theme.light.css` intact and adding a deprecation notice. Do not remove the `[data-theme="light"]` block from `packages/design-system/src/styles/tokens.css` — mark it deprecated instead.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-83-retire-legacy-theme-selectors.md` → `docs/shipped/SUG-83-retire-legacy-theme-selectors.md`; commit: `docs: ship SUG-83 retire legacy theme selectors`
2. Confirm `git status` clean
3. Run `/mini-release SUG-83 Retire legacy theme selectors`
4. Update Linear [SUG-83](https://linear.app/sugartown/issue/SUG-83) → Done
5. Start next epic
