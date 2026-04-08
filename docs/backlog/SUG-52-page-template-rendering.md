# SUG-52 — Page Template Rendering

**Linear Issue:** SUG-52

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — RootPage.jsx is the renderer. PageSections.jsx handles section layout. No new components — extends existing page template logic.
- [ ] **Use case coverage** — three templates: `default` (standard width, current behaviour), `full-width` (edge to edge sections), `sidebar` (main + sidebar layout at wide viewports)
- [ ] **Layout contract** — `default`: max-width 760px (detail) or 1140px (archive). `full-width`: no max-width constraint on sections. `sidebar`: main column ~700px + sidebar ~300px at 1200px+ breakpoint.
- [ ] **All prop value enumerations** — `template` options synced with schemas/documents/page.ts: `default`, `full-width`, `sidebar`
- [ ] **Correct audit file paths** — verified
- [ ] **Dark / theme modifier treatment** — templates inherit theme from parent — no per-template theme logic
- [ ] **Studio schema changes scoped** — NO. `template` field already exists on page schema (moved to content tab in SUG-48). This epic wires it into rendering.
- [ ] **Web adapter sync scoped** — N/A (page-level rendering, not DS component)
- [ ] **Composition overlap audit** — `context="detail"` vs `context="full"` in PageSections already handles width. Template adds a layer above this.
- [ ] **Atomic Reuse Gate** — no new components. CSS additions to RootPage or PageSections for template variants.

---

## Context

The `template` field on the page schema has 3 options (`default`, `full-width`, `sidebar`) but is not currently queried or rendered. All pages render with the default template. This epic wires the template field into the GROQ projection and RootPage renderer so pages can use different layout templates.

## Objective

Query the `template` field from Sanity and apply the selected layout template to the page rendering. `default` preserves current behaviour. `full-width` removes max-width constraints on sections. `sidebar` adds a main + sidebar layout at wide viewports.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ☑ Yes | Only doc type with `template` field |
| `node` | ☐ No | Nodes always render in detail context |
| `article` | ☐ No | Articles always render in detail context |
| `caseStudy` | ☐ No | Case studies always render in detail context |
| `archivePage` | ☐ No | Archive pages have their own layout logic |

---

## Scope

- [ ] GROQ projection — add `template` to `pageBySlugQuery`
- [ ] RootPage.jsx — read `template` from page data, apply layout variant
- [ ] PageSections.jsx or RootPage CSS — template-specific layout rules
- [ ] CSS for `full-width` — remove max-width on section container
- [ ] CSS for `sidebar` — two-column layout at wide viewport with sticky sidebar

---

## Query Layer Checklist

- [ ] `pageBySlugQuery` — add `template` to projection
- [ ] Archive queries — N/A
- [ ] Other slug queries — N/A

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Sidebar background | `var(--canvas-subtle)` | `var(--canvas-subtle)` | Same | Inherits from existing token |
| Sidebar border | `var(--border-subtle)` | `var(--border-subtle)` | Same | Inherits from existing token |

Templates inherit theme — no per-template colour overrides needed.

---

## Non-Goals

- No schema changes (template field already exists)
- No new section types
- No sidebar content source (sidebar layout creates the container; sidebar content TBD — could be MetadataCard, TOC, or related nodes in a future epic)
- No mobile sidebar (sidebar collapses to single-column on mobile — standard responsive behaviour)

---

## Technical Constraints

**Layout containment:** `full-width` template must not break the header/footer layout. Only the section content area goes edge-to-edge — header and footer retain their max-width.

**Sidebar content:** The `sidebar` template creates the two-column layout but does not define what goes in the sidebar. Initial implementation: sidebar is empty or contains metadata. Content for the sidebar is a future epic (SUG-21 Phase 4: marginalia/sidenotes).

**Section context:** `PageSections` currently receives `context="detail"` or `context="full"`. Template may override this: `full-width` pages use `context="full"` for all sections.

---

## Files to Modify

- `apps/web/src/lib/queries.js` — add `template` to page projection
- `apps/web/src/pages/RootPage.jsx` — read template, apply layout variant
- `apps/web/src/pages/RootPage.module.css` (or new CSS) — template variant styles
- `apps/web/src/components/PageSections.module.css` — full-width overrides if needed

---

## Acceptance Criteria

- [ ] Page with `template: 'default'` renders identically to current (no regression)
- [ ] Page with `template: 'full-width'` renders sections edge-to-edge
- [ ] Page with `template: 'sidebar'` renders two-column layout at 1200px+ viewport
- [ ] Sidebar template collapses to single-column on mobile
- [ ] Template value read from Sanity via GROQ projection (not hardcoded)
- [ ] Pages without a template value default to `'default'` (graceful fallback)

---

## Risks / Edge Cases

- [ ] Full-width sections with contained text — text needs its own max-width even when the section is full-width. Use `max-width` on the text content, not the section container.
- [ ] Sidebar + hero section — hero should span full width above the sidebar layout, not be constrained to the main column. Handle with a `full-bleed` class on hero sections.
- [ ] Empty sidebar — if no sidebar content is configured, the layout should gracefully collapse to single-column (not show an empty column).

---

*Created 2026-04-08.*
