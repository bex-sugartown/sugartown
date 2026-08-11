# PROMPT — Sugartown End-of-Day Wrap-Up
**Version:** v1 (2026-03-21)
**Run with:** Claude Code (project context required)
**When to use:** End of work session, before closing Claude Code

---

## What this prompt does

Wraps up the day's work: ensures everything is committed, pushes once to trigger a single Netlify deploy, and confirms the deploy succeeds. Designed to minimize Netlify build credits by batching all pushes into one.

It reads first, then executes with confirmation at each step.

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

Do not take any action yet. Collect everything first.

---

### PHASE 2 — EOD BRIEFING

Write a short end-of-day summary using this structure:

---

#### End-of-Day Summary — [today's date]

---

#### Uncommitted Work

- List any modified or untracked files that should be committed
- If there are uncommitted changes, recommend a commit message based on the changes
- If the tree is clean, say so

---

#### Unpushed Commits

- How many commits are ahead of `origin/main`?
- List them (oneline format)
- Note: pushing will trigger a Netlify deploy (~15 credits)

---

#### Stashed Work

- List any stashes that exist
- Flag any that look like they might be forgotten WIP

---

#### Branches Ahead of main (stranded work)

- List any feature branch with commits not on `main`
- For each: SUG-ID, commit count, last commit date, last commit subject
- For each, ask via `AskUserQuestion`:
  ```
  Question: "Branch [name] (SUG-ID, N commits, last: [date] [subject]) — what should happen to it?"
  Options:
    - "Merge today"
    - "Hold" (human states why; AI notes the reason)
    - "Abandon"
  ```
- A branch pushed to `origin/<branch>` but never merged to `main` is NOT shipped. Do not let `/eod` close with stranded branches unaccounted for.

---

### PHASE 3 — EXECUTE (with confirmation)

After delivering the summary, propose actions in this order:

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
   - This catches drift accumulated across mid-session mini-releases that skipped their own Chromatic check.

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
   - If it concludes `failure`, get the actual failing step before closing the day:
   ```bash
   gh run view <databaseId> --log-failed
   ```
   - Report the run ID and its conclusion in Phase 4. **A run ID is the artifact; "CI is green" is not.**

   *Why this step exists:* until 2026-07-28, `/eod` confirmed the Netlify deploy responded and never looked at the CI run the same push had triggered. Netlify deploys from a build that does not run the test suite, so a green site and a red pipeline coexist comfortably — and did, for 212 consecutive runs between 2026-05-10 and 2026-07-28, across six releases. The deploy check answers "is the site up". This one answers "did anything verify it". They are not the same question, and only one of them was being asked.

6. **Read the warn-gate annotations, then report the re-arm streak** (after step 5)

   Two gates are warn-only — `validate:doc-budget` (CTL-025) and `validate:epic-docs` (CTL-024). They run in CI, and when one fails the run still concludes `success`. So step 5 above reports green, and `ci-failure-alert.yml` never fires: it triggers only on `conclusion == 'failure'` (`ci-failure-alert.yml:32`). The annotation emitted by `ci.yml`'s `Warn-gate annotation — …` steps is the **only** artifact that either gate fired, and this step is its only reader.

   Read it on **every** concluded run, green or red. A green-only filter is blind exactly when CI is red.

   ```bash
   RUN=<databaseId from step 5>
   for JOB in $(gh api repos/:owner/:repo/actions/runs/$RUN/jobs --jq '.jobs[].id'); do
     gh api --paginate repos/:owner/:repo/check-runs/$JOB/annotations \
       --jq '.[] | select(.annotation_level=="failure" or ((.title // "") | contains("WARN-GATE"))) | "\(.title // "(untitled)") — \(.message)"'
   done
   ```

   Three things this command gets right, each of which was wrong in an earlier draft:
   - **Iterate every job.** The warn steps sit in the third job the API returns (order: Chromatic, Enforcement liveness, then `ci`). A reader that looks at `.jobs[0]` sees nothing, always.
   - **`--paginate`.** Annotations default to 30 per job, and ESLint already contributes several per run ahead of the warn steps.
   - **`annotation_level == "failure"` is the primary filter**, not the title. A failure-level annotation on a run that concluded `success` is a combination only a `continue-on-error` step can produce. `WARN-GATE` only *names* which gate, so a dropped or renamed title degrades to "a warn gate fired, name unknown" rather than to silence.

   If a warn gate fired, say which one, and say plainly that `main` carries the breach — the run is green and nothing else will tell you.

   Then report the validator-freeze streak (CTL-040). New `validate:*` gates are frozen until **5** consecutive green runs on `main`:

   ```bash
   gh run list --branch main --workflow CI --limit 40 --json databaseId,conclusion,status
   ```

   Count leading `success` entries, stopping at the first non-`success`. An in-flight run (`conclusion: null`) is neither green nor skippable — wait for it. The count is of *runs*, not commits: a `[skip ci]` commit produces no run at all.

Execute **one action at a time**. Wait for confirmation before each step.

**Hard rules:**
- Never `git push --force`
- Never skip the confirmation step before pushing
- If there are no commits to push, say so and skip the push step
- If the tree is already clean and up to date, report "Nothing to do" and exit

---

### PHASE 4 — CLOSING STATUS

```
End-of-day wrap-up complete.

Branch: [current branch]
Commits pushed: [count or "none"]
Chromatic: [no changes / N changes (approved | overridden) / skipped — no visual surfaces / not run]
Netlify deploy: [triggered / not needed]
CI run: [run ID] — [success / failure (failing step) / still running at close]
Warn gates fired: [none / CTL-0NN name(s) — green run, breach is on main]
Green streak on main: [N]/5 — validator freeze [holds / lifted] (CTL-040)
Uncommitted changes: [none / list]
Stashes: [none / list]

See you tomorrow.
```

---

## Why this exists

Netlify charges ~15 credits per production deploy. Pushing after every commit during a session wastes credits. This skill batches all pushes into a single end-of-day deploy.

**The workflow:**
- `/morning` — open the day, check status, DO NOT push
- Work session — commit freely, never push
- `/eod` — push once, verify deploy, close the day
