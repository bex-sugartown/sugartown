# SUG-81 — Site-wide Knowledge Graph

**Linear Issue:** [SUG-81](https://linear.app/sugartown/issue/SUG-81/site-wide-knowledge-graph-multi-type-graph-across-all-content)
**Status:** Backlog
**Priority:** Medium
**Depends on:** SUG-73 (KG canvas renderer, graph toggle, card rail)

---

## IA Decisions (locked in planning — 2026-05-07)

These decisions supersede earlier open questions in this doc.

### URL ownership

| Route | Was | Now |
|-------|-----|-----|
| `/knowledge-graph` | Nodes-only archive | **Site-wide cross-type graph** (all content types, filterable) |
| `/nodes/` | Did not exist (was `/knowledge-graph`) | **Agentic Caucus Nodes archive** |
| `/nodes/:slug` | Already canonical | Unchanged |

The `/knowledge-graph` redirect chain: the current nodes-only page must redirect to `/nodes/` before or at launch of the site-wide graph. One 301 in App.jsx.

### Navigation structure (approved)

```
Work
  Services          /services/
  Case Studies      /case-studies/
  Platform          /platform/

Library
  Knowledge Graph   /knowledge-graph/        ← site-wide graph, all types
  Articles          /articles/
  Agentic Caucus Nodes  /nodes/              ← renamed from "Knowledge Graph"
  Case Studies      (cross-link from Work/)  ← cross-link only, no new route

About
  Overview          /about/
  CV / Resume       /cv-resume/

Utilities (footer only)
  AI Ethics         /ai-ethics/
  Privacy & Terms   /privacy-terms/
  Sitemap           /sitemap/
  Contact           /contact/
```

Nav display name for the node archive: **"Agentic Caucus Nodes"**. URL: `/nodes/`. The name signals the epistemological + curatorial character of the collection without being generic.

### Filter capabilities on `/knowledge-graph`

The site-wide graph has a type filter panel (or toggle strip) allowing the visitor to show/hide content types: All · Articles · Case Studies · Nodes. Default: All. Filter state is client-side only (no URL param required for v1, but nice-to-have for sharing).

Each archive page (articles, case-studies, nodes) links to the knowledge graph pre-filtered to its type — "View in graph →" CTA. This gives every archive type its own graph view without creating separate routes.

---

## Goal

Replace the nodes-only `/knowledge-graph` page with a true site-wide relationship graph spanning all content types (`article`, `caseStudy`, `node`). Taxonomy hubs (projects, categories, tags) remain as hub nodes. The graph is the primary navigation surface; a 230px card rail shows the selected item's ContentCard on node click. Excerpt suppressed in graph view.

Simultaneously: rename the nodes archive to `/nodes/` with nav label "Agentic Caucus Nodes", preserving the existing KG canvas experience for nodes-only viewing via the type filter.

---

## Architecture decisions

### 1. Node ID scheme (breaking change to graph.js format)

Currently item nodes use `id: "item:${slug}"`. Slugs can collide across types (an article and a node could both have slug `ethics-review`).

Required change: `id: "item:${docType}:${slug}"` — e.g. `item:article:ethics-review`.

Card rail lookup must also change. Use `_id` (Sanity document ID) on item nodes for lookup — more robust than docType+slug composite key, no normalisation edge cases.

### 2. Route

`/knowledge-graph` becomes the site-wide graph page. No separate `/graph` route needed. The existing `KnowledgeGraphArchivePage.jsx` is either:
- Repurposed in-place (extended to multi-type), or
- Replaced by a new `SiteGraphPage.jsx` and the old component deleted

Recommendation: new `SiteGraphPage.jsx` — cleaner separation, no risk of regressions on the current nodes-only component during the transition.

### 3. graph.js — multi-type collector

Current `stats.graph` key is nodes-only. Two keys going forward:

| Key | Content | Used by |
|-----|---------|---------|
| `stats.graph` | Nodes only (keep for transition safety) | `/nodes/` if it needs a graph view |
| `stats.siteGraph` | article + caseStudy + node | `/knowledge-graph` (new SiteGraphPage) |

Extended GROQ:
```groq
*[_type in ["article", "caseStudy", "node"] && defined(slug.current)] {
  _id,
  _type,
  title,
  "slug": slug.current,
  "projects": projects[]->{_id, name, "slug": slug.current},
  "categories": categories[]->{_id, name, "slug": slug.current},
  "tags": tags[]->{_id, "slug": slug.current, name}
}
```

Item node shape gains `_id` (for card lookup) and `docType` (`_type` value).

### 4. Filter state

Client-side type filter. Options: All · Articles · Case Studies · Nodes. Implemented as a SegmentedControl or chip strip above the graph canvas. Filters which item nodes render (hub nodes always visible). Cross-type lateral edges (shared tags across types) shown only when both connected types are active.

### 5. Archive → graph deep links

Each archive page gets a "View in graph →" link that routes to `/knowledge-graph?type=article` (or caseStudy, node). The graph page reads the `type` query param on mount and initialises the filter accordingly. This is the mechanism for "each archive type has its own graph view" without separate routes.

### 6. Card rail — multi-type ContentCard

`ContentCard` already handles all three docTypes. The card rail passes `docType` from the clicked item node (now stored on the node object). `showExcerpt={false}` in this view.

### 7. Hub node click behaviour

Hub nodes (project, category hubs) show a "View [project] →" CTA link to the taxonomy detail page. No ContentCard. Unchanged from current behaviour.

---

## Phases

### Phase 0 — Design review (required before code)

- [ ] Mock: type filter strip placement and visual treatment (SegmentedControl vs chip row)
- [ ] Mock: "View in graph →" CTA on archive pages (position, label)
- [ ] Confirm lateral edge behaviour: do shared-tag connections cross content types, or within-type only?
- [ ] Confirm `/nodes/` archive page design — same as current KG page (graph toggle + list), or list-only?
- [ ] Decision: does `/nodes/` get its own graph (stats.graph nodes-only) or is it always list view?

### Phase 1 — URL migration

- [ ] Add `/nodes/` to `routes.js` as the new node archive route
- [ ] Rename `KnowledgeGraphArchivePage.jsx` → archive renders at `/nodes/`
- [ ] Add redirect in App.jsx: `/knowledge-graph` → `/nodes/` (temporary, until Phase 2 is live)
- [ ] Update `TYPE_NAMESPACES` in `routes.js`: `node: 'nodes'`
- [ ] Update Sanity `archivePage` doc: change slug from `knowledge-graph` to `nodes`, update nav label to "Agentic Caucus Nodes"
- [ ] Update nav in Sanity `siteSettings` to reflect new label + URL
- [ ] `pnpm validate:urls` passes, `pnpm validate:tokens` passes

### Phase 2 — Extended graph collector

- [ ] Update `apps/web/scripts/stats/graph.js`:
  - Add `stats.siteGraph` key with multi-type GROQ query
  - Add `_id` and `docType` to item node objects
  - Update node ID format to `item:${docType}:${slug}`
  - Lateral edge logic: confirm cross-type behaviour from Phase 0
- [ ] Regenerate `stats.json`, verify node/edge counts
- [ ] `stats.graph` (nodes-only) still present and unchanged

### Phase 3 — SiteGraphPage + filter

- [ ] Create `apps/web/src/pages/SiteGraphPage.jsx`:
  - Full-width two-column layout: graph pane + 230px card rail
  - Type filter: SegmentedControl (All · Articles · Case Studies · Nodes)
  - Reads `?type=` query param on mount for archive deep-link support
  - Combined `allItems` fetch (article + caseStudy + node) for card lookup
  - `showExcerpt={false}` on card rail
  - Node click → look up by `_id` → render ContentCard with correct docType
- [ ] Register route `/knowledge-graph` → `SiteGraphPage` in App.jsx (replacing the redirect from Phase 1)
- [ ] Archive deep-link CTAs: "View in graph →" on ArticlesArchivePage, CaseStudiesArchivePage, KnowledgeGraphArchivePage (now at /nodes/)

### Phase 4 — Hub node CTA + a11y

- [ ] Hub nodes link to taxonomy detail pages (`/projects/:slug`, `/categories/:slug`)
- [ ] Keyboard navigation: focus management for card rail population
- [ ] `aria-live` region on card rail for screen reader announcements

---

## Definition of Done

- [ ] `/nodes/` renders the Agentic Caucus Nodes archive (existing KG page, rebased)
- [ ] `/knowledge-graph` renders the site-wide graph with type filter
- [ ] Old `/knowledge-graph` route (nodes-only) redirects correctly — no broken links
- [ ] `stats.siteGraph` collector includes article, caseStudy, node item nodes
- [ ] Type filter (All · Articles · Case Studies · Nodes) works client-side
- [ ] `?type=` query param initialises filter on load
- [ ] "View in graph →" deep-link CTA on all three archive pages
- [ ] Clicking an article node shows Article ContentCard in rail
- [ ] Clicking a caseStudy node shows Case Study ContentCard in rail
- [ ] Clicking a node (knowledge node) shows Node ContentCard in rail
- [ ] Clicking a hub node shows CTA link, not a ContentCard
- [ ] Excerpt suppressed in card rail
- [ ] Nav label "Agentic Caucus Nodes" at `/nodes/`
- [ ] Nav label "Knowledge Graph" at `/knowledge-graph/`
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:tokens` passes
- [ ] Storybook story for SiteGraphPage
- [ ] Linear SUG-81 → Done
- [ ] Epic doc moved to `docs/shipped/`

---

## Open questions

1. Does `/nodes/` keep a graph toggle (nodes-only graph from `stats.graph`), or is it list-only after the migration?
2. Do lateral edges (shared tags) cross content types? (An article and a node sharing `ethics` tag would be connected.) Visually useful but adds complexity.
3. IA brief needs updating to reflect new URL structure — do in same commit as Phase 1 route changes.
