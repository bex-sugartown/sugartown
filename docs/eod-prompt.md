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

### PHASE 3 — EXECUTE (with confirmation)

After delivering the summary, propose actions in this order:

1. **Commit** any uncommitted changes (if any)
   - Draft a commit message and show it
   - Wait for confirmation

2. **Push to origin** (single push for all accumulated commits)
   - Show: "This will push N commits to origin/main, triggering 1 Netlify deploy"
   - List the commits that will be pushed
   - Wait for confirmation

3. **Verify deploy** (after push)
   - Wait 30 seconds, then check if the site is responding:
   ```bash
   curl -sI https://sugartown.io | head -5
   ```
   - Report the result

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
Netlify deploy: [triggered / not needed]
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
