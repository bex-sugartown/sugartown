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
"corner" of the knowledge graph, and opening with: a hero, a generic non-clickable Mermaid diagram
(Governance → CHANGELOG Entry → Release Note, same on every article), and a centered "Subtle
Centered" breadcrumb line ("**Governance**: **Changelog** → Release Note" — Governance and
Changelog linked, Release Note plain since it's the current page), then a divider before the
release note body (decided interactively 2026-09-22 against the v0.20.0 pilot; see Technical
notes). Every article also carries pre-existing-only metadata enrichment (tags, `relatedTerms`,
and an inline `glossaryTermRef` where a term genuinely appears verbatim in the body — no new
taxonomy or glossary documents) and a shared `aiDisclosure` string. Touches: Sanity content
(article documents, taxonomy), one small reusable Portable Text schema addition (two new block
styles), no new public page. Explicitly excludes: v0.8.0–v0.19.0 (out of requested range), any
rewrite of release-note prose into first-person PM voice, any change to `docs/release-notes/`
source files themselves, and per-release Epic/PRD links (dropped 2026-09-22 — see Non-Goals).

## Scope

- [x] Decide and record repost voice/treatment: **verbatim repost** in the Governance/ops register — decided 2026-09-22 — layer: content, decision
- [x] Taxonomy pre-flight (`*[_type in ["category","tag","series"]]{_id, name, "slug": slug.current}`) — decided 2026-09-22: reuse `category-governance` and `tag-release-management` (exact matches), create one new `series` doc ("Release Notes" / `release-notes`, no existing series fits) — layer: schema/taxonomy
- [x] Confirm whether a public pipeline-explainer page exists — decided 2026-09-22: **it does**, `/platform/governance` (`GovernancePage.jsx`) already has the Release Process and AI Governance Workflow diagrams; no new page built — layer: frontend/content
- [x] Build a generic (non-clickable) release-pipeline Mermaid diagram — decided 2026-09-22: 3 nodes, Governance → CHANGELOG Entry → Release Note, identical on every article, no per-release Epic/PRD nodes (see below) — layer: content
- [x] Decide Epic/PRD link scope — decided 2026-09-22: generic Governance/Changelog/Release Note links only, on every article; per-release Epic/PRD links dropped as out of scope (most pre-ST-109 releases have no epic doc to link, and it's not worth the per-release variability) — layer: content, decision
- [x] Add `textSection` "Subtle" / "Subtle Centered" Portable Text block styles — reused pattern discovered building the pilot's breadcrumb line, small schema+component addition, not section-scoped fields (revised from an initial section-level-field attempt) — layer: schema, frontend
- [x] Pilot v0.20.0 built and iterated against directly in Sanity (serving as the vspec-equivalent) — approved 2026-09-22 — layer: content, design
- [x] Draft the remaining 16 article documents (v0.21.0–v0.36.0) as Sanity drafts, matching the v0.20.0 pilot's structure exactly — done 2026-09-22 — layer: content. v0.23.25 folded into v0.23.0's "Also in this release" subsection as planned; v0.26.26 turned out to be a byte-identical duplicate of v0.26.0 (not distinct content), so nothing needed folding there
- [x] Metadata enrichment per article: additional existing tags, `relatedTerms` for genuinely-implied (not literal) terms, inline `glossaryTermRef` only where a term appears verbatim — no new tag/category/series/glossaryTerm documents — done 2026-09-22 — layer: content, taxonomy
- [x] Write one shared `aiDisclosure` string suitable for a release-notes repost, applied to all 17 articles — done 2026-09-22 — layer: content
- [x] Content Write Gate proposal (before/after table) for the batch — shown and approved 2026-09-22 for the pattern; batch execution proceeds under that approval plus this doc's updated Acceptance Criteria — layer: process

## Phases

Single phase.

## Acceptance Criteria

- [x] 17 of 17 `article` documents exist as Sanity drafts, one per release v0.20.0 through v0.36.0, each with correct backdated `publishedAt` — confirmed 2026-09-22 (`partNumber` 1–17, sequential, no gaps)
- [x] Every article carries `series` → new `release-notes` series (with sequential `partNumber`), `categories` → `category-governance`, `tags` → `tag-release-management` plus any additional genuinely-relevant existing tags — `count(*[_type == "article" && series->slug.current == "release-notes"])` returns exactly 17 (drafts perspective), confirmed 2026-09-22
- [x] Every article's opening matches the v0.20.0 pilot exactly: hero → generic Mermaid diagram (Governance → CHANGELOG Entry → Release Note) → centered "Subtle Centered" breadcrumb line (Governance and Changelog linked, Release Note plain) → divider → body
- [x] Every article has pre-existing-only metadata enrichment: taxonomy pre-flight matches on every article, additional existing tags/`relatedTerms` picked per release's actual content, inline `glossaryTermRef` added on the two articles with a genuine verbatim match (v0.20.0 "PortableText", v0.36.0 "WCAG") — no fabricated or forced matches on the other 15
- [x] Every article carries the same shared `aiDisclosure` string (see Technical notes for the agreed text)
- [x] Content Write Gate proposal (batch pattern) was shown and approved 2026-09-22 before any `create_documents` call
- [x] Pilot iterated and approved directly in Sanity in place of a static vspec file (see Scope) — Phase 0 intent satisfied interactively
- [x] Nothing published without an explicit standalone publish instruction (Human-Publishes Rule) — v0.20.0 was published by Bex herself in Studio mid-epic while reviewing the pilot; the other 16 remain drafts

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
- **Portable Text schema addition (2026-09-22)**: `standardPortableText`'s block `styles` list gained `Subtle` and `Subtle Centered` (`apps/studio/schemas/objects/portableTextConfig.ts`), rendered in `apps/web/src/components/PageSections.jsx`'s local `portableTextComponents.block` map and in `richTextComponents.jsx`'s `defaultRichTextComponents.block` (the fallback other `RichText` callers use). An earlier attempt added `tone`/`align` as section-level fields on `textSection` directly — reverted same day per Bex's feedback that formatting choices belong in the rich-text editor's own style dropdown, not a separate field group. Schema deployed via `npx sanity schema deploy`; both commits pass `pnpm lint` and the token/style-mirror validators, and the block styles are Storybook-covered (`PageSections.stories.tsx` → `Text Section Subtle Center`, checked in both `default` and `dark-pink-moon`).
- **Generic pipeline links only (2026-09-22)**: every article uses the same 3-node Mermaid diagram and the same breadcrumb line — no per-release Epic/PRD link. Dropped after the pilot exposed that most releases before roughly SUG-109 have no shipped epic doc to link to, and per-release variability wasn't worth the inconsistency. A future epic could revisit per-release Epic/PRD links once more releases have shipped-epic-doc coverage.
- **aiDisclosure text (2026-09-22)**: `"No rewrite, no spin: this is the release note as shipped, reposted by Claude Code."` — same string on all 17 articles. States plainly what Claude Code did (verbatim repost) without claiming authorship of the underlying release note content, which was written as part of Sugartown's normal release process, not by this epic.

## Model & Mode [REQUIRED]

`/model opus` with plan mode for the Pre-Execution Gate and Phase 0 (taxonomy decision,
pipeline-page scope, vspec) — this is high-ambiguity content/IA work with a real design decision
(verbatim repost vs. framing wrapper) before any content gets written. Exit plan mode once the
vspec is approved and switch to direct execution for the mechanical repost of 17 articles.

## Non-Goals

- Rewriting `docs/release-notes/` source files or the release process itself — out of scope, this epic only reposts existing content.
- Reposting v0.8.0–v0.19.0 — explicitly excluded by the requested range; a follow-up epic can extend backward if wanted.
- Publishing any article — the Human-Publishes Rule keeps that a separate, explicit, later instruction.
- New Sanity schema fields on `article` — existing fields are sufficient unless the taxonomy pre-flight proves otherwise. (The `textSection` Portable Text block-style addition is a shared, reusable PT schema change, not an `article`-specific field, and was approved separately mid-epic — see Technical notes.)
- Per-release Epic/PRD links in the pipeline diagram or breadcrumb — dropped 2026-09-22; every article uses the same generic Governance/Changelog/Release Note links (see Technical notes).
- Creating any new tag, category, or glossary term — metadata enrichment (Scope) draws only from what already exists, plus the one `release-notes` series already decided.

## Related

- **GitHub:** [#135](https://github.com/bex-sugartown/sugartown/issues/135)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Upstream:** CHANGELOG compression and `release-assistant-prompt.md` v6, both 2026-09-22 (same session)
