---
**Epic:** SUG-118 — Platform Stats Page II — platform-wide section heading + chip refresh
**Linear Issue:** [SUG-118](https://linear.app/sugartown/issue/SUG-118/platform-stats-page-ii-governance-page-design-refresh)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-118 — Platform Stats Page II — platform-wide section heading + chip refresh

Implement Claude design-handoff tweaks across all hardcoded platform pages: rule-dot Chip (project dot color from Sanity `colorHex`, not tokens), sticky LaneHeader, StatGrid shared chassis, RoadmapTable thead, `useStickyState` hook, and `<SectionLabel>` adoption on every section of every platform sub-page.

## Background

The `/platform/*` pages shipped in SUG-111/SUG-112 with functional but rough DS surfaces — hand-rolled section headers, pink-filled label pills, custom stats markup, and a roadmap table with no column headers. A design pass (Claude handoff package, 2026-05-15: `Platform Stats Page II.zip`) specifies tweaks originally scoped to `/platform/governance` but the same pattern applies to all hardcoded platform sub-pages: GovernancePage, MonorepoPage, CmsPage, DesignSystemPage, DesignSystemRegistryPage.

The four core tweaks:
1. **Chip system** — replace pink-filled pills with a rule-dot chassis; project dot color comes from Sanity `project.colorHex` as an inline CSS custom property (no per-project tokens).
2. **Section heading hierarchy** — adopt `<SectionLabel level="h3">` at every section of every platform page, per the approved content table below.
3. **Artifacts + stats grid** — `<StatGrid>` shared chassis replaces inline stats markup and artifact card grids.
4. **Sticky lane header + sticky column header** — `useStickyState` (IntersectionObserver) for GovernancePage roadmap only; other pages inherit `<SectionLabel>` and `<StatGrid>` but not the sticky lane pattern.

Additionally, the roadmap table `Labels` column is renamed `Projects` and populated from Linear's project field (aligned with `product` in Sanity).

**Reference implementations:** local only at `/tmp/platform-stats-ii/design_handoff_governance_tweaks/`. Interactive prototype: `Platform Stats Page Tweaks.html`.

## Objective

After this epic, every hardcoded platform sub-page uses `<SectionLabel level="h3">` for all sections per the approved content table, `<Chip>` renders the rule-dot chassis with project color pulled directly from Sanity `colorHex`, and GovernancePage additionally gets `<LaneHeader>`, `<StatGrid>`, and sticky thead on `<RoadmapTable>`. New DS components are added to `packages/design-system` with Storybook stories.

Layers touched: DS components, DS tokens (additive: priority tokens only), web pages (all platform sub-pages), Linear stats collector, Storybook stories.

## Approved SectionLabel Content

**Locked — do not derive or invent at activation.** Live values read from `stats.linearRoadmap`, `stats.ds.tokens.total`, `stats.ds.stories`. Static values are hardcoded strings exactly as written.

| Page | §No | `name` | `title` | `kicker` |
|------|-----|--------|---------|----------|
| Governance | §01 | ROADMAP | Linear epics, in flight and on deck | `{inProgress + backlog} epics` (live) |
| Governance | §02 | RECENT RELEASES | Latest shipped versions | Last 5 |
| Governance | §03 | RELEASE PROCESS | How a change reaches production | Gate model |
| Governance | §04 | ARTIFACTS | Briefs, prompts, conventions | `{N} documents` (count artifact cards) |
| Monorepo | §01 | ARCHITECTURE | Workspace topology | 4 packages |
| Monorepo | §02 | BUILD PIPELINE | How turbo moves work | *(kicker omitted)* |
| Monorepo | §03 | ARTIFACTS | Docs and configs | `{N} documents` (count artifact cards) |
| CMS | §01 | SCHEMA ERD | Document types and their relations | Interactive explorer |
| CMS | §02 | CONTENT MODEL | Visual architecture overview | FigJam |
| CMS | §03 | RELATIONSHIPS | How documents link to taxonomy | Document → taxonomy |
| CMS | §04 | ARTIFACTS | PRDs, conventions, decisions | `{N} documents` (count artifact cards) |
| Design System | §01 | TOKEN ARCHITECTURE | Base → semantic → component | `{stats.ds.tokens.total} tokens` (live) |
| Design System | §02 | COMPONENT REGISTRY | Primitives and adapters | `{N} of {total} shown` (live) |
| Design System | §03 | ARCHITECTURE | Component layer diagram | FigJam |
| Design System | §04 | STORYBOOK | Live component catalogue | `{stats.ds.stories} stories` (live) |
| Design System | §05 | ARTIFACTS | Token pipeline, conventions | `{N} documents` (count artifact cards) |
| DS Registry | — | hold | hold | hold — page is a stub, no changes |

## Scope

### Phase 1 — Tokens + DS primitives

- [ ] Add priority swatch tokens: `pri-high → {color.pink}`, `pri-med → {color.amber-450}`, `pri-low → {color.softgrey-400}` — tokens layer
- [ ] Add sticky-shadow composites to `theme.pink-moon.css` (hand-authored, not generated): `--st-shadow-thead-stuck`, `--st-shadow-subhead-pinned` — tokens layer
- [ ] Refactor `<Chip>`: transparent fill, `1px solid var(--st-color-rule-accent)` border, 6 px circular dot, IBM Plex Mono 10.5px/600/0.08em/uppercase. Single dot-color mode: `dotColor` prop (hex string from Sanity `project.colorHex`) → `style={{ '--chip-dot': dotColor }}`, CSS uses `var(--chip-dot)`. Old `status`/`variant`/`kind` props replaced — find-replace all call sites at activation — DS layer
- [ ] Add `<PriorityChip level="high|medium|low|none">` — same chassis, no border, 8 px square swatch — DS layer
- [ ] Add `<LaneHeader label count>` — sticky `top: 0; z-index: 4`; pinned state: 2 px pink lead bar, frosted backdrop, `PINNED` badge; `useStickyState` wired internally — DS layer
- [ ] Add `useStickyState(ref, options?)` hook — 0-height sentinel + IntersectionObserver, returns `'default' | 'pinned'` — DS layer
- [ ] Add `<StatGrid columns={3|4}>` + `<StatGridCell label value signal? href? foot?>` — ruled cell chassis, `foot` slot for artifact mode — DS layer
- [ ] Add `level?: 'h2'|'h3'|'h4'` prop to `<SectionLabel>` defaulting to `h2` — DS layer (no visual change)

### Phase 2 — RoadmapTable + data layer

- [ ] Update `linear.js`: add `projectName` and `projectColor` fields per issue from Linear's project relation — tooling layer
- [ ] Update `RoadmapTable` data contract: replace `labels: string[]` with `projects: { name: string; colorHex: string }[]`; render `<Chip dotColor={colorHex}>` per project — frontend layer
- [ ] Add `<thead>` to `<RoadmapTable>`: `ID · Title · Status · Priority · Projects`; `position: sticky; top: 38px`; `data-thead-stuck` driven by `useStickyState` with `rootMargin: "-38px 0px 0px 0px"` — frontend layer

### Phase 3 — SectionLabel adoption across all platform pages

Activation audit: read each page file before editing to confirm current section structure and available live data.

- [ ] **GovernancePage** — apply approved table; also replace stats strip → `<StatGrid>`, artifacts → `<StatGrid foot>`, lane divs → `<LaneHeader>`, pills → `<Chip dotColor>` / `<PriorityChip>`, wrap tables in scroll container — frontend layer
- [ ] **MonorepoPage** — apply approved table (`<SectionLabel level="h3">`, §02 kicker omitted) — frontend layer
- [ ] **CmsPage** — apply approved table (all kickers static) — frontend layer
- [ ] **DesignSystemPage** — apply approved table (live stats from `stats.ds`) — frontend layer
- [ ] **DesignSystemRegistryPage** — no changes this epic — frontend layer

### Phase 4 — Storybook + visual QA

- [ ] Update `Chip.stories.tsx`: project `dotColor` variants using real `colorHex` values from Sanity projects (#ff247d Pink Moon, #2bd4aa Mini-repo, #b8e000 Sugartown CMS, etc.) + chips-in-table story — Storybook layer
- [ ] Add `PriorityChip.stories.tsx`: 4-level grid + in-table example — Storybook layer
- [ ] Add `LaneHeader.stories.tsx`: default + pinned states, `min-height: 200vh` scroll story — Storybook layer
- [ ] Add `StatGrid.stories.tsx`: 4-col stats variant + 4-col artifacts variant with `foot` — Storybook layer
- [ ] Add `RoadmapTable.stories.tsx`: stuck thead variant — Storybook layer
- [ ] Visual QA against prototype for GovernancePage in light + dark Pink Moon themes — frontend layer
- [ ] Spot-check all other platform pages for `<SectionLabel>` rendering and kicker data in both themes — frontend layer

## Phases

**Phase 1** — Tokens + DS primitives. Chip refactor + new components. No page changes yet.

**Phase 2** — RoadmapTable thead + Linear projects data.

**Phase 3** — `<SectionLabel>` adoption across all platform pages + full GovernancePage component swap.

**Phase 4** — Storybook + visual QA. Chromatic required before close-out.

## Acceptance criteria

- [ ] `<Chip dotColor="#ff247d">` renders transparent fill, rule-accent border, 6 px dot in the passed hex — no token involved
- [ ] `<PriorityChip level="high">` renders HIGH + pink swatch, no border; `level="none"` renders dashed outline
- [ ] `<LaneHeader>` pins on scroll: 2 px pink lead bar + `PINNED` badge within 200 ms; only one pinned at a time
- [ ] Roadmap `<thead>` sticky at `top: 38px`; stuck shadow appears when rows scroll beneath
- [ ] Roadmap `Projects` column renders `<Chip dotColor>` from Linear project color (not labels, not `proj-*` tokens)
- [ ] Every section on every platform sub-page has a `<SectionLabel level="h3">` per the approved content table (DS Registry and Monorepo §02 are explicit exceptions)
- [ ] `pnpm validate:tokens` — zero errors
- [ ] `pnpm validate:tokens --strict-colors` — zero hardcoded colors
- [ ] Chromatic: no unintended regressions in light or dark Pink Moon

## Technical notes

- **Phase 0 mock gate:** `Platform Stats Page Tweaks.html` (local: `/tmp/platform-stats-ii/design_handoff_governance_tweaks/`) is the approved Phase 0 mock for GovernancePage. For the other platform pages, the spec is `<SectionLabel level="h3">` adoption only — no additional mock required since no new layout is introduced.
- **Project chip — no tokens:** project dot color uses `style={{ '--chip-dot': colorHex }}` + CSS `var(--chip-dot)`. The `colorHex` field comes from the Sanity `project` document via `linear.js` (or a project lookup). New projects in Studio get their color automatically — no token or code change needed.
- **`--chip-dot` CSS variable scope:** declare it on the chip element itself (`style` prop), not a parent. This keeps the override local and doesn't bleed into sibling chips.
- **Chip breaking change:** `status`/`variant` → `kind` or `dotColor`. Activation audit: `grep -r '<Chip' apps/web/src packages/design-system/src` to find all call sites.
- **Sticky scroll container:** `position: sticky` requires nearest scrollable ancestor to be `overflow: auto/scroll`. GovernancePage currently has no explicit scroll container — add one wrapping each lane's table. Other platform pages: verify at activation whether sticky is needed (probably not — `<SectionLabel>` is not sticky).
- **`useStickyState` cleanup:** hook inserts a 0-height sentinel `<div>` before the sticky element; remove on unmount. Reference: `/tmp/platform-stats-ii/design_handoff_governance_tweaks/components/useStickyState.example.ts`.
- **Linear `projectName`/`projectColor` field:** the Linear GraphQL issues query needs a `project { name color }` sub-selection. Confirm the field name at activation: `grep -r 'nodes {' apps/web/scripts/stats/linear.js`.
- **Activation audits (run before touching any file):**
  - `grep -r '<Chip' apps/web/src packages/design-system/src` — Chip call sites
  - Read each platform page file: `GovernancePage`, `MonorepoPage`, `CmsPage`, `DesignSystemPage`, `DesignSystemRegistryPage`
  - Read `apps/web/scripts/stats/linear.js` — current issues query shape
  - Read `apps/web/src/components/RoadmapTable.jsx` — current data contract
- **Model recommendation:** `/model sonnet` — component + page work, no schema changes.

### New token block (priority only — no chip-dot tokens)

Chip dot color comes from Sanity `project.colorHex` inline — no tokens needed.

Add to `tokens/source/tokens.json`:
```json
"pri-high": "{color.pink}",
"pri-med":  "{color.amber-450}",
"pri-low":  "{color.softgrey-400}"
```

Add to `theme.pink-moon.css` (hand-authored):
```css
--st-shadow-thead-stuck:
  inset 0 -1px 0 var(--st-color-ink),
  0 8px 12px -8px rgba(13, 18, 38, 0.30);

--st-shadow-subhead-pinned:
  0 1px 0 var(--st-color-rule-accent),
  0 8px 16px -10px rgba(13, 18, 38, 0.10);
```

## Non-Goals

- Chip-dot tokens of any kind (`proj-*`, taxonomy `chip-dot-*`) — all chip dot colors come from Sanity `project.colorHex` inline via `--chip-dot` CSS var.
- `defineProjectChip()` builder — deferred post-launch.
- Linear deep-links from SUG-IDs in the roadmap table — next iteration.
- Empty-state for the In Progress lane — deferred.
- Any page outside `/platform/*` — strictly platform sub-pages only.
- Sanity schema changes — the `product`/`colorHex` fields already exist on the `project` doc type.

## Related

- **Linear:** [SUG-118](https://linear.app/sugartown/issue/SUG-118/platform-stats-page-ii-governance-page-design-refresh)
- **Design reference (local only):** `/tmp/platform-stats-ii/design_handoff_governance_tweaks/Platform Stats Page Tweaks.html`
- **Reference implementations (local only):** `/tmp/platform-stats-ii/design_handoff_governance_tweaks/components/`
- **Parent platform epic:** SUG-111 (Platform IA Phase II) — shipped v0.23.22
- **Epic template:** `docs/epic-template.md`
