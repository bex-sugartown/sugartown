---
**Epic:** ST-195 — Answer surface: Phase 0 vspec for asking the content a question
**Issue:** [#195](https://github.com/bex-sugartown/sugartown/issues/195)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-195-answer-surface-phase-0-vspec.vspec.html`
---

# ST-195 — Answer surface: Phase 0 vspec for asking the content a question

A reader-facing surface where a visitor asks a question and sees a cited answer, designed and signed off before any code.

## Background

The north-star PRD adds a read-only content-delivery LLM. Any surface that shows its answers is a new visual format, so the Phase 0 visual spec gate applies (`CLAUDE.md` §Phase 0 visual spec gate). Site search (#39, SUG-36) has no engine or surface yet, and PRD Open Decision 5 asks whether the two fold together.

## Objective

After this epic there is an approved vspec for the answer surface, with the six navigation-annotation items answered if it contains a nav surface, and a decision on its relationship to site search. No JSX, CSS or schema is written. The epic touches the vspec file and the epic docs only.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Decide fold-in versus separate surface with #39 and record it — layer: docs
- [ ] Vspec: input, answer, per-sentence citations, "not covered" state, loading and error states, mobile collapse — layer: design
- [ ] Vspec: AI labelling per `ai-ethics-and-operations.md` principle 13, naming sources used — layer: design
- [ ] Vspec: accessibility annotations for keyboard order and screen reader announcement of answers — layer: design
- [ ] Component choice audit and CSS class naming table, as `react.md` and `css-layout.md` require — layer: design

## Phases

Single phase.

## Acceptance Criteria

- [ ] Vspec exists at the path above and Bex has signed off in the Phase 0 gate
- [ ] Every class name in the vspec is semantic and passes the CSS reuse audit
- [ ] The "not covered" state is shown, not implied
- [ ] Relationship to #39 is recorded in both epic docs

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes at this stage. Activation audit for the implementing epic: read `apps/web/src/App.jsx`, list every page type the surface mounts on, and build the walkthrough table per `docs/epic-template.md`.

## Technical notes

- **Content Write Gate:** does not fire.
- **Schema changes:** none.
- **Upstream dependencies:** #194 prototype result informs what the surface can promise; #39 decision.
- **Activation audits:** read `.claude/rules/react.md` §Component choice gate and `.claude/rules/css-layout.md` §CSS class pre-implementation reuse audit (both path-scoped and not loaded at Phase 0).

## Model & Mode [REQUIRED]

`/model sonnet`: vspec authoring against an existing design system.

## Non-Goals

Any implementation code; the retrieval or model choice; write access of any kind.

## Related

- **GitHub:** [#195](https://github.com/bex-sugartown/sugartown/issues/195)
- **PRD:** `docs/briefs/north-star-ontology-second-brain-prd.md` §7b
