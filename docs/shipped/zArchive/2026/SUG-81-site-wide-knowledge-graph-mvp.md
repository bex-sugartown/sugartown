# SUG-81 — Site-wide Knowledge Graph (MVP)

**Linear Issue:** [SUG-81](https://linear.app/sugartown/issue/SUG-81/site-wide-knowledge-graph-mvp)
**Status:** Shipped
**Shipped:** 2026-05-08
**Priority:** High

<!-- Chromatic: pending — SUG-105 -->

---

## What shipped

- `/knowledge-graph` — new `SiteGraphPage` with force-directed canvas spanning all three content types (article, caseStudy, node)
- `/nodes/` — Agentic Caucus Nodes archive (existing KG page rebased to new route)
- `FilterStrip` — new reusable component: bordered filter bar with SHOW label + per-chip color token for active tint; Storybook stories included
- `--st-kg-*` token layer — 7 new tokens for per-type node/edge colours; dark defaults in `tokens.json`, light overrides in `theme.pink-moon.css`
- `allSiteItemsQuery` — combined GROQ query across article + caseStudy + node for card rail lookup
- `KnowledgeGraph` extended with `colorTokens`, `selectedId`, `showLegend` props; per-docType node colours; `.catch` on dynamic import
- Legend: bg-surface + border-medium box for canvas visibility
- Hub node rail: card surface (bg-surface, border, padding) + connected items count from edge data
- Item node card: compact density, excerpt capped at 120 chars
- Rail width aligned to `--st-space-sidebar` (220px) matching PageSidebar
- Page wrapper/heading/description use `archivePage` / `archiveHeading` / `archiveDescription` from `pages.module.css` — consistent with all archive pages
- "View in graph →" CTA bar on Articles, Case Studies, and Nodes archive pages
- Studio: node content type renamed from "Knowledge Graph" to "Nodes" in desk structure
- `archivePage` Sanity doc created and published at slug `knowledge-graph`
- Schema deployed

## Data pipeline gap

`stats.siteGraph` is generated at build time from `apps/web/scripts/stats/graph.js`. The current `stats.json` in the repo was regenerated manually (81 nodes, 220 edges). In CI, it regenerates on each deploy via `pnpm stats`. No gap — pipeline is live.

The deprecated `stats.graph` (nodes-only) collector still exists and is included in `stats.json`. Removal is deferred to SUG-105.

## Deferred to SUG-105

- Remove deprecated `stats.graph` nodes-only collector
- Hub node a11y: `aria-live` card rail region + keyboard focus management
- Chromatic VRT for KnowledgeGraph + FilterStrip + SiteGraphPage
- Storybook layout story for SiteGraphPage with PageSidebar
- Archive "View in graph →" CTA placement/styling review
