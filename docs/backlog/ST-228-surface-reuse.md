---
**Epic:** ST-228 — Surfaces re-typed outside their DS component: reuse Chip, IndexCell, Avatar, Input, Grid
**Issue:** [#228](https://github.com/bex-sugartown/sugartown/issues/228)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-228-surface-reuse.vspec.html`
---

# ST-228 — Surfaces re-typed outside their DS component

Several web pages re-create a DS component's surface (background, border, radius) in their own CSS instead of rendering the component. After this epic each one renders the DS component, or a shared component extracted for it, and the copies are gone.

## Background

The SUG-206 audit (`docs/reports/property-cluster-drift-audit.md`, #68) found surface duplication is not missing tokens: it is components re-implemented in page CSS. Re-measured on 2026-11-15 after #227 (`python3 -I docs/reports/property-cluster-drift-audit.sweep.py`, tables C1 and C2): 162 blocks carry 2+ surface properties, 21 signatures repeat across files.

Each re-implementation, with whether its class renders today (checked by grepping the importing JSX for `styles.<class>`, 2026-11-15):

| Re-implemented | Canonical | Copy | Renders |
|---|---|---|---|
| Chip | DS `Chip` | `ContentsStrip.module.css` `.chip`, `.chip.active` | yes, `ContentsStrip.jsx` |
| Chip | DS `Chip` | `pages.module.css` `.filterChip`, `.filterChipActive` | yes, `ArchivePage.jsx` |
| Avatar | DS `Avatar` | `TaxonomyArchivePage.module.css` `.itemAvatarFallback` | yes, `TaxonomyArchivePage.jsx` |
| IndexCell | DS `IndexCell` | `TaxonomyArchivePage.module.css` `.indexCellSelected`, `:hover` | **no**: no JSX uses it |
| Form control | DS `Input` | web `Select.module.css` `.select` | yes, `Select.jsx` |
| Hairline grid | DS `Grid spacing="0"` | `CwvSnapshot.module.css` `.cwvGrid` | yes |
| Hairline grid | DS `Grid spacing="0"` | `TrustReportSection.module.css` `.tileGrid` | yes |
| Hairline grid | DS `Grid spacing="0"` | `PageSections.module.css` `.heroStatRail` (white-20 on the dark hero) | yes |
| Version badges | none shared | `TrustReportSection.module.css` and `PlatformHubPage.module.css` `.badgeMinor/.badgePatch/.badgeMajor` | yes, `TrustReportSection.jsx` and `GovernancePage.jsx` |
| Form error | none shared | `Form.module.css` `.formError` | yes, `Form.jsx` |
| Form error | none shared | `ContactForm.module.css` `.formError` | **no**: no JSX imports `ContactForm.module.css` |
| Tile surface | web `Tile` | `StatCard.module.css` `.linked:hover`, `.skeleton` | yes, `StatCard.jsx`: two overlapping components |
| Callout | DS `Callout` | web `components/Callout.module.css` | to classify at activation |

**Why now:** #227 removed the typography copies from several of the same files; the remaining duplication is the surface.

## Objective

After this epic, every live surface in the table above renders its canonical component, or a shared component where none existed (version badge, form error). Dead copies are deleted. **Layers:** React render (page and section JSX swap to DS components), component CSS (copies deleted), possibly a new shared web component. **Excluded:** Sanity schema, GROQ, tokens, content.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] **Classify every site** in the Background table (Phase 0): swap to the DS component, extract a shared component, delete as dead, or keep with a reason. Re-run the sweep first. — layer: frontend
- [ ] **Component choice audit** (`.claude/rules/react.md` §Component choice gate) for each swap and each new shared component, in the vspec. — layer: frontend
- [ ] **Chip:** `ContentsStrip` chips and the archive filter chips render DS `Chip` (or document why they can't). — layer: frontend
- [ ] **Avatar:** taxonomy archive avatar fallback renders DS `Avatar`. — layer: frontend
- [ ] **Select:** web `Select` reads the same surface as DS `Input`, by composing it or by moving into the DS beside `Input`. — layer: frontend / DS
- [ ] **Hairline grids:** `cwvGrid`, `tileGrid` and, if it fits, `heroStatRail` render `Grid spacing="0"`. — layer: frontend
- [ ] **Version badge and form error:** one shared component each, used by both callers. — layer: frontend
- [ ] **Dead CSS:** delete `ContactForm.module.css` and `TaxonomyArchivePage` `.indexCellSelected` after confirming nothing references them. — layer: frontend CSS
- [ ] **StatCard vs Tile, web Callout vs DS Callout:** decide at Phase 0 whether they merge in this epic or file separately. — layer: frontend

## Phases

| Phase | Covers Scope items | Ships | Gate |
|---|---|---|---|
| 0. Classify and spec | classify, component choice audit, StatCard/Tile and Callout decision | classification table in this doc, vspec | **Bex signs off the vspec, the component choice audit and any new class or component names** (CLAUDE.md §Phase 0) |
| 1. Swap to DS components | Chip, Avatar, Select, hairline grids | live surfaces render DS components | none |
| 2. Shared extractions and dead CSS | version badge, form error, dead CSS | one component per shared surface, dead copies gone | none |

## Acceptance Criteria

- [ ] Re-running `python3 -I docs/reports/property-cluster-drift-audit.sweep.py` lists no surface signature repeated between a page file and a DS component, except those kept with a reason in this doc.
- [ ] `ContentsStrip`, the archive filter chips and the taxonomy avatar fallback render the DS component (checked in the DOM: the DS class name is on the element).
- [ ] `cwvGrid` and `tileGrid` no longer exist; both render `Grid spacing="0"`.
- [ ] The version badges and form error each come from one component, used at every call site.
- [ ] `ContactForm.module.css` and `.indexCellSelected` are deleted (`git ls-files` and `grep` confirm no reference).
- [ ] Every new or changed component has a Storybook story covering its variants, in light and dark (`.claude/rules/storybook.md`).
- [ ] `pnpm validate:tokens`, `pnpm validate:dead-refs` and `pnpm test:smoke` pass.
- [ ] Visual QA approved against the vspec, and Chromatic approved before the push.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

Known surfaces to include: an article with the contents strip, `/articles` (filter chips), `/people` or `/tools` (avatar fallback), the home page (trust report tile grid, CWV snapshot, hero stat rail), `/platform/governance` (version badges), and a page with a form.

## Technical notes

- **Content Write Gate:** does not fire; no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** #227 (Done) migrated the typography of `ContentsStrip` chips and the archive filter chips to `monoLabel`; a swap to DS `Chip` must keep that type. #232 deletes unused `PlatformHubPage.module.css` classes and may overlap the version badges there; read #232's state at activation and say which epic owns each class. Activation audit: read `docs/backlog/` for other in-flight epics touching `ArchivePage.jsx`, `TaxonomyArchivePage.jsx`, `TrustReportSection.jsx` or `CwvSnapshot.jsx`.
- **Activation audits:**
  - Open `.claude/rules/react.md` (path-scoped, not loaded at Phase 0) for the Component choice gate and the Component-Reuse Manifest rules.
  - Read DS `Chip` props and states before deciding whether it covers the contents-strip and filter-chip active states.
  - `.claude/rules/css-layout.md` §`Grid spacing="0"` takes borderless children only: check the tile children of `cwvGrid` and `tileGrid` carry no border.
  - Confirm `ContactForm.module.css` is unused with `grep -rn "ContactForm.module" apps/web/src` before deleting.
  - `docs/conventions/component-registry.md` is updated in the same commit as any new or retired component.

## Model & Mode [REQUIRED]

`/model opus` with plan mode for Phase 0: several component-choice decisions, two possible merges and a possible new shared component. Phases 1 and 2 can run on `/model sonnet` once the classification is signed off.

## Non-Goals

- **Typography.** Done in #227.
- **Spacing and motion.** #230 and #229.
- **Restyling a component.** A swap keeps the component's current look; any visible difference between a copy and its canonical component is shown in the vspec and resolved toward the component.
- **Surfaces that repeat inside one component's own states** (for example Input and Textarea focus rings): they are already one component's CSS.

## Related

- **GitHub:** [#228](https://github.com/bex-sugartown/sugartown/issues/228); relates to #68 and #227
- **Evidence:** `docs/reports/property-cluster-drift-audit.md`, sweep tables C1 and C2
- **Epic template:** `docs/epic-template.md` — complete the Pre-Execution checklist, Component-Reuse Manifest and Files to Modify at activation time
