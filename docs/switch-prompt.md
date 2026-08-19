# PROMPT — Sugartown Machine Switch

**Version:** v1 (2026-06-12)
**Run with:** Claude Code (project context required)
**When to use:** When moving between machines (desktop ⇄ laptop) — either arriving at a machine to pick up work, or handing off before you've run `/ship`.

---

## What this prompt does

Keeps the same Sugartown repo in sync across two machines. It is the mirror of `/ship`:

- `/ship` **closes** a machine — pushes accumulated commits to `origin/main` (one Netlify deploy).
- `/switch` **opens** the machine you're returning to, or hands off the one you're leaving mid-day.

It reads first, then executes with confirmation at each step. It never force-pushes, never discards uncommitted work, and stops cold on divergence rather than guessing.

---

## The one rule that governs everything

**Only what was pushed can be pulled.** A commit that lives only on the other machine — because that machine never ran `/ship` (or `/switch out`) — cannot be reached from here. There is no machine-to-machine link; the only shared point is `origin` on GitHub.

So the safe handoff order is always:

1. On the machine you're **leaving** — push (via `/ship`, or `/switch out` before you're ready to ship).
2. On the machine you're **arriving at** — pull (via `/switch`, default mode).

If you skip step 1, step 2 has nothing new to pull, and that work is stranded until you get back to the machine that holds it.

---

## Two modes

| You type | Mode | What it does |
|----------|------|--------------|
| `/switch` or `/switch in` | **ARRIVE** (default) | Fetch from origin, check for danger, then fast-forward your local `main` to whatever the other machine pushed. |
| `/switch out` or `/switch leave` | **LEAVE** | Push current work to a free `handoff/*` branch (no Netlify deploy) so the other machine can pick it up before you've run `/ship`. |

If the user types `/switch` with no argument, assume **ARRIVE** mode.

---

# MODE: ARRIVE (`/switch`, `/switch in`)

### PHASE 1 — READ EVERYTHING (no changes yet)

First, confirm the runtime environment:
```bash
pwd
```
- If `pwd` returns a path under `/Users/` (macOS home) → running locally ✅
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

**Sanity check for the user (plain English):** "This pulls only what the other machine pushed. The newest thing on origin is from [date]. If you did work on the other machine after that and didn't run `/ship` or `/switch out` there, it isn't here yet — go back and push it first."

Then classify the situation into exactly one of these and state which it is:

| Situation | Condition | Safe to auto-pull? |
|-----------|-----------|--------------------|
| ✅ **Clean fast-forward** | local clean, behind origin (N>0, M=0) | Yes — `git pull --ff-only` |
| ✅ **Already current** | local clean, N=0, M=0 | Nothing to do |
| ⚠️ **Uncommitted local changes** | working tree dirty | No — stash or commit first, then pull |
| 🚨 **Divergence** | M>0 **and** N>0 (both machines committed to `main`) | No — STOP, ask the user |
| 🟡 **Local-only ahead** | M>0, N=0 | No pull needed; flag that these commits were never pushed (last session here skipped `/ship`) |
| 🟢 **Handoff branch present** | an `origin/handoff/*` branch is ahead of `main` | Offer to merge it in (see Phase 3) |

---

### PHASE 3 — EXECUTE (with confirmation)

Do **one action at a time.** Show the exact command, say what it does in plain English, then ask via `AskUserQuestion`:

```
Question: "[plain-English description of the action] — go ahead?"
Options:
  - "Yes — do it"
  - "Skip this one"
  - "Stop — pause here"
```

After each, confirm what happened.

**✅ Clean fast-forward:**
```bash
git pull --ff-only origin main
```
`--ff-only` means it will only move your local `main` forward to match origin — it can never create a surprise merge commit. If it refuses, that means the histories have diverged: stop and treat it as the 🚨 case.
After pulling, report what arrived in plain English: `git diff --stat HEAD@{1} HEAD` (files touched), and call out anything notable (schema changes → remind to `npx sanity schema deploy`; `pnpm-lock.yaml` changed → remind to run `pnpm install`).

**⚠️ Uncommitted local changes (before any pull):**
- Ask via `AskUserQuestion`:
  ```
  Question: "You have uncommitted changes — stash them or commit them before pulling?"
  Options:
    - "Stash — park them, pull, then restore" (named: git stash push -m "switch: WIP on [machine] [date]")
    - "Commit — draft a wip(switch): message, then pull"
  ```
- Never discard changes. Never `git checkout -- .` or `git reset --hard` to clear the tree.

**🚨 Divergence (both machines have commits on `main`):**
- STOP. Do not pull, merge, or rebase automatically. Explain in plain English: "Both this machine and the other one added commits to `main` independently. They have to be reconciled deliberately."
- Show both sides: `git log --oneline origin/main..main` (yours here) and `git log --oneline main..origin/main` (theirs from origin).
- Ask via `AskUserQuestion`:
  ```
  Question: "How do you want to reconcile the divergence?"
  Options:
    - "Rebase mine on top of origin" (recommended if local commits aren't pushed anywhere — replays your commits, may surface conflicts)
    - "Merge the two histories" (creates a merge commit)
    - "Stop and inspect first" (do nothing yet)
  ```
- If conflicts appear during rebase/merge, resolve them with the user one file at a time; never abandon a conflicted state (per CLAUDE.md — no unresolved merge left at session end).

**🟡 Local-only ahead (commits here never pushed):**
- No pull needed. Flag it: "This machine has [M] commits that never reached origin — the last session here didn't run `/ship`." Recommend running `/ship`, or just noting it.

**🟢 Handoff branch present:**
- This is how a mid-day handoff is picked up. To bring a `handoff/*` branch's commits onto your local `main`:
  ```bash
  git checkout main
  git merge --ff-only origin/handoff/<name>
  ```
  `--ff-only` here confirms the handoff branch is simply `main` plus new commits (the expected shape). If it refuses, the branch has diverged — fall back to the 🚨 divergence handling.
- After a successful merge, ask via `AskUserQuestion` whether to delete the consumed handoff branch (free, no deploy):
  ```
  Question: "Merged. Delete the consumed branch handoff/<name>?"
  Options:
    - "Yes — delete it" (git push origin --delete handoff/<name>)
    - "Keep it for now"
  ```

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

Then ask via `AskUserQuestion`:

```
Question: "Want me to run /morning now to check dev servers and git health, or /restart to bring them up?"
Options:
  - "Run /morning"
  - "Run /restart"
  - "Neither — I'll do it myself"
```

---

# MODE: LEAVE — mid-day handoff (`/switch out`, `/switch leave`)

Use this when you want to move to the other machine **now**, before you're ready to ship, without triggering a Netlify deploy. Feature-branch pushes are free; only pushes to `main` cost credits. So work-in-progress rides out on a temporary `handoff/*` branch.

### PHASE 1 — ASSESS

```bash
pwd
git status
git branch --show-current
git rev-list --count origin/main..main 2>/dev/null || echo 0   # unpushed commits on main
```
Environment guard: same as ARRIVE — if `pwd` is not under `/Users/`, warn and stop.

### PHASE 2 — BRIEFING

State plainly:
- Current branch and how many commits are unpushed.
- Any uncommitted/untracked files (these need to be committed to travel — a branch only carries commits, not working-tree changes).
- The plan: "I'll commit your in-progress work, then push it to a free `handoff/*` branch. No Netlify deploy. On the other machine, `/switch` will find it and merge it onto `main`."
- Proposed branch name: `handoff/<this-machine>-<YYYY-MM-DD-HHMM>` (e.g. `handoff/desktop-2026-06-12-1530`). If the machine name isn't obvious, ask which machine this is (desktop / laptop) — free text, it's a short factual answer, not a decision. Then ask via `AskUserQuestion`:
  ```
  Question: "Use branch name handoff/<name>?"
  Options:
    - "Yes — use that name"
    - "I'll rename it" (human supplies the name)
  ```

### PHASE 3 — EXECUTE (with confirmation)

1. **Commit work-in-progress** (if the tree is dirty):
   - Draft a `wip(handoff): <short description>` message and show it.
   - If the tree is already clean, skip straight to step 2.

2. **Push to the handoff branch** (free — no deploy):
   - Show the plan: the commit message (if step 1 applies) plus "This pushes your current commits to `handoff/<name>`. It does NOT touch `main`, so no Netlify deploy and no credits."
   - Ask via `AskUserQuestion`:
     ```
     Question: "Commit and push to handoff/<name>?"
     Options:
       - "Yes — commit and push"
       - "Needs edits" (to the commit message)
       - "Stop — let me review again"
     ```
   - On confirmation: commit (if applicable), then `git push origin HEAD:handoff/<name>`.

3. **Confirm the handoff:**
   ```
   Handed off to: handoff/<name>
   Commits carried: [count]
   Netlify deploy: none (feature branch)

   On the other machine: run /switch — it'll find this branch and merge it onto main.
   Remember: this is a parking branch, not a release. Real shipping still happens via /ship → main.
   ```

**Hard rules for LEAVE:**
- Never push to `main` in this mode — the whole point is to avoid the deploy. Pushing `main` is `/ship`'s job.
- Never `git push --force`.
- A `handoff/*` branch is temporary scaffolding, not shipped work. It is deleted once the other machine consumes it (Phase 3 of ARRIVE). Don't let handoff branches accumulate — flag any older than a few days during `/morning` or `/switch`.

---

## Why this exists

The push-once-at-`/ship` model (one Netlify deploy per ship, whenever that runs — the observed interval is 1–14 days, not daily) is great for credits but means a machine's work is invisible to its sibling until that push happens. `/switch` closes that gap from both sides:

- **Handoff:** `/ship` on machine A → `/switch` on machine B. Clean fast-forward.
- **Mid-day handoff:** `/switch out` on machine A pushes a free `handoff/*` branch → `/switch` on machine B merges it. No credits spent, no work stranded.

**The full cross-machine loop:**
- `/switch` (in) — arrive at a machine, pull the latest pushed work
- `/morning` — check health, start the day
- Work — commit freely, never push
- `/switch out` *(only if moving machines before you've shipped)* — park WIP on a free branch
- `/ship` — push to `main` once, deploy
