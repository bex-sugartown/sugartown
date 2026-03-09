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

**Web app (Vite)** — is the dev server running?
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```
- `200` → running ✅
- anything else → not running. **Start it automatically** using `preview_start` with the `web` launch config. Report that it was down and has been restarted.

**Sanity Studio** — is the dev server running?
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/
```
- `200` → running ✅
- anything else → not running. **Start it automatically** using `preview_start` with the `studio` launch config. Report that it was down and has been restarted.

**Storybook** — is the dev server running?
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006/
```
- `200` → running ✅
- anything else → not running. **Start it automatically** using `preview_start` with the `storybook` launch config. Report that it was down and has been restarted.

All three dev servers are defined in `.claude/launch.json`. Use `preview_start` (not Bash) to start them — this ensures they are tracked and reusable across the session.

**Sanity Studio** — are there available package updates?
Check the installed `sanity` version in `apps/studio/package.json` and note it in the briefing. A full upgrade check can be done manually if needed.

**Vite caches** — are any stale?
```bash
# Check Storybook Vite dep cache age (stale caches cause "Failed to fetch dynamically imported module" errors)
if [ -d "node_modules/.cache/sb-vite" ]; then
  echo "storybook-cache: exists, last modified $(stat -f '%Sm' -t '%Y-%m-%d %H:%M' node_modules/.cache/sb-vite)"
else
  echo "storybook-cache: none"
fi

# Check web app Vite dep cache age
if [ -d "apps/web/node_modules/.vite" ]; then
  echo "web-cache: exists, last modified $(stat -f '%Sm' -t '%Y-%m-%d %H:%M' apps/web/node_modules/.vite)"
else
  echo "web-cache: none"
fi
```
- If a cache exists and is more than 24 hours old, flag it in the briefing and recommend clearing it.
- Stale Vite caches cause "Failed to fetch dynamically imported module" errors across multiple pages.
- Clear commands: `rm -rf node_modules/.cache/sb-vite` (Storybook), `rm -rf apps/web/node_modules/.vite` (web).

Do not take any action yet. Collect everything first.

---

### PHASE 2 — BUILD THE BRIEFING

Write a plain-English morning briefing using exactly this structure. Use plain language throughout — assume I am not reading git output directly.

---

#### 🗓 Morning Briefing — [today's date]

---

#### 🖥 Service Health

- **Web app** — running on :5173? If not, it was auto-started. Report the status.
- **Sanity Studio** — running on :3333? If not, it was auto-started. Report the status.
- **Storybook** — running on :6006? If not, it was auto-started. Report the status.
- **Sanity packages** — note the installed version from package.json.
- **Vite caches** — any stale caches? If a cache is >24h old, flag it and recommend clearing before starting work.

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
