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
`resume-factory/os` and `cms-eval/toolkit`.

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

After this epic, one command reports the state of all three repositories in a single run —
dirty trees, ahead/behind counts, stale git locks, wip-mirror failures, and unversioned content
— and pushes the two repositories where a push is free. `sugartown` is reported on and never
pushed, because a push there is a Netlify production deploy and belongs to `/ship`.

The brief's four open decisions are settled and recorded before any of that is built, because
D2 and D4 determine where the command and its rules live.

Layers touched: **tooling** (the command), **docs** (the brief's decision records, the rules in
`conventions/`). No schema, no GROQ, no React, no Sanity content.

## Scope

Six items, which crosses the sizing gate — see the scope-to-phase mapping under Phases.

- [ ] Settle **D2** — whether `conventions/` becomes a small private repository or stays plain files — layer: docs/decision
- [ ] Settle **D3, D4, D5** — command name, which repository hosts it, whether it fetches per repo — layer: docs/decision
- [ ] Build the `/sweep` read-only assessment: stale-lock detection, `.git/st-mirror.log` check, tree state, unversioned-content report — layer: tooling
- [ ] Build `/sweep` push behaviour: push `resume-factory/os` and `cms-eval/toolkit` when ahead, report-only for `sugartown` — layer: tooling
- [ ] Write the sweep's rules into `conventions/` and the command into whichever repository D4 names — layer: docs + tooling
- [ ] Make `/sweep` discoverable as a skill in its host repository — layer: tooling

## Phases

Merge strategy is **(b) single close-out**: all three phases accumulate on one branch and merge
once. Phase 1's decisions are recorded in the brief on that same branch, so the brief and the
command that implements it land together.

| Phase | Scope items | What ships at the end |
|---|---|---|
| **Phase 1 — Decisions** | D2; D3/D4/D5 | Every open decision in the brief carries a dated record and a reason. No `Open` rows remain except D1's pending verification. |
| **Phase 2 — Read and report** | read-only assessment | `/sweep` runs against all three repositories and reports state. Writes nothing, pushes nothing. |
| **Phase 3 — Act and wire** | push behaviour; rules into `conventions/`; skill discoverability | `/sweep` clears stale locks and pushes the two private repositories. Rules live in `conventions/`, command in the D4 repository, listed as a skill. |

`Scope ∖ Phases` is empty: every scope item above appears in exactly one phase.

## Acceptance criteria

- [ ] D2, D3, D4 and D5 each carry a decision, a date and a reason in `docs/briefs/multi-repo-operations-brief.md`. The only remaining open row is D1's verification.
- [ ] `/sweep` reports, for each of the three repositories in one run: dirty tree, ahead/behind counts, stale locks, `.git/st-mirror.log` state, and stashes.
- [ ] `/sweep` reports `resume-factory/data`, `resume-factory/private` and `conventions/` as unversioned, and stops reporting a directory once it is covered.
- [ ] A stale lock planted in any of the three repositories (0 bytes, old timestamp, no git process) is detected and cleared. A lock held by a running git process is left alone. Both cases verified by planting them, not by inspection.
- [ ] `/sweep` pushes `resume-factory/os` and `cms-eval/toolkit` when they are ahead of origin.
- [ ] `/sweep` never pushes `sugartown`, verified by running it with `sugartown` ahead of origin and confirming no push occurred and no Netlify deploy was triggered.
- [ ] Run against three clean, in-sync trees, `/sweep` reports "nothing to do" and exits without writing.
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
- **Activation audit — read before writing any of the command:**
  - `docs/ship-prompt.md`, to confirm exactly which behaviours `/sweep` defers rather than
    duplicates, and to copy its assess-then-confirm structure.
  - `.husky/post-commit`, for the `.git/st-mirror.log` format the sweep reads. Note ST-106
    changed both the push and the printed recovery advice on 2026-09-02.
  - `conventions/README.md`, for the mount caveat and the "say so rather than guessing"
    fallback, which the sweep inherits when a repository is not connected.
  - `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md`, for each repository's own
    pre-commit gate, since the sweep must not assume sugartown's validators exist elsewhere.
- **Credential asymmetry (F4).** `resume-factory/os` uses SSH, the other two HTTPS, and a Cowork
  bridge VM holds neither. The sweep reports an unpushable repository as a finding rather than
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

## Related

- **GitHub:** [#108](https://github.com/bex-sugartown/sugartown/issues/108)
- **Brief:** `docs/briefs/multi-repo-operations-brief.md`
- **Related issue:** [#106](https://github.com/bex-sugartown/sugartown/issues/106) — the wip-mirror bug whose log this sweep reads
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
