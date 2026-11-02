---
name: sugartown-prd-ai-writer
description: >
  Write the AI-facing requirements document for Sugartown work: a PRD in agent-executable
  form, sitting between the human PRD (sugartown-prd-writer) and the epic
  (sugartown-epic-writer). Use when Bex says "AI PRD", "agent spec", "requirements for
  Claude Code", "turn this PRD into something agents can build from", or has a human PRD and
  needs testable requirements, research checks and an improvement loop before writing
  epics. Always produces a file, never inline prose.
---

# Sugartown AI PRD Writer

Produces the requirements layer that agents read. It states what must be true and how each
claim will be checked. It does not restate the human PRD, and it does not sequence work.

## Where it sits

| Artifact | Skill | Reader | Answers |
|---|---|---|---|
| Human PRD | `sugartown-prd-writer` | engineers, designers, stakeholders | what and why |
| **AI PRD (this)** | `sugartown-prd-ai-writer` | agents, plus a human reviewer | what must be true, how we know |
| Prototype (optional) | `sugartown-prototype-writer` | agents, plus a human reviewer | does this risky claim hold |
| FSD | `sugartown-fsd-writer` | agents | how the system works |
| Epic | `sugartown-epic-writer` | Claude Code | what, in what order |

## Read first

1. The human PRD in full, from `docs/briefs/`. With none, open the file with an
   "assumptions standing in for the human PRD" section.
2. `CLAUDE.md`, `docs/ai/repo-map.md` and the `.claude/rules/` files the work touches.

**Link to rules and PRD sections by path. Never copy their text.** A copy is a second
declaration with nothing checking it.

## Intake

Ask only what is missing, one question at a time, three at most.

- Human PRD path, or one sentence on the problem
- Domain: CMS, frontend, design system, platform, or mixed
- Expected number of epics

**Run `ls` on every path before writing it. Run a command for every count or value.**
(CLAUDE.md §Verify before citing.)

## Output

File: `docs/briefs/{slug}-ai-prd.md`. Draft it in the scratchpad first.

**Drafting is spec work, not execution.** Leave the issue status unchanged and say so in the
reply (CLAUDE.md §Issue status = workflow stage).

Before writing it to the repo, summarise in one paragraph (requirement count, epic count,
open decisions), then ask with `AskUserQuestion`: "Write it" or "Needs edits". Write only
after "Write it".

## Sections, in order

### 1. Header
Title, status, ISO date, owner, issue number, link to the human PRD.

### 2. Agent context
Files an agent reads before starting.

| Path | Why | Verified |
|---|---|---|

### 3. Requirements
One testable statement each, present tense.

| ID | Requirement | Source (PRD section) | Check | Class |
|---|---|---|---|---|

Class is one of `enforced-by-code`, `measured`, `convention`, `roadmap`
(CLAUDE.md §Technical diagram red-pen gate). **A requirement with no check is cut or marked
`convention`.** Never mark it `enforced-by-code` without naming the validator.

### 4. Research and verification plan
Claims the build depends on that are not yet verified.

| Claim | Command or source that settles it | Run by | Done before |
|---|---|---|---|

Rows are settled before the first epic starts.

A claim that needs code or a mockup to settle goes to a prototype
(`sugartown-prototype-writer`). Its findings update this table and the requirement IDs.

### 5. Test and eval plan
For each requirement ID: where the check runs (local, CI, human) and one known-bad input it
must fail. A check that passes on bad input is the way this goes wrong
(`pnpm validate:liveness-probes`).

### 6. Human gates this work will hit
Name them from `human-gate-conventions.md`: vspec, Visual QA, Chromatic, Content Write,
publish, rule-file write. **Do not add a Tier 1 gate here.** That is a deliberate change to
the register.

### 7. Decomposition

| Epic slug | Requirement IDs | Order | Depends on |
|---|---|---|---|

Every requirement ID appears in exactly one epic. The epic's Scope cites the IDs
(close-out step 5b checks the handoff).

### 8. Improvement loop
- After each epic: record the friction line in its close-out review.
- At PRD close: re-read each requirement against what shipped and mark it Match, Drift or
  Gap (`alignment-audit`).
- The same friction three times is a process fix (`process-feedback-loop.md`).
- Set a review date, ISO format.

### 9. Open decisions
| Decision | Options | Owner | Target date |
|---|---|---|---|

### 10. Non-goals
Each names the reason for exclusion, and the issue or epic that owns it.

## Checklist before status "In Review"

- [ ] Every requirement has a check and a class
- [ ] Every path in the doc exists, and every number names its command
- [ ] No rule text is copied; links only
- [ ] Every requirement ID is in exactly one epic
- [ ] No em dashes, no adjective triads
- [ ] An agent could start the first epic from this and the human PRD with no meeting

## When to build a validator

Do not specify a new validator, generator or register in an AI PRD unless it names the file
or check that reads its output (CLAUDE.md §Building a mechanism).
