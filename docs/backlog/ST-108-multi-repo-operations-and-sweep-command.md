---
**Epic:** ST-108 — Multi-repo operations and /sweep command
**Issue:** [#108](https://github.com/bex-sugartown/sugartown/issues/108)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
---

# ST-108 — Multi-repo operations and /sweep command

Execute `docs/briefs/multi-repo-operations-brief.md`: settle its open decisions D2 through D5,
then build `/sweep`, the cross-repo state and push command covering `sugartown`,
`resume-factory/os`, `cms-eval/toolkit` and, since 2026-09-03, `conventions`.

## Background

`/ship` covers one repository. Bex runs three, plus a shared `conventions/` folder that is not a
repository. No command answers whether all of the work is safe, so the answer is assembled by
hand or not at all.

On 2026-09-01 a Cowork bridge session committed in `resume-factory/os` and `cms-eval/toolkit`
and could push neither, because that VM holds no GitHub credentials. The same day, stale
`index.lock` files from a single incident were found sitting in all three repositories, and one
held 55 orphaned git temp objects. Nothing detected either state; a human noticed.

The brief measures five findings (F1 through F5) and states a recommended architecture. F1, the
834 MB of `resume-factory` content that existed in one place, was decided on 2026-09-02 as
Time Machine to `/Volumes/Angelique` and is Bex's own action. F2 through F5 are what this epic
closes.

## Objective

After this epic, one command reports the state of all four repositories in a single run —
dirty trees, ahead/behind counts, stale git locks, wip-mirror failures, and unversioned content
— and pushes the three repositories where a push is free. `sugartown` is reported on and never
pushed, because a push there is a Netlify production deploy and belongs to `/ship`.

The brief's four open decisions are settled and recorded before any of that is built, because
D2 and D4 determine where the command and its rules live.

Layers touched: **tooling** (the command), **docs** (the brief's decision records, the rules in
`conventions/`). No schema, no GROQ, no React, no Sanity content.

## Scope

Eight items, which crosses the sizing gate — see the scope-to-phase mapping under Phases.

- [x] Record **D2** — decided 2026-09-03: `conventions/` is the private repo `bex-sugartown/conventions` (first commit `3c3ea58`, loader `61efab7`); the root loader resolves through it — layer: docs/decision
- [x] Settle **D3, D4, D5** — `/sweep`; hosted in the `conventions/` repo; fetches per repo. Recorded with dates and reasons in the brief 2026-09-03 — layer: docs/decision
- [x] Put the **root loader** in place — `conventions/CLAUDE.md` (topology table, wrapper-rule pointers), reached by a symlink at `SUGARTOWN_DEV/CLAUDE.md`, verified to load from a fresh session in `resume-factory/os`. **Amended 2026-09-03:** the four convention files are delivered as personal rules through `~/.claude/rules/conventions` → `conventions/rules/` (four relative symlinks), not by `@` import, because imports were measured not to expand across the project boundary (Claude Code 2.1.207; see Technical notes). Per-project pointer blocks trimmed in `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md`; `sugartown/CLAUDE.md:90` was already pointer plus caveat with no table and is unchanged — layer: docs
- [x] Add the **laptop bootstrap** to `conventions/README.md` §Reaching this folder — four steps in the human-instruction style (clone, two symlinks, a check that tells which is missing); `/switch` does not do this — layer: docs
- [ ] Build the `/sweep` read-only assessment: stale-lock detection, `.git/st-mirror.log` check, tree state, unversioned-content report — layer: tooling
- [ ] Build `/sweep` push behaviour: push `resume-factory/os`, `cms-eval/toolkit` and `conventions` when ahead, report-only for `sugartown` — layer: tooling
- [ ] Write the sweep's rules into `conventions/` and the command into whichever repository D4 names — layer: docs + tooling
- [ ] Make `/sweep` discoverable as a skill in its host repository — layer: tooling

## Phases

Merge strategy is **(b) single close-out**: all three phases accumulate on one branch and merge
once. Phase 1's decisions are recorded in the brief on that same branch, so the brief and the
command that implements it land together.

| Phase | Scope items | What ships at the end |
|---|---|---|
| **Phase 1 — Decisions and loader** | D2 record; D3/D4/D5; root loader; laptop bootstrap line | Every open decision in the brief carries a dated record and a reason. No `Open` rows remain except D1's pending verification. `SUGARTOWN_DEV/CLAUDE.md` resolves through the `conventions/` repo and the per-project pointer blocks are trimmed. |
| **Phase 2 — Read and report** | read-only assessment | `/sweep` runs against all four repositories and reports state. Writes nothing, pushes nothing. |
| **Phase 3 — Act and wire** | push behaviour; rules into `conventions/`; skill discoverability | `/sweep` clears stale locks and pushes the three private repositories. Rules live in `conventions/`, command in the D4 repository, listed as a skill. |

`Scope ∖ Phases` is empty: every scope item above appears in exactly one phase.

## Acceptance criteria

- [ ] D2, D3, D4 and D5 each carry a decision, a date and a reason in `docs/briefs/multi-repo-operations-brief.md`. The only remaining open row is D1's verification.
- [ ] `/sweep` reports, for each of the four repositories in one run: dirty tree, ahead/behind counts, stale locks, `.git/st-mirror.log` state, and stashes.
- [ ] `/sweep` reports `resume-factory/data` and `resume-factory/private` as unversioned, and stops reporting a directory once it is covered. `conventions/` is reported as a repository, not as unversioned content, from 2026-09-03.
- [ ] A stale lock planted in any of the four repositories (0 bytes, old timestamp, no git process) is detected and cleared. A lock held by a running git process is left alone. Both cases verified by planting them, not by inspection.
- [ ] `/sweep` pushes `resume-factory/os`, `cms-eval/toolkit` and `conventions` when they are ahead of origin.
- [ ] `/sweep` never pushes `sugartown`, verified by running it with `sugartown` ahead of origin and confirming no push occurred and no Netlify deploy was triggered.
- [ ] Run against four clean, in-sync trees, `/sweep` reports "nothing to do" and exits without writing.
- [ ] `/sweep` does not read, stage, copy or commit anything under `cms-eval/bound/`, verified by inspecting the command's own paths, not by observing one clean run.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic touches
tooling and documentation only.

## Technical notes

- **Content Write Gate**: does not fire. No Sanity content is written by this epic.
- **Schema changes**: none.
- **Upstream dependencies**: none. D1 is Bex's own action on her Time Machine configuration and
  does not block any scope item here.
- **`/ship` must not be reimplemented.** For `sugartown`, `/sweep` reports and stops.
  CLAUDE.md §Building a mechanism forbids forking a mechanism that already exists.
- **Ordering (2026-09-03).** Execute after #109 and #113: `/sweep` Phase 2 reads
  `.git/st-mirror.log`, and until both land the log both cries wolf after a rebase (#109) and
  stays silent when a day's first commit goes unmirrored (#113), so the sweep would report the
  wrong state on its first real run.
- **`@` imports do not cross the project boundary (measured 2026-09-03, Claude Code 2.1.207).**
  Fresh nested `claude -p` sessions with all tools disallowed, one per case: an import inside
  the project's own `CLAUDE.md` of a file inside the project directory expanded; `../`,
  absolute and `~/` targets outside the project did not, whether the import sat in the
  project's file or an ancestor's. `~/.claude/rules/` loaded in every case and followed a
  symlinked directory containing file symlinks. Ancestor `CLAUDE.md` loading through a symlink
  worked. This is why the loader carries no imports and the rules symlink exists; if a later
  build lifts the limit, the imports can return and the symlink can go.
- **Phase 1 close, 2026-09-03.** `resume-factory/os/CLAUDE.md`'s trimmed pointer block is
  staged but uncommitted: that repo's blocking `check_tiers.py` gate refuses any commit while
  an untracked hand-rolled backup (`scripts/.offload_notes_BACKUP_2026-09-02_pre-archdir-fix.py`,
  2026-09-02, not this epic's) sits in the tree. Bex moves or trashes it; the commit follows.
- **Activation audit — read before writing any of the command:**
  - `docs/reviews/2026-09-03-claude-code-layout-alignment-audit.md`, for the hierarchy facts
    the root loader depends on and the verified-against-docs mechanics (ancestor loading,
    `@` imports, no parent-level settings file).
  - `docs/ship-prompt.md`, to confirm exactly which behaviours `/sweep` defers rather than
    duplicates, and to copy its assess-then-confirm structure.
  - `.husky/post-commit`, for the `.git/st-mirror.log` format the sweep reads. Note ST-106
    changed both the push and the printed recovery advice on 2026-09-02.
  - `conventions/README.md`, for the mount caveat and the "say so rather than guessing"
    fallback, which the sweep inherits when a repository is not connected.
  - `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md`, for each repository's own
    pre-commit gate, since the sweep must not assume sugartown's validators exist elsewhere.
- **Credential asymmetry (F4).** All four repos are on HTTPS via the `gh` keychain token since
  2026-09-03 (`resume-factory/os` switched from SSH that day); a Cowork bridge VM holds no
  credential at all. The sweep reports an unpushable repository as a finding rather than
  failing, so a bridge session produces a useful report instead of an error.
- **Stale versus live locks.** A lock is stale only when it is 0 bytes, carries an old
  timestamp, and no git process is running. A lock seen mid-poll is live and clears itself;
  VS Code's git extension creates these constantly. Clearing a live lock corrupts an in-flight
  operation.

## Model & Mode [REQUIRED]

`/model opus`, with plan mode (Shift+Tab) for Phase 1.

Phase 1 is architectural — D2 decides whether a fourth repository exists and D4 decides where a
cross-repo command lives inside one of the repositories it sweeps, which is a hierarchy
question, not a coding one. Exit plan mode for Phases 2 and 3, which are ordinary tooling work.

## Non-Goals

- **Merging any repositories.** Ruled out in the brief: the three hold three visibility classes,
  and `sugartown` is public while `cms-eval` carries confidential client source and
  `resume-factory` carries personal data.
- **Adding CI, deploys or a project board** to `resume-factory` or `cms-eval`.
- **Managing `_archive/`, `codesnippets/`, `cursor/`, `jessiecowan/`, `sanity-backups/` or
  `wordpress/`.** Out of the sweep's scope; they are not active work.
- **Replacing or extending `/ship`.** The sweep reports on `sugartown` and defers.
- **Closing F1.** Decided as D1 on 2026-09-02 and executed by Bex on her own machine.
- **Syncing the Linear and GitHub records** during the migration trial.
- **Inlining shared rules into each project's `CLAUDE.md`.** Rejected 2026-09-02: the pointer
  exists to prevent drift, and a copy without a generator and a validator reintroduces it.
  Re-read 2026-09-03 against the root-loader scope item: an `@` import is a reference the
  loader resolves at session start, not a copy, so the two do not conflict.
- **The guard hook, the settings relayering, and the `CLAUDE.md` split.** Filed as #110, #111
  and #112 from the 2026-09-03 audit; this epic's Phase 2 only reads the guard hook's
  self-test if it exists by then.

## Related

- **GitHub:** [#108](https://github.com/bex-sugartown/sugartown/issues/108)
- **Brief:** `docs/briefs/multi-repo-operations-brief.md`
- **Related issue:** [#106](https://github.com/bex-sugartown/sugartown/issues/106) — the wip-mirror bug whose log this sweep reads
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
