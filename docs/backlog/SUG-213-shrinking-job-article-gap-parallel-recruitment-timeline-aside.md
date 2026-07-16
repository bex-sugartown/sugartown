---
**Epic:** SUG-213 — Shrinking Job article — GAP parallel recruitment timeline aside
**Linear Issue:** [SUG-213](https://linear.app/sugartown/issue/SUG-213/shrinking-job-article-gap-parallel-recruitment-timeline-aside)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-213 — Shrinking Job article — GAP parallel recruitment timeline aside

Add a parallel timeline/aside to "The Incredible Shrinking Job" article showing GAP Inc.'s similar VMS-driven contingent-staffing recruitment trajectory, grounded in an analysis of why the same requisition gets shopped across multiple staffing agencies.

## Background

`docs/drafts/article-shrinking-job-mock.html` (draft mock, not yet in Sanity) narrates six years of a single enterprise-retail requisition shrinking in title and comp while being re-shopped across staffing agencies. Bex has noticed GAP Inc. running a parallel, similarly-shrinking trajectory on the same kind of req, but the GAP data points (dates, titles, comp, agencies) have not yet been broken out the way the existing company's timeline has — that breakdown is unresolved and is an explicit prerequisite of this epic, not an assumption.

Separately, Bex has a written analysis of the underlying mechanic: large retailers run contract/contract-to-hire hiring through a Vendor Management System (SAP Fieldglass, Beeline, Coupa) against a preferred-vendor list of 5–15+ staffing agencies who all race the same open requisition. That mechanic explains the flood of duplicate recruiter outreach as a named, structural pattern rather than a coincidence, and gives the GAP thread its analytical spine (see Technical notes for the source text).

Reference surfaces: `docs/drafts/article-shrinking-job-mock.html` today; the eventual `article` Sanity document and PortableText render pipeline once the piece is drafted for real.

## Objective

After this epic, the mock at `docs/drafts/article-shrinking-job-mock.html` contains a second, parallel timeline/aside presenting GAP Inc.'s recruitment trajectory next to the existing company timeline, plus a short analytical passage (adapted from Bex's VMS/contingent-staffing explainer) covering the shared root cause. Layers touched: content/mock (HTML draft), editorial copy. Explicitly not touched in this epic: Sanity schema, GROQ queries, React render, or any new DS component — this epic's scope stops at the HTML mock and Phase 0 sign-off. Turning the approved mock into a live Sanity draft is downstream work gated by the Content Write Gate and is out of scope for this epic's close-out unless Bex explicitly extends it at activation.

## Scope

- [ ] Bex supplies GAP Inc. recruitment trajectory data points (dates, titles, contract/FTE type, approx. comp, number of staffing agencies involved) — layer: content, blocking prerequisite before any mock edit
- [ ] Update `docs/drafts/article-shrinking-job-mock.html` with a GAP parallel timeline/aside section positioned alongside the existing company timeline — layer: content/mock
- [ ] Adapt the VMS/contingent-staffing explainer (preferred-vendor list, SAP Fieldglass/Beeline/Coupa, req-race mechanic, financial incentive to blast fast) into on-voice article prose or a boxed callout explaining the shared root cause — layer: content
- [ ] Reuse-first pass: extend the mock's existing `.sidebar-block`, `.pull-quote`, and `.data-table-wrap` CSS patterns to carry the GAP comparison; do not introduce a new visual pattern unless the reuse-first audit below proves none of the existing patterns fit — layer: content/mock CSS
- [ ] Phase 0 mock review with Bex and explicit sign-off before any Sanity/JSX work begins — layer: process

## Acceptance criteria

- [ ] `docs/drafts/article-shrinking-job-mock.html` contains a GAP parallel timeline/aside section using only existing mock CSS classes/patterns, or a documented, audited exception if a new class was unavoidable
- [ ] GAP data points (dates, titles, comp, agency count) are confirmed by Bex and present in the mock — no placeholder or invented figures
- [ ] VMS/contingent-staffing explainer is adapted into on-voice prose (anti-slop rules pass: no em dashes, no filler transitions, no AI vocabulary) and integrated as either inline analysis prose or a boxed callout
- [ ] Bex has reviewed the updated mock and given explicit "Visual QA approved" (or equivalent sign-off) before this epic's Phase 0 is considered closed
- [ ] If/when this graduates to a live Sanity draft: a Content Write Gate proposal (before/after table) is presented and approved before any `create_documents`/`patch_documents` call
- [ ] No new DS component is created for this epic — the GAP comparison reuses the mock's existing sidebar/aside/pull-quote/data-table patterns, or an explicit component-choice-gate exception is documented

## Human QA Walkthrough — example local pages

Not applicable at Phase 0 — the deliverable is a static HTML draft mock at `docs/drafts/article-shrinking-job-mock.html`, not a live route. If this epic is later extended to publish the article to Sanity, the extension must add this section per `docs/epic-template.md` §Human QA Walkthrough:

> Activation audit (only if extended to publish): read `apps/web/src/App.jsx` to confirm the article detail route/component, and build the Human QA Walkthrough table (one example local article URL, plus one unrelated article as a regression guard) before any CSS or component work lands.

## Technical notes

**Content Write Gate:** does not fire in this epic's scope (mock-only). It will fire the moment this work extends into a live Sanity article draft — the GAP section's copy and the VMS explainer prose are both AI-adapted content and require a before/after proposal table approved before any patch.

**Schema:** none anticipated. This epic assumes the existing article body/section fields are sufficient to hold a second timeline/aside in prose form. If the reuse-first audit below concludes a genuinely new structured section type is needed (the way SUG-160 needed `techTimeline`), that is a scope change requiring its own Component Choice Gate pass and Phase 0 mock update — do not add schema speculatively in this epic.

**Related pattern — SUG-160 TechTimeline:** `docs/backlog/SUG-160-article-i-was-online-techtimeline.md` is building a single-column vertical `TechTimeline` DS component for an unrelated personal-history article. It is not assumed to fit a two-track *comparison* timeline (this epic's shape is parallel/side-by-side, not sequential). At activation, check whether TechTimeline has shipped and whether its API could be composed twice (two instances side by side) before defaulting to prose-only asides.

**Activation audits (do before writing any mock HTML):**
1. Read `docs/drafts/article-shrinking-job-mock.html` in full (already done during epic creation) and reuse its existing `.sidebar-block`, `.pull-quote`, `.data-table-wrap`, and `.chart-section` classes verbatim where the GAP content fits the same shape.
2. Grep `apps/web/src/design-system/components/Callout/` for the closest live production analog to the mock's `.pull-quote`/`.takeaways` boxes, so the eventual Sanity implementation maps to a real DS component rather than a new one.
3. Confirm with Bex whether the GAP thread needs its own comp table + SVG chart (like the existing company's) or is a lighter prose-only aside — this determines how much of the mock's `.data-table-wrap`/`.chart-section` machinery gets duplicated versus summarized.

**VMS/contingent-staffing source text** (Bex-authored, to be adapted into on-voice prose, not pasted verbatim):
> Large corporate retailers run contract/contract-to-hire hiring through a Vendor Management System (SAP Fieldglass, Beeline, Coupa) against a preferred-vendor list of 5–15+ staffing agencies who all compete against the same open requisition. When a req drops, every agency is notified simultaneously and races the clock. Recruiters often work from the same sourced lists, so a matching profile gets hit by all of them in the same window. Agencies are paid only if their candidate is placed, so there's a real incentive to submit fast rather than qualify carefully. The same req can reopen repeatedly as requirements shift, restarting the cycle each time.

**Model & Mode [REQUIRED]:** `/model sonnet` — this is content/mock authoring, not an architecture decision. No plan-mode handoff needed.

## Model & Mode

`/model sonnet` — content/mock authoring epic (HTML draft edit + editorial prose), no schema or component architecture decisions in scope.

## Non-Goals

- No new DS component — reuse-first decision made at epic creation; a new component is only in scope if the activation audit proves no existing pattern fits, and that would be a scope change requiring its own sign-off
- No schema changes unless the activation audit proves the existing article fields can't hold this content (not assumed)
- No SEO/AEO optimization pass on the article (separate epic if warranted)
- No publish to live Sanity in this epic — mock update and Phase 0 sign-off only; drafting/publishing to Sanity is downstream work, out of scope unless explicitly extended

## Related

- **Linear:** [SUG-213](https://linear.app/sugartown/issue/SUG-213/shrinking-job-article-gap-parallel-recruitment-timeline-aside)
- **Mock:** `docs/drafts/article-shrinking-job-mock.html`
- **Related pattern (not a dependency):** `docs/backlog/SUG-160-article-i-was-online-techtimeline.md` — single-column TechTimeline component, different visual shape (sequential, not parallel)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
