# User Story Conventions

**Version:** v1.1
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-08-08
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

Decompose an epic into user stories when it has **more than 5 Scope items**. Below that,
keep the epic flat. Most Sugartown epics are single-session and gain nothing from one
ticket per Scope item.

**Numbered phases do not trigger decomposition.** Phases are execution units, not work
items — see CLAUDE.md §Multi-phase epic merge cadence — and one epic stays one Linear
issue however many phases it carries.

The threshold is a starting value, not a measurement. Check it against the first two epics
that cross it and revise if it is miscalibrated.

### Recalibration — 2026-08-08

v1.0 also fired the gate on numbered phases. Nearly every Sugartown epic has numbered
phases, so that clause made the Scope-item threshold inoperative: the gate fired on almost
every epic, which is the opposite of a gate.

SUG-187 and SUG-260 were the first two epics to cross it, per the check this section
requires. **Both cross on Scope-item count alone — 11 and 10 items.** Removing the phases
clause changes neither epic's outcome, and neither relieves the Linear free-issue ceiling
both hit on 2026-08-07. The clause was removed because it was structurally miscalibrated,
not because it produced measured over-decomposition. Reproduce the counts:

```bash
for f in docs/backlog/SUG-187-*.md docs/backlog/SUG-260-*.md; do echo -n "$f: "; awk '/^## Scope$/{f=1;next} /^### |^## /{if(f)exit} f&&/^- \[[ x]\]/{c++} END{print c+0}' "$f"; done
```

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

SUG-229 ("Convert remaining human-gate skills to AskUserQuestion") had 11 Scope items, so
it crosses the gate. Its 3 phases are not why.

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
