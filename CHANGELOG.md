# Changelog

All notable changes to the Sugartown monorepo are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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

## [0.0.0] — baseline

Initial monorepo scaffold. Frontend and Studio imported as subtrees.
Tag: `v1.0.0-baseline`
