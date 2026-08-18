---
**Epic:** ST-101 — Extract the renamed-heading check, and resume per-group QA profiles on a varied sample
**GitHub Issue:** [#101](https://github.com/bex-sugartown/sugartown/issues/101)
**Status:** Backlog
**Priority:** 🟡 Medium
**Merge strategy:** (a) Merge-as-you-go
---

# ST-101 — Extract the renamed-heading check, and resume per-group QA profiles on a varied sample

Successor to ST-99 ([#99](https://github.com/bex-sugartown/sugartown/issues/99)), which ran its QA walkthrough (v1) on three rule-file changes and reviewed the results. Two items came out of that review as deferrals rather than findings, and they are recorded here so they sit in a real Scope rather than in prose.

## Background

ST-99's three runs produced nine findings. The review is in `docs/shipped/ST-99-rules-change-qa.md`. Two things it established:

1. **One defect class repeated, and it is mechanical.** A renamed section heading orphaning inbound cross-references appeared in run 2 (`e5a22d89`) and run 3 (`061b4c35`), where it hit six files at once. Both renames were correct; the defect was purely that nothing repointed the referrers. This is a grep for the old heading text, not a judgement call.

2. **The sample was monogroup.** All three runs audited the same kind of change — a `CLAUDE.md` process rule plus its downstream prompts and templates. No skill-prompt-only edit, no `docs/conventions/` edit, no schema convention. The per-group QA profiles ST-99 was building toward cannot be derived from evidence with no variation.

## Scope

- [ ] **S1 — Extract the renamed-heading check.** Given a diff that renames a markdown heading in a rule-defining file, find inbound references to the old text across live docs and report them. Shipped docs and reports are deliberately excluded: a shipped doc records what was true when it shipped — layer: tooling
- [ ] **S2 — Decide where S1 runs.** A step inside v1's walkthrough, a pre-commit check, or neither. Name the reader before building the writer (CLAUDE.md §Building a mechanism, rule 1) — layer: process
- [ ] **S3 — Run v1 on a skill-prompt-only edit** and record the findings table in its commit — layer: process
- [ ] **S4 — Run v1 on a `docs/conventions/` edit** and record the findings table in its commit — layer: process
- [ ] **S5 — Revisit per-group QA profiles** once S3 and S4 give the sample some variation. Do not design the groups before then — layer: process

## Non-Goals

- Any register, ID scheme, coverage tally, or generated artifact. ST-99's constraints carry forward unchanged.
- Designing the group taxonomy up front. That is what S5 is gated on.

## Kill criterion

**If S1 finds nothing on three consecutive rule-file changes that rename a heading, drop it.** The class repeated twice in three runs; if that was coincidence, the check does not pay for itself. Check after the third such change.

If S3 and S4 both come back with findings that look like the runs already recorded, close S5 as answered — the groups are not distinct enough to be worth separating.

## Related

- **Predecessor:** ST-99 — [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §6.1, §7
