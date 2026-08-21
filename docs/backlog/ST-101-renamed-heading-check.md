---
**Epic:** ST-101 — Extract the renamed-heading check, and resume per-group QA profiles on a varied sample
**GitHub Issue:** [#101](https://github.com/bex-sugartown/sugartown/issues/101)
**Status:** In Progress — S1/S2 done, S3–S5 wait on a real skill-prompt or `docs/conventions/` edit to audit
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

- [x] **S1 — Extract the renamed-heading check.** Given a diff that renames a markdown heading in a rule-defining file, find inbound references to the old text across live docs and report them. Shipped docs and reports are deliberately excluded: a shipped doc records what was true when it shipped — layer: tooling

      **Built 2026-08-21** — `scripts/check-renamed-headings.js` (`node scripts/check-renamed-headings.js <file> [--against <ref>]`). Scan scope mirrors CLAUDE.md's own historical-docs exemption list exactly: excludes `docs/shipped/`, `docs/release-notes/`, `docs/reviews/post-mortem/`, `docs/drafts/`, `zArchive/`, `CHANGELOG.md`.

      **Verified against the real historical incident, not just written.** Reproduced ST-99 run 3's exact defect (`CLAUDE.md`'s `Linear Done = code on main` → `Issue Done = code on main` rename, commit `061b4c35`) by temporarily reverting the two files the original walkthrough found (`SUG-71-shopify-mvp-integration.md`, `rules-tools-audit-runbook.md`) to their pre-fix content and running the new script against the historical diff. It found both — and found a **third, still-live** dangling reference the original manual walkthrough missed: `docs/reports/alignment-audit-shapeup-vs-sugartown-epic-process.md`, orphaned since 2026-08-16 and never caught in the 5 days since. Fixed in this commit (2 lines). Test files restored to their real committed content afterward — `git status` confirmed clean before continuing.

- [x] **S2 — Decide where S1 runs.** A step inside v1's walkthrough, a pre-commit check, or neither. Name the reader before building the writer (CLAUDE.md §Building a mechanism, rule 1) — layer: process

      **Decided 2026-08-21: a session-run aid inside v1's walkthrough (step 1), not a pre-commit or CI gate.** Reasoning: (a) `.husky/pre-commit` is explicitly scoped to "fast, local CSS validators only" per its own header — this is a different category (prose heading matches need human judgment on false positives, not a blind pass/fail); (b) the reader is the session performing the walkthrough, right now, consciously — the same "Name the reader" principle this whole epic descends from. Recorded in CLAUDE.md's Rule-file followability walkthrough section (Instruction & Rule File Write Gate approved 2026-08-21) — one sentence pointing to the script from the existing heading-rename rule.

      **Walkthrough run 7 on that CLAUDE.md change** (`docs/shipped/ST-99-rules-change-qa.md` Ongoing runs): clean, no findings — first clean pass since v1's kill-criterion counter reset with the trigger fix. Verified the pointer's claims by running the script against two files it was never built or tested against (`docs/epic-template.md`, `docs/conventions/human-gate-conventions.md`) before committing, not just the one used to develop it.

- [ ] **S3 — Run v1 on a skill-prompt-only edit** and record the findings table in its commit — layer: process
- [x] **S4 — Run v1 on a `docs/conventions/` edit** and record the findings table in its commit — layer: process

      **Done 2026-08-21, opportunistically** — `docs/conventions/schema-conventions.md`'s new
      `htmlSection` risk-acceptance section (ST-16), not a manufactured edit. Clean pass, no
      findings — logged as run 8 in `docs/shipped/ST-99-rules-change-qa.md`'s Ongoing runs
      table. Second consecutive clean pass; one more retires v1 per its own kill criterion.

- [ ] **S5 — Revisit per-group QA profiles** once S3 and S4 give the sample some variation. Do not design the groups before then — layer: process

      **Partially unblocked** — S4 is done, S3 (skill-prompt-only edit) still isn't. Per this
      epic's own instruction, do not design the groups from one data point; wait for S3 too.

## Non-Goals

- Any register, ID scheme, coverage tally, or generated artifact. ST-99's constraints carry forward unchanged.
- Designing the group taxonomy up front. That is what S5 is gated on.

## Kill criterion

**If S1 finds nothing on three consecutive rule-file changes that rename a heading, drop it.** The class repeated twice in three runs; if that was coincidence, the check does not pay for itself. Check after the third such change.

If S3 and S4 both come back with findings that look like the runs already recorded, close S5 as answered — the groups are not distinct enough to be worth separating.

## Related

- **Predecessor:** ST-99 — [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §6.1, §7
