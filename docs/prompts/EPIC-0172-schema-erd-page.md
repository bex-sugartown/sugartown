# EPIC-0172 — Schema ERD Page (apps/web)

**Epic ID:** EPIC-0172
**Surface:** `apps/web` — React/Vite frontend only
**Priority:** P1 (non-blocking)
**Created:** 2026-02-28
**Activated:** 2026-03-14

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No existing ERD or schema visualization component exists. New component `SchemaERD` created in `src/components/SchemaERD/`. Uses existing `SeoHead` for page metadata.
- [x] **Use case coverage** — Single consumer: `SchemaErdPage.jsx`. Component is props-driven (`{ entities, relationships }`) to support future data source swap.
- [x] **Layout contract** — Entity cards: `minmax(260px, 1fr)` in auto-fill grid. Sidebar: 320px fixed. Layout: `1fr 320px` grid, collapses to single column at 900px. Page max-width: 1200px.
- [x] **All prop value enumerations** — N/A: no Sanity enum fields rendered; entity `kind` and `group` derived from manifest data.
- [x] **Correct audit file paths** — All paths verified via `ls`/`Read`.
- [x] **Dark / theme modifier treatment** — All CSS uses `var(--st-*)` tokens. Component inherits theme from `[data-theme]` on `<html>`. No component-level theme overrides needed.
- [x] **Studio schema changes scoped** — Explicitly out of scope. No Studio changes.
- [x] **Web adapter sync scoped** — N/A: no DS component created or modified.

---

## Context

The Sugartown monorepo has 30 Sanity schema types (13 objects, 17 documents) across four groups: atoms, taxonomy, content, and infra. No visual representation of the content model exists on the public site. The IA brief (§5.3) identifies the Platform section as the home for architecture artifacts. This page serves as both a portfolio piece (MACH architecture literacy) and an internal reference.

**Relevant files:**
- `apps/web/src/App.jsx` — router (route added before `/:slug` catch-all)
- `apps/web/src/pages/` — page components
- `apps/web/src/components/` — shared components
- `apps/web/src/data/` — static data files

---

## Objective

Add a live, interactive Schema ERD page to `apps/web` at route `/schema-erd`. A committed `schemaManifest.js` provides the data source. The `SchemaERD` component is props-driven and data-source agnostic — no direct manifest import, enabling a future swap to GROQ-fetched or build-time generated data without component changes. No Sanity API calls at runtime; the page renders immediately.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | ERD is a code-driven page, not a Sanity `page` document |
| `article` | No | Not a content document |
| `caseStudy` | No | Not a content document |
| `node` | No | Not a content document |
| `archivePage` | No | Not an archive surface |

---

## Scope

- [x] Static schema manifest (`schemaManifest.js`) with all 30 entity types and 44 relationships
- [x] Interactive ERD component (`SchemaERD.jsx`) — props-driven, no manifest import
- [x] CSS module (`SchemaERD.module.css`) — all `var(--st-*)` tokens, no hardcoded hex
- [x] Page wrapper (`SchemaErdPage.jsx`) — imports manifest, passes to component, sets SEO
- [x] Route registration in `App.jsx` — `/schema-erd` before `/:slug` catch-all

---

## Non-Goals

- Does **not** read live Sanity schema files or TypeScript source at runtime
- Does **not** require a build-time codegen step (deferred to Option C / future epic)
- Does **not** modify any Sanity Studio schemas, GROQ queries, or `apps/studio` files
- Does **not** require a new package in `packages/` — app-local only
- Does **not** add the page to site navigation (linkable from Platform page content)

---

## Technical Constraints

**Data layer:** Static JS manifest committed to repo. Exports `{ entities, relationships }`. Each entity: `{ id, label, kind, group, fields[] }`. Each relationship: `{ from, to, label, type }`.

**Component contract:** `<SchemaERD entities={[]} relationships={[]} />` — no internal data fetching, no direct manifest import. Group filter tabs derived from entity data. Click-to-select with relationship highlighting. Sidebar shows fields, outbound refs, inbound refs.

**Route placement:** Must appear before the `/:slug` catch-all in `App.jsx` to avoid being caught by `RootPage`.

**Styling:** CSS module using `var(--st-*)` tokens exclusively. Typography: `--st-font-family-ui` and `--st-font-family-narrative`. Responsive: single column below 900px.

---

## Files to Modify

**Frontend (all CREATE except App.jsx EDIT)**
- `apps/web/src/data/schemaManifest.js` — CREATE: 30 entities, 44 relationships
- `apps/web/src/components/SchemaERD/SchemaERD.jsx` — CREATE: interactive ERD component
- `apps/web/src/components/SchemaERD/SchemaERD.module.css` — CREATE: scoped styles
- `apps/web/src/pages/SchemaErdPage.jsx` — CREATE: route page wrapper
- `apps/web/src/App.jsx` — EDIT: add route + import

---

## User Stories

### ERD-001: Static manifest file
**Priority:** P1

As a developer, I want a committed `schemaManifest.js` in `apps/web/src/data/` so the ERD has a canonical, version-controlled data source.

**Acceptance Criteria:**
- [x] File exports two named arrays: `entities` and `relationships`
- [x] All 30 Sanity schema types represented across four groups: atoms, taxonomy, content, infra
- [x] Each entity: `{ id, label, kind, group, fields[] }`
- [x] Each relationship: `{ from, to, label, type }`
- [x] Comment header with `Last synced: YYYY-MM-DD`

### ERD-002: ERD component — props-driven
**Priority:** P1

As a developer, I want `SchemaERD.jsx` to accept data as props so the component is reusable, testable, and ready for a future dynamic data source.

**Acceptance Criteria:**
- [x] Component signature: `<SchemaERD entities={[]} relationships={[]} />`
- [x] No direct imports of `schemaManifest.js` inside the component file
- [x] Group filter tabs render from `entities` data — not hardcoded strings
- [x] Clicking an entity highlights it and shows relationships in sidebar
- [x] Clicking a related entity in sidebar navigates to that entity
- [x] Clear selection button resets state

### ERD-003: Route at /schema-erd
**Priority:** P1

As a visitor, I want to navigate to `/schema-erd` and see the interactive content model diagram.

**Acceptance Criteria:**
- [x] Route `/schema-erd` registered in app router
- [x] Page renders without Sanity API calls — no loading spinner
- [x] Page sets title and meta description via `SeoHead`
- [x] No console errors on mount

### ERD-004: Design system tokens applied
**Priority:** P1

As Bex, I want the ERD page to use Sugartown design tokens so it looks native to the site.

**Acceptance Criteria:**
- [x] All colors reference `var(--st-*)` tokens — no hardcoded hex
- [x] Typography uses `--st-font-family-ui` and `--st-font-family-narrative`
- [x] Background, surface, and border colors respond to theme changes
- [x] Passes visual inspection against existing site pages

### ERD-005: Maintenance documentation
**Priority:** P2

As a solo operator, I want clear instructions for updating the manifest when the schema changes.

**Acceptance Criteria:**
- [x] Comment block at top of `schemaManifest.js` explains data structure and groups

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Manifest drifts from actual schema after future changes | ERD shows stale relationships | Comment header with "Last synced" date. Update as part of schema change commits. |
| CSS token names differ from expectations | Styling breaks silently | All CSS uses canonical `var(--st-*)` names from `tokens.css`. Verified in ERD-004. |
| Route path conflicts | Router error or 404 | `/schema-erd` confirmed not reserved. Placed before `/:slug` catch-all. |
| Performance with 30+ entity cards on mobile | Laggy filter interactions | 30 cards is trivial for React. No virtualization needed at this scale. |

---

## Upgrade Path

The static manifest can be replaced by:
- **Option C (Sanity hybrid):** A `schemaErdSection` type in Sanity Studio, allowing the ERD to be embedded in any page via the section builder. The component remains unchanged — only the data source and page wrapper change. See `docs/backlog/EPIC-schema-erd-sanity-hybrid.md`.
- **Build-time codegen:** A script that reads `apps/studio/schemas/` TypeScript files and outputs the same `{ entities, relationships }` shape. Zero component changes required.

---

## Rollback Plan

This epic touches only `apps/web`. If anything breaks:
1. Delete the four new files (`schemaManifest.js`, `SchemaERD/`, `SchemaErdPage.jsx`)
2. Revert the `App.jsx` route change
3. No schema, studio, or package changes to undo

---

*Converted from EPIC-0147 HTML brief (2026-02-28). Assigned EPIC-0172 and activated 2026-03-14.*
