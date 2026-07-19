# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0165
## EPIC NAME: Section Builder Parity — All Section Types on All Content Doc Types

**Status:** ACTIVE
**Backlog ref:** Item #8 (Soon) — "Configure Sections for all pages: section, blockquote, code, callout, table"
**Origin:** Gap identified during EPIC-0160 (Card Builder Section) — `cardBuilderSection` was added to `page.ts` only

**Prerequisites (execute in order before this epic):**
1. **EPIC — Table as PortableText Custom Block Type** (`docs/prompts/EPIC-table-portable-text.md`) — creates `tableBlock` schema + PT rendering. No `sections[]` change needed (table lives inside PortableText).
2. **EPIC — Callout Section Type** (`docs/prompts/EPIC-callout-section.md`) — creates `calloutSection` schema, registers it, adds GROQ projections, adds PageSections renderer. Adds `calloutSection` to `sections[]` on ALL 4 doc types as part of that epic.

Once both prerequisites are shipped, this epic adds `cardBuilderSection` to the 3 doc types that are missing it. The `calloutSection` wiring is handled by its own epic — this epic does NOT duplicate that work.

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — No new layout. All section types and their renderers already exist and are production-tested. This epic only opens the Studio `sections[]` array to accept `cardBuilderSection` on the 3 doc types that currently exclude it. The `calloutSection` and `tableBlock` prerequisites must be shipped first.
- [x] **All prop value enumerations** — No new enums. `cardBuilderSection` has an existing schema with `layout` enum (`grid | list`). Already defined in `apps/studio/schemas/sections/cardBuilderSection.ts`.
- [x] **Correct audit file paths** — all paths verified (see Context below)
- [x] **Dark / theme modifier treatment** — Not applicable. No new component, no new CSS. `CardBuilderSection` renderer and Card theme tokens are already production-complete.
- [x] **Studio schema changes scoped** — Yes, this epic owns the `sections[]` array changes. Commit prefix: `feat(studio):`.
- [x] **Web adapter sync scoped** — Not applicable. No DS component is created or modified.

---

## Context

### What already exists — DO NOT recreate

**Section types (7 total after prerequisites, all registered in `schemas/index.ts`):**

| Section type | Schema file | Renderer | GROQ projection | `sections[]` gap |
|-------------|-------------|----------|-----------------|-----------------|
| `heroSection` | `schemas/sections/hero.ts` | `HeroSection` | All 4 slug queries | None — all 4 doc types |
| `textSection` | `schemas/sections/textSection.ts` | `TextSection` | All 4 slug queries | None — all 4 doc types |
| `imageGallery` | `schemas/sections/imageGallery.ts` | `ImageGallerySection` | All 4 slug queries | None — all 4 doc types |
| `ctaSection` | `schemas/sections/ctaSection.ts` | `CTASection` | All 4 slug queries | None — all 4 doc types |
| `htmlSection` | `schemas/sections/htmlSection.ts` | `HtmlSection` | All 4 slug queries | None — all 4 doc types |
| `cardBuilderSection` | `schemas/sections/cardBuilderSection.ts` | `CardBuilderSection` | All 4 slug queries | **Missing on article, caseStudy, node** |
| `calloutSection` | `schemas/sections/calloutSection.ts` | `CalloutSection` | All 4 slug queries | Shipped by prerequisite epic on all 4 |

**Note:** `tableBlock` is a PortableText custom block type (lives inside `standardPortableText`), not a section type. It is shipped by its own prerequisite epic and does not appear in `sections[]`.

**Current `sections[]` allowances per doc type (after prerequisites, before this epic):**

| Doc type | `hero` | `text` | `gallery` | `cta` | `html` | `cardBuilder` | `callout` |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `page` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `article` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `caseStudy` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `node` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

**Remaining gap this epic closes:** `cardBuilderSection` on article, caseStudy, node. The GROQ queries already project it (added during EPIC-0160 for forward compatibility). The `PageSections.jsx` renderer already handles it. The ONLY gap is the Studio schema.

**GROQ proof — all 4 slug queries already project `cardBuilderSection`:**
- `queries.js` line 262: `_type == "cardBuilderSection" => { ... }` (inside `nodeBySlugQuery`)
- `queries.js` line 375: same (inside `articleBySlugQuery`)
- `queries.js` line 486: same (inside `pageBySlugQuery`)
- `queries.js` line 577: same (inside `caseStudyBySlugQuery`)

### Files this epic will modify

- `apps/studio/schemas/documents/article.ts` — ADD `cardBuilderSection` to `sections[]` array
- `apps/studio/schemas/documents/caseStudy.ts` — ADD `cardBuilderSection` to `sections[]` array
- `apps/studio/schemas/documents/node.ts` — ADD `cardBuilderSection` to `sections[]` array

### Files this epic does NOT touch

- `apps/studio/schemas/documents/page.ts` — already has `cardBuilderSection` in `sections[]`
- `apps/studio/schemas/sections/cardBuilderSection.ts` — schema object already exists; no changes
- `apps/studio/schemas/index.ts` — `cardBuilderSection` is already registered
- `apps/web/src/lib/queries.js` — all 4 slug queries already project `cardBuilderSection`
- `apps/web/src/components/PageSections.jsx` — renderer already handles `cardBuilderSection`
- `apps/web/src/components/PageSections.module.css` — no new styles
- `packages/design-system/` — no DS component changes

---

## Objective

After this epic: all section types are available on all content doc types. Specifically, `cardBuilderSection` is added to article, caseStudy, and node (the only remaining gap after the prerequisite epics ship `calloutSection` and `tableBlock`). No new code is created; the existing query projections and renderer handle the section type already.

**Data layer:** `sections[]` array definition widened on `article.ts`, `caseStudy.ts`, `node.ts` to include `cardBuilderSection`.
**Query layer:** Already complete — no changes needed (projections were added in EPIC-0160).
**Render layer:** Already complete — `PageSections.jsx` handles `cardBuilderSection`.

This is a 3-line schema change. The query and render layers are already wired.

**Post-epic state:** Every content doc type (`page`, `article`, `caseStudy`, `node`) has access to every section type (`heroSection`, `textSection`, `imageGallery`, `ctaSection`, `htmlSection`, `cardBuilderSection`, `calloutSection`), and `tableBlock` is available in all PortableText `content` fields.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Already has `cardBuilderSection` in its `sections[]` — no change needed |
| `article`   | ☑ Yes | Missing `cardBuilderSection` in `sections[]` |
| `caseStudy` | ☑ Yes | Missing `cardBuilderSection` in `sections[]` |
| `node`      | ☑ Yes | Missing `cardBuilderSection` in `sections[]` |
| `archivePage` | ☐ No | Structural config doc; does not have `sections[]` |

---

## Scope

- [ ] Add `defineArrayMember({type: 'cardBuilderSection'})` to `article.ts` `sections[]`
- [ ] Add `defineArrayMember({type: 'cardBuilderSection'})` to `caseStudy.ts` `sections[]`
- [ ] Add `defineArrayMember({type: 'cardBuilderSection'})` to `node.ts` `sections[]`

---

## Query Layer Checklist

All queries already project `cardBuilderSection`. No changes needed.

- `pageBySlugQuery` — ALREADY DONE: has `_type == "cardBuilderSection" => { ... }` (line 486)
- `articleBySlugQuery` — ALREADY DONE: has `_type == "cardBuilderSection" => { ... }` (line 375)
- `caseStudyBySlugQuery` — ALREADY DONE: has `_type == "cardBuilderSection" => { ... }` (line 577)
- `nodeBySlugQuery` — ALREADY DONE: has `_type == "cardBuilderSection" => { ... }` (line 262)
- Archive queries — NOT APPLICABLE: archive queries do not project `sections[]`

---

## Schema Enum Audit

No new enum fields are added by this epic. The existing `cardBuilderSection.layout` enum (`grid | list`) is already defined in `cardBuilderSection.ts` and is unchanged.

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `layout` (existing, unchanged) | `cardBuilderSection.ts` | `grid → Grid`, `list → List` |

---

## Metadata Field Inventory

N/A — no metadata fields are added, moved, or changed.

---

## Themed Colour Variant Audit

N/A — no CSS, tokens, or themed surfaces are modified.

---

## Non-Goals

- **Callout section creation** — handled by prerequisite epic `EPIC-callout-section.md`. That epic creates the schema, registers it, adds GROQ projections, adds the PageSections renderer, and adds `calloutSection` to all 4 doc types. This epic does NOT duplicate that work.
- **Table PortableText block** — handled by prerequisite epic `EPIC-table-portable-text.md`. Table is a PortableText custom block type, not a section type, so it has no `sections[]` entry.
- **Blockquote / Code block** — these already work. Blockquote is a PortableText block style in `standardPortableText`. Code block is a PortableText object type (`code`) in `standardPortableText`. Both are already rendered by `PageSections.jsx` and `portableTextComponents.jsx`. No new schema or wiring needed.
- **GROQ query changes** — projections for `cardBuilderSection` are already wired for all 4 slug queries.
- **PageSections.jsx changes** — renderer already handles `cardBuilderSection`.
- **New DS component** — no new component.
- **Migration script** — no data migration. Existing documents have no `cardBuilderSection` entries in their `sections[]`; adding the type to the allowed list doesn't affect existing data.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No scripts or migration needed

**Schema (Studio)**
- Add `defineArrayMember({type: 'cardBuilderSection'})` as the LAST entry in each `sections[]` `of` array (after `htmlSection`), matching the order in `page.ts`
- The `cardBuilderSection` schema object is already registered in `schemas/index.ts` — no additional registration needed

**Query (GROQ)**
- No changes. All projections already include `cardBuilderSection`.

**Render (Frontend)**
- No changes. `PageSections.jsx` already has `case 'cardBuilderSection':` in its switch.
- `ArticlePage.jsx`, `CaseStudyPage.jsx`, `NodePage.jsx` all render `<PageSections sections={doc.sections} />` — they will automatically render `cardBuilderSection` entries once editors add them.

**Design System → Web Adapter Sync**
- Not required — no DS component created or modified.

---

## Migration Script Constraints

N/A — no migration script. This is a schema-only change that widens the allowed types in an existing array field. No data is modified.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/article.ts` — ADD 1 line to `sections[]` `of` array
- `apps/studio/schemas/documents/caseStudy.ts` — ADD 1 line to `sections[]` `of` array
- `apps/studio/schemas/documents/node.ts` — ADD 1 line to `sections[]` `of` array

---

## Deliverables

1. **Schema parity** — `article.ts`, `caseStudy.ts`, and `node.ts` all include `defineArrayMember({type: 'cardBuilderSection'})` in their `sections[]` `of` array
2. **Studio verification** — editors can add a Card Builder Section to an article, case study, or node in Studio without errors
3. **End-to-end render** — a `cardBuilderSection` added to an article in Studio renders correctly on the article detail page in the web app (using the existing `CardBuilderSection` renderer)

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; Card Builder Section appears as an option in the section builder for article, caseStudy, and node documents
- [ ] Create a `cardBuilderSection` on a test article in Studio → navigate to the article detail page → section renders with cards (not blank, not error)
- [ ] Repeat for a case study document — section renders
- [ ] Repeat for a node document — section renders
- [ ] `page.ts` sections[] is unchanged (already had `cardBuilderSection`)
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:filters` passes
- [ ] `pnpm validate:taxonomy` passes

---

## Risks / Edge Cases

**Schema risks**
- [ ] Confirm `cardBuilderSection` is already registered in `schemas/index.ts` before adding to doc type arrays. If not registered, Studio will throw a "unknown type" error.
- [ ] Confirm the `of` array order matches `page.ts` convention: `heroSection`, `textSection`, `imageGallery`, `ctaSection`, `htmlSection`, `cardBuilderSection`.

**Query risks**
- [ ] Verify all 4 slug queries already project `cardBuilderSection` before considering this epic "query-complete". Run: `grep -n 'cardBuilderSection' apps/web/src/lib/queries.js` — expect 4 matches (one per slug query).

**Render risks**
- [ ] What happens if an editor adds `cardBuilderSection` to a node but the section has zero cards? The `CardBuilderSection` renderer should handle an empty `cards[]` array gracefully — verify it renders nothing (not an error) in that case.
- [ ] Existing article, caseStudy, and node documents have no `cardBuilderSection` entries in `sections[]`. Adding the type to the schema does not inject any sections — editors must explicitly add them. No risk of unintended content changes.

---

## Execution Order

This epic is the **final step** in a 3-epic sequence that delivers backlog item #8:

1. **EPIC — Table as PortableText Custom Block Type** → `tableBlock` schema + PT rendering
2. **EPIC — Callout Section Type** → `calloutSection` schema + GROQ + renderer + `sections[]` wiring on all 4 doc types
3. **This epic** → `cardBuilderSection` added to `sections[]` on article, caseStudy, node (the last gap)

After all three are shipped, the "blockquote, code, callout, table" items from the backlog title are fully resolved:
- **Blockquote** — already works (PortableText block style, no changes needed)
- **Code** — already works (PortableText `code` type, no changes needed)
- **Table** — shipped by prerequisite 1 (PortableText `tableBlock` type)
- **Callout** — shipped by prerequisite 2 (standalone `calloutSection` section type)
- **cardBuilderSection parity** — shipped by this epic
