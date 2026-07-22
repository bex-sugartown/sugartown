# PROMPT — Sugartown Mini-Release Assistant
**Version:** v4 (2026-05-14)

Run this after every epic is fully committed and the working tree is clean.

---

## What a mini-release is

A mini-release is a **PATCH version bump** scoped to a single epic. It is not a full release.

### Two-tier release model

| Tier | Command | Version bump | CHANGELOG | Release notes |
|------|---------|-------------|-----------|---------------|
| **Mini-release** | `/mini-release` | PATCH only (`X.Y.Z+1`) | None | None |
| **Full release** | `/release` | MINOR only (`X.(Y+1).0`) | Promotes `[Unreleased]` → `[X.(Y+1).0]` | New `RELEASE_NOTES.md` |

### The [Unreleased] accumulation buffer

After each epic ships, a one-line summary of what changed belongs in `CHANGELOG.md` under `[Unreleased]`. This is the accumulation buffer. It does NOT get a version number or date — it is a staging area for the next full release.

- **Mini-release writes:** version bump commit only. It does not touch CHANGELOG.
- **Full release writes:** promotes `[Unreleased]` → `[X.(Y+1).0]` with today's date, resets `[Unreleased]` to empty, bumps MINOR version.

**After each mini-release commit, manually add a one-line entry to `[Unreleased]` in CHANGELOG.md** (or prompt AI to do it) so the buffer stays current. Format:

```
- SUG-XX: Short description of what shipped
```

Mini-releases accumulate as PATCH versions. A **full release** (run separately via `/release`) promotes the [Unreleased] buffer into a MINOR CHANGELOG entry with narrative, full release notes, and the 5-gate ceremony.

---

## Invariants

- Working tree must be clean before starting. If it is not, stop and tell the human to commit or stash first.
- **Must run on `main` (or an equivalent already-merged trunk), never on an unmerged feature branch.** `package.json`'s version is a shared counter — a branch computes "next version" from a disconnected view of it. If the current branch is not `main`, stop and tell the human to merge first. Two branches each mini-releasing pre-merge is how version numbers collide or silently mis-resolve at merge time.
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
- **Epic ID and name** — derived from the commit scopes (`feat(sug-NNN):`, `fix(sug-NNN):`) since the last `chore(release):` commit. Do NOT use the epic ID stated verbatim in the human's message. If multiple epic IDs appear in commits, list them all. If an epic context argument was passed to `/mini-release`, cross-check it against the derived ID — if they differ, raise a mismatch warning before proceeding (see Step 1).
- **Changed surfaces** grouped by: `apps/web`, `apps/studio`, `packages/design-system`, `apps/storybook`, other

**Deferred-epic accumulation check:** If commit scopes since the last `chore(release):` show **more than one epic ID that each represents a separately-shippable unit** (not just the epic driving this mini-release), this is expected when one or more of those epics declared a "single close-out — one mini-release at the end" merge strategy (check their `docs/shipped/*.md` header for `**Merge strategy:**`). This is not an error — git history is linear, so a deferred epic's commits cannot be retroactively split into their own patch version. Surface it plainly in Gate 1 (see the accumulation-check block below) rather than silently bundling it in without comment or treating it as a mismatch.

Step 0 has no gate — purely mechanical.

---

## STEP 1 — PROPOSE VERSION BUMP

AI produces a summary of what will happen.

**Epic ID mismatch check (blocking):** If the epic ID passed as an argument (e.g. from `/mini-release SUG-NNN`) does not match the ID(s) derived from recent commit scopes, output this warning instead of the standard gate and stop:

```
⚠️  EPIC MISMATCH — action required
Stated epic:  SUG-NNN
Commits show: SUG-MMM (e.g. fix(sug-mmm):, feat(sug-mmm):)

These don't match. Confirm which epic this release is for before proceeding.
Reply with the correct epic ID to continue, or "abort" to cancel.
```

Do not proceed to the version bump gate until the human confirms the correct epic ID.

**Deferred-epic accumulation gate:** If Step 0B found more than one separately-shippable epic in scope (see the accumulation check above), do not silently fold them into the primary epic's gate as if they don't need mentioning. Present this instead, before the standard gate:

```
━━━ MULTIPLE EPICS SINCE LAST VERSION BUMP ━━━━━━━━━━━━━━━━━━━━
Primary epic (this mini-release): SUG-NNN — [name]
Also unreleased (deferred single-close-out strategy):
  SUG-MMM — [name] — shipped [date], no prior version bump
  SUG-PPP — [name] — shipped [date], no prior version bump

This version bump will cover all of the above — git history is linear,
so their commits cannot be split into separate patch versions after
the fact. CHANGELOG [Unreleased] will get one line per epic listed here.

Reply "bundle all" to proceed with all epics in this bump, or name
which epic(s) to exclude (their commits will still be in the diff,
but won't be named in the release commit or CHANGELOG).
```

Wait for the human's reply before showing Gate 1. Do not decide unilaterally to bundle or exclude an epic.

If no mismatch and no deferred-epic accumulation (or after the human resolves either), show the standard gate:

```
━━━ GATE 1 — VERSION BUMP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Epic:    EPIC-XXXX — [Epic name]  ← derived from commit scopes
Version: X.Y.Z → X.Y.Z+1

Recent commits in scope:
  [list the sug-NNN-scoped commits since last chore(release):]

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
2. **Update header meta** — prepend the new entry to the `> Updated` line with current date, version, and shipped epic name. **Cap that line at the 8 most recent entries**; move anything older down to the `## Changelog` section at the bottom of the file. The line is a single unbroken paragraph, so it grows without visible warning — it reached **20,391 characters on one line** by 2026-07-22, which no editor wraps usefully and no diff review can read. Trimming it is part of the mini-release, not a separate housekeeping task.
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
- Version is bumped by MINOR or MAJOR (PATCH only — if the epic warrants a MINOR bump, run the full `/release` instead).
- Shipped epic's backlog file is left in `docs/backlog/` when a matching `docs/shipped/` file exists.
- Backlog priority stack is not updated after shipping an epic that appears as an active item.
- AI writes a versioned CHANGELOG entry. The only permitted CHANGELOG write is a one-line addition to the `[Unreleased]` buffer.
- RELEASE_NOTES.md is modified. Release notes are only produced by `/release`.
