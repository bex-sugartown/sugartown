# SUG-159 — Archive Page Component Inventory

**Linear Issue:** SUG-159
**Status:** Backlog
**Priority:** High
**Depends on:** SUG-152 (DS Storybook Usage Docs), existing archive page implementations

---

## Background

Documentation work on SUG-156/152 revealed a gap: when approaching new UI work (e.g. glossary pages, new archive listing types), there is no canonical reference for what components, tokens, and patterns are used on current archive listing pages. The result is either guesswork (which risks re-implementing existing patterns) or a slow manual audit of source files each time.

This epic creates a living inventory of archive page patterns so that:
- New archive-style pages can be mocked using confirmed, existing components
- Guidelines docs for archive/listing surfaces can be written from a verified component list (not assumptions)
- The `usage-doc-style-guide.md` pre-authoring gates can be satisfied without a from-scratch audit

---

## Scope

### Phase 1 — Component inventory (audit pass)

For each archive/listing page in `apps/web/src/pages/`:

| Page | Route | File |
|------|-------|------|
| Articles archive | `/articles` | `ArticlesArchivePage.jsx` |
| Case studies archive | `/case-studies` | `CaseStudiesArchivePage.jsx` |
| Knowledge graph archive | `/knowledge-graph` | `KnowledgeGraphArchivePage.jsx` |
| Taxonomy archives | `/tags`, `/categories`, `/tools`, `/people`, `/projects` | `TaxonomyArchivePage.jsx` |

For each page, document:
1. DS components used (Grid, Card, Chip, ContentCard, SectionLabel, etc.) — with props
2. CSS modules referenced and key class names
3. Tokens used for spacing, color, and type
4. Filter/sort patterns (FilterBar, filterModel, etc.)
5. Empty-state handling

Output: a markdown table per page type in `docs/conventions/archive-page-patterns.md`.

### Phase 2 — Storybook documentation skeleton

Once the inventory exists, create Overview-only Guidelines helpers for the two most-referenced archive surface patterns:
- `helpers/ArchiveGridDocs.tsx` — card grid layout rules
- `helpers/FilterBarDocs.tsx` — filter model + FilterBar usage rules

Apply Gate 1 (API stability) and Gate 2 (template lock) from `docs/conventions/usage-doc-style-guide.md` before writing any section beyond Overview.

### Phase 3 — Glossary/new archive mocking (unblocked)

With the inventory in hand, this phase unblocks new archive-style page work (e.g. glossary at `/glossary`, tag landing pages with richer layouts). Mock first using confirmed existing components — no new primitives without exhausting the reuse audit.

---

## Acceptance Criteria

- [ ] `docs/conventions/archive-page-patterns.md` exists and covers all five page types above
- [ ] Every DS component listed has been verified against the current source (not assumed from memory)
- [ ] Glossary or next-archive mock can reference the inventory doc rather than requiring a fresh audit
- [ ] Phase 2 helpers are Overview-only stubs (not full docs) — full sections deferred until API frozen

---

## Out of Scope

- Redesigning archive pages (this is an inventory, not a redesign)
- Full Guidelines docs for archive components (Gate 1 blocks until API frozen)
- Any new archive page implementation (that belongs in a separate feature epic)

---

## Notes

- This epic was triggered by glossary work needing to mock new pages against existing components
- The parallel need: ensure component docs are framework-agnostic (no Sanity field names) — that is handled in `docs/conventions/usage-doc-style-guide.md` Gate 3 and CLAUDE.md
- Related: SUG-152 (Storybook Usage Docs, phases 3–10 deferred), SUG-156 (EntityDetailPage docs)
