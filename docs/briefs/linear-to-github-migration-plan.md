# Sugartown — Project Management Migration: Linear → GitHub

**Status:** DRAFT — setup and plan only. Nothing executes until the freeze lifts.
**Author:** drafted 2026-08-15
**Blocking constraint:** the Linear auto-archive freeze, below. **Earliest execution date: 2026-09-08** (bulk), **2026-09-14** (tail).
**Related:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §8
**Export:** `docs/briefs/data/linear-export-2026-08-15.csv` — 264 rows, 34 columns, committed 2026-08-15

**Decisions locked 2026-08-15 (Bex):**
1. **`SUG-NNN` stays canonical** (§2 option B). Docs are updated to align; GitHub issue numbers are incidental.
2. **No paid tier.** Linear Basic is out of scope on cost grounds.

**Read §9 first.** Analysis of the export after those decisions were taken shows the free plan is
arithmetically sufficient once auto-archive completes, which means migration is no longer forced
by capacity. The decision is now about fragility, not headroom.

**Structure: this is a trial, not a committed migration.**

| | |
|---|---|
| **Trial period** | 2026-08-15 → 2026-09-09 |
| **Final decision** | **2026-09-09**, once auto-archive has run and Linear is back at 58 of 250 |
| **Trial scope** | Phases 1 and 2, plus the post-mortem build-back items 1–3 logged as real GitHub issues (§10.4) |
| **Trial cost** | Zero. No Linear writes, no code changes, no spend |
| **What the trial proves** | Whether GitHub Projects handles Sugartown's actual workflow well enough to be worth the cutover in §7 |

Nothing in Phases 1 and 2 is wasted if the answer on 09-09 is "stay on Linear" — a clean project
with working fields is worth having either way. Phase 3 and Phase 4 are the committing steps and
neither runs before the decision.

Operating model in §10. Data map in §11. Governance-unwind annotations in §12.

---

## Overview

Linear's free plan caps **lifetime** issues at 250, not active ones. The Sugartown workspace is
at 260 of 250 and blocked from creating new issues. 206 of those are closed (196 `Done`,
10 `Canceled`) and 202 are awaiting auto-archive. Auto-archive would reclaim them, but a bulk
project-removal on 2026-08-09 reset the one-month inactivity timer on 182 of them at once, so
the bulk does not clear until roughly **2026-09-08**. There is no manual archive on the free
plan.

This document defines the target GitHub setup, the operating model, the cleanup required before
migrating, and the cutover procedure. It does not assume migration is the right answer — §9.1
shows the free plan is arithmetically sufficient once archiving completes, so the decision rests
on fragility rather than capacity and is deferred to 2026-09-09.

**Kill criterion** (per post-mortem §6.7): if migration is not underway by **2026-12-01**, this
plan is deleted rather than left as a stale artifact. Check date: 2026-12-01.

---

## 1. Current state, measured

All figures measured 2026-08-15. Commands named so they can be re-run rather than trusted.

### Linear

Authoritative source is the CSV export, not the UI.

| Measure | Value | Source |
|---|---|---|
| Total issues | 264 | export row count |
| `Done` | 196 | export `Status` |
| `Canceled` | 10 | export `Status` |
| `Backlog` | 54 | export `Status` |
| `Todo` | 4 | export `Status` |
| `In Progress` | **0** | export `Status` |
| Already archived | 4 | export `Archived` populated |
| Counting against cap | 260 of 250 | 264 − 4 archived; matches the UI dialog |
| **Awaiting auto-archive** | **202** | closed and unarchived |

**Archive behaviour, verified against the export rather than taken on Linear's word:**

The 4 issues that *did* archive (SUG-64, 143, 175, 193) all have `Updated` equal to `Completed`,
in April–June. They were never touched in the August sweep, and archived on 2026-08-08.

All 202 that did *not* archive have `Updated` in 2026-08. Every one. Auto-archive is working
exactly as documented; the bulk project-removal reset their clocks.

| Last touched | Count | Earliest archive |
|---|---|---|
| 2026-08-06 → 08-08 | 9 | already passed / imminent |
| **2026-08-09** | **182** | **~2026-09-08** |
| 2026-08-13 | 10 | ~2026-09-12 |
| 2026-08-15 | 1 | ~2026-09-14 (SUG-284, moved to Done that day) |

**When all 202 archive, the workspace sits at 58 of 250.**

### GitHub

| Measure | Value | Source |
|---|---|---|
| Repo | `bex-sugartown/sugartown`, **public**, Issues enabled | `gh repo view` |
| Issues | 26 total (11 open, 15 closed) | `gh issue list --state all` |
| Project | `Sugartown Roadmap`, user-level, `PVT_kwHODqg2Fc4BP7M2` | `gh project list --owner bex-sugartown` |
| Project items | 20, all issues from `sugartown` | `gh project item-list 1` |
| Item status | 11 Todo · 6 Done · 3 In Progress | same |
| Items with Start/End dates | **0 of 20** | same — roadmap view renders empty |

Existing project fields: `Status`, `Labels`, `Milestone`, `Linked pull requests`, `Parent issue`,
`Sub-issues progress`, `Start Date`, `End Date`, `Repository`, `Assignees`, `Reviewers`,
`Created`, `Updated`, `Closed`.

Missing versus Linear: **Priority**, **Iteration**.

### Coupling to Linear in this repo

| Surface | Count | Files |
|---|---|---|
| Code reading Linear | 9 | `apps/web/scripts/stats/linear.js`, `collect-stats.js`, `vite.config.js`, `GovernancePage.jsx`, `TablesDevPage.jsx`, `scripts/monthly-evidence-digest.js`, `.github/workflows/stats.yml`, 2 generated stats files |
| Docs/skills instructing Linear use | 12 | incl. `CLAUDE.md`, `docs/epic-template.md`, `.claude/skills/new-epic/`, `.claude/skills/sugartown-epic-writer/` |
| Epic docs referencing `SUG-NNN` | **109** | 50 in `docs/backlog/`, 59 in `docs/shipped/` |

---

## 2. The decision this plan turns on

**`SUG-NNN` appears in 109 epic docs, the CHANGELOG, every shipped doc, and hundreds of commit
messages. None of it can be renumbered.** GitHub issues number sequentially per repo and are
already at 35.

Two possible resolutions:

| Option | Consequence |
|---|---|
| **A. GitHub issue number becomes a second ID alongside `SUG-NNN`** | Recreates post-mortem root cause 3.4 — multiple ID namespaces with no index — deliberately |
| **B. `SUG-NNN` stays canonical; the GitHub issue is a mirror keyed on it** | Issue number is incidental. Requires the SUG counter to live somewhere |

**Recommendation: B.**

The epic doc is already the durable artifact, already in git, already public, and already named
`docs/backlog/SUG-{N}-{slug}.md`. Under B the GitHub issue carries `SUG-284 — Title` in its
title, so the ID is visible and searchable, and the issue becomes a status/discussion surface
rather than a second source of truth.

**The counter is derived, not maintained** — from the filesystem, with the §2.1 floor applied.
See §2.1 for the command. That satisfies post-mortem §6.4: registers are generated or they do
not exist. There is no new register to drift.

**Settled 2026-08-15 (Bex): option B.** `SUG-NNN` remains canonical and the instruction docs are
updated to say so. GitHub issue numbers carry no meaning; the issue title leads with the SUG ID.

### 2.1 Numbering scheme — migrated IDs keep their numbers, new IDs start at SUG-1000

**Settled 2026-08-15 (Bex).** Existing issues migrate with their numbers unchanged (`SUG-5`
through `SUG-284`). **Every new issue created from the trial onward starts at `SUG-1000`.**

**This closes a real collision, not a hypothetical one.** Linear's per-team counter is at 284
and does not reset on archive. When auto-archive clears around 2026-09-08, Linear regains 192
free slots and can create issues again — its next would be **`SUG-285`**. That is exactly the
number a naive `max + 1` would mint in GitHub. The risk window opens on the day of the trial
decision.

A 716-number gap makes the collision structurally impossible rather than merely unlikely, and
makes an ID's origin readable at a glance: **three digits means Linear era, four digits means
GitHub era.** No boundary number has to be remembered.

Verified before adopting: nothing in the repo parses `SUG-NNN` with a fixed or bounded digit
width. `grep` for width-constrained patterns across `.claude/`, `scripts/`, `apps/web/scripts/`
and `packages/` returns nothing, so four-digit IDs are safe everywhere the pattern appears.

**The counter is derived with a floor, not maintained:**

```bash
ls docs/backlog docs/shipped | grep -oE 'SUG-[0-9]+' | grep -oE '[0-9]+' \
  | sort -n | tail -1 | awk '{print "SUG-" ($1 < 1000 ? 1000 : $1+1)}'
```

Returns `SUG-1000` today; `SUG-1003` once 1002 exists. Still satisfies post-mortem §6.4 —
generated from the filesystem, no register to drift.

---

## 3. Freeze constraints — read before touching anything

**Do not edit any completed or cancelled Linear issue before 2026-09-09.** Any write resets
the one-month inactivity timer and pushes the archive date out another month. This includes:

- bulk label changes
- adding to or removing from projects (this is what caused the current delay)
- status tidying, reassignment, or renaming
- adding comments

**Safe during the freeze:** reading, exporting, and all GitHub-side work in Phases 1 and 2.

Phase 3 cannot start until archiving is confirmed complete.

---

## 4. Phase 1 — GitHub setup (safe now)

No Linear writes. Can proceed during the freeze.

1. **Add the two missing fields** to `Sugartown Roadmap`:
   - `Priority` — single-select: `Urgent`, `High`, `Medium`, `Low`, `None` (mirrors Linear's 0–4)
   - `Iteration` — only if cycles are actually wanted; Sugartown has not used Linear cycles
2. **Enable the built-in project workflows.** Critical: `Status` and issue open/closed are
   independent and do **not** sync by default. An issue can be closed while `Status` reads
   `Todo`. Enable at minimum:
   - Item closed → set `Status: Done`
   - Item reopened → set `Status: In Progress`
   - PR merged → set `Status: Done`
3. **Decide the `Project` equivalent.** Linear projects map to GitHub Milestones, a label, or a
   second Project. Sugartown's Linear projects are lightly used; a `label` is likely sufficient.
4. **Decide the dependency representation.** GitHub has no true `blockedBy`/`blocks` graph. The
   options are sub-issues (the `Parent issue` field already exists) or task lists in the body.
   This is the weakest area of the target system and should be decided explicitly, not
   discovered during migration.
5. **Create a roadmap view** with `Start Date`/`End Date` and confirm it renders. Currently 0 of
   20 items carry dates, so the view is empty.

**Exit criterion:** a test issue can be created, added to the project, closed, and observed to
flip to `Status: Done` automatically.

### 4.1 Phase 1 execution log — 2026-08-15

**Done via API (`gh` + GraphQL):**

| Step | Result |
|---|---|
| `Status` options | Was `Todo \| In Progress \| Done`. Now **`Backlog \| Todo \| In Progress \| Done \| Canceled`**, mirroring Linear. 54 of the 58 in scope are `Backlog`, which had no option at all |
| `Priority` field | Created: **`Urgent \| High \| Medium \| Low \| No priority`**, mirroring Linear's 0–4 |
| Views | `Priority queue` (table) and `Board` (board) created, **unconfigured** |
| `Iteration` | Deliberately not added, per §10.3 |

> ### ⚠️ `updateProjectV2Field` on a single-select WIPES every item value
>
> Adding the two `Status` options cleared the `Status` of all 20 existing items — before: 11
> Todo, 6 Done, 3 In Progress; after: 20 blank. The mutation **recreates options with new IDs**
> rather than matching on name, so every item's stored option ID becomes a dangling reference.
>
> Recovered in full from a snapshot taken before the change, verified per item and not by count.
>
> **This matters for Phase 3.** Once 58 migrated items carry `Status` and `Priority` values, any
> later edit to either field's option list destroys them all. Freeze both option sets before
> importing, or snapshot first:
> ```bash
> gh project item-list 1 --owner bex-sugartown --limit 200 --format json > snapshot.json
> ```

**Cannot be done via API — UI required.** Verified against the GraphQL schema, not assumed:

| Step | Why blocked |
|---|---|
| Enable the 4 workflows | Only `deleteProjectV2Workflow` exists. There is no create/update/enable mutation |
| View filters and grouping | `ProjectV2ViewConfigurationInput` exposes only `visibleFieldIds` |
| §4 exit criterion | Depends on the `Item closed` workflow being enabled first |

**Workflow state as found** — the four §10.4 needs are all off, and one we do not want is on:

| Workflow | State | Wanted |
|---|---|---|
| Auto-add sub-issues to project | **enabled** | **No** — §10.2 keeps the SUG-238 one-issue-per-epic rule |
| Item closed | disabled | Yes → `Status: Done` |
| Pull request merged | disabled | Yes → `Status: Done` |
| Item added to project | disabled | Yes → `Status: Backlog` |
| Auto-close issue | disabled | No |
| Pull request linked to issue | disabled | Optional |

`deleteProjectV2Workflow` could remove the sub-issue workflow but deletion is irreversible and
disabling is a toggle in the UI. Left for the UI pass rather than deleted.

**Phase 1 status: fields and views done, automation outstanding.** The exit criterion cannot be
met until the workflows are enabled by hand.

---

## 5. Phase 2 — Cleanup (safe now)

No Linear writes.

1. **Reconcile the 20 stale project items.** They are pre-Linear (`Epic: Monorepo bootstrap &
   workspace setup`, `Epic: Sanity CMS schema architecture — Phase 1`). For each: close and
   remove from the project, or map to a current `SUG-NNN`. Do not leave them as-is; they will
   corrupt any status count taken from the project.
2. **Triage the 6 repo issues not in the project.** Mostly `ci-red` bot noise from
   `ci-failure-alert.yml`. Decide whether bot issues belong in the roadmap project at all — the
   recommendation is no, and to exclude them by label.
3. **Audit the 50 `docs/backlog/` docs against the Linear export.** `validate:epic-docs`, which
   enforced Linear↔doc parity, was archived on 2026-08-14, so the two can have drifted since.
   Produce a three-column reconciliation: doc exists / Linear issue exists / states agree.

**Exit criterion:** the project contains only current work, and every `docs/backlog/` doc is
accounted for.

---

## 6. Phase 3 — Migration (blocked until 2026-09-09)

**Input:** `docs/briefs/data/linear-export-2026-08-15.csv` — 264 rows, 34 columns, committed to the repo 2026-08-15.

Columns available: `ID`, `Team`, `Title`, `Description`, `Status`, `Estimate`, `Priority`,
`Project ID`, `Project`, `Creator`, `Assignee`, `Labels`, `Cycle Number/Name/Start/End`,
`Created`, `Updated`, `Started`, `Triaged`, `Completed`, `Canceled`, `Archived`, `Due Date`,
`Parent issue`, `Initiatives`, `Project Milestone ID/Name`, `SLA Status`, `UUID`,
`Time in status (minutes)`, **`Related to`**, **`Blocked by`**, **`Duplicate of`**.

**Relations are in the export.** This materially de-risks step 5 below — the dependency graph
does not have to be reconstructed by hand.

**Scope: open and backlog items only.** Completed and cancelled work stays in Linear and
archives there. The 109 epic docs in git are already the durable record of shipped work; there
is no value in recreating 206 closed issues in GitHub.

**Measured volume: 58 items** — 54 `Backlog` + 4 `Todo`. Zero `In Progress`.

Of those 58: 42 carry labels, 33 have `Related to`, 7 are High priority, 18 Medium, 29 Low,
4 unprioritised, 5 have `Blocked by`, 3 belong to a Project, and 1 has a `Parent issue`.

1. Confirm Linear auto-archive has run and the workspace is back under 250.
2. From the export, filter to states `Backlog`, `Todo`, `In Progress`.
3. For each, create a GitHub issue titled `SUG-{N} — {title}`, body carrying the Linear
   description plus a link to `docs/backlog/SUG-{N}-{slug}.md`.
4. Add each to `Sugartown Roadmap`; set `Status` and `Priority` from the export.
5. Re-create `blockedBy`/`blocks` relations using whatever representation Phase 1 step 4 chose.
6. **Verify by count and by sample**: issue count equals filtered export row count; spot-check
   5 issues field by field against the export.

**Exit criterion:** every non-closed Linear issue has a GitHub counterpart, and the counts match.

---

## 7. Phase 4 — Cutover (after Phase 3 verifies)

1. **Rewrite the stats collector.** `apps/web/scripts/stats/linear.js` → a GitHub Projects v2
   GraphQL equivalent. Rename `stats.linearRoadmap` → `stats.roadmap` and update
   `GovernancePage.jsx`, `TablesDevPage.jsx`, `collect-stats.js`, `monthly-evidence-digest.js`,
   and `.github/workflows/stats.yml`. Swap `LINEAR_API_KEY` for a GitHub token in CI.
2. **Update the 12 instruction files** — `CLAUDE.md`, `docs/epic-template.md`, `/new-epic`,
   `sugartown-epic-writer`, and the conventions docs that name Linear. This is an Instruction &
   Rule File Write Gate change: scratchpad diffs, explicit approval.
3. **Resolve the single-queue rule.** CLAUDE.md currently states Linear is the priority queue
   with no second copy. That sentence becomes false at cutover and must change in the same
   commit.
4. **Set Linear read-only.** Do not delete the workspace; it is the archive of 206 closed
   issues and the historical record behind every `SUG-NNN` in the CHANGELOG.

**Exit criterion:** `/platform/governance` renders roadmap data from GitHub, and no code path
reads `LINEAR_API_KEY`.

---

## 8. What this costs and what it loses

**Loses:** cycles, Linear's dependency graph, the Linear roadmap UI, and issue-level SLA
fields. Sub-issue and dependency modelling on GitHub is materially weaker.

**Gains:** no issue cap, no archive timer, project management in the same place as code, CI and
PRs, and one fewer external system with its own API key in CI.

**Does not change:** the epic docs. They are already the source of truth and already public.
This migration moves the *status layer*, not the record.

---

## 9. Open questions

1. ~~**§2 ID decision**~~ — **closed 2026-08-15**: `SUG-NNN` canonical, option B.
2. ~~**Export path and columns**~~ — **closed 2026-08-15**: path and all 34 columns verified, §6.
3. **Dependency representation** — sub-issues or task lists? Phase 1 step 4. Lower stakes than
   first assessed: only 5 of the 58 in scope carry `Blocked by`, and the export supplies them.
4. **Is migration warranted at all?** — **reopened on new evidence.**

### 9.1 The capacity problem is self-correcting

Analysing the export after the migrate decision was taken produced a result that undercuts its
premise. Recorded here rather than buried, because it changes the calculus.

| | |
|---|---|
| Workspace once the 202 archive | **58 of 250** |
| Free slots | **192** |
| Issue creation rate | **44/month** (264 over 6 months; peak 62 in June and July) |
| Steady state with 1-month auto-archive | ~58 backlog + ~44 rolling completions ≈ **102 of 250** |

**The free plan is arithmetically sufficient.** The cap was never structurally too small for
Sugartown's rate. The current lockout was caused by one bulk edit on 2026-08-09 that reset 182
timers simultaneously, and auto-archive is demonstrably functioning — it cleared the 4 issues
nobody touched, on schedule.

So the real option set is three, not two:

| Option | Cost | Risk |
|---|---|---|
| **Wait** to ~2026-09-08, touch nothing | £0, ~3 weeks | Recurs on any future bulk edit of closed issues |
| **Pay** for Linear Basic | ~$120/yr | Ruled out 2026-08-15 |
| **Migrate** per this plan | 9 code files, 12 instruction files, ~1 week | Loses cycles and dependency graph |

**The remaining case for migrating is fragility, not headroom.** The 250 cap means closed-issue
hygiene can never be performed again without a one-month lockout — Linear becomes a system that
punishes tidying. That is a genuine ongoing constraint and a legitimate reason to leave. It is
not the same reason as "we ran out of room", and the decision should be made on it explicitly.

**Recommendation: wait first, decide second.** Waiting costs nothing, is reversible, and the
three weeks can be spent on Phases 1 and 2, which are useful whether or not Phase 3 ever runs —
a working GitHub project with clean fields and no stale items has value on its own. Revisit this
question on **2026-09-08** with the workspace back at 58 of 250 and no deadline pressure.

---

## 10. Operating model — how Projects and Issues are used

The mechanics differ from Linear in one way that governs everything else: **an issue's
open/closed state and its project `Status` are separate values that do not sync by default.**
Every rule below follows from that.

### 10.1 What lives where

| Concern | Home | Why |
|---|---|---|
| **The record of work** | `docs/backlog/SUG-{N}-{slug}.md` | Already the source of truth, already in git, already public. Unchanged by this migration |
| **Status, priority, ordering** | GitHub Project item fields | The layer being migrated |
| **Discussion, decisions in flight** | GitHub Issue comments | Linked to commits and PRs natively |
| **The canonical ID** | `SUG-NNN`, in the doc filename | §2 decision. Issue number is incidental |

**The issue is not the spec.** It carries a title, a one-paragraph summary, and a link to the
epic doc. Full scope stays in the doc. This is deliberate: the post-mortem's root cause was a
system where the bookkeeping outgrew the work, and a thin issue keeps the doc canonical.

### 10.2 Issue conventions

- **Title:** `SUG-284 — Unwind the governance/verification-review layer`. The ID leads so the
  issue is findable by the identifier used in 109 docs and every commit message.
- **Body:** three lines — one-sentence objective, link to the epic doc, link to the Linear
  original during the trial.
- **Labels:** carry across from Linear's `Labels` column. 42 of the 58 have them.
- **One issue per epic.** No sub-issues. This is the SUG-238 rule and it survives the move:
  phases are checkboxes in the doc, not separate issues.

### 10.3 Project fields and views

Required fields beyond the defaults:

| Field | Type | Values |
|---|---|---|
| `Status` | single-select | `Backlog`, `Todo`, `In Progress`, `Done`, `Canceled` — mirrors Linear exactly so the workflow table in CLAUDE.md needs no rewrite |
| `Priority` | single-select | `Urgent`, `High`, `Medium`, `Low`, `No priority` — mirrors Linear's 0–4 |

**Do not add:** `Iteration`, `Estimate`, `SLA`, or size fields. Sugartown has never used Linear
cycles (`Cycle Number` is empty on all 58 in scope) and adding fields nobody fills is how the
last system got heavy.

Views to create:

1. **Priority queue** (table, grouped by `Priority`, filtered `Status != Done`) — this is the
   view that replaces Linear as "the priority queue" in CLAUDE.md
2. **Board** (grouped by `Status`) — day-to-day
3. **Roadmap** — only if `Start Date`/`End Date` actually get filled. Currently 0 of 20 items
   carry dates, so this view renders empty and should stay unbuilt until there is data

### 10.4 Required automation, before any trust is placed in the board

Enable these built-in project workflows in Phase 1. Without them, `Status` drifts from reality
silently — the exact failure class the post-mortem is about.

| Trigger | Action |
|---|---|
| Item closed | set `Status: Done` |
| Item reopened | set `Status: In Progress` |
| PR merged linking the issue | set `Status: Done` |
| Issue added to project | set `Status: Backlog` |

**Verification, not assumption:** the Phase 1 exit criterion is a test issue observed to flip
to `Done` on close. If it does not, the automation is off and the board is decorative.

### 10.5 Trial content — post-mortem build-back items 1–3

The trial is exercised with real work, not fixtures. The three build-back items from
`docs/reviews/post-mortem/2026-08-15-…` §7 become the first three GitHub issues:

| # | Issue title | Post-mortem source |
|---|---|---|
| 1 | `SUG-1000 — Liveness probes only, no register` | §7 item 1. Highest-value: 6 of 14 incidents are inert-mechanism bugs |
| 2 | `SUG-1001 — Claim honesty for published statistics` | §7 item 2 |
| 3 | `SUG-1002 — Generated index, only if 1 and 2 prove out` | §7 item 3 |

These are the first IDs in the new range per §2.1. Each carries its **kill criterion** from §7
in the issue body, per post-mortem recommendation 6.7. Each also gets a
`docs/backlog/SUG-{N}-*.md` doc, because the doc is canonical and the issue is the mirror.

**Next ID is derived with the 1000 floor, not assigned** — see §2.1 for the command.

Sequencing discipline from §7 holds: item 1 ships alone and runs for a full epic cycle before
item 2 opens. Two consecutive "caught nothing a human wouldn't have" answers end the rebuild.

---

## 11. Data map

Linear CSV column → GitHub destination. Verified against the export's 34 columns.

| Linear column | GitHub destination | Notes |
|---|---|---|
| `ID` | Issue **title** prefix (`SUG-284 — …`) | Canonical per §2. Not the issue number |
| `Title` | Issue title, after the ID | |
| `Description` | Issue body | Markdown carries across. Linear issue-mention links become plain text and need rewriting |
| `Status` | Project `Status` field | 1:1 value mapping |
| `Priority` | Project `Priority` field | `No priority`/`Low`/`Medium`/`High` → same names |
| `Labels` | Issue labels | 42 of 58 populated. Labels must exist in the repo first |
| `Blocked by` | Task-list line in body: `- [ ] Blocked by SUG-N` | **5 of 58.** No native equivalent |
| `Related to` | `Related: SUG-N, SUG-M` line in body | **33 of 58.** No native equivalent |
| `Parent issue` | GitHub sub-issue (`Parent issue` field exists) | **1 of 58** |
| `Duplicate of` | Close as duplicate, comment with the ID | Check before import |
| `Project` | Label | **3 of 58.** Not worth a Milestone |
| `Created` / `Updated` / `Completed` | Nothing | GitHub sets its own. Original dates live in the export and the epic doc |
| `Assignee` / `Creator` | Assignee = Bex | Single-operator workspace |
| `Estimate`, `Cycle *`, `SLA Status`, `Time in status`, `Initiatives`, `Project Milestone *`, `Due Date`, `Triaged`, `Started`, `Canceled`, `Archived`, `Team`, `UUID` | **Not migrated** | Empty or unused across the 58 in scope |

**Not migrated at all:** the 206 closed issues (196 `Done` + 10 `Canceled`). They archive in
Linear and their record already exists in `docs/shipped/`. The export CSV is the durable copy of
all 264 and is **committed at `docs/briefs/data/linear-export-2026-08-15.csv`**, so the record
survives Linear being set read-only or the workspace lapsing.

---

## 12. Governance-unwind annotations

**Finding: no backlog item is fully moot after SUG-284.** Six carry stale premises and need
annotation before or during migration; one is unscoped and should not migrate as-is.

Classified by reading each description, not inferred from titles.

| ID | Disposition | Annotation needed |
|---|---|---|
| **SUG-264** Wire the banned-word check | **Migrate, re-scope** | Filed from SUG-243, cancelled by SUG-284. But the check lives in `instruction-writing-style.md`, which survived (v1.3, 2026-08-15), so the work is still valid. It adds a validator: sequence it behind build-back item 1 and give it a kill criterion |
| **SUG-265** Release flow defects | **Migrate, re-verify first** | Filed from SUG-243. **Partly resolved 2026-08-15** — `release-assistant-prompt.md`'s vestigial gates 6/7 and its dead §Scope creep reference were fixed. Part A (prompt parity with `/mini-release`) is untouched. Re-scope before migrating |
| **SUG-267** Rule-file write gate has no artifact | **Migrate, re-frame** | Premise cites `RULE-033` and the rule register, both archived. The gate itself survived deliberately and the question is still live. Strip the register references |
| **SUG-269** Make Sanity validators probeable | **Migrate, reconcile** | Overlaps post-mortem build-back item 1 (liveness probes) directly. Decide whether it merges into SUG-1000 or stays separate. Also still carries the ID-reuse warning in its own description |
| **SUG-250** Agentic Caucus tool-selection audit | **Migrate, retitle** | Substance is unaffected — auditing 52 KG nodes for which agent produced what. But "Agentic Caucus" now names an inert doc corpus, so the title misleads |
| **SUG-259** Node: The Fire Alarm Was Wired to Nothing | **Migrate, update outline** | Subject matter changed. The layer was unwound, and on 2026-08-15 `/eod` step 6 was found to be another fire alarm wired to nothing — inside the file written to prevent that. The story has a better ending than outline v2 records |

**Confirmed unaffected**, checked and not assumed:

- **SUG-209** Appropriation Gate Check — extends the **Content Write Gate**, SUG-90 lineage,
  explicitly out of SUG-284's scope
- **SUG-263** Chromatic gating status — Pink Moon lineage, explicitly out of scope. Still live:
  the 2026-08-15 release ran Chromatic with `--exit-zero-on-changes` and it behaved exactly as
  this issue describes
- **SUG-232** Non-colour raw token fallbacks — token validators all survived
- **SUG-257**, **SUG-258** lint coverage — ordinary engineering

**Separate finding, unrelated to governance:**

- **SUG-249** Rescope to incorporate /platform dashboards — **empty description**, title only.
  Under CLAUDE.md's incomplete-epic-doc hard stop this cannot be executed as written.

  **It is also a sub-issue of SUG-19** (`parentId: SUG-19`), which is why searching Linear for
  it returns nothing — it is nested under its parent rather than listed. Confirmed live and in
  `Backlog` via the API, not archived or deleted.

  This is a survivor of the practice SUG-238 withdrew: Linear sub-issues have no backlog doc by
  design, so they fail every parity check and stay invisible. The empty description and the
  invisibility are the same symptom.

  **Disposition: scope it, fold it into SUG-19, or cancel it. Do not migrate a placeholder.**

### 12.1 Sub-issues

16 sub-issues exist across all 264 rows, but **only SUG-249 is in migration scope** — the other
15 are `Done` (SUG-23–29 under SUG-5, SUG-270–275 under SUG-268) or `Canceled` (SUG-278, 279
under SUG-187) and are not migrated.

So the sub-issue question needs one decision, not sixteen. GitHub does support sub-issues
natively (the `Parent issue` field already exists on the project), but §10.2 keeps the SUG-238
rule: **one issue per epic, phases as checkboxes in the doc.** Adopting GitHub sub-issues would
re-introduce exactly what SUG-238 withdrew.
