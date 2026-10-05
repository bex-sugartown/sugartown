---
**Epic:** ST-148 — Design system docs research and PRD
**Issue:** [#148](https://github.com/bex-sugartown/sugartown/issues/148)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-148 — Design system docs research and PRD

Collect design-system docs research in `docs/briefs/ds-docs-research/` and draft the PRD from it.

## Background

Bex wants a PRD that scopes design-system documentation. The research notes come first, then the PRD. Both live in `docs/briefs/ds-docs-research/` so the research and the requirements stay together. Reference surfaces: `docs/briefs/`, `docs/briefs/design-system/`, `.claude/skills/sugartown-prd-writer`.

## Objective

After this epic, `docs/briefs/ds-docs-research/` holds the research notes and a PRD drafted with the `sugartown-prd-writer` skill. Layers touched: docs only. No Sanity schema, GROQ, React, or content change.

## Scope

- [ ] Keep `docs/briefs/ds-docs-research/` as the home for research and artifacts, with its `README.md` (layer: docs)
- [ ] Collect the research notes as markdown files in that directory (layer: docs)
- [ ] Draft the PRD in that directory with `sugartown-prd-writer` (layer: docs)
- [ ] Review the PRD and decide which follow-up epics to file (layer: docs)

## Phases

Single phase.

## Acceptance Criteria

- [ ] `git ls-files docs/briefs/ds-docs-research/` lists a `README.md` and at least one research note
- [ ] A PRD file exists in `docs/briefs/ds-docs-research/` and is committed
- [ ] Each follow-up epic the PRD proposes is filed with `/new-epic` or declined with a reason

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none. No in-flight epic touches `docs/briefs/ds-docs-research/`.
- **Activation audits:** read `docs/briefs/design-system/PROJ-003-design-system-prd.md` before drafting, so the new PRD does not duplicate or contradict it.
- **Model & Mode:** `/model sonnet`. Document drafting needs no plan-mode handoff.

## Model & Mode [REQUIRED]

`/model sonnet`. The work is document drafting with no architecture decision.

## Non-Goals

- No design-system code, token, Storybook, or Sanity change. The PRD scopes work; it does not do it.

## Related

- **GitHub:** [#148](https://github.com/bex-sugartown/sugartown/issues/148)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **PRD skill:** `.claude/skills/sugartown-prd-writer`
