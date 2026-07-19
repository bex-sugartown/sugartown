# SUG-108 — Archive page header + toolbar consistency pass

**Linear Issue:** [SUG-108](https://linear.app/sugartown/issue/SUG-108)
**Status:** Phase 0 — awaiting mock approval
**Strategy:** merge-as-you-go (Phase 0 → Phase 1 → Phase 2 each merge independently)

---

## Background

The Knowledge Graph page (`/knowledge-graph`) got a masthead and toolbar treatment in SUG-105 Phase 2: eyebrow → h1 italic → description → kicker below heading, plus a `FilterStrip` with a right-side stat. The three content archive pages (`/articles`, `/case-studies`, `/knowledge-graph`) all use `ArchivePage.jsx` as their template, but only the KG page has the full masthead. The other two render a bare `<h1>` with no eyebrow and no kicker. The toolbar chip "In graph" exists but is small and easy to miss.

Goal: a single consistent header + toolbar structure across all three archive types.

---

## Scope

### Phase 0 — HTML mock

File: `docs/drafts/SUG-108-archive-header-toolbar.html`

Three sections showing:
- Articles (list view active)
- Case Studies (grid view active)
- Nodes (graph view active)

Each shows the masthead treatment and updated toolbar.

### Phase 1 — Masthead

In `ArchivePage` main component:

- Wrap existing `<h1>` + description in `<header className={styles.masthead}>`
- Add eyebrow above h1: mono uppercase, pink accent `eyebrowCurrent` span
  - Eyebrow text derived from archiveSlug: `articles` → "Library", `case-studies` → "Work", `knowledge-graph` → "Library"
  - Prefer an `eyebrow` field on the `archivePage` Sanity doc if present (schema addition, same commit)
- h1 gets `archiveHeadingItalic` class (already defined in pages.module.css)
- Description stays below h1; `archiveDescription` margin-bottom reduced (kicker takes its place)
- Remove kicker from masthead for archive pages — it lives in the toolbar instead

**CSS:** reuse existing `.masthead`, `.eyebrow`, `.eyebrowCurrent` from `SiteGraphPage.module.css`. Extract shared masthead styles into `pages.module.css` (or a new `archiveMasthead.module.css` shared by both). Do not duplicate.

### Phase 2 — Toolbar

In `ArchiveListing` sub-component:

- Keep existing grid / list / graph toggle buttons (no change)
- Promote "In graph" chip → full "VIEW IN FULL GRAPH →" button
  - Style: pink fill, mono uppercase, graph icon, matches mock
  - Visible on all three archive types (articles, case-studies, nodes)
  - On nodes graph-view, hide or change to "VIEW IN FULL GRAPH" (already there)
- Add right-side kicker stat (mono uppercase, muted):
  - List/grid view: "N ARTICLES · SORTED BY MOST RECENT" (or "N CASE STUDIES", "N NODES")
  - Graph view (nodes): "N NODES · GRAPH FILTERED TO TYPE=NODE" (if filter active)
- `archiveToolbar`: add `justify-content: space-between` so toggles+CTA sit left, kicker sits right
- Remove separate `archiveResultCount` paragraph (absorbed into right-side toolbar kicker)

---

## Eyebrow field — already exists

`archivePage` schema already has `eyebrow` (string, optional) and `archivePageBySlugQuery` already projects it. No schema change needed. The masthead uses `archiveDoc.eyebrow` directly — no fallback mapping required. Authors set it in Studio.

---

## CSS extraction plan

`SiteGraphPage.module.css` currently owns `.masthead`, `.eyebrow`, `.eyebrowCurrent`, `.eyebrowLink`, `.eyebrowSep`, `.kicker`, `.kickerFiltered`. These need to be available in `ArchivePage` too.

Options:
1. Move them into `pages.module.css` (shared archive styles already live there)
2. Create `archiveMasthead.module.css` imported by both pages

Prefer option 1 — `pages.module.css` already contains all shared archive primitives. Import the masthead block in the same commit that adds the `SiteGraphPage` dependency.

---

## Out of scope

- TaxonomyArchivePage (`/tags`, `/categories`, etc.) — different nav context, deferred
- Sort controls (currently hardcoded "most recent") — separate epic
- Filter persistence across nav — separate epic
