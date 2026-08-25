# PROMPT — Sugartown Ship
**Version:** v2 (2026-08-19) — consolidated from `/eod` and `/mini-release` under SUG-100 Phase 3b
**Run with:** Claude Code (project context required)
**When to use:** Whenever you want everything currently `Done` to go live. Observed cadence is
1–14 days, not daily — there is no "end of day" obligation. Run it when you want to ship, not on
a schedule.

---

## What this prompt does

Takes everything currently `Done` — one epic or two weeks of them — and pushes it live: one
Netlify deploy, CI verified to a conclusion, every shipped issue transitioned from `Done` to
`Shipped` on the board. With `--release`, also cuts a version by invoking `/release` afterward.

It reads first, then executes with confirmation at each step. Nothing here is on a clock;
everything here operates on the full accumulated backlog of `Done` work, never just "today's".

---

## The Prompt

---

### PHASE 1 — ASSESS STATE

Run the following and collect all output before doing anything else:

```bash
git status
git log --oneline -10
git rev-list --count origin/main..main 2>/dev/null || echo 0
git stash list
# Branches ahead of main (stranded feature work):
for b in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -v '^main$'); do
  ahead=$(git rev-list --count main..$b 2>/dev/null || echo 0)
  if [ "$ahead" != "0" ]; then echo "$b: $ahead commits ahead of main"; git log --oneline main..$b | head -5; fi
done
```

**Then enumerate everything currently `Done` on the board — not just today's commits:**

```bash
gh project item-list 1 --owner bex-sugartown --limit 200 --format json \
  | jq -r '.items[] | select(.status=="Done") | "\(.content.number) \(.id) \(.title)"'
```

Cross-check this list against the unpushed commit count from above. They should roughly agree —
every `Done` issue implies committed work, and CLAUDE.md's close-out sequence forbids carrying
uncommitted changes across epic boundaries. Flag, don't silently resolve, either mismatch:

- A `Done` issue with no corresponding commits ahead of `origin/main` (its work may have been
  pushed by an earlier, incomplete ship attempt — check before assuming it's already live)
- Unpushed commits with no `Done` issue behind them (a session may have broken close-out
  discipline — commits without a completed epic record)

Do not take any action yet. Collect everything first.

---

### PHASE 2 — SHIP BRIEFING

Write a short briefing using this structure:

---

#### Ship Briefing — [date]

---

#### Shipping

- List every issue enumerated as `Done` in Phase 1: number, title, one-line CHANGELOG summary
- **For each, confirm its summary actually appears in `CHANGELOG.md`'s `[Unreleased]` section.**
  A `Done` issue with no `[Unreleased]` line is incompletely closed (CLAUDE.md close-out step 7) —
  flag it, don't ship silently around it. Fixing it is a small edit, not a reason to stop.
- If nothing is `Done`, say so plainly and stop here — nothing to ship.

---

#### Uncommitted Work

- List any modified or untracked files that should be committed
- If there are uncommitted changes, recommend a commit message based on the changes
- If the tree is clean, say so

---

#### Unpushed Commits

- How many commits are ahead of `origin/main`?
- List them (oneline format)
- Note: pushing will trigger a Netlify deploy (~15 credits — SUG-100 S9b)

---

#### Stashed Work

- List any stashes that exist
- Flag any that look like they might be forgotten WIP

---

#### Branches Ahead of main (stranded work)

- List any feature branch with commits not on `main`
- For each: issue number, commit count, last commit date, last commit subject
- For each, ask via `AskUserQuestion`:
  ```
  Question: "Branch [name] (#N, M commits, last: [date] [subject]) — what should happen to it?"
  Options:
    - "Merge now"
    - "Hold" (human states why; AI notes the reason)
    - "Abandon"
  ```
- A branch pushed to `origin/<branch>` but never merged to `main` is NOT shipped. Do not close
  with stranded branches unaccounted for.

---

### PHASE 3 — EXECUTE (with confirmation)

After delivering the briefing, propose actions in this order:

1. **Commit** any uncommitted changes (if any)
   - Draft a commit message and show it
   - Ask via `AskUserQuestion`:
     ```
     Question: "Review the commit message above — commit it?"
     Options:
       - "Commit it — use this message"
       - "Needs edits"
     ```

2. **Chromatic VRT pre-flight** (if any pushed commits touched CSS, component JSX, or Storybook stories)
   - Detect: `git diff --name-only origin/main..HEAD` — if any match `**/*.css`, `**/*.jsx`, `**/*.tsx`, or `apps/storybook/**`, run Chromatic.
   - Run: `pnpm --filter storybook chromatic --exit-zero-on-changes`
   - If Chromatic reports **no changes**: proceed to push.
   - If Chromatic reports **visual changes**: print the Chromatic review URL, then ask via `AskUserQuestion`:
     ```
     Question: "Chromatic detected visual diffs — approved?"
     Options:
       - "Approved — continue to push"
       - "Skip Chromatic — push anyway"
       - "Stop — let me review the diffs first"
     ```
     Do NOT push until "Approved — continue to push" or "Skip Chromatic — push anyway" is selected.
   - If Chromatic fails or is misconfigured: note it, then ask via `AskUserQuestion` (options: "Push anyway" / "Stop — let me investigate").
   - This catches drift accumulated across everything `Done` since the last ship, regardless of
     how many epics that covers (CLAUDE.md §Epic close-out sequence step 4, SUG-100 S3). This is
     the one Chromatic check — there is no separate mid-epic path anymore; `/mini-release` retired.

3. **Push to origin** (single push for all accumulated commits)
   - Show: "This will push N commits to origin/main, triggering 1 Netlify deploy"
   - List the commits that will be pushed
   - Ask via `AskUserQuestion`:
     ```
     Question: "Push N commits to origin/main? This triggers 1 Netlify deploy."
     Options:
       - "Push it — trigger the deploy"
       - "Stop — let me review again"
     ```

4. **Verify deploy** (after push)
   - Wait 30 seconds, then check if the site is responding:
   ```bash
   curl -sI https://sugartown.io | head -5
   ```
   - Report the result

5. **Verify the CI run the push just triggered** (after push)
   - The push starts a CI run. Watch it to a conclusion — do not stop at "the deploy responded":
   ```bash
   gh run list --branch main --workflow CI --limit 1 --json databaseId,status,conclusion,headSha
   ```
   - If still `in_progress`, wait and re-check (a full run is ~5 min). If waiting isn't practical, say so explicitly and record the run ID as unresolved — never report it as green.
   - If it concludes `failure`, get the actual failing step before closing:
   ```bash
   gh run view <databaseId> --log-failed
   ```
   - Report the run ID and its conclusion in Phase 4.
   - **This is CLAUDE.md close-out step 1b's CI half** (SUG-100 S1) — the local `pnpm test:smoke`
     half already ran when each epic reached `Done`; this is what confirms it on the real pipeline.

   *Why this step exists:* until 2026-07-28, this check confirmed the Netlify deploy responded and never looked at the CI run the same push had triggered. Netlify deploys from a build that does not run the test suite, so a green site and a red pipeline coexist comfortably — and did, for 212 consecutive runs between 2026-05-10 and 2026-07-28, across six releases. The deploy check answers "is the site up". This one answers "did anything verify it". They are not the same question, and only one of them was being asked.

6. **Transition `Done` → `Shipped`** — only if step 5 concluded `success`
   - **If CI did not conclude `success`** (failed, or still unresolved): skip this step entirely.
     Every issue enumerated in Phase 1 **stays `Done`**. No un-`Done`, no ceremony — a red CI run
     is not a reason to touch the board (SUG-100 acceptance criterion, kill criterion §Kill
     criterion). Report this plainly in Phase 4 and stop here.
   - **If CI concluded `success`:** for every issue enumerated as `Done` in Phase 1 — not just the
     one that prompted this run — in this exact order:
     ```bash
     gh issue close {n}   # no-op if already closed
     gh project item-edit --id {item_id} \
       --project-id PVT_kwHODqg2Fc4BP7M2 \
       --field-id PVTSSF_lAHODqg2Fc4BP7M2zg-MUFI \
       --single-select-option-id 18ed7799   # Shipped
     ```
   - **Close before setting `Shipped`, never the other order.** The `Item closed` project
     automation sets `Status: Done` on close, so setting `Shipped` first is silently overwritten
     (SUG-100 G2). Proven live on #98, 2026-08-18: set, persisted 20s with no automation
     re-stamping it, reverted.
   - Report which issues transitioned in Phase 4.

7. **`--release`, if passed** — invoke `/release`, do not reimplement it
   - Only if **both** are true: this run was invoked with the `--release` flag (see
     `.claude/commands/ship.md`), **and** step 5's CI run concluded `success`. A red CI run skips
     this step exactly as it skips step 6 — do not cut a release on code CI hasn't verified. Report
     "`--release` passed but CI blocked it" in Phase 4 rather than proceeding anyway.
   - Read and follow `docs/workflows/release-assistant-prompt.md` in full — its own 5 gates apply
     unchanged. This promotes the **entire** `[Unreleased]` buffer into one versioned entry,
     covering every epic accumulated since the last release, not just what this ship pushed
     (SUG-100 S9, acceptance criterion: proven by cutting a release after 2+ epics accumulate).
   - Without `--release`: skip this step. Code is live; no version is cut. `[Unreleased]` keeps
     accumulating for the next release, whenever that runs.
   - **Do not push `/release`'s commit.** It ends at a local commit by design
     (`docs/workflows/release-assistant-prompt.md`, Gate 5) and ships with the next `/ship`.
     Report it as unpushed in Phase 4; that is a complete `--release` run.

Execute **one action at a time**. Wait for confirmation before each step.

**Hard rules:**
- Never `git push --force`
- Never skip the confirmation step before pushing
- If there are no commits to push and nothing is `Done`, say so and exit — nothing to do
- If the tree is already clean, up to date, and nothing is `Done`, report "Nothing to do" and exit

---

### PHASE 4 — CLOSING STATUS

```
Ship complete.

Branch: [current branch]
Commits pushed: [count or "none"]
Chromatic: [no changes / N changes (approved | overridden) / skipped — no visual surfaces / not run]
Netlify deploy: [triggered / not needed]
CI run: [run ID] — [success / failure (failing step) / still running at close]
Issues shipped (Done → Shipped): [list, or "none — CI did not conclude success" / "none — nothing was Done"]
Release: [--release not passed / version vX.Y.0 cut — commit local, ships with next /ship / --release passed but CI blocked it]
Uncommitted changes: [none / list]
Stashes: [none / list]
```

---

## Why this exists

Netlify charges 15 credits per production deploy against a 1,000/month allowance — deploys are
96% of all credit consumption (SUG-100 S9b, measured 2026-08-18). Pushing after every commit
wastes them. This command batches all accumulated work into one push.

**Consolidated under SUG-100 Phase 3b** from two commands that had drifted apart: `/eod` (this
file's origin — push, deploy, CI verification) and `/mini-release` (version bump, backlog
cleanup, tracker update — retired, its logic absorbed here and gated behind `--release`). Twelve
close-out steps had two commands between them before this; SUG-100 §A10 has the full accounting.

**The workflow:**
- `/morning` — open the day, check status, DO NOT push
- Work session — commit freely; a `post-commit` hook mirrors every commit to `origin` for free,
  so disk safety no longer depends on remembering to push (SUG-100 S13)
- `/ship` — whenever you want to ship, not on a schedule — push, verify, transition `Done` →
  `Shipped`
- `/ship --release` — the same, then cut a version covering everything since the last one;
  the version commit stays local and rides the next `/ship`, so a ship is always one deploy
