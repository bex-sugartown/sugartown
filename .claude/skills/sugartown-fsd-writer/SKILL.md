---
name: sugartown-fsd-writer
description: >
  Write a Functional Specification Document (FSD) for Sugartown work: the design layer that
  says how the system will implement the requirements in an AI PRD. Sits between
  sugartown-prd-ai-writer and sugartown-epic-writer. Use when Bex says "FSD", "functional
  spec", "technical design", "how will this work under the hood", or has an AI PRD and needs
  architecture, data flow, contracts, error handling and a verification plan before epics.
  Readable by an engineer or hiring manager and executable by an agent. Always produces a
  file, never inline prose.
---

# Sugartown FSD Writer

Produces the design layer: how the system implements the requirements. The AI PRD says
what must be true. The FSD says how the parts behave to make it true. The epic says in what
order to build them.

## Where it sits

| Artifact | Skill | Answers |
|---|---|---|
| Human PRD | `sugartown-prd-writer` | what and why, for people |
| AI PRD | `sugartown-prd-ai-writer` | what must be true, how we know |
| **FSD (this)** | `sugartown-fsd-writer` | how the system behaves |
| Epic | `sugartown-epic-writer` | what to build, in what order |

## Read first

1. The AI PRD in full. **An FSD with no AI PRD is not written.** Offer to write the AI PRD
   first, or proceed only with an "assumptions standing in for the AI PRD" section.
2. `docs/ai/repo-map.md`, then the real code the design touches: `apps/web/src/lib/routes.js`,
   `apps/web/src/lib/queries.js`, `apps/studio/schemas/`, and the `.claude/rules/` files for
   each layer in scope.

**Read the code before designing against it. Link to rules by path, never copy their text.**

## Intake

Ask only what is missing, one question at a time, three at most.

- AI PRD path
- Layers in scope: schema, query, render, design system, build or CI
- Whether any existing behaviour must stay unchanged

**Run `ls` on every path and a command for every count or value.** (CLAUDE.md §Verify before
citing.)

## Output

File: `docs/briefs/{slug}-fsd.md`. Draft it in the scratchpad first.

Before writing it to the repo, summarise in one paragraph (layers, requirement IDs covered,
open decisions), then ask with `AskUserQuestion`: "Write it" or "Needs edits". Write only
after "Write it".

## Sections, in order

### 1. Header
Title, status, ISO date, owner, issue number, link to the AI PRD.

### 2. Requirement coverage
Every AI PRD requirement ID appears here and in section 8.

| Requirement ID | Design section that satisfies it |
|---|---|

An ID with no design section is a gap. List it as an open decision.

### 3. Current state
What exists today, verified. Files, routes, queries and schema types the design touches.

| Thing | Path | Verified by |
|---|---|---|

### 4. Architecture and data flow
Name each layer in scope (data, query, render, design system, build) and what crosses each
boundary. Use a table, and a diagram only if its source is committed in `docs/diagrams/`
(CLAUDE.md §Technical diagram red-pen gate). Out-of-scope layers say why.

### 5. Contracts
One block per interface the design adds or changes.

| Contract | Shape (field names and types) | Producer | Consumer |
|---|---|---|---|

Field types are explicit. Enum values come from the source file, not memory.

### 6. Behaviour
Step-by-step logic for each flow, in numbered steps. Include the validation rules.

### 7. Failure handling and edge cases

| Case | Detection | Behaviour | Test |
|---|---|---|---|

Cover empty data, missing references, a draft read in a published context, and a partial
failure. **A case with no test is marked `untested`, with the reason.**

### 8. Verification plan
For each requirement ID: the command or observation that proves it, where it runs (local,
CI, human), and one known-bad input the check must fail.
(`pnpm validate:liveness-probes` is the pattern.)

### 9. Non-functional requirements
Performance, accessibility, security, and theming. Each has a number or a named standard and
the command that measures it.

### 10. Decisions and alternatives
One row per design choice that had a real alternative.

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|

### 11. Epic handoff
Which epic builds which section. Every section 5 contract and every section 6 flow lands in
exactly one epic, and the epic's Scope cites the section number.

| Epic slug | FSD sections | Requirement IDs | Order |
|---|---|---|---|

### 12. Improvement loop
After each epic, add its friction line. At FSD close, re-read each section against the shipped
code and mark it Match, Drift or Gap (`alignment-audit`). Fix the doc or the code, and name
which. Set a review date, ISO format.

## Checklist before status "In Review"

- [ ] Every AI PRD requirement ID is covered in section 2 and verified in section 8
- [ ] Every path exists and every number names its command
- [ ] No rule text is copied; links only
- [ ] Every contract has explicit field types
- [ ] Every edge case has a test or an `untested` reason
- [ ] Every contract and flow is in exactly one epic
- [ ] No em dashes, no adjective triads
- [ ] An agent could write the first epic from this with no meeting, and an engineer could
      review the design without opening the code

## What not to put here

- Rationale for the feature: that is the human PRD.
- Task order and acceptance checklists: that is the epic.
- A new validator, generator or register unless the doc names the file or check that reads
  its output (CLAUDE.md §Building a mechanism).
