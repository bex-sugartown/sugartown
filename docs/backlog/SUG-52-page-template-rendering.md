# SUG-52 — Responsive Margin Column for Detail Pages

**Linear Issue:** SUG-52
**Revised:** 2026-04-13 (mock approved; design system tokens; implementation spec)

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
- [ ] **Studio schema changes scoped** — Phase 0.5 schema prep: rename `relatedNodes` → `related` (broaden refs), add `related` + `series`/`partNumber` to missing types. Separate hygiene pass in SUG-62.
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
| **Related** | `related[]` field (renamed from `relatedNodes`, refs: node, article, caseStudy) | article, node, caseStudy | High |
| **Series nav** | `series` + `partNumber` fields | article, node | High |
| **Categories + Tags** | Existing taxonomy refs (remain in MetadataCard above body) | all | N/A — stays in MetadataCard |
| **Marginalia / Sidenotes** | Tufte-style annotations (SUG-57) | article, node | Deferred |
| **Glossary terms** | Terms referenced in body (SUG-35) | article, node | Deferred |

### Where margin content goes on mobile (< 1200px)

| Slot | Mobile location |
|------|----------------|
| TOC | Sticky compressed header (SUG-57 running headers) or collapsible section above body |
| Related | Section below body, above citations |
| Series nav | Inline prev/next within series, above citations |
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

### Phase 0: HTML mock ✅

HTML mock created at `docs/drafts/SUG-52-margin-column-mock.html` (local-only, gitignored).
Shows margin column layout at 1200px+ alongside single-column layout. Uses "The Great Disconnection" node content with:
- Auto-generated TOC from section headings (scroll-spy active highlight)
- Related content as linked list (cross-type: node, article)
- Series navigation slot
- Sticky behaviour on scroll
- Mobile collapse (margin content relocates below body)
- Maxed-out MetadataCard (catalog-card grid with all fields populated)
- Toggle controls: viewport switch, grid debug overlay, dark mode

**Design decisions from mock review (2026-04-13):**

Visual:
- Vintage card catalog aesthetic: neutral gray dotted outer borders (`--st-color-softgrey-500`) on MetadataCard + marginalia
- Interior dividers: bg-through-gap pattern (zero CSS borders inside cards, uniform line rendering on retina)
- Scalar fields: flex-wrap with `flex-grow` so wrapped rows fill full width
- Chips: sm variant (0.6rem, tight padding, 2px radius)
- All non-chip links: `text-default` color, `pink` on hover (consistent across card + marginalia)
- Related content: mini grid with bordered type badge (NODE/ARTICLE) left column, title right column

Typography:
- Unified mono label token: `--st-label-font` / `--st-label-size` (0.65rem) / `--st-label-weight` (600) / `--st-label-tracking` (0.1em)
- Applied to: meta-labels, margin headings, eyebrows, series position, citations heading, nav labels, related type badges
- Mono heading color: `--st-color-charcoal-light` (#3a3a3a) - one shade lighter than charcoal
- Mini-badges: `--st-color-neutral-600` (#525252)
- Note: Courier Prime ships 400/700 only. 600 is browser-synthesized. Test in real app before locking.

Colors (dark mode):
- Opaque dark mode colors to prevent rgba stacking: surface `#1b2033`, divider `#2d3148`, dotted outline `#4a5068`

AI Disclosure:
- **Dynamically assembled, not a free-text field.** If `tools[]` includes AI-category tools, render: "Drafted with [AI tool names], edited by [person]. All analysis and conclusions are human-authored. [AI Ethics Statement link]"
- `aiDisclosure` free-text field becomes optional override
- Disclosure body matches marginalia text style (0.8125rem, default color, no italic)
- Ethics link uses mono label tokens

Mock approved 2026-04-13. Proceeding to implementation.

### Phase 0.5: Schema prep

Minimal schema changes required for the margin column to have cross-type content:

1. **Rename `relatedNodes` → `related`** on `node` schema
   - Broaden reference types: `[node, article, caseStudy]` (was node-only)
   - Update field title: "Related Nodes" → "Related"
   - Update description: "Cross-references to related content. Populates the margin column on detail pages."

2. **Add `related` field to `article` and `caseStudy` schemas**
   - Same definition as node: array of references to `[node, article, caseStudy]`
   - Placed in metadata group

3. **Add `series` + `partNumber` to `node` schema**
   - Same definition as article: `series` ref → series doc, `partNumber` number
   - Enables series navigation in margin column for nodes

4. **Update GROQ queries** — `articleBySlugQuery`, `nodeBySlugQuery`, `caseStudyBySlugQuery` must project `related[]` and `series`/`partNumber` where added

5. **Deploy schema** — `npx sanity schema deploy` from `apps/studio/`

Separate hygiene pass (deprecations, page field removals, hidden fields) tracked in **SUG-62**.

### Phase 1: CSS layout (main + margin at 1200px+)

Update `.detailPage` in `pages.module.css`:
- At < 1200px: unchanged (single column, max-width 760px)
- At >= 1200px: CSS grid with `grid-template-columns: 1fr var(--st-space-margin-column, 260px)` and `gap: 0 2.5rem`
- Max-width increases to ~1080px at wide viewports
- Margin column: `position: sticky; top: calc(var(--header-height, 80px) + 1.5rem)`; `align-self: start`
- Margin column styling: `background: var(--st-color-bg-surface)`; `border: 2px dotted var(--st-color-softgrey-500)`; inner padding `1.25rem 1rem`
- Margin section headings: unified `--st-label-*` tokens; `border-bottom: 1px solid var(--st-color-softgrey-300)` dividers
- MetadataCard stays full-width above the grid (renders before `.detailPage` grid or spans both columns)

### Phase 2: MarginColumn component

New component that reads document data and renders available slots:
- TOC: extract h2/h3 from sections[] at render time (no schema change)
- Related: render `related[]` as linked list with per-item type label
- Series nav: render series position + prev/next within series
- Conditional rendering: if no slots have content, component returns null (no empty column)

### Phase 3: Page component wiring

- ArticlePage, NodePage, CaseStudyPage: pass document data to MarginColumn
- MarginColumn renders inside `.detailPage` as the second grid column child
- Below 1200px: MarginColumn relocates (CSS order or conditional rendering)

---

## Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| SUG-54 `relatedNodes[]` | ✅ Shipped | Original field; renamed to `related` in Phase 0.5 |
| SUG-53 spacing tokens | ✅ Shipped | `--st-space-margin-column` token (defined but not yet valued) |
| SUG-62 schema hygiene | Backlog | Deprecations + page field cleanup (independent of margin column) |
| SUG-57 marginalia/sidenotes | Backlog | Enables "Marginalia" slot (deferred) |
| SUG-57 running headers | Backlog | Mobile TOC alternative (deferred) |
| SUG-35 glossary | Backlog | Enables "Glossary terms" slot (deferred) |

---

## Files to Modify

**Phase 0.5 (schema prep):**
- `apps/studio/schemas/documents/node.ts` — rename `relatedNodes` → `related`, broaden refs; add `series` + `partNumber`
- `apps/studio/schemas/documents/article.ts` — add `related` field
- `apps/studio/schemas/documents/caseStudy.ts` — add `related` field
- `apps/web/src/lib/queries.js` — update GROQ projections for `related[]`, `series`, `partNumber`

**Phase 1-3 (layout + component):**
- `apps/web/src/pages/pages.module.css` — `.detailPage` grid layout at 1200px+
- `apps/web/src/components/MarginColumn.jsx` — CREATE
- `apps/web/src/components/MarginColumn.module.css` — CREATE
- `apps/web/src/pages/ArticlePage.jsx` — render MarginColumn
- `apps/web/src/pages/NodePage.jsx` — render MarginColumn
- `apps/web/src/pages/CaseStudyPage.jsx` — render MarginColumn

---

## Non-Goals

- ~~Template selector on page schema~~ (default/full-width branching already shipped; sidebar is not a template; `template` field deprecated in SUG-62)
- No sidebar on root pages (content pages like AI Ethics don't need a margin column; they're self-contained)
- No schema hygiene (deprecations, page field removals, hidden fields) — tracked in SUG-62
- No marginalia/sidenote content (SUG-57)
- No glossary term extraction (SUG-35)
- No breadcrumbs for nested pages (deferred to IA Phase 2)

---

## Acceptance Criteria

- [ ] `relatedNodes` renamed to `related` with broadened refs (node, article, caseStudy)
- [ ] `related` field added to article and caseStudy schemas
- [ ] `series` + `partNumber` fields added to node schema
- [ ] Schema deployed; GROQ queries updated
- [ ] Detail pages (article, node, caseStudy) show margin column at ≥ 1200px
- [ ] Margin column contains TOC (auto-generated from section headings)
- [ ] All detail page types show related content in margin column (from `related[]`)
- [ ] Series navigation renders in margin column when doc belongs to a series
- [ ] Below 1200px: single column, margin content relocates below body
- [ ] If no margin content exists, column doesn't render (no empty space)
- [ ] Margin column is sticky (follows scroll)
- [ ] Margin column uses neutral surface bg with dotted softgrey-500 outline
- [ ] AI Disclosure assembles dynamically from tools[] + author
- [ ] Unified mono label tokens applied to all uppercase mono labels
- [ ] Existing spacing (Section Layout Contract) is not broken

---

## Risks / Edge Cases

- [ ] Short pages — if body content is shorter than the margin column, sticky positioning looks awkward. Guard: margin column height should not exceed body height.
- [ ] TOC extraction — needs to handle sections without headings gracefully (skip them).
- [ ] Performance — TOC extraction at render time is cheap (array map over sections), not a concern.
- [ ] Hero full-width — hero should span above the grid, not be constrained to the main column. Current architecture already handles this (hero renders outside `.detailPage`).

---

*Revised 2026-04-13 (mock approved, design tokens, implementation spec). Previous: 2026-04-12 (Phase 0.5, field audit, SUG-62 split). Original spec 2026-04-08.*
