# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-TBD _(assign on activation)_
## EPIC NAME: Table as PortableText Custom Block Type

**Status:** BACKLOG
**Backlog ref:** Dependency for Item #8 (Soon) — "Configure Sections for all pages"
**Origin:** DS Table component exists (Storybook ✅, web adapter ✅) but has no Sanity authoring path

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — No new layout. The DS Table component (`packages/design-system/src/components/Table/Table.tsx`) already renders three variants (`default`, `responsive`, `wide`). This epic wires editor-authored table data to that existing component. The Table renders inside `textSection` flow content at the same width as paragraphs and code blocks.
- [x] **All prop value enumerations** — Table `variant`: `'default' | 'responsive' | 'wide'` (from `Table.tsx`). The Sanity schema field will use the same values.
- [x] **Correct audit file paths** — all paths verified (see Context)
- [x] **Dark / theme modifier treatment** — Table inherits from existing `--st-table-*` tokens in `Table.module.css`. No new tokens needed. Light theme overrides already exist in `theme.light.css` if present, or inherit from `[data-theme]` selectors in the CSS module. Not applicable for this epic — the component CSS is unchanged.
- [x] **Studio schema changes scoped** — Yes. New `tableBlock` object schema in `schemas/objects/`. Commit prefix: `feat(studio):` for the schema commit.
- [x] **Web adapter sync scoped** — Not applicable. DS Table component and web adapter already exist and are unchanged.

---

## Context

### What already exists — DO NOT recreate

**DS Table component (shipped):**
- `packages/design-system/src/components/Table/Table.tsx` — exports `Table` + `TableWrap`
- Props: `variant?: 'default' | 'responsive' | 'wide'`, `children`, `className?`
- `Table.module.css` — zebra striping, pink header accent, responsive card layout at <=860px, wide fixed-layout
- Storybook stories: 3+ stories covering all variants

**Web adapter (shipped, synced v7c):**
- `apps/web/src/design-system/components/table/Table.jsx` — JSX mirror of DS, exports `Table` + `TableWrap`
- `apps/web/src/design-system/components/table/Table.module.css` — synced with DS
- Exported from `apps/web/src/design-system/index.js`

**PortableText config (current state):**
- `apps/studio/schemas/objects/portableTextConfig.ts` — three configs: `summaryPortableText`, `standardPortableText`, `minimalPortableText`
- `standardPortableText` currently includes: block styles (normal, h2–h4, blockquote), lists (bullet, number), marks (strong, em, underline, code, link), types (richImage, code)
- No table type exists

**PageSections renderer (current state):**
- `apps/web/src/components/PageSections.jsx` — PortableText `types` handlers: `richImage`, `code`
- No `table` type handler
- Already imports `Table` is NOT in the import list — will need to add

**Sanity ecosystem:**
- No `@sanity/table` or `sanity-plugin-table` plugin is installed
- This epic defines a custom `tableBlock` object schema — no plugin dependency

### Files this epic will create or modify

- `apps/studio/schemas/objects/tableBlock.ts` — CREATE: custom table data schema
- `apps/studio/schemas/objects/portableTextConfig.ts` — ADD `tableBlock` to `standardPortableText`
- `apps/studio/schemas/index.ts` — ADD `tableBlock` import + register
- `apps/web/src/components/PageSections.jsx` — ADD `table` type handler to PortableText components, add Table/TableWrap import
- `apps/web/src/lib/portableTextComponents.jsx` — ADD `table` type handler (shared serializer)

### Files this epic does NOT touch

- `packages/design-system/` — DS Table component is unchanged
- `apps/web/src/design-system/components/table/` — web adapter is unchanged
- `apps/web/src/lib/queries.js` — PortableText content is projected via `content` (opaque); no explicit table projection needed
- Document schemas (`article.ts`, `caseStudy.ts`, `node.ts`, `page.ts`) — they already use `standardPortableText` for their `content` fields; adding a type to the config propagates automatically
- `apps/web/src/components/PageSections.module.css` — Table uses its own CSS module; no PageSections styles needed

---

## Objective

After this epic: editors can insert structured tables into any PortableText `content` field (articles, case studies, nodes, pages) via Studio. Tables are authored as rows/cells with an optional header row, optional variant selector, and rendered by the existing DS Table component on the frontend.

**Data layer:** New `tableBlock` object schema + registration in `standardPortableText`.
**Query layer:** No changes — PortableText content is projected opaquely.
**Render layer:** New PortableText type handler in `PageSections.jsx` and `portableTextComponents.jsx` maps `tableBlock` data to `<TableWrap><Table>` with semantic `<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>`.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason |
|-------------|-----------|--------|
| `page`      | ☑ Yes | Uses `standardPortableText` in `textSection.content` and inherits via section builder |
| `article`   | ☑ Yes | Has `content` field using `standardPortableText` + `textSection` in `sections[]` |
| `caseStudy` | ☑ Yes | Has `textSection` in `sections[]` using `standardPortableText` |
| `node`      | ☑ Yes | Has `content` field using `standardPortableText` + `textSection` in `sections[]` |
| `archivePage` | ☐ No | No rich text content fields |

All four content doc types inherit from `standardPortableText` — adding `tableBlock` to the config propagates to all of them automatically. No per-doc-type schema changes needed.

---

## Scope

- [ ] Create `apps/studio/schemas/objects/tableBlock.ts` — table data schema
- [ ] Register `tableBlock` in `apps/studio/schemas/index.ts`
- [ ] Add `tableBlock` as array member in `standardPortableText`
- [ ] Add PortableText `table` type handler in `PageSections.jsx`
- [ ] Add PortableText `table` type handler in `portableTextComponents.jsx` (shared serializer)

---

## Query Layer Checklist

No query changes needed. PortableText content is projected opaquely — Sanity returns the full block array including any `tableBlock` entries. The PortableText renderer handles type dispatch client-side.

- `pageBySlugQuery` — NOT AFFECTED: `textSection.content` already projected
- `articleBySlugQuery` — NOT AFFECTED: `content` and `textSection.content` already projected
- `caseStudyBySlugQuery` — NOT AFFECTED: same
- `nodeBySlugQuery` — NOT AFFECTED: same
- Archive queries — NOT AFFECTED: do not project `content` or `sections[]`

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `variant` | `tableBlock.ts` (CREATE) | `default → Default`, `responsive → Responsive (card layout on mobile)`, `wide → Wide (fixed columns)` |
| `hasHeaderRow` | `tableBlock.ts` (CREATE) | boolean — not an enum |

---

## Metadata Field Inventory

N/A — tables are inline content blocks, not metadata.

---

## Themed Colour Variant Audit

N/A — the DS Table component already has themed styles via its own CSS module. No new tokens needed. The PortableText handler just renders the existing component.

---

## Non-Goals

- **Sanity table plugin** — not using `@sanity/table` or any third-party plugin. The custom `tableBlock` schema is simpler and maps directly to the DS Table component.
- **DS Table component changes** — the component is unchanged. This epic only creates the Sanity authoring path and the PortableText rendering bridge.
- **Spreadsheet-style editing** — Studio will use Sanity's native array-of-objects UI (rows → cells). Not a visual spreadsheet editor. Functional, not fancy.
- **Table caption/title** — out of scope. Can be added as a field later if editorial need arises.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — no existing table data

**Schema (Studio)**
- `tableBlock` is an `object` type (not a `document`)
- Data structure:
  ```
  tableBlock {
    _type: 'tableBlock'
    variant: string ('default' | 'responsive' | 'wide')  — optional, defaults to 'default'
    hasHeaderRow: boolean — defaults to true
    rows: array of tableRow {
      _type: 'tableRow'
      cells: array of string
    }
  }
  ```
- `tableRow` can be defined inline within `tableBlock` (nested object) — no separate schema file needed
- Minimum validation: at least 1 row required
- The `rows` array uses Sanity's native array UI — each row is an expandable object with a `cells` string array
- Preview: show row count and first cell value as subtitle

**Query (GROQ)**
- No changes needed. PortableText `content` arrays are projected in full — Sanity includes all block types automatically.

**Render (Frontend)**
- PortableText type handler receives `{ value }` where `value` is the full `tableBlock` object
- Handler maps `value.rows` → semantic HTML: `<thead>` for first row if `hasHeaderRow`, `<tbody>` for the rest
- Cells in header row render as `<th>`, body cells as `<td>`
- Wrap in `<TableWrap><Table variant={value.variant}>` using the DS components
- Null guard: if `value.rows` is empty or missing, return `null`
- Handler must be added to BOTH:
  1. `PageSections.jsx` — the `portableTextComponents.types` object (used for section textSection content)
  2. `portableTextComponents.jsx` — the shared serializer (used for article/node `content` fields)

**Design System → Web Adapter Sync**
- Not required — no DS component created or modified

---

## Migration Script Constraints

N/A — no migration. No existing table data in Sanity.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/tableBlock.ts` — CREATE
- `apps/studio/schemas/objects/portableTextConfig.ts` — ADD `defineArrayMember({type: 'tableBlock'})` to `standardPortableText`
- `apps/studio/schemas/index.ts` — ADD import + register `tableBlock`

**Frontend**
- `apps/web/src/components/PageSections.jsx` — ADD `table: tableBlock` type handler to `portableTextComponents.types`, ADD `Table, TableWrap` to imports from design-system
- `apps/web/src/lib/portableTextComponents.jsx` — ADD `tableBlock` type handler, ADD `Table, TableWrap` to imports

---

## Deliverables

1. **Schema** — `tableBlock.ts` exists in `schemas/objects/`, registered in `index.ts`
2. **PortableText config** — `standardPortableText` includes `defineArrayMember({type: 'tableBlock'})` — editors can insert tables in any `content` field
3. **Renderer (PageSections)** — PortableText `types.tableBlock` handler maps rows/cells to `<TableWrap><Table>` with `<thead>/<tbody>/<th>/<td>`
4. **Renderer (shared)** — `portableTextComponents.jsx` has matching `types.tableBlock` handler
5. **End-to-end** — a table inserted in an article's `content` field renders with DS Table styling on the detail page

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; "Table" appears as an insertable block type in any `standardPortableText` content field (article content, textSection content, node content)
- [ ] Create a table with 3 columns × 4 rows (1 header + 3 body) in a test article → navigate to article detail page → table renders with DS Table styling (zebra striping, pink header accent)
- [ ] Set `variant` to `responsive` on a table → on mobile viewport → rows render as stacked cards (DS responsive variant)
- [ ] Set `hasHeaderRow` to false → first row renders as `<td>` not `<th>`, no `<thead>`
- [ ] Table with empty `rows[]` → renders nothing (no error, no empty table shell)
- [ ] Verify table renders correctly in both locations: article `content` field (uses `portableTextComponents.jsx`) AND textSection within sections[] (uses PageSections `portableTextComponents`)
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:taxonomy` passes

---

## Risks / Edge Cases

**Schema risks**
- [ ] Does `tableBlock` collide with any existing type name? Run `grep -rn "name: 'tableBlock'" apps/studio/schemas/` before creating.
- [ ] Sanity's native array-of-objects UI for rows/cells is functional but not visual — editors won't see a grid, they'll see expandable row objects. This is an acceptable UX tradeoff for v1. A custom Studio input component for visual table editing is a future enhancement.
- [ ] `cells` is an array of plain strings — no rich text inside table cells in v1. This keeps the schema simple and the renderer straightforward. Rich text cells are a future enhancement.

**Render risks**
- [ ] What if `variant` is undefined? DS Table defaults to `'default'` — safe.
- [ ] What if a row has fewer cells than the header row? HTML renders fine — the row is shorter. No error. Consider adding a Studio validation warning for inconsistent cell counts.
- [ ] The PortableText handler exists in TWO places (`PageSections.jsx` and `portableTextComponents.jsx`). Both must be kept in sync. If the handler logic changes, update both files in the same commit.
