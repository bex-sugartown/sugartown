# Cloud execution

**How a cloud session executes an issue labelled `cloud`.** A local session ignores this file,
except for §Hand-back, which is its job. Drafted 2026-09-24; facts about the cloud environment
are from `code.claude.com/docs/en/cloud-environments.md`, read the same day.

## Scope

Only issues carrying the `cloud` label. For any other issue, stop and say so.

A `cloud` issue is one whose work a command can verify: lint, typecheck, a validator, a unit
test, a build. Anything that renders something new (Visual: yes) is not a cloud issue, even if
labelled. Stop and comment.

## What a cloud session does not have

| Missing | Do this instead |
|---|---|
| `SUGARTOWN_DEV/CLAUDE.md` and the shared `conventions/` files (parent directory, never cloned) | Follow §Rules carried over below |
| The Sugartown MCP server (`sugartown_get_epic` and the rest) | Read `docs/backlog/` and `CHANGELOG.md` directly |
| `docs/drafts/` (gitignored) | If the issue needs a draft, stop and comment |
| Sanity writes | Never write. Propose under the Content Write Gate in an issue comment |
| A browser | No visual verification. Visual work is out of scope (§Scope) |
| Pushing any branch but the session's own | Push only the session branch. `main` is `/ship`'s job |
| The GitHub project board (the GraphQL API is blocked) | Do not set `Status`. §Before starting says who does |
| The `gh` CLI (not installed) | Use the GitHub MCP tools to read issues and post comments |

**The post-commit hook's wip mirror works in cloud.** It pushes `wip/<date>-<session branch>` to
origin (seen on the first run, #85). §Hand-back deletes it.

## Environment, one-time setup

Issues whose checks read Sanity (validators, the build, prerendering) need the cloud
environment to reach it. Set once, by Bex, on the environment the sessions use:

| Setting | Value |
|---|---|
| Environment variables | `VITE_SANITY_PROJECT_ID=poalmzla`, `VITE_SANITY_DATASET=production`, `VITE_SANITY_API_VERSION=2025-02-02` (the same values `ci.yml` sets; none is secret) |
| Network access | Custom, adding `poalmzla.api.sanity.io` and `poalmzla.apicdn.sanity.io` to the default allowlist |

No token. The dataset is public-read. Never add a write token to a cloud environment.

## Rules carried over

These live in the parent `conventions/` folder, which cloud never sees:

- **No em dashes** in anything written for Bex: comments, commit messages, issue text, replies.
- **Session-facing text** follows `docs/conventions/instruction-writing-style.md` (repo copy).
- **Steps written for Bex to follow** get one action per numbered step, say what she should see
  after each, name the menu before the shortcut, and never send her to a terminal when a
  click-path exists. Banned: "just", "simply", "obviously", "all you need to do is", "quick".

## Before starting

1. **Run `pnpm install --frozen-lockfile`.** A cloud session starts with no `node_modules`.
2. **Do not check or change the board.** Bex or a local session sets `In Progress` before
   launching.
3. **Read the issue body, including any `## Cloud prep` section.** Every box under
   "Before cloud" must be ticked. If one is not, stop and comment which.
4. **Run the start review** (CLAUDE.md §Issue status = workflow stage): objective, acceptance
   criteria, Visual yes or no. Acceptance criteria may live in the backlog doc the issue links
   as its canonical record; read it. If Visual is not stated and the work renders nothing
   (config, scripts, validators, tests), treat it as Visual: no and say so in the evidence
   comment. Anything else missing: stop and comment.

## Gates

Tier 1 gates still apply. In cloud, a gate never blocks the rest of the issue:

| Gate | In cloud |
|---|---|
| Instruction & Rule File Write Gate (any rule-defining file) | Leave the file unchanged. Post the exact diff as an issue comment. Finish the rest |
| Content Write Gate | Post the before/after table as an issue comment. Write nothing |
| Phase 0 visual spec gate | Out of scope. Stop |

## Verify

1. Run every command named in the issue's acceptance criteria.
2. Run `pnpm lint` and `pnpm typecheck` for each package touched, where the package has the script (Studio has neither until #85 and #22 land).
3. Keep the real output. A summary is not evidence.

## Finish

1. **Commit** with a scoped message that names the issue: `fix(studio): add lint script (#85)`.
2. **Push the session branch.** Do not open a pull request (a PR to `main` runs the full CI
   workflow, including Chromatic snapshots, which spend budget).
3. **Comment on the issue** with the GitHub MCP tool, one comment, containing:
   - the branch name
   - what changed, one line per file or group
   - each verification command with its real output
   - anything left for a local session or for Bex, including any diffs posted under §Gates
4. **Leave the issue open, at `In Progress`.** Never close it. (`/ship` sweeps every `Done`
   issue into `Shipped`, and cloud work is still on a branch.)

If the comment fails, put the same content in the final session message and say that it failed.

## Hand-back

A local session finishes a cloud issue:

1. Fetch the branch and read the diff.
2. Apply any diffs posted under §Gates, after Bex approves them.
3. Merge the branch into `main`.
4. Run `pnpm test:smoke` and the issue's own commands.
5. Close the issue with the evidence comment CLAUDE.md §Issue status requires.
6. Once `main` carrying the merge is pushed, delete the cloud branch and its
   `wip/<date>-<session branch>` mirror from `origin`.

## `## Cloud prep` section

Only issues that need work before or after the cloud run carry one. Shape:

```markdown
## Cloud prep

**Before cloud:**
- [ ] step that must happen first, or "none"

**Cloud does:** the parts a cloud session can finish and verify.

**Stays local:** what comes back to Bex or a local session, and why.
```
