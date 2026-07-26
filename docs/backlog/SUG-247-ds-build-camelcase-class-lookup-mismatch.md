---
**Epic:** SUG-247 — DS build bug: camelCased compiled classes vs. hyphenated bracket lookups
**Linear Issue:** [SUG-247](https://linear.app/sugartown/issue/SUG-247)
**Status:** Backlog
**Priority:** 🟠 Next
**Merge strategy:** (a) Merge-as-you-go — single scoped commit, its own mini-release
---

# SUG-247 — DS build bug: camelCased compiled classes vs. hyphenated bracket lookups

Fix a silent modifier-class drop in the **built** `@sugartown/design-system` package: esbuild's CSS-modules plugin camelCases class names in its compiled name-map, but component source still looks classes up via hyphenated template-literal keys, so the lookup misses and the modifier class never applies downstream.

## Background

`packages/design-system/build.mjs` builds the package with esbuild + `esbuild-css-modules-plugin`. That plugin camelCases CSS class names in its generated JS name-map — e.g. `.spacing-0` in a `.module.css` file becomes `styles.spacing0` in the compiled JS, and `.accentTop-ink` becomes `styles.accentTopInk`. Component source accesses these classes via hyphenated bracket notation, e.g. `styles[\`spacing-${spacing}\`]` in `Grid.tsx` — which evaluates to `styles['spacing-0']`, a key absent from the camelCased compiled map. The lookup silently returns `undefined`, gets filtered out of the className list, and the modifier class never applies.

This only breaks in the **built package** (`dist/index.mjs` / `dist/index.js`), because `packages/design-system/package.json` sets `"module": "./dist/index.mjs"` — every consumer (`apps/web` post-SUG-224, and Storybook via `@sugartown/design-system/styles.css`) resolves to built output, not source. It does not break inside the design-system package's own Storybook stories, which import `.tsx` source directly and go through Vite's own CSS-modules handling (hyphenated names preserved).

Found 2026-07-26 while working SUG-245 (unrelated epic), on branch `main` at commit `04c30eeb`. Diagnosis only — no fix code written. `npm run build` was run once and the Storybook cache was cleared once during diagnosis, both to rule out staleness/cache explanations (both ruled out; `dist/` is gitignored so the rebuild had no repo-tracked effect).

## Objective

Every affected component's built-package output produces the same className list as its source-level (Vite) output, for every documented prop combination. No visual change from what the vspec/existing approved design already specifies — this restores previously-working rendering, it does not introduce a new visual format, so it does not trigger a new Phase 0 vspec gate.

## Scope

- [ ] Confirm `Grid.tsx` is the only component with a **verified, reproduced** break (`spacing="0"`, `accentTop`, `accentColor`) — layer: design-system
- [ ] Individually verify `Card.tsx` for the same hyphenated-bracket-lookup pattern: identify the exact class(es) affected, confirm camelCase mismatch in `dist/index.js`, confirm the resulting className is actually missing at runtime — layer: design-system
- [ ] Individually verify `Columns.tsx` the same way — layer: design-system
- [ ] Individually verify `Metric.tsx` the same way — layer: design-system
- [ ] For every component confirmed affected: rename the hyphenated CSS module class names to camelCase-safe names (e.g. `.spacing-0` → `.spacing0`, `.accentTop-ink` → `.accentTopInk`) and update the className-building logic to match — layer: design-system
- [ ] Replace template-literal class interpolation with an explicit lookup map where the interpolated segment isn't already camelCase-safe (e.g. `spacing` prop values are `'0'`/`'lg'`) — layer: design-system
- [ ] Rebuild the package (`cd packages/design-system && npm run build`) and verify in Storybook (clear `apps/storybook/node_modules/.cache/storybook` first — stale Vite dep-optimization cache will otherwise serve an old bundle) — layer: tooling
- [ ] Verify in `apps/web` on real pages that consume the affected components (GovernancePage `/platform/governance` §01 stats + §05 AI Governance Coverage tiles at minimum, since those are confirmed live consumers of `<Grid spacing="0">`) in both light and dark theme — layer: frontend

## Phases

**Phase 1 — Verify.** Confirm/refute the pattern in Card, Columns, Metric using the same method used for Grid (grep source for hyphenated bracket access → check sibling `.module.css` → grep `dist/index.js` for the compiled key → confirm className actually missing at runtime). Record findings per component before touching any code.

**Phase 2 — Fix.** For every component confirmed affected in Phase 1, rename classes + update lookup logic in one scoped commit (do not bundle with any unrelated epic's changes).

**Phase 3 — Verify fix.** Rebuild, clear Storybook cache, confirm Storybook's own stories (source-level, sanity check only) and Storybook's built-package-consuming stories both render correctly, then confirm the real `apps/web` pages in both themes.

## Acceptance criteria

- [ ] `Card.tsx`, `Columns.tsx`, `Metric.tsx` each have a recorded verify-or-refute finding (not just "grep found a hyphen")
- [ ] Every component confirmed affected has its hyphenated class names renamed and its lookup logic updated to a form immune to this class of bug (explicit map, not raw interpolation)
- [ ] `grep -o '"[a-zA-Z]*-[a-zA-Z]*"' packages/design-system/dist/index.js` piped against each fixed component's compiled chunk shows no remaining hyphenated compiled keys for a hyphenated source lookup
- [ ] Rebuilt package verified in Storybook (built-package stories, not source-level ones) showing the previously-missing modifier classes present in the rendered DOM
- [ ] `apps/web`'s GovernancePage verified in both light and dark theme showing hairline dividers/accent rules restored
- [ ] Scoped commit(s) contain no unrelated-epic changes

## Human QA Walkthrough — example local pages

- `/platform/governance` — §01 top stats Grid (`spacing="0"`) and §05 AI Governance Coverage tiles (`spacing="0"`, `accentTop`, `accentColor="ink"`) — confirm hairline dividers and top accent rule are visible, in both light and dark theme
- Storybook → Patterns/PageSections → "Stat Card Section" story (built-package consumption path) — confirm the same
- Any Card/Columns/Metric story confirmed affected in Phase 1 — confirm its previously-missing modifier renders

## Technical notes

- **Blast radius:** `apps/web` consumes `@sugartown/design-system` as a real workspace dependency since SUG-224 (shipped v0.30.0, 2026-07-24). Confirmed live consumers of the broken Grid path: GovernancePage §01/§05, plus ContentModelsPage and DesignSystemRegistryPage artifacts grids (not yet individually re-verified as of this writing — re-check during Phase 3).
- **Prod exposure:** the last Storybook prod deploy predates the SUG-224 Phase 5 commit (`5710db69`, 2026-07-24 05:16, "feat(web): promote Grid/PageHeader/SectionLabel/Sidebar to the package") that moved Grid into the package and introduced this build-tool mismatch. The next prod deploy of either `apps/web` or Storybook should be expected to reproduce the missing-divider bug unless this epic ships first.
- **Root fix should be structural, not a one-off rename.** Prefer an explicit `{ '0': 'spacing0', lg: 'spacingLg' }`-style lookup map over string interpolation, since the underlying hazard (esbuild-css-modules-plugin camelCasing) will silently reintroduce this bug for any future hyphenated class name accessed via template-literal interpolation.
- **Not a Phase 0 item.** This restores already-approved existing visual behaviour (the hairline dividers/accent rule were part of Grid's already-shipped, already-reviewed design); it does not invent a new visual format.

## Model & Mode [REQUIRED]

`/model sonnet` — bounded verification (3 components) plus a mechanical rename/lookup-map fix with clear before/after verification steps; no design decisions.

## Non-Goals

- **Auditing every component in the package for the same pattern.** Scope is bounded to the 4 components found via the `styles\[\`[a-zA-Z]*-` grep in `packages/design-system/src/components/`. A broader sweep is separate follow-up work if this pattern turns out to recur elsewhere.
- **Changing `esbuild-css-modules-plugin` or the build tool itself.** The fix targets the component/CSS side (avoid hyphenated names entirely), not the build pipeline.
- **Any new visual design or Grid/Card/Columns/Metric API change.** This is a regression fix restoring existing, already-approved behaviour.

## Related

- **Linear:** [SUG-247](https://linear.app/sugartown/issue/SUG-247)
- **Surfaced by:** SUG-245 session, 2026-07-26, branch `main` @ `04c30eeb`
- **Depends on / touches:** SUG-224 (apps/web → `@sugartown/design-system` package consumption, shipped v0.30.0, 2026-07-24) — this bug is a direct consequence of that migration
- **Epic template:** `docs/epic-template.md`
