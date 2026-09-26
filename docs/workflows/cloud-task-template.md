# Cloud task template

**The launch prompt for a cloud session.** `/cloud-launch <n>` fills it; nobody writes a launch
prompt by hand (#144). Every rule a cloud session needs lives in `cloud-execution.md`; this
template only names the issue, the branch, the checks and the guards that apply.

## Placeholders

| Placeholder | Filled from |
|---|---|
| `{n}`, `{title}` | the issue |
| `{branch}` | §Starting branch in `cloud-execution.md` |
| `{criteria}` | the issue body, or the backlog doc it links as its canonical record |
| `{verify}` | the commands named in the acceptance criteria, plus `pnpm lint` and `pnpm typecheck` |
| `{guards}` | the guard blocks below that apply, or nothing |

## Template

```
Execute issue #{n} in bex-sugartown/sugartown ({title}).

This is a cloud session started from {branch}. Before anything else, read
docs/workflows/cloud-execution.md and follow it exactly.

- The local session handles the board. Do not touch it.
- Acceptance criteria: {criteria}.
- Verify with real output: {verify}.
{guards}
Finish exactly as §Finish says: commit, push your session branch, no pull request, one
evidence comment with a "Cloud procedure notes" section ("None" is valid), then add the
handback-ready label. Do not close the issue.
```

## Guard blocks

Add a block when its trigger fires. `/cloud-launch` checks each trigger against the issue body
and the linked backlog doc.

| Trigger | Block |
|---|---|
| The work touches `apps/studio/schemas/` | `- Schema guard: follow cloud-execution.md §Verify step 3. A schema change you cannot prove empty is left for a local session.` |
| The work touches `*.stories.*` | `- Stories: fixes must not change what any story renders (no changed args, markup or styles). List a finding that needs a render change instead of fixing it.` |
| The fix count is unmeasured | `- Measure first: record the real count, per file, before fixing anything.` |
