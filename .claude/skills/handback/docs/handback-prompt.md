# /handback

**Finish a cloud run in a local session.** This is `docs/workflows/cloud-execution.md`
§Hand-back as one command (#144). Local session only.

Takes an issue number. Without one, list open issues labelled `handback-ready`
(`gh issue list --label handback-ready --state open`) and ask which with `AskUserQuestion`.

## Step 1: read the run

1. Read the issue's latest comment that starts `## Cloud run evidence` or names a
   `claude/*` or `wip/*` branch. That is the evidence comment. None: stop and say so.
2. Take the branch from it. `git fetch -q origin` and confirm `origin/<branch>` exists.
3. `git log --oneline main..origin/<branch>`. Empty: the work is already merged; skip to Step 5.
4. Local tree: nothing modified but the CI stats files. Otherwise stop and name the files.

## Step 2: automatic review

Run the `cloud-handback-reviewer` agent with the issue number and the branch. It returns a
table of Pass, Warn and Block rows.

- Any **Block**: show the table and ask with `AskUserQuestion`: "Merge anyway" / "Stop, I'll
  look" / "Send it back to cloud" (post the Block rows as an issue comment and stop).
- **Warn** only: show the rows and continue.

## Step 3: merge and check

1. Merge. A session started from `wip/<date>-main` fast-forwards (`git merge --ff-only`).
   Anything else: `git merge --no-ff origin/<branch> -m "Merge cloud branch for #{n} (<title>)"`.
2. `pnpm install --frozen-lockfile` if `pnpm-lock.yaml` changed.
3. Run, keeping the real output:

   | Always | When the diff touches |
   |---|---|
   | `pnpm lint`, `pnpm typecheck`, `pnpm test:smoke`, the issue's own commands | `apps/studio/schemas/`: `pnpm validate:schema-parity`. Drift means a schema deploy, which is the close-out's step 2, done from this committed `main` |
   | | `scripts/validate-liveness-probes.js` or any ESLint config: `pnpm validate:liveness-probes` |
   | | `*.stories.*`, CSS or component JSX: note that `/ship` runs Chromatic |

4. Revert build outputs (`apps/web/public/_redirects`, `apps/web/src/data/content-models.json`).
5. Any failure: stop, show it, and ask whether to fix locally or send it back.

## Step 4: close out

- **The issue links a backlog doc:** run CLAUDE.md §Epic close-out sequence steps 5c to 7 on it
  (tick Scope and criteria, write `## Close-out review` and `## Post-ship checks`, run
  `node scripts/check-epic-doc.js <doc> --stage close-out`, move it to `docs/shipped/`).
- **A bare issue:** the evidence comment in Step 5 carries the close-out.
- Either way, add one `[Unreleased]` line to `CHANGELOG.md` and commit.

## Step 5: close the issue

1. Comment the evidence: what merged, each check with its result, follow-ups, friction line,
   post-ship checks.
2. `gh issue close {n}`, then `gh issue edit {n} --remove-label handback-ready`.
3. Do not delete the cloud branch. `/ship` deletes cloud refs once they are in `origin/main`.

## Step 6: procedure notes

Read the evidence comment's "Cloud procedure notes" section.

- Missing: record it in the close-out as a finding.
- "None": nothing to do.
- Otherwise, for each note, check whether an open issue or a watch comment already holds it
  (`gh issue list --search "<key words>"`, and the watch items on #142). Ask with
  `AskUserQuestion`, one question per note: "File an issue" / "Add to an existing watch item"
  / "Skip". A note matching two earlier ones is a third strike under
  `../conventions/process-feedback-loop.md`: say so in the question.

## Step 7: report

Tell Bex, in plain terms: what merged, what the checks showed, what is now `Done`, and that
the next `/ship` pushes it and deletes the cloud branch.
