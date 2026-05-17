---
**Epic:** SUG-121 — Design System — Section Module Showcase
**Linear Issue:** [SUG-121](https://linear.app/sugartown/issue/SUG-121/design-system-section-module-showcase)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-121 — Design System — Section Module Showcase

A public-facing Sanity `page` document at `/platform/design-system/sections` that renders every editorially available section type and variant with proper placeholder copy — the canonical reference for section builder capabilities.

## Background

`/articles/test-preview-post` currently serves as the informal reference for section builder output, but it is an article doc type, hidden from search, unlinked from the platform nav, and contains ad-hoc test content rather than intentional showcase copy. As the section builder grows (new types ship with each DS epic), there is no public-facing, editorially-maintained reference showing what's available and what it looks like.

The Design System area of `/platform` is the right home — it already hosts the component registry, token architecture docs, and Storybook link. A Sanity-backed `page` document means the showcase content is editorially updatable (new variants, copy improvements, ordering changes) without a code deploy, while the rendering is handled by the existing `PageSections.jsx` switch.

## Objective

After this epic, `/platform/design-system/sections` is a live public page rendering every section type available in the `page` schema's `sections[]` array, with intentional placeholder copy and variant examples. The page is a Sanity `page` document so any editor can update it. It is linked from the Design System sidebar nav. No new section types or schema changes are required — this is purely a content creation + routing + nav wiring epic.

Layers touched: Sanity content (Studio doc creation), routes (new named constant), web app nav config. Layers explicitly excluded: new schema types, new PageSections renderers, new DS components.

## Scope

- [ ] Activation audit: read `apps/studio/schemas/documents/page.ts` to confirm which `sections[]` types the `page` schema accepts — not all `PageSections.jsx` cases may be available on `page` docs — layer: schema audit
- [ ] Create a new Sanity `page` document with slug `platform/design-system/sections` — title "Section Module Showcase" — layer: content (Studio)
- [ ] Add one well-copy'd instance of every section type available on `page` docs — in a logical showcase order (hero → text → callout → accordion → card builder → image gallery → cta → mermaid → cited block → trust report → recent content → stat tile) — layer: content (Studio)
- [ ] For section types with meaningful variants (e.g. `calloutSection` variant field, `heroSection` size/tone, `cardBuilderSection` column count), include one example per variant — layer: content (Studio)
- [ ] `tableBlock` appears inside `textSection` PT content — include a `textSection` with an embedded table demonstrating the `tableBlock` type — layer: content (Studio)
- [ ] Register `/platform/design-system/sections` as a named constant in `apps/web/src/lib/routes.js` — layer: frontend
- [ ] Add "Section modules" nav link to the Design System section of the platform sidebar config — layer: frontend
- [ ] Verify page renders correctly at the new route with no console errors — layer: frontend / QA

## Phases

Single-phase: schema audit → content creation → routing → nav wiring → QA.

## Acceptance criteria

- [ ] `/platform/design-system/sections` resolves to the Sanity `page` doc and renders in production
- [ ] Every section type accepted by the `page` schema's `sections[]` array has at least one instance on the page
- [ ] Section types with variants have one instance per meaningful variant
- [ ] All placeholder copy is intentional and self-documenting (labels like "Callout — default variant", not Lorem ipsum)
- [ ] Page is linked from the Design System sidebar nav
- [ ] Route constant is registered in `routes.js` — no hardcoded path strings in nav config
- [ ] Page renders correctly at desktop and mobile widths — no overflow, no console errors
- [ ] Content Write Gate: proposal table shown before any Sanity patches applied

## Technical notes

- **Content Write Gate:** fires for all Sanity content creation — show a before/after proposal for every section being added before calling any MCP write tool.
- **Activation audit (blocking):** before writing any content, read `apps/studio/schemas/documents/page.ts` and confirm which `_type` values are allowed in `sections[]`. Some types (e.g. `recentContentSection`, `trustReportSection`) may only be available on `node` or `article` docs. Do not create section instances for types the `page` schema does not accept — they will fail validation.
- **slug format:** Sanity `page` docs with slugs containing `/` (e.g. `platform/design-system/sections`) are routed via `RootPage.jsx` using `getCanonicalPath`. Verify slug format matches the routing pattern before creating the doc.
- **No schema deploy required** — no schema changes in this epic.
- **Model recommendation:** `/model sonnet` — content creation + nav wiring, no complex schema or DS work.
- **Existing test-preview-post:** leave `/articles/test-preview-post` in place — it covers article-specific section combinations and draft/preview testing. This page supplements it, not replaces it.

## Non-Goals

- New section types or PageSections renderers — this epic consumes existing infrastructure only
- Changes to the `page` schema
- Replacing or deleting `/articles/test-preview-post`
- Storybook stories — existing section stories cover VRT

## Related

- **Linear:** [SUG-121](https://linear.app/sugartown/issue/SUG-121/design-system-section-module-showcase)
- **Upstream:** SUG-103 (registry page — same Design System nav area), SUG-98 (section builder stories added)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
