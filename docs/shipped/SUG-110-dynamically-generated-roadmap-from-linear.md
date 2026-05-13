---
**Epic:** SUG-110 — Dynamically generated roadmap from Linear
**Linear Issue:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
**Status:** In Progress — collector + inline tables shipped on branch; pending CI env var + merge
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-110 — Dynamically generated roadmap from Linear

Enable a dynamically generated roadmap view on sugartown.io powered by Linear data, surfacing current in-progress and backlog epics without manual maintenance.

## Background

The canonical backlog lives in `docs/backlog/sugartown-backlog-priorities.md` — a hand-maintained markdown file that drifts from Linear. A dynamically generated roadmap closes the loop by pulling issue data from the Linear GraphQL API at build time, using the stats-pipeline pattern from SUG-67.

The roadmap is rendered **inline on `/platform/governance`** — not as a standalone subpage. GovernancePage already owns the release cadence narrative; roadmap is a natural section within that page. Shipped epics are not shown (that information is served by the "Recent releases" changelog section on the same page).

## Objective

After this epic, the roadmap section on `/platform/governance` renders two `DataTable` sections — In Progress and Backlog — pulled live from the Linear API at build time. When `LINEAR_API_KEY` is absent, the section degrades gracefully with a callout.

## Implementation status

| Phase | Item | Status |
|-------|------|--------|
| 1 | `apps/web/scripts/stats/linear.js` — `collectLinear()` queries Linear GraphQL API, groups issues by state type | ✅ Done |
| 1 | Wire `linearRoadmap` into `collect-stats.js` network collectors | ✅ Done |
| 2 | Roadmap tables inline on `GovernancePage` — In Progress + Backlog `DataTable` sections | ✅ Done |
| 2 | Priority badges, label chips, issue ID links | ✅ Done |
| 2 | Stale callout + graceful degradation when `LINEAR_API_KEY` absent | ✅ Done |
| 2 | Stat tiles on GovernancePage now live from `stats.json` (in-flight count, current release, epics shipped) | ✅ Done |
| 2 | Sidebar "Roadmap" item updated to `#roadmap` hash anchor on governance page | ✅ Done |
| **TODO** | Add `LINEAR_API_KEY` to `.github/workflows/stats.yml` CI env vars | 🔲 Pending |
| **TODO** | Document in `docs/conventions/stats-pipeline.md` | 🔲 Pending |
| **TODO** | Verify Linear team query field — `team(id: "SUG")` vs `team(key: "SUG")` — run `pnpm collect:stats` with key set | 🔲 Pending |
| Deferred | (Optional) `roadmapPage` Sanity doc for editorial intro copy | ⬛ Deferred |

## Technical notes

- **Collector:** `apps/web/scripts/stats/linear.js` — `collectLinear()`. Linear GraphQL endpoint `https://api.linear.app/graphql`, `Authorization: Bearer <key>`. Filters `state.type in [started, backlog, unstarted, completed]`, first 250 issues. Groups into `inProgress`, `backlog`, `shipped` (trimmed to 20). Output key: `stats.linearRoadmap`.
- **Page:** `apps/web/src/pages/platform/GovernancePage.jsx` — roadmap section reads `stats.linearRoadmap`. No standalone `/platform/roadmap` route exists; `RoadmapPage.jsx` was deleted.
- **Stale detection:** `isStale = roadmap.stale === true || (!roadmap.fetchedAt && !inProgress.length && !backlog.length)`. Callout renders when stale; tables render when live.
- **Priority colours:** Urgent = pink-100/pink-700, High = amber-400/amber-800, Medium/Low = bg-subtle. Classes in `PlatformHubPage.module.css`.
- **Verify at activation:** Linear may require `team(key: "SUG")` instead of `team(id: "SUG")` — test with real key before CI wiring.

## Non-Goals

- No standalone `/platform/roadmap` route (deleted — was a stub, pivoted to inline).
- No shipped/completed epics in the roadmap section (covered by Recent Releases).
- No real-time webhook integration — build-time polling only.
- No filtering, search, or pagination.

## Related

- **Linear:** [SUG-110](https://linear.app/sugartown/issue/SUG-110/dynamically-generated-roadmap-from-linear)
- **Collector:** `apps/web/scripts/stats/linear.js`
- **Page:** `apps/web/src/pages/platform/GovernancePage.jsx` — `#roadmap` section
- **Stats pipeline pattern:** `apps/web/scripts/collect-stats.js`, `docs/conventions/stats-pipeline.md`
- **SUG-67** (stats pipeline) — upstream pattern
- **SUG-111** (PlatformLayout) — shell this page lives inside
