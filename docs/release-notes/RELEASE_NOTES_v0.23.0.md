# Release Notes — v0.23.0

**Date:** 2026-04-27
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook

---

## What this release is

v0.23.0 aggregates 13 patch mini-releases (v0.22.1–v0.22.13) spanning the trust data pipeline,
a structural Ledger Tradition DS pass, the dynamic Knowledge Graph, full legacy theme selector
retirement, and tooling to enforce DS token contracts at commit time.

---

## What changed

### Trust data pipeline (SUG-67, SUG-76)

A build-time `collect-stats.js` pipeline now generates `stats.json` on every build, aggregating
DS health metrics (token count, component count, story count), Sanity content counts, GitHub repo
stats, CrUX/Lighthouse performance scores, security header grades, and recent release history. A
GitHub Actions workflow keeps it current on push and daily.

Three trust render surfaces consume this data live. The footer version badge links to `/platform`
with the current build version. The platform hero mounts a 5-stat trust rail (tokens, components,
stories, performance score, epics shipped). The `RecentContentSection` ticker displays the most
recent release entry. PortableText body content can now reference any stat value inline via
`{{stats.*}}` interpolation.

### Ledger Tradition structural pass (SUG-78, SUG-82, SUG-80)

The Ledger Tradition aesthetic was applied structurally across the DS. Card titles now render in
Cormorant Garamond at 18px (bumped from 16px). Cards gain a folio layout variant with hairline
section dividers, a canvas footer row, and category in the footer. Pink border appears on hover
via the `--st-card-hover-border` token, now wired to the card hover rule.

`MetadataCard` received the full Ledger Tradition treatment: 2px ink column rule, scalar field
grid, chip container padding, and call-number alignment. Chips and the release ticker were
updated to match. FilterBar gains a compact density mode for archive pages. WCAG AA contrast
was corrected across component tokens in a token-only pass. The `Callout` `info` variant was
changed to lime in dark mode with a font size bump for legibility.

### Token coverage and enforcement (SUG-68, SUG-49, SUG-85)

Every hardcoded hex/rgba/hsla value across all component and page CSS files was replaced with
`--st-*` token references. A `--strict-colors` flag was added to `validate-tokens.js` to catch
regressions. A `--check-sync` flag was added to diff `:root` values between both token source
files. The DS package `tokens.css` was synced to the web canonical — spacing converted from rem
to px, dark-first `:root` values aligned for card shadows and code-inline tokens. A Husky
pre-commit hook now blocks commits that fail either validator.

### Dynamic Knowledge Graph (SUG-73)

The Knowledge Graph archive page now includes an interactive force-graph canvas using
`react-force-graph-2d`. Users can toggle between the card/table grid view and the graph canvas.
The graph fills available viewport height, includes zoom controls, and shows an all-node content
rail alongside the canvas.

### Legacy theme selector retirement (SUG-83)

All `[data-theme="light"]` and `[data-theme="dark"]` selectors have been removed from web app
CSS, DS component CSS pairs, and `index.html`. Every consumer now uses
`[data-theme="light-pink-moon"]` exclusively. The DS package CSS pairs (Accordion, Button,
Callout, CodeBlock, Chip) were updated in the same pass.

### Component cleanup (SUG-84, SUG-82)

`EditorialCard` was deleted (dead post-convergence). The `CardGrid` web-adapter was deleted;
its role is now covered by the DS-layer `CardGrid`. `DraftBadge` was refactored to use `Chip`
internally — the standalone CSS module and stories were removed. The `aiTool` and
`categoryPosition` Card props were removed from the API.

### Studio and taxonomy (SUG-76, SUG-74, SUG-49)

A `recentContentSection` schema type was added — section-builder-insertable trust ticker,
registered across page, article, caseStudy, and node doc types. The parent category relationship
was removed from the category schema. AI sub-categories were collapsed into a single top-level
AI category via migration. A schema parity validator script was added to check object/document
schema pairs for drift.

### Storybook and tooling

Ledger Tradition fonts are now self-hosted in `apps/storybook/public/fonts/` for reliable
Chromatic VRT baselines (removes the Google Fonts CDN dependency). Stories for
`RecentContentSection`, `Callout` (all variants), and `CardGrid` were added. The
`@storybook/addon-a11y` accessibility addon was added. A machine-readable DS component registry
(`component-registry.json`) was introduced alongside a `registry-build.js` generator and a
`/new-epic` and `/chromatic` Claude Code skill pair.

---

## Not in this release

- `trustReportSection` section-builder type (longer-form report variants) — backlog SUG-87
- Style Dictionary token build pipeline — backlog SUG-86
- Site-wide Knowledge Graph (cross-content-type) — backlog SUG-81
- Sanity data writes via MCP for trust ticker content

---

## Validator state at release

`pnpm validate:tokens` — 0 errors
`pnpm validate:tokens --strict-colors` — 0 errors
`pnpm validate:tokens --check-sync` — 0 errors
