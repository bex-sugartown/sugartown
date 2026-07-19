---
**Epic:** SUG-104 — Listview updates — archives and taxonomies
**Linear Issue:** [SUG-104](https://linear.app/sugartown/issue/SUG-104)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-104 — Listview updates — archives and taxonomies

Implement net-new layout patterns and component styles for archive and taxonomy pages, based on the Claude Design handoff. Covers person profile split-column layout, brand-dot bullet lists, expertise chips (brand-soft variant), alpha jump-bar, letter-bucket grid, view toggle, filter bar stripe, and content-row hover affordance.

## Background

Archive and taxonomy pages (Tags, Categories, Projects, People, Tools) currently use placeholder or minimal layouts — `TaxonomyArchivePage` renders a generic listing with no index structure, and `PersonProfilePage` renders a flat single-column layout with comma-separated roles text. The Claude Design system produced mocks that introduce 8 net-new layout patterns to make these pages functional and visually coherent at the system level. All 8 patterns reuse existing Pink Moon tokens with no new token introductions — only CSS layout and a single chip color variant are net-new. This epic implements those patterns in the web app without touching Sanity schema.

## Objective

After this epic, archive and taxonomy pages have production-quality layouts matching the design handoff: the Tags/Categories index has a scannable letter-bucket grid with A–Z jump bar, the Projects page uses the view toggle + filter bar, PersonProfilePage uses a 320px/1fr split column with brand-dot role list and expertise chips, and all content rows have the hover lift affordance. The Design System gains two promoted primitives: `.st-list--marked` (brand-dot vertical list) and `.st-chip--brand-soft` (pink-tinted chip variant). No Sanity schema changes. No GROQ query changes.

## Scope

### Design System primitives (layer: DS / CSS)
- [ ] Add `.st-list--marked` to DS — 4×4 pink dot `::before` bullet, hairline-separated rows, 15px UI font — layer: `packages/design-system/src/` + `apps/web/src/design-system/`
- [ ] Add `.st-chip--brand-soft` variant to DS Chip — `--st-color-pink-50` bg, `--st-color-maroon` fg, `rgba(255,36,125,0.25)` border — layer: `packages/design-system/src/components/Chip/`
- [ ] Add Storybook stories for both new primitives — layer: `apps/storybook/`

### PersonProfilePage (layer: frontend)
- [ ] Implement `lv-twocol--split` two-column grid: 320px folio / 1fr content stream at ≥1024px, single-column below — layer: `apps/web/src/pages/PersonProfilePage.jsx` + CSS module
- [ ] Render roles as `.st-list--marked` vertical list with `Roles & Titles` eyebrow heading — replacing comma-separated text
- [ ] Render expertise tags as `.st-chip--brand-soft` wrapping row with `Expertise` eyebrow heading

### Taxonomy index pages — TaxonomyArchivePage (layer: frontend)
- [ ] `lv-tax-grid` letter-bucket grid: `repeat(3, 1fr)` at desktop, 2-col modifier, single-col below 720px — layer: `apps/web/src/pages/TaxonomyArchivePage.jsx` + CSS module
- [ ] Letter glyph header: Cormorant Garamond 28px / 600, `--st-color-pink`, paired 1px flex rule
- [ ] A–Z alpha jump-bar strip above the grid: active letters link to anchors, inactive letters dim non-interactive — states: default muted / `.is-active` pink / `.is-disabled` border-medium
- [ ] Filter bar stripe: search input + sort buttons, `is-active` sort button takes pink fill + white text, search focus border pink — layer: `apps/web/src/pages/TaxonomyArchivePage.jsx`

### View toggle (layer: DS + frontend)
- [ ] `lv-section__viewtoggle` two-button square segmented control: 32×32px, no border-radius, merged hairline borders, active = pink fill + white icon — layer: DS + `TaxonomyArchivePage`

### Content row hover (layer: frontend / CSS)
- [ ] Add hover affordance to all content rows across archive pages: `translateY(-1px)`, border → `--st-color-pink`, `--st-shadow-card` — layer: existing row card CSS module(s)
- [ ] Title underline on row hover: 1px `currentColor`, 3px offset, deferred (not shown until hover)

### Storybook
- [ ] Stories for: `PersonProfilePage` states, `TaxonomyArchivePage` grid (3-col / 2-col), filter bar, alpha strip, view toggle, content row hover

## Phases

Single branch, ship together. Logical execution order within the branch:

1. DS primitives first (`.st-list--marked`, `.st-chip--brand-soft`) — unblock page work
2. PersonProfilePage — layout + roles + expertise
3. TaxonomyArchivePage — letter grid + alpha bar + filter bar + view toggle
4. Content row hover — shared across pages
5. Storybook stories for all of the above
6. `pnpm validate:tokens` + `pnpm validate:tokens --strict-colors` — zero errors
7. Close-out: mini-release, Linear Done

## Acceptance criteria

- [ ] `PersonProfilePage` renders 320px/1fr at ≥1024px; collapses to single column at 1023px
- [ ] Roles list renders with brand-dot bullets (4×4 pink, hairline-separated rows); no comma-separated fallback
- [ ] Expertise chips use brand-soft treatment (pink-50 bg, maroon fg); pass `pnpm validate:tokens --strict-colors`
- [ ] Tags/Categories index renders letter buckets in 3-column grid; each letter stays in its own column (no CSS `columns` wrapping)
- [ ] A–Z strip: active letters are pink links with anchor targets; inactive letters are non-interactive at border-medium colour
- [ ] Filter bar sort active state: pink fill + white text; search focus border = `--st-color-pink`
- [ ] View toggle: 32×32px square, active button = pink fill + white icon
- [ ] Content row hover: 1px lift, pink border, card shadow
- [ ] `pnpm validate:tokens` — zero undefined reference errors
- [ ] `pnpm validate:tokens --strict-colors` — zero hardcoded colour violations
- [ ] Storybook stories cover all new surfaces (new primitives + updated pages)
- [ ] Light and dark Pink Moon themes both render correctly — theme switch not broken

## Technical notes

- **No schema changes.** All data already present in GROQ results — `PersonProfilePage` already fetches `roles[]` and `expertise[]` (or equivalent fields). Activation audit: read `PersonProfilePage.jsx` + `queries.js` to confirm field names before writing render code.
- **No new tokens.** All colour references use existing `--st-color-pink`, `--st-color-pink-50`, `--st-color-maroon`, `--st-color-text-muted`, `--st-color-border-subtle`, `--st-color-border-medium`, `--st-shadow-card`. Run `pnpm validate:tokens` after DS changes.
- **DS primitive first, page second.** `.st-list--marked` and `.st-chip--brand-soft` must be committed before PersonProfilePage uses them — avoids inline re-implementation.
- **`lv-tax-grid` vs CSS `columns`.** The design handoff explicitly calls out why CSS `columns` is wrong for letter buckets (scrambles across visual columns). Use CSS Grid `repeat(3, 1fr)` with `align-items: start` so each column's height is determined by its content.
- **Activation audit:** read `apps/web/src/pages/TaxonomyArchivePage.jsx`, `PersonProfilePage.jsx`, and `apps/web/src/lib/queries.js` before writing any render code — confirm how roles/expertise are structured in the query result and what the current taxonomy list data shape is.
- **Model recommendation:** schema-free frontend + DS epic → `/model sonnet`

### Design handoff reference

The following net-new patterns are specified in the handoff doc attached to this epic:

| Pattern | Location |
|---------|----------|
| Brand-dot bullet list | `lv-roles__list` → promote to `.st-list--marked` |
| Brand-soft chip | `lv-expertise__chip` → promote to `.st-chip--brand-soft` |
| Split-column layout | `lv-twocol--split` — person page only |
| Letter-bucket grid | `lv-tax-grid` — Tags, Categories, Glossary |
| A–Z jump bar | `lv-alpha-strip` — above any letter-bucket grid |
| View toggle | `lv-section__viewtoggle` — 32×32 square, pink active |
| Filter bar stripe | `lv-filterbar` — search + sort |
| Row hover affordance | All content row cards — lift + pink border + shadow |

## Non-Goals

- No Sanity schema changes — this epic is purely frontend/DS.
- No new design tokens — all colour/type/spacing resolves through existing Pink Moon tokens.
- No changes to Cards (`ContentCard`, `MetadataCard`) — row hover targets the wrapper element, not Card internals.
- No `TaxonomyDetailPage` changes beyond content-row hover — tag/category detail pages are out of scope.
- Suggestions A–H from the handoff doc (token width promotion, `--st-width-rail`, status pill alignment, etc.) are explicitly deferred — they are hygiene items, not blockers for this epic.
- No responsive breakpoint work below 720px beyond the single-column collapse already specified in the handoff.

## Related

- **Linear:** [SUG-104](https://linear.app/sugartown/issue/SUG-104)
- **Design handoff:** referenced in Linear issue description (Claude Design, 2026-05)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
