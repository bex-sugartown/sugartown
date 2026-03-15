# PROMPT — Sugartown Mini-Release Assistant
**Version:** v2 (2026-03-15)

Run this after every epic is fully committed and the working tree is clean.

---

## What a mini-release is

A mini-release is a **patch version bump + lightweight CHANGELOG stub** scoped to a single epic. It is not a full release. It produces:

- One commit: version bump + CHANGELOG stub
- No release notes
- No release notes archive
- No full surface-by-surface breakdown

Mini-releases accumulate in CHANGELOG.md as patch entries. A **full release** (run separately via `/release`) aggregates them into a MINOR or MAJOR entry with narrative, release notes, and the full 5-gate ceremony.

---

## Invariants

- Working tree must be clean before starting. If it is not, stop and tell the human to commit or stash first.
- One mini-release per epic. Do not bundle multiple epics into a single patch.
- The stub is a factual record, not a narrative. No marketing tone.
- Nothing is written to disk until the human says "Write it".
- Nothing is committed until the human says "Commit it".

---

## STEP 0 — COLLECT

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

## STEP 1 — PROPOSE STUB

AI produces a mini CHANGELOG entry to chat. **AI must not write to disk yet.**

**Format:**

```markdown
## [X.Y.Z] — YYYY-MM-DD

EPIC-XXXX: [Epic name]. [One sentence describing the overall scope.]

### packages/design-system

- [Outcome bullet]
- [Outcome bullet]

### apps/web

- [Outcome bullet]

### apps/studio

- [Outcome bullet]
```

**Rules:**

- Max 3 bullets per surface. If more changed, group into one higher-level bullet.
- Omit surfaces with no meaningful changes.
- Outcome-focused — what exists now that didn't before, or what behaves differently.
- No `Added` / `Changed` / `Fixed` sub-headers (that is full-release format).
- No file names as bullets (e.g. not "Updated Card.tsx" — say what it does now).
- No marketing tone.
- Legacy values, backward-compat scaffolding, and "kept for compat" notes are fine to include — they are real changes.

### ✅ GATE 1 — STOP

AI outputs the proposed stub to chat, then prints:

```
━━━ GATE 1 — MINI-RELEASE STUB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review the CHANGELOG stub above.
Edit if needed, or reply "Write it" to write to CHANGELOG.md and bump versions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write anything until the human replies.**

---

## STEP 2 — WRITE AND COMMIT

On "Write it":

1. Prepend the approved stub to `CHANGELOG.md`
2. Bump version in `package.json` (root) to `X.Y.Z+1`
3. Bump version in `apps/web/package.json` to `X.Y.Z+1` (if it tracks version separately)

### ✅ GATE 2 — STOP

AI prints the proposed commit plan:

```
━━━ GATE 2 — COMMIT PLAN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files to commit:
  CHANGELOG.md
  package.json → X.Y.Z+1
  apps/web/package.json → X.Y.Z+1

Proposed commit message:
  chore(release): mini-release vX.Y.Z+1 — EPIC-XXXX [Epic name]

Reply "Commit it" to create the commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not commit until the human replies "Commit it".**

---

## STEP 3 — BACKLOG CLEANUP

After the commit lands, AI performs these cleanup tasks **automatically** (no gate — these are mechanical):

### 3A — Delete shipped epic from backlog directory

If the epic has a file in `docs/backlog/` **and** has been activated to `docs/prompts/EPIC-NNNN-*`, delete the backlog copy. The prompt file is the permanent record; the backlog copy is a staging artifact.

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
  ✅  CHANGELOG.md — [X.Y.Z+1] stub prepended
  ✅  package.json → X.Y.Z+1
  ✅  Committed: [hash]
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
- Marketing or roadmap language in the stub.
- AI writes to disk before "Write it".
- AI commits before "Commit it".
- Version is bumped by MINOR or MAJOR (patches only — if the epic warrants a MINOR bump, run the full `/release` instead).
- Shipped epic's backlog file is left in `docs/backlog/` when a matching `docs/prompts/EPIC-NNNN-*` exists.
- Backlog priority stack is not updated after shipping an epic that appears as an active item.
