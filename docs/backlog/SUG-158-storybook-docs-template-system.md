---
**Epic:** SUG-158 — Storybook Documentation Template System
**Linear Issue:** [SUG-158](https://linear.app/sugartown/issue/SUG-158)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each phase
---

# SUG-158 — Storybook Documentation Template System

Install and wire the canonical 14-section docs template into the Storybook codebase, add a Docs/ sidebar section with live reference examples, and retroactively apply the structure to the PageHeader pilot component.

## Background

The DS Storybook currently has component stories (variants, snapshots) but no standardised documentation structure. The SUG-152 docs audit produced one-off Format A stories (`SectionSpacing.stories.tsx`, `TypographyConventions.stories.tsx`, `EntityDetailPageDocs.stories.tsx`) that each re-implement their own prose helpers inline — there is no shared component library for doc-page elements (section headers, Do/Don't columns, token tables, accessibility checklists, changelog entries). A design handoff (zip delivered 2026-06-07) provides: `helpers/docs.tsx` (11 shared doc components), `stories.boilerplate.tsx` (a filled 14-section template for new components), `SECTION-RULES.md` (canonical rules per section), and `reference/Storybook Docs Template.html` (visual reference). The trigger is the completion of SUG-157 (PageHeader shipped), which is the first DS component complex enough to stress-test all 14 sections. The `_PreviewFrame.tsx` already in `.storybook/stories/` covers Show code toggle and VariantFrame (not in docs.tsx) — these are complementary, not competing.

## Objective

After this epic, every DS component story can import from a single shared `helpers/docs.tsx` to get consistent, visually correct doc-page chrome (section numbering, Must Have / Should Have badges, Do/Don't grid, accessibility checklist, token tables, related components grid, changelog). A `stories.boilerplate.tsx` template is committed so new components start from a filled 14-section scaffold rather than a blank file. A `Docs/` Storybook sidebar section demonstrates the full system live — both the autodocs-generated sections (02–05) and the Guidelines story sections (01, 06–14). The existing one-off Format A stories are not migrated in this epic (that is Phase 3 of SUG-152) but will be updated to import from `helpers/docs.tsx` as a follow-on. Layers touched: Storybook tooling, component stories, docs conventions.

## Scope

- [ ] Copy `helpers/docs.tsx` from handoff to `apps/storybook/.storybook/helpers/docs.tsx` — layer: Storybook tooling
- [ ] Copy `stories.boilerplate.tsx` from handoff to `apps/storybook/.storybook/stories/stories.boilerplate.tsx` — layer: Storybook tooling (reference template, not a loadable story)
- [ ] Copy `SECTION-RULES.md` from handoff to `docs/conventions/storybook-section-rules.md` — layer: docs conventions
- [ ] Copy `reference/Storybook Docs Template.html` to `docs/briefs/design-system/storybook-docs-template.html` — layer: reference asset
- [ ] Wire DS token CSS into `preview.tsx` so `--st-*` tokens are available inside all Guidelines stories rendered in the `data-theme="light-pink-moon"` shell — layer: Storybook tooling
- [ ] Verify `--st-color-pink`, `--st-color-neutral-*`, `--st-color-maroon-600`, `--st-color-seafoam-*`, `--st-color-midnight-900` exist in `tokens.css`; add any missing primitives — layer: DS tokens
- [ ] Add `Docs/Introduction.stories.tsx` at `apps/storybook/.storybook/stories/` — the `Docs/` sidebar section already exists; this adds an intro story explaining the 14-section structure, coverage model (autodocs vs Guidelines), and import conventions — layer: Storybook
- [ ] Apply the template to PageHeader: update `PageHeader.stories.tsx` in `apps/web/src/design-system/components/PageHeader/` to use `helpers/docs.tsx` for the Guidelines story, covering all 14 sections — layer: component stories
- [ ] Reconcile `_PreviewFrame.tsx` with `helpers/docs.tsx`: update `_PreviewFrame.tsx` to remove `DoRow` (superseded by `DoItem`/`DontItem` in helpers/docs.tsx), keep `PreviewFrame` and `VariantFrame` (Show code toggle — not in helpers/docs.tsx); update existing stories that import `DoRow` from `_PreviewFrame.tsx` to import `DoItem`/`DontItem` from `helpers/docs.tsx` instead — layer: Storybook tooling

## Phases

**Phase 1 — Infrastructure wire** (sections: helpers, template, conventions files, token check, preview.tsx)
- `helpers/docs.tsx` dropped in
- `stories.boilerplate.tsx` committed as reference template
- `SECTION-RULES.md` and HTML reference committed
- Token gaps patched if any
- `preview.tsx` wired so tokens load in Guidelines stories
- `_PreviewFrame.tsx` reconciled (DoRow removed, callers updated)

**Phase 2 — Docs/ Introduction story** (the Docs/ sidebar section already exists)
- `Docs/Introduction.stories.tsx` — explains 14-section model, coverage map, import pattern
- Optionally: a live `Docs/Guidelines Reference.stories.tsx` showing every helper component rendered with the correct Pink Moon visual language

**Phase 3 — PageHeader pilot** (full 14-section Guidelines story)
- All 14 sections authored for PageHeader
- Sections 01–08 must be complete; 09–14 filled but can be abbreviated
- This becomes the canonical example of the template in use

## Acceptance criteria

- [ ] `pnpm storybook` starts without errors; `Docs/Introduction` story visible in existing `Docs/` sidebar section
- [ ] `helpers/docs.tsx` importable from any story in `apps/storybook/.storybook/stories/` and from PageHeader stories in `apps/web/src/design-system/`
- [ ] `pnpm validate:tokens` reports zero errors after any token additions
- [ ] PageHeader Guidelines story renders in Storybook with all 14 sections visible, all Must Have sections complete, token values match `tokens.css` + `theme.pink-moon.css`
- [ ] `_PreviewFrame.tsx` no longer exports `DoRow`; no story imports `DoRow` from `_PreviewFrame.tsx`
- [ ] `docs/conventions/storybook-section-rules.md` committed and matches the handoff `SECTION-RULES.md`
- [ ] `stories.boilerplate.tsx` has zero `[placeholder]` strings in positions that would prevent TypeScript compilation (i.e. it's valid TSX with `[placeholder]` only in JSX string content and comments)

## Technical notes

**Token gaps to verify before Phase 1:** `helpers/docs.tsx` references `--st-color-pink`, `--st-color-ink`, `--st-color-maroon-600`, `--st-color-seafoam-600`, `--st-color-seafoam-700`, `--st-color-pink-300`, `--st-color-pink-700`, `--st-color-neutral-100` through `--st-color-neutral-600`, `--st-color-midnight-900`. Run `grep` against `tokens.css` for each before wiring. If a token is missing, add it to `tokens/source/tokens.json` and run `pnpm tokens:build` before writing `helpers/docs.tsx` to disk.

**Activation audit — preview.tsx:** Read `apps/storybook/.storybook/preview.tsx` before Phase 1 to confirm whether `--st-*` tokens are already imported via a CSS import or a decorator. If tokens load correctly in existing stories (which they do — `EntityDetailPage.stories.jsx` uses `var(--st-color-seafoam-300)` and renders correctly), no change may be needed. Verify by rendering one `helpers/docs.tsx` component and checking computed styles in the Guidelines story.

**`_PreviewFrame.tsx` reconciliation rule:** `DoRow` in `_PreviewFrame.tsx` uses a different visual language (top-border strip, no Do/Don't text) from `DoItem`/`DontItem` in `helpers/docs.tsx` (column grid with ✓/✗ markers, seafoam/pink borders). `helpers/docs.tsx` is canonical. Update `SectionSpacing.stories.tsx` and `EntityDetailPageDocs.stories.tsx` which currently import `DoRow` from `./_PreviewFrame` — replace with the column grid pattern from helpers/docs.tsx. `VariantFrame` and `PreviewFrame` in `_PreviewFrame.tsx` have no equivalent in helpers/docs.tsx and stay.

**`stories.boilerplate.tsx` placement:** This file should NOT be picked up by the Storybook stories glob (`./stories/**/*.stories.@(js|jsx|ts|tsx)`). Name it `stories.boilerplate.tsx` (no `.stories.` in the filename) — it is a reference template, not a loadable story. Store in `apps/storybook/.storybook/stories/`.

**Sections 09–14 gate:** Must Have (01–08) gates merge. Should Have (09–14) gates v1 stable release. PageHeader pilot must have all 8 Must Have sections complete before Phase 3 can be marked done.

**Model & Mode [REQUIRED]:** `/model opusplan` — Opus plans the token gap audit and preview.tsx wiring decision; Sonnet executes file writes and story authoring.

## Non-Goals

- Migrating existing Format A stories (`SectionSpacing`, `TypographyConventions`, `EntityDetailPageDocs`) to full 14-section structure — that is Phase 3 of SUG-152
- Writing Guidelines stories for components other than PageHeader in this epic
- Adding syntax highlighting to code blocks (the `helpers/docs.tsx` code block uses a dark bg + rgba text, not a full highlighter)
- Any change to `stories.boilerplate.tsx` component logic beyond what was provided in the handoff zip

## Related

- **Linear:** [SUG-158](https://linear.app/sugartown/issue/SUG-158)
- **Handoff files:** `helpers/docs.tsx`, `stories.boilerplate.tsx`, `SECTION-RULES.md`, `reference/Storybook Docs Template.html` — extracted from zip at `/Users/beckyalice/Downloads/Storybook Documentation Template.zip`
- **Depends on:** SUG-152 (DS Usage Docs audit) — Format A stories that will eventually import from helpers/docs.tsx
- **Upstream:** SUG-157 (PageHeader shipped) — PageHeader is the pilot component for Phase 3
- **`_PreviewFrame.tsx`:** `apps/storybook/.storybook/stories/_PreviewFrame.tsx` — reconcile in Phase 1
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
