# Sugartown — Project Management Migration: Linear → GitHub

**Status:** DRAFT — setup and plan only. Nothing executes until the freeze lifts.
**Author:** drafted 2026-08-15
**Blocking constraint:** the Linear auto-archive freeze, below. **Earliest execution date: 2026-09-09.**
**Related:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §8

---

## Overview

Linear's free plan caps **lifetime** issues at 250, not active ones. The Sugartown workspace is
at 260 of 250 and blocked from creating new issues. 193 of those 260 are `Done`. Auto-archive
would reclaim them, but a bulk project-removal on 2026-08-08/09 reset the one-month inactivity
timer on ~154 completed issues, so nothing archives until roughly **2026-09-08**. There is no
manual archive on the free plan.

This document defines the target GitHub setup, the cleanup required before migrating, and the
cutover procedure. It does not decide whether to migrate — see §2, which is the decision the
plan turns on.

**Kill criterion** (per post-mortem §6.7): if migration is not underway by **2026-12-01**, this
plan is deleted rather than left as a stale artifact. Check date: 2026-12-01.

---

## 1. Current state, measured

All figures measured 2026-08-15. Commands named so they can be re-run rather than trusted.

### Linear

| Measure | Value | Source |
|---|---|---|
| Issues used | 260 of 250 | Linear UI limit dialog |
| `Done` | 193 | Linear UI, All Issues view |
| Active working set | ~67 | 58 backlog + 4 Todo + cancelled, per `stats.linearRoadmap` |
| Awaiting auto-archive | ~154 | completed/cancelled before 2026-07-15 |
| Archive unblocks | ~2026-09-08 | one month from the 08-08/09 edits |

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

**The counter is derived, not maintained.** Next ID comes from the filesystem:

```bash
ls docs/backlog docs/shipped | grep -oE 'SUG-[0-9]+' | sort -t- -k2 -n | tail -1
```

That satisfies post-mortem §6.4 — registers are generated or they do not exist. There is no new
register to drift.

**This decision must be settled before Phase 1.** Everything downstream depends on it.

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

**Input:** the Linear CSV export. *Path TBD — supply before execution.* Verify its actual
columns before writing any importer; do not assume the schema.

**Scope: open and backlog items only.** Completed and cancelled work stays in Linear and
archives there. The 109 epic docs in git are already the durable record of shipped work; there
is no value in recreating 193 closed issues in GitHub.

Expected volume: **~62 items** (58 backlog + 4 Todo). In-progress count was 0 as of 2026-08-15.

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
4. **Set Linear read-only.** Do not delete the workspace; it is the archive of 193 completed
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

1. **§2 ID decision** — settle before Phase 1.
2. **Export path and columns** — needed before Phase 3.
3. **Dependency representation** — sub-issues or task lists? Phase 1 step 4.
4. **Is migration warranted at all?** The alternative is Linear Basic at $10/user/month billed
   yearly (~$120/yr), zero migration, and none of the losses in §8. This plan does not assume
   migration is the right answer; it exists so the comparison can be made against a real scope
   rather than a guess.
