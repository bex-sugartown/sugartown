---
**Epic:** ST-161 — Node: The Audit Took the Hot Pink (working title)
**Issue:** [#161](https://github.com/bex-sugartown/sugartown/issues/161)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — draft, review, publish as one unit
**Visual:** no
---

# ST-161 — Node: The Audit Took the Hot Pink (working title)

A single Knowledge Graph node (`/knowledge-graph`) about making Pink Moon pass WCAG 2.2 AA, what that cost the pink and lime look, and how small the effort turned out to be.

## Background

The Pink Moon accessibility work shipped as #150 (token contrast, neutral chips), #151 (rich text, semantics) and #152 (leftovers), closed 2026-10-11. An earlier implementation of #150 (`c3af9a8c`, 2026-10-10) was reverted (`0712c8cf`) because it did not match the intended direction, and both epics were rebuilt from the v4 audit handoff (`6eedb800`, 2026-10-11). The result moved the system back toward a neutral square one: chips neutral, small pink text on light now maroon, white labels on pink-600, rich text in pink and maroon only, with the canvas kept. Bex had put the audit off because the pink and lime world mattered to her, and the node's hook is that reluctance. The automation that would guard the result is filed but not built: #159 (ST-159, page-level axe and link checks) and #160 (`validate:contrast`).

**No draft exists.** This epic files the node only. Nothing is written to Sanity until Bex asks.

## Objective

A published Knowledge Graph node at `/knowledge-graph/{slug}`, agent-narrated per the node voice convention, in the failure, investigation, fix, lesson arc, covering three beats: (1) what was fixed for compliance, (2) the return to square one and the hunt for the thrill, (3) the effort, stated with measured numbers. Layers touched: content (one Sanity draft) and process (compliance gate, review). No schema, GROQ, React or CSS changes.

## Scope

- [ ] **1. Facts outline:** collect the verifiable record from ST-150, ST-151, #152 and the v4 audit (what failed, what changed, before and after ratios), and measure the effort with named commands — layer: editorial
- [ ] **2. Discovery:** taxonomy pre-flight and related-content check per `docs/write-pipeline-prompt.md` §1 — layer: process
- [ ] **3. Draft created in Sanity** after the outline is approved, via `create_documents` only — layer: content
- [ ] **4. Compliance gate** passed — layer: process
- [ ] **5. Human review and publish decision** — layer: process (Human-Publishes Rule applies)

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 1 | Approved outline, discovery notes | 1, 2 |
| 2 | Sanity draft, compliance gate passed | 3, 4 |
| 3 | Human review, publish decision | 5 |

## Acceptance Criteria

- [ ] Every figure in the node names the command that produced it (commit count, files changed, dates, contrast ratios) per CLAUDE.md §Technical diagram red-pen gate
- [ ] The node states the WCAG status plainly: ST-153 is open, so the node does not claim conformance
- [ ] The node describes #159 and #160 as filed or shipped, whichever is true on the day it is drafted
- [ ] Taxonomy is wired from existing documents only, with tools including Claude Code
- [ ] Content Write Gate: a before/after proposal is approved before any Sanity write
- [ ] `aiDisclosure` is set and the compliance gate passes with node exemptions noted
- [ ] Nothing is published without a separate, standalone instruction from Bex

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** fires. The copy is derived from a brief, not dictated.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. The node can be drafted before #159 and #160 ship, but it must describe their state accurately on the draft date; drafting after ST-159 ships gives it a stronger third beat.
- **Activation audits:**
  - Measure the effort: run `git log --since=2026-10-10 --until=2026-10-12 --oneline` for the commits, then measure ST-150, ST-151 and #152 separately from their shipped docs and commit ranges (the revert in between makes one overall diff misleading). State each command in the outline.
  - Read `docs/shipped/ST-150-a11y-pass-1-tokens.md` and `ST-151-a11y-pass-2-rich-text.md` for the before and after ratios; do not copy them from this doc.
  - Read the v4 audit under `docs/briefs/design-system/WCAG audit 26-10-10/`.
  - Check whether a Pink Moon or accessibility node already exists in `/knowledge-graph` before drafting.
- **Voice:** Bex is named, not pronoun'd. The heartbreak is Bex's to state; the narrator reports it and does not invent feeling beyond what she said.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`. Editorial drafting against a fixed arc and a measured fact base, with no architecture decisions.

## Non-Goals

- Writing or drafting the node now. This epic is the brief only.
- Claiming WCAG conformance. ST-153 owns the claim.
- Describing #159 or #160 as live before they ship.
- Publishing. That is Bex's separate instruction.
- A second node or a series. One node, one story.

## Related

- **GitHub:** [#161](https://github.com/bex-sugartown/sugartown/issues/161)
- **Related issues:** [#150](https://github.com/bex-sugartown/sugartown/issues/150), [#151](https://github.com/bex-sugartown/sugartown/issues/151), [#152](https://github.com/bex-sugartown/sugartown/issues/152), [#153](https://github.com/bex-sugartown/sugartown/issues/153), [#159](https://github.com/bex-sugartown/sugartown/issues/159), [#160](https://github.com/bex-sugartown/sugartown/issues/160)
- **Pipeline:** `docs/write-node-prompt.md`, `docs/write-pipeline-prompt.md`
- **Epic template:** `docs/epic-template.md`
