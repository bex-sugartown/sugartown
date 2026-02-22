# Release Notes — v0.12.0

**Date:** 2026-02-22
**Branch:** `main` (direct — two micro-epics committed sequentially)
**Scope:** Sugartown monorepo (`apps/web`, `apps/studio`)

---

## What this release is

v0.11.0 and v0.12.0 were committed on the same day and together form a
two-part structural upgrade. v0.11.0 is the taxonomy architecture epic:
controlled vocabulary enforcement, a filter model capable of surfacing
tool/status facets, routing gap closure for node detail pages, and a full
taxonomy migration over 53 content documents. v0.12.0 adds an SEO
auto-extraction system that derives page titles and meta descriptions
directly from document content, eliminating the need for editors to
manually fill in SEO fields for every document.

---

## What changed

### Taxonomy controlled vocabulary and migration (v0.11.0)

The tag taxonomy had accumulated 256 WordPress-era entries, many of which
were tool names, client names, status flags, or near-duplicates of each
other. These have been resolved and the content updated accordingly:

- 77 tool-type tags (e.g. "contentful", "figma") were extracted into a
  new `tools[]` field — a 30-item controlled string enum that now exists
  on `article`, `caseStudy`, and `node` documents
- 26 near-duplicate tags were remapped to canonical IDs
- 62 garbage/status/client-name tags were removed from content
- 191 conceptual and thematic tags were retained as valid controlled
  vocabulary
- A `status` field (draft / published / archived) was added to `article`
  and `caseStudy` documents

53 content documents were patched live in Sanity production via
`scripts/migrate-taxonomy.js --execute`.

### Filter model architecture (v0.11.0)

The `buildFilterModel()` function that drives the archive filter system
has been updated to handle the two new facet dimensions:

- `tools` and `status` are now `enum`-type facets (synthesised from raw
  string values) alongside the existing `reference`-type facets (author,
  project, category, tag)
- Category facets now carry an optional `parent` property, enabling
  optional grouped display in the UI
- Facets with zero options are omitted from the output rather than
  emitted as empty arrays
- Each facet in the model output now carries a `type` field
  (`'reference' | 'enum'`)
- Archive page editors can now configure `tools` and `status` as facets
  in Studio's `filterConfig.facets[]`

### Routing gap closure (v0.11.0)

The `/knowledge-graph/:slug` route (node detail pages) was entirely
missing from `App.jsx` — navigating to a node slug returned a 404. It
has been added. The `/nodes/:slug` route, which previously rendered node
pages directly, now correctly redirects to `/knowledge-graph/:slug` via
a `NodeSlugRedirect` wrapper component.

### URL namespace protection (v0.11.0)

`validate-urls.js` now detects when a `page` document slug would collide
with a reserved archive route namespace (`articles`, `case-studies`,
`knowledge-graph`, `nodes`, `tags`, `categories`, `projects`, `people`).
A collision is a hard fail.

### SEO auto-extraction (v0.12.0)

`resolveSeo()` in `apps/web/src/lib/seo.js` has been fully rewritten.
The new signature accepts the full document object (`resolveSeo(doc,
siteSettings)`) rather than pre-destructured fields. The resolver now
reads `doc.seo.autoGenerate` to select between two modes:

**Auto mode** (default — field absent or `true`): title is derived as
`"${doc.title} | Sugartown Digital"`. Description follows a priority
chain: explicit `doc.seo.description` override → `doc.excerpt` →
`extractPlainText(doc.body, 160)` → site default → empty string.

**Manual mode** (`autoGenerate: false`): title and description are taken
exactly as entered in the `seo` object fields. No auto-derivation.

A new `extractPlainText(body, maxLength)` named export handles Portable
Text body extraction. It walks `_type: 'block'` nodes only, skips code
blocks, strips HTML tags, collapses whitespace, and applies sentence-safe
truncation (backs up to the last space before the character limit; hard-
truncates only when no space exists in the segment). Returns `''` safely
for null/empty/undefined input.

Existing documents without an `autoGenerate` field behave identically to
`autoGenerate: true` — no migration needed.

All six page components (`ArticlePage`, `NodePage`, `CaseStudyPage`,
`RootPage`, `HomePage`, `ArchivePage`) have been updated to the new call
signature. All detail queries now project `_type` for canonical URL
derivation; `article` and `node` queries additionally project
`"body": content[]` to enable body-text fallback in auto description
mode.

### Studio: SEO autoGenerate field (v0.12.0)

The `seoMetadata` object type in Studio has a new `autoGenerate` boolean
field (first in the field list, `initialValue: true`). Editors can toggle
it off to switch a document to manual SEO override mode. When on (the
default), the title and description fields below it are informational
only — the frontend derives values from the document itself.

---

## Not in this release

- Filter UI components — `buildFilterModel()` produces the model but no
  filter panel UI exists yet in `apps/web`
- `tools` and `status` facets are available in `filterConfig` but no
  archive page has them configured yet; they will appear once an editor
  enables them in Studio
- `apps/storybook` — no changes in either version
- `packages/design-system` — no changes in either version
- DNS cutover — WordPress remains the live production site

---

## Validator state at release

### v0.11.0

```
pnpm validate:urls
──────────────────
✅  /knowledge-graph  →  [node]  "Knowledge Graph"
✅  /case-studies  →  [caseStudy]  "Case Studies"
✅  /articles  →  [article]  "Articles"
✅  No docs with missing slugs
✅  No duplicate canonical URLs detected
✅  No page slugs collide with reserved namespaces
✅  All checks passed — URL authority is clean.

pnpm validate:taxonomy
───────────────────────
✅  All tools[] values are in the canonical enum
✅  All tags[] refs point to existing tag documents
⚠️  1 WARNING: Beauty Retail case study has 3 categories (editorial fix)

pnpm validate:filters
──────────────────────
✅  No WP-era keys in GROQ query strings
✅  FilterModel produced for /knowledge-graph  (4 facets: author, project, category, tag)
✅  FilterModel produced for /articles         (4 facets: author, project, category, tag)
✅  FilterModel produced for /case-studies     (4 facets: author, project, category, tag)
✅  All filter models produced successfully.
```

### v0.12.0

```
pnpm validate:urls    ✅  All checks passed — URL authority is clean.
pnpm validate:filters ✅  All filter models produced successfully. No WP-era keys.
pnpm --filter web build  ✅  341 modules transformed. Zero errors.
```
