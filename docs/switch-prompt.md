# PROMPT — Sugartown Machine Switch

**Version:** v1 (2026-06-12)
**Run with:** Claude Code (project context required)
**When to use:** When moving between machines (desktop ⇄ laptop) — either arriving at a machine to pick up work, or handing off mid-day before you've run `/eod`.

---

## What this prompt does

Keeps the same Sugartown repo in sync across two machines. It is the mirror of `/eod`:

- `/eod` **closes** a machine — pushes the day's commits to `origin/main` (one Netlify deploy).
- `/switch` **opens** the machine you're returning to, or hands off the one you're leaving mid-day.

It reads first, then executes with confirmation at each step. It never force-pushes, never discards uncommitted work, and stops cold on divergence rather than guessing.

---

## The one rule that governs everything

**Only what was pushed can be pulled.** A commit that lives only on the other machine — because that machine never ran `/eod` (or `/switch out`) — cannot be reached from here. There is no machine-to-machine link; the only shared point is `origin` on GitHub.

So the safe handoff order is always:

1. On the machine you're **leaving** — push (via `/eod` at day's end, or `/switch out` mid-day).
2. On the machine you're **arriving at** — pull (via `/switch`, default mode).

If you skip step 1, step 2 has nothing new to pull, and that day's work is stranded until you get back to the machine that holds it.

---

## Two modes

| You type | Mode | What it does |
|----------|------|--------------|
| `/switch` or `/switch in` | **ARRIVE** (default) | Fetch from origin, check for danger, then fast-forward your local `main` to whatever the other machine pushed. |
| `/switch out` or `/switch leave` | **LEAVE (mid-day)** | Push current work to a free `handoff/*` branch (no Netlify deploy) so the other machine can pick it up before you've run `/eod`. |

If the user types `/switch` with no argument, assume **ARRIVE** mode.

---

# MODE: ARRIVE (`/switch`, `/switch in`)

### PHASE 1 — READ EVERYTHING (no changes yet)

First, confirm the runtime environment:
```bash
pwd
```
- If `pwd` returns `/Users/beckyalice/...` → running locally ✅
- Otherwise → **STOP and warn the user**: this session is a cloud VM, not the local machine. Pulling here will not update the local filesystem. Recommend running `claude` from the local terminal instead.

Then fetch and assess (fetch only updates remote-tracking refs — it changes nothing in the working tree):
```bash
git fetch origin --prune
git status
git rev-list --count main..origin/main 2>/dev/null || echo 0   # commits waiting on origin (what you'd pull IN)
git rev-list --count origin/main..main 2>/dev/null || echo 0   # local commits NOT on origin (you'd pull these only via the other machine)
git log -1 --format='%h %cd %s' --date=local origin/main         # newest commit on origin — sanity-check the other machine pushed it
git stash list
git branch -r --list 'origin/handoff/*'                          # any mid-day handoff branches waiting?
```

Collect all output before doing anything. Do not pull yet.

---

### PHASE 2 — BUILD THE BRIEFING

Write a short, plain-English briefing. Assume the user is not reading git output directly.

---

#### 🔀 Machine Switch — [today's date]

**Arriving at:** [repo path from `pwd`]

**Waiting on origin:** [N] commits since [date of newest origin/main commit].
- If N > 0, list them one line each (oneline format), with a one-phrase plain description of each.
- If N = 0, say: "Nothing new on origin — this machine already has the latest pushed work."

**This machine's local state:**
- Clean, or [list uncommitted/untracked files by name with a plain description each]
- [M] local commits that are not on origin (if M > 0 — see divergence below)

**Handoff branches:** [list any `origin/handoff/*` branches with their newest commit date, or "none"]

**Sanity check for the user (plain English):** "This pulls only what the other machine pushed. The newest thing on origin is from [date]. If you did work on the other machine after that and didn't run `/eod` or `/switch out` there, it isn't here yet — go back and push it first."

Then classify the situation into exactly one of these and state which it is:

| Situation | Condition | Safe to auto-pull? |
|-----------|-----------|--------------------|
| ✅ **Clean fast-forward** | local clean, behind origin (N>0, M=0) | Yes — `git pull --ff-only` |
| ✅ **Already current** | local clean, N=0, M=0 | Nothing to do |
| ⚠️ **Uncommitted local changes** | working tree dirty | No — stash or commit first, then pull |
| 🚨 **Divergence** | M>0 **and** N>0 (both machines committed to `main`) | No — STOP, ask the user |
| 🟡 **Local-only ahead** | M>0, N=0 | No pull needed; flag that these commits were never pushed (last session here skipped `/eod`) |
| 🟢 **Handoff branch present** | an `origin/handoff/*` branch is ahead of `main` | Offer to merge it in (see Phase 3) |

---

### PHASE 3 — EXECUTE (with confirmation)

Do **one action at a time.** Show the exact command, say what it does in plain English, wait for "yes / go / skip / stop." After each, confirm what happened.

**✅ Clean fast-forward:**
```bash
git pull --ff-only origin main
```
`--ff-only` means it will only move your local `main` forward to match origin — it can never create a surprise merge commit. If it refuses, that means the histories have diverged: stop and treat it as the 🚨 case.
After pulling, report what arrived in plain English: `git diff --stat HEAD@{1} HEAD` (files touched), and call out anything notable (schema changes → remind to `npx sanity schema deploy`; `pnpm-lock.yaml` changed → remind to run `pnpm install`).

**⚠️ Uncommitted local changes (before any pull):**
- Offer two paths and let the user choose:
  - **Stash** (named): `git stash push -m "switch: WIP on [machine] [date]"` — then pull, then `git stash pop`.
  - **Commit**: draft a `wip(switch):` message, show it, commit, then pull.
- Never discard changes. Never `git checkout -- .` or `git reset --hard` to clear the tree.

**🚨 Divergence (both machines have commits on `main`):**
- STOP. Do not pull, merge, or rebase automatically. Explain in plain English: "Both this machine and the other one added commits to `main` independently. They have to be reconciled deliberately."
- Show both sides: `git log --oneline origin/main..main` (yours here) and `git log --oneline main..origin/main` (theirs from origin).
- Offer options and wait for an explicit choice:
  1. **Rebase your local commits on top of origin** (clean history, recommended if your local commits aren't pushed anywhere): `git pull --rebase origin main` — warn that it replays your commits and may surface conflicts to resolve.
  2. **Merge** the two histories: `git pull --no-rebase origin main` — creates a merge commit.
  3. **Stop and inspect** — do nothing, let the user look first.
- If conflicts appear during rebase/merge, resolve them with the user one file at a time; never abandon a conflicted state (per CLAUDE.md — no unresolved merge left at session end).

**🟡 Local-only ahead (commits here never pushed):**
- No pull needed. Flag it: "This machine has [M] commits that never reached origin — the last session here didn't run `/eod`." Recommend running `/eod` (if it's end of day) or just noting it.

**🟢 Handoff branch present:**
- This is how a mid-day handoff is picked up. To bring a `handoff/*` branch's commits onto your local `main`:
  ```bash
  git checkout main
  git merge --ff-only origin/handoff/<name>
  ```
  `--ff-only` here confirms the handoff branch is simply `main` plus new commits (the expected shape). If it refuses, the branch has diverged — fall back to the 🚨 divergence handling.
- After a successful merge, offer to delete the consumed handoff branch (free, no deploy): `git push origin --delete handoff/<name>`. Confirm before deleting.

**Hard rules for ARRIVE:**
- Default pull is `--ff-only` — never a silent merge or rebase.
- Never `git push --force` anything.
- Never discard or overwrite uncommitted work without explicit confirmation.
- Stash operations are always named.
- On divergence, stop and ask — never auto-resolve.

---

### PHASE 4 — CLOSING + HAND OFF TO MORNING

Output a short status block:
```
Machine switch complete (ARRIVE).

Pulled: [N commits / nothing]
Local state: [clean / list]
Handoff branches consumed: [name / none]
Unresolved: [none / describe]

You're in sync. Run /morning next to check service health and start the day.
```

Then offer: "Want me to run `/morning` now to check dev servers and git health, or `/restart` to bring the dev servers up?"

---

# MODE: LEAVE — mid-day handoff (`/switch out`, `/switch leave`)

Use this when you want to move to the other machine **now**, before end of day, without triggering a Netlify deploy. Feature-branch pushes are free; only pushes to `main` cost credits. So mid-day work rides out on a temporary `handoff/*` branch.

### PHASE 1 — ASSESS

```bash
pwd
git status
git branch --show-current
git rev-list --count origin/main..main 2>/dev/null || echo 0   # unpushed commits on main
```
Environment guard: same as ARRIVE — if not a local `/Users/beckyalice/...` path, warn and stop.

### PHASE 2 — BRIEFING

State plainly:
- Current branch and how many commits are unpushed.
- Any uncommitted/untracked files (these need to be committed to travel — a branch only carries commits, not working-tree changes).
- The plan: "I'll commit your in-progress work, then push it to a free `handoff/*` branch. No Netlify deploy. On the other machine, `/switch` will find it and merge it onto `main`."
- Proposed branch name: `handoff/<this-machine>-<YYYY-MM-DD-HHMM>` (e.g. `handoff/desktop-2026-06-12-1530`). Ask the user to confirm or rename. If the machine name isn't obvious, ask which machine this is (desktop / laptop).

### PHASE 3 — EXECUTE (with confirmation)

1. **Commit work-in-progress** (if the tree is dirty):
   - Draft a `wip(handoff): <short description>` message, show it, wait for confirmation, then commit.
   - If the tree is already clean, skip.

2. **Push to the handoff branch** (free — no deploy):
   ```bash
   git push origin HEAD:handoff/<name>
   ```
   Confirm in plain English: "This pushes your current commits to `handoff/<name>`. It does NOT touch `main`, so no Netlify deploy and no credits. `main` on origin is unchanged."

3. **Confirm the handoff:**
   ```
   Handed off to: handoff/<name>
   Commits carried: [count]
   Netlify deploy: none (feature branch)

   On the other machine: run /switch — it'll find this branch and merge it onto main.
   Remember: this is a parking branch, not a release. Real shipping still happens via /eod → main.
   ```

**Hard rules for LEAVE:**
- Never push to `main` in this mode — the whole point is to avoid the deploy. Pushing `main` is `/eod`'s job.
- Never `git push --force`.
- A `handoff/*` branch is temporary scaffolding, not shipped work. It is deleted once the other machine consumes it (Phase 3 of ARRIVE). Don't let handoff branches accumulate — flag any older than a few days during `/morning` or `/switch`.

---

## Why this exists

The push-once-at-`/eod` model (one Netlify deploy per day) is great for credits but means a machine's work is invisible to its sibling until that push happens. `/switch` closes that gap from both sides:

- **End-of-day handoff:** `/eod` on machine A → `/switch` on machine B. Clean fast-forward.
- **Mid-day handoff:** `/switch out` on machine A pushes a free `handoff/*` branch → `/switch` on machine B merges it. No credits spent, no work stranded.

**The full cross-machine loop:**
- `/switch` (in) — arrive at a machine, pull the latest pushed work
- `/morning` — check health, start the day
- Work — commit freely, never push
- `/switch out` *(only if moving machines before EOD)* — park WIP on a free branch
- `/eod` — push to `main` once, deploy, close the day
