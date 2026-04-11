# SUG-52 — Responsive Margin Column for Detail Pages

**Linear Issue:** SUG-52
**Revised:** 2026-04-11 (scope rethink from template selector to responsive margin column)

---

## What Changed (scope revision)

The original spec proposed a `template` selector (default / full-width / sidebar) on the `page` schema. During SUG-61 implementation, two things became clear:

1. **Default and full-width template rendering is already shipped.** RootPage now branches on `page.template`: default pages use `.detailPage` wrapper + `context="detail"`, full-width pages use `context="full"`. This was committed as part of the AI Ethics page rebuild.

2. **The sidebar isn't a page template. It's a responsive detail-page feature.** The content that belongs in a sidebar (TOC, related nodes, marginalia, metadata) lives on nodes, articles, and case studies, not on root pages. The `page` schema's template selector is the wrong place for it.

**New scope:** A responsive margin column on **all detail pages** (article, node, caseStudy) at wide viewports (1200px+). Not a template choice. Not limited to pages.

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — affects ArticlePage, NodePage, CaseStudyPage layout CSS. Extends `.detailPage` container from single-column to main + margin at 1200px+.
- [ ] **Use case coverage** — every detail page gets the margin column automatically at wide viewports. Content populates based on what's available (TOC, related nodes, metadata).
- [ ] **Layout contract** — main column: 700-760px. Margin column: 240-280px. Gap: 40px. Total: ~1080px + page gutter. Below 1200px: single column, margin content relocates.
- [ ] **Dark / theme modifier treatment** — margin column inherits theme. No per-column overrides.
- [ ] **Studio schema changes scoped** — NO new schema. Uses existing fields (relatedNodes[], categories[], tags[], sections[] headings for TOC).
- [ ] **Atomic Reuse Gate** — new CSS layout on `.detailPage`. May need a `MarginColumn` component to house the content slots.

---

## Revised Architecture

### Not a template selector. A responsive layout upgrade.

```
< 1200px (current, unchanged):
┌─────────────────────────────────────┐
│              Hero                   │
├─────────────────────────────────────┤
│         MetadataCard                │
├─────────────────────────────────────┤
│        Body Sections                │
│    (detailContext, 760px)            │
├─────────────────────────────────────┤
│      [Margin content here]          │
│   (TOC, related nodes, etc.)        │
│   (below content on mobile)         │
├─────────────────────────────────────┤
│           Citations                 │
├─────────────────────────────────────┤
│           Prev / Next               │
└─────────────────────────────────────┘

≥ 1200px (new):
┌─────────────────────────────────────────────┐
│                    Hero                     │
├─────────────────────────────────────────────┤
│               MetadataCard                  │
│          (full width, above grid)           │
├───────────────────────────┬─────────────────┤
│     Body Sections         │  Margin Column  │
│  (detailContext, 700px)   │  (sticky)       │
│                           │  240-280px      │
│                           │                 │
│                           │  • TOC          │
│                           │  • Related      │
├───────────────────────────┴─────────────────┤
│                 Citations                   │
├─────────────────────────────────────────────┤
│                Prev / Next                  │
└─────────────────────────────────────────────┘
```

### What goes in the margin column

Content populates based on what the document has. Empty slots are omitted. If all slots are empty, the margin column doesn't render (single-column layout).

| Slot | Source | Doc types | Priority |
|------|--------|-----------|----------|
| **Table of Contents** | Auto-generated from h2/h3 headings in sections[] | article, node, caseStudy | High |
| **Related Nodes** | `relatedNodes[]` field (SUG-54) | node | High |
| **Categories + Tags** | Existing taxonomy refs (remain in MetadataCard above body) | all | N/A — stays in MetadataCard |
| **Marginalia / Sidenotes** | Tufte-style annotations (SUG-57) | article, node | Deferred |
| **Glossary terms** | Terms referenced in body (SUG-35) | article, node | Deferred |

### Where margin content goes on mobile (< 1200px)

| Slot | Mobile location |
|------|----------------|
| TOC | Sticky compressed header (SUG-57 running headers) or collapsible section above body |
| Related Nodes | Section below body, above citations |
| Categories + Tags | Stay in MetadataCard above body (never moves) |
| Marginalia | Inline expandable footnotes |

---

## Already Shipped (from SUG-61 follow-up)

These items from the original SUG-52 spec are done:

- [x] GROQ projection — `template` already projected in `pageBySlugQuery`
- [x] RootPage branching — default pages use `.detailPage` + `context="detail"`, full-width pages use `context="full"`
- [x] Default template rendering — matches article/node detail page behaviour
- [x] Full-width template rendering — sections render standalone, no max-width wrapper

---

## Remaining Scope

### Phase 1: CSS layout (main + margin at 1200px+)

Update `.detailPage` in `pages.module.css`:
- At < 1200px: unchanged (single column, max-width 760px)
- At ≥ 1200px: CSS grid with `grid-template-columns: 1fr var(--st-space-margin-column, 260px)` and `gap: var(--st-space-section-break-detail)`
- Max-width increases to ~1080px at wide viewports
- Margin column: `position: sticky; top: var(--header-height, 80px)`

### Phase 2: MarginColumn component

New component that reads document data and renders available slots:
- TOC: extract h2/h3 from sections[] at render time (no schema change)
- Related Nodes: render `relatedNodes[]` as linked list
- Conditional rendering: if no slots have content, component returns null (no empty column)

### Phase 3: Page component wiring

- ArticlePage, NodePage, CaseStudyPage: pass document data to MarginColumn
- MarginColumn renders inside `.detailPage` as the second grid column child
- Below 1200px: MarginColumn relocates (CSS order or conditional rendering)

---

## Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| SUG-54 `relatedNodes[]` | ✅ Shipped | Enables "Related Nodes" slot |
| SUG-53 spacing tokens | ✅ Shipped | `--st-space-margin-column` token (defined but not yet valued) |
| SUG-57 marginalia/sidenotes | Backlog | Enables "Marginalia" slot (deferred) |
| SUG-57 running headers | Backlog | Mobile TOC alternative (deferred) |
| SUG-35 glossary | Backlog | Enables "Glossary terms" slot (deferred) |

---

## Files to Modify

- `apps/web/src/pages/pages.module.css` — `.detailPage` grid layout at 1200px+
- `apps/web/src/components/MarginColumn.jsx` — CREATE
- `apps/web/src/components/MarginColumn.module.css` — CREATE
- `apps/web/src/pages/ArticlePage.jsx` — render MarginColumn
- `apps/web/src/pages/NodePage.jsx` — render MarginColumn
- `apps/web/src/pages/CaseStudyPage.jsx` — render MarginColumn

---

## Non-Goals

- ~~Template selector on page schema~~ (default/full-width branching already shipped; sidebar is not a template)
- No sidebar on root pages (content pages like AI Ethics don't need a margin column; they're self-contained)
- No schema changes (uses existing relatedNodes[], sections[], categories[], tags[])
- No marginalia/sidenote content (SUG-57)
- No glossary term extraction (SUG-35)

---

## Acceptance Criteria

- [ ] Detail pages (article, node, caseStudy) show margin column at ≥ 1200px
- [ ] Margin column contains TOC (auto-generated from section headings)
- [ ] Node detail pages show related nodes in margin column (from `relatedNodes[]`)
- [ ] Below 1200px: single column, margin content relocates below body
- [ ] If no margin content exists, column doesn't render (no empty space)
- [ ] Margin column is sticky (follows scroll)
- [ ] Existing spacing (Section Layout Contract) is not broken

---

## Risks / Edge Cases

- [ ] Short pages — if body content is shorter than the margin column, sticky positioning looks awkward. Guard: margin column height should not exceed body height.
- [ ] TOC extraction — needs to handle sections without headings gracefully (skip them).
- [ ] Performance — TOC extraction at render time is cheap (array map over sections), not a concern.
- [ ] Hero full-width — hero should span above the grid, not be constrained to the main column. Current architecture already handles this (hero renders outside `.detailPage`).

---

*Revised 2026-04-11. Original spec 2026-04-08.*
