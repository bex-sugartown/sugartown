# Release Notes — v0.10.0
**Date:** 2026-02-21
**Branches:** `epic/taxonomy-detail`, `epic/redirect-infrastructure`, `epic/wp-migration` → `main`
**Scope:** Sugartown monorepo (`apps/web`, `apps/studio`, `scripts/migrate`, `docs`)

---

## What this release is

v0.10.0 covers three epics: taxonomy detail pages (live filter chip destinations), redirect infrastructure (Sanity-driven `_redirects` build), and the full WordPress → Sanity content migration pipeline. The frontend now has real content — 327 documents imported from WordPress — and the taxonomy chip links that were wired in v0.9.0 now resolve to working pages.

---

## What changed

### Taxonomy detail pages

`/tags/:slug`, `/categories/:slug`, `/projects/:slug`, and `/people/:slug` are now real pages instead of placeholders. A single `TaxonomyDetailPage` component handles all four types — it derives the taxonomy type from the URL path segment, fetches the taxonomy document from Sanity, then fetches all associated articles, case studies, and nodes via a single GROQ query.

Each page renders a header block (name, optional description, optional `colorHex` accent bar) followed by a paginated content listing reusing the same card pattern as archive pages. Invalid slugs return a proper 404. Valid taxonomy documents with no associated content show the header and an empty state message — not a 404.

`TaxonomyChips` (present on archive cards and detail pages since v0.8.0) now link to these taxonomy URLs. Previously the chips were display-only; they are now interactive navigation.

`TaxonomyPlaceholderPage.jsx` is now a one-line re-export shell pointing to `TaxonomyDetailPage` — no route changes in `App.jsx` were needed.

### Case study detail pages

Case study detail pages (`/case-studies/:slug`) were blank below the metadata block — `featuredImage` and `sections` had never been wired into `CaseStudyPage`. Both are now rendered correctly.

### WP→Sanity migration pipeline

A complete seven-script migration system lives at `scripts/migrate/`. It exports all content from the WordPress REST API, transforms it to Sanity document shape, imports it via batch upsert, uploads media to the Sanity CDN, generates redirect documents, and produces a parity report confirming import completeness.

327 documents are now in Sanity production:

| Type | Source |
|---|---|
| Articles | WP posts + Knowledge Graph CPT |
| Case studies | WP portfolio CPT |
| Pages | WP static pages |
| People | WP authors/users |
| Categories, tags | WP taxonomy terms |
| Projects | WP project taxonomy |

The transform layer includes `sanitiseSlug()` — all WP slugs are decoded (percent-encoding removed), stripped of non-ASCII characters (emoji, accented chars), and collapsed of duplicate dashes before being stored. This was prompted by WP post 814 ("💎 LUXURY DOT COM 💎") which had an emoji slug that produced a 404 on the React frontend.

### Frontend authentication for migrated content

Documents imported with `wp.*` dot-namespace IDs (e.g. `wp.article.1804`) are placed in a system namespace that requires an authenticated query even on a public Sanity dataset. The frontend Sanity client now uses a read-only viewer token (`VITE_SANITY_TOKEN`) to query these documents. The token has viewer-only permissions — it cannot write, modify, or delete.

### Redirect infrastructure

A new `redirect` document type in Sanity Studio lets editors manage URL redirects without touching code. A `build-redirects.js` script runs at build time, fetches all published `redirect` documents, and writes `apps/web/public/_redirects` in Netlify/Cloudflare Pages format. The file is also committed to git for CI reproducibility.

The WP→Sanity migration produced the initial redirect inventory from WP permalink → Sanity slug mapping.

A legacy redirect was added to `App.jsx` for the emoji slug article: `/articles/%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e` → `/articles/luxury-dot-com`.

### New schema types

**`redirect` document** — source path, destination URL/path, status code (301/302), editorial note. Managed in Studio; consumed by the build-time `build-redirects.js` script.

**`legacySource` object** — embedded in `article`, `caseStudy`, `node`, `page`; carries WP provenance data (platform, WP ID, WP type, WP slug, import timestamp). Populated by import script. Read-only in Studio UI.

**`slug` field on `project`** — projects now have a proper `slug.current` field. `projectId` is retained. This unblocks `getCanonicalPath({ docType: 'project', slug })` and makes `/projects/:slug` taxonomy detail pages work without special-casing.

### WP freeze and cutover documentation

`docs/migration/wp-freeze-cutover.md` documents the content freeze procedure, DNS cutover steps, rollback plan, and post-cutover verification checklist for when the live site is ready to switch from WordPress to the React/Sanity frontend.

---

## Not in this release

- DNS cutover — WP remains the live production site; this migration is content parity groundwork
- Taxonomy archive listing pages (`/tags`, `/categories`, `/projects`, `/people` without `:slug`) — remain placeholder routes; taxonomy archives are a future epic
- `apps/storybook` — no changes
- `packages/design-system` — no changes
- No changes to published URL structure for existing Sanity content

---

## Validator state at release

```
pnpm validate:urls
──────────────────
✅  /knowledge-graph  →  [node]  "Knowledge Graph"
✅  /case-studies  →  [caseStudy]  "Case Studies"
✅  /articles  →  [article]  "Articles"
✅  No docs with missing slugs
✅  No duplicate canonical URLs detected
✅  All checks passed — URL authority is clean.

pnpm validate:filters
──────────────────────
✅  FilterModel produced for /knowledge-graph  (4 facets)
✅  FilterModel produced for /articles         (1 facet)
✅  FilterModel produced for /case-studies     (4 facets)
✅  All filter models produced successfully
```
