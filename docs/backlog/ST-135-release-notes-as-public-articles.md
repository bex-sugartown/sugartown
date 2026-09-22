---
**Epic:** ST-135 — Release notes as public articles (governance visibility)
**Issue:** [#135](https://github.com/bex-sugartown/sugartown/issues/135)
**Status:** Todo
**Priority:** 🟢 High
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** N/A — reuses shipped `calloutSection`, Phase 0 exempt (see Technical notes)
---

# ST-135 — Release notes as public articles (governance visibility)

Repost release notes v0.20.0 onward as backdated Sanity articles, with an ecosystem-pipeline diagram, to surface the platform's governance/release process in the public knowledge graph.

## Background

Sugartown ships a real governance pipeline (Brief/PRD → Epic doc → CHANGELOG → Release Notes),
documented in `docs/workflows/release-assistant-prompt.md` and `CLAUDE.md`, but none of it is
visible on the public site — it lives only in the repo. CHANGELOG.md was compressed to one-line
bullets on 2026-09-22 (v0.33.0–v0.36.0), and `release-assistant-prompt.md` (v6, same day) now
lets Release Notes draw narrative color from a linked epic doc, making Release Notes the most
detail-bearing artifact fit for a public reader. 29 versioned release-notes files exist at
`docs/release-notes/RELEASE_NOTES_vX.Y.0.md` (v0.8.0 through v0.36.0); this epic reposts
v0.20.0 onward (17 files) as `article` documents in Sanity.

## Objective

After this epic: each targeted release note (v0.20.0–v0.36.0) exists as a published-ready
`article` document, backdated to its real release date, tagged so the set forms one identifiable
"corner" of the knowledge graph, and opening with a `calloutSection` that links to the existing
`/platform/governance` page (which already carries the Release Process gate diagram and the AI
Governance Workflow epic-lifecycle diagram — decided 2026-09-22, see Technical notes). Touches:
Sanity content (article documents, taxonomy), no new public page, no schema changes expected (the
`article` schema already supports `publishedAt`, `series`, `partNumber`, `categories`, `tags`).
Explicitly excludes: v0.8.0–v0.19.0 (out of requested range), any rewrite of release-note prose
into first-person PM voice, and any change to `docs/release-notes/` source files themselves.

## Scope

- [x] Decide and record repost voice/treatment: **verbatim repost** in the Governance/ops register — decided 2026-09-22 — layer: content, decision
- [x] Taxonomy pre-flight (`*[_type in ["category","tag","series"]]{_id, name, "slug": slug.current}`) — decided 2026-09-22: reuse `category-governance` and `tag-release-management` (exact matches), create one new `series` doc ("Release Notes" / `release-notes`, no existing series fits) — layer: schema/taxonomy
- [x] Confirm whether a public pipeline-explainer page exists — decided 2026-09-22: **it does**, `/platform/governance` (`GovernancePage.jsx`) already has the Release Process and AI Governance Workflow diagrams; no new page built — layer: frontend/content
- [x] ~~Build the ecosystem-pipeline Mermaid diagram~~ — dropped 2026-09-22, superseded by linking to the existing diagram on `/platform/governance` instead of building a new one — layer: content
- [ ] Draft 17 article documents (v0.20.0–v0.36.0, folding v0.23.25 into v0.23.0 and v0.26.26 into v0.26.0) as Sanity drafts, backdated `publishedAt`, correct taxonomy — layer: content
- [ ] Content Write Gate proposal (before/after table) for the batch, plus the new `series` doc, before any Sanity write — layer: process
- [x] ~~Phase 0 vspec~~ — exempt 2026-09-22: opening section reuses the already-shipped `calloutSection` component with a plain external link, no new visual format introduced — layer: design

## Phases

Single phase.

## Acceptance Criteria

- [ ] 17 `article` documents exist as Sanity drafts (not published — Human-Publishes Rule applies), one per release v0.20.0 through v0.36.0, each with correct backdated `publishedAt`
- [ ] Every article carries `series` → new `release-notes` series (with sequential `partNumber`), `categories` → `category-governance`, `tags` → `tag-release-management`, confirmed via `count(*[_type == "article" && series->slug.current == "release-notes"])` returning exactly 17 (drafts perspective)
- [ ] Every article's opening `calloutSection` links to the existing `/platform/governance` page
- [ ] Content Write Gate proposal (17 articles + the new series doc) was shown and approved before any `create_documents` call
- [x] Phase 0 exempt (see Technical notes) — no vspec required before Studio write
- [ ] Nothing published without an explicit standalone publish instruction (Human-Publishes Rule)

## Human QA Walkthrough — example local pages

Not applicable in the CSS/layout sense — no shared CSS, token, or multi-page component changes
expected (reuses existing Article rendering and the already-shipped `calloutSection`). At
activation, confirm this by reading `apps/web/src/App.jsx` for the article detail route to verify
no divergence is introduced, and QA one representative reposted article (its `calloutSection`
link to `/platform/governance`, taxonomy, backdated `publishedAt`) at a real local URL before
batch-completing the rest.

## Technical notes

- **Content Write Gate**: fires for all 17 article drafts and the new `series` document — show before/after proposal, wait for explicit approval, per CLAUDE.md.
- **Human-Publishes Rule**: drafts only; nothing goes live without a standalone "publish" instruction, even after Content Write Gate approval.
- **Schema changes**: none expected — `article` already has `publishedAt`, `series`, `partNumber`, `categories`, `tags`, `relatedTerms` (confirmed 2026-09-22, `apps/studio/schemas/documents/article.ts`). Taxonomy pre-flight (below) surfaced no genuine gap.
- **Activation audit (2026-09-22, corrects the prior finding below)**: `/platform/governance` (`apps/web/src/pages/platform/GovernancePage.jsx`, route in `apps/web/src/lib/routes.js` as `PLATFORM_ROUTES.governance`) already exists and already renders a "Release Process" gate `MermaidDiagram` and an "AI Governance Workflow" epic-lifecycle `MermaidDiagram` plus a governance doc index table. No new page is built; each article's opening `calloutSection` links here. The line below ("none found as of 2026-09-22") was written before this same day's activation audit ran — kept for the record, not restated as current.
- ~~**Activation audit**: read `apps/web/src/lib/routes.js` to reconfirm no public pipeline/process page exists (none found as of 2026-09-22)~~ — superseded, see the corrected finding above.
- **Activation audit**: taxonomy pre-flight (`*[_type in ["category","tag","series"]]{_id, name, "slug": slug.current}`, run 2026-09-22) found `category-governance` ("Governance") and `tag-release-management` ("release management") as exact matches — reused, no new category/tag. No existing `series` fits (`poc-contentful-vercel`, `career-engineering`, `about-series`, `test-series`, `left-to-my-own-devices`) — one new `series` document is created: "Release Notes" / slug `release-notes`.
- **Activation audit**: `docs/release-notes/` has 30 files, not 29. Filtered to v0.20.0 onward that's 19 files (two patch releases, v0.23.25 and v0.26.26, sit alongside their parent minors). Decided 2026-09-22: fold v0.23.25 into the v0.23.0 article and v0.26.26 into the v0.26.0 article — net 17 articles, matching the original Acceptance Criteria count.
- **Upstream dependency**: none — `release-assistant-prompt.md` v6 and the CHANGELOG compression (2026-09-22) are already shipped; this epic builds on both.

## Model & Mode [REQUIRED]

`/model opus` with plan mode for the Pre-Execution Gate and Phase 0 (taxonomy decision,
pipeline-page scope, vspec) — this is high-ambiguity content/IA work with a real design decision
(verbatim repost vs. framing wrapper) before any content gets written. Exit plan mode once the
vspec is approved and switch to direct execution for the mechanical repost of 17 articles.

## Non-Goals

- Rewriting `docs/release-notes/` source files or the release process itself — out of scope, this epic only reposts existing content.
- Reposting v0.8.0–v0.19.0 — explicitly excluded by the requested range; a follow-up epic can extend backward if wanted.
- Publishing any article — the Human-Publishes Rule keeps that a separate, explicit, later instruction.
- New Sanity schema fields — existing `article` fields are sufficient unless the taxonomy pre-flight proves otherwise.

## Related

- **GitHub:** [#135](https://github.com/bex-sugartown/sugartown/issues/135)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Upstream:** CHANGELOG compression and `release-assistant-prompt.md` v6, both 2026-09-22 (same session)
