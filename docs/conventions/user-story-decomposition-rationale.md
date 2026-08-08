# User Story Decomposition — Rationale and Worked Example

**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-08-08
**Rule doc:** `docs/conventions/user-story-conventions.md`

Why the decomposition rule is shaped the way it is, and SUG-229 worked through end to end.

**This file is deliberately not referenced from `CLAUDE.md`.** The instruction-surface
budget (`pnpm validate:doc-budget`) counts CLAUDE.md plus the conventions files it
references directly, so everything here is available on demand rather than loaded into
every session. Splitting it out is what `instruction-writing-style.md` means by "rationale
gets one clause or its own file". Keep the rule doc thin; put the history here.

---

## Recalibration — 2026-08-08

v1.0 fired the gate on **more than 5 Scope items _or_ numbered phases**. Nearly every
Sugartown epic has numbered phases, so that clause made the Scope-item threshold
inoperative: the gate fired on almost every epic, which is the opposite of a gate.

SUG-187 and SUG-260 were the first two epics to cross it, per the check the rule doc
requires. **Both cross on Scope-item count alone — 11 and 10 items.** Removing the phases
clause changes neither epic's outcome, and neither relieves the Linear free-issue ceiling
both hit on 2026-08-07. The clause was removed because it was structurally miscalibrated,
not because it produced measured over-decomposition. Reproduce the counts:

```bash
for f in docs/backlog/SUG-187-*.md docs/backlog/SUG-260-*.md; do echo -n "$f: "; awk '/^## Scope$/{f=1;next} /^### |^## /{if(f)exit} f&&/^- \[[ x]\]/{c++} END{print c+0}' "$f"; done
```

## Why not sub-issues — withdrawn 2026-08-08

Linear sub-issues were the v1.0 mechanism. They were withdrawn after their first real use,
on three measured costs:

- **They break `validate:epic-docs`.** That gate requires a `docs/backlog/SUG-N-*.md` for
  every non-Done issue, and a sub-issue has no doc by design. Every sub-issue filed turns
  CI red. SUG-278 and SUG-279 did exactly that, found the moment the gate first ran with a
  live `LINEAR_API_KEY` on 2026-08-08.
- **They consume the Linear issue budget.** The workspace hit its free-plan ceiling on
  2026-08-07, after two sub-issues.
- **They split one spec across two systems** with nothing keeping the halves in sync.

The incentive this created is already on the record in `scripts/validate-epic-docs.js`
lines 23–26: because sub-issues got no exemption from the doc-parity gate, the cheapest
legal response to a finding was to not file the sub-issue at all. SUG-269 was created and
cancelled the same day for that reason. Phases remove the conflict rather than carving an
exemption into the gate.

## Worked example — SUG-229

SUG-229 ("Convert remaining human-gate skills to AskUserQuestion") had 11 Scope items, so
it crosses the gate. Its 3 phases are not why.

| # | Work unit | Phase | Scope items |
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

Eleven Scope items produced ten work units across three phases. The mapping is not
one-to-one: items 10 and 11 merge because `sugartown-prd-writer` and `sugartown-epic-writer`
are a single design task, a new gate designed from scratch, where the other nine translate
an existing gate. Splitting them would have cut one piece of work in half.

Each work unit carries its own Acceptance Criteria (that skill's gates render as a
clickable option list, diff shown and approved before commit) and inherits SUG-229's
Definition of Done. All of it lives in the epic doc; none of it becomes a Linear issue.
