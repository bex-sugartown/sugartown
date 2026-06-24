---
**Epic:** SUG-197 — Docs IA cleanup — epics rename, orphaned prompts audit, CLAUDE.md nav references
**Linear Issue:** [SUG-197](https://linear.app/sugartown/issue/SUG-197/docs-ia-cleanup-epics-rename-orphaned-prompts-audit-claudemd-nav)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Blocked by:** SUG-196 (both phases must be shipped before this epic activates)
---

# SUG-197 — Docs IA cleanup — epics rename, orphaned prompts audit, CLAUDE.md nav references

Finish the docs IA restructure started in SUG-196: rename the epics folder split, audit and disposition the ~8 orphaned prompt files at docs root, and update CLAUDE.md navigation references to reflect the settled structure.

## Background

SUG-196 establishes `docs/ai/` and moves three workflow prompts to `docs/workflows/`. Two workstreams were explicitly deferred from that epic:

1. **`docs/epics/` rename** — `docs/prompts/` is a misleading name for completed execution briefs. The agreed target structure is `docs/epics/shipped/` (from `docs/prompts/`) and `docs/epics/backlog/` (from `docs/backlog/`). This requires a path audit across CLAUDE.md, skill prompts, and any other references before moving anything.

2. **Orphaned prompt files** — ~8 files at the docs root are mirrors or backups of `.claude/skills/` prompts (`becky-boop-prompt.md`, `chromatic-prompt.md`, `glossy-prompt.md`, `mini-release-prompt.md`, `post-mortem-prompt.md`, `switch-prompt.md`, `write-blog-prompt.md`, `write-node-prompt.md`). The IA proposal didn't address their disposition. Each needs a decision: move to `docs/workflows/`, keep at root, or delete if fully superseded by the `.claude/skills/` entry.

3. **CLAUDE.md nav references** — once both SUG-196 and this epic's file moves are complete, CLAUDE.md should reference the settled paths. This is intentionally last — updating references before the structure is stable is a recipe for drift.

## Objective

After this epic, the docs IA is complete: epics are navigable under `docs/epics/` with `backlog/` and `shipped/` subfolders matching the Linear lifecycle, every file at the docs root either has a declared home or is confirmed as intentionally rootlevel, and CLAUDE.md path references are accurate. No broken internal links. No misleadingly-named directories.

## Scope

**Phase 1 — Orphaned prompt files audit (decision-first, no moves yet)**

- [ ] Read each of the ~8 prompt files at docs root and classify per file: (a) fully superseded by `.claude/skills/` entry — delete, (b) serves a distinct purpose not covered by the skill — move to `docs/workflows/`, (c) intentionally rootlevel for discoverability — keep with a note. Layer: audit.
- [ ] Produce a disposition table (one row per file) and wait for Bex's approval before any moves or deletes. Layer: documentation.
- [ ] Execute approved moves/deletes. Layer: documentation.

**Phase 2 — `docs/epics/` rename**

- [ ] Activation audit: `grep -rn "docs/prompts\|docs/backlog" . --include="*.md" --include="*.json" --include="*.ts" --include="*.js"` — capture every reference. Layer: audit.
- [ ] Create `docs/epics/shipped/` and move all files from `docs/prompts/` into it. Layer: documentation structure.
- [ ] Create `docs/epics/backlog/` and move all files from `docs/backlog/` into it. Layer: documentation structure.
- [ ] Update all references found in the audit to point to the new paths. Layer: tooling/documentation.
- [ ] Update `sugartown-backlog-priorities.md` (now at `docs/epics/backlog/`) Epic file path references. Layer: documentation.

**Phase 3 — CLAUDE.md nav reference update**

- [ ] Read CLAUDE.md in full and update any path references that point to old locations (`docs/prompts/`, `docs/backlog/`, any docs-root prompt files that moved). Layer: documentation.
- [ ] Verify no references remain to moved or deleted paths: `grep -rn "docs/prompts\|docs/backlog" CLAUDE.md`. Layer: verification.

## Phases

**Phase 1** — Audit and disposition orphaned prompt files. Gate: disposition table approved by Bex before any file moves or deletes.

**Phase 2** — Rename epics folder split. Gate: activation audit complete and all reference paths captured before first `git mv`.

**Phase 3** — CLAUDE.md reference update. Gate: Phases 1 and 2 committed. Run after structure is stable.

## Acceptance criteria

- [ ] `docs/epics/shipped/` exists and contains all files previously in `docs/prompts/`
- [ ] `docs/epics/backlog/` exists and contains all files previously in `docs/backlog/`
- [ ] `docs/prompts/` and `docs/backlog/` no longer exist
- [ ] Every file previously at docs root (`*-prompt.md`) is either deleted, in `docs/workflows/`, or confirmed rootlevel with explicit rationale
- [ ] `grep -rn "docs/prompts\|docs/backlog" . --include="*.md" --include="*.json"` returns zero results
- [ ] `grep -rn "docs/prompts\|docs/backlog" CLAUDE.md` returns zero results
- [ ] `/morning`, `/eod`, and any other skill-invoked workflows still function after all moves (confirm by reading the skill prompt files and checking that referenced paths resolve)

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Activation dependency:** Do not activate this epic until SUG-196 Phase 2 is shipped. The `docs/workflows/` path established in SUG-196 Phase 2 is a dependency — the orphaned prompts audit in Phase 1 needs to know which files have already been moved before making disposition decisions.
- **Phase 2 move order matters:** Create destination directories before moving files. Use `git mv` (not `mv`) so Git tracks the rename rather than treating it as delete + add. This preserves `git log --follow` history.
- **`sugartown-backlog-priorities.md` will move:** After Phase 2, the priority stack file lives at `docs/epics/backlog/sugartown-backlog-priorities.md`. Any session that references it by the old path will break. Update MEMORY.md Key File Locations entry in the same commit.
- **Model & Mode:** `/model sonnet` — pure file moves, audit, and documentation updates. No schema, no JSX, no CSS.

## Model & Mode [REQUIRED]

`/model sonnet` — file moves, grep audits, and documentation updates only.

## Non-Goals

- Moving files that are outside the docs IA scope (brand, conventions, briefs, architecture — all already in correct locations)
- Changing the content of any moved file (move only, no edits bundled into rename commits)
- Updating Sanity content or any web-facing URLs

## Related

- **Linear:** [SUG-197](https://linear.app/sugartown/issue/SUG-197/docs-ia-cleanup-epics-rename-orphaned-prompts-audit-claudemd-nav)
- **Blocked by:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure) — both phases must ship first
- **Deferred from:** SUG-196 Deferred Workstream section (`docs/backlog/SUG-196-ai-tooling-documentation-structure.md`)
- **Epic template:** `docs/epic-template.md`
