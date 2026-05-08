# SUG-105 — Knowledge Graph Phase 2 (graph/archive enhancements)

**Linear Issue:** [SUG-105](https://linear.app/sugartown/issue/SUG-105/knowledge-graph-phase-2-grapharchive-enhancements)
**Status:** Backlog
**Priority:** Medium
**Depends on:** SUG-81 (MVP shipped)

---

## Background

SUG-81 shipped the site-wide knowledge graph MVP. Phase 2 covers cleanup, a11y, Chromatic coverage, and UX polish deferred from the MVP cut.

---

## Scope

### 1. Stats pipeline cleanup

- Remove deprecated `stats.graph` (nodes-only) collector from `apps/web/scripts/stats/graph.js`
- Remove from `collect-stats.js` registration
- Remove `stats.graph` key from `stats.json` after confirming nothing references it
- Commit as isolated `chore(stats):` change

### 2. Hub node a11y

- `aria-live="polite"` region wrapping the card rail — announces node selection to screen readers
- Keyboard focus management: when a node is clicked via keyboard, move focus to the rail card
- Test with VoiceOver

### 3. Storybook + Chromatic VRT

- Storybook layout story for `SiteGraphPage` using PageSidebar pattern (per user request)
- Chromatic snapshot stories for `KnowledgeGraph` (static `graphData` fixture), `FilterStrip` (all active states), `SiteGraphPage` header/filter strip
- Run Chromatic baseline after stories land

### 4. Archive CTA review

- Review "View in graph →" CTA bar placement and styling on Articles, Case Studies, and Nodes archive pages
- Phase 0 gate applies if layout changes substantially

### 5. Consider: node count strip

- Header strip showing "81 nodes · 220 edges · ARTICLE · CASE STUDY · NODE" — live from `statsJson.siteGraph`
- Phase 0 mock required before implementation

---

## Definition of Done

- [ ] `stats.graph` collector removed; `stats.json` no longer includes that key
- [ ] `aria-live` region on card rail
- [ ] Keyboard focus lands in rail on node click
- [ ] Chromatic VRT baseline captured for KnowledgeGraph + FilterStrip
- [ ] Storybook layout story for SiteGraphPage
- [ ] `pnpm validate:tokens` passes
- [ ] Linear SUG-105 → Done
- [ ] Epic doc moved to `docs/shipped/`
