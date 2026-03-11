# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-TBD _(assign on activation)_
## EPIC NAME: Citations in Content Body — Schema, Shared PT Renderer & Endnotes

**Status:** BACKLOG
**Backlog ref:** Pre-launch IA content work — citation support for migrated WordPress articles and new content
**Origin:** Legacy WP article (`core-web-vitals-dont-belong-to-frontend`) uses hand-coded `<abbr>` + `<sup><a href="#n1">` citation pattern that has no Sanity authoring path. DS Citation components (`CitationMarker`, `CitationNote`, `CitationZone`) and web adapter already exist (EPIC-0159). Card Builder Section (EPIC-0160) has working `citationRef` annotation + `citation` footer — but only on `cardBuilderItem.body`, not on the main `content` field or `textSection.content`.

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — No new layout. Citations are inline superscript markers (`CitationMarker`) in running text and a stacked endnote list (`CitationZone` + `CitationNote`) appended after the content body. Both components are production-complete with full token coverage. The endnote zone renders at content width, same as the body text flow.
- [x] **All prop value enumerations** — No enums. `citationRef.index` is a freeform `number` (min: 1). No select/radio fields.
- [x] **Correct audit file paths** — All paths verified via `Read` / `Grep` in the authoring session (see Context below).
- [x] **Dark / theme modifier treatment** — Not applicable. Citation tokens (`--st-citation-*`) are already defined in both token files with correct dark/light/pink-moon values (EPIC-0159). No new tokens needed.
- [x] **Studio schema changes scoped** — Yes, this epic owns schema changes. Two commits: (1) `feat(studio): add citationRef to standardPortableText + citations[] to content doc types` (2) web rendering wiring.
- [x] **Web adapter sync scoped** — Not applicable. DS Citation components and web adapter already exist and are unchanged by this epic.

---

## Context

### What already exists — DO NOT recreate

**DS Citation components** (EPIC-0159, production-complete):
- `packages/design-system/src/components/Citation/Citation.tsx` — `CitationMarker`, `CitationNote`, `CitationZone`
- `packages/design-system/src/components/Citation/Citation.module.css`
- 8 citation tokens in both `tokens.css` files

**Web adapter** (EPIC-0159, production-complete):
- `apps/web/src/design-system/components/citation/Citation.jsx` — JSX mirror
- `apps/web/src/design-system/components/citation/Citation.module.css` — byte-identical
- Barrel export in `apps/web/src/design-system/index.js` (line 9)

**Card Builder citation pattern** (EPIC-0160, production-complete):
- `apps/studio/schemas/objects/cardBuilderItem.ts` — `citationRef` annotation (lines 122–136) + `citation` footer object (lines 144–172)
- `apps/web/src/components/CardBuilderSection.jsx` — renders `citationRef` mark → `CitationMarker`, `citation` footer → `CitationZone` + `CitationNote`

**Portable Text configs** (unchanged by this epic until execution):
- `apps/studio/schemas/objects/portableTextConfig.ts` — `standardPortableText` (line 62) used by `article.content`, `node.content`, `textSection.content`, `person.bio`
- `standardPortableText` annotations: `link` only — no `citationRef`

**Shared PT renderer:**
- `apps/web/src/lib/portableTextComponents.jsx` — only handles `code` mark

**Content doc types using `standardPortableText` for their `content` field:**
- `article.ts` (line 83)
- `node.ts` (line 71)
- `post.ts` (line 76, legacy — kept for backward compat)
- `person.ts` (line 93, `bio` field)

**Section types using `standardPortableText`:**
- `textSection.ts` (line 29)

**Doc types with `sections[]` but NO direct `content` field:**
- `caseStudy.ts` — sections-only architecture; citations in case studies flow through `textSection` content within sections

---

## Objective

After this epic, authors can add inline citation markers `[1]` `[2]` etc. to any Portable Text field that uses `standardPortableText` — including the main `content` body of articles and nodes, and the `content` field of text sections used in case studies and pages. A document-level `citations[]` array on `article`, `node`, and `caseStudy` holds the endnote definitions (text, optional URL, optional label). The web app renders inline markers as `CitationMarker` superscripts and the endnote list as a `CitationZone` footer at the bottom of the content body.

No new DS components are created. No new tokens are added. This epic wires existing infrastructure to the standard content authoring path.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | Pages use `sections[]` — citations in text sections are covered by the `standardPortableText` annotation change. Pages have no direct `content` field and no document-level endnotes — citations in page text sections would reference endnotes defined at the section level (future scope, see Non-Goals). |
| `article`   | Yes | Has `content` field using `standardPortableText`. Gets `citations[]` array for endnotes. |
| `caseStudy` | Yes | Has `sections[]` (text sections use `standardPortableText`). Gets `citations[]` array for endnotes. |
| `node`      | Yes | Has `content` field using `standardPortableText`. Gets `citations[]` array for endnotes. |
| `archivePage` | No | Metadata/config document — no authored content body, no citation use case. |

---

## Scope

- [x] **Studio schema: `citationRef` annotation** — add to `standardPortableText` annotations array in `portableTextConfig.ts` (same shape as `cardBuilderItem` pattern: `{ name: 'citationRef', type: 'object', fields: [{ name: 'index', type: 'number' }] }`)
- [x] **Studio schema: `citations[]` array** — add to `article.ts`, `node.ts`, `caseStudy.ts` as an array of `citationItem` objects (text: string, url: url, label: string)
- [x] **Studio schema: `citationItem` object** — create reusable object schema in `schemas/objects/citationItem.ts` (extracted from `cardBuilderItem.citation` pattern for reuse)
- [x] **Schema registration** — register `citationItem` in `schemas/index.ts`
- [x] **GROQ projections** — add `citations[]` to slug queries for article, node, caseStudy
- [x] **Shared PT renderer** — add `citationRef` mark handler to `portableTextComponents.jsx` → renders `CitationMarker`
- [x] **Page templates** — render `CitationZone` + `CitationNote` list at bottom of content body in ArticlePage, NodePage, CaseStudyPage (fed by `doc.citations[]`)
- [ ] **TextSection endnotes** — DEFERRED (see Non-Goals)
- [ ] **Migration script** — DEFERRED (see Non-Goals)

---

## Query Layer Checklist

- [x] `pageBySlugQuery` — excluded: `page` has no `citations[]` field (see Doc Type Coverage Audit)
- [x] `articleBySlugQuery` — add `citations[]` projection
- [x] `caseStudyBySlugQuery` — add `citations[]` projection
- [x] `nodeBySlugQuery` — add `citations[]` projection
- [ ] Archive queries — excluded: citations are detail-page-only data, not shown on cards

---

## Schema Enum Audit

No enum fields in scope. `citationRef.index` is a freeform number, not a select/enum.

---

## Themed Colour Variant Audit

No new tokens or themed surfaces. All citation styling uses the 8 existing `--st-citation-*` tokens defined in EPIC-0159. These tokens already have correct values for dark, light, and pink-moon themes.

| Surface / component | Dark | Light | Pink Moon | Token(s) |
|---------------------|------|-------|-----------|----------|
| Citation marker bg | `var(--st-color-pink)` | `var(--st-color-pink)` | `var(--st-color-pink)` | `--st-citation-marker-bg` |
| Citation note text | `var(--st-color-text-secondary)` | `var(--st-color-text-secondary)` | `var(--st-color-text-secondary)` | `--st-citation-color` |
| Citation zone border | `rgba(255, 36, 125, 0.2)` | `rgba(255, 36, 125, 0.2)` | `rgba(255, 36, 125, 0.2)` | `--st-citation-zone-border` |

All inherited from existing token definitions — no new values needed.

---

## Non-Goals

- **TextSection-level endnotes** — This epic adds `citations[]` to the three content document types (article, node, caseStudy), NOT to `textSection`. Text sections can contain `citationRef` inline markers (because `standardPortableText` gets the annotation), but the endnote definitions live on the parent document. If a future need arises for section-scoped endnotes (e.g. a page with multiple independent citation scopes), that's a separate epic.
- **Page-level `citations[]`** — Pages (`page.ts`) do not get a `citations[]` field in this epic. Pages are structural containers (nav, hero, sections) and their text sections borrow the annotation from `standardPortableText`. If pages need endnotes, scope it in a follow-on.
- **Migration of legacy WP citation HTML** — The article `core-web-vitals-dont-belong-to-frontend` has hand-coded `<abbr>`/`<sup><a>` citation markup in its migrated HTML body. Converting this to `citationRef` annotations in Portable Text requires a one-off migration script. This is deferred to a separate micro-epic after the authoring path is live.
- **Auto-numbering** — Citation indices are manually assigned by the author (same as the card builder pattern). Auto-numbering is a Studio UX enhancement for a future epic.
- **`person.bio` endnotes** — `person.bio` uses `standardPortableText` so it gains the inline `citationRef` annotation, but `person.ts` does not get a `citations[]` array. Person bios with endnotes are not an anticipated use case.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; scripts at repo root; `apps/studio`, `apps/web`
- No migration script in this epic

**Schema (Studio)**
- `citationRef` annotation added to `standardPortableText` in `portableTextConfig.ts` — this is a shared config, so ALL fields using it gain the annotation simultaneously (article.content, node.content, textSection.content, person.bio)
- `citationItem` object type created in `schemas/objects/citationItem.ts` — reusable endnote definition (text: `string`, url: `url`, label: `string`)
- `citations[]` field added to `article.ts`, `node.ts`, `caseStudy.ts` as `array` of `citationItem`
- Explicit field types: `citationRef.index` → `number`; `citationItem.text` → `string`; `citationItem.url` → `url`; `citationItem.label` → `string`

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js`
- Add `citations[]` to projections in `articleBySlugQuery`, `nodeBySlugQuery`, `caseStudyBySlugQuery`
- `citations[]` is a flat array of objects — no dereferencing needed (not references)

**Render (Frontend)**
- `citationRef` mark handler added to shared `portableTextComponents.jsx` — this means ALL pages using the shared config get citation rendering without per-page changes
- `CitationZone` rendering added to `ArticlePage.jsx`, `NodePage.jsx`, `CaseStudyPage.jsx` — after the content body `<PortableText>`, render `CitationZone` + `CitationNote` list if `doc.citations?.length > 0`
- CaseStudyPage renders sections via `PageSections` — the endnote zone goes after the `<PageSections>` block, fed by `caseStudy.citations[]`
- Import path: `import { CitationMarker, CitationNote, CitationZone } from '../design-system'`

---

## Files to Modify

**Studio (commit 1: `feat(studio): add citationRef annotation + citations[] field`)**
- `apps/studio/schemas/objects/portableTextConfig.ts` — add `citationRef` annotation to `standardPortableText`
- `apps/studio/schemas/objects/citationItem.ts` — CREATE reusable endnote object
- `apps/studio/schemas/index.ts` — register `citationItem`
- `apps/studio/schemas/documents/article.ts` — add `citations[]` field
- `apps/studio/schemas/documents/node.ts` — add `citations[]` field
- `apps/studio/schemas/documents/caseStudy.ts` — add `citations[]` field

**Frontend (commit 2: `feat(web): wire citation rendering to content body`)**
- `apps/web/src/lib/queries.js` — add `citations[]` projection to 3 slug queries
- `apps/web/src/lib/portableTextComponents.jsx` — add `citationRef` mark handler
- `apps/web/src/pages/ArticlePage.jsx` — render `CitationZone` after content body
- `apps/web/src/pages/NodePage.jsx` — render `CitationZone` after content body
- `apps/web/src/pages/CaseStudyPage.jsx` — render `CitationZone` after sections

---

## Deliverables

1. **Schema: `citationRef` annotation** — `standardPortableText` in `portableTextConfig.ts` includes `citationRef` annotation with `index: number` field
2. **Schema: `citationItem` object** — `schemas/objects/citationItem.ts` exists, registered in `index.ts`
3. **Schema: `citations[]` field** — present on `article`, `node`, `caseStudy` document types
4. **GROQ: projections** — `citations[]` projected in `articleBySlugQuery`, `nodeBySlugQuery`, `caseStudyBySlugQuery`
5. **Shared PT renderer** — `portableTextComponents.jsx` handles `citationRef` mark → renders `CitationMarker` with correct index
6. **Page templates** — `ArticlePage`, `NodePage`, `CaseStudyPage` render `CitationZone` with `CitationNote` entries when `citations[]` is populated
7. **Studio UX** — citation marker annotation is available in the Studio rich text toolbar for all `standardPortableText` fields; `citations[]` array is authorable in the metadata/content tab of article, node, caseStudy

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; `citationRef` annotation appears in the rich text toolbar mark menu for article content, node content, and text section content fields
- [ ] Studio: `citations[]` array field is visible and authorable on article, node, and caseStudy documents
- [ ] Frontend: create a test article (or node) with a `citationRef` mark in the body and a `citations[]` entry — the inline `[1]` marker renders as a pink pill superscript linking to the endnote, and the endnote zone renders at the bottom with the correct text/URL
- [ ] Frontend: article page with no citations renders without errors or empty citation zone
- [ ] Frontend: case study with citations in a text section renders the endnote zone after all sections
- [ ] Shared PT renderer: the `citationRef` mark renders correctly in ArticlePage, NodePage, and CaseStudyPage without per-page handler duplication
- [ ] Existing `CardBuilderSection` citation rendering is unaffected (no regression)

---

## Risks / Edge Cases

**Schema risks**
- [ ] `citationRef` is added to `standardPortableText` which is shared across many fields. Verify that `person.bio` (also uses `standardPortableText`) does not break — the annotation should be harmless if unused (PT ignores unknown annotations gracefully).
- [ ] `citationItem` object name must not collide with any existing schema type. Verified: no `citationItem` type exists in `schemas/index.ts`.
- [ ] The existing `cardBuilderItem.citation` is an inline object, not a reference to `citationItem`. They coexist without conflict (different fields, different doc contexts).

**Query risks**
- [ ] `citations[]` is a flat array of plain objects — no `->` dereferencing needed. Simple projection suffices.
- [ ] Archive queries intentionally excluded — citations are not shown on cards.

**Render risks**
- [ ] What renders if `citationRef.index` is undefined? Guard with `value?.index || 1` fallback (matches existing `CardBuilderSection` pattern).
- [ ] What renders if `citations[]` is empty or null? Guard with `citations?.length > 0` before rendering `CitationZone`. Empty array = no zone rendered.
- [ ] Citation number mismatch: if author creates `[1]` and `[3]` but no `[2]`, the endnote list renders whatever `citations[]` contains. No auto-matching between inline markers and endnote array indices — this is by design (matches card builder pattern). Future auto-numbering epic could address this.
- [ ] `textSection` content gains `citationRef` annotation but endnotes live on the parent document. For case studies (sections-only), this means the inline `[1]` in a text section links to `#st-citation-1` and the endnote zone at the bottom of the page has the matching anchor. This works because `CitationMarker` uses `href="#st-citation-{index}"` and `CitationNote` uses `id="st-citation-{index}"` — page-level anchors.

---

## Post-Epic Close-Out

1. **Confirm clean tree** — `git status` must show nothing staged or unstaged
2. **Run mini-release** — `/mini-release EPIC-XXXX Citations in Content Body`
3. **Start next epic** — only after mini-release commit is confirmed
