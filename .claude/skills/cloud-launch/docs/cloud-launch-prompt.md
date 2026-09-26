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

Fill `docs/workflows/cloud-task-template.md`. Add each guard block whose trigger fires.

## Step 4: hand Bex the prompt, then stop

**This turn holds the prompt and the steps, and nothing else.** No `AskUserQuestion`, no status
change: a prompt written beside a question box went unseen on the #91 launch (2026-09-26).

1. Say in one line that pasting the prompt into a cloud session is Bex's step, since no session
   can type into another.
2. Print the prompt in one fenced block, ready to copy.
3. Write the launch steps, one action per step, each saying what she should see. The
   new-session screen was checked on 2026-09-24:
   1. Open a new session in the Code tab. You should see an empty prompt box with buttons
      beneath it.
   2. Click the branch button (it shows `main`) and choose `{branch}`. The button now shows
      `{branch}`.
   3. Click **Local**, then **Cloud**, then **Sugartown**. The button now shows the cloud
      environment.
   4. Paste the prompt and send it. The session starts cloning the repo.
   If the screen looks different, she can use claude.ai/code in a browser instead.
4. End with: **Your next step:** paste the prompt, then tell me "started", or "stop" to cancel.

End the turn there.

## Step 5: after Bex replies

- **"Started"**: set the issue's `Status` to `In Progress` (CLAUDE.md §Issue status has the
  command) and comment on the issue: `Cloud run launched from {branch}, {date}.` Then Step 6.
- **"Stop"**: change nothing. The issue keeps its status.
- **The screen looks different**: ask for a screenshot and adjust the steps.

## Step 6: next-step note

Write it in the session and as a comment on the issue, one action and when:

> **Your next step:** wait for the cloud session to finish. You will see its evidence comment
> on #{n} and a `handback-ready` label, and `/morning` lists it. Then say "hand back {n}" in a
> local session.
