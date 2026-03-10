# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-TBD _(assign on activation)_
## EPIC NAME: Expose `categoryPosition` to Editors — Schema, Query & ContentCard Wiring

**Status:** BACKLOG
**Backlog ref:** Item #7 (Soon) — "Expose catalog subtitle before/after position in Studio UI"
**Origin:** BL-06 from EPIC-0156 Card Audit

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — No layout changes. `categoryPosition` controls the render order of an existing element within the existing Card layout (category label renders either before or after the title). The Card CSS is unchanged.
- [x] **All prop value enumerations** — `categoryPosition` is `'before' | 'after'`. DS Card already accepts both. No new enum values.
- [x] **Correct audit file paths** — all paths verified via `ls` / Read (see Context below)
- [x] **Dark / theme modifier treatment** — Not applicable. `categoryPosition` is a structural prop (element order), not a visual/themed prop. The category element itself inherits existing Card theme tokens regardless of position.
- [x] **Studio schema changes scoped** — Yes, this epic owns the schema field addition. Commit prefix: `feat(studio):` for the schema commit.
- [x] **Web adapter sync scoped** — No DS component is created or modified. The web Card adapter already accepts `categoryPosition` and renders it. Only ContentCard (data adapter) needs updating.

---

## Context

### What already exists — DO NOT recreate

**DS Card (EPIC-0156, shipped v0.14.x):**
- `packages/design-system/src/components/Card/Card.tsx` — accepts `categoryPosition?: 'before' | 'after'`, defaults to `'before'`
- Conditional render: `{categoryPosition === 'before' && categoryEl}` above title, `{categoryPosition === 'after' && categoryEl}` below title
- Storybook stories: `CategoryBefore`, `CategoryAfter` — both render correctly
- README documents the prop

**Web Card Adapter (EPIC-0158, shipped v0.15.0):**
- `apps/web/src/design-system/components/card/Card.jsx` — accepts `categoryPosition = 'before'`, same conditional rendering as DS Card
- Prop plumbed through but never called with `'after'` — always uses default

**ContentCard (current state):**
- `apps/web/src/components/ContentCard.jsx` — builds the `categoryProp` object (`{ label, href }`) from `item.categories[0]` but does NOT pass `categoryPosition` to Card
- Card always receives the default (`'before'`)

**Sanity schemas (current state):**
- `article.ts`, `caseStudy.ts`, `node.ts` — each has `categories[]` (array of reference to `category`) but NO `categoryPosition` field
- `page.ts` — has `categories[]` but does not use ContentCard (pages use section builder, not card listings)

**GROQ queries (current state):**
- `CATEGORY_FRAGMENT` in `queries.js` (lines 46–52): `_id, name, "slug": slug.current, colorHex, "parent": parent->{ ... }`
- No `categoryPosition` in any projection — it would be a document-level field, not a category-level one

### Files this epic will modify

- `apps/studio/schemas/documents/article.ts` — ADD `categoryPosition` field
- `apps/studio/schemas/documents/caseStudy.ts` — ADD `categoryPosition` field
- `apps/studio/schemas/documents/node.ts` — ADD `categoryPosition` field
- `apps/web/src/lib/queries.js` — ADD `categoryPosition` to slug query projections
- `apps/web/src/components/ContentCard.jsx` — READ field, pass to Card

### Files this epic does NOT touch

- `packages/design-system/` — DS Card already supports the prop; no changes needed
- `apps/web/src/design-system/components/card/Card.jsx` — web adapter already accepts the prop; no changes needed
- `apps/web/src/design-system/components/card/Card.module.css` — no style changes
- `apps/studio/schemas/documents/page.ts` — pages don't use ContentCard; `categoryPosition` has no render surface on pages
- `apps/studio/schemas/documents/tool.ts` — not a content doc type
- Archive queries — `categoryPosition` is a detail-page concern; cards in archive grids use the same ContentCard, so it will flow through automatically

---

## Objective

After this epic: (1) editors can set `categoryPosition` to `'before'` or `'after'` on any article, case study, or node document in Studio; (2) GROQ slug queries project the field; (3) ContentCard reads the field and passes it to Card, so the category label renders in the editor-chosen position on detail page cards and archive grid cards.

**Data layer:** New `categoryPosition` string field on `article.ts`, `caseStudy.ts`, `node.ts`.
**Query layer:** `categoryPosition` added to `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`, and archive queries.
**Render layer:** `ContentCard.jsx` passes `categoryPosition` through to Card.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Pages use the section builder, not ContentCard. No card surface to render `categoryPosition`. |
| `article`   | ☑ Yes | Has `categories[]`, rendered via ContentCard |
| `caseStudy` | ☑ Yes | Has `categories[]`, rendered via ContentCard |
| `node`      | ☑ Yes | Has `categories[]`, rendered via ContentCard |
| `archivePage` | ☐ No | Structural config doc; no content-level metadata |

---

## Scope

- [ ] Add `categoryPosition` field to `article.ts`, `caseStudy.ts`, `node.ts` (Studio schema)
- [ ] Add `categoryPosition` to GROQ slug query projections for article, caseStudy, node
- [ ] Add `categoryPosition` to archive query projections (card grids need it too)
- [ ] Update `ContentCard.jsx` to read `item.categoryPosition` and pass it to Card

---

## Query Layer Checklist

- [x] `pageBySlugQuery` — EXCLUDED: `page` not in scope; pages don't use ContentCard
- [ ] `articleBySlugQuery` — ADD `categoryPosition` to projection
- [ ] `caseStudyBySlugQuery` — ADD `categoryPosition` to projection
- [ ] `nodeBySlugQuery` — ADD `categoryPosition` to projection
- [ ] `allArticlesQuery` — ADD `categoryPosition` (card grids use ContentCard)
- [ ] `allCaseStudiesQuery` — ADD `categoryPosition`
- [ ] `allNodesQuery` — ADD `categoryPosition`

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `categoryPosition` | `article.ts`, `caseStudy.ts`, `node.ts` (CREATE) | `before → Before title (default)`, `after → After title` |

No render code builds a label map from this enum — it is a structural prop passed directly to Card, not displayed as text. The Studio dropdown is the only surface where human-readable labels matter.

---

## Metadata Field Inventory

N/A — `categoryPosition` is a layout control field, not a metadata field rendered in MetadataCard.

---

## Themed Colour Variant Audit

N/A — `categoryPosition` is a structural prop (element order), not a visual/themed surface. No CSS tokens or colour values are involved.

---

## Non-Goals

- **DS Card changes** — the DS Card primitive already supports `categoryPosition`. No modification needed.
- **Web Card adapter changes** — the web adapter already accepts and renders `categoryPosition`. No modification needed.
- **Page doc type** — pages use section builder, not card listings. Adding the field to `page.ts` has no render surface.
- **Migration script** — existing documents without `categoryPosition` will default to `'before'` (both Card components default to `'before'` when the prop is absent). No backfill needed.
- **New DS component** — no new component in `packages/design-system`.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — absence of field defaults to `'before'`

**Schema (Studio)**
- `categoryPosition`: type `string`, options list `['before', 'after']`, layout `'radio'`, default initial value `'before'`
- Field goes in the `metadata` group on all three doc types, near the `categories[]` field
- Validation: optional — absence means `'before'` (backward compatible)
- Field description should reference the visual effect: "Controls whether the category label appears above or below the article title on cards."

**Query (GROQ)**
- Add `categoryPosition` to the document-level projection in each slug query (not inside `CATEGORY_FRAGMENT` — this is a document field, not a category field)
- Add to archive queries so card grids also receive the value

**Render (Frontend)**
- `ContentCard.jsx`: read `item.categoryPosition` and pass as `categoryPosition` prop to `<Card>`
- If `item.categoryPosition` is `undefined` or `null`, do not pass the prop — let Card use its default (`'before'`)
- No CSS changes required

**Design System → Web Adapter Sync**
- Not required — no DS component created or modified

---

## Migration Script Constraints

N/A — no migration script. Existing documents render correctly without the field (Card defaults to `'before'`).

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/article.ts` — ADD `categoryPosition` field
- `apps/studio/schemas/documents/caseStudy.ts` — ADD `categoryPosition` field
- `apps/studio/schemas/documents/node.ts` — ADD `categoryPosition` field

**Frontend**
- `apps/web/src/lib/queries.js` — ADD `categoryPosition` to `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`, `allArticlesQuery`, `allCaseStudiesQuery`, `allNodesQuery`
- `apps/web/src/components/ContentCard.jsx` — pass `categoryPosition` to Card

---

## Deliverables

1. **Schema field** — `categoryPosition` exists as a `string` field with `radio` layout and `['before', 'after']` options on `article.ts`, `caseStudy.ts`, `node.ts`
2. **GROQ projections** — all 6 queries (3 slug + 3 archive) project `categoryPosition`
3. **ContentCard wiring** — `ContentCard.jsx` passes `item.categoryPosition` to Card's `categoryPosition` prop
4. **Backward compatibility** — documents without a `categoryPosition` value render identically to before (category appears before title)

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; `categoryPosition` radio field appears in Metadata group on article, caseStudy, and node documents
- [ ] Setting `categoryPosition` to `'after'` on a published article → navigating to the article detail page → category label renders below the title
- [ ] Setting `categoryPosition` to `'before'` (or leaving unset) → category label renders above the title (existing behavior preserved)
- [ ] Archive grid: card for a document with `categoryPosition: 'after'` renders category below title in the grid card
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:filters` passes
- [ ] `pnpm validate:taxonomy` passes

---

## Risks / Edge Cases

**Schema risks**
- [ ] Does `categoryPosition` collide with any existing field name on article, caseStudy, or node? Run `grep -n 'categoryPosition' apps/studio/schemas/documents/` before adding.
- [ ] Sanity initial value: if `initialValue: 'before'` is set on the field, new documents will explicitly store `'before'`. If omitted, new documents will have `undefined` and default at render time. Choose one approach and be consistent — recommend omitting `initialValue` so existing docs and new docs behave identically (both rely on Card default).

**Query risks**
- [ ] If `categoryPosition` is projected but the field doesn't exist on the document, GROQ returns `null` — ContentCard must handle `null` gracefully (already covered by the "don't pass if undefined" rule).

**Render risks**
- [ ] What happens if an editor sets `categoryPosition: 'after'` but the document has no categories? The Card renders no category element regardless of position — no visual change, no error. Safe.
- [ ] Storybook already has `CategoryBefore` and `CategoryAfter` stories in the DS Card — no new stories needed. Web adapter inherits behavior.
