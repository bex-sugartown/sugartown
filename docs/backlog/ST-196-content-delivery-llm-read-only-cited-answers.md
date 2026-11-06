---
**Epic:** ST-196 — Content-delivery LLM: read-only, cited, published-only answers
**Issue:** [#196](https://github.com/bex-sugartown/sugartown/issues/196)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-196 — Content-delivery LLM: read-only, cited, published-only answers

The read-only delivery layer that answers questions from published Sanity content with a source link on every sentence.

## Background

This is the lead theme of `docs/briefs/north-star-ontology-second-brain-prd.md`. It cannot start until the prototype (#194) chooses a retrieval method, the ontology spec tool (#197) gives it a referee, and the answer-surface vspec (#195) defines how answers render. The web client reads the `published` perspective only (`apps/web/src/lib/sanity.js`, perspective delegated to `contentState.js`).

## Objective

After this epic a query returns an answer built only from published documents, each sentence linked to its source, or "not covered". The epic touches the retrieval and answer layer and its tests. Rendering belongs to the answer-surface implementation epic that follows #195. It adds no Sanity schema field, and nothing the layer produces is written to Sanity.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Retrieval over published content using the method #194 recommends — layer: tooling
- [ ] Answer assembly with a source link per sentence and "not covered" as the default — layer: tooling
- [ ] Glossary terms answered with the unaltered Sanity definition text (US-003) — layer: tooling
- [ ] Test set: 30 questions, 10 out-of-scope, 3 draft-only canaries (US-001, US-002) — layer: tooling
- [ ] Fallback to existing archive and taxonomy navigation when the layer is unavailable — layer: tooling

## Phases

Single phase. If the test set cannot pass on one method, stop and return to #194.

## Acceptance Criteria

- [ ] 100% of answer sentences in the test set link to a published document, measured by script, date recorded
- [ ] 0 citations of draft-only documents across the test set
- [ ] 10 of 10 out-of-scope questions return "not covered"
- [ ] A glossary question returns the Sanity definition unaltered
- [ ] With the layer disabled, the fallback renders and no partial answer appears

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate / Human-Publishes Rule:** the layer is read-only and creates no documents.
- **Schema changes:** none.
- **Upstream dependencies:** blocked on #194, #197, and #195 for rendering. Reads edges marked displayed in the ontology map only.
- **Activation audits:** re-read `apps/web/src/lib/contentState.js` and confirm production forces `published`.
- **Carbon cost:** pick the cheapest method that meets the criteria.

## Model & Mode [REQUIRED]

`/model opus` with plan mode: architecture and high ambiguity.

## Non-Goals

Writing or publishing; answering from model memory; querying drafts; vendor lock-in decided here.

## Related

- **GitHub:** [#196](https://github.com/bex-sugartown/sugartown/issues/196)
- **PRD:** `docs/briefs/north-star-ontology-second-brain-prd.md` §3, §7b
