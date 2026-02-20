# URL Namespace

## Purpose

Documents the canonical URL structure for all content types in the Sugartown frontend. Single source of truth for routing decisions.

## Context

All URLs are built via `getCanonicalPath({ docType, slug })` in `apps/web/src/lib/routes.js`. No URL strings are hard-coded outside that file. The routing layer was established in v0.8.0 Stage 0.

## Details

### Canonical Route Map

```
/                                  → HomePage
/:slug                             → RootPage (page type)
/articles                          → ArticlesArchivePage (archivePage doc)
/articles/:slug                    → ArticlePage
/case-studies                      → CaseStudiesArchivePage (archivePage doc)
/case-studies/:slug                → CaseStudyPage
/knowledge-graph                   → KnowledgeGraphArchivePage (archivePage doc)
/nodes/:slug                       → NodePage
/tags                              → TaxonomyPlaceholderPage
/tags/:slug                        → TaxonomyPlaceholderPage
/categories                        → TaxonomyPlaceholderPage
/categories/:slug                  → TaxonomyPlaceholderPage
/projects                          → TaxonomyPlaceholderPage
/projects/:slug                    → TaxonomyPlaceholderPage
/people                            → TaxonomyPlaceholderPage
/people/:slug                      → TaxonomyPlaceholderPage
*                                  → NotFoundPage (404)
```

### Legacy Redirects (active)

```
/blog          → /articles
/blog/:slug    → /articles/:slug
/posts         → /articles
/post/:slug    → /articles/:slug
/nodes         → /knowledge-graph
```

### TYPE_NAMESPACES (routes.js)

```js
article:   'articles'
caseStudy: 'case-studies'
node:      'nodes'
page:      ''           // root namespace
```

### Deferred Routes

These routes exist as `TaxonomyPlaceholderPage` — routing works but no content is rendered yet:
- `/tags`, `/tags/:slug`
- `/categories`, `/categories/:slug`
- `/projects`, `/projects/:slug`
- `/people`, `/people/:slug`

Taxonomy detail pages are Stage 8 scope.

### Archive Pages Are Sanity Documents

Archive landing pages (`/articles`, `/case-studies`, `/knowledge-graph`) are driven by `archivePage` documents in Sanity Studio. Publishing or unpublishing an `archivePage` doc controls whether that route returns content or 404. Title, description, hero, sort order, and filter config are all editable in Studio.

### Validation

```bash
pnpm validate:urls
```

Runs `apps/web/scripts/validate-urls.js`. Detects:
- Duplicate canonical URLs
- Published docs missing required slugs
- Nav items referencing non-canonical paths

Exits non-zero on any error. Run before every merge to `main`.

## Related Files

- `apps/web/src/lib/routes.js` — canonical URL registry (do not hard-code URLs elsewhere)
- `apps/web/src/App.jsx` — React Router `<Routes>` tree
- `apps/web/scripts/validate-urls.js` — URL validation script
- `docs/operations/ci.md` — CI enforcement of validate:urls

## Change History

| Date | Change |
|---|---|
| 2026-02-19 | v0.8.0 Stage 0 — routes.js established; full route tree implemented |
| 2026-02-19 | Legacy redirects added: /blog, /posts, /post/:slug → /articles |
| 2026-02-20 | Moved to `docs/routing/` during doc consolidation |
