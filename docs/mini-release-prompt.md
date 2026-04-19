# PROMPT — Sugartown Mini-Release Assistant
**Version:** v3 (2026-03-15)

Run this after every epic is fully committed and the working tree is clean.

---

## What a mini-release is

A mini-release is a **patch version bump** scoped to a single epic. It is not a full release. It produces:

- One commit: version bump only
- No CHANGELOG stub (full releases pull data from git log)
- No release notes
- No release notes archive

Mini-releases accumulate as tagged patch versions. A **full release** (run separately via `/release`) aggregates them into a MINOR or MAJOR CHANGELOG entry with narrative, release notes, and the full 5-gate ceremony.

---

## Invariants

- Working tree must be clean before starting. If it is not, stop and tell the human to commit or stash first.
- One mini-release per epic. Do not bundle multiple epics into a single patch.
- Nothing is written to disk until the human says "Write it".
- Nothing is committed until the human says "Commit it".

---

## STEP 0 — COLLECT

### 0A — Chromatic VRT check (if epic touched CSS or components)

If the epic modified any CSS files, component JSX, or Storybook stories, Chromatic must run before the work reaches `origin/main`. Two paths:

**Path A — Run now (default for solo or pre-push releases):**

```bash
pnpm --filter storybook chromatic --exit-zero-on-changes
```

- If Chromatic reports **no changes**: proceed to 0B.
- If Chromatic reports **visual changes**: tell the human "Chromatic detected visual diffs — review and approve baselines at [Chromatic URL] before continuing." Wait for confirmation.
- If Chromatic is not configured or fails: note it in the release output and proceed. This is advisory, not blocking (until the team decides otherwise).

The `--exit-zero-on-changes` flag prevents CI failure on expected visual changes; human review is the gate.

**Path B — Defer to /eod (cheap-path mode):**

When the human is batching multiple mini-releases between pushes (cheap-path, no per-epic push), Chromatic can be deferred to the `/eod` push step, which runs Chromatic once across all accumulated commits before triggering the Netlify deploy. This avoids burning Chromatic snapshots per mini-release.

To defer: ask the human "Run Chromatic now or defer to /eod?" If they choose defer, note it in the release output (`Chromatic: deferred to /eod`) and proceed.

### 0B — Version collection

AI runs:

```bash
cat package.json | grep '"version"'
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD
git diff --name-status $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD
```

If no git tag exists, use the most recent `chore(release):` commit from `git log --oneline`.

AI determines:
- **Current version** from `package.json`
- **Next patch version** (`X.Y.Z` → `X.Y.Z+1`)
- **Epic ID and name** from the most recent commit message(s) — if the commits don't contain an epic ID, AI asks the human to confirm
- **Changed surfaces** grouped by: `apps/web`, `apps/studio`, `packages/design-system`, `apps/storybook`, other

Step 0 has no gate — purely mechanical.

---

## STEP 1 — PROPOSE VERSION BUMP

AI produces a summary of what will happen:

```
━━━ GATE 1 — VERSION BUMP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Epic: EPIC-XXXX — [Epic name]
Version: X.Y.Z → X.Y.Z+1

Files to update:
  package.json → X.Y.Z+1
  apps/web/package.json → X.Y.Z+1

Proposed commit message:
  chore(release): mini-release vX.Y.Z+1 — EPIC-XXXX [Epic name]

Reply "Write it" to bump versions and commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write anything until the human replies.**

---

## STEP 2 — WRITE AND COMMIT

On "Write it":

1. Bump version in `package.json` (root) to `X.Y.Z+1`
2. Bump version in `apps/web/package.json` to `X.Y.Z+1` (if it tracks version separately)
3. Stage and commit with message: `chore(release): mini-release vX.Y.Z+1 — EPIC-XXXX [Epic name]`

No separate gate for commit — "Write it" authorizes both the version bump and the commit.

---

## STEP 2B — LINEAR STATUS UPDATE

After the version commit lands, update the Linear issue linked to this epic:

1. Transition the parent issue (e.g. `SUG-5`) to **Done**
2. If the issue has sub-issues, transition all completed sub-issues to **Done** as well
3. If any sub-issues are NOT complete (deferred to a follow-on epic), leave them open and note which ones in the mini-release completion output

This step is mechanical — no gate required.

---

## STEP 3 — BACKLOG CLEANUP

After the commit lands, AI performs these cleanup tasks **automatically** (no gate — these are mechanical):

### 3A — Delete shipped epic from backlog directory

If the epic has a file in `docs/backlog/` **and** has been activated to `docs/shipped/EPIC-NNNN-*`, delete the backlog copy. The prompt file is the permanent record; the backlog copy is a staging artifact.

```bash
# Example: EPIC-0176 shipped
rm docs/backlog/EPIC-content-state-governance.md  # if it exists
```

Only delete files that match the shipped epic. Do not touch other backlog files.

### 3B — Update backlog priority stack

In `docs/backlog/sugartown-backlog-priorities.md`:

1. **Ship the epic** — if it appears as an active item (in sections 01 or 02), move it to the Shipped section (04) with the version and date.
2. **Update header meta** — update the `> Updated` line with current date, version, and shipped epic name.
3. **Update current focus** — update the `⚑ Current focus` block to reflect what shipped and what's next.
4. **Renumber** — if active items were removed, renumber the remaining items sequentially.
5. **Update footer date**.

### 3C — Commit backlog cleanup

Stage and commit the backlog changes (deleted file + updated priority stack):

```
docs: mark EPIC-NNNN shipped in backlog and close epic prompt
```

---

## COMPLETION

After all steps complete, AI prints:

```
━━━ MINI-RELEASE vX.Y.Z+1 COMPLETE ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  package.json → X.Y.Z+1
  ✅  Committed: [hash]
  ✅  Linear: SUG-XX → Done [or "no Linear issue linked"]
  ✅  Backlog cleaned: [deleted file(s) listed, or "no backlog file to remove"]
  ✅  Priority stack updated

Next: start the next epic, or run /release for a full release
      when the cycle is done.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Enforcement Rules

Fail if:
- Working tree is dirty when mini-release starts.
- Multiple epics bundled into one patch.
- AI writes to disk before "Write it".
- Version is bumped by MINOR or MAJOR (patches only — if the epic warrants a MINOR bump, run the full `/release` instead).
- Shipped epic's backlog file is left in `docs/backlog/` when a matching `docs/shipped/EPIC-NNNN-*` exists.
- Backlog priority stack is not updated after shipping an epic that appears as an active item.
- AI writes a CHANGELOG stub (CHANGELOG is only updated during full releases).
