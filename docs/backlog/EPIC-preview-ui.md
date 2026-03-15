# EPIC — Preview UI Chrome

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/web`
**Priority:** Deferred
**Created:** 2026-03-15
**Depends on:** EPIC-0176 (Content State Governance — shipped v0.17.7)

---

## Objective

Add visual preview chrome to the web app so that when `VITE_SANITY_PREVIEW=true` is set in dev, users have clear, persistent visual cues that they are seeing draft content. EPIC-0176 shipped the underlying infrastructure — env var toggle, `contentState.js` perspective switch, build-time safety plugin, `isPreviewMode()` helper, console warning — but no UI feedback exists. Editors and developers currently have no on-screen indication that draft documents are being shown.

After this epic: (1) a persistent preview banner appears at the top of the viewport when preview mode is active; (2) individual content items that are draft-only (not yet published) display a draft badge; (3) the entire preview chrome layer is tree-shaken from production builds (no dead code shipped).

**Data layer:** No schema changes.
**Query layer:** Minor — add `_id` projection to content queries so the frontend can detect `drafts.*` prefix on draft-only documents.
**Render layer:** New `PreviewBanner` component, draft badge decorator on content cards/pages, global CSS layer for preview chrome.

---

## Context

### What already exists (EPIC-0176)

- `apps/web/src/lib/contentState.js` — exports `getContentPerspective()`, `isPreviewMode()`, `logPreviewWarning()`
- `apps/web/vite.config.js` — `contentStateSafety` plugin blocks `VITE_SANITY_PREVIEW=true` in production builds
- `apps/web/src/lib/sanity.js` — client uses perspective from `getContentPerspective()`; calls `logPreviewWarning()` at init
- `apps/web/scripts/validate-content.js` — check G detects draft-only documents
- `docs/content-state-policy.md` — full contract documentation
- Console warning: styled `%c⚠ PREVIEW MODE ACTIVE` prints once at startup

### What does NOT exist

- No `PreviewBanner` or `PreviewBar` component
- No draft badge on cards or detail pages
- No visual overlay or editing link
- No way for a user to tell they are in preview mode without opening the browser console

---

## Scope (draft — refine at activation)

### Preview banner
- [ ] `PreviewBanner` component — fixed-position bar at top of viewport
  - Visually distinct (brand pink background, white text, warning icon)
  - Text: "Preview Mode — showing draft content" (or similar)
  - Optional: link to open the corresponding document in Sanity Studio
  - Shifts page content down (no content hidden behind the banner)
  - Only renders when `isPreviewMode()` returns true
  - Tree-shaken from production bundles (import guarded by `import.meta.env.VITE_SANITY_PREVIEW`)

### Draft badge on content items
- [ ] Detect draft-only documents — items whose `_id` starts with `drafts.` and have no published counterpart
  - In `previewDrafts` perspective, Sanity returns drafts alongside published docs; draft-only items have `_id: "drafts.xxx"`
- [ ] Display a "DRAFT" badge on:
  - ContentCard (archive grids) — small label or chip overlay
  - Detail page hero/header area — visible badge near the title
- [ ] Badge styling: muted pink/amber, clearly distinguishable from status/evolution badges

### Optional: editing overlay
- [ ] Evaluate: floating "Edit in Studio" button on detail pages when preview mode is active
  - Links to `https://<project>.sanity.studio/structure/<type>;${id}` or equivalent
  - Needs the Sanity project ID and document `_type` + `_id`
  - Could be deferred to a follow-on if the scope is too large

---

## Non-Goals

- Does **not** implement real-time Sanity Live Preview (WebSocket listener for draft changes) — that is a separate, larger scope
- Does **not** add a UI toggle for preview mode — activation remains via `.env` variable
- Does **not** change the Sanity client perspective logic (EPIC-0176 owns that)
- Does **not** add preview mode to production builds — the build-time safety plugin prevents this

---

## Technical Constraints

- `isPreviewMode()` is the single source of truth — all preview UI must be gated on it
- The `PreviewBanner` must not interfere with the nav/header layout (likely uses `position: fixed` or `sticky` with appropriate `z-index` and body padding offset)
- Draft detection relies on `_id` prefix — GROQ queries that project content items need to include `_id` in the projection (some may already; audit at activation)
- All preview UI code should be behind a dynamic `import()` or `import.meta.env` guard so Vite can tree-shake it from production builds
- CSS tokens: use existing `--st-color-brand-primary` for the banner background; define a new `--st-preview-banner-height` token if the banner shifts page content

---

## Files to Create/Modify (estimated)

**Create:**
- `apps/web/src/components/PreviewBanner.jsx` — preview mode banner
- `apps/web/src/components/PreviewBanner.module.css` — banner styles

**Modify:**
- `apps/web/src/App.jsx` — render `<PreviewBanner />` when preview mode active
- `apps/web/src/lib/queries.js` — ensure `_id` is projected in content queries
- `apps/web/src/components/ContentCard.jsx` — draft badge rendering
- Detail page components (ArticlePage, CaseStudyPage, NodePage) — draft badge in header

---

## Risks / Edge Cases

- **Banner z-index conflicts** — the nav/header and any modals need to coexist with a fixed preview banner; audit z-index stack at activation
- **Draft detection false positives** — in `previewDrafts` perspective, Sanity overlays drafts on published docs. A document with `_id: "drafts.xxx"` might have a published counterpart. Need to distinguish draft-overlay (has published version) from draft-only (no published version) — only draft-only items should get the badge
- **Content shift** — a fixed banner that adds height will push all content down; the nav must account for this or the banner must sit inside the normal flow above the nav
- **Tree-shaking verification** — after implementation, build with `VITE_SANITY_PREVIEW` unset and verify no preview UI code appears in the production bundle

---

## Trigger for Activation

Activate this epic when:
- Preview mode is being used regularly by editors during content authoring
- The console-only warning is insufficient for the team's workflow
- Or as part of a broader "editorial experience" sprint

---

*Created 2026-03-15. Infrastructure shipped in EPIC-0176 (v0.17.7).*
