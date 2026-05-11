---
**Epic:** SUG-110 — Dynamically generated roadmap from Linear
**Linear Issue:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-110 — Dynamically generated roadmap from Linear

Enable a dynamically generated roadmap page on the Sugartown site powered by Linear data, surfacing current backlog, in-progress, and shipped epics without manual maintenance.

## Background

The Sugartown site has no public roadmap page. The canonical backlog lives in `docs/backlog/sugartown-backlog-priorities.md` — a hand-maintained markdown file that requires manual sync whenever Linear is updated. This creates drift: Linear is always current, the markdown file isn't. A dynamically generated roadmap would close the loop by pulling issue data from the Linear GraphQL API at build time, using the same stats-pipeline pattern already established in SUG-67 (`scripts/collect-stats.js`). The roadmap page would render without any manual authoring and would update automatically on every CI build.

The `/platform` namespace already exists. `/platform/roadmap` is the natural home for this page, consistent with the existing Platform sub-pages pattern (SUG-103 adds `/platform/design-system`).

## Objective

After this epic, a `/platform/roadmap` page exists that renders Sugartown's current Linear backlog grouped by status (Now/Next, In Progress, Shipped) with no manual authoring required. A new `linearRoadmap` collector in `scripts/collect-stats.js` fetches SUG issues from the Linear GraphQL API at build time and emits structured data to `stats.json`. A React page component consumes that data. Optionally, a Sanity `roadmapPage` document provides editorial framing (intro copy, section headings) while the roadmap cards remain Linear-driven.

Layers touched: `scripts/collect-stats.js` (new collector), `apps/web/src/pages/` (new page), `apps/web/src/App.jsx` (new route), `apps/web/src/lib/routes.js` (new route constant). Optional: `apps/studio/schemas/` (new `roadmapPage` doc type). No token changes. No DS component changes unless a new card surface is needed.

## Scope

- [ ] Add `linearRoadmap` collector to `scripts/collect-stats.js` — queries Linear GraphQL API for all Sugartown issues, groups by status into `backlog`, `inProgress`, `shipped`. Output shape: `stats.linearRoadmap: { backlog[], inProgress[], shipped[] }` each item: `{ id, title, url, priority, labels[], status, completedAt? }` — layer: tooling/infrastructure
- [ ] Add `LINEAR_API_KEY` to CI env vars (`.github/workflows/stats.yml`) and document in `docs/conventions/stats-pipeline.md` — layer: infrastructure
- [ ] New route `/platform/roadmap` registered in `apps/web/src/lib/routes.js` — layer: frontend
- [ ] New `RoadmapPage.jsx` consuming `stats.linearRoadmap`, rendering three sections: Now/Next (backlog), In Progress, Shipped. Each issue renders as a compact card (title, priority badge, labels, Linear link). No hardcoded content — all data from `stats.json` — layer: frontend
- [ ] Register route in `apps/web/src/App.jsx` — layer: frontend
- [ ] Add nav entry or Platform page link to `/platform/roadmap` — layer: content/frontend
- [ ] (Optional, phase-gated) `roadmapPage` Sanity document type with `heading`, `intro` PortableText, and `showShipped` boolean. RoadmapPage renders editorial copy above the Linear feed if a `roadmapPage` doc exists — layer: schema + frontend

## Phases

**Phase 1 — Data collector:** `linearRoadmap` collector in stats pipeline. CI env var. Emits to `stats.json`. No UI yet. Merge independently once data shape is confirmed.

**Phase 2 — Roadmap page:** Route, page component, nav entry. Consumes Phase 1 data. Ships the public-facing page.

**Phase 3 (optional) — Sanity editorial layer:** `roadmapPage` schema doc, Studio authoring, page renders intro copy above Linear feed if doc exists.

## Acceptance criteria

- [ ] `pnpm build` completes with `stats.linearRoadmap` populated in `stats.json` (backlog, inProgress, shipped arrays with correct shape)
- [ ] `/platform/roadmap` renders without a 404 or runtime error
- [ ] Each Linear issue appears in the correct section (backlog / in-progress / shipped) matching its Linear status
- [ ] Issue cards show title, priority, and at least one label where labels exist
- [ ] Cards link to the correct Linear issue URL
- [ ] If `LINEAR_API_KEY` is missing from CI, the collector fails gracefully (empty arrays, no build failure) and logs a warning
- [ ] No hardcoded issue titles, descriptions, or status labels in the page component

## Technical notes

- **Linear GraphQL API:** endpoint `https://api.linear.app/graphql`. Requires `Authorization: Bearer <LINEAR_API_KEY>` header. Query: `team(key: "SUG") { issues { nodes { id, identifier, title, url, priority, state { name, type }, labels { nodes { name } }, completedAt } } }`. Filter to `state.type in [backlog, started, completed]`.
- **Activation audit:** Read `scripts/collect-stats.js` before writing the collector to match the existing collector interface (async function, returns a named key for `stats.json`, handles network failure gracefully with `null` fallback).
- **Stats pipeline reference:** `docs/conventions/stats-pipeline.md` documents the collector contract. New collector must follow it exactly.
- **Route registration:** Read `apps/web/src/lib/routes.js` and `apps/web/src/App.jsx` before adding the route — follow the existing pattern for `/platform` sub-pages.
- **Linear API key in CI:** Check `.github/workflows/stats.yml` for how existing network collector env vars are injected (`SANITY_TOKEN`, `GITHUB_TOKEN`). Add `LINEAR_API_KEY` in the same pattern. Key must be a read-only Linear personal API token scoped to Issues.
- **Optional Sanity layer:** if Phase 3 is activated, follow the paired schema convention — check whether `roadmapPage` needs a corresponding object schema or can be a standalone document. Schema deploy required before MCP writes.
- **Model recommendation:** Phase 1 (tooling/collector) → `sonnet`. Phase 2 (page component) → `sonnet`. Phase 3 (schema) → `sonnet`.

## Non-Goals

- No real-time Linear webhook integration — build-time polling is sufficient for a roadmap page.
- No ability to create or update Linear issues from the site.
- No filtering, search, or pagination on the roadmap page in the initial scope — flat grouped list only.
- No Storybook stories for the roadmap page component unless the card surface introduced is a reusable DS primitive (it should not be).

## Related

- **Linear:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
- **Stats pipeline:** `scripts/collect-stats.js`, `docs/conventions/stats-pipeline.md`
- **Route registry:** `apps/web/src/lib/routes.js`
- **Platform namespace:** `apps/web/src/pages/PlatformPage.jsx` — existing `/platform` home
- **SUG-67** (stats pipeline, shipped) — upstream pattern this collector follows
- **SUG-103** (component registry at `/platform/design-system`) — sibling Platform sub-page
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
