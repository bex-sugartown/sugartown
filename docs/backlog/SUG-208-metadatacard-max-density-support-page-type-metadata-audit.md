---
**Epic:** SUG-208 — MetadataCard: Max-Density Support + Page-Type Metadata Audit
**Linear Issue:** [SUG-208](https://linear.app/sugartown/issue/SUG-208/metadatacard-max-density-support-page-type-metadata-audit)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-208 — MetadataCard: Max-Density Support + Page-Type Metadata Audit

Audit the metadata fields available across every page/doc type that renders MetadataCard, update the component to gracefully handle the full range of field-count density (max/med/min), and produce a Phase 0 mock covering all three densities before any implementation.

## Background

`MetadataCard.jsx` is a shared DS component ("structured metadata surface for content detail pages," per its own docblock) rendered on `CaseStudyPage`, `NodePage`, `ArticlePage`, and `ProjectDetailPage` (docblock also claims `RootPage`; unconfirmed, needs the App.jsx activation audit below). The component already carries explicit label maps for caseStudy-specific fields (`CONTRACT_TYPE_LABELS`, `COMPANY_SIZE_LABELS`, `STATUS_LABELS`), so field-level support already exists in code.

The trigger: the new "Sugartown: The Platform Is the Portfolio" case study (built on SUG-207) is the first content instance to populate nearly every optional caseStudy field simultaneously — client, employer, contractType, companySize, industry, region, dateRange, tools, categories, tags, all at once. Of the 7 prior live case studies plus this one, none had previously exercised this many populated fields on one card at the same time. The rendered result (see the reference screenshot attached to this epic's creation) shows a dense, many-column table-style card that has never been visually reviewed at this density — the code accepts the data, but nobody has confirmed the layout holds up, degrades gracefully, or reads clearly at true max density, nor has anyone documented what the medium and minimum ends of that range look like.

## Objective

After this epic: (1) a documented audit of every metadata field each MetadataCard-consuming doc type (caseStudy, article, node, project, and any others found at activation) can actually populate, organized by field-count density; (2) a Phase 0 HTML mock at `docs/drafts/SUG-208-*.html` showing max, medium, and minimum density variants side by side, reviewed and approved before any code changes; (3) `MetadataCard.jsx` and `MetadataCard.module.css` updated so all three densities render correctly, informed by the approved mock; (4) new Storybook stories covering all three densities. This epic does not add new schema fields unless the audit specifically surfaces a gap and that gap is called out and approved separately — the default assumption is this is a display-capacity problem, not a data-model problem.

## Scope

- [ ] Audit every doc type that renders (or plausibly should render) MetadataCard and list its full available metadata field set, grouped by which fields are typically populated vs. usually blank — layer: content/schema
- [ ] Identify the real max-density case (this case study), a representative medium-density case (an existing article or node with typical field population), and a real minimum-density case (a doc type with the fewest populated fields) — layer: content
- [ ] Phase 0 HTML mock at `docs/drafts/SUG-208-*.html` showing all three densities, following the Phase 0 mockup gate in CLAUDE.md — layer: content/mock (blocking gate)
- [ ] Update `MetadataCard.jsx` field-rendering logic to handle the approved max-density layout without breaking the existing medium/min renders — layer: frontend
- [ ] Update `MetadataCard.module.css` for any spacing, wrapping, or grid changes the approved mock requires — layer: frontend/CSS
- [ ] Add/update Storybook stories in `MetadataCard.stories.tsx` covering max, medium, and min density — layer: Storybook
- [ ] Chromatic VRT across all three new story states — layer: Storybook/VRT

## Phases

**Phase 0 — Audit + Mock (blocking gate, no code).** Complete the Doc Type Coverage audit, build the HTML mock at `docs/drafts/SUG-208-*.html` covering max/medium/min density, and get explicit "Visual QA approved" sign-off. No JSX or CSS may be written until this phase closes, per the CLAUDE.md Phase 0 hard-stop (this qualifies as a Phase 0 item: MetadataCard's max-density format has never been reviewed, even though the component itself is not new).

**Phase 1 — Implementation.** Update `MetadataCard.jsx`/`MetadataCard.module.css` per the approved mock, add Storybook stories for all three densities, run Chromatic VRT, verify against the Human QA Walkthrough table below.

## Acceptance criteria

- [ ] A written audit exists (in this doc or a linked activation note) listing every MetadataCard-consuming doc type's full metadata field set, with max/medium/min example docs named by real slug or ID
- [ ] `docs/drafts/SUG-208-*.html` exists showing all three density variants and has received explicit "Visual QA approved" sign-off before any implementation commit
- [ ] MetadataCard renders correctly (no overlap, no illegible wrapping, no orphaned single-column rows) at all three densities, verified against the real doc instances named in the audit — not synthetic placeholder data
- [ ] New Storybook stories exist for max/medium/min density and pass Chromatic VRT on both `default` and `dark-pink-moon` themes
- [ ] No regression on any existing MetadataCard consumer (`CaseStudyPage`, `NodePage`, `ArticlePage`, `ProjectDetailPage`, and `RootPage` if confirmed) — verified via the Human QA Walkthrough table below

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach (every MetadataCard consumer, confirmed and candidate), and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it. Specifically confirm or rule out `RootPage` as a MetadataCard consumer — the component docblock claims it, but it did not surface in an initial `grep` pass.

## Technical notes

- **Content Write Gate:** does not fire in the traditional sense — this epic does not invent editorial copy. If the audit surfaces a genuine schema-field gap requiring a new field, that proposal is a separate schema commit (see below) and any example content used in the mock must come from real, already-published field values, not invented placeholder copy.
- **Schema changes:** none assumed by default. If the Phase 0 audit finds a doc type needs a new field to reach a documented density tier, or MetadataCard needs a new display-control field (e.g. a max-visible-fields override), scope that as an explicit, separately-approved schema-field proposal before touching `apps/studio/schemas/`, and it ships as its own `feat(studio):` commit per CLAUDE.md's "Studio schema changes get their own commit" rule, followed by `npx sanity schema deploy`.
- **Upstream dependency:** the SUG-207 case study ("Sugartown: The Platform Is the Portfolio") is the origin trigger and the real-world max-density reference case. No hard blocking dependency, but the audit should use its actual populated field set as the primary max-density example rather than a constructed one.
- **Activation audits:**
  - Read `apps/web/src/App.jsx` for the full route → component map (Human QA Walkthrough table, above).
  - Read `apps/web/src/components/MetadataCard.jsx` in full (only the top ~60 lines were reviewed at stub-creation time) to confirm current field-rendering logic and label maps before proposing changes.
  - Read the schema files for every confirmed consumer doc type (`caseStudy.ts`, `article.ts`, `node.ts`, `project.ts`, and `page.ts` if `RootPage` is confirmed) to enumerate every metadata-shaped field each type can populate.
  - Review the live Storybook docs page named in this epic's origin request: `https://pinkmoon.sugartown.io/?path=/docs/patterns-metadatacard--docs` for the currently-documented usage patterns and any existing density guidance.
  - Reference screenshot of the real max-density render (the new case study's MetadataCard) is attached to Linear issue SUG-208 — use it as the literal max-density spec input for the mock, not a re-creation from memory.
- **Model & Mode [REQUIRED]:** `/model sonnet` — this is DS component work (density/layout handling) plus a schema-field audit and content/mock authoring, all within Sonnet 5's default execution mode. No architecture-level ambiguity requiring opus plan mode.

## Model & Mode [REQUIRED]

`/model sonnet` — default mode. This is component layout work, a schema/content audit, and Storybook story authoring; no monorepo-boundary or SSR-strategy ambiguity that would need opus plan mode.

## Non-Goals

- **No new schema fields by default.** This epic audits and displays existing fields; it does not propose adding metadata fields to any doc type unless the Phase 0 audit finds a specific, named gap and that gap gets its own explicit approval.
- **No redesign of MetadataCard's visual style** (the dotted-outline, bg-through-gap card-catalog aesthetic from SUG-52 stays as-is). This epic is about density/capacity handling, not a restyle.
- **No changes to which doc types render MetadataCard at all** — that is, this epic does not decide whether a currently-non-consuming doc type (e.g. `PersonProfilePage`, `ToolDetailPage`) should start rendering one. That would be a separate, explicitly-scoped epic.

## Related

- **Linear:** [SUG-208](https://linear.app/sugartown/issue/SUG-208/metadatacard-max-density-support-page-type-metadata-audit)
- **Origin case study:** SUG-207 — "Sugartown: The Platform Is the Portfolio" (the max-density reference instance)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
