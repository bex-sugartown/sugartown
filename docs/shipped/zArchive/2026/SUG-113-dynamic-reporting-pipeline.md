# SUG-113 · Dynamic Reporting Pipeline — Linear roadmap + CWV desktop/mobile with fallback

**Linear Issue:** [SUG-113](https://linear.app/sugartown/issue/SUG-113/dynamic-reporting-pipeline-linear-roadmap-cwv-desktopmobile-with)
**Status:** Done
**Priority:** High
**Epic strategy:** merge-as-you-go (single phase)

---

## Background

SUG-110 shipped the Linear roadmap collector and GovernancePage inline tables, but live data was not populating. The `linearRoadmap` key in stats.json consistently returned `{ stale: true }` despite the query fix landing on main.

Root cause (diagnosed 2026-05-15):
- **Linear**: Query complexity exceeded Linear's limit (60054 vs max 10000). Fetching `issues(first: 250)` nested under `teams.nodes` for all teams at once blew the budget. Fixed by two-step approach: get team UUID first, then query `team(id:)` issues only.
- **CrUX**: `CRUX_API_KEY` secret is set and working. API returns 404 (not 403) — sugartown.io has insufficient real-user traffic for CrUX data. Expected for a pre-launch site. Backup estimated data is shown with "estimated · pre-launch" label.

---

## Scope

### Fixed

- `apps/web/scripts/stats/linear.js` — two-step query (teams → UUID → issues), JS-side state filtering, full response-body capture on error
- `apps/web/src/components/CwvSnapshot.jsx` — CWV tiles now label backup data "estimated · pre-launch" instead of "p75 · field data"
- `docs/conventions/stats-pipeline.md` — added `LINEAR_SUGARTOWN_STATS` to required secrets table; documented linearRoadmap and crux failure modes
- `packages/design-system/src/components/FilterBar/FilterBar.stories.tsx` — fixed `useState` in render function (hooks-in-render lint error blocking CI)
- `packages/design-system/src/components/Card/Card.stories.tsx` — removed unused `THUMB_RAIL`

### Confirmed working

- GovernancePage already had a stale Callout fallback (rendered when `linearRoadmap.stale === true`)
- CrUX `no-data` path correctly falls back to `CRUX_BACKUP`; no code change needed beyond the label

---

## Acceptance Criteria

- [x] `linearRoadmap.stale` is false after CI run — real Linear data populates GovernancePage
- [x] CWV tiles show "estimated · pre-launch" instead of "p75 · field data" when no real CrUX data
- [x] `docs/conventions/stats-pipeline.md` documents `LINEAR_SUGARTOWN_STATS` and CrUX failure modes
- [x] DS lint passes (zero errors in `packages/design-system`)
