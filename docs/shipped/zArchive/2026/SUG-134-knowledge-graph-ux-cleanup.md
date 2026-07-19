---
**Epic:** SUG-134 — Knowledge Graph UX Cleanup
**Linear Issue:** [SUG-134](https://linear.app/sugartown/issue/SUG-134)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-134 — Knowledge Graph UX Cleanup

Clean up the Knowledge Graph diagram and taxonomy experience: filter out empty hub nodes when a page-type filter is active, review the full experience for similar friction, and (Phase 2) surface taxonomy enrichment suggestions for human review.

## Background

The Knowledge Graph's force-directed diagram includes all taxonomy hub nodes (categories, projects) regardless of whether they have any connected content for the currently active page-type filter. When a user selects "Articles" in the FilterStrip, categories that contain only case studies or nodes — such as E-Commerce — still render as isolated hubs on the graph periphery. These empty hubs make the map appear artificially large, scattered, and hard to read: they look like connected content but lead nowhere under the active filter.

The fix is a filtering rule at the graph data layer: if a taxonomy hub node has zero edges to the currently selected content type, it should be excluded from that filtered view. This is the primary pain point; additional friction points across the full Knowledge Graph experience need a structured human review before engineering scope is finalised.

Phase 2 addresses a related but separate issue: content documents across all taxonomy-enabled page types have uneven taxonomy coverage. Tags, tools, categories, and project assignments are missing or sparse on many records. The AI can analyse the content and propose candidates for human review — no writes happen without explicit approval.

## Objective

After this epic, the Knowledge Graph diagram no longer shows isolated hub nodes when a page-type filter is active. The filter rules are enforced at the build-time graph data layer (not the renderer), so they apply consistently across all view modes. A structured experience review (Phase 1b) captures any additional UX pain points and gates Phase 1 close-out. Phase 2 produces a human-reviewable taxonomy enrichment proposal for every content document type, executed via the Content Write Gate — no patches are applied without explicit per-document approval.

Layers touched: frontend (graph data filtering logic, `KnowledgeGraphPage.jsx`), build-time stats pipeline (`scripts/collect-stats.js` graph collector), content (taxonomy enrichment writes via Sanity MCP — Phase 2 only).

Not touched: the FilterStrip component API, the force-graph canvas renderer, Storybook stories (unless Phase 1 experience review surfaces a visual regression).

## Scope

### Phase 1 — Filter rules + experience review

- [x] **Audit graph collector** — filtering is runtime in `SiteGraphPage.jsx` `filterGraph()`, not build-time. No build pipeline changes needed.
- [x] **Implement empty-hub filter rule** — `connectedHubIds` derived from membership edges to visible items only. Commit: `d0d22d3`.
- [x] **Human experience review** — sign-off received 2026-06-01. No additional friction points identified.
- [x] **Apply any additional fixes identified in the review** — none required.

### Phase 2 — Taxonomy enrichment suggestions (human-review gate)

- [x] **Analyse content taxonomy coverage** — 71 documents queried. 5 primary gaps found (missing categories or tools). 1 flagged for manual review (wp.article.814 — no clear tool match without reading full content).
- [x] **Generate enrichment proposal** — before/after proposal table produced for all 5 gap documents. Content Write Gate fired.
- [x] **Human approval** — approved 3 of 4 proposed patches (2026-06-01). wp.article.410 tools patch declined. wp.article.814 flagged for manual review (no action).
- [x] **Apply approved patches** — AI category applied to wp.article.1788, wp.node.1702, wp.node.863 via `patch_document_from_json`. All 3 published.

## Phases

**Phase 1** — Filter rules + experience review. Ships independently: updated graph with empty-hub exclusion, any additional experience fixes confirmed in review. Mini-release at end of Phase 1.

**Phase 2** — Taxonomy enrichment suggestions. Depends on Phase 1 being on `main`. Ships independently. Mini-release at end of Phase 2.

## Acceptance criteria

### Phase 1
- [ ] When the "Articles" filter is active, category and project hub nodes with zero connected articles do not appear in the diagram (including E-Commerce)
- [ ] The filter rule applies to all page-type filters (Articles, Case Studies, Nodes), not just Articles
- [ ] The "All" view is unaffected — all hub nodes continue to appear when no type filter is active
- [ ] Human experience review has been conducted and sign-off recorded in this doc before Phase 1 commit

### Phase 2
- [ ] A before/after proposal table has been produced and explicitly approved for every document that receives a taxonomy patch
- [ ] All patches use `patch_document_from_json` (verbatim) — no `patch_document_from_markdown`
- [ ] `validate-content.js` taxonomy coverage check (`--strict`) passes after patches are published

## Technical notes

**Activation audit:** Before writing any filter logic, read:
1. `scripts/collect-stats.js` — locate the `siteGraph` collector. Understand whether hub-node inclusion is decided here (build time) or deferred to the page component.
2. `apps/web/src/pages/KnowledgeGraphPage.jsx` — understand how `filterType` interacts with the graph data. Check whether filtered views are derived from the full `stats.siteGraph` at runtime or from pre-filtered build-time slices.
3. `apps/web/src/lib/queries.js` — verify no additional GROQ projection changes are needed.

**Implementation preference:** Build-time filtering (in the graph collector) is preferred over runtime filtering in the page component, because it keeps the graph data small and avoids client-side recomputation. If build-time filtering is architecturally complex (e.g. the collector doesn't know which filter a user will apply), runtime filtering via a derived selector is acceptable — document the tradeoff in the commit message.

**Content Write Gate (Phase 2):** Fires for every document that receives a taxonomy patch. Present proposal table, wait for "yes" / "confirmed" before any `patch_document_from_json` call. No batching of approvals across documents — each document requires its own confirmation.

**No schema changes required** — all taxonomy fields (`tags[]`, `tools[]`, `categories[]`, `project[]`) already exist on article, caseStudy, and node schemas.

**Model & Mode:** `/model opusplan` — Phase 1 requires reading the graph pipeline architecture before writing filter logic; plan mode is warranted. Phase 2 is content-only; switch to `/model sonnet` after Phase 1 closes.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 1 graph filter logic requires architectural reading before implementation. Phase 2 (content enrichment) can run on `/model sonnet` after Phase 1 ships.

## Non-Goals

- No changes to the FilterStrip component API or visual design
- No changes to the force-graph canvas renderer or zoom/pan behaviour (unless the experience review specifically calls this out)
- No new Storybook stories for Phase 1 (no new DS components introduced)
- Phase 2 does not create new taxonomy documents — it assigns existing ones to existing content records

## Related

- **Linear:** [SUG-134](https://linear.app/sugartown/issue/SUG-134)
- **Prior KG epics:** SUG-73 (initial graph), SUG-81 (site-wide MVP), SUG-105 (Phase 2 — tag nodes, FilterStrip chip color system)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
