**Linear Issue:** SUG-157 _(create the Linear issue, then confirm ID here)_

## EPIC NAME: PageHeader DS Pattern Component

---

## Model & Mode

`opusplan` for Phase 0 review and phases 1–2 planning. Sonnet for execution (phases 3–5 are mechanical file operations).

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — PageHeader is a new pattern component with no existing equivalent across any layer. Existing pages (ArchivePage, ArticlesArchivePage, TaxonomyArchivePage, etc.) each render their own ad-hoc heading block inline — no shared pattern exists. This epic creates the shared pattern and replaces the inline blocks. All subcomponents it composes (Breadcrumb, Avatar, MetadataCard/Card) already exist in the DS — no new primitives needed.
- [x] **Use case coverage** — four consumer contexts: (a) archive pages — breadcrumb + title + count + description; (b) entity/folio pages — breadcrumb + media + eyebrow + title + description + metadataCard + tint; (c) taxonomy detail pages — breadcrumb + eyebrow + title + count + description; (d) any page with edit access — + actions slot. All covered by the ReactNode slot API. No cross-package import deps — breadcrumb is a ReactNode (caller passes `<Breadcrumb items={...} />`), not BreadcrumbItem[].
- [x] **Layout contract** — full-width root, inner container at `max-width: var(--st-width-archive)` (960px) with `var(--st-page-gutter)` padding. topRow: flex row, breadcrumb left + actions right. body: flex row, media (shrink:0) left + content stack (flex:1) right. metadataCard: full-width below body at `margin-top: var(--st-space-5)`. Responsive: ≤520px body stacks vertically, title steps down to `--st-font-size-2xl`.
- [x] **All prop value enumerations** — no enum/select props. All slots are optional ReactNode or primitive (string/number). Only required prop is `title: string`.
- [x] **Correct audit file paths** — handoff source files confirmed at `/tmp/pageheader-handoff/design_handoff_PageHeader/`. Target DS path: `apps/web/src/design-system/components/PageHeader/`. DS barrel: `apps/web/src/design-system/index.js`. Storybook: `apps/storybook/src/stories/`.
- [x] **Dark / theme modifier treatment** — handled entirely via DS token inheritance. All color values reference `--st-color-*` and `--st-font-*` tokens which already carry theme overrides. The tint mechanism uses `color-mix(in srgb, var(--page-header-tint) 10%, var(--st-color-bg-surface))` — inherits the surface token's theme override automatically. No explicit dark mode props needed.
- [x] **Studio schema changes scoped** — none. Pure DS/frontend epic. No schema changes.
- [x] **Web adapter sync scoped** — web adapter IS the deliverable. `apps/web/src/design-system/components/PageHeader/` is the adapter layer (JSX + CSS module). This is in scope as Phase 3. `packages/design-system/src/` is not touched (web adapter pattern, matching Breadcrumb, FilterBar, etc.).
- [x] **Composition overlap audit** — PageHeader accepts MetadataCard as an opaque ReactNode slot; it does not own MetadataCard's internals and has no field overlap. Breadcrumb is a ReactNode slot — no BreadcrumbItem type imported, no internal nav logic.
- [x] **Atomic Reuse Gate** — (1) no existing equivalent across any layer confirmed; (2) consumed by 7+ pages (archive pages, entity detail pages, taxonomy pages); (3) API is composable — all slots are ReactNode, tint is a CSS value string passed through to a CSS custom property, no hardcoded values.
- [x] **Component registry update** — new row to be added to `docs/conventions/component-registry.md` in Phase 3 commit.

---

## Context

The codebase currently has no shared page header component. Each archive, entity, and taxonomy page renders its own heading block inline — duplicating the breadcrumb + title + description + count pattern with inconsistent markup and spacing. Pages affected:

- `apps/web/src/pages/ArticlesArchivePage.jsx` — inline heading
- `apps/web/src/pages/CaseStudiesArchivePage.jsx` — inline heading
- `apps/web/src/pages/KnowledgeGraphArchivePage.jsx` — inline heading
- `apps/web/src/pages/TaxonomyArchivePage.jsx` — inline heading
- `apps/web/src/pages/TaxonomyDetailPage.jsx` — inline heading (eyebrow + title + count)
- `apps/web/src/pages/ProjectDetailPage.jsx` — accentBar + inline heading + MetadataCard (the most complete variant)
- Entity detail pages (via TaxonomyDetailPage for Person, Tool) — eyebrow + avatar + title + description + MetadataCard

Design system handoff package delivered as a zip: `docs/briefs/design-system/audit-26-06-03/`. Handoff files extracted to `/tmp/pageheader-handoff/design_handoff_PageHeader/` and renamed `.reference` to prevent bundler collision during authoring:

- `PageHeader.tsx.reference` — component source (full implementation)
- `PageHeader.module.css.reference` — CSS module (all DS tokens, color-mix tint)
- `PageHeader.stories.tsx.reference` — 7 Storybook stories with mock subcomponents
- `COMPONENT_README.md` — anatomy, token table, non-goals

SUG-156 (Pages/ Storybook stories) added `EntityDetailPage.stories.jsx` and `TaxonomyDetailPage.stories.jsx` that mock the PageHeader pattern ad-hoc. This epic replaces those mocks with the real component and connects it to production pages.

The DS web adapter pattern in this repo: components live in `apps/web/src/design-system/components/<ComponentName>/` as JSX + CSS module. They are exported from `apps/web/src/design-system/index.js`. The web app does NOT import from `@sugartown/design-system` (the package) directly. Breadcrumb and FilterBar are examples of this same adapter pattern.

---

## Objective

After this epic, `PageHeader` exists as a shared DS pattern component in `apps/web/src/design-system/components/PageHeader/`. It is exported from the DS barrel, has 7 Storybook stories under `Patterns/PageHeader`, and is wired into all archive, entity, and taxonomy production pages — replacing per-page inline heading blocks. The tint mechanism (color-mix at 10% over surface) is live on entity/folio pages. MetadataCard and Breadcrumb are accepted as opaque ReactNode slots with no cross-package type dependencies.

No Sanity schema changes. No GROQ query changes. Pure DS/frontend.

---

## Scope

### In scope

- `PageHeader` JSX component at `apps/web/src/design-system/components/PageHeader/PageHeader.jsx`
- `PageHeader.module.css` — all styles from handoff reference, all DS tokens
- `apps/web/src/design-system/components/PageHeader/index.js` — re-export
- DS barrel update: `apps/web/src/design-system/index.js` — add PageHeader export
- Storybook stories: 7 stories at `apps/storybook/src/stories/PageHeader.stories.jsx` (converted from `.tsx.reference`, using real DS components instead of mocks)
- Component registry row: `docs/conventions/component-registry.md`
- Production page wiring (7 pages):
  - `ArticlesArchivePage.jsx` — replace inline heading with `<PageHeader>`
  - `CaseStudiesArchivePage.jsx` — replace inline heading with `<PageHeader>`
  - `KnowledgeGraphArchivePage.jsx` — replace inline heading with `<PageHeader>`
  - `TaxonomyArchivePage.jsx` — replace inline heading with `<PageHeader>`
  - `TaxonomyDetailPage.jsx` — replace inline heading with `<PageHeader>` (+ eyebrow from taxonomy type)
  - `ProjectDetailPage.jsx` — replace accentBar + inline heading with `<PageHeader tint={colorHex}>` + MetadataCard slot
  - Entity folio pages as rendered by `TaxonomyDetailPage` for Person/Tool — media + eyebrow + tint

### Out of scope

- `packages/design-system/src/` — web adapter only, not touching the shared DS package
- CMS fields, GROQ queries, Sanity schema — none
- FilterBar integration — FilterBar sits below PageHeader in the page layout, not inside it
- Sticky/scroll behavior — handled at page layout level if ever needed
- Dark mode explicit testing — token inheritance covers this; Storybook dark-pink-moon story confirms it

---

## Key Decisions (locked in handoff)

| Decision | Rationale |
|----------|-----------|
| `breadcrumb` is `ReactNode` not `BreadcrumbItem[]` | No cross-package import dep; caller passes `<Breadcrumb items={...} />` |
| Tint via `color-mix` at 10% | Low opacity tinting without hardcoded hex fallbacks; inherits surface token |
| All styles via `--st-*` DS tokens | Every token in the CSS confirmed present in `tokens.css` |
| `eyebrow` naming (not `subtitle`) | Matches Card's `eyebrow` — type qualifier before title, not description after |
| `metadataCard` is `ReactNode` | PageHeader does not own MetadataCard internals |
| Web adapter pattern (not DS package) | Consistent with Breadcrumb, FilterBar — JSX adapter in apps/web |

---

## Tokens confirmed present

All tokens used in `PageHeader.module.css.reference` have been verified in `apps/web/src/design-system/styles/tokens.css`:

| Token | Role |
|-------|------|
| `--st-color-bg-surface` | root background |
| `--st-color-border-default` | bottom border |
| `--st-width-archive` | inner max-width (960px) |
| `--st-page-gutter` | horizontal padding |
| `--st-space-2` through `--st-space-6` | spacing |
| `--st-font-family-narrative` | title (Cormorant Garamond) |
| `--st-font-family-mono` | eyebrow, count |
| `--st-font-family-ui` | description (DM Sans) |
| `--st-font-heading-2` | title size (2.25rem) |
| `--st-font-size-sm`, `--st-font-size-md`, `--st-font-size-2xl` | count, description, responsive title |
| `--st-font-weight-normal` | title weight |
| `--st-label-size`, `--st-label-weight`, `--st-label-tracking` | eyebrow type |
| `--st-line-height-tight`, `--st-line-height-normal` | title, eyebrow |
| `--st-color-text-default`, `--st-color-text-secondary`, `--st-color-text-muted` | title, description, eyebrow/count |

---

## Phases

### Phase 0 — Visual QA gate

No HTML mock needed — full implementation spec is in the handoff files. Phase 0 for this epic is a review of the handoff CSS against production page state. Gate: user confirms the handoff layout matches intent before any code is written.

**Visual QA checklist (present to user, wait for "Visual QA approved"):**

| Element | Spec (handoff) |
|---------|---------------|
| Root background | `--st-color-bg-surface` (tinted variant: color-mix 10%) |
| Bottom border | `1px solid --st-color-border-default` |
| Inner max-width | `--st-width-archive` (960px) |
| topRow | flex, breadcrumb left + actions right, `gap: --st-space-4`, `margin-bottom: --st-space-5` |
| body | flex row, media left (shrink:0), content right (flex:1), `gap: --st-space-5` |
| eyebrow | mono, `--st-label-size` / `--st-label-weight` / `--st-label-tracking`, uppercase, `--st-color-text-muted` |
| title | narrative font, `--st-font-heading-2` (2.25rem), weight 400, `--st-color-text-default` |
| count badge | mono, `--st-font-size-sm`, `--st-color-text-muted`, baseline-aligned with title |
| description | UI font, `--st-font-size-md`, `--st-color-text-secondary`, `max-width: 62ch` |
| metadataCard slot | full-width, `margin-top: --st-space-5` |
| Responsive ≤520px | body stacks, title steps down to `--st-font-size-2xl` |

### Phase 1 — DS component

Files to create:
```
apps/web/src/design-system/components/PageHeader/
  PageHeader.jsx          ← from PageHeader.tsx.reference (convert to JS)
  PageHeader.module.css   ← from PageHeader.module.css.reference (copy verbatim)
  index.js                ← export { PageHeader } from './PageHeader'
```

**Conversion notes (TSX → JSX):**
- Remove all TypeScript type annotations and `interface PageHeaderProps {}`
- Remove `React.CSSProperties` cast — just pass the object directly as `style`
- Keep all logic intact: `tintStyle`, `hasTopRow`, conditional class joins, slot checks

DS barrel update — `apps/web/src/design-system/index.js`: add `export { PageHeader } from './components/PageHeader'`

Commit: `feat(sug-157): add PageHeader DS pattern component`

### Phase 2 — Component registry

Update `docs/conventions/component-registry.md` — add row:

| Component | Category | Storybook | Dark mode | DS primitive | Notes |
|-----------|----------|-----------|-----------|--------------|-------|
| PageHeader | Patterns | Patterns/PageHeader | Token inheritance | Web adapter | Composes Breadcrumb, Avatar, MetadataCard as ReactNode slots |

Commit: bundled with Phase 3 or standalone `docs(sug-157): register PageHeader in component registry`

### Phase 3 — Storybook stories

File: `apps/storybook/src/stories/PageHeader.stories.jsx`

Convert `PageHeader.stories.tsx.reference` to JSX (remove TS types). Replace mock subcomponents with real DS imports:
- `MockBreadcrumb` → `import { Breadcrumb } from '../../../apps/web/src/design-system'` (or relative path matching Storybook setup)
- `MockAvatar` → `import { Avatar } from '../../../apps/web/src/design-system'`
- `MockMetadataCard` → `import MetadataCard from '../../../apps/web/src/components/MetadataCard'` (app-level component)
- `MockButton` → `import { Button } from '../../../apps/web/src/design-system'`

Stories to ship (7):
1. `ArchiveDefault` — Archive: Articles (breadcrumb + title + count + description)
2. `ArchiveLibrary` — Archive: Library (no breadcrumb, title + count)
3. `EntityPersonFolio` — Entity: Person Folio (all slots, tint seafoam-300)
4. `EntityToolFolio` — Entity: Tool Folio (eyebrow + title + description + tint midnight-300 + MetadataCard)
5. `TaxonomyTagDetail` — Taxonomy: Tag Detail (breadcrumb + eyebrow + title + count + description)
6. `WithActions` — With Actions slot (edit button top-right)
7. `Snapshot` — Chromatic snapshot (stacked variants, fullscreen)

All stories: `parameters: { layout: 'fullscreen' }` (bypasses the 960px story wrapper per Storybook decorator).

Verify dark-pink-moon theme renders correctly for all stories before marking phase done.

Commit: `feat(sug-157): add PageHeader Storybook stories (Patterns/PageHeader)`

### Phase 4 — Production page wiring

Wire PageHeader into each production page. Pattern for each page:

```jsx
import { PageHeader } from '../design-system'

// Replace existing inline heading block with:
<PageHeader
  breadcrumb={<Breadcrumb items={[...]} />}
  title={...}
  count={...}          // archive/taxonomy only
  description={...}
  eyebrow={...}        // taxonomy detail / entity pages only
  media={...}          // entity pages only
  tint={...}           // entity pages only — from colorHex or taxonomy type map
  metadataCard={...}   // entity/project pages only
/>
```

Pages and their prop sets:

| Page | breadcrumb | title | count | description | eyebrow | media | tint | metadataCard |
|------|-----------|-------|-------|-------------|---------|-------|------|--------------|
| ArticlesArchivePage | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| CaseStudiesArchivePage | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| KnowledgeGraphArchivePage | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| TaxonomyArchivePage | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| TaxonomyDetailPage | ✓ | ✓ | ✓ | ✓ | taxonomy type label | Avatar if person | tint from type map | MetadataCard if metadata exists |
| ProjectDetailPage | ✓ | ✓ | — | ✓ | "PROJECT" | — | colorHex | MetadataCard |

**Tint source for entity types:** define a `TINT_MAP` in the page (or in routes.js if reused) mapping taxonomy `_type` or content type to a DS color token string. Examples:
```js
const TINT_MAP = {
  person: 'var(--st-color-seafoam-300)',
  tool: 'var(--st-color-midnight-300)',
  project: null,  // uses colorHex from document
}
```

**ProjectDetailPage:** replaces the current accentBar `<div>` + inline heading. The `tint` prop on PageHeader replaces the color bar. Pass `tint={colorHex}` where `colorHex` is the Sanity document field.

Commit: `feat(sug-157): wire PageHeader into production archive and entity pages`

### Phase 5 — Visual QA and close-out

- Compare each production page heading against the Phase 0 visual QA checklist
- Confirm tint renders on ProjectDetailPage and TaxonomyDetailPage entity variants
- Confirm no regression in FilterBar positioning (it sits below PageHeader, not inside)
- Run `pnpm validate:tokens` — zero errors
- Storybook: confirm Patterns/PageHeader shows all 7 stories, Snapshot story captures stacked variants
- Mini-release → v0.26.10

---

## Acceptance Criteria

- [ ] `PageHeader` exported from DS barrel, importable as `import { PageHeader } from '../design-system'`
- [ ] All 7 Storybook stories render under `Patterns/PageHeader`
- [ ] Dark-pink-moon theme confirmed via Storybook (token inheritance, no hardcoded colors)
- [ ] All 6 production pages use `<PageHeader>` — no inline heading duplication remains
- [ ] Tint mechanism live: entity/folio pages show color-mix tint at 10%
- [ ] ProjectDetailPage accentBar replaced by PageHeader tint prop
- [ ] `pnpm validate:tokens` — zero errors
- [ ] Component registry row added

---

## Files to Create / Modify

### Create
- `apps/web/src/design-system/components/PageHeader/PageHeader.jsx`
- `apps/web/src/design-system/components/PageHeader/PageHeader.module.css`
- `apps/web/src/design-system/components/PageHeader/index.js`
- `apps/storybook/src/stories/PageHeader.stories.jsx`

### Modify
- `apps/web/src/design-system/index.js` — add PageHeader export
- `apps/web/src/pages/ArticlesArchivePage.jsx` — use PageHeader
- `apps/web/src/pages/CaseStudiesArchivePage.jsx` — use PageHeader
- `apps/web/src/pages/KnowledgeGraphArchivePage.jsx` — use PageHeader
- `apps/web/src/pages/TaxonomyArchivePage.jsx` — use PageHeader
- `apps/web/src/pages/TaxonomyDetailPage.jsx` — use PageHeader
- `apps/web/src/pages/ProjectDetailPage.jsx` — use PageHeader (replace accentBar + inline heading)
- `docs/conventions/component-registry.md` — new row

### Reference (do not import directly)
- `/tmp/pageheader-handoff/design_handoff_PageHeader/PageHeader.tsx.reference`
- `/tmp/pageheader-handoff/design_handoff_PageHeader/PageHeader.module.css.reference`
- `/tmp/pageheader-handoff/design_handoff_PageHeader/PageHeader.stories.tsx.reference`
