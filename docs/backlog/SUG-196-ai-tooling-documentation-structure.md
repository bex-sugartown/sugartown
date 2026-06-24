---
**Epic:** SUG-196 — AI tooling documentation structure
**Linear Issue:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure)
**Status:** Drafts received — pending review
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

## Scope

- [ ] Create `docs/ai/README.md` — index + navigation map of all AI tooling artifacts in the repo. Points to: existing workflow prompts, CLAUDE.md, this epic's new files, and the relevant MEMORY.md sections. Layer: documentation.
- [ ] Create `docs/ai/agentic-caucus/methodology.md` — governance document for the agentic-caucus pattern. Covers: what the pattern is, why it exists, session structure (open/execute/close), decision authority (human-in-the-loop model), and the principle of deliberate AI collaboration. Written in Bex's voice. Layer: documentation.
- [ ] Create `docs/ai/agentic-caucus/failure-modes.md` — documented failure patterns and their corrections. Sourced from CLAUDE.md process failure annotations, the content_store.py gem, and session post-mortems. Each failure mode: name, trigger, symptom, correction, rule added. Layer: documentation.
- [ ] Create `docs/ai/skills-index.md` — inventory of every claude.ai skill defined in `.claude/skills/`, with: skill name, trigger, scope (what it does / what it doesn't), and the file path to the skill prompt. Layer: documentation.

## Phases

Single phase — all four files created in one pass, one commit.

## Acceptance criteria

- [ ] `docs/ai/README.md` exists and links to all four new files plus the three existing workflow prompts and CLAUDE.md
- [ ] `docs/ai/agentic-caucus/methodology.md` covers: pattern definition, session structure, decision authority model, and relationship to CLAUDE.md rules — no AI vocabulary slop (em dashes, "leverage", "delve into")
- [ ] `docs/ai/agentic-caucus/failure-modes.md` includes at minimum: Phase 0 mock gate violation, Content Write Gate bypass, speculative fix pattern, dirty-tree epic start, stub-executed-without-spec — each with name/trigger/symptom/correction/rule format
- [ ] `docs/ai/skills-index.md` lists every skill in `.claude/skills/` with trigger, scope, and file pointer — confirmed accurate against actual directory listing at activation
- [ ] No existing files are moved or edited — `git diff --name-only` shows only new files under `docs/ai/`
- [ ] All four files pass anti-slop check: zero em dashes, zero AI vocabulary, zero filler transitions

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** Does not apply — no Sanity writes in this epic.
- **Activation audit (skills-index):** Before writing `skills-index.md`, run `ls .claude/skills/` and read each skill's prompt file to confirm trigger and scope. Memory is not authoritative for the current skill list — read the actual files.
- **Activation audit (failure-modes):** Before writing `failure-modes.md`, read CLAUDE.md sections annotated "process failure" to ensure complete coverage. Cross-reference with the content_store.py gem in `docs/` if accessible locally.
- **Voice constraint:** `methodology.md` is a positioning document. It must pass Bex's voice review before commit — draft it conversationally first and wait for explicit approval before writing to disk.
- **Model & Mode:** `/model sonnet` — pure writing/documentation, no code changes.

## Model & Mode [REQUIRED]

`/model sonnet` — all four files are pure prose documentation. No schema, no JSX, no CSS, no tooling changes. Sonnet drafts; Bex reviews methodology.md before it touches disk.

## Non-Goals

- Moving or renaming any existing workflow prompt files (`morning-housekeeping-prompt.md`, `eod-prompt.md`, `release-assistant-prompt.md`) — they stay where they are
- Editing CLAUDE.md or MEMORY.md to add references to the new folder — the README covers navigation; CLAUDE.md is not in scope
- Creating any new skills or modifying existing skill prompts
- Publishing any of these docs to the Sanity content lake

## Related

- **Linear:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Existing workflow prompts:** `docs/morning-housekeeping-prompt.md`, `docs/eod-prompt.md`, `docs/release-assistant-prompt.md`
- **Skills directory:** `.claude/skills/`
