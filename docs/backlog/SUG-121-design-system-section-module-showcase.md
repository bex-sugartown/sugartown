---
**Epic:** SUG-121 — Design System — Section Module Showcase
**Linear Issue:** [SUG-121](https://linear.app/sugartown/issue/SUG-121/design-system-section-module-showcase)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-121 — Design System — Section Module Showcase

A public-facing page at `/platform/design-system/sections` driven by a Sanity `page` document — renders every editorially available section type and variant with intentional placeholder copy. The canonical reference for section builder capabilities.

## Background

`/articles/test-preview-post` currently serves as the informal reference for section builder output, but it is an article doc type, hidden from search, unlinked from the platform nav, and contains ad-hoc test content rather than intentional showcase copy. As the section builder grows (new types ship with each DS epic), there is no public-facing, editorially-maintained reference showing what's available and what it looks like.

The Design System area of `/platform` is the right home — it already hosts the component registry, token architecture docs, and Storybook link.

**Routing note:** `/platform/design-system/sections` is three path segments deep. The Sanity `page` doc type routes via `/:slug` (top-level only), and SUG-51 (page URL nesting) only handles one level. This page follows the established platform sub-page pattern: a **hardcoded route in `App.jsx`** that fetches a Sanity `page` doc by a fixed internal slug (`ds-section-showcase`). The slug is a lookup key, not the URL. This requires no routing infrastructure changes and no dependency on SUG-51.

## Objective

After this epic, `/platform/design-system/sections` is a live public page rendering every section type available in the `page` schema's `sections[]` array, with intentional placeholder copy and variant examples. The Sanity `page` doc (slug: `ds-section-showcase`) is the content source — any editor can update it without a code deploy. It is linked from the Design System sidebar nav.

Layers touched: Sanity content (Studio doc creation), `App.jsx` (new hardcoded route), `routes.js` (new named constant), platform nav config. Layers explicitly excluded: new schema types, new PageSections renderers, new DS components, SUG-51 routing infrastructure.

## Scope

- [ ] Activation audit: read `apps/studio/schemas/documents/page.ts` to confirm which `sections[]` types the `page` schema accepts — not all `PageSections.jsx` cases may be available on `page` docs — layer: schema audit
- [ ] Add route `/platform/design-system/sections` to `App.jsx`, rendering a new `SectionShowcasePage` component that fetches the Sanity `page` doc by slug `ds-section-showcase` — layer: frontend
- [ ] Register the route as a named constant in `apps/web/src/lib/routes.js` (`PLATFORM_ROUTES.designSystemSections`) — layer: frontend
- [ ] Add "Section modules" nav link to the Design System section of the platform sidebar config — layer: frontend
- [ ] Create a new Sanity `page` document with slug `ds-section-showcase`, title "Section Module Showcase" — layer: content (Studio)
- [ ] Add one well-copy'd instance of every section type available on `page` docs — in logical showcase order (hero → text → callout → accordion → card builder → image gallery → cta → mermaid → cited block → stat tile) — layer: content (Studio)
- [ ] For section types with meaningful variants (e.g. `calloutSection` variant, `heroSection` size/tone, `cardBuilderSection` column count), include one example per variant — layer: content (Studio)
- [ ] Include a `textSection` with an embedded `tableBlock` in PT content — layer: content (Studio)
- [ ] Verify page renders correctly at the new route with no console errors — layer: frontend / QA

## Phases

Single-phase: schema audit → route wiring → nav → content creation → QA.

## Acceptance criteria

- [ ] `/platform/design-system/sections` resolves and renders the Sanity doc content
- [ ] The page component fetches by fixed slug `ds-section-showcase` — not by URL path
- [ ] Every section type accepted by the `page` schema's `sections[]` array has at least one instance
- [ ] Section types with variants have one instance per meaningful variant
- [ ] All placeholder copy is intentional and self-documenting (e.g. "Callout — default variant", not Lorem ipsum)
- [ ] Page is linked from the Design System sidebar nav
- [ ] Route constant registered in `routes.js` — no hardcoded path strings in nav config
- [ ] Page renders correctly at desktop and mobile widths — no overflow, no console errors
- [ ] Content Write Gate: proposal table shown before any Sanity patches applied

## Technical notes

- **Routing pattern:** follows `GovernancePage`, `DesignSystemRegistryPage` etc. — hardcoded `App.jsx` route + dedicated page component. `RootPage.jsx` and `getCanonicalPath()` are not involved. The Sanity slug (`ds-section-showcase`) is only used in the GROQ fetch query, never in the URL.
- **No dependency on SUG-51** — that epic handles `/:parentSlug/:childSlug` (one level). This page is three levels deep and uses the hardcoded platform route pattern instead.
- **Content Write Gate:** fires for all Sanity content creation — show a before/after proposal for every section before any MCP write call.
- **Activation audit (blocking):** read `apps/studio/schemas/documents/page.ts` and confirm which `_type` values are allowed in `sections[]` before creating any content. Some types (`recentContentSection`, `trustReportSection`) may only be on `node`/`article` docs.
- **No schema deploy required** — no schema changes in this epic.
## Model & Mode [REQUIRED]

`/model sonnet` — content creation and minimal route wiring. No new components or schema changes; planning depth of Opus is not needed.

## Non-Goals

- New section types or PageSections renderers
- Changes to the `page` schema
- SUG-51 routing infrastructure — not needed here
- Replacing or deleting `/articles/test-preview-post`
- Storybook stories

## Related

- **Linear:** [SUG-121](https://linear.app/sugartown/issue/SUG-121/design-system-section-module-showcase)
- **Upstream:** SUG-103 (registry page — same Design System nav area), SUG-98 (section builder stories)
- **Not blocked by:** SUG-51 (page URL nesting)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
