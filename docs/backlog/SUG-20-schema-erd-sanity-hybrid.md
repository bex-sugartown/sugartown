# EPIC — Schema ERD Sanity Hybrid (Option C)

**Linear Issue:** [SUG-20](https://linear.app/sugartown/issue/SUG-20/schema-erd-sanity-hybrid-option-c)
**Surface:** `apps/studio` + `apps/web`
**Priority:** Deferred
**Created:** 2026-03-14
**Depends on:** EPIC-0172 (Schema ERD Page — Option A MVP)

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

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
