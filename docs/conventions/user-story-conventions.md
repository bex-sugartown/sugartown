# User Story Conventions

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-29
**Related:** `docs/epic-template.md`, `CLAUDE.md` §Epic authoring,
`docs/conventions/instruction-writing-style.md`

---

## The term

Use **"user story"** in full. Never bare "story" or "stories" for the agile unit.

Bare "story" and "stories" mean a Storybook component story everywhere in this repo, and
that meaning is load-bearing: "no Storybook story = not done" is a shipping rule, Chromatic
runs against Storybook stories, and a dark-mode Storybook story is an acceptance criterion.

| Write this | Not this |
|---|---|
| user story, User Story | story, in the agile sense |
| Storybook story, component story | story, where the sense is ambiguous |

## When to decompose

Decompose an epic into user stories when **either** is true:

- more than 5 Scope items, or
- numbered phases

Below that, keep the epic flat. Most Sugartown epics are single-session and gain nothing
from one ticket per Scope item.

The threshold is a starting value, not a measurement. Check it against the first two epics
that cross it and revise if it is miscalibrated.

## The Linear shape

| Field | Value |
|---|---|
| `parentId` | the epic's issue ID |
| Title | `User Story: <title>` |
| Description | its own Acceptance Criteria, then Definition of Done |
| Definition of Done | inherits the epic's by reference unless this unit needs its own |

Linear generates a normal SUG-N identifier for each sub-issue. No separate numbering
scheme is needed.

## Source of truth

`docs/backlog/SUG-N-*.md` stays authoritative. Sub-issues are a tracking layer for
visibility, not a second spec. The epic doc wins on conflict.

Nothing enforces this. A sub-issue's Acceptance Criteria edited in Linear and not mirrored
into the epic doc will disagree silently.

## Worked example — SUG-229

SUG-229 ("Convert remaining human-gate skills to AskUserQuestion") had 11 Scope items
across 3 phases, so it crosses the gate on both counts.

| # | User story | Phase | Scope items |
|---|---|---|---|
| 1 | Convert `/mini-release`'s 4 gates | 1 | 1 |
| 2 | Convert `/morning`'s 3 gates | 1 | 1 |
| 3 | Convert `/eod`'s 4 gates | 1 | 1 |
| 4 | Convert `/switch`'s 6 gates | 2 | 1 |
| 5 | Convert `/new-epic`'s Step 0 intake + 2 gates | 2 | 1 |
| 6 | Convert `/glossy`'s 2 gates | 2 | 1 |
| 7 | Convert `/chromatic`'s 2 gates | 2 | 1 |
| 8 | Convert `epic-template.md`'s Phase 0 + Visual QA gates | 2 | 1 |
| 9 | Convert `/update-cwv`'s 2 gates | 3 | 1 |
| 10 | Gate the two ungated writers | 3 | 2 |

Eleven Scope items produced ten user stories. The mapping is not one-to-one: items 10 and
11 merge because `sugartown-prd-writer` and `sugartown-epic-writer` are a single design
task, a new gate designed from scratch, where the other nine translate an existing gate.
Splitting them would have cut one piece of work in half.

Each user story carries its own Acceptance Criteria (that skill's gates render as a
clickable option list, diff shown and approved before commit) and inherits SUG-229's
Definition of Done.
