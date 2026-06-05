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

- [x] All 10 "To codify" audit entries reviewed — confirm story location (DS package vs web adapter vs `.storybook/stories/`)
- [x] Tile call-site inventory confirmed: 8 files enumerated with their specific Tile prop usage
- [x] DataTable caller inventory: grep all files that import DataTable — confirm zero after migration
- [x] FilterBar: confirm DS package FilterBar is API-compatible with web-only FilterBar.jsx before migrating callers
- [x] Dark mode treatment confirmed for each new story

---

## Scope

### Phase 0 — Diverges renames (code name → canonical name)

These components ship under a wrong or use-case name. Rename files, update imports, move Storybook story, flip audit entry `diverges` → `present`.

- [x] **Drawer** (MobileNav → Drawer) — `MobileNav.jsx/.module.css/.stories.tsx` → `Drawer.*`; story `Components/MobileNav` → `Components/Drawer`; update Header import + any other callers; audit: `pinkMoonName` already set to MobileNav — flip to `Drawer`, status `diverges` → `present`
- [x] **Switch** — `ThemeToggle` is an IconButton instance (icon-only, use-case-named). No generic Switch primitive warranted at current scope. Audit: `wont`. No code change needed.
- [x] **Tag / Chip** — `Chip` is canonical. Three behavioral modes on one primitive: `variant="status"` (Badge — non-interactive status dot), `variant="tag"` (Tag — categorisation label, optionally linked), interactive without variant (Chip — selected filter/input token). Resolved against UX Drill 01 taxonomy (Badge/Tag/Chip article). Tag audit entry → `synonym`. No new component; no call-site changes needed.
- [x] **Banner / Callout** — Added `variant="banner"` to web adapter Callout. Single-row flex strip, `role="status"`, no label column. Banner audit entry updated: `present`, `pinkMoonName: "Callout (variant=\"banner\")"`. Story: Components/Callout — Banner, BannerNoTitle, BannerDark. Registry updated. SUG-155.
- [x] **SegmentedControl / IndexGroup + IndexCell** — Option (a) attempted; naming collision found: `SegmentedControl` already exists as a real, different component (pill/icon radio toggle, radiogroup semantics, used by CwvSnapshot). Decision: **keep `IndexGroup`/`IndexCell` names**. `SegmentedControl` and `IndexGroup` serve genuinely different roles (controlled radio toggle vs group container for indexed filter cells). Audit: file `SegmentedControl` (pill/icon toggle) as `present`; file `IndexGroup`/`IndexCell` as `present` under their current names.

---

### Phase 1 — Quick-win story additions (no new components, stories only)

These components already exist. Just need a Storybook story + registry/audit update.

- [x] **Link** — story at `Components/Link`. Internal (MemoryRouter), external (new tab), no-URL (span fallback), dark mode states.
- [x] **Divider** — story at `Components/Divider`. Default, Subtle, DarkMode states. Imports `DividerBlock` from `portableTextComponents`.
- [x] **Anchor nav** — resolved as `synonym`; Link instances cover the use case. No standalone story needed.
- [x] **Swatch dark mode** — `DarkMode` story added to `Components/Swatch`. Verified.
- [x] **Truncate** — resolved as `wont`; CSS `line-clamp` utility only, no component wrapper.

### Phase 2 — Carousel + Gallery DS codification

These ship in the page builder as full section renderers but have no DS primitive story.

- [x] **Carousel** — `Patterns/ImageGallery` covers carousel layout. `CarouselDarkMode` story added.
- [x] **Gallery** — `Patterns/ImageGallery` covers Grid, Carousel, and Single Image. Dark mode verified.
- [x] **Page control** — dot indicator row covered under Carousel story. Audit: `present`.

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

- [x] Confirm StatCard API decision — extended: `href`, `titleSize`, `labelColor`, `unit`, `foot`, `bodyClamp`, `loading`.
- [x] Migrate simple call-sites (MonorepoPage, SchemaERD, GridDevPage) → StatCard
- [x] Migrate href-only call-sites (GovernancePage simple metric tiles) → StatCard
- [x] Migrate complex call-sites (DesignSystemPage non-bar tiles, CardBuilderSection, Grid.stories) → StatCard
- [ ] **DEFERRED — Tile bar callers** — `TrustReportSection.jsx` and `DesignSystemPage.jsx` (one tile) retain `<Tile bar>` pending a Meter composition epic. Tile stays in codebase until those callers migrate. Delete blocked.
- [ ] Delete `apps/web/src/design-system/components/tile/Tile.jsx` + `Tile.module.css` + `Tile.stories.tsx` — blocked on bar-caller migration
- [ ] Remove Tile from design-system barrel export — blocked on deletion
- [ ] Registry: Tile row → `retired` — blocked on deletion

### Phase 4 — DataTable deprecation cleanup

- [x] Grep all DataTable callers — zero callers confirmed
- [x] Delete `apps/web/src/design-system/components/data-table/` — directory gone
- [x] Remove from DS barrel export — done
- [x] Registry: DataTable row → `Deleted (SUG-155)`

### Phase 5 — FilterBar migration

- [x] Confirmed: web adapter `FilterBar.jsx` is a pure mirror of DS package — no API gap. No caller migration needed.
- [x] Registry: "pending-migration" note removed.

### Phase 6 — Audit + registry close-out

- [x] Update `component-audit.json` — Link, Divider, Carousel, Gallery, PageControl, Tag (synonym), Banner flipped to `present`/`synonym`/`wont`
- [ ] Regenerate `component-audit.csv` (deferred — HTML audit tool generates this; not blocking)
- [x] Update `component-registry.md` — Link, Divider rows added; Callout, DataTable, FilterBar notes updated
- [x] **Final audit count** — 106 total: `present` 43, `missing` 54 (not yet built — out of scope), `synonym` 3, `deprecated` 2, `wont` 2, `codify` 2 (Panel + Overflow menu — deferred per Non-Goals). All original "to codify" entries resolved.

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

- [x] `pnpm validate:tokens --strict-colors` zero violations
- [x] `pnpm build` clean after each deletion phase
- [x] All original "to codify" audit entries: `present`/`synonym`/`wont` or explicitly deferred (Panel, Overflow menu)
- [ ] `import.*Tile` grep returns zero non-bar callers (**2 bar callers remain — TrustReportSection, DesignSystemPage — deferred to Meter epic**)
- [x] `import.*DataTable` grep returns zero results — confirmed
- [x] Storybook: new stories added with dark-pink-moon variants
- [x] Swatch dark mode: `⚠️ untested` → `✅ verified` in registry
- [x] Link story covers: internal SPA link, external (new tab), no-href (span fallback)
- [x] Audit JSON: `pinkMoonStatusKey` updated for all newly codified entries

---

## Post-Epic Close-Out

1. Visual QA gate — spot-check Carousel/Gallery stories + Tile migration pages in browser
2. Chromatic: deferred until June 14 quota reset — annotate `<!-- Chromatic: pending — deferred 2026-06-14 -->`
3. Move `docs/backlog/SUG-155-ds-codification-sprint.md` → `docs/shipped/`
4. `/mini-release SUG-155`
5. Transition SUG-155 to Done in Linear
