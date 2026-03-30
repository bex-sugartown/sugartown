# SUG-34: Table Authoring UX + HTML Table Migration

**Linear Issue:** SUG-34
**Supersedes:** EPIC-0163 (table as PortableText custom block type)
**Status:** Backlog

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — `tableBlock` (EPIC-0163) is the only table authoring surface. Custom input component replaces the default Sanity array-of-objects UI; no new schema type created. DS `Table` / `TableWrap` components unchanged. `@sanity/table` plugin evaluated and rejected — it provides a grid UI but no clipboard paste support (each cell is an independent `TextInput` with no `onPaste` handler). Keeping our own type gives us `variant` and `hasHeaderRow` fields that the plugin lacks.
- [x] **Use case coverage** — custom input component must support: (A) manual cell-by-cell editing, (B) paste from clipboard (tab-delimited from Excel/Sheets, HTML `<table>` from browser), (C) add/remove rows and columns, (D) header row toggle. All within the existing `tableBlock` PT block type.
- [x] **Layout contract** — N/A; no new visual surface on the frontend. DS `Table` / `TableWrap` rendering is unchanged.
- [x] **All prop value enumerations** — `variant`: `default`, `responsive`, `wide` (from `tableBlock.ts` line 33-35). No new enums.
- [x] **Correct audit file paths** — verified via Read tool.
- [x] **Dark / theme modifier treatment** — N/A for Studio input component. Frontend rendering unchanged.
- [x] **Studio schema changes scoped** — schema object (`tableBlock.ts`) modified to add `components.input`; no structural field changes. Commit prefix: `feat(studio):`.
- [x] **Web adapter sync scoped** — N/A; DS Table component unchanged.
- [x] **Composition overlap audit** — N/A; no sub-objects added.
- [x] **Atomic Reuse Gate** — (1) No existing table input component exists. (2) Consumed by all four content doc types via `standardPortableText`. (3) API is the existing `tableBlock` schema — composable, no changes to external API.

---

## Context

EPIC-0163 shipped `tableBlock` as a Portable Text custom block type with plain string cells in a `rows[] → cells[]` structure. The schema works, but the **Studio authoring UX is unusable** — Sanity renders it as nested array-of-objects inputs (click "Add row" → click "Add cell" for each value). No grid layout, no copy/paste.

Meanwhile, **26 published documents** from the WordPress migration contain tables as raw HTML inside `htmlSection` blocks. These are not editable in Studio and not styled with the DS Table component.

### Current table data shape (unchanged by this epic)

```json
{
  "_type": "tableBlock",
  "variant": "default",
  "hasHeaderRow": true,
  "rows": [
    { "_key": "abc", "cells": ["Header 1", "Header 2"] },
    { "_key": "def", "cells": ["Cell 1", "Cell 2"] }
  ]
}
```

### `@sanity/table` plugin — evaluated and rejected

Inspected `@sanity/table@2.0.1` source code. Key findings:
- Data shape: `{ rows: [{ _type: 'tableRow', _key, cells: string[] }] }` — nearly identical to ours
- UI: renders a `<table>` of `TextInput` components — grid layout (better than ours)
- **No `onPaste` handler** — each cell is an independent `<TextInput>`, no clipboard interception
- **No `variant` or `hasHeaderRow` fields** — would need wrapping
- Adds two schema types via plugin system (`table`, `tableRow`) — name collision risk with our `tableRow`

**Decision:** Build a custom input component for the existing `tableBlock` schema. This gives us grid UI + real paste support + keeps `variant`/`hasHeaderRow` without a wrapper hack.

---

## Objective

After this epic:
1. **Studio authors** can paste tabular data (from Excel, Google Sheets, HTML tables, or tab-delimited text) directly into a `tableBlock` in any content document's rich text editor
2. **26 legacy HTML tables** are converted from opaque `htmlSection` blocks into editable, DS-styled `tableBlock` objects inside `textSection` content
3. The `tableBlock` Studio input renders as a **spreadsheet-style grid** with add/remove row/column controls

No changes to the data layer (schema fields), query layer (GROQ), or render layer (frontend components). The `tableBlock` data shape is unchanged.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | Yes | 1 document has HTML table (`wp.page.1644`) |
| `article`   | Yes | 1 document has HTML table (`wp.article.1804`) |
| `caseStudy` | No | No documents have tables |
| `node`      | Yes | 24 documents have HTML tables |
| `archivePage` | No | Does not support sections/content with tables |

---

## Scope

### Phase 1: Custom Input Component (Studio UX)

- [ ] Create `apps/studio/components/TableBlockInput.tsx` — custom input component for `tableBlock`
  - Grid layout: renders `rows × cells` as a `<table>` of `<input>` elements
  - Cell editing: click to focus, type to edit, Tab to advance
  - Paste handler: intercepts `onPaste` on the grid container
    - Parses tab-delimited text (Excel/Sheets copy format)
    - Parses HTML `<table>` from clipboard (browser copy format)
    - Expands grid to fit pasted data (adds rows/columns as needed)
  - Row/column controls: add row, add column, remove row, remove column
  - Header row toggle: visual distinction for first row when `hasHeaderRow` is true
- [ ] Wire `components: { input: TableBlockInput }` on `tableBlock` schema object
- [ ] Verify input works in all four PT-enabled doc types (`page`, `article`, `caseStudy`, `node`)

### Phase 2: HTML Table Migration Script

- [ ] Create `scripts/migrate/html-tables-to-tableblock.js`
  - Parse HTML from `htmlSection.html` fields
  - Extract `<table>` elements using a DOM parser (`htmlparser2` or `linkedom`)
  - Convert each `<table>` to `tableBlock` data shape
  - For sections that contain ONLY a table (no other significant content), replace `htmlSection` with `textSection` containing the `tableBlock`
  - For sections that contain a table mixed with other content, insert `tableBlock` into existing `textSection` content (or flag for manual review)
  - Detect header rows: if `<thead>` or first row uses `<th>`, set `hasHeaderRow: true`
- [ ] Dry-run mode (default) with document count verification
- [ ] `--execute` mode with 5s abort window
- [ ] Idempotency: skip documents already containing `tableBlock` in their sections

---

## Query Layer Checklist

No GROQ changes required. The `tableBlock` type is already projected as part of opaque Portable Text `content[]` arrays in all slug queries. The data shape is unchanged.

- `pageBySlugQuery` — no change needed (tableBlock already in PT content)
- `articleBySlugQuery` — no change needed
- `caseStudyBySlugQuery` — no change needed
- `nodeBySlugQuery` — no change needed

---

## Schema Enum Audit

| Field name | Schema file | `value` -> Display title |
|-----------|-------------|--------------------------|
| `variant` | `tableBlock.ts` | `default` -> Default, `responsive` -> Responsive (card layout on mobile), `wide` -> Wide (fixed columns) |

No new enum fields added.

---

## Non-Goals

- **No frontend rendering changes** — DS `Table` / `TableWrap` and both PT serializers (`portableTextComponents.jsx`, `PageSections.jsx`) are unchanged
- **No data shape changes** — the `tableBlock` schema fields (`variant`, `hasHeaderRow`, `rows[].cells[]`) remain identical
- **No `@sanity/table` plugin** — evaluated and rejected (see Context)
- **No rich text cells** — cells remain plain strings; rich text cells are a separate future enhancement
- **No htmlSection removal** — the migration converts table content but does not remove `htmlSection` type from the schema (other non-table HTML sections still use it)

---

## Technical Constraints

**Monorepo / tooling**
- Custom input component lives in `apps/studio/components/` (Studio-only, not shared)
- Migration script follows `scripts/migrate/lib.js` patterns (dry-run default, `--execute`, 5s abort, idempotency)
- HTML parser dependency: use `linkedom` (lightweight, no browser required) — install in root `devDependencies` for scripts

**Schema (Studio)**
- `tableBlock.ts` — add `components: { input: TableBlockInput }` import. No field changes.
- Custom input component receives `ObjectInputProps<TableBlockValue>` from Sanity
- Must use Sanity `set()` / `unset()` patch helpers for onChange (not direct mutation)

**Query (GROQ)**
- No changes

**Render (Frontend)**
- No changes

---

## Migration Script Constraints

**Target doc count**
```groq
count(*[_type in ["article", "node", "page"] && defined(sections) && count(sections[_type == "htmlSection" && html match "<table"]) > 0])
```
Expected count: **26** (1 article + 24 nodes + 1 page)

**Skip condition review**
- Skip if document has no `sections` array — correct, nothing to migrate
- Skip if no `htmlSection` contains `<table` — correct, no table content
- Skip if the htmlSection's table content has already been converted to `tableBlock` in a `textSection` — idempotency guard

**Idempotency**
Re-running the script checks whether each target `htmlSection` still contains `<table` HTML. If the section has already been replaced with a `textSection` containing `tableBlock`, the document is skipped. The script reports "0 documents to patch" on re-run.

---

## Files to Modify

**Studio**
- `apps/studio/components/TableBlockInput.tsx` — CREATE (custom input component)
- `apps/studio/schemas/objects/tableBlock.ts` — MODIFY (add `components.input` reference)
- `apps/studio/package.json` — VERIFY (no new deps needed; Sanity UI already available)

**Scripts**
- `scripts/migrate/html-tables-to-tableblock.js` — CREATE
- `package.json` (root) — add `linkedom` to devDependencies for HTML parsing, add `migrate:html-tables` script entry

**No frontend changes**

---

## Deliverables

1. **Custom input component** — `TableBlockInput.tsx` renders a grid UI in Studio with cell editing, row/column controls, and clipboard paste support
2. **Schema wiring** — `tableBlock.ts` references custom input; Studio hot-reloads without errors
3. **Paste support** — pasting tab-delimited text or HTML table markup into the grid populates cells correctly
4. **Migration script** — `html-tables-to-tableblock.js` with dry-run reporting 26 target documents
5. **Migration execution** — after `--execute`, 26 documents have `htmlSection` table content converted to `tableBlock` objects in `textSection`; re-run reports 0

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero new errors
- [ ] Studio hot-reloads without errors; `tableBlock` in any content document renders the grid input (not the default array-of-objects input)
- [ ] **Manual cell editing**: click a cell, type text, Tab to next cell — value persists on save
- [ ] **Paste from Google Sheets**: copy a 3x3 range from Sheets, click a cell in Studio, Ctrl/Cmd+V — grid expands and populates all 9 cells
- [ ] **Paste from HTML**: copy a table from a web page, paste into Studio — cells populated correctly
- [ ] **Add/remove**: add row, add column, remove row, remove column controls work; removing the last row/column prompts confirmation
- [ ] **Header row**: when `hasHeaderRow` is true, first row renders with distinct header styling in the input
- [ ] **Variant field**: variant radio buttons (default/responsive/wide) remain accessible alongside the grid
- [ ] **Migration dry-run**: reports exactly 26 documents to patch
- [ ] **Migration execute**: all 26 documents patched; tables render on frontend with DS Table styling
- [ ] **Migration idempotency**: re-run dry-run reports 0 documents to patch
- [ ] **Frontend rendering**: navigate to `/articles/the-great-icloud-divorce` — table renders with DS Table component (not raw HTML)
- [ ] **Frontend rendering**: spot-check 3 nodes from the migration list — tables render correctly

---

## Risks / Edge Cases

**Studio input component**
- [ ] Sanity's `ObjectInputProps` may not expose a convenient way to render child fields (`variant`, `hasHeaderRow`) alongside the custom grid — may need to use `renderDefault` or `renderField` from props
- [ ] Paste from Excel uses `\t` (tab) as column separator and `\n` as row separator — but some locales use different separators; start with tab/newline, extend later if needed
- [ ] Large tables (50+ rows) may have performance issues with re-rendering the full grid on each cell change — consider debounced updates if needed

**Migration script**
- [ ] Some `htmlSection` blocks contain a table mixed with prose, headings, or other HTML — these cannot be cleanly split into a single `tableBlock`. Strategy: extract the table as `tableBlock`, convert remaining HTML to basic PT blocks if feasible, otherwise flag for manual review
- [ ] Nested tables (`<table>` inside `<td>`) — unlikely in this content but guard against it; flatten or skip with a warning
- [ ] HTML tables with `colspan` / `rowspan` — `tableBlock` does not support merged cells. Strategy: expand merged cells (duplicate content) and warn
- [ ] HTML entities (`&amp;`, `&nbsp;`, etc.) in cell text — decode to plain text during extraction
- [ ] Some tables may have empty rows/cells used for spacing in WordPress — strip empty trailing rows/columns

**Data integrity**
- [ ] The migration modifies published documents — it must use the Sanity client's published document IDs (no `drafts.` prefix). Verify with `perspective: 'published'` query before patching.
- [ ] Back up: run a GROQ export of the 26 target documents before executing the migration

---

## Content Audit: All Documents With HTML Tables

### Articles (1)
| Title | Slug | URL | Sanity ID |
|-------|------|-----|-----------|
| The Great iCloud Divorce | `the-great-icloud-divorce` | `/articles/the-great-icloud-divorce` | `wp.article.1804` |

### Nodes (24)
| Title | Slug | Sanity ID |
|-------|------|-----------|
| Architecture: The Sugartown Digital Ecosystem (v1.0) | `architecture-the-sugartown-digital-ecosystem-v1-0` | `wp.node.1023` |
| Architecture Decision: The Two-Repo Solution | `architecture-decision-the-two-repo-solution-theme-vs-content` | `wp.node.1028` |
| Architecture: The Unified Taxonomy Strategy | `architecture-the-unified-taxonomy-strategy` | `wp.node.1029` |
| Feature: The Resume Factory & "Sugartown Pink" DS | `feature-the-resume-factory-the-sugartown-pink-design-system` | `wp.node.1054` |
| PRD: The Visualization Engine (Phase 2) | `prd-visualization-engine` | `wp.node.1079` |
| Architecture Insight: Sugartown 2.0 System Contract | `architecture-insight-the-sugartown-2-0-system-contract` | `wp.node.1094` |
| Architecture Update: Resume Factory v2.0 | `architecture-update-the-resume-factory-v2-0` | `wp.node.1121` |
| Design Ops: The "Pre-Design System" | `design-ops-the-pre-design-system-surviving-the-css-chaos` | `wp.node.1335` |
| Architecture Deep Dive: Resume Factory v3.0 | `architecture-deep-dive-resume-factory-v3-0` | `wp.node.1395` |
| The Great Versioning Reconciliation | `the-great-versioning-reconciliation` | `wp.node.1568` |
| Project: Knowledge Graph | `project-knowledge-graph-topology-over-chronology` | `wp.node.1570` |
| Release Assistant Governance | `release-assistant-governance-inputs-outputs-no-vibes` | `wp.node.1653` |
| AI Illustration Review | `ai-illustration-review-ethics-accessibility-ip-guardrails` | `wp.node.1654` |
| Claude vs. DevTools: Assumed Striping | `claude-vs-devtools-a-cautionary-tale-of-assumed-striping` | `wp.node.1702` |
| Sugartown Platform Roadmap (updated) | `sugartown-platform-roadmap-updated` | `wp.node.1733` |
| We Fixed the Same White Screen Three Times | `we-fixed-the-same-white-screen` | `wp.node.1815` |
| Market Scan: Top Headless CMS Platforms (2025) | `market-scan-top-headless-cms-platforms-2025` | `wp.node.852` |
| Engineering the Perfect Resume Workflow | `engineering-the-perfect-resume-workflow` | `wp.node.853` |
| Sweet Upgrades: Why Gemini 3 is the Cherry on Top | `sweet-upgrades-why-gemini-3-is-the-cherry-on-top` | `wp.node.863` |
| Process Insight: The CSV Reality Check | `process-insight-the-csv-reality-check` | `wp.node.942` |
| Project: Sugartown CMS Architecture | `project-sugartown-cms-architecture` | `wp.node.946` |
| Confession: I Don't Hate Blogs | `confession-i-dont-hate-blogs-i-just-hate-unstructured-data` | `wp.node.952` |
| Market Scan: Top AI Tools for Diagrams | `market-scan-top-ai-tools-for-data-architecture-diagrams` | `wp.node.954` |
| Status Update: The Great Re-Platforming | `status-update-the-great-re-platforming` | `wp.node.993` |

### Pages (1)
| Title | Slug | URL | Sanity ID |
|-------|------|-----|-----------|
| AI Ethics & Operations | `ai-ethics` | `/ai-ethics` | `wp.page.1644` |

---

## Follow-Up: Plugin Extraction

After the custom input component is battle-tested on Sugartown, extract it as a standalone open-source Sanity plugin.

**Why:** `@sanity/table` (2M+ weekly downloads) has no clipboard paste support. Every Sanity user pasting from Excel/Sheets hits the same wall. This is a real gap in the ecosystem.

**Extraction plan:**
1. Scaffold a new repo with `npx @sanity/plugin-kit@latest init sanity-plugin-table-paste`
2. Move `TableBlockInput.tsx` and any helpers into the plugin `src/`
3. Export both a **plugin function** (registers the `table` type with custom input) and the **raw input component** (for users who want to wire it into their own schema, like we do with `tableBlock`)
4. Support config options: `rowType` (compat with `@sanity/table` migration), `features: { paste, headerToggle, variantField }`
5. Add README with GIF demo of paste-from-Sheets
6. Publish to npm as `sanity-plugin-table-paste`

**Scope decision:** This is NOT part of SUG-34. SUG-34 builds the component for Sugartown. Plugin extraction is a separate effort after the component is stable. Create a new Linear issue when ready.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-34-table-plugin-migration.md` -> `docs/prompts/SUG-34-table-plugin-migration.md`
2. Commit: `docs: ship SUG-34 Table Authoring UX + HTML Table Migration`
3. Run `/mini-release SUG-34 Table Authoring UX + HTML Table Migration`
4. Transition SUG-34 to **Done** in Linear
5. Confirm clean tree before starting next epic
