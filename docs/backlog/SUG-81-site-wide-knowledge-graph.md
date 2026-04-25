# SUG-81 — Site-wide Knowledge Graph

**Linear Issue:** [SUG-81](https://linear.app/sugartown/issue/SUG-81/site-wide-knowledge-graph-multi-type-graph-across-all-content)
**Status:** Backlog
**Priority:** Medium
**Depends on:** SUG-73 (KG canvas renderer, graph toggle, card rail)

---

## Goal

Extend the Knowledge Graph from nodes-only to a full site-wide graph
spanning all content types: `article`, `caseStudy`, `node`. Taxonomy hubs
(projects, categories, tags) remain as hub nodes. Clicking any item node
populates the 230px card rail with the correct compact ContentCard for that
content type. Excerpt is suppressed in graph view.

The site-wide graph lives at a new route (TBD — `/graph` or a dedicated
archivePage doc) so the nodes-only `/knowledge-graph` archive is unaffected.

---

## Architecture decisions required at epic start

### 1. Node ID scheme (breaking change to graph.js format)

Currently item nodes use `id: "item:${slug}"`. Slugs can collide across
content types (an article and a node could both have slug `ethics-review`).

Required change: `id: "item:${docType}:${slug}"` — e.g. `item:article:ethics-review`.

Card rail lookup must also change: `slug` alone is not a unique key across
types. Either:
- Add `_id` (Sanity document ID) to item nodes and look up by `_id` against
  a combined `allItems` list, OR
- Keep docType+slug as the composite key and build a lookup map at render time.

Recommendation: add `_id` to item nodes in `graph.js` and look up by `_id`.
More robust — no collision risk, no slug normalisation edge cases.

### 2. Route / page

Option A — New archivePage Sanity doc with `contentTypes: ["article", "caseStudy", "node"]`:
  - Requires `ArchiveListing` to handle multi-type `allItems` (currently one
    type per listing). Non-trivial change to the fetch layer.

Option B — Dedicated static route (`/graph`) backed by a new page component:
  - Simpler: the graph page fetches its own combined item list (no FilterBar,
    no pagination — graph IS the navigation). Cleaner separation.

Recommendation: Option B. A dedicated `/graph` page component that:
  - Fetches all published articles, case studies, and nodes in one combined query
  - Runs `collectGraph()` with the extended collector
  - Renders `KnowledgeGraph` (full width) + card rail (230px)
  - No FilterBar, no pagination

### 3. graph.js — multi-type collector

Current collector queries only `*[_type == "node"]`. Extended version needs:

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

Item node shape gains:
- `_id` — for card lookup
- `docType` — `_type` value (`article` | `caseStudy` | `node`)

Hub nodes stay the same (project, category — tags become hubs only if they
have 2+ shared-tag lateral connections, same as current).

### 4. Card rail — multi-type ContentCard

`ContentCard` already handles all three docTypes. The card rail just needs
`docType` from the clicked node (now stored on the item node object).

`showExcerpt={false}` on the card rail in this view (per spec).

### 5. Hub node click behaviour

Current: clicking a hub node clears the card rail (no ContentCard for hubs).

Site-wide graph: same behaviour — hub nodes show only the type label and a
"View [project/category] →" CTA link. No card in the rail.

Consider: clicking a project hub could filter the card grid (if grid view
is also present on this page). Defer to SUG-80 or a follow-up.

---

## Phases

### Phase 0 — Design review (required before code)

- [ ] Decide route: `/graph` vs archivePage multi-type
- [ ] Confirm node ID scheme (`_id`-based lookup)
- [ ] Confirm whether a FilterBar or any text listing accompanies the graph
      on this page, or if graph + card rail is the entire UI
- [ ] Confirm whether lateral edges (shared-tag connections) span across
      content types or remain within-type only

### Phase 1 — Extended graph collector

- [ ] Update `apps/web/scripts/stats/graph.js`:
  - Multi-type GROQ query (article + caseStudy + node)
  - Add `_id` and `docType` to item node objects
  - Update node ID format to `item:${docType}:${slug}`
  - Lateral edge logic: shared-tag pairs across types (or within-type only — decide in Phase 0)
- [ ] Regenerate `stats.json` and verify node/edge counts
- [ ] No breaking change to `/knowledge-graph` — that page uses the same
  `stats.graph` key. Verify it still renders correctly after collector update.

Wait — the nodes-only KG page (`/knowledge-graph`) currently reads from
`stats.graph`. If we extend the collector to all types, the nodes-only page
will show articles and case studies too. Two options:
  - Keep separate collector keys: `stats.graph` (nodes-only) + `stats.siteGraph` (all types)
  - Or replace nodes-only graph with the site-wide graph everywhere

Recommend: separate keys. `/knowledge-graph` keeps `stats.graph` (nodes-only).
New `/graph` page uses `stats.siteGraph` (all types). Collector runs both.

### Phase 2 — New route + page component

- [ ] Add `/graph` to `routes.js` and `App.jsx`
- [ ] Create `apps/web/src/pages/SiteGraphPage.jsx`:
  - Full-width two-column layout: graph pane + 230px card rail
  - No FilterBar, no toggle (graph-only view, no grid fallback needed)
  - Combined `allItems` fetch (article + caseStudy + node) for card lookup
  - `showExcerpt={false}` on card rail
  - Node click → look up by `_id` → render ContentCard with correct docType
- [ ] Add page to nav (Library dropdown? or standalone?)
- [ ] Register in `archivePage` Sanity doc if nav-driven, or hardcode route

### Phase 3 — Hub node CTA + a11y

- [ ] Hub nodes in the site-wide graph link to their taxonomy detail page
  (`/projects/:slug`, `/categories/:slug`)
- [ ] Keyboard navigation: focus management for card rail population
- [ ] `aria-live` region on card rail for screen reader announcements

---

## Definition of Done

- [ ] `stats.siteGraph` collector runs cleanly alongside `stats.graph`
- [ ] `/graph` route renders all three content types as item nodes
- [ ] Clicking an article node populates an Article ContentCard in the rail
- [ ] Clicking a caseStudy node populates a Case Study ContentCard in the rail
- [ ] Clicking a node (knowledge node) populates a Node ContentCard in the rail
- [ ] Clicking a hub node clears the card rail (or shows hub CTA — decide Phase 0)
- [ ] Excerpt suppressed in card rail (`showExcerpt={false}`)
- [ ] `/knowledge-graph` nodes-only graph unaffected
- [ ] Token validator passes (no new hardcoded values)
- [ ] Storybook story for SiteGraphPage (or updated KnowledgeGraph story)
- [ ] Nav link added
- [ ] Linear SUG-81 → Done
- [ ] Epic doc moved to `docs/shipped/`

---

## Open questions

1. Does the site-wide graph need a FilterBar / text listing fallback, or is
   graph + card rail the complete UI?
2. Do lateral edges (shared-tag connections) cross content types?
   (An article and a node sharing the tag `ethics` would be connected.)
3. Should `/knowledge-graph` be replaced by the site-wide graph, or stay
   nodes-only permanently?
4. Nav placement: Library dropdown alongside Articles + Knowledge Graph, or
   a top-level "Map" link?
