---
**Epic:** ST-135 — Release notes as public articles (governance visibility)
**Issue:** [#135](https://github.com/bex-sugartown/sugartown/issues/135)
**Status:** Todo
**Priority:** 🟢 High
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-135-release-notes-as-public-articles.vspec.html`
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
"corner" of the knowledge graph, and opening with a section that links to a public page
explaining the governance pipeline (Brief/PRD → Epic → CHANGELOG → Release Notes), most likely
as an embedded Mermaid diagram via the existing `mermaidSection` PageSections block. Touches:
Sanity content (article documents, taxonomy), possibly one new public docs page for the pipeline
explainer, no schema changes expected (the `article` schema already supports `publishedAt`,
`series`, `categories`, `tags`). Explicitly excludes: v0.8.0–v0.19.0 (out of requested range),
any rewrite of release-note prose into first-person PM voice, and any change to
`docs/release-notes/` source files themselves.

## Scope

- [ ] Decide and record repost voice/treatment: verbatim repost in the Governance/ops register vs. a light framing wrapper — layer: content, decision
- [ ] Taxonomy pre-flight (`*[_type == "tag"]{_id, name, slug}` etc.) before creating any new tag/category/series for the "release notes corner" — layer: schema/taxonomy
- [ ] Confirm whether a public pipeline-explainer page exists; if not, scope and build one (or a section on an existing page) — layer: frontend/content
- [ ] Build the ecosystem-pipeline Mermaid diagram (Brief/PRD (if public) → Epic → CHANGELOG → Release Notes) and wire it as a linked heading element on each reposted article — layer: content, reusing `mermaidSection`
- [ ] Draft 17 article documents (v0.20.0–v0.36.0) as Sanity drafts, backdated `publishedAt`, correct taxonomy — layer: content
- [ ] Content Write Gate proposal (before/after table) for the batch before any Sanity write — layer: process
- [ ] Phase 0 vspec covering the pipeline-diagram heading and the release-notes taxonomy/archive treatment — layer: design

## Phases

Single phase.

## Acceptance Criteria

- [ ] 17 `article` documents exist as Sanity drafts (not published — Human-Publishes Rule applies), one per release v0.20.0 through v0.36.0, each with correct backdated `publishedAt`
- [ ] Every article carries the agreed taxonomy (series/category/tag) that distinguishes it as a release-notes repost, confirmed via a GROQ query returning exactly 17 documents
- [ ] Every article's opening section links to the pipeline-explainer page/diagram; the diagram renders via `mermaidSection` and matches the vspec
- [ ] Content Write Gate proposal was shown and approved before any `create_documents` call
- [ ] Vspec approved (Phase 0) before any Studio write
- [ ] Nothing published without an explicit standalone publish instruction (Human-Publishes Rule)

## Human QA Walkthrough — example local pages

Not applicable in the CSS/layout sense — no shared CSS, token, or multi-page component changes
expected (reuses existing Article rendering and `mermaidSection`). At activation, confirm this
by reading `apps/web/src/App.jsx` for the article detail route and the `mermaidSection` renderer
in `PageSections.jsx` to verify no divergence is introduced, and QA one representative reposted
article plus the pipeline diagram at a real local URL before batch-completing the rest.

## Technical notes

- **Content Write Gate**: fires for all 17 article drafts and the pipeline-explainer content — show before/after proposal, wait for explicit approval, per CLAUDE.md.
- **Human-Publishes Rule**: drafts only; nothing goes live without a standalone "publish" instruction, even after Content Write Gate approval.
- **Schema changes**: none expected — `article` already has `publishedAt`, `series`, `partNumber`, `categories`, `tags`, `relatedTerms` (confirmed 2026-09-22, `apps/studio/schemas/documents/article.ts`). If the taxonomy pre-flight surfaces a genuine gap, name the field before adding it.
- **Activation audit**: read `apps/web/src/lib/routes.js` to reconfirm no public pipeline/process page exists (none found as of 2026-09-22); read `apps/web/src/components/PageSections.jsx` around the `mermaidSection` component (SUG-13) to confirm current props/usage before authoring the diagram content.
- **Activation audit**: run the taxonomy pre-flight GROQ query for `tag`/`category`/`series` before proposing any new taxonomy value for the "release notes corner."
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
