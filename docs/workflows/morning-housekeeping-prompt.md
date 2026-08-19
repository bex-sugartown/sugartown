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

First, check the runtime environment:
```bash
pwd
```
- If `pwd` returns a path under `/Users/` (macOS home) → running locally ✅
- If `pwd` returns `/home/user/...` or any other path → **STOP and warn the user**: "This session is running in a cloud VM, not on your local machine. Files written here won't appear on your local filesystem. You may want to use the Claude CLI (`claude`) from your terminal instead."

Then collect git state:
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

Then check for **local-only branches** (committed but never pushed):
```bash
git branch -vv --no-merged main | grep -v '\[origin/'
```
Any branches listed here have commits that exist ONLY on this machine — flag them in the briefing as **critical unfinished business** and recommend pushing immediately.

Then check remote-only branches:
```bash
git fetch --dry-run
```

Then check whether this machine is **behind origin** (the cross-machine signal — work pushed from your other machine that you don't have yet):
```bash
git fetch origin --prune
git rev-list --count main..origin/main 2>/dev/null || echo 0   # commits on origin/main not on local main
git branch -r --list 'origin/handoff/*'                          # mid-day handoff branches waiting to be picked up
```
- If the behind-count is greater than 0, or any `origin/handoff/*` branch exists, this machine is almost certainly one you've **switched to** — the other machine pushed work you haven't pulled. Flag it prominently and recommend running `/switch` **before** starting any new work. Do not pull here; `/switch` handles the pull safely (it checks for divergence and uncommitted changes first).

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

**Contentful POC (Next.js)** — is the dev server running?
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```
- `200` → running ✅
- anything else → not running. **Start it automatically** using `preview_start` with the `contentful-poc` launch config. Report that it was down and has been restarted.

All four dev servers are defined in `.claude/launch.json`. Use `preview_start` (not Bash) to start them — this ensures they are tracked and reusable across the session.

**Sanity Studio** — are there available package updates?
Check the installed `sanity` version in `apps/studio/package.json` and note it in the briefing. A full upgrade check can be done manually if needed.

**Oldest `Done` item, not yet `Shipped`** (SUG-100 S4/G16 — the signal that replaced "does `Done`
empty every morning", which stopped being true at a 1–14 day ship interval):
```bash
gh api graphql -f query='
{
  user(login: "bex-sugartown") {
    projectV2(number: 1) {
      items(first: 100) {
        nodes {
          fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name updatedAt }
          }
          content { ... on Issue { number title } }
        }
      }
    }
  }
}' | python3 -c "
import json, sys
from datetime import datetime, timezone
nodes = json.load(sys.stdin)['data']['user']['projectV2']['items']['nodes']
done = [n for n in nodes if (n.get('fieldValueByName') or {}).get('name') == 'Done']
if not done:
    print('none — nothing waiting to ship')
else:
    done.sort(key=lambda n: n['fieldValueByName']['updatedAt'])
    oldest = done[0]
    age = datetime.now(timezone.utc) - datetime.fromisoformat(oldest['fieldValueByName']['updatedAt'].replace('Z', '+00:00'))
    print(f\"#{oldest['content']['number']} — {oldest['content']['title'][:50]} — {age.days}d {age.seconds//3600}h old ({len(done)} total in Done)\")
"
```
- `updatedAt` on the Status field value is the last time that field changed — for an item sitting
  in `Done`, that is the moment it entered `Done`, unless something else touched Status since
  (rare; Done → Shipped is the only expected exit). One number, unambiguous: it should rise across
  a gap and reset to near-zero right after `/ship` runs. If it is rising for more than ~14 days,
  the observed ship interval, something is stuck rather than just waiting its turn.

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
- **Contentful POC** — running on :3000? If not, it was auto-started. Report the status.
- **Sanity packages** — note the installed version from package.json.
- **Vite caches** — any stale caches? If a cache is >24h old, flag it and recommend clearing before starting work.

---

#### 🔀 Machine Switch Check

- Is local `main` **behind** `origin/main`? If yes, say so plainly: "It looks like you switched machines — your other machine pushed [N] commits you don't have yet." Recommend running `/switch` **first**, before any other recommended action, and note that `/switch` will pull safely.
- Are there any `origin/handoff/*` branches waiting? If yes, name them — these are mid-day handoffs from the other machine; `/switch` will merge them onto `main`.
- If local `main` is current with origin and there are no handoff branches, say "No switch needed — this machine is current."

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
- Status tag: one of `✅ merged` / `⚠️ unmerged work` / `🔍 remote only` / `🗑 can probably be deleted` / `🚨 local only — never pushed`

---

#### ⚠️ Unfinished Business

List anything that needs attention before starting new work. Be specific. Use plain language.

Examples of things to flag:
- **Local-only branches with no upstream** — these exist only on this machine and will be lost if the machine has issues. Flag as critical and recommend immediate push.
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
1. If behind origin or a handoff branch is waiting (see Machine Switch Check), run `/switch` first — it pulls the other machine's work safely before anything else
2. Commit or discard any uncommitted changes
3. Merge or close any branches that are ready
4. Get onto the right branch for today's work
5. Pull any remaining remote updates (only if `/switch` wasn't needed)

If an action requires a judgment call (e.g. "should I delete this branch?"), ask me before acting — don't decide unilaterally.

---

#### 📋 Linear Status

Check the Linear backlog for the Sugartown team using the Linear MCP tools:
- **In Progress issues** — list any issues currently in progress (should match the branch you're on)
- **High-priority Backlog items** — list the top 3 highest-priority issues not yet started
- **Blocked issues** — flag any issues with blocking dependencies that are now resolvable
- **Stale issues** — flag any issues marked In Progress that have no recent git activity

If Linear MCP tools are not available, skip this section and note it was skipped.

---

#### 🔮 What I think today's starting point should be

Based on the branch map, Linear backlog, and the MEMORY.md context you have about this project:
- What branch should I be on when I start new work?
- Is there anything obviously next in the project's progression that I should pick up?
- Are there any blockers that would prevent starting new work cleanly?
- Does the Linear backlog suggest a different priority than what the git state shows?

Keep this section short — 3–5 sentences max. Do not invent work. Only suggest what is visible from the git state, Linear backlog, and project memory.

---

#### 💰 Deploy Budget Check

Check how many commits are ahead of origin:
```bash
git rev-list --count origin/main..main 2>/dev/null || echo 0
```

If commits are ahead, note them but **do not push**. Pushing triggers a Netlify deploy (costs credits). Pushes should be batched and done via `/ship`, whenever that next runs — not on a daily schedule.

If the tree has unpushed commits from a previous session, flag it as unfinished business — the previous session didn't run `/ship`.

---

### PHASE 3 — EXECUTE (with confirmation)

After delivering the briefing, AI asks via `AskUserQuestion`:

```
Question: "Ready to execute the recommended actions?"
Options:
  - "Yes — walk me through them one at a time"
  - "Not now — I'll review manually"
  - "Skip — nothing needs action"
```

On "Yes — walk me through them one at a time":
- Do **one action at a time**
- Show me the exact command before running it
- Tell me what it will do in plain English
- Ask via `AskUserQuestion`:
  ```
  Question: "[plain-English description of the action] — go ahead?"
  Options:
    - "Yes — do it"
    - "Skip this one"
    - "Stop — pause here"
  ```
- After each action, briefly confirm what happened
- Do not batch actions together without asking

**Hard rules for execution:**
- Never `git push --force` under any circumstances
- `git reset --hard`, branch deletion (local or remote), and merges into `main` each require their own confirmation — show the specific detail (last commit for a deletion, the branch name for a merge, an explicit destructive-action warning for `reset --hard`), then ask via `AskUserQuestion`:
  ```
  Question: "[specific destructive action, e.g. 'Delete branch feat/foo — last commit: abc123 fix something'] — confirm?"
  Options:
    - "Yes — proceed"
    - "Stop — let me review again"
  ```
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
