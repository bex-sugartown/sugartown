# Changelog

All notable changes to the Sugartown monorepo are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

> **Version note:** Entries from `[0.0.0]` onwards use SemVer and track the monorepo.
> Entries marked `[Pre-monorepo]` are historical records reconstructed from preserved
> git history in `sugartown-frontend`, `sugartown-sanity`, `repos/sugartown-pink`, and
> `repos/sugartown-cms`. Live site remains WordPress throughout all pre-monorepo eras.

---

## [0.9.0] — 2026-02-21
Repository stabilization and URL-driven archive filtering. Branch: `epic/repository-stabilization` → `main`

### apps/web

#### Added
- `FilterBar` component (`src/components/FilterBar.jsx`, `FilterBar.module.css`) — renders taxonomy facet groups as checkbox lists with option counts, color swatches for project/category facets, and a "Clear all" button; fully controlled via props, no internal data fetching
- `Pagination` component (`src/components/Pagination.jsx`, `Pagination.module.css`) — page navigation with prev/next buttons, page number buttons, ellipsis for large page counts; semantic `<button>` elements throughout; `aria-current="page"` on current page
- `useFilterState` hook (`src/lib/useFilterState.js`) — reads and writes filter selection and current page exclusively via URL query params (`useSearchParams`); exposes `activeFilters`, `currentPage`, `hasActiveFilters`, `setFilter`, `clearFacet`, `clearAll`, `setPage`; filter changes reset page to 1 automatically
- `applyFilters` function (`src/lib/applyFilters.js`) — pure client-side filter function; AND logic across facets, OR logic within a facet; returns all items when no filters are active; unknown/invalid slugs silently ignored
- `paginateItems` function (`src/lib/applyFilters.js`) — pure slice function; returns `pageItems`, `totalPages`, `totalItems` for a given page and page size (12)

#### Changed
- `ArchivePage`: wired FilterModel → `FilterBar` → `applyFilters` → `paginateItems` → `Pagination`; passes `archiveDoc` to `ArchiveListing` for filter config; fetches `facetsRawQuery` in addition to content listing query to build FilterModel
- `ArchivePage`: removed `[0...50]` GROQ slice cap from all three content type queries (`article`, `node`, `caseStudy`) — full item set now fetched for client-side filtering accuracy
- `pages.module.css`: added two-column archive layout (`.archiveLayout`: 220px sidebar + `1fr` content column, collapses to single column at ≤640px), `.archiveContent`, `.archiveResultCount`, `.clearFiltersLink`
- `eslint.config.js`: scoped browser globals to `src/**` only; added separate config block for `scripts/**` with Node.js globals; disabled `react-hooks/set-state-in-effect` rule (pre-existing intentional pattern in `useSanityDoc`)

#### Fixed
- ESLint reported `'process' is not defined` errors on `scripts/validate-urls.js` and `scripts/validate-filters.js` — root cause: ESLint config applied `globals.browser` to all `.js` files including Node scripts; fixed by scoping browser globals to `src/**` and adding a `scripts/**` config block with `globals.node`
- ESLint reported `react-hooks/set-state-in-effect` errors on `useSanityDoc.js` — `setLoading(true)` at the top of `useEffect` before async fetch is intentional; suppressed with rule disable and explanatory comment

### apps/studio

#### Changed
- `README.md`: replaced Sanity scaffold default content with current-state documentation covering dev URL, schema file locations, and Sanity project coordinates

#### Removed
- `schemas/INTEGRATION_GUIDE.md` — superseded by `docs/schemas/schema-reference.md` and `docs/queries/groq-reference.md`
- `schemas/QUICK_REFERENCE.md` — superseded by canonical docs
- `schemas/README.md` — superseded by canonical docs
- `schemas/SCHEMAS_COMPLETE.md` — superseded by canonical docs
- `schemas/legacy/SCHEMAS_COMPLETE.md` — superseded by canonical docs
- `schemas/sugartown_architecture_blueprint.md` — superseded by `docs/architecture/sanity-data-flow.md`
- `schemas/sugartown_sanity_mvp_prd.md` — superseded by canonical docs

### Other

#### Added
- `.github/workflows/ci.yml` — GitHub Actions pipeline runs on push and PR to `main`; sequential steps: install (`pnpm install --frozen-lockfile`) → lint → typecheck → validate:urls → validate:filters → build; any step failure halts pipeline; Sanity env vars injected from repository secrets
- `RELEASE_CHECKLIST.md` — 9-section pre-merge checklist covering branch hygiene, version bump, CHANGELOG, validation scripts, lint, build, smoke test, CI status, and post-merge deployment verification
- `docs/architecture/monorepo-overview.md` — workspace structure, tooling versions, enforced boundaries, Turbo pipeline, key commands
- `docs/architecture/sanity-data-flow.md` — system diagram, data flow steps, Sanity project coordinates, key source files, architectural constraints
- `docs/schemas/schema-reference.md` — canonical inventory of all schema types, taxonomy fields, registry location
- `docs/routing/url-namespace.md` — full canonical route map, legacy redirects, `TYPE_NAMESPACES`, deferred routes, archive-as-Sanity-doc pattern
- `docs/queries/groq-reference.md` — taxonomy fragments, all major query patterns, query conventions
- `docs/operations/ci.md` — pipeline order, fail conditions, script definitions, environment variables, Turbo pipeline explanation
- `validate:urls` and `validate:filters` scripts added to root `package.json` as `pnpm --filter web` wrappers

#### Changed
- Root `README.md`: replaced scaffold default with current-state index (workspaces table, key commands, architectural boundaries, docs directory index, Sanity project coordinates)
- `apps/web/README.md`: replaced Vite scaffold default with current-state documentation covering dev URL, key commands, key file locations, and links to `/docs`
- Root `package.json`: version `1.0.0` → `0.9.0`; added `validate:urls` and `validate:filters` scripts
- `apps/web/package.json`: version `0.0.0` → `0.9.0`

#### Removed
- `QUICK_START.md` — superseded by workspace READMEs and `docs/`
- `IMPLEMENTATION_SUMMARY.md` — superseded by `docs/`
- `apps/web/SCHEMAS_COMPLETE.md` — superseded by `docs/schemas/schema-reference.md`
- `apps/web/schemas/INTEGRATION_GUIDE.md` — superseded by canonical docs
- `apps/web/schemas/QUICK_REFERENCE.md` — superseded by canonical docs
- `apps/web/schemas/README.md` — superseded by canonical docs

---

## [0.8.0] — 2026-02-19

Stages 0–7: CMS parity, routing, taxonomy, and unified classification surface.
Branch: `integration/parity-check` → `main`

### apps/studio

#### Added
- `seoMetadata` object schema; embedded in `page`, `article`, `caseStudy`, `node`
- `colorHex` string field on `category` and `project` schemas
- `archivePage` document schema: `slug`, `contentTypes[]`, `title`, `description`, `hero`, `filterConfig`, `listStyle`, `sortBy`, `showPagination`, `enableFrontendFilters`, `featuredItems[]`, `seo`
- `person` document schema: `name`, `shortName`, `slug`, `titles[]`, `bio`, `image`, `links[]`; hidden legacy fields `role`, `email`, `website`
- `article` document schema (replaces `post`); registered in `schemas/index.ts`
- `authors[]`, `categories[]`, `tags[]`, `projects[]` reference fields on `article`, `caseStudy`, `node`, `page`

#### Changed
- `sanity.config.ts` desk structure: `'post'`/`'Blog Posts'` → `'article'`/`'Articles'`
- `archivePage` schema: `contentTypes` option and preview label updated `post`→`article`
- `person` preview: replaced computed `prepare()` with plain `select`; changed `image` → `image.asset` in select projection
- All doc type slug fields: removed async GROQ uniqueness validators
- All `authors[]` reference fields: removed `options: { filter: '!(_id in path("drafts.**"))' }`
- Upgraded `sanity` and `@sanity/vision` 5.9.0 → 5.10.0

#### Removed
- `@sanity/color-input` dependency; replaced with plain `colorHex` string field
- `post` removed from desk structure and schema registry (file kept as dead reference)

### apps/web

#### Added
- `src/lib/routes.js` — canonical URL registry: `TYPE_NAMESPACES`, `getCanonicalPath()`, `validateNavItem()`, archive/taxonomy path constants
- `src/lib/sanity.js` — Sanity client configured from Vite env vars
- `src/lib/useSanityDoc.js` — `useSanityDoc()` and `useSanityList()` React hooks
- `src/lib/seo.js` — `SEO_FRAGMENT`, `SITE_SEO_FRAGMENT`, `resolveSeo()` merge helper
- `src/lib/SiteSettingsContext.jsx` — React context for site-wide settings
- `src/lib/person.js` — `getPrimaryAuthor()`, `getAuthorDisplayName()`, `getAuthorByline()`, `getAuthorImageUrl()`, `getLinkByKind()`
- `src/lib/filterModel.js` — `buildFilterModel()`, `fetchFilterModel()`, `extractFacetItems()`, `normalizeTaxonomyItem()`
- `src/lib/queries.js` — centralized GROQ library: `PERSON_FRAGMENT`, `CATEGORY_FRAGMENT`, `TAG_FRAGMENT`, `PROJECT_FRAGMENT`, `TAXONOMY_FRAGMENT`; all content-type queries; taxonomy browse queries; `facetsRawQuery`; `archivePageWithFilterConfigQuery`
- `src/components/SeoHead.jsx` — renders `<title>`, `<meta description>`, OG tags
- `src/components/TaxonomyChips.jsx` + `TaxonomyChips.module.css` — generic chip renderer for projects → categories → tags; `--chip-color` CSS custom property for `colorHex` fields
- Page components: `HomePage`, `RootPage`, `ArticlePage`, `CaseStudyPage`, `NodePage`, `ArchivePage`, `ArticlesArchivePage`, `CaseStudiesArchivePage`, `KnowledgeGraphArchivePage`, `TaxonomyPlaceholderPage`, `NotFoundPage`
- `scripts/validate-urls.js` (`pnpm validate:urls`) — duplicate URL detection, missing slug report, nav item validation
- `scripts/validate-filters.js` (`pnpm validate:filters`) — derives and reports FilterModel for each archive

#### Changed
- `App.jsx`: full `<Routes>` tree with all page components; legacy redirects `/blog`, `/blog/:slug`, `/posts`, `/post/:slug` → `/articles`
- `Header.jsx`, `Footer.jsx`: migrated from hardcoded markup to `siteSettings`-driven rendering
- `queries.js`: `allPostsQuery` → `allArticlesQuery`; `postBySlugQuery` → `articleBySlugQuery`; `_type == "post"` → `_type == "article"` throughout; added `TAXONOMY_FRAGMENT`
- `routes.js`: `TYPE_NAMESPACES` `post: 'articles'` → `article: 'articles'`; `getArchivePath` updated
- `ArchivePage.jsx`: fixed `post`→`article` in `ARCHIVE_QUERIES` and `CONTENT_TYPE_TO_DOC_TYPE`; upgraded all three content-type queries with taxonomy projection; `TaxonomyChips` wired into `ItemCard`
- `ArticlePage.jsx`: replaced inline category text span + separate tag list with `<TaxonomyChips>`
- `CaseStudyPage.jsx`: replaced inline category list with `<TaxonomyChips>`; tags now rendered
- `NodePage.jsx`: replaced inline category list with `<TaxonomyChips>`; tags now rendered
- `validate-urls.js`: `TYPE_NAMESPACES` updated; GROQ query keys and coverage label updated `post`→`article`
- `vite.config.js`: `historyApiFallback: true` for SPA deep linking

### Sanity production data

- `archivePage` "articles" document: `contentTypes` updated `["post"]` → `["article"]`
- Old `post` document (ID: `6de2bd5f`) deleted; replaced with `article` document (ID: `article-placeholder`)

### Canonical route namespace (final)

```
/                              → HomePage
/:slug                         → RootPage (page type)
/articles                      → ArchivePage (contentType: article)
/articles/:slug                → ArticlePage
/blog, /blog/:slug             → redirect → /articles
/posts, /post/:slug            → redirect → /articles
/case-studies                  → ArchivePage (contentType: caseStudy)
/case-studies/:slug            → CaseStudyPage
/knowledge-graph               → ArchivePage (contentType: node)
/nodes                         → redirect → /knowledge-graph
/nodes/:slug                   → NodePage
/tags|categories|projects|people(/:slug) → TaxonomyPlaceholderPage
*                              → NotFoundPage (404)
```

### Taxonomy surface (all top-level content types)

```
authors[]    → person refs
projects[]   → project refs (colorHex chip accent)
categories[] → category refs (colorHex chip accent)
tags[]       → tag refs (neutral chip)
```

---

## [0.0.0] — 2026-01-31 — Monorepo baseline

Initial monorepo scaffold: `sugartown-frontend` and `sugartown-sanity` imported as git
subtrees into a pnpm workspaces + Turborepo root. History from both repos preserved intact.
Tag: `v1.0.0-baseline`

Repos merged:
- `sugartown-frontend` (Jan 19–31) → `apps/web`
- `sugartown-sanity` (Jan 18–31) → `apps/studio`

> See `[Pre-monorepo / v1]` below for the full history of what was imported.

---

<!-- ============================================================ -->
<!-- PRE-MONOREPO HISTORY                                         -->
<!-- Reconstructed from preserved git repos. Not SemVer releases. -->
<!-- Live site = WordPress throughout both eras below.            -->
<!-- ============================================================ -->

## [Pre-monorepo / v1] — 2026-01-18 to 2026-01-31 — Dual-Repo React + Sanity MVP

**Repos:** `sugartown-frontend` · `sugartown-sanity`
**Stack:** React 19 + Vite 7 · Sanity Studio v3 · separate git repos
**Status:** Dev only — never deployed to production. WP live site unchanged.

This era established the React + Sanity stack and the foundational content model.
Both repos were created Jan 18–19, developed in parallel through Jan 31, then
merged into the monorepo via git subtree on the same day.

### sugartown-frontend

#### Added
- Initial React + Vite app with Sanity client integration (`ae05d2c` 2026-01-19)
- Design System setup: media split, `SanityMedia` component (`f20eb6b` 2026-01-19)
- Design tokens extracted from legacy CSS; components migrated to token architecture (`8e62c3c`, `a5213dc` 2026-01-24)
- Duotone image effect utility (`6649f74` 2026-01-24)
- Complete Sanity CMS schema architecture — Phase 1: `node`, `post`, `page`, `caseStudy`, taxonomy (`db6d192` 2026-01-24)
- `NodesExample` component to display Knowledge Graph Nodes (`1f46649` 2026-01-25)
- `siteSettings` integration: preheader and CTA button wired to frontend (`9f7af5c` 2026-01-25)
- Homepage migrated to new Sanity schema (`2c48b58` 2026-01-25)
- New Sanity content model for pages and site settings (`3447b7f` 2026-01-31)

#### Changed
- DS color: seafoam → green (`627eae3` 2026-01-19)
- Hero: load button array (`04f5088` 2026-01-19)
- Various layout and background fixes (2026-01-20)
- `siteSettings` homepage schema with deprecations merged from branch `reverent-herschel` (`5d39793` 2026-01-25)

### sugartown-sanity

#### Added
- Sanity Studio bootstrapped (`1c62923` 2026-01-18)
- Initial Studio with atomic design schemas (`7f3f07a` 2026-01-19)
- `preheader` and `ctaButtonDoc` schemas; `siteSettings` updated (`6542514` 2026-01-25)
- `homepage` schema; legacy schemas deprecated (`b429e00` 2026-01-25)
- `heroSection` updated to use `ctaButtonDoc` references (`f897d9f` 2026-01-25)
- Legacy schemas deprecated; `editorialCard` object introduced (`3ff91b0` 2026-01-31)
- Legacy MVP docs added; V1 CMS strategy PRD published (`0cfae4e`, `13454c1` 2026-01-31)
- Architecture and schema reference docs consolidated via PRs #1–4 (`2026-01-31`)
- `siteSettings` schema updated (`f3bba7a` 2026-01-31)

#### Schema registry at merge (from `schemas/index.ts`):
- **Objects (new):** `link`, `richImage`, `ctaButton`, `editorialCard`
- **Objects (legacy):** `logo`, `media`, `navigationItem`, `socialLink`
- **Sections:** `heroSection`, `textSection`, `imageGallery`, `ctaSection`
- **Documents — taxonomy:** `category`, `tag`, `project`
- **Documents — content:** `node`, `post`, `page`, `caseStudy`
- **Documents — infrastructure:** `navigation`, `siteSettings`, `preheader`, `ctaButtonDoc`, `homepage`
- **Documents — deprecated:** `header`, `footer`, `hero`, `contentBlock`

#### GROQ queries at merge (from `sugartown-frontend/src/lib/queries.js`):
- `siteSettingsQuery`, `homepageQuery`, `allNodesQuery`, `nodeBySlugQuery`
- `allPostsQuery`, `postBySlugQuery`, `pageBySlugQuery`, `allCaseStudiesQuery`
- `allCategoriesQuery`, `allTagsQuery`, `allProjectsQuery`
- Legacy deprecated: `headerQuery`, `footerQuery`, `heroesQuery`, `contentBlocksQuery`

---

## [Pre-monorepo / v0] — 2025-11-27 to 2026-01-17 — WordPress + Python Pipeline

**Repos:** `repos/sugartown-pink` (WP Block Theme) · `repos/sugartown-cms` (Python pipeline)
**Stack:** WordPress Block Theme (PHP) · Python content pipeline (`publish_gem.py`) · no frontend framework
**Status:** Production — live site throughout this era and all subsequent eras.

The original platform. A custom WordPress Block Theme delivering the public site,
with a Python-based content pipeline (`publish_gem.py`) for publishing gems to WP via API.
Six named releases shipped to production during this era.

### repos/sugartown-pink (WordPress Block Theme)

#### Release history (all production)

**2026-01-11 — Design System Alignment + Token Updates**
- Upgraded Sugartown Pink to `#FF247D`; semantic tokens for single posts/pages
- Fixed chip sizing, code block background CSS variable, content width constraints
- Standardized footer pattern across archive and single templates
- Accessibility and layout fixes for footer heading hierarchy

**2026-01-03 — Responsive Tables Stabilization**
- Fixed mobile table card layout: overflow, box-sizing, width constraints
- Canonical design tokens confirmed loading correctly post-cache invalidation
- Added `st-table`, `st-table--wide`; deprecated `st-table--review`
- Added `st-filter`; deprecated `kg-filter`

**2026-01-01 — Design System Alignment & Accessibility Audit**
- Canonicalized `st-chip` as single interactive primitive across archive filters, hero nav, and metadata tags
- Removed competing chip variant classes; normalized card border colors and grid spacing
- Refactored CSS architecture: element styles moved to global base rules
- Accessibility audit: 16 documented issues with priority levels
- Created `CSS_FILE_ORGANIZATION_RULES.md`; standardized `ds-` → `st-` namespace

**2025-12-29 — AI Governance + Design System Foundations**
- Three-tier design token system: brand colors, spacing, typography
- `st-*` namespace standardized across tokens and docs
- AI Ethics & Operations policy published; design system ruleset and prompt templates published

**2025-12-27 — Taxonomy v4 + Interactive Filter System**
- `st-chip` interactive primitives for archive filters; floating multi-column dropdowns
- Taxonomy v4 complete: WordPress categories as single source of truth; `gem_category` meta eliminated
- Publisher v4.1: dynamic category ID lookup; auto-creates missing categories
- Archive result counter reflects actual filtered results; pagination accuracy fixed

**2025-12-24 — Knowledge Graph Landing + Template Integration**
- `/knowledge-graph/` established as intentional section landing with narrative context
- WP Block Theme template parts (`do_blocks()`) integrated in PHP templates
- Content model rule established: narrative content as Gems; archive templates render structure only

**2025-12-21 — Canonical st-card Adoption**
- `st-card` replaces archive-specific gem cards; dark variant (`st-card--dark`) for system/infra gems

**2025-12-19 — st-card Migration**
- `pink-card` → `st-card`; canonical gradient recipe, unified tag/term styling

**2025-12-17 — Design System v3.3**
- Grid layout decoupled; overlap fixes; automation hook

**2025-12-03–07 — Initial commits**
- `Initial commit: Sugartown Pink Theme` (`7671c1c` 2025-12-03)
- Stink Pink color iteration; post type updates (`5b4042c` 2025-12-07)

### repos/sugartown-cms (Python pipeline)

#### Added
- Initial commit: pipeline scripts, README (`e8c40b7` 2025-11-27)
- Resume ingestion workflow (`b883867` 2025-11-30)
- Publishing Architecture Gem; upsert logic; Resume workflow gems (`2544791`, `274aed1` 2025-11-27–12-03)
- `publish_gem.py` v3.7: draft-aware, fuzzy match, taxonomy-aware (`4012fd0` 2025-12-05)
- Finalized README with v3.7 architecture (`69c6edd` 2025-12-05)
- Synced with WP theme release history through Jan 2026
