---
**Epic:** SUG-138 — Library — unified all-content archive at /library
**Linear Issue:** [SUG-138](https://linear.app/sugartown/issue/SUG-138)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-138 — Library — unified all-content archive at /library

Create `/library` as a single unified archive for all content types (articles, nodes, case studies), with filter sidebar and knowledge graph view. Map and document the current content IA. Clarify where KG scope diverges from Library scope. Update series back-link and nav accordingly.

## Background

The current content IA is fragmented: `/articles`, `/nodes`, and `/case-studies` are three separate archives with no parent landing page. The Library nav item links to `/knowledge-graph` (a graph visualisation), not a browsable archive. Series pages have a "← All Articles" back-link that excludes nodes and case studies — incorrect when a series spans types. A reader looking for "everything Bex has written" has no single destination.

`ArchivePage.jsx` already supports multi-type archives (it accepts a `contentTypes[]` array from the `archivePage` Sanity doc) and has a filter sidebar and graph view toggle. The infrastructure exists; what's missing is the `/library` route and its `archivePage` Sanity document, plus the IA clarity work to define what belongs there and what the KG scope boundary is.

## Current IA map (as-built at time of epic creation)

| URL | Route component | Archive type | Content types | Filter sidebar | Graph view |
|-----|----------------|--------------|---------------|---------------|------------|
| `/articles` | `ArchivePage` | `archivePage` Sanity doc | `article` | Yes | Yes (nodes only) |
| `/nodes` | `ArchivePage` | `archivePage` Sanity doc | `node` | Yes | Yes (nodes only) |
| `/case-studies` | `ArchivePage` | `archivePage` Sanity doc | `caseStudy` | Yes | No |
| `/knowledge-graph` | `SiteGraphPage` | Dedicated graph component | `article`, `node`, `caseStudy` (graph), `project`/`category` hubs | Type filter buttons | Primary view |
| `/series/:slug` | `SeriesPage` | Custom page | n/a (parts list) | No | No |
| `/library` | **Does not exist** | — | — | — | — |

**KG scope vs Library scope — current divergence:**

| Dimension | `/knowledge-graph` | `/library` (proposed) |
|-----------|-------------------|----------------------|
| Primary view | Graph (force-directed) | Card grid / list |
| Secondary view | n/a | Graph (toggle, same as existing) |
| Content types visible | article, node, caseStudy + project/category hubs | article, node, caseStudy |
| Filter mechanism | Type buttons in toolbar | FilterBar sidebar (faceted) |
| Series support | Not shown | Out of scope (series has its own landing page) |
| Entry point | Library nav | Library nav (replaces KG as primary Library link) |

The KG is a visualisation tool, not a browsable archive. Library is the archive. They are different enough to warrant separate routes — but the Library page should include the graph view toggle (as `/articles` already does) so both modes are accessible from one place. The KG page at `/knowledge-graph` can be retained as a standalone deep-link for graph exploration.

**Known KG disconnect (observed 2026-05-30):**

The KG toolbar has type filter buttons: ALL | ARTICLES | CASE STUDIES | NODES. The grid/list view link in the toolbar changes based on the active filter — but the mapping is currently wrong:

| KG filter active | Grid/list view links to | Should link to |
|-----------------|------------------------|----------------|
| ALL | `/articles` | `/library` (not yet built) |
| ARTICLES | `/articles` | `/articles` ✓ |
| CASE STUDIES | `/case-studies` | `/case-studies` ✓ |
| NODES | `/nodes` | `/nodes` ✓ |

The ALL → `/articles` link is the concrete bug. Once `/library` exists, the KG toolbar "ALL" state must update its archive link from `/articles` to `/library`. This is a Phase 2 scope item in `SiteGraphPage.jsx` — find where the archive link is built from the active type filter and update the `ALL` case.

## Objective

After this epic:
- `/library` exists as a unified archive of `[article, node, caseStudy]` — same filter sidebar and graph view toggle as existing per-type archives
- The Library nav item links to `/library` (not `/knowledge-graph`)
- The KG's narrower scope (visualisation, hub nodes, no filter sidebar) is visually differentiated — either a callout on the Library page linking to `/knowledge-graph`, or a scope note on the KG page itself
- Series back-link updated from "← All Articles" to "← Library"
- An `archivePage` Sanity document exists for `/library` (slug: `library`) with `contentTypes: ["article", "node", "caseStudy"]`

Layers touched: React frontend (new `LibraryPage` route or `ArchivePage` reuse), Sanity content (new `archivePage` doc), routes.js, App.jsx, nav data in Sanity (Library nav item URL), `SeriesPage.jsx` back-link.

## Phases

### Phase 0 — IA map + HTML mockup (hard stop before Phase 1)

Produce:
1. A completed IA table (the draft above is the starting point — verify against live routes at activation)
2. An HTML mock at `docs/drafts/SUG-138-library-mock.html` showing:
   - The Library page layout: header area, filter sidebar, content grid, graph toggle button
   - A visual annotation showing what KG covers vs what Library covers (e.g. a scope badge or callout strip)
   - Mobile behaviour annotation for the filter sidebar
   - The Library nav item updated in the mock header

Wait for explicit **"Phase 0 approved"** before writing any JSX, CSS, or routes.

### Phase 1 — `/library` route + Sanity archivePage doc

- Register `/library` route in `App.jsx` — reuse `ArchivePage` with `archiveSlug="library"` (same pattern as `/articles`, `/nodes`)
- Create `archivePage` Sanity document with slug `library`, `contentTypes: ["article", "node", "caseStudy"]`
- Update `routes.js` if needed (check `ARCHIVE_PATHS`, `validateRoutes` for `/library`)
- Update Library nav item in Sanity `navigation` doc to link to `/library`

### Phase 2 — KG fixes + series back-link

- Fix KG toolbar "ALL" archive link: in `SiteGraphPage.jsx`, find the grid/list view link that currently points to `/articles` when the ALL filter is active — update to `/library` — layer: frontend
- Add a scope note or callout to `/library` linking to `/knowledge-graph` with a one-line explanation of the difference ("Graph view of connections across all content — explore by relationship, not by date") — layer: frontend / Sanity content
- Update `SeriesPage.jsx` back-link from "← All Articles" to "← Library" linking to `/library` — layer: frontend

## Acceptance criteria

- [ ] `/library` renders a combined archive of articles, nodes, and case studies with the existing filter sidebar
- [ ] Graph view toggle on `/library` works (same as `/articles`)
- [ ] Library nav item links to `/library`, not `/knowledge-graph`
- [ ] Series pages show "← Library" back-link pointing to `/library`
- [ ] KG scope divergence is explicitly represented on the page (callout, badge, or note)
- [ ] KG toolbar "ALL" filter grid/list link points to `/library`, not `/articles`
- [ ] `pnpm validate:urls` passes
- [ ] Phase 0 HTML mock approved before Phase 1 code is written

## Technical notes

- **ArchivePage reuse:** `ArchivePage.jsx` is driven by an `archivePage` Sanity document. Adding a `/library` route that passes `archiveSlug="library"` is the zero-new-code path — no new component needed unless the multi-type behaviour requires changes to how `ArchivePage` queries and filters. Activation audit: read `ArchivePage.jsx` and the `archivePageWithFilterConfigQuery` in `queries.js` to confirm `contentTypes: ["article", "node", "caseStudy"]` is already handled.
- **Sanity `archivePage` doc:** Must be published before the route goes live (unpublished = 404). Create via MCP or Studio. Slug must be exactly `library`.
- **Nav update:** Library nav item URL is stored in the Sanity `navigation` document. Update via MCP or Studio — not a code change.
- **`validateRoutes`:** `routes.js` has an `ARCHIVE_PATHS` array used by the URL validator. Add `/library` to it if it exists.
- **KG page retention:** `/knowledge-graph` route stays. It is a separate tool, not a duplicate of Library. The footer nav "Knowledge Graph" link stays pointing there.
- **Phase 0 note — KG scope annotation:** The mockup must show a visual treatment for the KG/Library scope boundary. Options: (a) a small "Explore connections →" link strip below the Library hero; (b) a graph-view mode button in the toolbar that links out to `/knowledge-graph`; (c) a scope note inside the graph view panel. Pick one in the mock and annotate it.
- **Model & Mode:** `/model opusplan` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes.

### Activation audits (run before Phase 1 code)

1. Read `apps/web/src/pages/ArchivePage.jsx` — confirm `contentTypes[]` with multiple entries is handled
2. Read `apps/web/src/lib/queries.js` `archivePageWithFilterConfigQuery` — confirm multi-type query projection
3. Run `*[_type == "archivePage"]{ _id, slug, contentTypes }` in Sanity Vision — see existing docs for format reference
4. Check `apps/web/src/lib/routes.js` for `ARCHIVE_PATHS` constant — add `/library` if present
5. Read `apps/web/src/pages/SiteGraphPage.jsx` — find where the grid/list archive link is built from the active type filter, confirm the `ALL` case currently hard-codes `/articles`

## Non-Goals

- No changes to `/knowledge-graph` route, `SiteGraphPage`, or the KG graph data pipeline
- No new filter facets beyond what already exists in `FilterBar`
- No pagination — inherits whatever the existing archives use
- No `/nodes` or `/articles` archive removal — they stay as per-type deep-links; Library is additive

## Related

- **Linear:** [SUG-138](https://linear.app/sugartown/issue/SUG-138)
- **Upstream:** SUG-137 (series back-link is the immediate trigger)
- **Epic template:** `docs/epic-template.md`
