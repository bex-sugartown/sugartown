---
**Epic:** SUG-176 — Storybook story coverage for app-level composites
**Linear Issue:** [SUG-176](https://linear.app/sugartown/issue/SUG-176/storybook-story-coverage-for-app-level-composites)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-176 — Storybook story coverage for app-level composites

Add Storybook stories for the 12 app-level composite components registered in the component registry but currently flagged ⚠️ (no story), making them visible to Chromatic VRT and enabling dark mode verification.

## Background

The 2026-06-16 component registry audit (v0.26.22) surfaced 12 app-level composites that exist in production code but have no Storybook story. These components are invisible to Chromatic VRT — any visual regression in them goes undetected until a human notices it on the live site. Several components (DraftBadge, TaxonomyChips, ContentsStrip) are rendered on high-traffic surfaces (archive pages, detail pages) where regressions have the most impact. The registry rule from CLAUDE.md is clear: "every new or modified component that has visual output must have a Storybook story before close-out" — these predate that rule and never had one added.

The component registry now explicitly flags them with ⚠️ `no story`. This epic clears those gaps.

## Objective

After this epic, each of the 12 components listed below has a Storybook story covering: default state, key variants, and at least one edge case (long text, missing data, empty arrays). Each story is confirmed to render correctly in both `default` and `dark-pink-moon` themes. The component registry ⚠️ flags are replaced with ✅ Storybook coverage entries. Chromatic VRT can then catch regressions in all of them.

Layers touched: Storybook stories only. No component CSS, no schema, no GROQ query changes.

## Scope

Components requiring stories (in priority order — highest-traffic surfaces first):

- [ ] `TaxonomyChips` — `web/components/TaxonomyChips.jsx` — Storybook: `Patterns/TaxonomyChips`
- [ ] `DraftBadge` — `web/components/DraftBadge.jsx` — Storybook: `Patterns/DraftBadge`
- [ ] `ContentsStrip` — `web/components/ContentsStrip.jsx` — Storybook: `Patterns/ContentsStrip`
- [ ] `ContentList` — `web/components/ContentList.jsx` — Storybook: `Patterns/ContentList`
- [ ] `DrawerNav` — `web/components/DrawerNav.jsx` — Storybook: `Patterns/DrawerNav`
- [ ] `LetterSectionHeader` — `web/components/LetterSectionHeader.jsx` — Storybook: `Patterns/LetterSectionHeader`
- [ ] `SeoHead` — `web/components/SeoHead.jsx` — Storybook: `Patterns/SeoHead` (meta-only component — story verifies render without errors; visual output is limited)
- [ ] `PreviewBanner` — `web/components/PreviewBanner.jsx` — Storybook: `Patterns/PreviewBanner`
- [ ] `GlossaryTermAnnotation` — `web/components/GlossaryTermAnnotation.jsx` — Storybook: `Patterns/GlossaryTermAnnotation`
- [ ] `CwvSnapshot` — `web/components/CwvSnapshot.jsx` — Storybook: `Patterns/CwvSnapshot`
- [ ] `TrustReportSection` — `web/components/TrustReportSection.jsx` — Storybook: `Patterns/TrustReportSection`
- [ ] `NodesExample` — `web/components/NodesExample.jsx` — Storybook: `Patterns/NodesExample`

Each story must:
- Use static mock data (no live Sanity fetches)
- Cover at least: default state + one variant (long content / empty / loading) + dark-pink-moon theme confirmed
- Follow the `stories.boilerplate.tsx` pattern from SUG-158

## Acceptance criteria

- [ ] All 12 components have a story file under `apps/storybook/src/stories/` in the `Patterns/` category
- [ ] Each story renders without console errors in both `default` and `dark-pink-moon` themes
- [ ] Chromatic build passes with all 12 stories included
- [ ] Component registry `⚠️ no story` flags replaced with `✅ Patterns/<Name>` in `docs/conventions/component-registry.md`
- [ ] `pnpm validate:tokens` exits 0 (no new token refs introduced)

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes. Storybook stories only.

## Technical notes

- **Activation audit:** Before writing each story, read the source component file to confirm its prop API, required vs optional props, and whether it has internal Sanity fetching that must be replaced with mock data for Storybook.
- **DraftBadge note:** Requires `hasDraft` (boolean) prop — do not use `_id.startsWith('drafts.')`. Story should cover `hasDraft={true}` and `hasDraft={false}`.
- **SeoHead note:** Component injects into `<head>` — the story's visual output is minimal. Use `preview_eval` or `document.head` inspection to verify meta tags render; include a descriptive decorator showing the injected values.
- **NodesExample note:** Uses `react-force-graph-2d` (canvas-based). Story may need a `decorators` wrapper to constrain the canvas height and prevent layout collapse. Check whether Chromatic can snapshot canvas elements reliably — if not, mark with `chromatic: { disableSnapshot: true }` and document why.
- **CwvSnapshot / TrustReportSection:** Both consume `stats.json` shape. Use a static mock object matching the `stats.json` schema — do not import the live file directly (it changes on CI runs and would create Chromatic noise).
- **Model & Mode:** `/model sonnet` — pure Storybook story authoring, no architecture decisions, no schema changes.

## Model & Mode [REQUIRED]

`/model sonnet` — all work is story authoring. Each story follows the established `stories.boilerplate.tsx` pattern from SUG-158. No architecture decisions, no token changes, no schema.

## Non-Goals

- No changes to component CSS, props API, or behaviour — stories only
- No new DS primitives
- No Sanity schema changes
- No migration of `NodesExample` off canvas if Chromatic can't snapshot it — just mark it `chromatic: { disableSnapshot: true }` with a comment

## Related

- **Linear:** [SUG-176](https://linear.app/sugartown/issue/SUG-176/storybook-story-coverage-for-app-level-composites)
- **Component registry:** `docs/conventions/component-registry.md` — source of the ⚠️ gap list
- **Story boilerplate:** `apps/storybook/src/stories/helpers/stories.boilerplate.tsx` (SUG-158)
- **Epic template:** `docs/epic-template.md`
