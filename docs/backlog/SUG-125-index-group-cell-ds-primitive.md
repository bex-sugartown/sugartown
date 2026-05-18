# SUG-125 — IndexGroup + IndexCell DS Primitives

**Linear Issue:** [SUG-125](https://linear.app/sugartown/issue/SUG-125/indexgroup-indexcell-ds-primitives-pagination-and-letterfilterstrip)
**Status:** Backlog
**Depends on:** SUG-124 (semantic naming audit, merged)

---

## Background

SUG-124 renamed `AlphaStrip`/`alphaBtn` to `AlphaFilter`/`indexCell` in `TaxonomyArchivePage`. That rename surfaced that two existing composite components — `AlphaFilter` and `Pagination` — share the same visual language: a horizontal strip of square cells, 0px radius, pink active state, neutral default, disabled/inactive variant. They are structurally the same pattern rendered with different data.

Neither component currently shares CSS. Each defines its own button/cell styles. This means visual drift is inevitable as the system grows — any new direct-access control strip (tag cloud filters, step indicators, anchor nav) will reimplement the same shape a third time.

`IndexGroup` and `IndexCell` are the DS primitives that codify this shared visual language once.

---

## Scope

### DS Primitives (new — `packages/design-system/src/components/`)

**`IndexCell`** — single interactive square cell.

Props:
- `state: 'default' | 'active' | 'selected' | 'inactive'`
- `as: 'button' | 'a' | 'span'` (default: `button`)
- `href?: string` (when `as="a"`)
- `onClick?: () => void`
- `aria-pressed?: boolean`
- `children: ReactNode`

Visual spec:
- 28×28px, 0px radius
- `default`: border `1px solid --st-color-border-default`, transparent bg, text `--st-color-text-muted` — same neutral border as Chip default state
- `active`: border `1px solid --st-color-border-default`, text `--st-color-text-muted`; hover: pink border + pink text
- `selected`: pink bg, pink border, white text; hover: maroon bg + maroon border
- `inactive`: transparent border, muted text, `pointer-events: none`
- Font: mono 0.6875rem 600, uppercase

**`IndexGroup`** — container for a row of `IndexCell` elements.

Props:
- `children: ReactNode`
- `label?: string` (aria-label, default: "Index navigation")

Visual spec:
- `display: flex; flex-wrap: wrap; gap: 2px`
- No background, no border

### Web adapter layer (`apps/web/src/design-system/components/`)

Mirror both primitives per standard DS mirror convention.

### Composite consumer refactors

Once primitives exist, refactor the two composite consumers to consume them:

**`AlphaFilter`** (currently in `TaxonomyArchivePage.jsx`):
- Extract to `apps/web/src/components/AlphaFilter.jsx`
- Replace local `indexCell`/`indexGroup` CSS with DS `IndexCell`/`IndexGroup` components
- Props: `activeLetters: Set<string>`, `filterLetter: string | null`, `onSelect: (letter: string) => void`

**`Pagination`** (`apps/web/src/components/Pagination.jsx`):
- Replace existing button elements with `IndexCell` components
- Keep existing props API unchanged (`currentPage`, `totalPages`, `onPageChange`)

### Tokens (new, in `tokens/source/tokens.json`)

```
--st-index-cell-size: 28px
--st-index-cell-gap: 2px
--st-index-cell-font-size: 0.6875rem
--st-index-cell-weight: 600
```

Color states use existing primitives (`--st-color-pink`, `--st-color-maroon`, `--st-color-border-default`, `--st-color-text-muted`, `--st-color-white`).

### Storybook stories

- `IndexCell.stories.jsx` — all 4 states, as button + as anchor — category: `Composite`
- `IndexGroup.stories.jsx` — full 27-letter strip, partial strip, single-column variant — category: `Composite`
- `AlphaFilter.stories.jsx` — full strip, filtered state, no-results state — category: `Patterns`
- `Pagination.stories.jsx` — single page, multi-page, edge pages — category: `Patterns`
- Dark mode coverage required on all four

---

## Acceptance criteria

- [ ] `IndexCell` and `IndexGroup` exist in `packages/design-system/src/components/`
- [ ] Web adapter mirrors exist in `apps/web/src/design-system/components/`
- [ ] `AlphaFilter` extracted to `apps/web/src/components/AlphaFilter.jsx` and consumes primitives
- [ ] `Pagination` refactored to consume `IndexCell`
- [ ] Tokens added and `pnpm tokens:build` passes
- [ ] `validate:tokens` → 0 errors; `validate:css-names` → 0 violations
- [ ] Storybook stories for both primitives including dark mode
- [ ] No visual regression on `/tags`, `/categories`, and any paginated archive page

---

## Phase 0 note

`IndexCell` is a variant of an existing visual pattern (square chip, pink active). The spec above is the Phase 0 — no additional HTML mock required. Sign-off on this doc is the Phase 0 gate. Confirm before opening an implementation session.
