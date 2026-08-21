---
**Epic:** ST-99 — QA walkthrough for rule-file changes
**GitHub Issue:** [#99](https://github.com/bex-sugartown/sugartown/issues/99)
**Status:** Done — 2026-08-18
**Priority:** 🟡 Medium
**Merge strategy:** (a) Merge-as-you-go
---

# ST-99 — QA walkthrough for rule-file changes

## Background

A rule-file change is a change to a process that runs later, in a different session, with no
test between the edit and the first real run.

On 2026-08-16 a dual-write rule shipped instructing sessions to create a Linear issue for
every new epic. Linear has been at its 250-issue lifetime cap since 2026-08-09 and cannot
accept one, so the rule was unfollowable in production from the moment it merged. It was
caught by re-reading it afterwards, not by any check. The same session then found four more
defects in the replacement text on a single walkthrough pass, one of which the session had
personally tripped over an hour earlier.

## Objective

A rule-file change is walked through once, against a mock instance of each workflow it
touches, before it is committed.

## v1 — one process, deliberately minimal

After any edit to a rule-defining file, before the commit:

1. **Name the workflows the change touches**, from the write-site audit that motivated the edit.
2. **Walk one mock instance end to end**, reading only the edited text. Not from memory of what
   it used to say.
3. **For each step, record what the text instructs and whether it can actually be done today** —
   tools exist, quotas allow it, referenced files and sections resolve.
4. **Flag every step that is unfollowable, ambiguous, or points at something that does not
   exist.**

**Output goes in the commit message** for the rule change it audited. Decided 2026-08-16: no
new file, no register, no tally, and it sits next to the diff it describes.

Finding classes used so far, not a fixed taxonomy: `unfollowable`, `contradiction`,
`redundant`, `stale`, `unverified dependency`.

## Scope

- [x] Run v1 on the next three rule-file changes — layer: process (3 of 3 done)
- [x] Record each run's findings table in its commit — layer: process
- [x] After three runs, review which steps kept earning their place — layer: process

## Non-Goals

- **Per-group QA profiles.** That is the goal, not the starting point. See below.
- Any script, generated artifact, or CI wiring. A generator with no proven consumer is what
  post-mortem 6.1 forbids.
- Coverage tallies of any kind.

## The goal this builds toward

QA steps scoped by change group, so a skill-prompt edit does not run the checks that only
matter for a close-out sequence edit, and vice versa.

**Do not design the groups up front.** Run v1 flat across several real changes and let the
groups fall out of which steps kept mattering for which kinds of edit. Designing the taxonomy
before the evidence is how the last governance layer started.

## Kill criterion

**If three consecutive rule changes pass v1 with no finding, retire it** — the walkthrough is
not paying for itself. Check after the third run.

## Run log

**Counting basis**, stated 2026-08-18: the Findings column counts defects the change itself
introduced and that were fixed in the same commit. Pre-existing defects and findings left open
are listed in the tables but excluded from the count. Run 3's commit says "seven findings"; the
three tables hold nine rows. Seven is the introduced-and-fixed count and nine is the row count,
and neither was reproducible before this basis was written down.

| Date | Change audited | Rows | Counted | Commit |
|---|---|---|---|---|
| 2026-08-16 | GitHub-only tracker writes (pilot run) | 5 | 3 — F4 pre-existing, F5 open | `8cfac6fa` |
| 2026-08-16 | `On Hold` added to the status map | 2 | 2 | `e5a22d89` |
| 2026-08-16 | ST-98, the six post-mortem rules | 2 | 2 | `061b4c35` |
| | **Total** | **9** | **7** | |

Run 1's F5 (the `Item closed` → `Status: Done` automation, recorded as documented but unobserved)
was resolved on 2026-08-17: closing #98 moved its board item with no manual step, observed
directly and recorded in `81a93f5d`.

## Review after three runs

Which of v1's four steps earned their place, judged against the nine findings.

**The shape of the evidence.** All three changes were edits to `CLAUDE.md`. Seven of the nine
findings landed in files the change did not edit — the prompts, templates and docs that *consume*
the edited rule. One more (run 1's F5) straddled both. Only one finding was in a file the change
itself touched. The defects are downstream of the edit, not in it.

| Step | Verdict | Evidence |
|---|---|---|
| **1 — Name the workflows the change touches** | **Earned. Load-bearing.** | It is what points the walkthrough at the consumer files, where 7 of 9 findings were. Run 2 edited CLAUDE.md's status section; both findings were in `epic-template.md`. Run 3's repairs landed in six downstream files. A session re-reading only the file it edited finds none of these |
| **2 — Walk a mock instance from the edited text, not memory** | **Earned.** | Run 1 F1 alone justifies it. The session had personally hit that wall an hour earlier and still wrote an instruction carrying no command and no IDs. Memory said the step was fine; reading it as written showed it was unfollowable |
| **3 — Can each step be done today?** | **Split.** | Three clauses, unequal. *Referenced files and sections resolve* produced the dominant repeat class (run 2 F1, run 3 F1). *Tools exist* produced run 1 F1 and F5. *Quotas allow it* produced *nothing in three runs* — notable, because the incident that motivated the whole epic was a quota failure. Unexercised, not wrong |
| **4 — Flag unfollowable, ambiguous, or pointing at nothing** | **Earned as the recording verb; one trigger never fired.** | Zero of nine findings were classed ambiguous. Seven classes appeared across nine findings; the doc listed five "so far" and runs 2–3 added two more (`dangling reference`, `incomplete`). The class list was still growing at run 3 |

### The dominant finding

**A renamed heading orphaning inbound cross-references.** Run 2 F1 and run 3 F1, where it hit six
files at once. Both times the rename was deliberate and correct; the only defect was that nothing
repointed the referrers. It is the sole class to repeat across runs, and it is mechanical — a grep
for the old heading text, not a judgement call. Extracting it is the one concrete output these
three runs earned.

### The honest limit — the sample is monogroup

All three runs audited the same kind of change: a `CLAUDE.md` process rule plus its downstream
prompts and templates. No run audited a skill-prompt-only edit, a `docs/conventions/` change, or a
schema convention. **The groups cannot fall out of evidence that has no variation.** Three runs
satisfied the kill criterion; they did not produce a taxonomy, and designing one now would be
exactly the mistake §The goal this builds toward warns against.

### Outcome

v1 survives its kill criterion and continues as standing practice on every rule-file change. Two
items are deferred rather than done. Neither is in this epic's Scope, and both now sit in
**ST-101** ([#101](https://github.com/bex-sugartown/sugartown/issues/101)) as real Scope items
rather than prose:

1. **Extract the renamed-heading check as a grep.** Two of three runs; mechanical. ST-101 S1, S2.
2. **Per-group QA profiles.** Blocked on a varied sample, not on effort. ST-101 S3 and S4 run v1
   on a skill-prompt edit and a `docs/conventions/` edit; S5 revisits the groups once they have.

## Close-out — 2026-08-18

Three runs complete, all three on `origin/main` (`8cfac6fa`, `e5a22d89`, `061b4c35`), each
carrying its findings table in the commit body as v1 specifies. Kill criterion checked at run 3:
nine findings across three runs, no clean pass, so v1 is retained.

Steps recorded N/A with reason, per the close-out sequence:

| Step | State |
|---|---|
| 1b — Route smoke tests | N/A — docs-only epic, zero change under `apps/web/src/`. Recorded rather than skipped; decided with Bex 2026-08-18 |
| 2 — Deploy schema | N/A — no `apps/studio/schemas/` change |
| 3 — Visual QA gate | N/A — no rendered surface; process docs only |
| 4 — Chromatic | N/A — no component or story change |
| 5 — Data pipeline gap check | N/A — no build-time pipeline touched |
| 5b — Verify handoffs landed | Two deferrals recorded in §Outcome; neither is claimed as done here |
| 6b — Preserve the vspec | N/A — no vspec |
| 7 — Mini-release | Deferred. `[Unreleased]` line written at ship time per CLAUDE.md step 7; the version bump waits for `/eod` to push, since v0.33.1 is itself still unpushed and a second local bump would compound |

## Ongoing runs (post-close-out)

**This section exists because it went missing once.** `dbe6099d` (2026-08-18, run 4) found that
v1 shipped with a scope gap that made it inert for the exact files ST-100 needed to edit next —
the process existed only in this doc, three commit bodies, and one line in ST-100's technical
notes, with zero references from CLAUDE.md, `docs/epic-template.md`, `.claude/skills/`, or
`docs/conventions/`. That commit fixed the *trigger*; this section, added 2026-08-21, fixes the
*record* — the Run log above stopped at run 3 when this epic closed, and runs 4–6 existed only in
commit bodies for three days. Backfilled from those commits, not re-derived.

v1 continues as standing practice under the CLAUDE.md "Rule-file followability walkthrough"
trigger `dbe6099d` added. This epic (ST-99) is closed; it does not reopen for each new run. This
table is the ongoing pointer CLAUDE.md's own text names ("Record and review:
`docs/shipped/ST-99-rules-change-qa.md`"), kept separate from the original close-out snapshot
above so that snapshot still reads as what was true on 2026-08-18.

| Date | Change audited | Rows | Fixed | Commit |
|---|---|---|---|---|
| 2026-08-18 | Run 4 — the walkthrough's own trigger (`dbe6099d` itself) | 4 | 3 — F4 self-resolving, not counted | `dbe6099d` |
| 2026-08-19 | Run 5 — ST-100 Phase 3, applying S1–S18 in one batch | 4 | 4 | `ea0755d5` |
| 2026-08-19 | Run 6 — ST-100 Phase 3b, consolidating into `/ship --release` | 1 | 1 | `ac233967` |
| 2026-08-21 | Run 7 — ST-101 S2, pointing the walkthrough at `scripts/check-renamed-headings.js` | 0 | 0 (clean) | `2a49f757` |
| 2026-08-21 | Run 8 — ST-101 S4, `docs/conventions/schema-conventions.md` new `htmlSection` section (ST-16) | 0 | 0 (clean) | pending — lands with this commit |
| | **Running total (all runs)** | **18** | **15** | |

**First clean pass, run 7.** Walked the mock instance (ran the new script against three different files, including two never used to build or test it) before committing — every invocation the added sentence describes actually works as written. Kill-criterion counter: 1 of 3 needed for retirement, if the next two also come back clean.

**Run 8 fulfills ST-101 S4** ("run v1 on a `docs/conventions/` edit") — the first non-`CLAUDE.md` sample, opportunistically, not manufactured. Checked: every file referencing `schema-conventions.md` still resolves it at the same path; the `PageSections.jsx` `HtmlSection` component name and `apps/studio/schemas/sections/htmlSection.ts` path cited in the new section are accurate; no heading was removed (pure addition) via `scripts/check-renamed-headings.js`. Clean — second consecutive clean pass. One more and v1's kill criterion fires (three consecutive, no finding) — per its own text, that means retiring the walkthrough, not the mechanism it protects. Worth flagging when run 9 happens, not deciding now.

**Six runs, zero clean passes.** The kill criterion (three *consecutive* clean passes) has never
come close to firing — every run through run 6 found at least one real defect. Run 4's own
finding (a scope gap that would have been inert for exactly the files run 5 and 6 then edited)
is the strongest evidence yet that this is catching things a session re-reading only its own
diff would miss, per the original review's Step 1 verdict above.

**Maintenance note for whoever runs the next one:** append your run to this table, not to the
original Run log or close-out section above — those describe the epic as of 2026-08-18 and stay
as written. If this table itself starts drifting from practice again, that is itself a v1
finding worth recording next time a rule file changes near this doc.

## Why this is not the governance layer again

No artifact, no register, no ID scheme, no generated output. One walkthrough, performed by the
session making the edit, recorded in a commit message that would exist anyway. Post-mortem §7's
discipline applies: run it flat, prove it catches something, only then add structure.

## Related

- **GitHub:** [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Successor:** ST-101 — [#101](https://github.com/bex-sugartown/sugartown/issues/101), carrying both deferrals
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §3.3, §6.1, §7
- **Sibling:** ST-98 ([#98](https://github.com/bex-sugartown/sugartown/issues/98)) applies the six rule changes; run v1 on it
