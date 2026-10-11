---
**Epic:** ST-157 — Governance roadmap shows a preview and links to the GitHub board
**Issue:** [#157](https://github.com/bex-sugartown/sugartown/issues/157)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-157-governance-roadmap-preview.vspec.html`
---

# ST-157 — Governance roadmap shows a preview and links to the GitHub board

Replace the three full roadmap lanes on `/platform/governance` with a short preview and an invitation to open the GitHub roadmap board.

## Background

`GovernancePage.jsx` §02 Roadmap renders every epic in three lanes (In progress, To do, Backlog) from `stats.githubRoadmap`, so the section grows with the backlog and duplicates the board. The only link to the board today sits inside the no-data and stale callouts. The GitHub board is the single priority queue (CLAUDE.md §Issue status), so the page should point at it rather than mirror it.

## Objective

After this epic, §02 Roadmap on `/platform/governance` shows a bounded preview of the roadmap and a clear call to action that opens the GitHub roadmap board (`https://github.com/users/bex-sugartown/projects/1`) in a new tab. Layers touched: frontend (GovernancePage render and its CSS module). No schema, GROQ, content or stats-pipeline change; `stats.githubRoadmap` keeps its shape. The no-data and stale states still render.

## Scope

- [ ] Vspec for the preview and the call to action, signed off before any JSX — layer: frontend (Phase 0)
- [ ] Replace the three lanes with the previewed rows (which lanes and how many is the vspec's decision) — layer: frontend
- [ ] Add the click-through call to action to the GitHub board, opening in a new tab with `rel="noreferrer"` — layer: frontend
- [ ] Keep the no-data and stale callouts working with the new layout — layer: frontend
- [ ] Update the section kicker so the epic count still reads true after the lanes are cut — layer: frontend

## Phases

Single phase.

## Acceptance Criteria

- [ ] `/platform/governance` §02 shows no more than the previewed rows, matching the signed-off vspec
- [ ] A visible call to action links to `https://github.com/users/bex-sugartown/projects/1` and opens in a new tab
- [ ] With `stats.githubRoadmap` empty, the no-data callout still renders and links to the board
- [ ] With `stats.githubRoadmap.stale === true`, the stale callout still renders
- [ ] `pnpm validate:urls`, `pnpm validate:tokens`, `pnpm lint` and `pnpm test:smoke` pass
- [ ] Vspec-to-build comparison table approved ("Visual QA approved") before close-out

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Phase 0 gate fires.** The preview is a new visual format, so no JSX or CSS until the vspec is signed off.
- **Component choice gate (`.claude/rules/react.md`).** Candidates to audit at activation: `Table tone="subdued"` (already used by `RoadmapLane`, the variant-first rule applies, no new table component), `Callout` (existing no-data and stale states), `SectionLabel` (the section header). The call to action is likely a link or button on existing primitives; confirm in the audit.
- **Activation audits:** read `GovernancePage.jsx` lines 36 to 80 and 197 to 290, and the `roadmapScroll`, `trustLink` and `empty` classes in `GovernancePage.module.css`, before proposing any class name. Run the CSS reuse audit in `.claude/rules/css-layout.md` first.
- **Data:** `stats.githubRoadmap` comes from CI (`apps/web/src/generated/stats.json`). Do not change the pipeline. Read the real field shape before choosing what the preview sorts or filters on.
- **Fix in passing:** `roadmapRef` is kept "for future scroll-spy use". Leave it unless the vspec removes the scroll container.
- **Dependencies:** none found. No other in-flight backlog doc touches `GovernancePage.jsx` (checked `docs/backlog/` for governance and roadmap names 2026-10-11; verify again at activation).

## Model & Mode [REQUIRED]

`/model sonnet` — one page section, existing primitives, no architecture decision.

## Non-Goals

- Changing the CI roadmap fetch or the shape of `stats.githubRoadmap`.
- Embedding the GitHub board or adding a live view of it.
- Touching other Governance sections (§01, §03 to §05).
- Content edits in Sanity.

## Related

- **GitHub:** [#157](https://github.com/bex-sugartown/sugartown/issues/157)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
