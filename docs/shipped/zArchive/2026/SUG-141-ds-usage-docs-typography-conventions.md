---
**Epic:** SUG-141 — DS Usage Docs — Typography conventions + usage doc template
**Linear Issue:** [SUG-141](https://linear.app/sugartown/issue/SUG-141/ds-usage-docs-typography-conventions-h1-italic-rule-phase-n-inventory)
**Status:** In Progress
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

After Phase 1: one published DS usage doc covering the H1 italic/roman convention — what the rule is, which surfaces it applies to, which classes implement it, and the reasoning behind it. After Phase N: a growing library of similar usage docs. After Phase N: a growing library of similar usage docs covering other implicit DS conventions.

**Delivery surface: Storybook MDX (not a Sanity site page).** Usage docs live in Storybook alongside the components they document — co-located, version-controlled, dev-facing. A `TypographyConventions.mdx` doc page in the `Foundations` Storybook category can embed live story canvases inline alongside prose. This is preferable to a Sanity `/platform/design-system` page for developer-facing convention docs (those are for external/stakeholder showcasing). Third-party tools (Zeroheight, Supernova) are out of scope — overkill for a solo-maintained codebase.

This epic does NOT change any CSS, JSX, or schema — documentation and MDX authoring only.

## Scope

### Phase 0 — Usage doc template + style guide (prerequisite — complete)

Before writing usage docs, a shared template and written style guide must exist so all docs follow the same format.

- [x] Write `docs/conventions/usage-doc-style-guide.md` — section order, voice rules, what to exclude, format conventions
- [x] Create `apps/storybook/.storybook/stories/_UsageDocTemplate.tsx` — copy-paste starting point for new docs (not a rendered story — plain `.tsx` alongside stories)

**Derived from:** ELC/EDS reference docs (Button Group doc, Shade Picker doc, Stack examples layout diagram). Key pattern: usage-first, visual-first, no internal history or phase references.

**Template sections (in order):** Title + one-liner → The rule → When to use → Examples table (with live preview) → Do / Don't → Implementation → Accessibility

### Phase 1 — H1 italic rule (first usage doc)

- [x] Initial story created at `apps/storybook/.storybook/stories/TypographyConventions.stories.tsx`
- [x] **Design critique and rule verification** — full visual audit of all page types confirmed the actual rule (see below). Initial doc was wrong on multiple surfaces.
- [x] **Fix tool folio italic** — `ToolDetailPage` was using italic via `.narrativeHeading`; changed to roman per Option B decision. `.narrativeHeadingItalic` modifier added; `PersonProfilePage` applies both classes.
- [x] **Rewrite to match usage doc template** — doc rewritten using Phase 0 template format: rule → when to use → examples → do/don't → implementation.
- [x] No Sanity page, no site route — Storybook is the delivery surface

**Verified rule (confirmed by visual audit 2026-06-04):**

| Surface | H1 style | CSS mechanism |
|---------|----------|---------------|
| Archive mastheads (Library, Agentic Caucus Nodes, etc.) | **Italic** | `.archiveHeading.archiveHeadingItalic` |
| Person folio | **Italic** | `.narrativeHeading.narrativeHeadingItalic` |
| Hero (article, node, editorial, homepage, about, platform, services) | **Roman** | `Hero .heading` — global h1 rule, no italic |
| Project folio | **Roman** | `.narrativeHeading` (roman default) |
| Tool folio | **Roman** | `.narrativeHeading` (roman default) — was italic, fixed |
| Tag / category folio | **Roman** | `.archiveHeading` — no italic modifier |
| Series page | **Roman** | `.narrativeHeading` (roman default) |

**Option B decision:** Only persons use italic. All other entity folios (tool, project, tag, category, series) are roman. Rationale: italic = entity has a voice/point of view; roman = catalogue entry. Confirmed by Bex 2026-06-04.

**Key files:**
- `apps/web/src/pages/pages.module.css` — `.narrativeHeading` (roman default), `.narrativeHeadingItalic` (person modifier), `.archiveHeading`, `.archiveHeadingItalic`
- `apps/web/src/pages/PersonProfilePage.jsx` — uses both `.narrativeHeading.narrativeHeadingItalic`
- `apps/web/src/pages/ToolDetailPage.jsx` — uses `.narrativeHeading` only (roman)
- `apps/web/src/components/Hero.module.css` — `.heading` sets font-size only; roman via global h1 rule

### Phase 2+ — Inventory and prioritise remaining conventions

Candidates (not scoped here — prioritise at Phase 1 close):
- Spacing contract: section gap vs component padding (the `.detailContext` gap model)
- Token naming rationale: why `--st-color-text-primary` ≠ `--st-color-brand-primary`
- Folio layout contract: eyebrow + thumbnail + name + description pattern
- Component composition rules: when Card vs ContentCard vs MetadataCard
- Responsive breakpoint rationale: 860px table breakpoint, 768px nav breakpoint
- Chip taxonomy: Chip vs Tag vs Pill usage

## Acceptance criteria

- [ ] Storybook MDX page at `apps/storybook/.storybook/stories/TypographyConventions.mdx` exists and renders in Storybook under `Foundations`
- [ ] Doc covers: the H1 italic/roman rule, the two surface types (editorial vs catalogue), the CSS classes that implement it, and the rationale
- [ ] Content is Bex-voice, factual, concise — not generic API docs prose
- [ ] No code changes in `apps/web/src/` — documentation only
- [ ] Phase 2 scope list exists (in this doc or a follow-on stub) to continue the pattern

## Technical notes

- **No Content Write Gate**: Storybook MDX is code, not Sanity content — no patch gate fires.
- **No schema changes, no Sanity documents**: delivery is entirely in Storybook.
- **Activation audit**: check existing Storybook `Foundations` stories for naming/format conventions: `apps/storybook/.storybook/stories/ThemeGuide.stories.tsx`, `TokenReference.stories.tsx`. Match their MDX structure.
- **Model & Mode**: `/model sonnet` — prose authoring and MDX, no architecture decisions needed.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/editorial epic, no code changes. Sonnet for drafting; Bex reviews before Sanity patch.

## Non-Goals

- No new page templates, routes, or Sanity documents
- No changes to CSS, tokens, or component code
- No third-party DS doc tools (Zeroheight, Supernova) — Storybook is sufficient for dev-facing docs
- Does not replace inline code comments (those are separate)
- External/stakeholder-facing DS showcasing remains in `/platform/design-system` on the site — this epic is developer-facing only

## Related

- **Linear:** [SUG-141](https://linear.app/sugartown/issue/SUG-141/ds-usage-docs-typography-conventions-h1-italic-rule-phase-n-inventory)
- **Trigger:** H1 italic question raised during `/projects/sugartown-cms` review, 2026-06-02
- **Related surfaces:** `apps/web/src/pages/pages.module.css`, `ProjectDetailPage.module.css`
- **Epic template:** `docs/epic-template.md`
