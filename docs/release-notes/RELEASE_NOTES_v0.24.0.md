# Release Notes — v0.24.0

**Date:** 2026-05-18
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook

---

## What this release is

v0.24.0 aggregates 39 patch mini-releases since v0.23.0 (2026-04-27). The scope spans three parallel tracks: DS infrastructure (token pipeline, Grid/Table/IndexGroup/IndexCell primitive consolidation), platform hub build-out (CMS, Design System, Governance, Monorepo section pages), and editorial surface depth (case study outcomes, calloutSection, taxonomy letter filter, trust reporting). It also ships the Registry ↔ ERD bridge that connects the component registry and schema ERD as a live cross-linked surface.

---

## What changed

### Design system primitive consolidation

The token pipeline now has a canonical source: `tokens/source/tokens.json` builds both `tokens.css` files via Style Dictionary v5. A Husky pre-commit hook blocks commits with unresolved token references or hardcoded color values. All component and page CSS was audited — hardcoded hex/rgba/hsla values replaced with `--st-*` token references across every file.

`StatGrid` and `SectionContainer` are deleted. All callsites use `Grid spacing="0" accentTop`. `Grid` gained `accentColor` (`brand`/`ink`) and `tabletColumns` props. `IndexGroup` and `IndexCell` are new DS primitives for alpha filter strips and pagination cells; `AlphaFilter` is extracted as a `Patterns/` composite; `Pagination` refactored to use `IndexCell` internally.

`Table` gained a `tone` prop (`accent`/`subdued`), a cross-browser caption fix, and 6 new `--st-table-*` zone tokens. `RoadmapTable` and `DataTable` compose `Table`; `LaneHeader` is retired.

### Platform hub pages

Five platform section hub pages ship: `/platform/cms`, `/platform/design-system`, `/platform/design-system/registry`, `/platform/governance`, `/platform/monorepo`. Each uses the `PlatformHero` + `TwoColumnLayout` + `Sidebar` + `SidebarNav` layout system. The `Sidebar` primitive handles sticky shell and mobile disclosure; `TwoColumnLayout` provides the two-column flex shell; `useScrollspy` drives active-section tracking in `SidebarNav`.

The component registry page at `/platform/design-system/registry` is auto-generated from `component-registry.md` at build time — no duplication of content. The schema ERD page now deep-links via `?type=` URL param, and registry schema column cells link directly to the ERD with auto-select. The ERD detail panel shows a "Rendered by" DS component chip linking back to the registry row.

### Trust data and reporting

The `stats.json` pipeline ships: build-time aggregation of DS token/component/story counts, Sanity content counts, GitHub stats, CrUX/Lighthouse performance, and Linear roadmap data. PortableText `{{stats.*}}` variable interpolation allows inline stat injection in article/node/page body text. The Footer shows a live version badge; the Platform hero shows a live stat rail; `RecentContentSection` shows the latest release.

LHCI mobile throttling is fixed for Lighthouse 10+; the form-factor toggle is re-enabled in `CwvSnapshot`. Uncalibrated CI data falls back to `PERF_BACKUP` with a detection label. `CwvSnapshot` is now surfaced on GovernancePage §04.

### Editorial surface depth

Case study outcomes narrative ships: outcomes schema, GROQ projection, and StatTile layout render. `calloutSection` in `sections[]` replaces the legacy `challengeSummary` text field. The tags archive migrated from a bucket layout to a flat 3-col grid with `AlphaFilter` letter filtering. The semantic CSS naming audit renamed `tax*`/`alpha*` classes to `indexGroup`/`indexCell`/`listItem` vocabulary with a `validate:css-names` guardrail enforcing it.

The `KnowledgeGraph` ships as an interactive force-graph canvas with graph/grid toggle on the archive page. `ToolDetailPage` at `/tools/:slug` is a new dedicated entity detail page for the tool taxonomy.

### Studio schema cleanup

The migration tab was consolidated into the legacy tab across `article`, `node`, `page`, `caseStudy`. `legacySource` is deprecated. A retrieval group was added across content types. `recentContentSection` is a new section-builder-insertable trust ticker type. `validate-schema-parity.js` checks object/document schema pairs for value drift. Parent category relationship removed from `category` schema.

### Build and Storybook infrastructure

`generate-schema-manifest.mjs` now calls `mkdirSync` before `writeFileSync` — Netlify builds were failing with ENOENT when the `data/` directory was absent on first-run. The Storybook Netlify ignore command was widened to include `packages/design-system/` and `apps/web/src/design-system/` — the previous setting only watched `apps/storybook/`, causing Storybook builds to be skipped on every DS component push. `BUILD_DATE` is frozen to a stable sentinel in `viteFinal` to eliminate Chromatic snapshot churn.

---

## Not in this release

- `DataTable` migration to `<Table>` directly: 3 active callers remain (`TrustReportSection`, `DesignSystemPage`, `GovernancePage`). `DataTable` story is marked deprecated. Migration tracked in SUG-126.
- `ButtonGroup` DS primitive: scoped in SUG-126.
- SUG-100 (CWV Snapshot product widget): LHCI throttling fix ships here; full scope (ScoreRing, SegmentedControl, `reports[]` multi-select) deferred.
- Chromatic VRT: deferred to next session per session policy.

---

## Validator state at release

```
pnpm validate:tokens        ✅  All var(--st-*) references resolve to defined tokens (612 tokens)
pnpm validate:tokens:strict ✅  No hardcoded color values found in component/page CSS
pnpm lint                   ✅  0 errors, 6 warnings (pre-existing react-hooks/exhaustive-deps)
```
