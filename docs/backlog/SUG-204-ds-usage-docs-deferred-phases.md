---
**Epic:** SUG-204 — DS Usage Docs — Deferred Phases (SUG-152 continuation)
**Linear Issue:** [SUG-204](https://linear.app/sugartown/issue/SUG-204/ds-usage-docs-deferred-phases-sug-152-continuation)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-204 — DS Usage Docs — Deferred Phases (SUG-152 continuation)

Carry forward the 8 deferred Storybook usage-doc phases (plus the Contributing category-taxonomy sub-task) that SUG-152 parked pending a doc-framework strategic review.

## Background

SUG-152 systematically documented implicit DS conventions as Storybook `Foundations/` usage docs. It shipped Phases 1 (Section Spacing Contract), 2 (EntityDetailPage folio), 6b (MDX infrastructure), and the Foundations/Layout reorg — released in v0.26.9 and v0.26.12 — then was closed for what shipped. Phases 3–10 and the Contributing sub-task were all deferred with the same note: "Pending strategic review of doc framework approach." This epic is their clean home so the deferred work isn't stranded inside a closed epic.

## Objective

After this epic: the remaining DS conventions most likely to be mis-implemented have Storybook usage docs, completing the `Foundations/` reference set begun in SUG-141/SUG-152. Layers touched: **Storybook story/MDX files only** (`.stories.tsx`, `.mdx`) plus title-string-only edits to existing Grid/PageHeader stories. Explicitly excluded: Sanity schema, GROQ queries, React render logic, web page CSS, tokens (no new tokens — docs reference existing `--st-*` tokens only).

## Scope

Each phase is an independently completable usage doc, reviewed and approved before authoring (per SUG-152's execution model — propose angle, pause for review, then write).

- [ ] Phase 3 — Chip / Tag Taxonomy usage doc — layer: Storybook (Format A). **Blocked on Chip API settling.**
- [ ] Phase 4 — Card Composition Rules usage doc — layer: Storybook (Format A)
- [ ] Phase 5 — Responsive Breakpoints usage doc — layer: Storybook (Format A)
- [ ] Phase 6 — Semantic vs Primitive Tokens usage doc — layer: Storybook (Format A)
- [ ] Phase 7 — Grid Usage doc — layer: Storybook (Format B MDX + stories; title-string edit to Grid.stories)
- [ ] Phase 8 — Component Naming Decisions usage doc — layer: Storybook (Format A)
- [ ] Phase 9 — PageHeader Pattern doc — layer: Storybook (Format B MDX + stories)
- [ ] Phase 10 — Archive Page Patterns usage doc — layer: Storybook (Format A)
- [ ] Contributing.stories.tsx — category-taxonomy section — layer: Storybook (modify existing story)

## Phases

Multi-phase, merge-as-you-go. Each phase ships one usage doc (or the Contributing edit) that renders in Storybook `Foundations/` without console errors on both `default` and `dark-pink-moon` themes. Full topic briefs, CSS surfaces, token lists, and SUG-156 references for every phase are preserved verbatim in the SUG-152 epic doc — reuse them at activation. Phase 3 stays blocked until the Chip API is finalised; all phases stay blocked until the doc-framework strategic review resolves.

## Acceptance criteria

- [ ] Each accepted phase has a `.stories.tsx` (or `.mdx` + `.stories.tsx` pair for Format B) file that renders in Storybook `Foundations/` without console errors
- [ ] No hardcoded hex/rgba values in any story file — verified by `pnpm validate:tokens --strict-colors` (zero violations)
- [ ] Each story follows the style guide: rule first, live preview using real DS tokens, do/don't pairs, implementation references
- [ ] Each story renders correctly on both `default` and `dark-pink-moon` Storybook themes
- [ ] Content is prescriptive and usage-facing — no origin history, no phase candidates, no uncertainty markers

## Human QA Walkthrough — example local pages

Not applicable — Storybook usage docs only. No shared web CSS, layout token, or multi-page web component changes. QA surface is Storybook at `http://localhost:6006`, reviewed per phase on both themes (see Acceptance criteria).

## Technical notes

- **Primary blocker — doc-framework strategic review:** All phases are blocked on a strategic decision Bex owns about the doc framework approach. Do not begin authoring until it resolves. This is a hard gate, not a suggestion.
- **Phase 3 secondary blocker — Chip API:** The Chip component API is in flux (badge rename, `status` prop deprecation, `colorHex` deprecation). Phase 3 cannot be written accurately until it settles. Honour DS Doc Authoring Gate 1 (API stability) before writing beyond Overview.
- **Pre-authoring gates:** DS Documentation Authoring Gates 1 (API stability), 2 (template lock), and 3 (framework-agnostic) from `docs/conventions/usage-doc-style-guide.md` apply to every phase.
- **Format split:** Phases 3, 4, 5, 6, 8, 10 + Contributing = Format A (`.stories.tsx`). Phases 7, 9 = Format B (`.mdx` + `.stories.tsx`). MDX infrastructure (6b) already shipped in SUG-152 — Format B phases are unblocked infrastructurally.
- **No component/CSS/token changes:** Story files use inline styles and existing `var(--st-*)` tokens only. Grid/PageHeader story edits are title-string changes for the Foundations/Layout reorg — no logic or rendering changes.
- **Activation audit:** before writing each phase, re-read that phase's topic brief in `docs/backlog/SUG-152-ds-storybook-usage-docs-audit.md` (briefs, CSS surfaces, token lists, and SUG-156 live references are preserved there) and confirm the referenced DS component API is still current.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/editorial epic. Prose authoring and Storybook TSX/MDX only. No architecture decisions, no schema, no component logic. (Same as SUG-152.)

## Non-Goals

- No CSS, schema, or token changes (docs reference existing tokens only)
- No new page templates, routes, or Sanity documents
- No new DS components — story files replicate visuals with inline styles, never import page CSS modules or `apps/web/src/` components
- No third-party DS doc tools (Zeroheight, Supernova)
- External/stakeholder DS showcasing stays at `/platform/design-system` — these docs are developer-facing

## Related

- **Linear:** [SUG-204](https://linear.app/sugartown/issue/SUG-204/ds-usage-docs-deferred-phases-sug-152-continuation)
- **Parent (closed):** [SUG-152](https://linear.app/sugartown/issue/SUG-152) — shipped-phase record and full topic briefs live here
- **Template origin:** [SUG-141](https://linear.app/sugartown/issue/SUG-141) — first usage doc + template
- **Style guide + gates:** `docs/conventions/usage-doc-style-guide.md`
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
