# PROMPT — Sugartown Morning Housekeeping
**Version:** v2 (2026-02-23)
**Run with:** Claude Code (project context required)
**When to use:** First thing in the morning, before starting new work

---

## What this prompt does

Runs a complete git health check on the Sugartown monorepo, then delivers a plain-English briefing: what state everything is in, what's unfinished, what needs action before starting new work, and what the recommended first moves are.

It reads. It does not commit, merge, delete, or push anything without explicit confirmation at each step.

---

## The Prompt (copy and paste into Claude Code)

---

Good morning. Please run the Sugartown morning housekeeping check. Here is what I need you to do:

### PHASE 1 — READ EVERYTHING (no changes yet)

Run the following and collect all output before doing anything else:

```bash
git status
git branch -a
git log --oneline -10
git stash list
git diff --stat HEAD
```

Then for every local branch that is NOT `main`, run:
```bash
git log main..<branch> --oneline
git log <branch>..main --oneline
```

Then check remote-only branches:
```bash
git fetch --dry-run
```

Then check the health of active local services:

**Storybook** — is the dev server running?
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006/
```
- `200` → running ✅
- anything else → not running. Report this in the briefing and offer to start it with `pnpm --filter storybook storybook`.

**Sanity Studio** — are there available package updates?
```bash
cd apps/studio && npx --yes sanity@latest upgrade --dry-run 2>&1 | head -30
```
- If updates are available, list them in the briefing.
- If already up to date, note that briefly.
- Do not run the upgrade; only check.

Do not take any action yet. Collect everything first.

---

### PHASE 2 — BUILD THE BRIEFING

Write a plain-English morning briefing using exactly this structure. Use plain language throughout — assume I am not reading git output directly.

---

#### 🗓 Morning Briefing — [today's date]

---

#### 🖥 Service Health

- **Storybook** — running on :6006? If not, say so clearly and offer to start it.
- **Sanity** — any packages out of date? List them if so; say "up to date" if not.

---

#### 📍 Where you are right now

- **Active branch:** what branch I'm on
- **Sync status:** is this branch up to date with its remote? Behind? Ahead?
- **Uncommitted changes:** list any modified or untracked files by name, one line each, with a plain description of what kind of file it is (e.g. "CHANGELOG.md — the project changelog, modified but not saved to git")

---

#### 🌿 Branch Map

For each branch (local and remote), one line:
- Branch name
- Whether it has been merged into `main` or not
- How many commits ahead of `main` it is (if any)
- One-sentence plain description of what the branch appears to be for, based on its name and commit messages
- Status tag: one of `✅ merged` / `⚠️ unmerged work` / `🔍 remote only` / `🗑 can probably be deleted`

---

#### ⚠️ Unfinished Business

List anything that needs attention before starting new work. Be specific. Use plain language.

Examples of things to flag:
- Files modified but not committed
- Untracked files that look like they belong in the repo (docs, scripts, config)
- Branches with commits that haven't reached `main`
- A branch I'm on that is behind `main` (I might be working on stale code)
- Stashed changes I may have forgotten about
- Remote branches with no local counterpart that have unmerged work

Do not flag things that are fine. Only flag things that need a decision or action.

If nothing needs attention, say so clearly.

---

#### ✅ Recommended Actions (in order)

List the specific actions recommended before starting new work today. Number them. For each:

1. **What to do** — one plain sentence
2. **Why** — one plain sentence
3. **The exact command or instruction** — ready to copy/paste or confirm

Use this priority order:
1. Commit or discard any uncommitted changes first
2. Merge or close any branches that are ready
3. Get onto the right branch for today's work
4. Pull any remote updates

If an action requires a judgment call (e.g. "should I delete this branch?"), ask me before acting — don't decide unilaterally.

---

#### 🔮 What I think today's starting point should be

Based on the branch map and the MEMORY.md context you have about this project:
- What branch should I be on when I start new work?
- Is there anything obviously next in the project's progression that I should pick up?
- Are there any blockers that would prevent starting new work cleanly?

Keep this section short — 3–5 sentences max. Do not invent work. Only suggest what is visible from the git state and project memory.

---

### PHASE 3 — EXECUTE (with confirmation)

After delivering the briefing, ask me:

> "Ready to execute the recommended actions? I'll walk through them one at a time and confirm each with you before running anything."

Then, when I say yes:
- Do **one action at a time**
- Show me the exact command before running it
- Tell me what it will do in plain English
- Wait for me to confirm ("yes", "go ahead", "skip", or "stop")
- After each action, briefly confirm what happened
- Do not batch actions together without asking

**Hard rules for execution:**
- Never `git push --force` under any circumstances
- Never `git reset --hard` without explicit confirmation and a clear warning that it is destructive
- Never delete a branch (local or remote) without showing me its last commit and asking explicitly
- Never merge into `main` without saying "this will merge X into main — are you sure?"
- Stash operations: always name the stash before creating it
- If anything looks ambiguous or risky, stop and ask

---

### PHASE 4 — CLOSING CONFIRMATION

After all actions are complete (or skipped), output a short closing status:

```
Morning housekeeping complete.

Branch: [current branch]
Uncommitted changes: [none / list]
Unmerged branches: [none / list]
Actions taken: [list or "none"]
Actions skipped: [list or "none"]

Ready to work. ✓
```

---

## Reference: Sugartown Branch Conventions

For context when interpreting branch names and states:

- `main` — stable, releasable. All completed work should land here.
- `integration/*` — staging branches for multi-stage feature work before merging to main
- `feat/*` / `fix/*` / `chore/*` / `docs/*` — conventional commit-style feature branches
- Auto-named branches (e.g. `distracted-hoover`, `upbeat-galileo`) — created by tools or AI agents; treat as temporary unless they have meaningful unmerged commits
- `migrate/*` — one-time migration branches; should be fully merged and deletable
- Remote-only branches with no local copy — check if they have unmerged work before ignoring

## Reference: Known Active Surfaces

- `apps/web` — React + Vite frontend
- `apps/studio` — Sanity Studio CMS
- `apps/storybook` — component library (active — dev server on :6006)
- `packages/design-system` — shared design tokens and components
- `CHANGELOG.md` and `RELEASE_NOTES.md` — release documentation at repo root
- `docs/` — internal project documentation (prompt files, strategy docs)
