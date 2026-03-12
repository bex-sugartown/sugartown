# Release Notes — v0.17.0

**Date:** 2026-03-12
**Branch:** `main`
**Scope:** Sugartown monorepo — apps/web, apps/studio, packages/design-system, scripts

---

## What this release is

A content authoring expansion release. Eight epics (EPIC-0162 through EPIC-0169) extended the section builder, added new content primitives, unified link/button rendering, and wired citations into the standard authoring path. This is the first release where all five taxonomy types (categories, tags, projects, people, tools) are fully operational.

---

## What changed

### Tools become a first-class taxonomy (EPIC-0162)

Tools are no longer a hardcoded string enum. They are now standalone documents with their own archive (`/tools`), detail pages (`/tools/:slug`), and filter facets — the same treatment as categories, tags, projects, and people. Existing content was migrated from string values to document references via `migrate-tools.js`. Tool documents also gained `toolType`, `url`, and `logo` fields for richer metadata.

### New content blocks: tables, callouts, card builders (EPIC-0163, 0164, 0165)

Three new section/block types are available in the Studio page builder:
- **Table blocks** render structured data tables within Portable Text fields.
- **Callout sections** provide visually distinct emphasis blocks wired to all document types.
- **Card builder sections** are now available on articles, case studies, and nodes — not just pages.

### Section layout cohesion (EPIC-0167)

Detail pages now use a unified layout contract. The `context="detail"` prop on PageSections applies consistent spacing via CSS overrides, and typography in `.detailContent` areas uses DS tokens instead of hard-coded values. The `imageGallery` GROQ projection was fixed to correctly resolve images via `asset->url`. Standalone `content` fields on nodes and articles have been deprecated in favour of section-based authoring.

### Unified link and button rendering (EPIC-0168)

The Button component is now Router-aware — it renders `<Link>` for internal hrefs and `<a target="_blank">` for external URLs. A shared `linkUtils.js` module (`isExternalUrl`, `getLinkProps`) replaced ad-hoc link logic across Button, the Link atom, and NavigationItem. The header CTA now renders through the standard Button component; the old seafoam-specific CSS was removed.

### Citations in content body (EPIC-0169)

Authors can now add inline citation markers ([1], [2]) and document-level endnotes on articles, nodes, and case studies. The `citationRef` annotation was added to the shared Portable Text config, and detail pages render a `CitationZone` with `CitationNote` entries when citations are present.

### Category position control (EPIC-0166)

Archive pages and card builder sections can now control where category chips appear on cards via the `categoryPosition` field, giving editors layout flexibility without code changes.

### Detail page hero layout

Detail pages now render the hero image flush to the header — above the back-nav and title — for a more immersive entry point.

### MetadataCard redesign

MetadataCard was redesigned as a catalog-style card layout, with accompanying Storybook stories for visual QA.

### Studio housekeeping

- AI Context and Agentic Caucus tabs merged into a single tab on the node schema.
- The `ctaButton` schema label was corrected from "Secondary (Seafoam)" to "Secondary (Lime)" to match the rendered colour.

### Portable Text rendering fixes

- HTML entities in content spans are now decoded correctly.
- Inline code marks now render via a shared PT serializer.

---

## Not in this release

- Themed background images (dark/light flourish PNGs) were added but are currently commented out pending design iteration.
- Platform page and IA Brief Phase 2 items (docs, governance, ai-ethics) are not started.
- About page rewrite is in progress but not included in this release.
- No changes to the Storybook app beyond a config update.

---

## Validator state at release

| Validator | Result |
|-----------|--------|
| `validate:urls` | 1 warning — "Services" nav item missing URL (known Sanity content issue) |
| `validate:filters` | Pass — 3/3 archive filter models produced |
| `validate:content` | 2 errors (draft-shadows-published on `core-web-vitals` article and `about` page — not user-facing); 1 node missing excerpt |
| `validate:tokens` | 52 unknown token references in 19 files — pre-existing legacy token debt, no regressions from this release |
