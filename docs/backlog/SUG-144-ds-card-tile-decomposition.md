**Linear Issue:** [SUG-144](https://linear.app/sugartown/issue/SUG-144/ds-epic-1-card-tile-decomposition-extract-metric-meter-skeleton)

## EPIC SUG-144: DS Epic 1 — Card / Tile decomposition

**Source:** Component Naming Audit handoff — `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/docs/card-tile-decomposition.md`

---

## Model & Mode

Use `opusplan` for planning phases. Sonnet executes from Files to Modify onward.

---

## Pre-Execution Completeness Gate

- [ ] Interaction surface audit — search all 4 layers for existing Card, Tile, Metric, Meter, Skeleton, DescriptionList, Avatar implementations before writing anything
- [ ] Audit rows confirmed against live registry (`docs/conventions/component-registry.md`)
- [ ] Tile current call-sites catalogued (`grep -r "Tile" packages/design-system apps/web/src/design-system`)
- [ ] statTileSection current document count confirmed via GROQ before migration
- [ ] Token audit: all new component CSS uses `--st-*` tokens only; `pnpm validate:tokens --strict-colors` green
- [ ] Dark mode treatment documented for each primitive (Card, Metric, Meter, Skeleton, DescriptionList, Avatar)
- [ ] Web adapter sync scoped — for each DS primitive created, matching web adapter listed in Files to Modify
- [ ] Atomic Reuse Gate — confirm no existing equivalent for Metric, Meter, Skeleton, DescriptionList, Avatar across all 5 layers

---

## Context

The audit (`component-audit.json`) identifies 8 actionable rows in the Card/Tile cluster:

| Component | Audit status | Action |
|-----------|-------------|--------|
| Card | In system (overloaded) | Re-codify as pure container + slots |
| Tile | Diverges | Retire into Card variant; extract primitives |
| Metric | To codify | Extract from Tile stories |
| Meter | To codify | Extract from Tile stories |
| Skeleton | To codify | Extract from Tile stories |
| DescriptionList | Not yet | Codify — the MetadataCard field grid |
| Avatar | To codify | Used on person pages; not in registry |
| CardGrid | In system | Composite pattern — grid of Card (existing) |

Current file locations (verify before Phase 0):
- DS Card: `packages/design-system/src/components/Card/`
- DS Tile: `packages/design-system/src/components/Tile/` (if exists)
- Web adapter Card: `apps/web/src/design-system/components/Card/`
- ContentCard: `apps/web/src/components/ContentCard.jsx`
- MetadataCard: `apps/web/src/components/MetadataCard.jsx`
- Studio schema: `apps/studio/schemas/sections/statTileSection.ts` (if exists)

---

## Objective

After this epic: `Card` is a pure container with `media`, `header`, `body`, and `footer` slots and three variants (`elevated`, `listing`, `accent`). `Tile` is deleted. `Metric`, `Meter`, `Skeleton`, `DescriptionList`, and `Avatar` exist as codified DS primitives with Storybook stories and registry rows. `ContentCard` and `MetadataCard` contain zero container/box CSS — they compose `Card`. `StatCard` replaces the old Tile/statTile pattern. `statTileSection` is renamed/migrated to `cardSection`. No data layer, query layer, or route changes.

---

## Doc Type Coverage Audit

Only the Studio schema section is in scope (renaming `statTileSection`). No new fields on content doc types.

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | statTileSection → cardSection migration |
| `article` | Yes | statTileSection → cardSection migration |
| `caseStudy` | Yes | statTileSection → cardSection migration |
| `node` | Yes | statTileSection → cardSection migration |
| `archivePage` | No | Does not render sections[] |

---

## Schema Field Proposal

No new fields. The only schema change is renaming the `statTileSection` type to `cardSection` (or folding into `cardBuilderSection` — confirm at Phase 4).

---

## Scope

### Phase 0 — Extract leaf primitives (unblocks everything)

- [ ] `packages/design-system/src/components/Metric/` — value + label + optional trend indicator. Story: `Primitives/Metric`. Registry row.
- [ ] `packages/design-system/src/components/Meter/` — `role="meter"`, value-in-range bar. Confirm vs `Progress` (DECISION-NEEDED: are they the same primitive?). Story + registry.
- [ ] `packages/design-system/src/components/Skeleton/` — loading shapes (text / block / circle variants). Story + registry.
- [ ] `packages/design-system/src/components/DescriptionList/` — `<dl>` key/value grid (what MetadataCard renders). Story + registry.
- [ ] `packages/design-system/src/components/Avatar/` — image/initials, size variants. Story + registry.
- [ ] Web adapter for each: `apps/web/src/design-system/components/{Name}/`
- [ ] `pnpm validate:tokens --strict-colors` green for each new component

### Phase 1 — Re-codify Card primitive

- [ ] `packages/design-system/src/components/Card/` reduced to container + `media` / `header` / `body` / `footer` slots
- [ ] Variants as props: `elevated | listing | accent`
- [ ] Remove any inlined ledger-footer content; expose `footer` slot only
- [ ] Stories: `Primitives/Card` — base, listing, accent, with-media, with-footer
- [ ] Web adapter updated (no new story rule applies — just sync the JSX/CSS)

### Phase 2 — Fold Tile in, build StatCard

- [ ] `apps/web/src/components/StatCard.jsx` — `Card( Metric + Meter )`; story `Patterns/StatCard`
- [ ] Point `statTileSection` renderer in `PageSections.jsx` at `StatCard`
- [ ] Deprecate `packages/design-system/src/components/Tile/` (keep export with console.warn for one minor, then delete)
- [ ] Loading state: `Card( Skeleton )` — retire Tile's inline loading story

### Phase 3 — Recompose smooshed patterns

- [ ] `MetadataCard` → `Card( DescriptionList + Chip )`; delete its private container markup
- [ ] `ContentCard` → assert binding-only: `query → Card( Media + Chip + heading + excerpt )`; move any owned UI to Card slots
- [ ] Listing / "ListView" → `CardGrid` with `Card variant="listing"`; remove any bespoke list-card component

### Phase 4 — Schema + content

- [ ] Rename `statTileSection` → `cardSection` in Studio (or fold into `cardBuilderSection` — confirm)
- [ ] Migration script: update existing documents
- [ ] Update `PageSections.jsx` switch mapping

### Phase 5 — Close out

- [ ] Registry rows added/updated for all new primitives + patterns
- [ ] Audit rows flipped: Metric/Meter/Skeleton/DescriptionList/Avatar → In system; Tile → retired
- [ ] Delete deprecated `Tile` export

---

## Query Layer Checklist

`statTileSection` → `cardSection` rename requires updating section projections in all slug queries.

- [ ] `pageBySlugQuery` — update `_type == "statTileSection"` → `"cardSection"`
- [ ] `articleBySlugQuery` — same
- [ ] `caseStudyBySlugQuery` — same
- [ ] `nodeBySlugQuery` — same
- [ ] Archive queries — not affected (card-level only)

---

## Non-Goals

- `imageGallery` / carousel — tracked in SUG-98
- `Carousel`, `PageControl`, `Gallery` — Epic 4 (stragglers)
- `Toolbar` extraction from FilterBar — Epic 5
- No schema changes beyond `statTileSection` rename
- No new routes or page templates

---

## Technical Constraints

See CLAUDE.md §DS Component Authoring for full token rules. Key constraints:

- Every new DS primitive: tokens only; no raw hex/rgba. `pnpm validate:tokens --strict-colors` must pass.
- Web adapter sync is mandatory for each new DS component: JSX adapter + CSS module copy + index export.
- `apps/web` does NOT import from `@sugartown/design-system` — all adapters live in `apps/web/src/design-system/`.
- statTileSection migration: run GROQ count before writing the script. Follow `scripts/migrate/lib.js` pattern (dry-run default, `--execute` flag).
- `nanoid` fallback pattern required if migration script uses it.

**DECISION-NEEDED items (surface before executing that phase):**
1. Meter vs Progress — same primitive or distinct? Check audit note.
2. statTileSection → rename to `cardSection` or fold into `cardBuilderSection`?

---

## Migration Script Constraints

**Target doc count (run before writing script):**
```groq
count(*[_type in ["page","article","caseStudy","node"] && "statTileSection" in sections[]._type])
```
Expected count: `___` (fill in pre-execution)

Skip condition: documents where `sections[]` does not contain `statTileSection` — correctly skipped.
Idempotency: re-running after rename finds zero `statTileSection` entries → 0 patches.

---

## Files to Modify

**DS primitives (create)**
- `packages/design-system/src/components/Metric/Metric.tsx` — CREATE
- `packages/design-system/src/components/Metric/Metric.module.css` — CREATE
- `packages/design-system/src/components/Metric/index.ts` — CREATE
- `packages/design-system/src/components/Meter/Meter.tsx` — CREATE
- `packages/design-system/src/components/Meter/Meter.module.css` — CREATE
- `packages/design-system/src/components/Meter/index.ts` — CREATE
- `packages/design-system/src/components/Skeleton/Skeleton.tsx` — CREATE
- `packages/design-system/src/components/Skeleton/Skeleton.module.css` — CREATE
- `packages/design-system/src/components/Skeleton/index.ts` — CREATE
- `packages/design-system/src/components/DescriptionList/DescriptionList.tsx` — CREATE
- `packages/design-system/src/components/DescriptionList/DescriptionList.module.css` — CREATE
- `packages/design-system/src/components/DescriptionList/index.ts` — CREATE
- `packages/design-system/src/components/Avatar/Avatar.tsx` — CREATE
- `packages/design-system/src/components/Avatar/Avatar.module.css` — CREATE
- `packages/design-system/src/components/Avatar/index.ts` — CREATE
- `packages/design-system/src/components/Card/Card.tsx` — MODIFY (re-codify)
- `packages/design-system/src/components/Card/Card.module.css` — MODIFY
- `packages/design-system/src/components/Tile/index.ts` — MODIFY (add deprecation warning)
- `packages/design-system/src/index.ts` — add new exports

**Web adapters (create/update)**
- `apps/web/src/design-system/components/Metric/Metric.jsx` — CREATE
- `apps/web/src/design-system/components/Metric/Metric.module.css` — CREATE
- `apps/web/src/design-system/components/Meter/Meter.jsx` — CREATE
- `apps/web/src/design-system/components/Meter/Meter.module.css` — CREATE
- `apps/web/src/design-system/components/Skeleton/Skeleton.jsx` — CREATE
- `apps/web/src/design-system/components/Skeleton/Skeleton.module.css` — CREATE
- `apps/web/src/design-system/components/DescriptionList/DescriptionList.jsx` — CREATE
- `apps/web/src/design-system/components/DescriptionList/DescriptionList.module.css` — CREATE
- `apps/web/src/design-system/components/Avatar/Avatar.jsx` — CREATE
- `apps/web/src/design-system/components/Avatar/Avatar.module.css` — CREATE
- `apps/web/src/design-system/components/Card/Card.jsx` — UPDATE
- `apps/web/src/design-system/components/Card/Card.module.css` — UPDATE
- `apps/web/src/design-system/index.js` — add new exports

**Patterns (web app)**
- `apps/web/src/components/StatCard.jsx` — CREATE
- `apps/web/src/components/MetadataCard.jsx` — MODIFY (recompose onto Card + DescriptionList)
- `apps/web/src/components/ContentCard.jsx` — MODIFY (assert binding-only)
- `apps/web/src/components/PageSections.jsx` — UPDATE switch for cardSection

**Studio**
- `apps/studio/schemas/sections/cardSection.ts` — CREATE (rename of statTileSection)
- `apps/studio/schemas/sections/statTileSection.ts` — DELETE (after migration)
- `apps/studio/schemas/index.ts` — update import

**Scripts**
- `scripts/migrate/statTileSection-to-cardSection.js` — CREATE
- `package.json` — add `migrate:card-section` script

**Storybook**
- `apps/storybook/src/stories/Metric.stories.jsx` — CREATE
- `apps/storybook/src/stories/Meter.stories.jsx` — CREATE
- `apps/storybook/src/stories/Skeleton.stories.jsx` — CREATE
- `apps/storybook/src/stories/DescriptionList.stories.jsx` — CREATE
- `apps/storybook/src/stories/Avatar.stories.jsx` — CREATE
- `apps/storybook/src/stories/Card.stories.jsx` — UPDATE
- `apps/storybook/src/stories/StatCard.stories.jsx` — CREATE

**Docs**
- `docs/conventions/component-registry.md` — UPDATE (new rows + retired Tile row)

---

## Deliverables

1. `Metric`, `Meter`, `Skeleton`, `DescriptionList`, `Avatar` — DS primitive + web adapter + Storybook story + registry row
2. `Card` — re-codified as pure container; stories cover all variants + slots
3. `StatCard` — pattern composing Card + Metric + Meter; Storybook story
4. `MetadataCard` — zero container CSS; composes Card + DescriptionList
5. `ContentCard` — zero container CSS; binding-only data adapter
6. `statTileSection` migration — dry-run matches pre-flight count; `--execute` runs clean; idempotent
7. `Tile` — deprecated with console.warn; deleted in same epic after migration verified

---

## Acceptance Criteria

- [ ] `Tile` import produces a console.warn; no call sites remain after codemod
- [ ] `Card` renders no domain content — only slots + variants
- [ ] No component other than `Card`/`CardGrid` renders a card box (grep for duplicate container CSS)
- [ ] Metric/Meter/Skeleton/DescriptionList/Avatar: each has DS primitive + web adapter + Storybook story + registry row
- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] statTileSection migration dry-run count matches pre-flight GROQ count
- [ ] Migration `--execute` + re-run dry-run = 0 patches (idempotent)
- [ ] Storybook: Card stories render all variants without console errors; dark-pink-moon theme verified
- [ ] Visual QA: StatCard renders correctly on a real page adjacent to other sections

---

## Visual QA Gate

Agent prepares:
1. Storybook screenshots of each new primitive on default + dark-pink-moon theme
2. Token compliance grep: zero hardcoded values in new CSS files
3. Cross-surface spot check: StatCard on at least 2 routes with real Sanity data

Human gate: wait for "Visual QA approved" before close-out.

---

## Risks / Edge Cases

- Meter vs Progress: if they're the same concept, codifying both creates a false friend. Resolve at Phase 0.
- statTileSection may not exist in all doc types' sections[] — confirm with GROQ before migration.
- MetadataCard recomposition could regress existing detail pages — smoke test all taxonomy detail routes after Phase 3.
- ContentCard "binding-only" assertion may reveal UI it still owns — if so, extract that UI to Card slots before deleting it.

---

## Post-Epic Close-Out

1. Visual QA gate — produce comparison table; wait for "Visual QA approved"
2. Chromatic VRT — run; review changes
3. Flip audit rows in `component-audit.json` (or live audit data): Metric/Meter/Skeleton/DescriptionList/Avatar → `present`; Tile → retired; Card → `present` (re-codified)
4. Move `docs/backlog/SUG-144-ds-card-tile-decomposition.md` → `docs/shipped/`
5. `/mini-release SUG-144`
6. Transition SUG-144 to Done in Linear
