# CSS Class Naming Conventions

Class names are contracts. A class named for a content type (`taxRow`, `alphaBtn`, `toolUrl`) describes one use case and cannot be shared. A class named for a semantic pattern (`listItem`, `indexCell`, `entityDescription`) describes a shape and can be reused anywhere that shape appears.

---

## The core rule

**Name for shape and behaviour, not for content type or page context.**

If the class name contains a content-type noun — tag, tool, tax, alpha, person, project, folio, profile — it has failed the audit. That noun will appear in every component that imports the class, and it will be wrong for every second usage.

The test: can this class be used on a categories page, a tools page, and a people page without the name becoming a lie? If yes, the name is good. If no, rename.

---

## Shared class registry

Before writing any new class, check these locations in order:

1. **`pages.module.css`** — shared page-level layout classes. Canonical patterns:
   - `.entityDetailPage` — wide detail page wrapper (`--st-width-detail-wide`)
   - `.detailPage` — standard prose detail page wrapper (760px)
   - `.detailHeader` — detail page header container
   - `.detailEyebrow` — mono uppercase type label above a title
   - `.archiveHeading` — primary archive/detail h1
   - `.archiveDescription` — description paragraph below h1
   - `.archiveResultCount` — result count line (0.875rem muted)
   - `.archiveEmpty` — empty state paragraph
   - `.archiveGrid` — content card grid
   - `.accentBar` — coloured accent bar (structural base; caller sets width + background)
   - `.backLink` — ← back navigation link
   - `.folioIdentity` — folio identity text block (min-width: 0)

2. **`TaxonomyArchivePage.module.css`** — index layout patterns:
   - `.indexGroup` — horizontal strip of index cells (the container)
   - `.indexCell` / `.indexCellActive` / `.indexCellSelected` / `.indexCellInactive` — single cell states
   - `.indexGrid` / `.indexGridSingle` — multi-column index grid
   - `.indexCol` — single column within the grid
   - `.indexHeader` / `.indexHeaderGlyph` / `.indexHeaderRule` — column header (letter + rule)
   - `.indexList` — list within a column
   - `.listItem` / `.listItemInner` / `.listItemLabel` / `.listItemSub` / `.listItemCount` — row pattern

3. **DS tokens** (`--st-*`) — all spacing, color, typography decisions must use tokens. No hardcoded values.

4. **DS components** — `Grid`, `Card`, `Chip`, `SectionLabel`, `ContentCard` before writing any layout CSS.

---

## Vocabulary

### Index patterns

Used for direct-access navigation and filter strips — both letter filters and pagination.

| Class | Shape |
|---|---|
| `indexGroup` | Container for a row of `indexCell` elements |
| `indexCell` | Single interactive cell (square, 0px radius) |
| `indexCellActive` | Default interactive state |
| `indexCellSelected` | Active/current selection (pink bg) |
| `indexCellInactive` | Non-interactive (no content for this letter) |
| `indexGrid` | Multi-column layout for indexed lists |
| `indexGridSingle` | Single-column fallback (filter active) |
| `indexCol` | One column within the grid |
| `indexHeader` | Column header: glyph + rule |
| `indexHeaderGlyph` | Letter or symbol in the header |
| `indexHeaderRule` | Horizontal rule in the header |
| `indexList` | List within a column |

**Composite consumers of index primitives:**
- `AlphaFilter` — letter filter strip (renders `indexGroup` + `indexCell` × 27)
- `Pagination` — page navigation (renders `indexGroup` + `indexCell` × N)

Both are composite components. The index primitives are the shared visual layer. See SUG-125 for the DS primitive epic.

### List item pattern

Used anywhere a list of named items appears with optional sublabel and count — tags, categories, tools, projects, people.

| Class | Shape |
|---|---|
| `listItem` | Row container (flex, hover indent) |
| `listItemInner` | Label + sublabel stacked |
| `listItemLabel` | Primary label (mono) |
| `listItemSub` | Secondary sublabel (ui, muted) |
| `listItemCount` | Count badge (mono, right-aligned) |

### Detail page pattern

Used on all entity detail pages regardless of content type.

| Class | Shape |
|---|---|
| `entityDetailPage` | Page wrapper (wide, `--st-width-detail-wide`) |
| `detailHeader` | Header container (margin-bottom: 2.5rem) |
| `detailEyebrow` | Mono uppercase type label |
| `accentBar` | Thin coloured bar above the header |
| `archiveHeading` | Primary h1 |
| `archiveDescription` | Description paragraph |
| `archiveResultCount` | Result count (shared with archive pages) |

---

## Blocked prefixes

The `validate:css-names` script (`pnpm validate:css-names`) blocks these content-type-scoped prefixes in `apps/web/src/pages/`:

- `tax*` — taxonomy-specific (use `index*`, `list*`, or shared page classes)
- `alpha*` — alpha-strip-specific (use `index*`)
- `toolLogo*`, `toolUrl*` — tool-specific (use `entityFolio*` or `pages.module.css`)
- `profileHeadline*` — person-specific (use `archiveHeading` or `detailEyebrow`)

To add a blocked prefix, update `apps/web/scripts/validate-css-names.js`.

---

## Proposal table gate

Before writing any new CSS class, produce a naming proposal table in the commit message or epic doc:

| Proposed class | Closest existing | Reuse decision |
|---|---|---|
| `.myNewClass` | `pages.module.css .entityFolio` (80%) | Extend existing |
| `.listRow` | None — new semantic pattern | New class approved |

Do not edit any CSS module file until the table has been reviewed. See CLAUDE.md §CSS class pre-implementation reuse audit.
