---
**Epic:** ST-194 — Prototype: grounded, cited answers on a private evaluation corpus
**Issue:** [#194](https://github.com/bex-sugartown/sugartown/issues/194)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-194 — Prototype: grounded, cited answers on a private evaluation corpus

Settle whether a content-delivery LLM needs retrieval infrastructure, using a small private corpus before any public surface exists.

## Background

`docs/briefs/north-star-ontology-second-brain-prd.md` leads with a read-only content-delivery LLM and lists Open Decision 2: is retrieval infrastructure needed at all. A separate private evaluation project holds a small, structured, tiered corpus (platform profiles, a generated matrix, fact checks) and an existing grader. Karpathy's LLM-wiki pattern, cited in the source post, used plain text and no vector database. Sugartown's own corpus is about 220 published documents (`docs/backlog/SUG-36-site-search.md`).

## Objective

After this epic there is a findings record that answers Open Decision 2 with evidence: which of plain-text context, a client-side index, Sanity embeddings, or hosted search meets the grounding bar, at what cost. The epic touches tooling and a findings document only. It changes no Sanity schema, GROQ query or React component, and publishes nothing.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Use the `sugartown-prototype-writer` skill to write a time-boxed prototype brief naming the one claim under test — layer: tooling
- [ ] Build a fixed test set: 30 questions, 10 out-of-scope questions, 3 restricted-tier canaries — layer: tooling
- [ ] Run each candidate retrieval method against the set and record grounding, "not covered" behaviour and cost — layer: tooling
- [ ] Write the findings record and update Open Decision 2 in the PRD — layer: docs

## Phases

Single phase.

## Acceptance Criteria

- [ ] Every answer sentence in the best method's run links to a source document, measured by script, date recorded
- [ ] 10 of 10 out-of-scope questions return "not covered"
- [ ] 0 restricted-tier canaries retrieved by a lower tier
- [ ] The model never scores or recommends; a check confirms it
- [ ] Findings record states the recommended method and the cost of each rejected one
- [ ] No client name or confidential detail appears in any file committed to this repo

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** does not fire; nothing is written to Sanity.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. Informs #195 and #196.
- **Confidentiality:** corpus and results stay in the private project's repo. Only a generic findings summary comes back here.
- **Activation audit:** read the PRD §3 prototype rules, and the private project's rules file for its confidentiality tiers, before building.

## Model & Mode [REQUIRED]

`/model opus` with plan mode: high ambiguity, a design decision about retrieval method.

## Non-Goals

Public surface; vendor selection; scoring or recommending platforms; any write to Sanity.

## Related

- **GitHub:** [#194](https://github.com/bex-sugartown/sugartown/issues/194)
- **PRD:** `docs/briefs/north-star-ontology-second-brain-prd.md` §3, §7b
