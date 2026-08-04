---
**Epic:** SUG-249 — Rescope to incorporate /platform dashboards
**Linear Issue:** [SUG-249](https://linear.app/sugartown/issue/SUG-249/rescope-to-incorporate-platform-dashboards)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-249 — Rescope SUG-19 to incorporate /platform dashboards

A stub. Filed 2026-07-27 as a sub-issue of **SUG-19** (KPI dashboard card family:
stat-card, bar-card, insight-card), with no description of its own beyond the title —
the Linear issue carries no detail to backfill from.

## Background

Parent: [SUG-19](https://linear.app/sugartown/issue/SUG-19/kpi-dashboard-card-family-stat-card-bar-card-insight-card-bl-03).
The `/platform` surface (Governance, Monorepo, CMS, Design System hub pages) already
renders several dashboard-shaped tiles (`GovernancePage.jsx`'s coverage tally,
`CwvSnapshot.jsx`) built ad hoc, ahead of SUG-19's card family existing. This issue's
title signals SUG-19 should be rescoped to account for those existing consumers before
or during its own build, rather than SUG-19 shipping a card family the `/platform`
pages then have to retrofit around.

## Objective

At activation: read SUG-19's current scope and every `/platform` page that renders a
stat/KPI-shaped tile today. Decide whether `/platform` dashboards become SUG-19
consumers (retrofit), stay separate (documented reason), or SUG-19's card API changes
to fit both from the start.

## Scope

- [ ] **Activation audit:** re-read SUG-19's current Linear description and any doc, then
      grep `apps/web/src/pages/platform/` for hardcoded stat-tile patterns (`StatCard`,
      `Grid spacing`, tally arrays) to enumerate existing dashboard-shaped surfaces
- [ ] Decide the rescope and record it as an edit to SUG-19's own scope (Linear +
      backlog doc, once SUG-19 has one), not duplicated here

## Non-Goals

- Building any card component here — that's SUG-19's scope, not this stub's
- Retrofitting existing `/platform` tiles ahead of the decision above

## Related

- **Linear:** [SUG-249](https://linear.app/sugartown/issue/SUG-249) (parent: SUG-19)
