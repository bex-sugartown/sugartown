---
name: st-collab-time
description: Measure how long a document took to collaborate on, from the session transcripts, and write the figure into that document's metadata. Use when Bex says "how long did this take", "collab time", "track the time on this", or at close-out for an article, node, case study, glossary term, epic, PRD, FSD, prototype brief or report. Never writes to Sanity.
---

# Collab Time — how long a document took

## The command

```bash
pnpm collab:time <issue-number|slug|doc-id>
```

It reports active time, Bex's message count and the date range, then prints a ready-to-paste
metadata row. `--json` for machine use. `--loose` to include sessions that mention the target
without editing it.

```bash
pnpm collab:time <id> --check <file>
```

Compares the figure stored in that file against the live one. Exits 0 when they agree, non-zero
with both numbers when they have drifted, or when the file carries no figure at all. Run it
before quoting a stored number.

**It tolerates 20 minutes of drift**, and flags any change in the number of days. Without a
tolerance the check fails constantly: a row goes out of date by a few minutes while the session
that wrote it is still running, and a check that cries wolf gets ignored. (2026-11-27: a freshly
written row drifted three minutes before the next command finished.)

The figure is generated, never hand-written (CLAUDE.md §Building a mechanism: a register is
generated or it does not exist). If the number in a document disagrees with the command, the
command is right.

## Where the figure goes

**Never into Sanity.** No document type has a field for it, adding one would be a schema change,
and Bex ruled it out on 2026-11-27. The figure lives on the local artifact only.

| Document | Metadata location | Wired |
|---|---|---|
| Article, node, case study | The HTML working draft's front-matter table (`docs/write-pipeline-prompt.md` §0b) | yes, pipeline §8 |
| Epic | The epic doc's Close-out review, beside the friction line | yes, `docs/epic-template.md` |
| Glossary term batch | The batch's draft file, if one exists; otherwise the issue comment | not yet |
| PRD, AI PRD, FSD, prototype brief | A `## Meta` table at the top of the document | not yet |
| Report or audit | A `## Meta` table at the top | not yet |

**Only two surfaces are wired, deliberately** (Bex, 2026-11-27): articles/nodes/case studies and
epics, the two highest-volume surfaces, so the habit is tested on real work before it spreads.
The rest of the table is where the figure *would* go, not a claim that something prompts for it.
If you are closing out one of those, run the command and add the row anyway.

**Governance docs have no shared metadata convention.** Checked 2026-11-27: one of 26 files in
`docs/briefs/` uses a `## Meta` table, the rest use ad-hoc bold key-value lines. This skill
standardises on the `## Meta` table for anything it touches. Do not restyle a document's
existing header just to add this row; add the row in whatever shape that file already uses, and
use `## Meta` only for new documents.

## The row

```markdown
| **Collaboration** | 2h 31m active across 3 days, 2026-11-09 to 2026-11-27 · 24 messages from Bex · measured 2026-11-27 by `pnpm collab:time 218` |
```

Four parts, all required: active time, the date range, Bex's message count, and the measurement
date with the command that produced it. The command is part of the claim, per CLAUDE.md §Verify
before citing.

## When to run it

**Write the row at close-out, once.** Not on every commit: a metadata row rewritten each time
churns the file and buries real diffs in time-figure noise.

**A stored figure is stale the moment it is written**, because the session that wrote it is
still running. That is not a flaw to fix by writing more often, it is why `--check` exists.
Treat the row as a dated snapshot and the command as the truth. Re-measure when the document
is reopened for substantial work, and replace the row rather than adding a second one.

(2026-11-27: the first ST-218 row read 2h 45m and was an hour out within the same session.)

## Reading the number honestly

State these whenever the figure is quoted outside the document:

- **It is session active time, not Bex's hours.** It includes stretches where the session was
  running tools and she was waiting.
- **It cannot see thinking done away from the keyboard**, so it is a floor, not a total.
- **Two caps are reported.** The 5-minute cap excludes pauses; the 15-minute cap counts short
  breaks as work. The metadata row uses the 15-minute figure. Neither is obviously right, which
  is why the command prints both.

## Attribution, and why it is strict

**Attribution is per session, not per file.** Once a session qualifies, all of its active time
counts, including work on files that do not match the target at all. This is why a red-pen
round, a review archive, a handoff file and a preview page are already captured without any of
them needing the document's name, and why there is no list of related paths to maintain.

The exposure runs the other way: a session that mixes this work with something unrelated
credits all of it to the target, and nothing flags that. Read a figure from a mixed session as
an upper bound.

A session counts only when it **edited a file whose path contains the target**, or **committed
or commented on it**. A session that merely mentions the target is excluded and listed, with its
mention count, so a human can override with `--loose`.

This strictness is not fussiness. Two false positives were found building it (2026-11-27):

- A mention-only match credited a session 310 minutes for a document it had named four times in
  passing, which would have more than doubled the total.
- The tool counted **itself**: running `collab:time PROJ-003` put the measuring session's hours
  onto PROJ-003. Commands containing `collab-time` are now ignored.

Reading commands do not count either. A `grep` or `cat` naming the document is reading about it,
not working on it.

**If the count looks wrong, read the excluded list before trusting the total.** The command
prints which sessions it counted and why.

## Scope

Measures and records. It does not write to Sanity, does not judge whether the time was well
spent, and does not aggregate across documents.
