---
**Epic:** SUG-196 — AI tooling documentation structure
**Linear Issue:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure)
**Status:** Phase 1 complete — Phase 2 pending
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-196 — AI tooling documentation structure

Create a `docs/ai/` folder with four net-new files: a README index, agentic-caucus methodology and failure-modes docs, and a skills inventory. No existing files moved or edited.

## Drafts

All four files received from Claude (claude.ai session) on 2026-06-24. Stored locally at `docs/drafts/SUG-196/` (gitignored). **Do not commit until review flags below are resolved.**

### Review flags — required before commit

**`methodology.md` — 2 issues**

1. **Em dashes throughout.** CLAUDE.md bans em dashes in all non-node content. Full list of occurrences to fix:
   - "It is not a product. It is not a brand. It is a methodology: systematic AI collaboration with documented failure modes, strategic tool selection, and a human who holds the vision while agents propose, iterate, and occasionally contradict each other." — the dash in "orient-before-acting" is a hyphen (fine); the standalone em dashes in "Agents propose. Bex decides." paragraphs are fine (no em dashes there actually — need to re-read). Actually on second look — the em dashes appear inline in the agent description blocks. Grep: `sed -n '/—/p' docs/drafts/SUG-196/methodology.md`
   - Replace all `—` with commas, colons, or sentence breaks as appropriate.
2. **Skills section references `/mnt/skills/user/`.** This is a claude.ai internal path that means nothing to a reader of the repo. The repo equivalent is `.claude/skills/`. Update the reference or clarify that this is a claude.ai path, not a repo path.

**`README.md` — 1 issue**

3. **Factual error: `docs/prompts/` does not exist.** The line "The epic archive (in `docs/prompts/` and `docs/backlog/`)" references a directory that is not in the repo. Shipped epics are in `docs/shipped/`, in-flight and backlog epics are in `docs/backlog/`. Fix: "The epic archive (`docs/backlog/` for active, `docs/shipped/` for shipped)".

**`skills-index.md` — 1 issue**

4. **Skills inventory is incomplete and mis-categorised.** The table lists claude.ai project skills only. The repo also has `.claude/skills/` entries invocable via `/` in Claude Code that are not listed: `becky-boop`, `chromatic`, `storybook-docs` (`write-node`), `update-cwv`, `write-blog`, `new-epic`, `restart`. Additionally, `/morning` and `/eod` are listed as "paste prompts" but they are actual `.claude/skills/` entries — they live in the skill system, not just in `docs/`. The table needs a second section (or column) covering Claude Code skills separately from claude.ai skills.

**`failure-modes.md` — no issues.** Content is accurate, format is correct, no em dashes.

### Review instruction for activation

Before writing any of the four files to `docs/ai/`:
1. Apply fixes for all four flags above to the drafts in `docs/drafts/SUG-196/`
2. Show diffs or updated content to Bex for explicit approval on `methodology.md` (voice check) and `skills-index.md` (accuracy check against actual `.claude/skills/` listing)
3. Only after approval: create `docs/ai/` directory and write the four files

---

## Background

The AI tooling for this repo spans Claude Code skills, Linear MCP workflows, Sanity MCP tools, and the agentic-caucus session-governance pattern — but none of it is documented in a discoverable, navigable place. The closest thing is the Content Store gem and scattered CLAUDE.md sections. The gap matters most for the agentic-caucus methodology: it exists as a practised pattern but not as a governance document that can be shared, cited, or evolved deliberately.

The existing workflow prompts (`morning-housekeeping-prompt.md`, `eod-prompt.md`, `release-assistant-prompt.md`) already live in `docs/` and are referenced from CLAUDE.md skill definitions. Moving them would break those references. The correct action is to create a parallel `docs/ai/` folder that indexes and contextualises them without relocating anything.

## Objective

After this epic, `docs/ai/` exists with four files: a README that maps every AI tooling artifact in the repo, a methodology doc that describes the agentic-caucus session pattern (governance model, not just procedure), a failure-modes doc that captures the documented failure patterns and their corrections, and a skills inventory that lists every claude.ai skill with its trigger, scope, and file pointer. No existing files are moved or edited. The folder can be shared as a credential for the agentic-caucus pattern and used as onboarding material for future collaborators.

## IA Reconciliation Note

The before/after IA diagram (reviewed 2026-06-24) showed several items as "to be moved" that are already in the correct location. Actual current state:

| Item | Diagram "before" | Actual state | Action needed |
|---|---|---|---|
| `docs/brand/` | docs root | **Already exists** | None — already correct |
| `docs/briefs/ia-brief.md` | docs root | **Already in briefs/** | None — already correct |
| Strategy briefs | docs root | **Already in briefs/** | None — already correct |
| `docs/conventions/` | already shown | **Already exists** | None |
| `docs/workflows/` | new dir needed | Does not exist | Create + move 3 prompts |
| `docs/ai/` | new dir needed | Does not exist | Create — Phase 1 |
| `docs/epics/` | deferred | Does not exist | Deferred — separate workstream |

The "before" diagram also omitted ~8 additional prompt files at docs root that mirror `.claude/skills/` prompts (`becky-boop-prompt.md`, `chromatic-prompt.md`, `glossy-prompt.md`, `mini-release-prompt.md`, `post-mortem-prompt.md`, `switch-prompt.md`, `write-blog-prompt.md`, `write-node-prompt.md`). These are not addressed in the "after" diagram and are out of scope for this epic.

## Scope

**Phase 1 — `docs/ai/` (net-new files, no moves)**

- [ ] Create `docs/ai/README.md` — index + navigation map of all AI tooling artifacts in the repo. Points to: existing workflow prompts, CLAUDE.md, this epic's new files, and the relevant MEMORY.md sections. Layer: documentation.
- [ ] Create `docs/ai/agentic-caucus/methodology.md` — governance document for the agentic-caucus pattern. Covers: what the pattern is, why it exists, session structure (open/execute/close), decision authority (human-in-the-loop model), and the principle of deliberate AI collaboration. Written in Bex's voice. Layer: documentation.
- [ ] Create `docs/ai/agentic-caucus/failure-modes.md` — documented failure patterns and their corrections. Sourced from CLAUDE.md process failure annotations, the content_store.py gem, and session post-mortems. Each failure mode: name, trigger, symptom, correction, rule added. Layer: documentation.
- [ ] Create `docs/ai/skills-index.md` — inventory of every skill in `.claude/skills/` AND claude.ai project skills, with: skill name, trigger, scope, and file pointer. Two-section format: Claude Code skills (`.claude/skills/`) and claude.ai project skills separately. Layer: documentation.

**Phase 2 — `docs/workflows/` (file moves + reference audit)**

- [ ] Create `docs/workflows/` directory. Layer: documentation structure.
- [ ] Move `docs/morning-housekeeping-prompt.md` → `docs/workflows/morning-housekeeping-prompt.md`. Layer: documentation.
- [ ] Move `docs/eod-prompt.md` → `docs/workflows/eod-prompt.md`. Layer: documentation.
- [ ] Move `docs/release-assistant-prompt.md` → `docs/workflows/release-assistant-prompt.md`. Layer: documentation.
- [ ] Audit all references to the three moved files across: CLAUDE.md, `.claude/skills/morning/`, `.claude/skills/eod/`, and any other skill prompts that reference these paths by filename. Update all references to the new paths. Layer: tooling.
- [ ] Verify `docs/ai/README.md` quick-reference table points to the new `docs/workflows/` paths. Layer: documentation.

## Phases

**Phase 1** — Create `docs/ai/` with four new files. No existing files moved or edited. One commit.

**Phase 2** — Create `docs/workflows/`, move three prompt files, update all references. One commit. Blocked on completing the reference audit (see Technical Notes).

**Deferred** — `docs/epics/` rename (tracked in Deferred Workstream section below).

## Acceptance criteria

**Phase 1**
- [ ] `docs/ai/README.md` exists and links to all four new files plus workflow prompts (at their Phase 2 destination: `docs/workflows/`) and CLAUDE.md
- [ ] `docs/ai/agentic-caucus/methodology.md` covers: pattern definition, session structure, decision authority model, and relationship to CLAUDE.md rules — no AI vocabulary slop (em dashes, "leverage", "delve into")
- [ ] `docs/ai/agentic-caucus/failure-modes.md` includes at minimum: Phase 0 mock gate violation, Content Write Gate bypass, speculative fix pattern, dirty-tree epic start, stub-executed-without-spec — each with name/trigger/symptom/correction/rule format
- [ ] `docs/ai/skills-index.md` accurately lists all `.claude/skills/` entries confirmed against `ls .claude/skills/` at activation, plus claude.ai project skills in a separate section
- [ ] `git diff --name-only` shows only new files under `docs/ai/` — no moves in Phase 1 commit
- [ ] All four files pass anti-slop check: zero em dashes, zero AI vocabulary, zero filler transitions

**Phase 2**
- [ ] `docs/workflows/` exists containing exactly: `morning-housekeeping-prompt.md`, `eod-prompt.md`, `release-assistant-prompt.md`
- [ ] `grep -r "morning-housekeeping-prompt\|eod-prompt\|release-assistant-prompt" . --include="*.md" --include="*.json"` returns only references pointing to `docs/workflows/` — none pointing to old `docs/` root paths
- [ ] `/morning`, `/eod`, and release pipeline skills invoke correctly after the move (test by reading the skill prompt files in `.claude/skills/` and confirming their referenced paths resolve)

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** Does not apply — no Sanity writes in this epic.
- **Activation audit (skills-index):** Before writing `skills-index.md`, run `ls .claude/skills/` and read each skill's prompt file to confirm trigger and scope. Memory is not authoritative for the current skill list — read the actual files.
- **Activation audit (failure-modes):** Before writing `failure-modes.md`, read CLAUDE.md sections annotated "process failure" to ensure complete coverage. Cross-reference with the content_store.py gem in `docs/` if accessible locally.
- **Voice constraint:** `methodology.md` is a positioning document. It must pass Bex's voice review before commit — draft it conversationally first and wait for explicit approval before writing to disk.
- **Phase 2 reference audit (blocking):** Before moving any of the three prompt files, run: `grep -rn "morning-housekeeping-prompt\|eod-prompt\|release-assistant-prompt" . --include="*.md" --include="*.json" --include="*.ts"`. Capture every reference. Update all of them in the same commit as the move. Do not move files before completing the audit — broken references in skill prompts produce silent failures at session start.
- **Phase 2 sequencing:** Do Phase 1 first (clean commit, no moves). Begin Phase 2 only after Phase 1 is committed and the reference audit is complete. Do not interleave.
- **Model & Mode:** `/model sonnet` — pure writing/documentation, no code changes.

## Model & Mode [REQUIRED]

`/model sonnet` — all four files are pure prose documentation. No schema, no JSX, no CSS, no tooling changes. Sonnet drafts; Bex reviews methodology.md before it touches disk.

## Non-Goals

- Moving or renaming any existing workflow prompt files in Phase 1 — they move in Phase 2 only, after the reference audit
- Editing CLAUDE.md to add references to the new folder — the README covers navigation; CLAUDE.md is not in scope for this epic
- Creating any new skills or modifying existing skill prompts
- Publishing any of these docs to the Sanity content lake
- Renaming or reorganising `docs/prompts/` — tracked as a deferred workstream below; not in scope for this commit
- Moving the ~8 additional prompt files at docs root (`becky-boop-prompt.md`, `chromatic-prompt.md`, `glossy-prompt.md`, etc.) — not addressed by the IA proposal, out of scope

## Deferred Workstream — `docs/prompts/` rename

**Decision recorded 2026-06-24. Do not act on this in SUG-196.**

`docs/prompts/` currently contains completed execution briefs (`EPIC-0145-*.md`, `EPIC-0152-*.html`, etc.) — not prompts in the conventional sense. The name creates the wrong expectation for any reader unfamiliar with the repo's history.

**Why not now:** CLAUDE.md, the morning housekeeping prompt, and the release assistant likely reference `docs/prompts/` by path. Renaming without a full search-and-replace across all references would break internal links and confuse Claude Code sessions. The change also has zero functional benefit — it is a pure naming correction.

**Recommended target state when this is eventually actioned:**

```
docs/epics/
├── backlog/       # active backlog stubs (currently docs/backlog/)
└── shipped/       # completed execution briefs (currently docs/prompts/)
```

This mirrors the Linear lifecycle (backlog → shipped) and makes both states navigable at a glance.

**Sequencing rule:** Do this rename only when already touching the docs structure for another reason, so the path audit (`grep -r "docs/prompts" .`) can be bundled into the same commit rather than a standalone chore.

**Note for `docs/ai/README.md` draft:** The current draft at `docs/drafts/SUG-196/README.md` references `docs/prompts/` as "The epic archive". This is one of the four review flags. When fixing that flag, use the current real paths (`docs/backlog/` and `docs/shipped/`) rather than the aspirational restructured paths above — do not pre-empt the rename.

## Related

- **Linear:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Existing workflow prompts:** `docs/morning-housekeeping-prompt.md`, `docs/eod-prompt.md`, `docs/release-assistant-prompt.md`
- **Skills directory:** `.claude/skills/`
