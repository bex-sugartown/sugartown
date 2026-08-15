# Release Notes — v0.33.0

**Date:** 2026-08-15
**Scope:** Sugartown monorepo — apps/web, docs, tooling

---

## What this release is

Two things happened between 0.32.0 and 0.33.0. A layer of process-governance machinery
was built, and then it was removed again. Alongside that, a four-month-old content bug
was found and fixed: 110 published documents had been invisible to every logged-out
reader since March.

This release is unusual in that a substantial part of what it records no longer exists.
Those entries are marked in the CHANGELOG rather than deleted, because the work happened
and the reasoning is worth keeping.

---

## What changed

### 110 documents were invisible for 158 days

Sanity treats a dot in a document `_id` as a path segment. The WordPress import minted
ids in the form `wp.<type>.<id>`, so every document it created was unreachable to
unauthenticated readers. 110 published documents were affected.

The fix migrated 111 ids to `<type>-<slug>` and rewrote 612 references across 39 field
paths in a single atomic transaction. It was verified by three measurements: 0 hidden
documents, 0 dangling references, and reference-edge count conserved at 1,835.

A viewer token had been shipped to every browser as a workaround. It is removed from
production bundles and revoked. `validate:taxonomy` now passes anonymously in CI, which
was the acceptance test for the work.

### A governance layer was built, then withdrawn

Between 2026-07-21 and 2026-08-13 the repo accumulated a register-and-validator layer
over its own engineering conventions: a gate taxonomy with tier registers, a requirement
to run a verification review before building any gate, a word cap on the instruction
surface, a governance data layer with its own schema and three validators, and CI
annotations for warn-only gates.

All of it is gone at 0.33.0. The generated `governance.json` had zero consumers anywhere
in the app. The `/platform/governance-draft` page existed only to host a coverage tally
that had itself been retired for being undated and, in three claims, measurably false.

Nothing was deleted outright. Everything moved to
`zArchive/2026-08-sug284-governance-layer/` by `git mv`, so full history and a
resurrection path are preserved. The removal used forward commits only, with no history
rewrite.

Three things were kept deliberately. The narrative documents under
`docs/ai/agentic-caucus/` remain as inert reference. The Tier 1/2/3 model in
`human-gate-conventions.md` stays, because the Content Write Gate and the
Human-Publishes Rule depend on it for their approval mechanism. And the Instruction &
Rule File Write Gate stays, having gated the removal's own edits to CLAUDE.md.

### One priority queue instead of two

`docs/backlog/sugartown-backlog-priorities.md` is deleted, 499 lines of it. Linear is
now the single priority queue with no second copy to reconcile. Size-aware routing
replaces the stack across CLAUDE.md, the `/new-epic` skill, the epic template, and both
release prompts.

### Epic decomposition has a defined shape

Epics with more than 5 Scope items now decompose into a scope-to-phase mapping recorded
in the epic doc. Two revisions landed before release. Numbered phases were dropped as a
decomposition trigger, because nearly every Sugartown epic has them and the clause made
the Scope-item threshold inoperative. Linear sub-issues were withdrawn as the mechanism:
they have no backlog doc by design, so each one filed turned CI red, and they consumed a
free-plan issue budget the workspace had already exhausted.

### Smaller fixes

`collectLinear()` silently truncated at 250 issues on a team of 268, and dropped every
`triage`-state issue from its buckets. It now pages the full result set.

The `AUTOMATED CHECKS · 18` tile on `/platform/governance` claimed those checks were
"enforced by code and pre-commit hooks". Six run at pre-commit; the rest are CI only.
The tile now says so.

---

## Not in this release

- **The coverage tally is not published anywhere.** It was removed from
  `/platform/governance`, moved to a `noindex` draft page, and then that page was removed
  too. No replacement shipped.
- **`validate:urls`, `validate:filters` and `validate:taxonomy` remain structurally
  unprobeable.** They judge published Sanity documents rather than repo files, so no file
  in this repo can make them fail. The refactor that would change this, separating
  fetching from judging, is not scheduled.
- **No changes to `apps/studio`, `packages/design-system`, or `apps/storybook`** this
  cycle.

---

## Validator state at release

```
pnpm validate:tokens                  ✅  655 unique tokens, 112 CSS files scanned
                                          all var(--st-*) references resolve
pnpm validate:tokens --strict-colors  ✅  no hardcoded color values in component/page CSS
pnpm validate:style-mirror            ✅  all enforced style + component mirrors byte-identical
pnpm lint                             ✅  6 tasks successful, 6 total
pnpm test:smoke                       ✅  5/5 Playwright route specs pass
CI run 31879933820                    ✅  success — both jobs, all 14 steps
```
