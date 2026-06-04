---
**Epic:** SUG-152 — DS Usage Docs — Storybook documentation audit and creation
**Linear Issue:** [SUG-152](https://linear.app/sugartown/issue/SUG-152/ds-usage-docs-storybook-documentation-audit-and-creation-phase-n)
**Status:** In Progress
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per usage doc, one mini-release at end of full audit cycle
---

# SUG-152 — DS Usage Docs — Storybook documentation audit and creation

The design system has many implicit conventions that live only in CLAUDE.md, code comments, or institutional memory. SUG-141 established the template and style guide and shipped the first usage doc (H1 italic/roman rule). This epic audits the remaining undocumented conventions and produces a usage doc for each — one topic at a time, with explicit review before each doc is written.

## Background

The H1 italic/roman rule was reverse-engineered from scattered CSS files. The same problem exists for spacing contracts, component composition rules, folio layout conventions, chip taxonomy, breakpoint rationale, and more. Every new session or contributor starts from scratch.

SUG-141 proved the format: a Storybook `.stories.tsx` page in `Foundations/` with inline styles, the rule stated up front, live visual examples, and do/don't pairs. This epic applies that pattern to the rest of the undocumented surface.

## Objective

A growing library of usage docs in Storybook `Foundations/` — each covering one implicit DS convention. Docs are reviewed and approved before being written. No doc is written speculatively.

**Delivery surface:** `apps/storybook/.storybook/stories/` — `.stories.tsx` format, `Foundations/<Name>` title, inline styles only (no className imports, no new CSS files).

**Reference:** `TypographyConventions.stories.tsx` (SUG-141) — the canonical example.  
**Style guide:** `docs/conventions/usage-doc-style-guide.md`

## Execution model

For each phase:
1. Propose the topic — title, one-liner, what the rule covers, what the live preview would show
2. **Pause for review** — user confirms angle, flags any pivots, approves before writing
3. Write the `.stories.tsx` file
4. Commit: `docs(storybook): SUG-152 — <Topic> usage doc`

This is not a batch operation. Topics are sequential, reviewed individually.

## Candidate topics (ordered by value — subject to reorder at review)

### Phase 1 — Section spacing contract

**Proposed title:** Section Spacing Contract  
**One-liner:** How inter-section gap is owned by the layout container, not by individual components.  
**Rule:** `.detailContext` owns all vertical gap via `display: flex; gap`. Components must have zero external margin. Internal padding (box inset) is allowed.  
**Why it matters:** The most common layout bug in this codebase. Every new section type that adds its own `margin-block` produces double-padding. The rule is in CLAUDE.md but invisible to anyone reading component code.  
**Live preview idea:** Side-by-side — correct (gap only on parent) vs wrong (component adds margin-block, gap doubles).

### Phase 2 — Entity folio layout contract

**Proposed title:** Entity Folio Layout  
**One-liner:** The flex-row layout that wraps thumbnail, name, eyebrow, and description on all entity detail pages.  
**Rule:** `entityFolio` is the canonical surface — thumbnail on the left, `folioIdentity` on the right. No folio is implemented by hand.  
**Why it matters:** Every new entity type (person, tool, project, client) uses this pattern. Without the doc, each implementation drifts.  
**Live preview idea:** Annotated folio with thumbnail slot, eyebrow, heading, description, and metadata — labelled with class names.

### Phase 3 — Chip taxonomy: Chip vs Tag vs Pill

**Proposed title:** Chip / Tag Taxonomy  
**One-liner:** Which DS component to use when — Chip, Tag, or inline chip pattern — and when not to create a new one.  
**Rule:** Chip = interactive (filterable, clickable). Tag = read-only label. Pill = deprecated alias for Chip. Expertise chips on profile pages use the inline `.expertiseChip` pattern because they carry routing links.  
**Why it matters:** Three names in the codebase that map to overlapping concepts. New surfaces reach for the wrong one.  
**Live preview idea:** Three-row comparison table: Chip / Tag / expertiseChip — visual state, interactivity, usage context.

### Phase 4 — Component composition: Card vs ContentCard vs MetadataCard

**Proposed title:** Card Composition Rules  
**One-liner:** When to use the DS Card primitive vs ContentCard adapter vs MetadataCard — and when to compose from scratch.  
**Rule:** Card = DS primitive, no data binding. ContentCard = bound to Sanity content types (article, node, caseStudy). MetadataCard = canonical metadata surface on entity detail pages. Never re-implement MetadataCard inline.  
**Why it matters:** Three components with overlapping visual affordance but distinct contracts. The rule is in MEMORY.md but not visible in Storybook.  
**Live preview idea:** Three columns — one example per component, showing the bounding use case, with "don't use here" cross-examples.

### Phase 5 — Responsive breakpoints

**Proposed title:** Breakpoint Rationale  
**One-liner:** What the two primary breakpoints are, which surfaces they govern, and why the values were chosen.  
**Rule:** `860px` — table / grid collapse breakpoint (prose + 2-col grid minimum). `768px` — nav breakpoint (mobile nav toggle threshold).  
**Why it matters:** Hardcoded in CSS, not in tokens, with no explanation of the derivation. New surfaces pick arbitrary values.  
**Live preview idea:** Annotated ruler/range diagram showing the two breakpoints and which surfaces collapse at each.

### Phase 6 — Token naming rationale

**Proposed title:** Semantic vs Primitive Tokens  
**One-liner:** Why `--st-color-text-primary` and `--st-color-brand-primary` are different tokens and when to use each.  
**Rule:** Semantic tokens (`text-primary`, `bg-surface`) vary by theme. Primitive tokens (`pink`, `midnight-800`) are fixed values. Use semantic tokens in components; use primitives only in token definitions.  
**Why it matters:** Developers reach for the wrong layer and then wonder why the dark theme breaks. This is the most common token mistake in code review.  
**Live preview idea:** Two-column table: "Correct" (semantic in component) vs "Wrong" (primitive in component) — with what breaks in each theme.

---

## Scope

- Documentation and Storybook authoring only
- No changes to CSS, JSX, or schema
- Each doc ships as its own commit
- One mini-release covers the full audit cycle at close

## Acceptance criteria

- [ ] All candidate topics reviewed (accepted, rejected, or deferred) in the order above
- [ ] Each accepted topic has a `.stories.tsx` file in `apps/storybook/.storybook/stories/`
- [ ] Each story renders in Storybook under `Foundations/<Name>`
- [ ] Content follows the style guide: rule first, live preview, do/don't, implementation
- [ ] No hardcoded hex values in any story file — all colours via `var(--st-*)`

## Technical notes

- **No Content Write Gate** — Storybook `.stories.tsx` is code, not Sanity content
- **No schema changes** — delivery is entirely in Storybook
- **Reference implementation:** `apps/storybook/.storybook/stories/TypographyConventions.stories.tsx`
- **Template:** `apps/storybook/.storybook/stories/_UsageDocTemplate.tsx`
- **Style guide:** `docs/conventions/usage-doc-style-guide.md`

## Model & Mode

`/model sonnet` — prose authoring and Storybook TSX, no architecture decisions needed.

## Non-Goals

- No new page templates, routes, or Sanity documents
- No changes to CSS, tokens, or component code
- Does not replace inline code comments
- No third-party DS doc tools
