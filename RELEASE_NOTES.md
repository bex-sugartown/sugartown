# Release Notes — v0.9.0
**Date:** 2026-02-21
**Branch:** `epic/repository-stabilization` → `main`
**Scope:** Sugartown monorepo (`apps/web`, `apps/studio`, root)

---

## What this release is

v0.9.0 covers two epics: repository stabilization (docs consolidation, CI enforcement, release tooling) and URL-driven archive filtering (FilterBar, Pagination, URL-synchronized filter state). Neither epic touches the Sanity schema or any published URL.

---

## What changed

### Archive filtering and pagination

Archive pages (`/articles`, `/case-studies`, `/knowledge-graph`) now support taxonomy filtering and pagination. Filter state lives exclusively in the URL — `/articles?tags=ai,design&categories=systems&page=2` — making filtered views shareable, bookmarkable, and preserved across reload and browser back/forward.

Three new units handle the work cleanly separated: `useFilterState` owns URL ↔ state sync, `applyFilters` owns the filtering logic (AND across facets, OR within), and `paginateItems` owns the slice. `FilterBar` and `Pagination` are dumb components driven entirely by props — no data fetching inside either.

The existing `filterModel.js` and `buildFilterModel()` infrastructure (added in Stage 4) are unchanged. This release wires the UI layer on top of it.

The GROQ `[0...50]` item cap was removed from all archive listing queries. All published items are now fetched; the display slice is handled by `paginateItems`.

### Repository documentation

Thirteen stale markdown files were deleted across `apps/studio/schemas/` and `apps/web/schemas/` — duplicates and Phase 1 scaffold artifacts that had drifted from reality. Six canonical replacements were added under `/docs`:

| File | Covers |
|---|---|
| `docs/architecture/monorepo-overview.md` | Workspace structure, tooling, Turbo pipeline |
| `docs/architecture/sanity-data-flow.md` | System diagram, data flow, Sanity coordinates |
| `docs/schemas/schema-reference.md` | All schema types, taxonomy fields, registry |
| `docs/routing/url-namespace.md` | Canonical routes, legacy redirects, TYPE_NAMESPACES |
| `docs/queries/groq-reference.md` | All GROQ query patterns and conventions |
| `docs/operations/ci.md` | CI pipeline order, fail conditions, env vars |

The scaffold-default `README.md` files in the repo root, `apps/web`, and `apps/studio` were replaced with accurate current-state content.

### CI pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) now runs on every push and PR to `main`. Steps run in order and halt on failure:

```
install → lint → typecheck → validate:urls → validate:filters → build
```

`validate:urls` and `validate:filters` are now also runnable from the repo root via `pnpm validate:urls` and `pnpm validate:filters` (previously only available inside `apps/web`).

### ESLint fixes

Two pre-existing ESLint errors are resolved. `validate-urls.js` and `validate-filters.js` are Node.js scripts and now get Node globals instead of browser globals. `useSanityDoc.js` uses `setLoading(true)` synchronously at the top of `useEffect` before an async fetch — this is intentional and the rule is suppressed with an explanatory comment.

### Release tooling

`RELEASE_CHECKLIST.md` added at repo root — a 9-section pre-merge checklist covering branch hygiene, version bump, CHANGELOG, validation scripts, lint, build, smoke test, CI status, and post-merge deployment verification.

---

## Not in this release

- Taxonomy detail pages (`/tags/:slug`, `/categories/:slug`, `/projects/:slug`, `/people/:slug`) remain placeholder routes — filter chips are not yet linked
- FilterBar is not rendered on archives where no facets have options configured in Sanity (graceful suppression, not a bug)
- `apps/storybook` — no changes
- `packages/design-system` — no changes
- No Sanity schema changes
- No changes to published URL structure

---

## Validator state at release

```
pnpm validate:urls
──────────────────
Total docs with slugs inspected: 4
✅  /knowledge-graph  →  [node]
✅  /case-studies     →  [caseStudy]
✅  /articles         →  [article]
✅  No docs with missing slugs
✅  No duplicate canonical URLs
⚠️   "Blog" nav item → "articles" (missing leading slash — Sanity content, not code)

pnpm validate:filters
──────────────────────
✅  FilterModel produced for /knowledge-graph  (4 facets, 1 doc)
✅  FilterModel produced for /articles         (1 facet, 1 doc)
✅  FilterModel produced for /case-studies     (4 facets, 1 doc)
✅  All filter models produced successfully
```
