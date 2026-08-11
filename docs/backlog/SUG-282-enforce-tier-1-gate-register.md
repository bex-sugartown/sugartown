---
**Epic:** SUG-282 — Enforce the Tier 1 gate register
**Linear Issue:** [SUG-282](https://linear.app/sugartown/issue/SUG-282/enforce-the-tier-1-gate-register-two-gaps-sug-281-recorded-rather-than)
**Status:** Backlog
**Priority:** 🟡 Medium
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
**Depends on:** SUG-281 Phase 2 (shipped 2026-08-11)
---

# SUG-282 — Enforce the Tier 1 gate register

Filed by SUG-281 Phase 2 close-out under CLAUDE.md §Scope creep. Both gaps are recorded in
`docs/conventions/human-gate-conventions.md` §Known gaps; this is where they get closed.

## Background

SUG-281 Phase 2 made Tier 1 a closed register of 10 gates and Tier 2 the default. Coverage is
now total by construction — no section can be untiered, because the model has a default. What
it does not have is enforcement: two things in the model are declared and checked by nothing.

Recorded at the time rather than quietly dropped, on the principle the epic itself was built
around: a control that is declared and not firing is the failure class, and writing the gap
down is the minimum honest response when it cannot be closed in the same pass.

## Objective

Make the Tier 1 register true by machine rather than by discipline, or amend it to say what is
actually enforced.

## Scope

- [ ] **Production data mutation has no owning file.** It is listed Tier 1 in the register and
      has no CLAUDE.md section, no skill line, and no control-register row. A gate that exists
      only as a table row in a conventions doc is a gate no session will ever hit. Decide: it
      becomes a real CLAUDE.md section with a response mechanism, or it comes out of the Tier 1
      register as aspirational. Either is defensible; leaving it as-is is not.
- [ ] **Nothing machine-checks the register against CLAUDE.md's tags.** The register lists 10
      gates; CLAUDE.md carries 6 tagged headings plus 2 tagged close-out steps. Two declarations
      of the same fact with nothing keeping them in step is most of this repo's incident log.
      Likely an extension of `validate-control-register.js` rather than a new script — see
      Non-Goals on the freeze.
- [ ] **Cosmetic:** `### Incomplete epic doc hard stop` is Tier 2 but keeps "hard stop" in its
      title. No measurement error — it stopped counting toward `CAP_DECISIONS` when the matcher
      changed — but the name misleads a reader. Renaming touches anchors and inbound references,
      which is why SUG-281 did not fold it in.

## Non-Goals

- **Re-tiering anything.** The tier assignments shipped in SUG-281 and are not reopened here.
- **Adding a new `validate:*` script**, while CTL-040's freeze holds — no new validator until 5
  consecutive green CI runs on `main` (streak was 4 at 2026-08-11). Extending an existing gate
  is permitted and is the expected shape of item 2 regardless.

## Technical constraints

- **Instruction & Rule File Write Gate applies throughout.** `CLAUDE.md`,
  `docs/conventions/**` and `docs/ai/agentic-caucus/**` are all in scope. Every edit goes via a
  scratchpad copy, diffed and approved before it lands.
- **Verification review is blocking** if item 2 changes gate behaviour, per CLAUDE.md
  §Verification review.
- Any change to the tier vocabulary re-derives both `CAP_DECISIONS` and
  `countDecisionPoints`'s matcher in the same commit, measured by running
  `pnpm validate:doc-budget` — the protocol recorded in that script after SUG-281 Phase 2.

## Acceptance criteria

- [ ] Production data mutation either has an owning section a session will encounter, or is no
      longer claimed as Tier 1
- [ ] The Tier 1 register and CLAUDE.md's tags cannot disagree without something failing
- [ ] `pnpm validate:controls` and `pnpm validate:doc-budget` both pass, with any cap re-derived
      rather than estimated

## Related

- **Linear:** [SUG-282](https://linear.app/sugartown/issue/SUG-282)
- `docs/conventions/human-gate-conventions.md` §Known gaps — where both gaps are recorded
- `docs/backlog/SUG-281-gate-posture-and-tiering.md` — the epic that filed this
