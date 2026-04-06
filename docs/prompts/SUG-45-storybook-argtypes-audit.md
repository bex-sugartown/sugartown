# SUG-45 — Storybook argTypes Audit

**Linear Issue:** SUG-45
**Status:** Todo
**Depends on:** SUG-46 (story files must exist before controls can be polished)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — no new components; this epic modifies existing `.stories.tsx` files only
- [x] **Use case coverage** — N/A (no new API surface)
- [x] **Layout contract** — N/A (no rendered sections)
- [x] **All prop value enumerations** — this IS the prop enumeration pass
- [x] **Dark / theme modifier treatment** — N/A (controls, not rendering)
- [x] **Studio schema changes scoped** — none
- [x] **Web adapter sync scoped** — N/A
- [x] **Composition overlap audit** — N/A
- [x] **Atomic Reuse Gate** — N/A (no new components, schemas, or CSS surfaces)

---

## Context

After the Storybook v7→v10 upgrade path (SUG-38 → SUG-41), many story controls render as raw JSON editors instead of toggles, dropdowns, or radio buttons. Storybook 10 is stricter about inferring control types from props — complex objects and unions default to JSON scaffolds unless explicit `argTypes` are defined.

This makes stories less useful for non-developer stakeholders (designers, PMs) who want to explore component variants interactively.

---

## Objective

Audit all story files and add explicit `argTypes` so every prop has the correct interactive control: booleans get toggles, enums get dropdowns, colours get pickers, and internal props are hidden.

---

## Scope

### Batch 1 — Primitives (DS components — typed props, easiest to derive)

- [ ] Accordion — expand mode (single/multi), items
- [ ] Blockquote — citation, source
- [ ] Button — variant, size, disabled, loading
- [ ] Callout — variant, icon, dismissible
- [ ] Card — variant, density, accentColor
- [ ] Chip — variant, color, href
- [ ] Citation — index, children
- [ ] CodeBlock — language, showLineNumbers
- [ ] ContentNav — items, activeId
- [ ] FilterBar — filters, activeFilters
- [ ] Media — variant, overlay, aspect ratio
- [ ] Table — variant, columns, data

### Batch 2 — Patterns (data-aware adapters — may need fixture presets)

- [ ] ContentCard — docType variants (node, article, caseStudy), status, evolution
- [ ] DraftBadge — hasDraft, isPublished
- [ ] MetadataCard — field grid, metadata array
- [ ] Pagination — currentPage, totalPages, onPageChange
- [ ] TaxonomyChips — chips array, colorHex
- [ ] ThemeToggle — current theme

### Batch 3 — Layout (page-level — complex props, most benefit from presets)

- [ ] Footer — siteSettings, nav items
- [ ] Header — siteSettings, nav items, currentPath
- [ ] Hero — variant, backgroundImage, overlay
- [ ] MobileNav — isOpen, nav items
- [ ] Preheader — text, links

---

## Approach per story file

For each story:

1. **Inventory every prop** and its current control type (toggle, dropdown, JSON, none)
2. **Add explicit `argTypes`** where Storybook 10 defaults are wrong:
   - Booleans → `control: 'boolean'`
   - Enums/unions (variant, density, status, evolution) → `control: 'select'` with `options`
   - Strings → `control: 'text'`
   - Colors → `control: 'color'`
3. **Complex object props** (e.g. `item` on ContentCard, `siteSettings` on Header):
   - If small number of meaningful states → named presets via multiple stories or `argTypes.mapping`
   - If truly freeform → keep JSON but add `description`
4. **Hide internal/passthrough props** via `argTypes: { className: { table: { disable: true } } }`

---

## Non-Goals

- **New stories** — this epic polishes controls on existing stories only
- **New components** — no new DS or web components
- **Visual changes** — no CSS or rendering changes
- **CSF Factories migration** — stories stay in CSF3 format

---

## Acceptance Criteria

- [ ] Every boolean prop has a toggle control
- [ ] Every enum/union prop has a dropdown or radio control
- [ ] No prop that could be a simple control renders as raw JSON
- [ ] Complex object props have either named presets or clear descriptions
- [ ] Internal/passthrough props (className, children on wrappers) are hidden
- [ ] Each batch committed and pushed before starting the next

---

## Files to Modify

**Batch 1 — Primitives:**
- `packages/design-system/src/components/Accordion/Accordion.stories.tsx`
- `packages/design-system/src/components/Blockquote/Blockquote.stories.tsx`
- `packages/design-system/src/components/Button/Button.stories.tsx`
- `packages/design-system/src/components/Callout/Callout.stories.tsx`
- `packages/design-system/src/components/Card/Card.stories.tsx`
- `packages/design-system/src/components/Chip/Chip.stories.tsx`
- `packages/design-system/src/components/Citation/Citation.stories.tsx`
- `packages/design-system/src/components/CodeBlock/CodeBlock.stories.tsx`
- `packages/design-system/src/components/ContentNav/ContentNav.stories.tsx`
- `packages/design-system/src/components/FilterBar/FilterBar.stories.tsx`
- `packages/design-system/src/components/Media/Media.stories.tsx`
- `packages/design-system/src/components/Table/Table.stories.tsx`

**Batch 2 — Patterns:**
- `apps/web/src/components/ContentCard.stories.tsx`
- `apps/web/src/components/DraftBadge.stories.tsx`
- `apps/web/src/components/MetadataCard.stories.tsx`
- `apps/web/src/components/Pagination.stories.tsx`
- `apps/web/src/components/TaxonomyChips.stories.tsx`
- `apps/web/src/components/ThemeToggle.stories.tsx`

**Batch 3 — Layout:**
- `apps/web/src/components/Footer.stories.tsx`
- `apps/web/src/components/Header.stories.tsx`
- `apps/web/src/components/Hero.stories.tsx`
- `apps/web/src/components/MobileNav.stories.tsx`
- `apps/web/src/components/Preheader.stories.tsx`

---

*Created 2026-04-04. Depends on SUG-46 completing Phases 1–4 (story files must exist).*
