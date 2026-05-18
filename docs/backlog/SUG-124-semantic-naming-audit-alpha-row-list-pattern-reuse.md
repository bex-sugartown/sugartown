---
**Epic:** SUG-124 — Semantic naming audit — CSS classes, alpha row, list pattern reuse guardrails
**Linear Issue:** [SUG-124](https://linear.app/sugartown/issue/SUG-124/semantic-naming-audit-css-classes-alpha-row-list-pattern-reuse)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-124 — Semantic naming audit — CSS classes, alpha row, list pattern reuse guardrails

Audit non-semantic CSS class and component names across the app layer; align the alpha letter-filter row with the existing Pagination component pattern; establish naming conventions and validator guardrails for reusable list/row patterns so the same mistake cannot recur.

## Background

The SUG-123 taxonomy listview work exposed two naming failures. First, the flat-grid tag row classes (`.taxRow`, `.taxRowName`, `.taxRowCount` in `TaxonomyArchivePage.module.css`) are named after the "tax" context rather than the semantic pattern — the same dense-mono-label-plus-count row structure would need to be duplicated or forked for a glossary or any future flat-list surface. Second, the `AlphaStrip` component in `TaxonomyArchivePage.jsx` implements a row of interactive letter-filter buttons that is functionally identical to the Pagination component's prev/next/page button strip (`apps/web/src/components/Pagination.jsx`, `Pagination.module.css`) but is built as a completely separate bespoke component with its own CSS classes (`.alphaStrip`, `.alphaBtn`, `.alphaBtnActive`, `.alphaBtnSelected`, `.alphaBtnDisabled`). These are the same class of problem: new pattern surfaces named after their first use case rather than their reusable concept.

## Objective

After this epic: every CSS class and component that implements a reusable structural pattern is named for that pattern, not for its first call site. The `AlphaStrip` is either unified with or composed from the `Pagination` component's button-row primitive. A naming convention document exists in `docs/conventions/` covering CSS module class naming rules for list, row, and control-strip patterns. The `validate:tokens` or a new lint rule enforces that no new page-scoped class names (e.g. `taxRow`, `alphaBtn`) appear in module CSS files without a corresponding registry entry.

## Scope

- [ ] Audit all CSS module files in `apps/web/src/pages/` for class names that are named after a content type or page rather than a structural pattern — layer: frontend
- [ ] Rename `.taxRow` → semantic name, `.taxRowName` → semantic name, `.taxRowSub` → semantic name, `.taxRowCount` → semantic name in `TaxonomyArchivePage.module.css` and all call sites — layer: frontend
- [ ] Audit `AlphaStrip` component vs `Pagination` component: produce a diff of the two button-row patterns; decide whether `AlphaStrip` should (a) extend `Pagination` via props, (b) share a new `ButtonStrip` primitive, or (c) remain bespoke with a documented rationale — layer: Design System / frontend
- [ ] Implement the decision from the AlphaStrip/Pagination audit — layer: Design System / frontend
- [ ] Write `docs/conventions/css-class-naming.md` covering: semantic-not-placement naming, module class naming rules for list/row/control patterns, when a pattern warrants a shared component vs a local CSS class — layer: conventions / tooling
- [ ] Evaluate adding a lint rule or validator extension that flags content-type-scoped class names (e.g. matching patterns like `tax*`, `alpha*`, `archive*` in module files) — layer: tooling
- [ ] Update `TaxonomyArchivePage.module.css` mock proxy in `docs/drafts/SUG-123-taxonomy-layout-mock.html` to use the new semantic class names once settled — layer: docs/mock

## Phases

**Phase 1 — Audit and naming decision**
Read all affected files; produce the semantic rename map; produce the AlphaStrip vs Pagination diff. No code written until the rename map and component decision are reviewed and approved.

**Phase 2 — Implementation**
Apply renames in module CSS and JSX. Implement AlphaStrip/Pagination decision. Update mock HTML.

**Phase 3 — Conventions doc + guardrail**
Write `docs/conventions/css-class-naming.md`. Evaluate and implement lint/validator rule.

## Acceptance criteria

- [ ] No CSS module class in `apps/web/src/pages/` is named after a content type (`tax*`, `archive*`, `alpha*`, `person*`, `project*`, `tool*`) where that name describes the call site rather than the structural pattern
- [ ] `AlphaStrip` and `Pagination` share a defined relationship: either composed from a common primitive, or `AlphaStrip` has a documented rationale for why it cannot share the Pagination base
- [ ] `docs/conventions/css-class-naming.md` exists and covers the naming rules with positive and negative examples
- [ ] `pnpm validate:tokens` passes with zero errors after renames
- [ ] Storybook stories for any renamed/refactored component updated to use new names

## Technical notes

- **Activation audit:** Before renaming, grep for all current call sites of `.taxRow*` and `.alphaBtn*` class names across `*.jsx` and `*.module.css` files — confirm no external consumers outside `TaxonomyArchivePage.*`
- **AlphaStrip vs Pagination diff:** Read `apps/web/src/components/Pagination.jsx` and `Pagination.module.css` alongside `TaxonomyArchivePage.jsx` `AlphaStrip` component block before proposing the unification path. Key comparison axes: button variant (page number vs letter), disabled state, selected/active state, aria semantics.
- **Rename map approval gate:** The Phase 1 rename map (old name → new name, with rationale) must be presented and approved before any `Edit` call to a CSS module file. This is a visual-surface change — names appear in DevTools and Storybook selectors.
- **No upstream DS changes without a separate DS epic:** If the AlphaStrip/Pagination unification requires a new DS primitive, that primitive is a separate epic. This epic's scope is the app-layer alignment and naming pass only.
- **Model recommendation:** `/model sonnet` — this is a read-heavy audit + rename pass, no complex architectural decisions.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 1 is an audit that requires Opus to read multiple files and produce a rename map and component diff before any decision is locked. Sonnet executes the renames and convention doc after plan-mode exit.

## Non-Goals

- New visual design for the alpha strip or pagination controls — naming and structure only
- Renaming `pages.module.css` shared classes (`.entityFolio`, `.backLink`, etc.) — those are already semantic
- Schema changes — none
- Content writes — none

## Related

- **Linear:** [SUG-124](https://linear.app/sugartown/issue/SUG-124/semantic-naming-audit-css-classes-alpha-row-list-pattern-reuse)
- **Triggered by:** SUG-123 taxonomy listview audit — the `.taxRow*` and `AlphaStrip` naming issues were identified during that epic's convergence pass
- **Affected files:** `apps/web/src/pages/TaxonomyArchivePage.jsx`, `apps/web/src/pages/TaxonomyArchivePage.module.css`, `apps/web/src/components/Pagination.jsx`, `apps/web/src/components/Pagination.module.css`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
