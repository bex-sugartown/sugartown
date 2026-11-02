---
name: sugartown-prototype-writer
description: >
  Plan and record a prototype for Sugartown work: a time-boxed experiment that settles one
  risky claim from an AI PRD before the FSD is written. Use when Bex says "prototype",
  "spike", "proof of concept", "test this idea first", or when an AI PRD research plan has a
  claim that only code or a mockup can settle. Produces a prototype brief and, at the end, a
  findings record. Status: placeholder, untested. Always produces a file, never inline prose.
---

# Sugartown Prototype Writer

**Status: placeholder.** Written before the first real prototype. Revise it after the first
one, and record in the findings what the skill got wrong.

A prototype answers one question. It is not a first draft of the build.

## Where it sits

Optional step between the AI PRD (`sugartown-prd-ai-writer`) and the FSD
(`sugartown-fsd-writer`). It runs when the AI PRD's research plan holds a claim that needs code
or a mockup to settle. Its findings update the AI PRD before the FSD is written.

## Visual prototypes use the vspec gate

**A prototype of a rendered surface is a vspec.** Follow CLAUDE.md §Phase 0 visual spec gate:
`docs/drafts/ST-{n}-{slug}.vspec.html`, its annotation rules, and its interactive-prototype
triggers. This skill covers the rest: data flows, agent workflows, integrations and queries.

## Guardrails

| Guardrail | Rule |
|---|---|
| One question | The brief names the single question and which result would change a requirement |
| Throwaway | Lives in `docs/drafts/{slug}-prototype/` (local only, gitignored). Never in `apps/`, `packages/` or `apps/studio/schemas/` |
| Labelled | Every file carries a header: `PROTOTYPE, NOT FOR PRODUCTION` |
| Time-boxed | The brief states a limit in hours or sessions, and the prototype stops there |
| Read-only | No Sanity writes, no publish, no production data changes |
| Exit decision | Ends as graduate, revise or discard, and the findings record says which |
| Feeds back | Findings update the AI PRD requirement IDs and research plan, and are committed there |

**Do not copy prototype code into the build.** A graduated prototype is rebuilt through an epic.
(The prototype folder is not committed, so the committed record is the findings, in the AI PRD.)

## Intake

Ask only what is missing, one question at a time, three at most.

- AI PRD path and the research-plan row this settles
- What a pass and a fail look like
- The time limit

## Output

Brief: `docs/drafts/{slug}-prototype/BRIEF.md`. Draft it in the scratchpad first. Before writing it,
summarise in one paragraph, then ask with `AskUserQuestion`: "Write it" or "Needs edits".

### Brief sections

1. **Question.** One sentence.
2. **Source.** AI PRD path and requirement or research-plan IDs.
3. **Pass and fail.** The observable result for each, with the command or observation.
4. **Method.** What is built, and what is deliberately left out.
5. **Time limit.** In hours or sessions.
6. **Risks.** Data touched, and why it is read-only.

### Findings record

Written at the end, in the same folder, then summarised into the AI PRD.

| Field | Content |
|---|---|
| Result | Pass, fail or inconclusive, with the evidence |
| Exit decision | Graduate, revise or discard |
| Requirement changes | IDs added, changed or cut |
| What the skill got wrong | Gaps in this skill, to fix after the first run |

## Checklist before starting

- [ ] The brief names one question and a pass and fail result
- [ ] Every file will carry the prototype header
- [ ] No path is inside `apps/`, `packages/` or `apps/studio/schemas/`
- [ ] The time limit is written down
- [ ] Nothing in the method writes to Sanity or publishes
