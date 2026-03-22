# EPIC — Schema ERD Sanity Hybrid (Option C)

**Linear Issue:** [SUG-20](https://linear.app/sugartown/issue/SUG-20/schema-erd-sanity-hybrid-option-c)
**Surface:** `apps/studio` + `apps/web`
**Priority:** Deferred
**Created:** 2026-03-14
**Depends on:** EPIC-0172 (Schema ERD Page — Option A MVP)

---

## Objective

Upgrade the Schema ERD from a code-driven page (EPIC-0172) to a Sanity-managed section that can be embedded in any page via the section builder. The `SchemaERD` component from EPIC-0172 remains unchanged — this epic adds a `schemaErdSection` schema type, a GROQ projection, and a `PageSections.jsx` renderer case.

This enables editors to place the ERD on the Platform page (or any other page) via the CMS, rather than requiring a dedicated hardcoded route.

---

## Scope (draft — refine at activation)

- [ ] `schemaErdSection` schema type in `apps/studio/schemas/sections/`
  - Fields: `title (string)`, `description (text)`, `dataSource (enum: static | groq)` (future-proofing)
- [ ] Register in `schemas/index.ts`
- [ ] Add to `sections[]` on `page` doc type (minimum — evaluate other doc types at activation)
- [ ] GROQ projection in `pageBySlugQuery` for the new section type
- [ ] `PageSections.jsx` case: renders `<SchemaERD>` with static manifest data
- [ ] Evaluate whether the `/schema-erd` route should redirect to the Platform page or remain as a standalone route

---

## Non-Goals

- Does **not** implement dynamic GROQ-fetched schema data (future enhancement)
- Does **not** modify the `SchemaERD` component itself — it remains props-driven
- Does **not** add build-time codegen

---

## Trigger for Activation

Activate this epic when:
- The Platform page (`/platform`) is mature enough to host the ERD as a section
- There is a need to embed the ERD on multiple pages
- The standalone `/schema-erd` route feels architecturally redundant

---

*Placeholder created 2026-03-14. See EPIC-0172 for the MVP implementation.*
