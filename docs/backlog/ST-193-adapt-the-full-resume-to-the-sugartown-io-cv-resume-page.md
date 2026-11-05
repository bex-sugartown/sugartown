---
**Epic:** ST-193: Adapt the full resume to the sugartown.io CV / Resume page
**Issue:** [#193](https://github.com/bex-sugartown/sugartown/issues/193)
**Status:** Backlog
**Priority:** 🔴 Now
**Merge strategy:** (b) Single close-out, one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-193: Adapt the full resume to the sugartown.io CV / Resume page

Replace the short CV / Resume page body in Sanity with the full-length resume, and rewrite the hero title and subheading, which describe a pipeline demo that is no longer true.

## Background

Current state: `sugartown.io/cv-resume` (Sanity `page` `page-cv-resume`) holds a two-page version of the resume: 39 Portable Text blocks in one `textSection`, under a `heroSection` headed "⚡️ Live Demo: " with the subheading "This CV is dynamically generated from a Python/CSV pipeline." The body covers three roles in detail (Tatcha, Estée Lauder, Sephora), three one-line earlier roles, and no roles before 2017.

Why now: the full resume (`resume-factory/data/00 PROMPT + PROTOTYPE/Becky-Head_MASTER-PROTOTYPE_FirstOfItsName_2026_r6.pdf`, 6 pages, r6) exists nowhere else in full, because a six-page resume is too long to send to a recruiter. The site is the one place it can live at full length. The hero's "dynamically generated from a Python/CSV pipeline" claim is no longer true of this page.

Reference surfaces: `page` document `page-cv-resume` (hero section key `e25ca543bf10`, text section key `177a3d99a90f`); route `/cv-resume`; the hero CTA "Read the Node" points at `node-architecture-update-the-resume-factory-v2-0`.

## Objective

After this epic, `/cv-resume` shows the full resume as the canonical long version: Summary, Leadership & Impact, Professional Experience for all nine roles back to 2004, Education, Skills (five groups), and Projects. The hero title and subheading describe what the page now is. Layers touched: content only (Studio copy edit via Sanity MCP on one document). Excluded: Sanity schema, GROQ queries, React render, CSS, design system, and the resume-factory pipeline itself.

## Metadata plan

Not applicable, no content piece. This edits an existing page; it does not create an article, node, case study or glossary term.

| Type | Existing (use) | New (recommend) |
|---|---|---|
| Categories | n/a | n/a |
| Tags | n/a | n/a |
| Tools | n/a | n/a |
| Glossary terms | n/a | n/a |

## Scope

- [ ] Activation audit of the live page: read `page-cv-resume` in full (all 39 body blocks, hero fields, SEO and meta fields, any `citationRef` or `markDefs`) and record what the new body must replace. Layer: content
- [ ] Block-by-block mapping from the r6 PDF to Portable Text: section headings, the Leadership & Impact label/value pairs, nine role headers (employer, location, title, dates), bullets, Education, five skills groups, Projects. Text comes from the PDF, never from memory or from the current page. Layer: content
- [ ] Site-specific adaptation decisions, each shown in the proposal for approval: omit the phone number (public page); name heading ("Becky Alice Head" today, "Becky Head" in the PDF); contact line (Email, LinkedIn, Portfolio links as on the live page); tagline; whether the Projects entry that describes sugartown.io stays on its own site. Layer: content
- [ ] Rewrite the hero `heading` and `subheading` so they state what the page is now, and decide whether the "Read the Node" CTA to the resume-factory v2.0 node stays. Layer: content
- [ ] Content Write Gate proposal: before/after table per changed field path, approved before any patch. Layer: content
- [ ] Patch the draft of `page-cv-resume` with `patch_documents`, every block carrying `markDefs: []` and every span `marks: []`, array paths indexed by `[_key==...]`. Layer: content
- [ ] Verify the draft locally (preview perspective) and, after Bex publishes, on `sugartown.io/cv-resume`: no console errors, block count and headings match the mapping. Layer: content

## Phases

Single phase.

## Acceptance Criteria

- [ ] A Content Write Gate proposal (before/after table, one row per changed field path) was shown and approved before any patch ("proposal approved before patch").
- [ ] Every role, date range, title and bullet on the page matches the r6 PDF text; a row-by-row check against the PDF is recorded in the issue comment at close-out, with the command or read that produced it.
- [ ] The page contains no phone number, and no em dashes in any reader-facing text.
- [ ] The hero heading no longer contains "Live Demo" and the subheading no longer says the CV is generated from a Python/CSV pipeline.
- [ ] The nine employers (Tatcha, Estée Lauder, Sephora, Elephant, StubHub, Backroads, Bare Minerals, Treasury Wine Estates, Lyris) each appear once as a heading or role line, and Lyris appears with both of its roles.
- [ ] Every Portable Text block in the patch has `markDefs: []` and every span `marks: []`; the document opens in Studio with the editor toolbar enabled.
- [ ] The patch lands on the draft only. The page is published only after a separate, standalone publish instruction (Human-Publishes Rule).
- [ ] After publish, `pnpm test:smoke` passes locally and `/cv-resume` renders with no console errors.

## Human QA Walkthrough: example local pages

Not applicable, no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** fires. Copy is adapted from a source document rather than dictated word for word, and existing blocks are removed. Surface: `page-cv-resume`, `sections[_key=="e25ca543bf10"]` (hero) and `sections[_key=="177a3d99a90f"].content` (body).
- **Human-Publishes Rule:** approval of the proposal authorizes the draft write only. Publishing needs its own standalone instruction, offered as one `AskUserQuestion` when the draft is ready.
- **Schema changes:** none. No schema deploy.
- **Upstream dependencies:** none. No in-flight epic in `docs/backlog/` touches `page-cv-resume`; confirmed 2026-11-04 with `grep -rli cv-resume docs/backlog`, which returned nothing.
- **Activation audits:** (1) `*[_id=="page-cv-resume"][0]` in raw perspective, to see whether a `drafts.page-cv-resume` already exists and whether it differs from published; (2) read the live `sections[1].content` for any link `markDefs` (Email, LinkedIn, Portfolio) so they carry over; (3) read the `page` schema in `apps/studio/schemas/` for SEO and meta fields on this page type; (4) confirm the heroSection fields that hold title and subheading (`heading`, `subheading` on the live document); (5) check whether the role and company names the page uses link to `tool` or `person` taxonomy anywhere (they should not; this is a Portable Text edit).
- **Source of truth:** the r6 PDF. Where the live page and the PDF disagree (for example Sephora "Hybrid" on the page and "Remote" in the PDF, "Becky Alice Head" and "Becky Head"), the PDF wins unless the proposal says otherwise.
- **No invented facts:** no new metrics, no softened wording, nothing moved between roles. Gaps get flagged in the proposal, not filled.
- **Voice and style:** reader-facing, so `docs/brand/brand-voice-guide.md` applies in full: no em dashes, no filler transitions, no AI vocabulary.
- **Model & Mode:** `/model sonnet`, see below.

## Model & Mode [REQUIRED]

`/model sonnet`. Content-only Portable Text mapping with no architecture decisions; Sonnet executes it directly.

## Non-Goals

- No schema, GROQ, React, CSS or design-system change. If the long body needs a layout the existing `textSection` cannot express, that is a separate epic with its own vspec.
- No change to the resume-factory pipeline, the PDF, or any file under `resume-factory/`. The PDF is read-only input; `resume-factory/data/` is never copied into this repo.
- No PDF download button, print stylesheet, or tailored per-job variants of the page.
- No new taxonomy documents (tags, tools, people, projects).
- No publish without a separate publish instruction.
- No edit to the "Read the Node" target node itself.

## Related

- **GitHub:** [#193](https://github.com/bex-sugartown/sugartown/issues/193)
- **Source:** `resume-factory/data/00 PROMPT + PROTOTYPE/Becky-Head_MASTER-PROTOTYPE_FirstOfItsName_2026_r6.pdf` (local only, never committed)
- **Epic template:** `docs/epic-template.md`: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
