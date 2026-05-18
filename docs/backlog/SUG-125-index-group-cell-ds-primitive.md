---
**Epic:** SUG-125 — IndexGroup + IndexCell DS primitives — Pagination and LetterFilterStrip refactor
**Linear Issue:** [SUG-125](https://linear.app/sugartown/issue/SUG-125/indexgroup-indexcell-ds-primitives-pagination-and-letterfilterstrip)
**Status:** Backlog
**Priority:** 🟡 Medium
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Depends on:** SUG-124 (semantic rename pass — shipped; visual spec and naming locked there)
---

# SUG-125 — IndexGroup + IndexCell DS primitives

Create `IndexGroup` and `IndexCell` as DS primitives in `packages/design-system`. Refactor `Pagination` and `LetterFilterStrip` to compose from these primitives. Establishes the shared visual language for all direct-access control strips in the system.

## Background

SUG-124 established that Pagination (page navigation) and LetterFilterStrip (alphabetical filter) share a visual language — small square cells in a horizontal strip, three visual states, mono type, 0px radius, pink active — but have incompatible interaction semantics: Pagination uses `aria-current` + `disabled` for sequential navigation; LetterFilterStrip uses `aria-pressed` for toggle filtering. The correct architecture is a shared visual primitive (`IndexGroup` + `IndexCell`) that each composite component builds on, keeping their interaction layers separate.

The visual spec was locked during SUG-124 Phase 1:
- `IndexCell`: 0px border-radius, fixed square, mono type
- Active/selected: pink (`--st-color-pink`) bg, white text
- Default: transparent bg, neutral border (`--st-color-border-default`), muted text
- Hover: pink border, pink text
- Inactive (no content): muted text, transparent border, `pointer-events: none`
- Direction (`IndexGroup`): horizontal (default) or vertical — same pattern as `ButtonGroup`
- Same color language as `Chip` — neutral and pink, no secondary/tertiary colorways for this primitive

## Objective

After this epic: `IndexGroup` and `IndexCell` exist as documented DS primitives with Storybook stories and token coverage. `Pagination` and `LetterFilterStrip` are refactored to use them — their interaction logic is unchanged, only their visual layer is delegated to the primitive. Any future index-style control strip (glossary letter nav, date range filter, step indicator) has a foundation to build from.

## Scope

### Phase 1 — Token audit

- [ ] Audit existing `--st-*` tokens for the visual spec: confirm tokens for pink bg, white fg, neutral border, muted text, and the 28px cell size exist or add them — layer: tokens
- [ ] Confirm no new primitives needed beyond what Chip already uses — layer: tokens
- [ ] Run `pnpm tokens:build` if any tokens added — layer: tokens

### Phase 2 — IndexCell + IndexGroup DS primitives

- [ ] Create `packages/design-system/src/components/IndexCell/IndexCell.tsx` — props: `state: 'default' | 'active' | 'selected' | 'inactive'`, `size?: 'sm' | 'md'` (default md = 28px), `as?: 'button' | 'span'` (default button) — layer: DS package
- [ ] Create `IndexCell.module.css` — 0px radius, fixed square, mono type, three state variants — layer: DS package
- [ ] Create `packages/design-system/src/components/IndexGroup/IndexGroup.tsx` — props: `direction?: 'horizontal' | 'vertical'` (default horizontal), `gap?: 'xs' | 'sm'` (default xs = 2px) — layer: DS package
- [ ] Mirror both in `apps/web/src/design-system/components/` web adapter layer — layer: web adapter
- [ ] Export from DS package index — layer: DS package
- [ ] `pnpm validate:tokens` + `pnpm validate:tokens:strict` pass — layer: tooling

### Phase 3 — Storybook stories

- [ ] `IndexCell.stories.tsx` — all four states (default, active/hover, selected, inactive), sm + md sizes, button + span variants — layer: Storybook
- [ ] `IndexGroup.stories.tsx` — horizontal strip (letters), vertical strip, mixed active/selected/inactive states — layer: Storybook
- [ ] All stories on `default` and `dark-pink-moon` themes — layer: Storybook
- [ ] Chromatic VRT baseline — layer: Storybook

### Phase 4 — Refactor Pagination and LetterFilterStrip

- [ ] Refactor `apps/web/src/components/Pagination.jsx` to render `IndexGroup` + `IndexCell` for the page number cells; keep Prev/Next as standard buttons (they are nav controls, not index cells) — layer: frontend
- [ ] Refactor `LetterFilterStrip` in `TaxonomyArchivePage.jsx` to render `IndexGroup` + `IndexCell`; inactive letters use `as="span"` on `IndexCell` — layer: frontend
- [ ] Verify Pagination and LetterFilterStrip render identically before/after refactor (Chromatic diff should be zero) — layer: QA
- [ ] `Pagination.module.css` page button styles delegate to `IndexCell` tokens — only the `pagination` container, `navButton`, and `ellipsis` styles remain local — layer: CSS

## Acceptance criteria

- [ ] `IndexCell` and `IndexGroup` exist in `packages/design-system` with full prop API, CSS module, and Storybook stories
- [ ] `IndexCell` at 0px radius, pink active bg, neutral default — matches spec locked in SUG-124
- [ ] `IndexGroup` supports `direction: horizontal | vertical`
- [ ] Both mirrored in `apps/web/src/design-system/components/`
- [ ] `Pagination` page-number cells use `IndexCell` — Prev/Next remain independent buttons
- [ ] `LetterFilterStrip` cells use `IndexCell` via `as="span"` for inactive letters
- [ ] Chromatic diff for Pagination and LetterFilterStrip stories is zero after refactor
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens:strict` pass
- [ ] Dark mode verified on both `default` and `dark-pink-moon` themes

## Technical notes

- **IndexCell `as` prop:** inactive letters in LetterFilterStrip are `<span aria-hidden="true">`, not `<button disabled>`. The `as` prop on IndexCell handles this without a separate component.
- **Pagination Prev/Next:** these are directional nav controls (← Prev, Next →), not index cells — they should remain as standard `<button>` elements with their own `navButton` class. Only the numbered page cells delegate to IndexCell.
- **Token delta:** IndexCell's visual spec is nearly identical to Chip's neutral state. Before adding new tokens, verify whether `--st-color-chip-*` tokens (if they exist post-SUG-119) cover the need. The goal is zero new tokens if possible.
- **No radius token needed:** 0px radius is the value, not a token reference. `border-radius: 0` is acceptable here since it's intentional and not a theme variable.
- **ButtonGroup relationship:** `IndexGroup` is conceptually related to a future `ButtonGroup` (horizontal/vertical strip container). If `ButtonGroup` is scoped before this epic executes, evaluate whether `IndexGroup` can be a variant of it rather than a separate component.
- **Glossary (SUG-35):** the SUG-35 glossary archive will use `LetterFilterStrip` composed from these primitives. This epic is a soft blocker for SUG-35 resumption.

## Model & Mode [REQUIRED]

`/model opusplan` — DS primitive design requiring token audit, prop API decisions, and visual spec validation before implementation. Opus plans the token delta and component API; Sonnet executes CSS and stories.

## Non-Goals

- No new colorways on IndexCell beyond neutral/pink — secondary/tertiary variants are not in spec
- No animation beyond existing transitions — carry over from current LetterFilterStrip CSS
- No changes to Pagination interaction logic — only the visual layer changes
- No changes to LetterFilterStrip interaction logic — only the visual layer changes
- No ButtonGroup component — out of scope unless it directly enables IndexGroup reuse

## Related

- **Linear:** [SUG-125](https://linear.app/sugartown/issue/SUG-125/indexgroup-indexcell-ds-primitives-pagination-and-letterfilterstrip)
- **Triggered by:** [SUG-124](https://linear.app/sugartown/issue/SUG-124) — semantic rename audit; visual spec and naming decisions live there
- **Soft blocks:** SUG-35 (Glossary archive — LetterFilterStrip is the pattern it uses)
- **Related:** SUG-116 (Ledger Button update — same token graph)
- **Affected files:**
  - `packages/design-system/src/components/IndexCell/` (new)
  - `packages/design-system/src/components/IndexGroup/` (new)
  - `apps/web/src/design-system/components/index-cell/` (new)
  - `apps/web/src/design-system/components/index-group/` (new)
  - `apps/web/src/components/Pagination.jsx` + `Pagination.module.css`
  - `apps/web/src/pages/TaxonomyArchivePage.jsx` (LetterFilterStrip)
  - `apps/web/src/pages/TaxonomyArchivePage.module.css` (letterFilter* classes)
