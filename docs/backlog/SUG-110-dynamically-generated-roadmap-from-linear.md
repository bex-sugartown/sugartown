---
**Epic:** SUG-110 — Dynamically generated roadmap from Linear
**Linear Issue:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
**Status:** In Progress — Phase 1 + 2 shipped on branch; pending CI env var + merge
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-110 — Dynamically generated roadmap from Linear

Enable a dynamically generated roadmap page on the Sugartown site powered by Linear data, surfacing current backlog, in-progress, and shipped epics without manual maintenance.

## Background

The Sugartown site has no public roadmap page. The canonical backlog lives in `docs/backlog/sugartown-backlog-priorities.md` — a hand-maintained markdown file that requires manual sync whenever Linear is updated. This creates drift: Linear is always current, the markdown file isn't. A dynamically generated roadmap would close the loop by pulling issue data from the Linear GraphQL API at build time, using the same stats-pipeline pattern already established in SUG-67 (`scripts/collect-stats.js`). The roadmap page would render without any manual authoring and would update automatically on every CI build.

`/platform/roadmap` lives inside `PlatformLayout` as a nested child route — not a standalone page. GovernancePage (`/platform/governance`) already links to it and has a "Roadmap" section stub. The page uses `usePlatformHero` to inherit the hero visual from the `/platform` Sanity doc, consistent with all other hub pages.

## Objective

After this epic, `/platform/roadmap` renders Sugartown's current Linear backlog in three tables grouped by status: In Progress, Backlog, Shipped. A `linearRoadmap` collector in `scripts/stats/linear.js` fetches SUG issues from the Linear GraphQL API at build time and emits structured data into `stats.json`. `RoadmapPage.jsx` consumes that data. When `LINEAR_API_KEY` is absent, the page degrades gracefully with a callout and zero-count tiles.

## Implementation status

| Phase | Item | Status |
|-------|------|--------|
| 1 | `apps/web/scripts/stats/linear.js` — `collectLinear()` fetches all SUG issues, groups by state type | ✅ Done |
| 1 | Wire `linearRoadmap` into `collect-stats.js` network collectors map | ✅ Done |
| 2 | `RoadmapPage.jsx` — hero via `usePlatformHero`, stat tiles, three `DataTable` sections (In Progress / Backlog / Shipped) | ✅ Done |
| 2 | Priority badges + label chips + issue ID links in table rows | ✅ Done |
| 2 | Stale/empty state callout when `LINEAR_API_KEY` absent | ✅ Done |
| 2 | CSS classes in `PlatformHubPage.module.css` | ✅ Done |
| **TODO** | Add `LINEAR_API_KEY` to CI env vars (`.github/workflows/stats.yml`) | 🔲 Pending |
| **TODO** | Document `LINEAR_API_KEY` in `docs/conventions/stats-pipeline.md` | 🔲 Pending |
| **TODO** | Verify Linear API key format — bearer token vs API key header | 🔲 Pending |
| **TODO** | Run `pnpm collect:stats` with key set to confirm data shape populates | 🔲 Pending |
| Backlog | (Optional) `roadmapPage` Sanity doc type for editorial intro copy above Linear feed | ⬛ Deferred |

## Scope (original, for reference)

- [x] Add `linearRoadmap` collector to stats pipeline — queries Linear GraphQL API, groups by status into `backlog`, `inProgress`, `shipped`. Output shape: `stats.linearRoadmap: { backlog[], inProgress[], shipped[] }` each item: `{ identifier, title, url, priority, labels[], status, completedAt? }`
- [ ] Add `LINEAR_API_KEY` to CI env vars (`.github/workflows/stats.yml`) and document in `docs/conventions/stats-pipeline.md`
- [x] New route `/platform/roadmap` — already registered in `routes.js`, nested inside `PlatformLayout` in `App.jsx`
- [x] `RoadmapPage.jsx` consuming `stats.linearRoadmap`, rendering three tables: In Progress, Backlog, Shipped. Each issue row: ID (linked), title, status, priority badge, label chips
- [x] Route registered in `App.jsx` under PlatformLayout
- [x] GovernancePage links to `/platform/roadmap` — already implemented in SUG-111
- [ ] (Optional, phase-gated) `roadmapPage` Sanity document type

## Technical notes

- **Linear GraphQL API:** endpoint `https://api.linear.app/graphql`. Requires `Authorization: Bearer <LINEAR_API_KEY>` header. Query filters to `state.type in [started, backlog, unstarted, completed]`, first 250 issues. Shipped list trimmed to most recent 20 sorted by `completedAt` desc.
- **Graceful degradation:** if `LINEAR_API_KEY` missing, collector returns `{ stale: true, inProgress: [], backlog: [], shipped: [] }`. Page renders stale callout, all tiles show 0.
- **Table format:** `DataTable` with `variant="trust"` (same as GovernancePage release table). Columns: ID (linked to Linear URL), Title, Status, Priority badge, Labels (Chip array). Shipped table swaps Status for Shipped date.
- **Priority colours:** Urgent = pink-100/pink-700, High = amber-400/amber-800, Medium/Low = bg-subtle.
- **Route:** nested child of `PlatformLayout` at `path="roadmap"` — `usePlatformHero` hooks into Outlet context for hero inheritance.
- **`team(id: "SUG")` vs `team(key: "SUG")`:** the collector uses `id: "SUG"` — verify the correct field against the actual Linear workspace at activation time. If it returns null, switch to `key`.

## Non-Goals

- No real-time Linear webhook integration — build-time polling only.
- No ability to create or update Linear issues from the site.
- No filtering, search, or pagination — flat grouped tables only.

## Related

- **Linear:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
- **Stats pipeline:** `apps/web/scripts/collect-stats.js`, `apps/web/scripts/stats/linear.js`
- **Route:** `apps/web/src/App.jsx` line ~148, `apps/web/src/lib/routes.js` `PLATFORM_ROUTES.roadmap`
- **Page:** `apps/web/src/pages/platform/RoadmapPage.jsx`
- **GovernancePage roadmap section:** `apps/web/src/pages/platform/GovernancePage.jsx`
- **SUG-67** (stats pipeline, shipped) — upstream collector pattern
- **SUG-111** (PlatformLayout, shipped) — PlatformLayout shell this page lives inside
