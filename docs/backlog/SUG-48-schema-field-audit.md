# SUG-48 — Schema Field Audit & Card Layout Alignment

**Linear Issue:** SUG-48
**Status:** Backlog
**Priority:** Medium — blocks SUG-21 (Pink Moon MetadataCard needs final field set)

---

## Context

Studio schemas have accumulated fields across multiple epics — some deprecated, some with stale option lists, some with labels/descriptions that don't match current usage. Card components (ContentCard, MetadataCard) render these fields but may display phantom values, missing options, or inconsistent labels.

A visual audit (screenshot with red X annotations) identified specific fields on the node detail/archive view that need removal or revision. This epic extends that audit across all five content schemas and aligns the card rendering layer.

## Objective

Audit every user-facing field on node, article, caseStudy, page, and archivePage schemas. Remove deprecated fields, update option lists, fix labels/descriptions, and align card component rendering to match. Update Storybook stories to reflect the corrected field sets.

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — ContentCard, MetadataCard, TaxonomyChips are the render surfaces. No new components created.
- [ ] **Use case coverage** — all 5 schema types audited, card rendering checked for each
- [ ] **Layout contract** — MetadataCard grid layout may change if fields are added/removed
- [ ] **All prop value enumerations** — every enum field audited against schema `options.list` (extends SUG-47 pattern)
- [ ] **Dark / theme modifier treatment** — N/A (field changes, not visual changes)
- [ ] **Studio schema changes scoped** — YES, this epic owns all schema changes. Commit prefix: `feat(studio):`
- [ ] **Web adapter sync scoped** — ContentCard.jsx and MetadataCard.jsx updates are in scope
- [ ] **Composition overlap audit** — check for field-purpose overlap when fields are reorganised
- [ ] **Atomic Reuse Gate** — no new components, utilities, or CSS surfaces

---

## Scope

### Phase 1 — Schema Audit (read-only, document decisions)

For each schema (node, article, caseStudy, page, archivePage):

| Field | Type | Current Options | Populated? | Rendered Where? | Decision |
|-------|------|----------------|------------|-----------------|----------|
| *(to be filled during audit)* | | | | | |

Decisions per field:
- **Keep** — field is active, correctly configured, rendered appropriately
- **Update options** — option list needs additions/removals to match content reality
- **Update description** — help text references old conventions
- **Hide** — soft deprecation (`hidden: true`), field retained for data but hidden from editors
- **Remove** — hard removal (only if no content uses it and no query references it)
- **Move** — reorder within Studio tabs for better editor workflow

### Phase 2 — Schema Updates (Studio)

- Apply Phase 1 decisions
- Commit prefix: `feat(studio):` per CLAUDE.md convention
- One commit per schema if changes are substantial, or batch small changes

### Phase 3 — Card Layout Adjustments (Web)

- ContentCard: update `DOC_TYPE_MAP`, `CONTENT_TYPE_LABELS`, `STATUS_DISPLAY` if values changed
- MetadataCard: update field grid rows, remove deprecated field rows, add any new fields
- GROQ projections in `queries.js`: add/remove fields from card-level projections if needed
- Small CSS adjustments if field count changes affect card proportions

### Phase 4 — Storybook Alignment

- Update fixture data to use only valid field values
- Update argTypes enum options with schema source comments (SUG-47 pattern)
- Verify all stories render without errors
- Add stories for new field combinations if any

---

## Known Issues (from screenshot audit)

The visual audit annotated the node archive/detail views with fields marked for removal (red X) or revision. Specific fields to investigate:

- **Node:** `aiTool` (deprecated string enum — tools are now first-class taxonomy refs), `conversationType` (still useful?), `challenge`/`insight`/`actionItem` (deprecated in style guide, hidden in schema?), `content` (legacy, replaced by sections)
- **Article:** check if `status` field exists or is needed (currently no enum in schema)
- **CaseStudy:** `contractType` (exists in schema, not rendered anywhere — keep or hide?)
- **Page:** minimal fields — verify sections builder is correctly configured
- **ArchivePage:** deferred Advanced tab fields (SUG-18) — confirm they're still hidden

---

## Files to Modify

**Phase 2 — Studio:**
- `apps/studio/schemas/documents/node.ts`
- `apps/studio/schemas/documents/article.ts`
- `apps/studio/schemas/documents/caseStudy.ts`
- `apps/studio/schemas/documents/page.ts`
- `apps/studio/schemas/documents/archivePage.ts` (if needed)

**Phase 3 — Web:**
- `apps/web/src/components/ContentCard.jsx`
- `apps/web/src/components/MetadataCard.jsx`
- `apps/web/src/lib/queries.js` (if card projections change)

**Phase 4 — Storybook:**
- `apps/web/src/components/ContentCard.stories.tsx`
- `apps/web/src/components/MetadataCard.stories.tsx`
- `packages/design-system/src/components/Card/Card.stories.tsx`

---

## Related Issues

- **SUG-47** (Done) — established the pattern for syncing argTypes with schema enums
- **SUG-21** (Backlog) — Pink Moon MetadataCard depends on the final field set from this audit
- **SUG-45** (Done) — argTypes exist on all stories, ready to update
- **SUG-18** (Backlog) — archive page deferred fields (Advanced tab) — verify still correctly hidden

---

*Created 2026-04-07.*
