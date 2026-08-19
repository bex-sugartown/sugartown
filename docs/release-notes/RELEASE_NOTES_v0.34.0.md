# Release Notes — v0.34.0

**Date:** 2026-08-19
**Scope:** Sugartown monorepo (process, tooling, tracker migration — no `apps/web` render code, no schema, no content)

---

## What this release is

Two governance epics and a tracker migration trial land together, plus the consolidation of the
epic close-out sequence from two drifting commands into one: `/ship --release`. Nothing here
touches what a site visitor sees; every change is to how the team ships.

---

## What changed

### Governance post-mortem rules

Six recommendations from a governance post-mortem are now enforced rules in `CLAUDE.md` and the
epic template's Pre-Execution gate — naming the reader before building a writer, never widening a
guard to fit a breach it should have blocked, generating registers rather than hand-maintaining
them, and three checks that fire before an epic starts (removal scope, ID scheme, kill criterion).

A rule-file followability walkthrough is now mandatory before committing any change to a
rule-defining file: name the workflows it touches, walk one instance from the edited text (not
memory), flag anything that can't actually be followed. Run four times this release, it found a
real defect every time — including a broken instruction in its own introduction, caught on its
first real use.

### Tracker migration trial

Tracker writes moved to GitHub only, on a trial through 2026-09-09. 58 issues migrated from Linear
to GitHub Projects; new epics are keyed as GitHub issue numbers (`ST-{n}`); the 58 migrated issues
keep their Linear IDs (`SUG-{n}`) and Linear stays read-only for their priority ordering.

### Epic close-out consolidated into `/ship --release`

The twelve-step epic close-out sequence had two commands between them (`/eod`, `/mini-release`)
and ten steps with no command at all. Both retire into one: `/ship`, which pushes everything
currently `Done`, verifies the deploy and CI to a real conclusion, and transitions issues from
`Done` to `Shipped` on the board — only after CI concludes successfully. `--release` invokes
`/release` for the version bump rather than reimplementing it.

The epic lifecycle itself split in two: `Done` means the work is complete and committed locally;
`Shipped` means it's merged, deployed, and CI-verified. Previously those were the same thing,
which meant an epic couldn't be marked done until the same session also pushed it live.

Disk safety no longer depends on remembering to push — a `post-commit` hook mirrors every commit,
on any branch, to a remote backup branch automatically, at no cost.

### Fixed: a stats bucket nobody was reading

`linearRoadmap`'s `shipped` bucket bucketed Linear's own "completed" workflow state, not actual
deploy status, and had zero consumers anywhere in the app. Renamed to `completed` before a future
consumer could inherit the wrong assumption from the field name.

---

## Not in this release

- `/morning` reporting the age of the oldest `Done` item, and the unpushed-work nag moving there
  from the old end-of-day model — scoped, not yet built.
- The published roadmap's stale coverage figures beyond the `linearRoadmap` bucket rename.
- Per-change-type QA profiles (rule vs. code vs. design) — the rule-file walkthrough is built and
  proven; code and design already have their own established gates; the next step is running the
  walkthrough on a wider variety of rule changes before any grouping is designed.
- The Linear→GitHub migration trial's own review, scheduled for 2026-09-09 — this release ships
  the trial's state as of today, not its outcome.

---

## Validator state at release

All pre-commit validators passed on every commit in this release: `validate:tokens`,
`validate:style-mirror`, `validate:tokens:strict`, `validate:dead-refs`, `validate:css-names`,
and `pnpm lint` (0 errors, pre-existing warnings only, unchanged by this release). CI concluded
`success` on the pushed commit before this release was cut.
