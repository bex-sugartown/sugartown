---
**Epic:** ST-148 — Design system docs research prep for cloud PRD session
**Issue:** [#148](https://github.com/bex-sugartown/sugartown/issues/148)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-148 — Design system docs research prep for cloud PRD session

Collect design-system docs research into `docs/briefs/ds-docs-research/`, committed so a cloud session started from the wip mirror branch can read it and draft the PRD.

## Background

Bex wants to scope a PRD for design-system docs in a cloud session, so the conversation can continue from a phone. A cloud session sees only files committed and pushed to GitHub on the branch it starts from. It does not see gitignored files such as `docs/drafts/`, files above the repo such as `SUGARTOWN_DEV/conventions/` and `~/.claude/`, or iCloud Drive. The research therefore has to be in the repo before the session starts. Reference surfaces: `docs/briefs/`, `.claude/skills/sugartown-prd-writer`, `docs/workflows/cloud-execution.md`.

Findings from the 2026-10-05 docs lookup (code.claude.com/docs/en/cloud-environments and claude-code-on-the-web):

| Question | Answer |
|---|---|
| Repo `CLAUDE.md`, `.claude/rules`, `.claude/skills` | Loaded |
| Personal `~/.claude` settings, plugins, memory | Not loaded |
| `docs/drafts/` and other gitignored files | Not present |
| `SUGARTOWN_DEV/conventions/` | Not present |
| iCloud Drive and other local files | Not reachable |
| claude.ai connectors such as Google Drive | Can be enabled; which connectors work is not documented |
| `.mcp.json` servers | Load in single-repo sessions only |
| Results | A pushed branch; the session can be continued on a phone |
| Issue closing | A cloud session never closes its issue; a local session hands back with `/handback` |

## Objective

After this epic, `docs/briefs/ds-docs-research/` exists on a pushed branch holding the research notes, a cloud session has drafted the PRD there using the `sugartown-prd-writer` skill, and a local session has handed the branch back. Layers touched: docs and tooling only. No Sanity schema, GROQ, React, or content change.

## Scope

- [ ] Create `docs/briefs/ds-docs-research/` with a `README.md` stating what the cloud session can and cannot see (layer: docs)
- [ ] Collect the research notes as markdown files in that directory, copied from iCloud, Notes and Drive (layer: docs)
- [ ] Commit the directory and confirm the commit is on the `wip/<date>-<branch>` mirror branch on `origin` (layer: tooling)
- [ ] Start the cloud session from the mirror branch, pasting the key rules from `human-instruction-style.md` and `human-gate-conventions.md` into the first message (layer: tooling)
- [ ] The cloud session drafts the PRD with `sugartown-prd-writer` and commits it to `docs/briefs/ds-docs-research/` (layer: docs)

## Phases

Single phase.

## Acceptance Criteria

- [ ] `git ls-files docs/briefs/ds-docs-research/` lists a `README.md` and at least one research note
- [ ] `git ls-remote origin 'wip/*'` lists a wip branch whose tip contains the research commit
- [ ] The cloud session's first reply cites a file from `docs/briefs/ds-docs-research/`, showing it can read the committed research
- [ ] A PRD file exists in `docs/briefs/ds-docs-research/` on the cloud branch
- [ ] `/handback 148` merges the branch and the issue is closed

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none. No in-flight epic touches `docs/briefs/ds-docs-research/`.
- **Activation audits:**
  - The last mirror attempt failed: `.git/st-mirror.log` reads `FAIL 2026-10-05T06:50:01 785f1aa7 -> wip/2026-10-05-main`. Before relying on the mirror, read `.git/st-mirror.log` and run `git ls-remote origin 'wip/*'`. If the branch is missing or stale, find out why the hook failed before the cloud session starts.
  - Read `docs/workflows/cloud-execution.md` to confirm a PRD with no existing epic fits the cloud flow. This epic's issue does not carry the `cloud` label.
  - Check whether `.mcp.json` declares the repo MCP server. Without it, `sugartown_get_epic` is unavailable in the cloud session.
- **Rules the cloud session cannot see:** paste the key rules from `human-instruction-style.md` and `human-gate-conventions.md`, plus the no-em-dash preference, into the first message. The repo `CLAUDE.md` loads but points to the conventions folder outside the repo.
- **Model & Mode:** `/model sonnet`. Research collection and PRD drafting need no plan-mode handoff.

## Model & Mode [REQUIRED]

`/model sonnet`. The work is document drafting with no architecture decision.

## Non-Goals

- No design-system code, token, Storybook, or Sanity change. The PRD scopes work; it does not do it.
- No new `cloud` label or change to `docs/workflows/cloud-execution.md`. If the walk-through finds a gap there, file it as its own issue.
- No push to `origin/main` for this epic's research commits. The mirror branch carries them, and `main` receives them at hand-back.

## Related

- **GitHub:** [#148](https://github.com/bex-sugartown/sugartown/issues/148)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Cloud procedure:** `docs/workflows/cloud-execution.md`
- **PRD skill:** `.claude/skills/sugartown-prd-writer`
