# Site-Wide Content Search

**Linear Issue:** [SUG-36](https://linear.app/sugartown/issue/SUG-36/site-wide-content-search)
**Status:** Backlog
**Priority:** Low (high user value, no existing infrastructure — design spike needed first)
**Date logged:** 2026-03-26

---

## Problem Statement

Sugartown has no search. With 218+ published URLs across 10 document types, 90+ tags, 30+ tools, and a growing glossary, users have no way to find content except browsing archives or following taxonomy links. For a site built around discoverability and knowledge management, this is a significant gap.

---

## Design Spike: Three Open Questions

### Q1. Search engine — build or buy?

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Sanity text search API** | GROQ `match` operator + `text::query()` against published content | Zero infrastructure, already have the client, free | Limited relevance ranking, no fuzzy matching, API latency on each keystroke, no offline, query complexity scales with content types |
| **B. Client-side index (Fuse.js)** | Build-time JSON manifest → shipped as static asset → Fuse.js in-browser | Zero runtime cost, instant results, offline-capable, full control over ranking | Index file size grows with content (~50-100KB for current corpus), build-time dependency, no server-side fallback, stale until next deploy |
| **C. Hosted search (Algolia / Typesense)** | Managed search index, push content on publish via webhook | Best relevance, typo tolerance, faceted search, analytics | External dependency, cost ($0 free tier → $$$), vendor lock-in, webhook infrastructure needed, overkill for current scale |
| **D. Hybrid: Fuse.js now, Algolia later** | Start with B for launch, migrate to C when content corpus outgrows client-side index | Ship fast, defer cost/complexity | Two implementations to maintain during transition |

**Recommendation: Option B (Fuse.js) with a migration path to D.**

At ~220 documents, a client-side JSON index is well within performance budget. Fuse.js handles fuzzy matching, weighted fields, and threshold tuning. The build-time generation pattern already exists (`build-sitemap.js`, `build-redirects.js`) — a `build-search-index.js` fits the same pipeline. Revisit when content exceeds 500+ documents or faceted search becomes a requirement.

### Q2. Scope — what gets indexed?

**Phase 1 (minimum viable):**
- Articles (title, excerpt, tags, categories)
- Nodes (title, excerpt, tags, categories, status)
- Case studies (title, excerpt, tags, categories, project)

**Phase 2 (full coverage):**
- Pages (title, excerpt)
- Glossary terms (term, definition, abbreviation) — when SUG-35 ships
- Taxonomy items (tag names, tool names, category names)

**Field weighting (Fuse.js `keys` config):**
```js
keys: [
  { name: 'title',    weight: 1.0 },  // exact title match = top result
  { name: 'excerpt',  weight: 0.5 },  // body summary
  { name: 'tags',     weight: 0.3 },  // classification metadata
  { name: 'category', weight: 0.3 },
  { name: 'project',  weight: 0.2 },
  { name: 'tools',    weight: 0.2 },
]
```

### Q3. UI surface — where does search live?

| Pattern | Description | Pros | Cons |
|---------|-------------|------|------|
| **A. Nav bar search field** | Persistent input in the main navigation | Always visible, standard pattern | Eats nav space, mobile hamburger conflict |
| **B. Search icon → expanding input** | Icon in nav, click to expand inline field | Space-efficient, clean nav | Extra click, discoverability tradeoff |
| **C. Dedicated `/search` page** | Full page with results list | Room for filters/facets, deep-linkable | Navigates away from current context |
| **D. Command palette (⌘K)** | Overlay modal triggered by keyboard shortcut or nav icon | Power-user friendly, modern, non-destructive | Discoverability for non-keyboard users, accessibility complexity |
| **E. B + C combined** | Icon triggers inline quick results (top 5), "See all results" links to full `/search` page | Best of both — quick access + full results | Two surfaces to maintain |

**Recommendation: Option E (icon + dedicated page).** The nav icon provides quick access with a compact dropdown showing top 5 results. Pressing Enter or clicking "See all results" navigates to `/search?q=...` for the full results page with content type grouping. The `/search` page is deep-linkable and works without JS (shows empty state with instruction).

---

## Proposed Architecture

### Build Layer — `build-search-index.js`

New build-time script following the `build-sitemap.js` / `build-redirects.js` pattern:

```
build-search-index.js
├── Query Sanity for all published content (articles, nodes, caseStudies)
├── Project into search-friendly shape (title, excerpt, slug, type, tags[], category, tools[])
├── Flatten tag/tool/category references to plain strings for Fuse.js
├── Write dist/search-index.json
└── Log stats: {totalIndexed, byType, fileSize}
```

**Pipeline integration:**
```json
"build": "node scripts/build-redirects.js && vite build && node scripts/build-sitemap.js && node scripts/build-search-index.js"
```

Runs after `vite build` (writes to `dist/`) — same as sitemap.

### Query Layer — GROQ

```groq
// searchIndexQuery — build-time only, not used at runtime
*[_type in ["article", "caseStudy", "node"] && !(_id in path("drafts.**"))] | order(_type asc, title asc) {
  _id,
  _type,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, pt::text(content[0..2])),
  "tags": tags[]->name,
  "category": categories[0]->name,
  "tools": tools[]->name,
  "project": project->name,
  _updatedAt
}
```

### Client Layer — React

**New files:**

1. **`apps/web/src/lib/useSearch.js`** — custom hook
   - Lazy-loads `search-index.json` on first invocation (not at app boot)
   - Initializes Fuse.js instance with configured keys/weights/threshold
   - Returns `{ search(query), results, isLoading, isReady }`
   - Debounced input (300ms) to prevent excessive re-scoring
   - Memoized Fuse instance — only rebuilt when index changes

2. **`apps/web/src/components/SearchInput.jsx`** — nav bar component
   - Search icon button in nav → expands to input on click
   - Compact dropdown: top 5 results with title, type badge, excerpt snippet
   - Enter key → navigates to `/search?q=...`
   - Escape key → closes dropdown and collapses input
   - Results link via `getCanonicalPath()` (never hardcoded URLs)

3. **`apps/web/src/pages/SearchPage.jsx`** — `/search`
   - Reads `q` param from URL search params
   - Full results list grouped by content type (articles, nodes, case studies)
   - Each result: title (linked), type badge, excerpt, date, tags
   - Empty state: "No results for '{query}'" with suggestions
   - No-query state: "Search Sugartown — articles, case studies, and knowledge graph nodes"
   - SeoHead: `noIndex: true` (search results pages shouldn't be indexed)

### Route Registration

```jsx
// App.jsx — code-driven pages section (before /:slug catch-all)
<Route path="/search" element={<SearchPage />} />
```

```js
// routes.js — STATIC_ROUTES addition
{ path: '/search', label: 'Search' }
```

### CSS / Design

Search results reuse existing design tokens — no new token surface needed:
- Result cards: minimal list style (not full Card component)
- Type badges: reuse `CONTENT_TYPE_LABELS` from ContentCard
- Highlight matched text in results using `<mark>` element
- `--st-color-brand-primary` for matched text highlight background

---

## Accessibility Requirements

- Search input: `role="search"`, `aria-label="Search site content"`
- Dropdown results: `role="listbox"`, `aria-activedescendant` for keyboard nav
- Arrow keys navigate results, Enter selects, Escape closes
- Screen reader announcement: "N results for {query}" via `aria-live="polite"`
- `/search` page: semantic heading hierarchy, skip link target
- No autofocus on page load (WCAG 2.4.3) — focus on explicit interaction only

---

## Performance Budget

- **Index file size:** Target < 100KB gzipped for Phase 1 (~220 docs)
- **Time to first result:** < 100ms after index loaded (Fuse.js is synchronous)
- **Index load strategy:** Lazy — fetched on first search interaction, cached in memory
- **Build time impact:** < 5s added to build pipeline (single Sanity query + JSON write)

---

## Phased Delivery

### Phase 1 — Foundation (MVP)
- `build-search-index.js` in build pipeline
- `searchIndexQuery` in queries.js
- `useSearch` hook with Fuse.js
- `/search` page with full results
- Route registration
- Index: articles + nodes + case studies (3 content types)
- Basic relevance: title > excerpt > tags > category

### Phase 2 — Nav Integration
- `SearchInput` component in nav bar
- Quick results dropdown (top 5)
- Keyboard shortcuts (⌘K or `/` to focus)
- Mobile: search icon in hamburger menu

### Phase 3 — Expanded Coverage
- Add pages, glossary terms (SUG-35), taxonomy items to index
- Content type filter tabs on `/search` page
- Search analytics (track popular queries — could inform content strategy)
- Highlight matched terms in result excerpts
- "Did you mean?" fuzzy suggestion for zero-result queries

### Phase 4 — Migration Evaluation
- Assess whether Fuse.js still meets needs at 500+ documents
- Evaluate Algolia/Typesense if faceted search, analytics, or query volume warrants it
- Build abstraction: `useSearch` hook API stays the same, only the engine changes

---

## Dependencies

- **Build pipeline pattern:** `build-sitemap.js` as reference (same Sanity query → static file pattern)
- **Route registry:** `routes.js` for `getCanonicalPath()` in result links
- **Content types:** articles, caseStudies, nodes must have `title`, `slug`, `excerpt` or `content` fields
- **Fuse.js:** `pnpm add fuse.js` in `apps/web` — lightweight (~25KB minified)
- **SUG-35 (glossary):** Phase 3 depends on glossary terms existing in Sanity

---

## Relationship to Other Epics

```
SUG-15 (Sitemap)        SUG-36 (Search)           SUG-35 (Glossary)
  ↓                        ↓                          ↓
"What pages exist?"     "Find content by query"     "What do terms mean?"
  ↓                        ↓                          ↓
Build-time XML          Build-time JSON index       Runtime GROQ queries
  ↓                        ↓                          ↓
Crawlers & governance   Users & editors             Readers & SEO
```

All three share the build-time Sanity query pattern — the search index is a sibling of the sitemap, generated from the same content corpus.

---

## Not in Scope

- **Full-text body search** — indexing raw PortableText blocks is expensive and low-signal. Title + excerpt + metadata is sufficient for discovery.
- **Search-as-you-type in Studio** — Sanity Studio has its own search. This is web-only.
- **AI/semantic search** — no vector embeddings or LLM-powered search. Keyword + fuzzy matching is appropriate for this corpus size.
- **URL search / redirect lookup** — the sitemap page (SUG-15) serves this governance need.
- **Search engine indexing** — that's the sitemap's job. This epic is user-facing search.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-36-site-search.md` → `docs/prompts/SUG-36-site-search.md`
2. Commit: `docs: ship SUG-36 Site Search`
3. Run `/mini-release SUG-36 Site Search`
4. Transition SUG-36 to **Done** in Linear
