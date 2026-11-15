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

- [x] **Classify every site** in the Background table (Phase 0): swap to the DS component, extract a shared component, delete as dead, or keep with a reason. Re-run the sweep first. — layer: frontend
- [x] **Component choice audit** (`.claude/rules/react.md` §Component choice gate) for each swap and each new shared component, in the vspec. — layer: frontend
- [x] **Chip:** `ContentsStrip` chips and the archive filter chips render DS `Chip`, taking Chip's look. Chip renders `children` for every variant and accepts `aria-expanded`; the Selectable story gains an icon-and-expanded case. The count badge inverts the active chip (`--st-color-bg-canvas` fill, `--st-color-text-default` text). — layer: frontend / DS
- [x] **Avatar:** the taxonomy archive person avatar, image and fallback, renders DS `Avatar size="lg"` (40px; was 36px). — layer: frontend
- [x] **Select:** delete web `Select` (component, CSS, story). Only its own story imports it. — layer: frontend
- [x] **Hairline grids:** `cwvGrid` renders `Grid spacing="0" columns={3} tabletColumns={3} accentTop accentColor="ink"`. `tileGrid` and `heroStatRail` are kept with reasons (Phase 0 classification). — layer: frontend
- [x] **Version badge:** new web component `VersionBadge` (`apps/web/src/components/`), used by `TrustReportSection.jsx` and `GovernancePage.jsx`; both class sets and both inline `KindBadge` functions go. `docs/conventions/component-registry.md` updated in the same commit. Form error: no extraction, one caller after the dead copy goes. — layer: frontend
- [x] **Dead code:** delete `ContactForm.module.css`, the whole `TaxonomyArchivePage` `.indexCell*` family, and the deprecated web `components/Callout.jsx` and `.module.css`, after confirming nothing references them. — layer: frontend
- [x] **StatCard vs Tile:** file as a separate issue (decided at Phase 0: 7 StatCard and 2 Tile importers with different props). — layer: process

## Phase 0 classification

Done 2026-11-15; Bex signed off the vspec, class table and component choice audit as drawn the same day. The per-site table, the component choice audit and the Before captures are in the vspec, section 10 and section 6 (`docs/drafts/ST-228-surface-reuse.vspec.html`). Corrections to the Background table above:

- **IndexCell:** the whole `.indexCell*` family in `TaxonomyArchivePage.module.css` is unused, not only `.indexCellSelected`. `AlphaFilter.jsx` renders DS `IndexCell`.
- **Select:** web `Select` is imported only by its own story. Deleted rather than re-surfaced.
- **Hero stat rail:** renders on `/platform` and `/ds-section-showcase` (Sanity, `showStatRail == true`). Kept: its `--st-color-white-20` dividers on a dark hero need a Grid tone prop that does not exist.
- **Trust tile grid:** kept. `Grid` sets each column to `minmax(200px, 1fr)`; 4 columns need 800px and the grid is 756px wide at 1280px, so the fourth tile would be clipped.
- **Callout:** web `components/Callout.jsx` is `@deprecated` and imported by nothing. Deleted.
- **Form error:** one caller once `ContactForm.module.css` is deleted, so no shared component.

## Phases

| Phase | Covers Scope items | Ships | Gate |
|---|---|---|---|
| 0. Classify and spec | classify, component choice audit | classification table in this doc, vspec | **Bex signs off the vspec, the component choice audit and any new class or component names** (CLAUDE.md §Phase 0) |
| 1. Swap to DS components | Chip, Avatar, hairline grids | live surfaces render DS components | none |
| 2. Extraction and dead code | version badge, Select, dead code, StatCard vs Tile issue | `VersionBadge`, dead copies gone, issue filed | none |

## Acceptance Criteria

- [x] Re-running `python3 -I docs/reports/property-cluster-drift-audit.sweep.py` lists no surface signature repeated between a page file and a DS component, except those kept with a reason in this doc.
- [x] `ContentsStrip`, the archive filter chips and the taxonomy avatar fallback render the DS component (checked in the DOM: the DS class name is on the element).
- [x] `cwvGrid` no longer exists and renders `Grid spacing="0"`; it still shows 3 columns above 600px. `tileGrid` and `heroStatRail` carry a comment naming their kept-with-reason.
- [x] The version badges come from `VersionBadge` at both call sites.
- [x] `ContactForm.module.css`, the `.indexCell*` classes in `TaxonomyArchivePage.module.css`, web `Select/` and web `components/Callout.*` are deleted (`git ls-files` and `grep` confirm no reference).
- [x] Every new or changed component has a Storybook story covering its variants, in light and dark (`.claude/rules/storybook.md`).
- [x] `pnpm validate:tokens`, `pnpm validate:dead-refs` and `pnpm test:smoke` pass.
- [x] Visual QA approved against the vspec, and Chromatic approved before the push.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

| Surface | Local URL | Width | Check |
|---|---|---|---|
| Contents strip chip | `/platform/governance` | 375px | rest, hover, open; `aria-expanded` toggles |
| Archive filter chip | `/articles` | 375px | rest, active with a filter applied, count badge |
| Person avatar | `/people` | 1280px | 40px photo circle |
| CWV grid | `/platform/governance` | 1280, 768, 375px | 3, 3, 1 columns |
| Version badges | `/platform/governance`, `/ds-section-showcase` | 1280px | unchanged |
| Trust tile grid, hero stat rail (kept, regression guard) | `/ds-section-showcase`, `/platform` | 1280, 375px | unchanged |
| Form error | Storybook Form story | n/a | unchanged |

Pages captured 2026-11-15 on the local dev server.

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

## Close-out review

### Acceptance criteria

Every criterion above is ticked. Evidence, 2026-11-15:

- **Sweep:** `python3 -I docs/reports/property-cluster-drift-audit.sweep.py`, table C1: repeated surface signatures fell from 21 to 13. The page-to-DS repeats left are `.tileGrid` (kept, reason in its comment), web `Checkbox` against FilterBar's checkbox (out of scope: the DS has no Checkbox, recorded in the vspec), and a `background: none; border: none` reset, which is not a surface.
- **DS class names in the DOM:** Chip classes on the contents strip and filter chips, Avatar `lg` classes at 40px on `/people`, Grid `spacing0` on the CWV grid (headless Playwright on the dev server; `docs/drafts/ST-228-vqa.md`).
- **CWV grid:** 3, 3 and 1 columns at 1280, 768 and 375px. `.tileGrid` and `.heroStatRail` carry kept-with-reason comments.
- **VersionBadge:** both call sites, plus a third copy on `/dev/tables` that used raw hex inline styles.
- **Deletions:** `git ls-files` and `git grep` find none of the deleted files or classes. A story still used `.itemAvatarFallback`; fixed in db2f7370.
- **Stories:** Chip Selectable and VersionBadge AllKinds render in light and dark (Storybook iframe, both themes).
- **Checks:** `validate:tokens`, `--strict-colors`, `validate:dead-refs` and lint pass in the pre-commit hook; `pnpm test:smoke` 33 of 33.
- **Gates:** Visual QA approved by Bex; Chromatic build 113 (3 changes) approved by Bex.

### What didn't work

- **The first vspec draft said the hero stat rail renders nowhere.** That came from probing two pages; a Sanity query (`showStatRail == true`) found `/platform` and `/ds-section-showcase`. Corrected before sign-off.
- **The first draft kept the count badge's pink text on white,** which measured 3.10:1 in dark. Changed to canvas fill and default text (17.12 and 17.50) before sign-off.
- **Live captures needed the header and consent banner hidden;** the first chip captures showed the header logo and the banner over the chips.
- **The design-reviewer cited wrong lines** for the kept-with-reason comments, the filter chip and the badge colours, and quoted comment text that is not in the files. Corrected in `docs/drafts/ST-228-vqa.md`.
- **Deleting `.itemAvatarFallback` missed a story that used it.** Found by a `git grep` at close-out, fixed in db2f7370.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Merge StatCard and the deprecated web Tile | implementation | #234 |
| Header logo appeared over the contents strip in a 375px headless capture of `/platform/governance` | implementation | declined until reproduced in a real browser: listed as a post-ship check below |
| Grid tone prop for the dark-hero stat rail | implementation | declined: one surface, recorded as kept with a reason |
| Delete a class, then grep stories as well as pages | workflow-docs | declined: first occurrence; recorded in the friction line |

### Friction line

A vspec claim that a surface renders nowhere was based on two page probes instead of a content query, and was wrong.

## Post-ship checks

- [ ] `/platform/governance` at 375px: the contents strip chip reads "Platform" in normal case, turns ink when the drawer opens, and the header logo does not cover it: person.
- [ ] `/articles` at 375px: the Filters chip shows the count badge when a filter is applied: person.
- [ ] `/platform/governance`: release table badges unchanged: person.

