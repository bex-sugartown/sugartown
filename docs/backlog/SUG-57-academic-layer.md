# SUG-57 — Pink Moon Phase 5: Academic Layer

**Linear Issue:** SUG-57
**Status:** Backlog
**Priority:** Low
**Depends on:** SUG-21 (Phases 1–4, done), SUG-53 (spacing tokens), SUG-35 (glossary)

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — new layout patterns: marginalia, index view, running headers, bibliography, colophon, figure captions. Extends existing components and page templates.
- [ ] **Use case coverage** — detail pages (nodes, articles, case studies), archive pages, all page types
- [ ] **Layout contract** — Tufte sidenotes need ~250px margin + ~700px main column. Breakpoint at 1200px+.
- [ ] **Dark / theme modifier treatment** — all new patterns inherit Pink Moon Light/Dark tokens
- [ ] **Studio schema changes scoped** — glossary depends on SUG-35 (separate). Bibliography may need a `bibliography` section type.
- [ ] **Atomic Reuse Gate** — several new components: MarginNote, IndexView, RunningHeader, Bibliography, FigureCaption, Colophon

---

## Context

Broken off from SUG-21 Phase 5. The academic interface patterns are the aspirational layer of Pink Moon — they depend on the design system identity being established first.

**Source:** Pink Moon manifesto §Academic Interface, PRD v3.0 §13 Migration Path

## Scope

### 1. Sidenotes / Marginalia

At 1200px+ viewports, pull citations and secondary commentary into a dedicated margin column alongside the main text. On mobile, collapse to expandable inline footnotes.

Reference: [Tufte CSS](https://edwardtufte.github.io/tufte-css/)

Layout: main column ~700px + margin ~250px + gaps + page padding = ~1200px minimum.

### 2. Archive Index View

Table/list alternative to the card grid. Dense, scannable, with sortable columns: title, type, status, date, category. For users who know what they're looking for — the library catalogue, not the bookshelf.

Toggle between card grid (current) and index view (new). User-controlled or content-count driven.

### 3. Glossary Integration (depends on SUG-35)

Dotted-underline annotations on terms, hover definition cards, dedicated `/glossary` archive. The controlled vocabulary of the system made visible.

### 4. Running Headers

Sticky compressed header on detail pages showing: current section title (from heading hierarchy). Appears on scroll, complementing the main nav header.

### 5. Bibliography Blocks

Formal reference list at the bottom of nodes/articles. Extends the existing citations system from inline superscripts to a structured bibliography section. Courier Prime, structured, numbered.

### 6. Figure Captions

Structured image annotations: figure number, title, source attribution. Styled below images in a smaller, distinct type treatment. Not alt text — visible, authored captions.

### 7. Colophon Footer

Publication-style footer: brand zone (title + tagline), nav columns, social links, copyright, plus edition metadata strip (version, toolchain, license). Courier Prime labels.

---

## Non-Goals

- No Sanity schema changes beyond what SUG-35 (glossary) provides
- No new page types or routes (except /glossary from SUG-35)
- No responsive redesign — margin column collapses to inline on mobile

---

## Files to Modify

TBD per sub-feature. Expected:
- New components: `MarginNote.jsx`, `IndexView.jsx`, `RunningHeader.jsx`, `Bibliography.jsx`, `FigureCaption.jsx`, `Colophon.jsx`
- CSS for Tufte-style margin layout
- Archive page template updates for index view toggle
- Detail page templates for running header + marginalia
- Footer component updates for colophon

---

## Acceptance Criteria

- [ ] Sidenotes render in margin at 1200px+, collapse to inline on mobile
- [ ] Archive index view togglable, sortable by title/type/status/date
- [ ] Running header shows current section title on scroll
- [ ] Bibliography block renders below citations zone
- [ ] Figure captions display below images with figure number
- [ ] Colophon footer includes edition metadata strip

---

*Created 2026-04-08.*
