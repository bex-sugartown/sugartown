# Auto-Generated XML Sitemap + Visual HTML Sitemap

**Linear Issue:** [SUG-15](https://linear.app/sugartown/issue/SUG-15/auto-generated-xml-sitemap)
**Status:** Todo
**Priority:** Low (post-launch SEO)
**Date logged:** 2026-03-17
**Last updated:** 2026-03-26

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — no existing sitemap component. HTML sitemap page follows `SchemaErdPage` pattern (code-driven page, no Sanity doc required). Uses existing `SeoHead` for meta. Link rendering reuses `getCanonicalPath()` from `routes.js`.
- [x] **Use case coverage** — three consumers: (1) search engine crawlers (`/sitemap.xml`), (2) SEO audit tools (Screaming Frog, Ahrefs, GSC), (3) **humans visiting `/sitemap`** — editorial transparency showing the full IA structure, content types, and governance of the site.
- [x] **Layout contract** — HTML sitemap page uses standard page layout (Header/Footer via App shell). Content area: grouped by content type, each group is a heading + link list. Max-width inherits from app container. Responsive: single column, no grid complexity.
- [x] **All prop value enumerations** — content type display labels needed for group headings (see Technical Design).
- [x] **Correct audit file paths** — verified below.
- [x] **Dark / theme modifier treatment** — HTML sitemap page inherits theme from app shell (`data-theme`). Links use `--st-color-link` / `--st-color-link-hover`. Section headings use `--st-color-brand-primary`. No custom themed surfaces.
- [x] **Studio schema changes scoped** — no schema changes required.
- [x] **Web adapter sync scoped** — N/A (no DS component — page-level only).
- [x] **Composition overlap audit** — N/A.
- [x] **Atomic Reuse Gate** — (1) no existing sitemap utility or page exists, (2) build script consumed by Netlify; HTML page consumed by router + humans + crawlers, (3) N/A for composability — page component + build script, not a reusable primitive.

---

## Context

Sugartown is a React SPA (Vite + react-router-dom) hosted on Netlify. There is no server-side rendering — all routes resolve client-side via the `/* /index.html 200` SPA fallback in `_redirects`.

**Today there is no `sitemap.xml` or `robots.txt` beyond what Netlify auto-generates.** Search engines can discover pages via links but have no authoritative URL inventory.

Relevant existing infrastructure:
- **Route registry** — `apps/web/src/lib/routes.js` defines `TYPE_NAMESPACES`, `TAXONOMY_NAMESPACES`, `ARCHIVE_PATHS`, `TAXONOMY_BASE_PATHS` and `getCanonicalPath()`
- **Build-time redirect script** — `apps/web/scripts/build-redirects.js` already queries Sanity at build time and writes `_redirects` to `apps/web/public/`. The sitemap generator follows the same pattern.
- **SEO module** — `apps/web/src/lib/seo.js` has `resolveSeo()` with `noIndex` / `canonicalUrl` support per document
- **Sanity client** — `apps/web/src/lib/sanity.js` (perspective: `published`)
- **URL validator** — `apps/web/scripts/validate-urls.js` validates nav URLs against route patterns

Sanity doc types with published slugs: `page`, `article`, `caseStudy`, `node`, `category`, `tag`, `project`, `person`, `tool`, `archivePage`.

---

## Objective

After this epic, two sitemap surfaces exist:

1. **`/sitemap.xml`** — machine-readable XML sitemap generated at build time, referenced from `robots.txt`, consumed by search engines and SEO tools.
2. **`/sitemap`** — human-readable HTML sitemap page showing the full site structure grouped by content type, with live counts, last-updated dates, and direct links to every published page. This is the governance surface — visible proof that the IA is intentional, complete, and maintained.

Both are generated from the same Sanity data source. The XML sitemap updates at build time (Netlify deploy). The HTML sitemap fetches live from Sanity at runtime (always current, no stale builds). Documents with `seo.noIndex: true` are excluded from the XML sitemap but **included** on the HTML page (marked as `noindex` so editors can see what's hidden from search).

No schema changes. No GROQ query changes to existing page queries.

---

## Doc Type Coverage Audit

| Doc Type | In sitemap? | Notes |
|----------|-------------|-------|
| `page` | Yes | Root pages (`/about`, `/contact`, `/services`, etc.) |
| `article` | Yes | `/articles/:slug` |
| `caseStudy` | Yes | `/case-studies/:slug` |
| `node` | Yes | `/nodes/:slug` |
| `archivePage` | Yes | Archive landing pages (`/articles`, `/case-studies`, `/knowledge-graph`) |
| `category` | Yes | `/categories/:slug` |
| `tag` | Yes | `/tags/:slug` |
| `project` | Yes | `/projects/:slug` |
| `person` | Yes | `/people/:slug` |
| `tool` | Yes | `/tools/:slug` |

---

## Scope

### Phase A — XML Sitemap + robots.txt (build-time)
- [ ] Build-time sitemap generator script (`apps/web/scripts/build-sitemap.js`)
- [ ] GROQ query to fetch all published slugs + `_type` + `_updatedAt` + `seo.noIndex`
- [ ] URL construction using `getCanonicalPath()` from `routes.js` (single source of truth)
- [ ] Static route entries (homepage `/`, archive paths, taxonomy base paths)
- [ ] `robots.txt` generation with sitemap reference
- [ ] Integration into Vite build pipeline (`package.json` build script)
- [ ] `changefreq` and `priority` heuristics per content type
- [ ] Exclusion of `seo.noIndex: true` documents
- [ ] Validation script to check sitemap against live Sanity data

### Phase B — Visual HTML Sitemap Page (runtime)
- [ ] `SitemapPage.jsx` — code-driven page at `/sitemap` (same pattern as `SchemaErdPage`)
- [ ] Route registration in `App.jsx`
- [ ] GROQ query in `queries.js` — `sitemapQuery` fetching all published docs grouped by type
- [ ] Content grouped by type with section headings, live counts, and last-updated timestamps
- [ ] Every entry is a clickable SPA link (via `<Link to>`)
- [ ] `noIndex` documents visually flagged (dimmed + "hidden from search" label) — governance visibility
- [ ] Summary stats bar: total pages, content types, last build date
- [ ] Responsive layout — single column, scannable, accessible
- [ ] `SeoHead` integration — meta title "Sitemap — Sugartown Digital"
- [ ] Footer link to `/sitemap` added to site footer nav

---

## Non-Goals

- **No dynamic/on-demand XML sitemap** — Sugartown is a static SPA on Netlify; there is no server to generate XML per-request. Build-time generation is the correct pattern. (The HTML page is runtime/client-side, which is fine.)
- **No sitemap index** — with <1,000 URLs, a single sitemap file is sufficient (limit is 50,000).
- **No image sitemap extensions** — defer to a follow-up epic if needed for image SEO.
- **No schema changes** — `seo.noIndex` and `seo.canonicalUrl` already exist on all doc types.
- **No hreflang** — single-language site.
- **No Google Search Console submission** — manual step after deploy; document in acceptance criteria.
- **No visual tree/graph rendering** — the HTML sitemap is a structured list, not a D3 tree diagram. If a visual IA map is wanted later, that's a separate epic.

---

## Technical Design

### Architecture

```
build-sitemap.js
  ├── Queries Sanity for all published docs with slugs
  ├── Imports getCanonicalPath() from routes.js
  ├── Adds static entries (/, archive paths, taxonomy base paths)
  ├── Filters out seo.noIndex: true
  ├── Respects seo.canonicalUrl overrides
  ├── Writes sitemap.xml to apps/web/public/
  └── Writes robots.txt to apps/web/public/
```

### GROQ query (sitemap-specific, not added to queries.js)

```groq
*[
  _type in ["page", "article", "caseStudy", "node", "archivePage",
            "category", "tag", "project", "person", "tool"]
  && defined(slug.current)
  && !(_id in path("drafts.**"))
] {
  _type,
  "slug": slug.current,
  _updatedAt,
  "noIndex": seo.noIndex,
  "canonicalUrl": seo.canonicalUrl
}
```

### Priority & changefreq heuristics

| Content type | Priority | Change frequency |
|-------------|----------|-----------------|
| Homepage `/` | 1.0 | weekly |
| `page` (root pages) | 0.8 | monthly |
| `article` | 0.7 | monthly |
| `caseStudy` | 0.7 | monthly |
| `node` | 0.6 | weekly (knowledge graph evolves) |
| Archive pages | 0.6 | weekly |
| Taxonomy pages | 0.4 | monthly |
| `person` | 0.3 | yearly |
| `tool` | 0.3 | yearly |

### robots.txt

```
User-agent: *
Allow: /

Sitemap: https://sugartown.io/sitemap.xml
```

### Build integration

```jsonc
// apps/web/package.json — scripts
{
  "build": "vite build && node scripts/build-redirects.js && node scripts/build-sitemap.js",
  "build:sitemap": "node scripts/build-sitemap.js"
}
```

The script runs **after** `vite build` so it writes into the build output, alongside `build-redirects.js`.

### Phase B — Visual HTML Sitemap Page

**Route:** `/sitemap` (code-driven, no Sanity page doc — same pattern as `/platform/schema`)

**Runtime GROQ query** (`sitemapQuery` in `queries.js`):

```groq
{
  "content": *[
    _type in ["page", "article", "caseStudy", "node", "archivePage",
              "category", "tag", "project", "person", "tool"]
    && defined(slug.current)
  ] | order(_type asc, title asc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    _updatedAt,
    "noIndex": coalesce(seo.noIndex, false)
  },
  "stats": {
    "totalPublished": count(*[
      _type in ["page", "article", "caseStudy", "node", "archivePage",
                "category", "tag", "project", "person", "tool"]
      && defined(slug.current)
    ]),
    "hiddenFromSearch": count(*[
      _type in ["page", "article", "caseStudy", "node", "archivePage",
                "category", "tag", "project", "person", "tool"]
      && defined(slug.current)
      && seo.noIndex == true
    ])
  }
}
```

**Content type display labels** (group headings on the page):

| `_type` | Display label | Icon/emoji |
|---------|--------------|------------|
| `page` | Pages | — |
| `article` | Articles | — |
| `caseStudy` | Case Studies | — |
| `node` | Knowledge Graph | — |
| `archivePage` | Archive Pages | — |
| `category` | Categories | — |
| `tag` | Tags | — |
| `project` | Projects | — |
| `person` | People | — |
| `tool` | Tools | — |

**Page layout:**

```
┌─────────────────────────────────────────┐
│  Sitemap                          (h1)  │
│  {totalPublished} pages · {types} types │
│  {hiddenFromSearch} hidden from search  │
├─────────────────────────────────────────┤
│                                         │
│  Articles (24)                    (h2)  │
│  ├─ The Great iCloud Divorce      link  │
│  ├─ Building a Design System      link  │
│  └─ ...                                 │
│                                         │
│  Case Studies (8)                 (h2)  │
│  ├─ Project Starlight             link  │
│  └─ ...                                 │
│                                         │
│  Knowledge Graph (42)             (h2)  │
│  ├─ Claude [noindex]           dimmed   │
│  └─ ...                                 │
│                                         │
│  Pages (6)                        (h2)  │
│  Categories (18) · Tags (156) · ...     │
│                                         │
└─────────────────────────────────────────┘
```

- Each entry: title as `<Link to={getCanonicalPath(...)}>`, last updated date in `<time>` element
- `noIndex` entries: dimmed text + small badge "hidden from search"
- Groups sorted by editorial weight: Articles → Case Studies → Knowledge Graph → Pages → Archives → taxonomy types
- Group heading includes count in parentheses
- Summary bar at top: total count, type count, noIndex count
- Entire page is semantic HTML: `<main>`, `<section>`, `<h2>`, `<ul>/<li>`, `<a>`/`<Link>` — accessible and crawlable

**CSS:** `SitemapPage.module.css` — minimal, inherits app typography tokens. No DS component needed.

---

## Technical Constraints

**Monorepo / tooling**
- Script runs from `apps/web/` context
- Must import `getCanonicalPath` and namespace maps from `src/lib/routes.js` — use dynamic import or duplicate the minimal logic (prefer import if ESM resolution works in the build script context; `build-redirects.js` is the reference pattern)
- Sanity client config from `src/lib/sanity.js` — same import pattern as `build-redirects.js`

**Netlify**
- `sitemap.xml` and `robots.txt` must be in the build output directory (`apps/web/dist/` after build)
- Writing to `apps/web/public/` during build works because Vite copies `public/` contents to `dist/`
- Alternatively, write directly to `dist/` post-build (follow `build-redirects.js` pattern)

**SPA routing**
- `sitemap.xml` and `robots.txt` must NOT be caught by the SPA fallback `/* /index.html 200`
- Netlify serves static files before `_redirects` rules, so files in `dist/` at those exact paths will be served correctly

---

## Files to Modify

**Scripts**
- `apps/web/scripts/build-sitemap.js` — CREATE (sitemap + robots.txt generator)
- `apps/web/package.json` — update `build` script to chain `build-sitemap.js`

**Static assets (generated at build time, not committed)**
- `apps/web/public/robots.txt` — CREATE (committed, static content)
- `apps/web/dist/sitemap.xml` — generated at build time, not committed

**Frontend (HTML sitemap page)**
- `apps/web/src/pages/SitemapPage.jsx` — CREATE (code-driven page)
- `apps/web/src/pages/SitemapPage.module.css` — CREATE (page styles)
- `apps/web/src/App.jsx` — add route `/sitemap` → `SitemapPage`
- `apps/web/src/lib/queries.js` — add `sitemapQuery`
- `apps/web/src/lib/routes.js` — add `/sitemap` to reserved paths (so nav validator accepts it)

**Footer**
- Footer nav in Sanity `siteSettings` — add `/sitemap` link (content change, not code)

**Validation (optional)**
- `apps/web/scripts/validate-sitemap.js` — CREATE (post-build check: XML well-formed, URL count matches Sanity doc count, no noIndex docs included)

---

## Deliverables

### Phase A — XML
1. **Build script** — `build-sitemap.js` exists, runs without errors, produces valid XML
2. **robots.txt** — served at `/robots.txt` with correct sitemap URL
3. **sitemap.xml** — served at `/sitemap.xml`, validates against sitemap schema
4. **Build integration** — `pnpm build` in `apps/web` produces both files in `dist/`
5. **noIndex exclusion** — documents with `seo.noIndex: true` do not appear in XML sitemap
6. **URL correctness** — every URL in sitemap uses `getCanonicalPath()` output, matching live site routes

### Phase B — Visual HTML
7. **SitemapPage** — `/sitemap` renders a grouped, accessible HTML sitemap with live Sanity data
8. **Stats bar** — total page count, content type count, and noIndex count visible at top of page
9. **noIndex visibility** — noIndex documents shown on HTML page with visual flag (governance transparency)
10. **SPA links** — every entry uses `<Link to>` for SPA navigation, not `<a href>`
11. **SEO meta** — page has correct `<title>` and `<meta description>` via `SeoHead`
12. **Footer link** — `/sitemap` accessible from site footer

---

## Acceptance Criteria

- [ ] `pnpm build` in `apps/web` succeeds and produces `dist/sitemap.xml` and `dist/robots.txt`
- [ ] `sitemap.xml` is valid XML conforming to the [sitemaps.org protocol](https://www.sitemaps.org/protocol.html)
- [ ] Every published Sanity document with a slug (and without `seo.noIndex: true`) has a `<url>` entry
- [ ] URLs in sitemap match canonical paths from `routes.js` — no trailing slashes, no duplicates
- [ ] Homepage `/` is included with priority 1.0
- [ ] All archive paths (`/articles`, `/case-studies`, `/knowledge-graph`) are included
- [ ] Taxonomy base paths (`/tags`, `/categories`, `/projects`, `/people`, `/tools`) are included
- [ ] `robots.txt` references `https://sugartown.io/sitemap.xml`
- [ ] Documents with `seo.noIndex: true` are excluded from sitemap
- [ ] Documents with `seo.canonicalUrl` set use that URL instead of the auto-generated path
- [ ] Deployed site serves `/sitemap.xml` with `Content-Type: application/xml`
- [ ] Deployed site serves `/robots.txt` with `Content-Type: text/plain`
- [ ] No existing build step or page functionality is broken
- [ ] URL count in sitemap matches `count(*[_type in [...] && defined(slug.current) && seo.noIndex != true])` from Sanity

### Phase B — Visual HTML
- [ ] `/sitemap` renders without errors and shows all published documents grouped by content type
- [ ] Group headings show correct count (e.g. "Articles (24)")
- [ ] Summary stats bar shows total published count, content type count, and noIndex count
- [ ] Every link navigates correctly via SPA (no full-page reload)
- [ ] `noIndex` documents are visually flagged (dimmed + badge) but still visible
- [ ] Page has correct meta title ("Sitemap — Sugartown Digital") via `SeoHead`
- [ ] Page is fully accessible: semantic HTML (`<main>`, `<h2>`, `<ul>`), keyboard navigable, screen-reader friendly
- [ ] Page renders correctly at desktop and mobile breakpoints
- [ ] `/sitemap` link appears in footer navigation
- [ ] Typography uses design system tokens (`--st-font-heading-*`, `--st-font-body-*`)

---

## Risks / Edge Cases

**Build risks**
- [ ] Script must handle Sanity API being temporarily unreachable — fail the build (do not produce an empty sitemap)
- [ ] Script must handle zero results gracefully (Sanity dataset empty) — produce valid XML with only static routes

**URL risks**
- [ ] Documents with missing `slug.current` are excluded by the GROQ filter — confirm no doc types have slugs stored differently
- [ ] `archivePage` slugs resolve to root paths (`/articles`, `/knowledge-graph`) — verify `getCanonicalPath` handles this correctly (it does: `docType === 'archivePage'` returns `/${slug}`)
- [ ] Duplicate URLs: if an `archivePage` slug matches an `ARCHIVE_PATHS` static entry, deduplicate

**Deployment risks**
- [ ] `sitemap.xml` must not be cached aggressively by Netlify CDN — it should update on every deploy. Netlify's default `Cache-Control: public, max-age=0, must-revalidate` for non-hashed assets handles this.
- [ ] Confirm SPA fallback `/* /index.html 200` does NOT intercept `/sitemap.xml` — Netlify serves exact file matches before `_redirects`

**HTML sitemap risks**
- [ ] Large document count (500+ entries) — verify page does not lag. If needed, collapse taxonomy sections by default (accordion) or lazy-load below the fold.
- [ ] `/sitemap` route must not conflict with `/:slug` catch-all — place it BEFORE the `/:slug` route in `App.jsx` (same as `/platform/schema`)
- [ ] Stale data: HTML page fetches live from Sanity, so it's always current. No risk of stale build artifact.

---

## Future Enhancements (not in scope)

- **Sitemap index** — split into multiple sitemaps if URL count exceeds 10,000
- **Image sitemap** — `<image:image>` extensions for hero images / thumbnails
- **Lastmod from Sanity** — use `_updatedAt` as `<lastmod>` (included in query, easy to wire)
- **Google Search Console API** — auto-submit sitemap on deploy via GSC API
- **Incremental generation** — only regenerate entries for changed documents (optimization for large sites)

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-15-xml-sitemap.md` → `docs/prompts/SUG-15-xml-sitemap.md`
2. Commit: `docs: ship SUG-15 XML Sitemap`
3. Run `/mini-release SUG-15 XML Sitemap`
4. Transition SUG-15 to **Done** in Linear
5. Submit sitemap URL to Google Search Console (manual, post-deploy)
