---
**Epic:** SUG-177 — List component audit — surface all site list patterns for DS List integration
**Linear Issue:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-177 — List component audit — surface all site list patterns for DS List integration

Audit the live site for raw `<ul>`/`<ol>` list surfaces that are candidates for migration to the DS List/ListItem primitive, then produce Storybook stories covering the expanded use cases.

## Background

The DS `List`/`ListItem` primitive (shipped SUG-167) is wired for content-list archive mode via `ContentList` adapter. However, several page templates still use raw `<ul>`/`<ol>` with bespoke CSS classes: `refList`/`refRow` (GlossaryTermPage — Used In / Related Content back-refs), `sourcesList` (GlossaryTermPage — citation list), `seriesPartList` (SeriesPage — numbered episode list), `rolesList` (PersonProfilePage — work history), `socialLinks` (PersonProfilePage — icon link list), `linkList` (SitemapPage — grouped URL lists), and `enumList` (ContentModelsPage — schema enum display). These were written before the DS List primitive existed and now represent gaps between the canonical component and its actual reach on the site.

The trigger is a post-SUG-167 cleanup pass: now that the primitive exists, close the gap and use it as documentation fodder for Storybook use-case stories.

## Objective

After this epic, every site list surface that maps cleanly to the DS List/ListItem API is either migrated to the primitive or has a documented rationale for why it stays raw. The DS List Storybook story covers all confirmed use-case variants (ledger, inline chip, numbered, link, source citation). Layers touched: frontend (page JSX + CSS), Storybook stories. No Sanity schema changes; no GROQ query changes.

## Scope

- [ ] **Audit all raw `<ul>`/`<ol>` list surfaces** — read each file, map class name → visual pattern → List API fit (migrate / extend / keep raw), document in this epic doc — layer: frontend (read-only)
- [ ] **Migrate `refList`/`refRow` (GlossaryTermPage)** — Used In + Related Content back-ref rows (Chip + Link) to DS List/ListItem — layer: frontend
- [ ] **Migrate `sourcesList` (GlossaryTermPage)** — citation source list (text + optional `<a>`) to DS List/ListItem — layer: frontend
- [ ] **Assess `seriesPartList` (SeriesPage)** — numbered `<ol>` episode list; migrate if `<List ordered>` prop exists or extend the primitive first — layer: frontend
- [ ] **Assess `rolesList` (PersonProfilePage)** — work history items; migrate if inline variant covers it — layer: frontend
- [ ] **Assess `socialLinks` (PersonProfilePage)** — icon + text link list; likely stays raw (specialised layout) — document rationale — layer: frontend (decision)
- [ ] **Assess `linkList` (SitemapPage)** — grouped URL lists; migrate if link-list variant is added to DS List — layer: frontend
- [ ] **Assess `enumList` (ContentModelsPage)** — monospace schema enum display; likely stays raw (code context) — document rationale — layer: frontend (decision)
- [ ] **Storybook stories — expanded use cases** — add stories covering: ledger row (Chip + Link), source citation, numbered episode, link list; update existing List story if new props are added — layer: Storybook

## Phases

Single phase — audit → migrate confirmed surfaces → Storybook stories → close-out.

## Acceptance criteria

- [ ] Every raw `<ul>`/`<ol>` surface in `apps/web/src/pages/` is documented in the audit table (migrate / extend / keep raw + rationale)
- [ ] All "migrate" decisions are implemented and the bespoke CSS classes removed
- [ ] "Extend" decisions either land a new prop on DS List or are deferred to a follow-on with a Linear issue linked
- [ ] "Keep raw" decisions have a written rationale in this doc (e.g. "specialised icon layout, no DS fit")
- [ ] DS List Storybook story covers all confirmed use-case variants; Chromatic Build passes
- [ ] No regression on pages that already use ContentList (archive list-view)
- [ ] `pnpm validate:tokens` and `pnpm validate:style-mirror` pass; zero hardcoded color violations

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Activation audit — List primitive API:** read `apps/web/src/design-system/components/list/List.jsx` to confirm current props (`ordered`, `variant`, `spacing`, etc.) before assessing fit for each surface. Any "extend" decision requires the primitive to accept the new prop first.
- **CSS removal rule:** when a bespoke class is removed from a page, grep for it across the entire repo to confirm it has no other consumers before deleting from the CSS module.
- **No Content Write Gate** — no Sanity content changes in scope.
- **No schema changes** — no Sanity deploy needed.
- **Model & Mode [REQUIRED]:** `/model opusplan` — multi-file frontend audit + selective migration + Storybook story additions; Opus plans the audit table + Files to Modify; Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opusplan` — audit spans multiple page files + CSS modules + DS component + Storybook; Opus builds the migration table and files-to-modify list at plan time, Sonnet executes.

## Non-Goals

- No new DS List props beyond what is needed to cover confirmed migration targets — if a surface needs a net-new primitive feature, scope that separately.
- No changes to ContentList adapter or archive-mode list rendering.
- No Sanity schema or GROQ query changes.
- No migration of FilterBar internal `<ul>` list — FilterBar has its own controlled rendering.

## Related

- **Linear:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
- **Upstream:** SUG-167 (List/ListItem DS primitive, shipped v0.26.9) — prerequisite
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
