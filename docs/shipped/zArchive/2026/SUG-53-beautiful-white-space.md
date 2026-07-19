# SUG-53 — Beautiful White Space

**Linear Issue:** SUG-53
**Status:** Backlog
**Priority:** Medium
**Depends on:** SUG-21 (Pink Moon token convergence, done)

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — affects all page templates, card grids, detail pages. No new components — extends existing layout CSS.
- [ ] **Use case coverage** — every page template (archive, detail, root page) audited for spacing
- [ ] **Layout contract** — new semantic spacing tokens define the contract. Dimensional values TBD after visual testing.
- [ ] **All prop value enumerations** — N/A (spacing, not enums)
- [ ] **Dark / theme modifier treatment** — spacing is theme-agnostic (same in light and dark)
- [ ] **Studio schema changes scoped** — NO schema changes
- [ ] **Web adapter sync scoped** — N/A (token + layout CSS, not component props)
- [ ] **Atomic Reuse Gate** — new tokens only, no new components

---

## Context

The 8-point spacing scale is mechanically correct but doesn't breathe. Every gap is functional — none are generous. The Pink Moon academic library metaphor demands room between things — the museum gallery approach where the space around the object is as important as the object.

## Objective

Introduce semantic spacing tokens for reading rhythm and breathing room. Audit every page template and card layout for opportunities to increase whitespace without losing information.

---

## Scope

### Track 1: Semantic Spacing Tokens

New tokens (additive — existing 8-point scale unchanged):

| Token | Purpose | Target Value |
|-------|---------|-------------|
| `--st-space-reading-gap` | Gap between body paragraphs in longform | 20–24px |
| `--st-space-section-break` | Gap between major page sections | 80–100px |
| `--st-space-hero-bottom` | Breathing room below hero | 48–64px |
| `--st-space-card-gap` | Archive grid card gap (currently 24px) | 32px |
| `--st-space-margin-column` | Marginalia column width at wide viewports | 240–280px |

Both token files updated in same commit. Documented in Storybook Foundations as spacing + layout reference page.

### Track 2: Layout Breathing Room

- Detail pages: increase gap between hero → metadata card → body → related nodes
- Archive pages: increase card grid gap, vertical padding around section labels
- Body content: increase paragraph spacing in longform `.prose` context
- Section dividers: `<hr>` margin to section-break scale
- Footer: increase top margin for clear content separation

### Track 3: Density Controls (deferred → SUG-57)

Heavier patterns deferred to academic layer:
- Card density modes (summary vs default vs compact)
- Accordion for metadata sections on detail pages
- Margin utilisation / Tufte sidenotes at wide viewports
- Archive page view toggle (grid vs index)

---

## Approach

1. Mock whitespace changes in `pink-moon-mock-B-sharp-paper.html` first
2. Test with real content at various screen widths
3. Implement token-first: define tokens, then update component CSS to consume them
4. Both token files updated in same commit (DS + web)

---

## Files to Modify

- `packages/design-system/src/styles/tokens.css` — new semantic spacing tokens
- `apps/web/src/design-system/styles/tokens.css` — mirror
- `apps/web/src/components/PageSections.module.css` — section gaps
- `apps/web/src/pages/*.jsx` — page template padding adjustments
- Storybook: new Foundations/Spacing story

---

## Acceptance Criteria

- [ ] New semantic spacing tokens defined in both token files
- [ ] Detail pages have visible breathing room between major sections
- [ ] Archive card grid gap increased
- [ ] Body paragraph spacing increased in longform context
- [ ] Storybook Foundations/Spacing page documents all spacing tokens
- [ ] `pnpm validate:tokens` passes

---

*Created 2026-04-08.*
