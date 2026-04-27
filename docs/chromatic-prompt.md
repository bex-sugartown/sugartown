# PROMPT — Sugartown Chromatic VRT Assistant
**Version:** v1 (2026-04-27)

Run this to execute a Chromatic visual regression test: build, diff report, human approval gate, status record.

---

## What this skill does

1. Runs `pnpm --filter storybook chromatic --exit-zero-on-changes` from the repo root
2. Parses the output into a structured diff report
3. Gates on human approval if visual changes are detected
4. Records the final status (approved / no changes / skipped / failed)

This is the VRT gate that lives between code changes and `origin/main`. It is advisory by default (no hard CI block) — the human approval is the enforcement mechanism.

---

## Invariants

- `--exit-zero-on-changes` is always passed. Visual changes are human-reviewed, not auto-failed.
- The skill never approves baselines on the human's behalf. It reports diffs and waits.
- If Chromatic is not configured or errors (missing token, network failure), the skill reports the error and exits — it does not silently skip.
- The skill does not push to `origin/main`. That is the `/eod` skill's responsibility.

---

## STEP 0 — PRE-FLIGHT

Check:

1. **Storybook workspace exists:**
   ```bash
   ls apps/storybook/package.json
   ```
   If missing, report: "No Storybook workspace found at `apps/storybook/`. Cannot run Chromatic." and exit.

2. **Working tree is not mid-conflict:**
   ```bash
   git status --short
   ```
   If merge conflict markers (`UU`, `AA`, `DD`) are present, report: "Working tree has unresolved conflicts. Resolve before running Chromatic." and exit.

3. **What changed since last Chromatic build** (informational, not blocking):
   ```bash
   git diff --name-only HEAD~1 HEAD -- '*.css' '*.jsx' '*.tsx' '*.stories.*'
   ```
   Report the count of CSS/component/story files changed. If zero, note: "No CSS or story changes detected since last commit — Chromatic run may be a no-op."

---

## STEP 1 — RUN CHROMATIC

```bash
pnpm --filter storybook chromatic --exit-zero-on-changes 2>&1
```

Capture full output. Expected runtime: 1–4 minutes depending on story count.

If the command is not found or exits with a non-zero code unrelated to visual changes (e.g. missing `CHROMATIC_PROJECT_TOKEN` env var), report the raw error and exit. Do not retry automatically.

---

## STEP 2 — PARSE OUTPUT

Extract from Chromatic output:

| Field | How to find it |
|-------|---------------|
| Build number | Line containing `Build #NNN` |
| Build URL | Line containing `https://www.chromatic.com/build?...` |
| Total stories | Line containing `N stories` |
| Visual changes | Line containing `N visual changes` (or `0 visual changes`) |
| New stories | Line containing `N new stories` (or `0 new stories`) |
| Errors | Any line containing `error`, `Error`, or `FAILED` |

---

## STEP 3 — REPORT

Present a structured summary:

```
━━━ CHROMATIC VRT REPORT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Build:          #NNN
  URL:            https://www.chromatic.com/build?...
  Stories tested: N
  Visual changes: N  ← 0 = green; >0 = review required
  New stories:    N  ← new baselines need first-time acceptance
  Errors:         N
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then branch:

**Case A — 0 visual changes, 0 new stories, 0 errors:**
```
✅ No visual regressions detected. No human action required.
```
Proceed (no gate).

**Case B — 0 visual changes, N new stories (first baselines):**
```
🆕 {N} new stories detected — these need first-time baseline acceptance.
   Open the Chromatic build URL above and click "Accept" on each new story.
   Reply "approved" when done, or "skip" to defer to /eod.
```
Wait for human reply before proceeding.

**Case C — N visual changes (regressions or intentional diffs):**
```
⚠️  {N} visual changes detected — review required before merging to main.
   Open the Chromatic build URL above.
   For each change: "Accept" if intentional, "Deny" if a regression.
   Reply "approved" when all changes are reviewed, or "skip" to defer.
```
Wait for human reply before proceeding.

**Case D — Errors:**
```
❌ Chromatic reported {N} errors. Raw output:
   {error lines}
   Investigate before proceeding.
```
Exit — do not gate on human approval for errors (the build itself is broken).

---

## STEP 4 — RECORD STATUS

After human replies (or if Case A with no action required), record the outcome:

```
━━━ CHROMATIC STATUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Result:   {✅ No changes | ✅ Approved | ⏸ Deferred | ❌ Error}
  Build:    #{N} — {url}
  Action:   {No action required | Baselines accepted | Changes approved | Deferred to /eod | Build error — see above}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If deferred, note: "Chromatic approval is still pending. Do not push to `origin/main` until baselines are accepted."

---

## Deferred mode (called from /mini-release)

When `/chromatic` is invoked from the `/mini-release` skill in Path B (cheap-path defer), the workflow is the same but the completion output should append:

```
Note: this Chromatic run covers all commits since the last push.
If multiple epics were batched, this is the consolidated VRT gate for all of them.
```

---

## Enforcement rules

- Never self-approve diffs. Human says "approved" — not the agent.
- Never skip the pre-flight check.
- If `CHROMATIC_PROJECT_TOKEN` is missing from the environment, report the exact error message and remind the human to check `.env` or shell profile. Do not try to inject the token.
- `--exit-zero-on-changes` is non-negotiable — do not remove it. Visual changes are decisions, not failures.
