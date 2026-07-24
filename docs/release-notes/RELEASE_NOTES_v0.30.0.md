# Release Notes — v0.30.0

**Date:** 2026-07-24
**Scope:** Sugartown monorepo (apps/web, packages/design-system, apps/storybook, apps/contentful-poc)

---

## What this release is

apps/web now consumes `@sugartown/design-system` as a real dependency instead of maintaining a hand-synced mirror of every component. This closes out a multi-release consolidation effort: the link-injection mechanism that made this possible (v0.29.4), the component behavior reconciliation that cleared the way for it (v0.29.5), and the conversion itself (v0.29.6) are all captured here as one aggregated minor release.

---

## What changed

### apps/web consumes the design system package directly

The `apps/web/src/design-system/components/` tree — a manually maintained JSX mirror of every package component — is retired. 42 of 44 components now re-export directly from `@sugartown/design-system`; the remaining 2 (`SidebarNav`, `Tile`) have genuine app-specific coupling (scroll-spy hooks, internal link utilities) and stay in `apps/web`. A `LinkProvider` mounted at the app root supplies react-router's `Link` to the package's injectable link seam, so navigation behaves identically to before.

Two components needed real package API additions rather than a mechanical re-export: `Card` gained `children`/`footerChildren`/thumbnail-override props to support custom body and footer content, and `Media` gained a `hotspot` prop plus newly-exported overlay helper functions (`parseOverlay`, `getOverlayStyles`, `ensureSvgFilter`) that other components depend on directly.

### Navigation and link handling

`Card`, `Chip`, `Breadcrumb`, `IndexCell`, and `List` now resolve navigation through an injectable link component instead of a hard-coded `<a href>`, so each consuming app can supply its own router without the package importing one. `apps/contentful-poc` uses this to navigate client-side via `next/link`. `Button` gained the ability to navigate at all (an `href` prop with external-link handling), and three components gained the ability to be imported from the package barrel for the first time.

### Bug fixes

Four user-facing issues were fixed as part of reconciling behavioral differences between the two copies before consolidating them: `FilterBar` was missing its "clear all" control, `CodeBlock`'s line-number toggle didn't do anything, `List` items without a destination were focusable but inert, and `Breadcrumb` was marking the wrong crumb as the current page on every detail page (a linked trailing crumb, not the actual current page).

**Breaking (design-system package only):** `Callout`'s `icon` prop and `default` variant are removed — the package's copy has been replaced with a different visual design already in production use. No consumers were affected at the time of the change.

### Storybook and tooling

Package-level Storybook stories now exist for five components that previously had none — the coverage gap that let the above bugs go unnoticed for as long as they did. Two Storybook/Chromatic tooling bugs were also fixed: a build-time version number was re-triggering visual diffs on every release regardless of actual changes, and the Chromatic skip-gate was silently skipping visual review for an entire batch of commits whenever the last commit in that batch was documentation-only.

---

## Not in this release

- Two components (`SidebarNav`, `Tile`) remain web-only by design — they have real application-specific dependencies with no package equivalent.

---

## Validator state at release

```
✅  pnpm validate:tokens        — all var(--st-*) refs resolve
✅  pnpm validate:tokens:strict — zero hardcoded color violations
✅  pnpm validate:style-mirror  — 0 component CSS mirror pairs remain to compare; 42 components are now package-only
✅  pnpm validate:dead-refs     — 4 pre-existing entries grandfathered, no new findings
✅  pnpm lint                   — zero ESLint errors
✅  Chromatic build 82          — 376 stories, 36 visual changes, all reviewed and approved
```
