---
**Epic:** SUG-196 — AI tooling documentation structure
**Linear Issue:** [SUG-196](https://linear.app/sugartown/issue/SUG-196/ai-tooling-documentation-structure)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-196 — AI tooling documentation structure

Create a `docs/ai/` folder with four net-new files: a README index, agentic-caucus methodology and failure-modes docs, and a skills inventory. No existing files moved or edited.

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
