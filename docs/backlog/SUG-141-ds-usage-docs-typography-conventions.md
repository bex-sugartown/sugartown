---
**Epic:** SUG-141 — DS Usage Docs — Typography conventions
**Linear Issue:** [SUG-141](https://linear.app/sugartown/issue/SUG-141/ds-usage-docs-typography-conventions-h1-italic-rule-phase-n-inventory)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-141 — DS Usage Docs — Typography conventions

The design system has implicit typographic conventions that live only in code and institutional memory. Phase 1 uses the H1 italic rule as the first worked example and publishes it as a DS usage doc in the Platform section. Further phases inventory and document other undocumented conventions.

## Background

During a session reviewing the `/projects/sugartown-cms` page, the question arose: should the H1 be italic? The correct answer — no, project pages are catalogue surfaces, not editorial surfaces — exists in the codebase but is not documented anywhere visible. The rule has to be reverse-engineered from `pages.module.css` and scattered component files.

The pattern repeats across the DS: spacing contracts, token naming rationale, component composition rules, folio conventions, and responsive behaviour all exist implicitly in code. Every new session or contributor starts from scratch. The cost is wasted debugging time and inconsistent implementation.

The `/platform/design-system` section already has a registry and a section showcase. Usage docs are the natural next layer — not API docs, but decision records: *why* a convention exists and *where* it applies.

## Objective

After Phase 1: one published DS usage doc covering the H1 italic/roman convention — what the rule is, which surfaces it applies to, which classes implement it, and the reasoning behind it. Accessible at `/platform/design-system` or as a linked doc from the DS overview. After Phase N: a growing library of similar usage docs covering other implicit DS conventions.

This epic does NOT change any code — it is a documentation and content authoring epic only. No CSS, JSX, or schema changes.

## Scope

### Phase 1 — H1 italic rule (first usage doc)

- [ ] Write the usage doc content (Bex-voice, factual, concise) — layer: content
- [ ] Create the Sanity document (page or article) at an appropriate route — layer: schema/content
- [ ] Link from DS overview page or section in Platform nav if appropriate — layer: content/Studio

**The rule to document:**

| Surface | H1 style | Class / mechanism | Reasoning |
|---------|----------|-------------------|-----------|
| Article detail | Italic | `.masthead h1` → inherits from global h1 narrative rule | Cormorant Garamond editorial register |
| Node detail | Italic | Same | Same |
| Case study detail | Italic | Same | Same |
| Archive mastheads (articles, nodes, KG, library) | Italic | `.archiveHeadingItalic` modifier on `.archiveHeading` | Narrative index surfaces |
| Homepage hero | Italic | Hero section heading CSS | Editorial register |
| Project detail | Roman (no italic) | `.projectName` — no `font-style` | Catalogue/reference surface |
| Person detail | Roman | `.entityFolio` pattern | Same |
| Tool detail | Roman | Same | Same |
| Category / tag detail | Roman | Same | Same |

**Key files:**
- `apps/web/src/pages/pages.module.css` — `.archiveHeadingItalic`, `.archiveHeading`, `.masthead`
- `apps/web/src/pages/ProjectDetailPage.module.css` — `.projectName` (no italic)
- Global h1-h4 narrative rule in base CSS (Cormorant Garamond applies to all headings; italic is an additive modifier, not the default)

### Phase 2+ — Inventory and prioritise remaining conventions

Candidates (not scoped here — prioritise at Phase 1 close):
- Spacing contract: section gap vs component padding (the `.detailContext` gap model)
- Token naming rationale: why `--st-color-text-primary` ≠ `--st-color-brand-primary`
- Folio layout contract: eyebrow + thumbnail + name + description pattern
- Component composition rules: when Card vs ContentCard vs MetadataCard
- Responsive breakpoint rationale: 860px table breakpoint, 768px nav breakpoint
- Chip taxonomy: Chip vs Tag vs Pill usage

## Acceptance criteria

- [ ] One published usage doc covering the H1 italic/roman rule, accessible from the live site
- [ ] Doc covers: the rule, the two surface types, the CSS classes that implement it, and the rationale
- [ ] Content is Bex-voice, not generic docs prose — same register as other Platform content
- [ ] No code changes in `apps/web/src/` — documentation only
- [ ] Phase 2 scope list exists (in this doc or a follow-on stub) to continue the pattern

## Technical notes

- **Content Write Gate**: fires — content is AI-drafted from the brief above. Proposal required before patch.
- **No schema changes**: existing page/article schema is sufficient. The doc can be a `page` at a sub-route of `/platform/design-system/` or a standalone article with a `platform` category.
- **Activation audit**: query Sanity for existing DS docs at `/platform/design-system/*` to understand what route pattern to use: `*[_type == "page" && slug.current match "platform/design-system*"]{ slug, title }`.
- **Model & Mode**: `/model sonnet` — pure content authoring, no code changes.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/editorial epic, no code changes. Sonnet for drafting; Bex reviews before Sanity patch.

## Non-Goals

- No new page templates or routes
- No changes to CSS, tokens, or component code
- No Storybook story changes
- Does not replace inline code comments (those are separate)

## Related

- **Linear:** [SUG-141](https://linear.app/sugartown/issue/SUG-141/ds-usage-docs-typography-conventions-h1-italic-rule-phase-n-inventory)
- **Trigger:** H1 italic question raised during `/projects/sugartown-cms` review, 2026-06-02
- **Related surfaces:** `apps/web/src/pages/pages.module.css`, `ProjectDetailPage.module.css`
- **Epic template:** `docs/epic-template.md`
