---
**Epic:** SUG-205 — Surface Project ID (PROJ-XXX) on /projects archive and detail pages
**Linear Issue:** [SUG-205](https://linear.app/sugartown/issue/SUG-205/surface-project-id-proj-xxx-on-projects-archive-and-detail-pages)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-205 — Surface Project ID (PROJ-XXX) on /projects archive and detail pages

Every `project` document has a required, unique `projectId` field (format `PROJ-XXX`, validated in `apps/studio/schemas/documents/project.ts`), but nothing on the live site renders it as a visible label.

## Background

Confirmed live at `/projects` (all 7 project docs list with a colored dot, name, and assigned-content count — no ID anywhere). `apps/web/src/lib/queries.js` already projects `projectId` in both `allProjectsQuery` (line ~1431) and `projectBySlugQuery` (line ~1453), so the data reaches the frontend today — this is a render gap, not a data gap.

A comment on `projectBySlugQuery` (line ~1447) states `projectId` is "retained as operator-facing metadata, displayed on the project detail page and Studio UI, but is not the URL key." That claim is stale: `apps/web/src/pages/TaxonomyDetailPage.jsx` (line 93) only uses `projectId` as a silent name-fallback (`taxDoc.name ?? taxDoc.title ?? taxDoc.projectId`) — it's never rendered as a distinct, visible label on either the detail page or the archive list. The comment describes an intent that was never implemented, or was implemented once and later removed.

This surfaced during an alignment-audit session comparing `docs/briefs/` PRDs against the live `project` taxonomy — several PRDs cross-reference a project by its `PROJ-XXX` ID (e.g. `PROJ-005-monorepo-prd.md` → PROJ-005), but a reader following that reference to the live site has no way to confirm which project is which by ID.

A pre-existing visual precedent exists: `docs/drafts/` mock files (`SUG-78-ledger-tradition-mock.html`, `pink-moon-mock-B-sharp-paper.html`, `SUG-96-tile-primitive.html`) show a "call number" pattern (e.g. `PROJ-001` or `PROJ-001 · Sugartown CMS`) as part of the site's established Ledger Tradition visual language. This epic applies that existing pattern to a surface missing it — it is not inventing a new visual format from scratch, but Phase 0 still applies (see below) because the exact placement/treatment on these two specific page templates hasn't been mocked or approved.

## Objective

After this epic, `/projects` (archive) and `/projects/:slug` (detail) both visibly render each project's `PROJ-XXX` ID as a distinct label, in the Ledger Tradition call-number style already used elsewhere on the site. The stale/inaccurate code comment on `projectBySlugQuery` is corrected to match what the code actually does post-epic. No schema changes — `projectId` already exists and is already projected; this is render-layer only (React components + possibly a small CSS class per the reuse audit below).

## Scope

- [ ] Phase 0 mock: sketch the call-number placement on both the archive list row and the detail page, reusing the existing Ledger Tradition pattern (see Background) rather than inventing a new treatment — layer: design/mock
- [ ] Frontend: render `projectId` as a visible label on the `/projects` archive list, per the approved Phase 0 mock — layer: frontend
- [ ] Frontend: render `projectId` as a visible label on `/projects/:slug` detail page, per the approved Phase 0 mock — layer: frontend
- [ ] Docs: correct or remove the stale comment on `projectBySlugQuery` (`apps/web/src/lib/queries.js` ~line 1447) once the claim it makes is actually true — layer: tooling/docs

## Acceptance criteria

- [ ] Every one of the 7 live project rows on `/projects` visibly shows its `PROJ-XXX` ID
- [ ] `/projects/:slug` for at least one real project (e.g. `/projects/mini-repo`) visibly shows `PROJ-005` as a distinct label, not just as a fallback page title
- [ ] The `projectBySlugQuery` comment accurately describes what the shipped code does
- [ ] No hardcoded colors or new CSS surfaces introduced without the pre-implementation reuse audit in `CLAUDE.md` §CSS class pre-implementation reuse audit

## Human QA Walkthrough — example local pages

Applicable — this touches a shared list-row component and/or the taxonomy detail page template, both of which render other taxonomy types (`/tags`, `/categories`, `/tools`, `/people`) via the same components.

> Activation audit: read `apps/web/src/App.jsx` to confirm the exact routes/components serving `/projects` and `/projects/:slug` today (confirm whether `TaxonomyArchivePage.jsx` / `TaxonomyDetailPage.jsx` are shared across all five taxonomy types or project-specific), then build the Human QA Walkthrough table per `docs/epic-template.md` §Human QA Walkthrough — include at least one non-project taxonomy page (e.g. `/tags` or `/tools`) as a regression guard, since `projectId` is project-only and must not leak an empty/broken label onto taxonomy types that don't have the field.

## Technical notes

- **No schema changes.** `projectId` already exists, is required, and is already projected in both relevant GROQ queries. This epic is render-layer only.
- **Activation audit — confirm the exact render surfaces:** read `apps/web/src/pages/TaxonomyArchivePage.jsx` and `apps/web/src/pages/TaxonomyDetailPage.jsx` in full (not just the `projectId` grep hits above) before writing any JSX, to find the exact row/card component that needs the new label and confirm it's project-only (must not render for tags/categories/tools/people, which have no `projectId`).
- **CSS reuse audit required before any new class:** per `CLAUDE.md` §CSS class pre-implementation reuse audit, check `pages.module.css` for an existing label/badge/eyebrow class (e.g. `detailEyebrow`) before adding anything new. The Ledger Tradition call-number pattern already exists somewhere in production CSS if it's used elsewhere on shipped entity detail pages (e.g. `MetadataCard`) — check there first.
- **Phase 0 hard stop applies.** This is a new visual detail on an existing page template (`CLAUDE.md` §Phase 0 hard-stop: "Phase 0 applies to new blocks on existing pages... The test is: does this block have a visual format that hasn't been reviewed?"). No JSX/CSS until the mock exists and is approved, even though the visual pattern itself is a reuse of an established convention — the specific placement on these two templates hasn't been.
- **Fix the stale comment**, don't just leave it — a comment that describes intended-but-unimplemented behavior is worse than no comment, since it misleads the next person who greps for "is this displayed anywhere."

## Model & Mode [REQUIRED]

`/model sonnet` — this is a small, well-scoped render-layer change with no architectural ambiguity once the Phase 0 mock is approved (per the updated `docs/epic-template.md` guidance: Sonnet 5 is the default for implementation-heavy but non-architectural epics). No `opusplan` needed.

## Non-Goals

- No schema changes to `project.ts` — the field already exists and is correctly configured.
- No change to the URL routing scheme — `projectId` remains metadata, `slug` remains the URL key, per the existing (accurate) part of the `projectBySlugQuery` comment.
- No retroactive audit of every other taxonomy type's metadata display — scoped to `project` only, since `projectId` is the field in question.

## Related

- **Linear:** [SUG-205](https://linear.app/sugartown/issue/SUG-205/surface-project-id-proj-xxx-on-projects-archive-and-detail-pages)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
- **Related brief:** `docs/briefs/README.md` — the Project ID litmus test and cross-reference work that surfaced this gap
