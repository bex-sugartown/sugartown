---
**Epic:** ST-99 — QA walkthrough for rule-file changes
**GitHub Issue:** [#99](https://github.com/bex-sugartown/sugartown/issues/99)
**Status:** Backlog
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

- [ ] Run v1 on the next three rule-file changes — layer: process
- [ ] Record each run's findings table in its commit — layer: process
- [ ] After three runs, review which steps kept earning their place — layer: process

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

| Date | Change audited | Findings | Commit |
|---|---|---|---|
| 2026-08-16 | GitHub-only tracker writes (pilot run) | 4 fixed, 1 flagged | see commit body |

## Why this is not the governance layer again

No artifact, no register, no ID scheme, no generated output. One walkthrough, performed by the
session making the edit, recorded in a commit message that would exist anyway. Post-mortem §7's
discipline applies: run it flat, prove it catches something, only then add structure.

## Related

- **GitHub:** [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §3.3, §6.1, §7
- **Sibling:** ST-98 ([#98](https://github.com/bex-sugartown/sugartown/issues/98)) applies the six rule changes; run v1 on it
