# Release Notes — v0.23.25

**Date:** 2026-05-14
**Scope:** `apps/web`, `packages/design-system`, `apps/storybook`

---

## What this release is

Six mini-releases aggregated into a platform and design system structural pass. The main threads: a new nested platform architecture with five section hubs, a new sidebar layout system (two new DS primitives), a Linear-backed roadmap pipeline, and enforcement of the pre-commit ESLint gate that had been wired but inactive.

---

## What changed

### Platform IA Phase II — nested section architecture

The platform section now has five dedicated hub pages (`/platform/cms`, `/platform/design-system`, `/platform/design-system-registry`, `/platform/governance`, `/platform/monorepo`), each with its own content and a shared `PlatformHero` component that accepts a hero slot. `App.jsx` gained the nested sub-routes, and `GovernancePage` now renders the Linear roadmap inline rather than via a separate `/platform/roadmap` page.

### Sidebar layout system — two new DS primitives

`Sidebar` (`design-system/components/sidebar/`) is a new layout primitive that owns the sticky shell and mobile disclosure. It accepts `side` (left|right), `breakpoint` (md|lg), and `mobileStyle` (appendix|strip) props, and replaces the bespoke container markup that was duplicated inside `PlatformSidebar` and `PageSidebar`. Both components now render their content inside `<Sidebar>` and keep only their slot-assembly logic.

`TwoColumnLayout` (`design-system/components/two-column-layout/`) is a flex shell for two-column pages. It accepts `placement` (left|right) and `breakpoint` props and handles column ordering. `PlatformLayout` now uses it; `PlatformLayout.module.css` has been deleted.

### SidebarNav and useScrollspy

`SidebarNav` is a new web adapter component — an anchor-link list with scrollspy integration (using the extracted `useScrollspy` hook), collapsible support, and level-3 sub-items. `PageSidebar` uses it for the table-of-contents block.

### Linear roadmap pipeline

A new `scripts/stats/linear.js` collector queries the Linear API for SUG-team issues and feeds roadmap data into the build-time stats pipeline. The GitHub Actions `stats.yml` workflow now has the `LINEAR_SUGARTOWN_STATS` secret wired. A bug where the collector used the invalid `team(key:)` form (returning null) was fixed to use the `teams` query.

### ToolDetailPage

`/tools/:slug` now has a dedicated `ToolDetailPage` rather than falling through to the generic taxonomy detail template.

### ESLint pre-commit gate

The Husky pre-commit hook was wired in a prior release but not enforcing. 43 existing ESLint errors across `apps/web` were resolved, and the gate is now active. All commits must pass lint before they land.

### SegmentedControl light-mode fix

`SegmentedControl` was rendering with a dark appearance in light mode in Storybook. The root cause: `--st-segmented-*` light-theme token overrides existed in the web app's `theme.pink-moon.css` but not in the DS package copy, which is what Storybook uses. The overrides are now in both files.

### Storybook story organization

`SegmentedControl` moved from `Components/` to `Patterns/`. `SidebarNav` moved to `Patterns/SidebarNav`. New stories added: `Components/Pill`, `Components/IconButton`, `Components/Sidebar`, `Layout/TwoColumnLayout`. `BUILD_DATE` is now frozen to a stable sentinel value in Storybook's `viteFinal` config to prevent Chromatic snapshot churn on every build.

---

## Not in this release

- SUG-100 (CWV snapshot product widget) — In Review, not part of this cycle
- SUG-107 (client taxonomy) — not started
- SUG-113 (dynamic reporting pipeline) — not started
- Real Linear data in stats.json requires `LINEAR_SUGARTOWN_STATS` secret to be set in CI; local builds without the secret produce an empty/stale roadmap block

---

## Validator state at release

```
pnpm validate:tokens     → ✅ All var(--st-*) references resolve to defined tokens (590 tokens)
pnpm validate:tokens --strict-colors → ✅ No hardcoded color values found
pnpm lint                → ✅ 0 errors, 6 pre-existing warnings (react-hooks/exhaustive-deps in KnowledgeGraph, ScoreRing, useSanityDoc — not introduced in this cycle)
Chromatic Build #40      → ✅ Passed
```
