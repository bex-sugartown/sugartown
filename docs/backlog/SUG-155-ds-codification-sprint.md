**Linear Issue:** [SUG-155](https://linear.app/sugartown/issue/SUG-155/ds-codification-sprint-storybook-coverage-to-codify-close-out)

## EPIC SUG-155: DS Codification Sprint — Storybook coverage, To Codify close-out, deprecation cleanup

**Depends on:** SUG-151 (DS Phase 5 — complete)
**Unblocks:** SUG-152 (DS Usage Docs — needs full story coverage first)

---

## Model & Mode

Sonnet executes. All work is story additions, call-site migrations, and cleanup — no architectural decisions.

---

## Background

The SUG-147–151 DS refactor sequence codified primitives and patterns but left two categories of open work:

1. **"To codify" audit entries** — components that ship in production code but have no Storybook story. The component-audit.json currently has 10 such entries. Storybook stories are the gate for a component being considered "In system."

2. **Registry TODOs** — open deprecation items and migrations flagged during SUG-149/150/151:
   - `Tile` component: 8 active call-sites use `href`/`bar`/`loading`/`titleSize` API; full Card+Metric migration was deferred
   - `DataTable`: deprecated shim over `<Table>`, callers need to migrate to `<Table>` directly
   - `FilterBar`: web-only copy is a pending-migration duplicate; DS package version is canonical

This epic closes all of the above.

---

## Pre-Execution Completeness Gate

- [ ] All 10 "To codify" audit entries reviewed — confirm story location (DS package vs web adapter vs `.storybook/stories/`)
- [ ] Tile call-site inventory confirmed: 8 files enumerated with their specific Tile prop usage
- [ ] DataTable caller inventory: grep all files that import DataTable — confirm zero after migration
- [ ] FilterBar: confirm DS package FilterBar is API-compatible with web-only FilterBar.jsx before migrating callers
- [ ] Dark mode treatment confirmed for each new story

---

## Scope

### Phase 0 — Diverges renames (code name → canonical name)

These components ship under a wrong or use-case name. Rename files, update imports, move Storybook story, flip audit entry `diverges` → `present`.

- [ ] **Drawer** (MobileNav → Drawer) — `MobileNav.jsx/.module.css/.stories.tsx` → `Drawer.*`; story `Components/MobileNav` → `Components/Drawer`; update Header import + any other callers; audit: `pinkMoonName` already set to MobileNav — flip to `Drawer`, status `diverges` → `present`
- [ ] **Switch** ⚠️ DECISION NEEDED — `ThemeToggle` is the only instantiation; no generic `Switch` primitive exists. Decision required: (a) extract a `Switch` primitive from ThemeToggle then make ThemeToggle an instance, or (b) accept ThemeToggle as a one-off and mark the Switch audit entry as won't-implement. Blocked until decision.
- [ ] **Tag / Chip** ⚠️ DECISION NEEDED — two names in use (`Chip` and `Tag`). Chip = read-only status label; Tag = contested (Polaris uses it for removable input tokens, Carbon for read-only labels). Decision required: confirm Chip is canonical for our read-only status use, then grep and align all call-sites. Blocked until decision.
- [ ] **Banner / Callout** — `Callout` already ships; the `Banner` audit entry describes a `tone="banner"` variant (page-level message strip). Decision required: add `tone="banner"` to Callout and mark Banner as a variant, or keep as a separate component. Low-risk lean: add the tone prop.

---

### Phase 1 — Quick-win story additions (no new components, stories only)

These components already exist. Just need a Storybook story + registry/audit update.

- [ ] **Link** — `apps/web/src/components/atoms/Link.jsx` → `Patterns/Link` story
  - Internal (SPA), external (new tab), no-URL (plain span) states
  - CSS: `atoms/Link.module.css` — confirm tokens, add dark mode variant to story
- [ ] **Divider** — `DividerBlock` in `portableTextComponents.jsx` → add to an existing PT story or standalone `Patterns/Divider`
  - Default and subtle variants
- [ ] **Anchor nav** — `SidebarNav` already has a story; confirm `PageSidebar` scrollspy is covered under `Patterns/PageSidebar`. If the TOC/anchor link pattern needs its own story, add `Patterns/AnchorNav` as a lightweight documentation story.
- [ ] **Swatch dark mode** — `Swatch` story exists at `Components/Swatch` but dark mode is marked ⚠️ untested. Add `dark-pink-moon` variant to the existing story.
- [ ] **Truncate** — card excerpt clamp; confirm it's a CSS utility (`line-clamp`) rather than a component. If purely CSS, document as a token/utility in a `Foundations/Utilities` story (or add to existing token reference). If it has a wrapper component, add a story.

### Phase 2 — Carousel + Gallery DS codification

These ship in the page builder as full section renderers but have no DS primitive story.

- [ ] **Carousel** — `ImageGallery.stories.jsx` already has a `Carousel` story variant. Confirm it is tagged with autodocs and covers all states. If it's only a renderer story (via PageSections), extract a standalone `Patterns/Carousel` story for the DS primitive.
- [ ] **Gallery** — same audit: confirm `Patterns/ImageGallery` story covers Grid, Carousel, and Single Image layouts with dark mode.
- [ ] **Page control** (Carousel indicators) — confirm the dot/indicator row in Carousel is covered under the Carousel story, or add a dedicated state.

### Phase 3 — Tile call-site migration to Card + Metric

8 active call-sites use the deprecated `Tile` component. All use `label` + `value/title` + optional `href`, `bar`, `loading`, `unit`, `sub`, `meta`, `titleSize`, `labelColor`.

**Inventory of callers (pre-execution — must verify line numbers):**

| File | Props used | Replacement pattern |
|------|-----------|-------------------|
| `TrustReportSection.jsx` | label, title, body, meta, href, labelColor, titleSize, loading | Card variant=listing? Or Tile stays for href+loading? |
| `GovernancePage.jsx` | label, value, href | `<a>` wrapping `<StatCard>`? |
| `DesignSystemPage.jsx` | label, value, body, href, titleSize | Same |
| `MonorepoPage.jsx` | label, value | StatCard (simple, no href) |
| `SchemaERD.jsx` | label, value | StatCard (simple) |
| `CardBuilderSection.jsx` | DS import | update import |
| `GridDevPage.jsx` | label, value, titleSize | StatCard (dev page only) |
| `Grid.stories.tsx` | label, value | StatCard in story |

**Decision gate (required before Phase 3 execution):**
- StatCard covers: label, value, sub, body, chip — NO href, no bar, no loading
- Tiles with `href` prop → need a `Card` wrapper with a Link, OR a new `href` prop on StatCard
- Tiles with `bar` prop → need a proper `Meter` + `StatCard` composition
- Resolve the API gap before migrating call-sites

If StatCard needs an `href` prop, add it in the same commit as the first migration.

- [ ] Confirm StatCard API decision (extend with `href`? or use Card+Link wrapper?)
- [ ] Migrate simple call-sites (MonorepoPage, SchemaERD, GridDevPage)
- [ ] Migrate href-only call-sites (GovernancePage simple metric tiles)
- [ ] Migrate complex call-sites (TrustReportSection, GovernancePage content preview tiles)
- [ ] Delete `apps/web/src/design-system/components/tile/Tile.jsx` + `Tile.module.css` + `Tile.stories.tsx` (move story to Legacy/ until deletion confirmed clean)
- [ ] Remove Tile from design-system barrel export
- [ ] Registry: Tile row → `retired`

### Phase 4 — DataTable deprecation cleanup

- [ ] Grep all DataTable callers — confirm zero after migration
- [ ] If callers remain: migrate each to `<Table tone="...">` directly
- [ ] Delete `apps/web/src/design-system/components/data-table/DataTable.jsx`
- [ ] Delete `DataTable.module.css`, `DataTable.stories.tsx`
- [ ] Remove from DS barrel export
- [ ] Registry: DataTable row → `retired`

### Phase 5 — FilterBar migration

- [ ] Confirm `packages/design-system/src/components/FilterBar/` is the canonical version
- [ ] Compare API: `apps/web/src/design-system/components/FilterBar/FilterBar.jsx` vs DS package
- [ ] Migrate all web callers to import from DS package directly (via `apps/web/src/design-system/index.js` re-export)
- [ ] Delete `apps/web/src/design-system/components/FilterBar/FilterBar.jsx`
- [ ] Registry: FilterBar entry updated — remove "pending-migration" note

### Phase 6 — Audit + registry close-out

- [ ] Update `component-audit.json` — flip all newly codified components to `present`
- [ ] Regenerate `component-audit.csv`
- [ ] Update `component-registry.md` — new rows for Link + Divider, Tile/DataTable/FilterBar retirement
- [ ] Report final audit counts

---

## Non-Goals

- **Toolbar** — resolved: FilterStrip renamed to Toolbar, story moved to `Patterns/Toolbar` (done in SUG-155 pre-work, 2026-06-05).
- **Panel, Overflow menu** — "To codify" entries with overloaded or contested naming. Deferred pending disambiguation.
- **Switch, Tag/Chip, Banner** — tracked in Phase 0 above as DECISION NEEDED; execution blocked until decisions made.
- **New DS primitives** — this epic is codification of existing implementations only. No new components built from scratch.
- **Mobile responsive sidebar** — scoped to SUG-153.
- **Studio schema changes** — none in scope.

---

## Technical Constraints

**Monorepo / tooling**
- All story files in `apps/web/src/` use the web adapter layer; `packages/design-system/src/` stories use DS primitives
- `pnpm validate:tokens --strict-colors` zero violations before every CSS commit
- Tile/DataTable deletion: run `pnpm build` after each deletion to confirm no broken imports

**Token-first rule**
- Any new CSS in Link atom story or Divider story must use `--st-*` tokens only
- Dark mode treatment for every new story: verify under `dark-pink-moon` in Storybook before close-out

**FilterBar API**
- Before migrating callers, diff the two FilterBar implementations. If the DS version has an API gap (missing props callers rely on), close the gap in DS before deleting the web copy.

---

## Files to Modify

**Phase 1**
- `apps/web/src/components/atoms/Link.jsx` — no change expected, story only
- `apps/web/src/components/atoms/Link.module.css` — review tokens
- `apps/web/src/components/atoms/Link.stories.tsx` — CREATE
- Divider story location TBD (inline in portableTextComponents or standalone)
- `packages/design-system/src/components/Swatch/Swatch.stories.tsx` — add dark mode story

**Phase 2**
- `apps/web/src/components/ImageGallery.stories.jsx` — verify/expand
- Carousel/PageControl story additions

**Phase 3**
- `apps/web/src/components/StatCard.jsx` — possibly add `href` prop
- `apps/web/src/components/StatCard.module.css` — if href added
- `apps/web/src/components/TrustReportSection.jsx` — migrate Tile usage
- `apps/web/src/pages/platform/GovernancePage.jsx` — migrate Tile usage
- `apps/web/src/pages/platform/DesignSystemPage.jsx` — migrate Tile usage
- `apps/web/src/pages/platform/MonorepoPage.jsx` — migrate Tile usage
- `apps/web/src/components/SchemaERD/SchemaERD.jsx` — migrate Tile usage
- `apps/web/src/components/CardBuilderSection.jsx` — update import
- `apps/web/src/pages/dev/GridDevPage.jsx` — migrate Tile usage
- `apps/web/src/design-system/components/grid/Grid.stories.tsx` — update import
- `apps/web/src/design-system/components/tile/Tile.jsx` — DELETE
- `apps/web/src/design-system/components/tile/Tile.module.css` — DELETE
- `apps/web/src/design-system/components/tile/Tile.stories.tsx` — DELETE
- `apps/web/src/design-system/index.js` — remove Tile export

**Phase 4**
- `apps/web/src/design-system/components/data-table/` — DELETE directory
- `apps/web/src/design-system/index.js` — remove DataTable export

**Phase 5**
- `apps/web/src/design-system/components/FilterBar/FilterBar.jsx` — DELETE (after migration)
- `apps/web/src/design-system/index.js` — update FilterBar import path

**Phase 6**
- `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/component-audit.json`
- `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/component-audit.csv`
- `docs/conventions/component-registry.md`

---

## Acceptance Criteria

- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] `pnpm build` clean after each deletion phase
- [ ] All 10 audit entries: either `present` (has story) or explicitly documented as deferred (Panel, Toolbar, Overflow menu)
- [ ] `import.*Tile` grep returns zero results outside of `Tile.jsx` itself (or zero if deleted)
- [ ] `import.*DataTable` grep returns zero results outside of deleted directory
- [ ] Storybook: every new story renders without errors in both `light-pink-moon` and `dark-pink-moon`
- [ ] Swatch dark mode: `⚠️ untested` → verified in registry
- [ ] Link story covers: internal SPA link, external (new tab), no-href (span fallback)
- [ ] Audit JSON: `pinkMoonStatusKey` updated for all codified entries; counts match

---

## Post-Epic Close-Out

1. Visual QA gate — spot-check Carousel/Gallery stories + Tile migration pages in browser
2. Chromatic: deferred until June 14 quota reset — annotate `<!-- Chromatic: pending — deferred 2026-06-14 -->`
3. Move `docs/backlog/SUG-155-ds-codification-sprint.md` → `docs/shipped/`
4. `/mini-release SUG-155`
5. Transition SUG-155 to Done in Linear
