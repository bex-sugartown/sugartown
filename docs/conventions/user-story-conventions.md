# User Story Conventions

**Version:** v2.1
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-08-08
**Related:** `docs/epic-template.md`, `CLAUDE.md` §Epic authoring,
`docs/conventions/instruction-writing-style.md`
**Rationale and worked example:** `docs/conventions/user-story-decomposition-rationale.md`
— why the phases clause was removed, why sub-issues were withdrawn, and SUG-229 worked
through end to end. Not loaded into a session; read it when the rule below is contested.

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
that cross it and revise if it is miscalibrated. Recalibrated once, 2026-08-08; see the
rationale doc.

## Decomposition is phases in the epic doc

**One epic is one Linear issue. Sugartown does not file user stories as Linear sub-issues.**

A decomposed epic carries a scope-to-phase mapping in its backlog doc. Every Scope item
names the phase that ships it, so `Scope ∖ Phases` is empty per CLAUDE.md §Incomplete epic
doc hard stop, item 6.

| What | Where it lives |
|---|---|
| The work units | `docs/backlog/SUG-N-*.md` §Scope |
| Which phase ships each unit | same doc, §Scope-to-phase mapping |
| What each phase ships, and its gate | same doc, §Phases |
| Acceptance Criteria | same doc, §Acceptance criteria |
| Tracking | the epic's single Linear issue |

`docs/backlog/SUG-187-case-study-content-refresh.md` is the reference shape.

Sub-issues were the v1.0 mechanism and were withdrawn 2026-08-08 after their first real
use, on three measured costs. Do not reintroduce them without reading the rationale doc.

## Source of truth

`docs/backlog/SUG-N-*.md` is the only spec. There is no second copy to keep in sync.
