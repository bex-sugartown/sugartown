# /cloud-launch

**Prepare one `cloud` issue for a cloud session and walk Bex through starting it.** Local
session only. The procedure the cloud session follows is `docs/workflows/cloud-execution.md`;
this command prepares everything around it (#144).

Takes an issue number. Without one, list open issues labelled `cloud` and not labelled
`handback-ready` (`gh issue list --label cloud --state open`), and ask which to launch with
`AskUserQuestion`, one option per issue, up to four.

## Step 1: start review

1. `gh issue view {n}`. Stop if it lacks the `cloud` label.
2. If it links a backlog doc as its canonical record, read that doc too.
3. If it has a `## Cloud prep` section, every "Before cloud" box must be ticked. Stop and name
   any that are not.
4. Confirm an objective, acceptance criteria (in the issue or the doc) and Visual. Visual yes
   is not a cloud issue: stop. Visual unstated on work that renders nothing counts as no.
5. Anything missing: ask in one `AskUserQuestion` batch, then stop.

## Step 2: starting branch

```bash
git fetch -q origin
git rev-list --count origin/main..main
```

- `0`: start from `main`.
- More than `0`: start from the newest `wip/<date>-main` whose tip equals local `HEAD`
  (`git ls-remote --heads origin 'wip/*-main'`). No match: stop and say the mirror is behind.
  Tell Bex nothing may be committed locally in this repo until the hand-back
  (`cloud-execution.md` §Starting branch).

## Step 3: fill the template

Fill `docs/workflows/cloud-task-template.md`. Add each guard block whose trigger fires. Print
the result in one fenced block, ready to copy.

## Step 4: In Progress

Set the issue's `Status` to `In Progress` (CLAUDE.md §Issue status has the command). Comment on
the issue: `Cloud run launched from {branch}, {date}.`

## Step 5: walk Bex through the launch

Write the steps as numbered text, one action per step, each saying what she should see. The
new-session screen was checked on 2026-09-24:

1. Open a new session in the Code tab. You should see an empty prompt box with buttons
   beneath it.
2. Click the branch button (it shows `main`) and choose `{branch}`. The button now shows
   `{branch}`.
3. Click **Local**, then **Cloud**, then **Sugartown**. The button now shows the cloud
   environment.
4. Paste the prompt and send it. The session starts cloning the repo.

Then ask with `AskUserQuestion`:

- "Started, it's cloning" → reply that `/handback {n}` finishes it once the issue carries
  `handback-ready`, and that `/morning` lists it.
- "The screen looks different" → ask for a screenshot; offer claude.ai/code in a browser as
  the second route.
- "Stop, don't launch" → return the issue to `Todo` and delete the launch comment.
