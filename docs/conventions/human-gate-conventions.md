# Human Gate Conventions

> Two questions, answered in order. **When may a gate interrupt you?** — the tier model
> below. **How does the human respond once it has?** — the mechanism taxonomy, which
> applies to Tier 1 only. Tier model added SUG-281 Phase 2; mechanism taxonomy derived
> from the SUG-227 audit (44 gates across 15 skills, 93% free-text/exact-phrase).

## Tier model

A gate's tier says what it costs, not how important it is. A Tier 2 rule can matter more
than a Tier 1 gate and still not be worth a click.

### Tier 1 — Stop and ask

Irreversible, outward-facing, or writes content. The session stops and waits for a human.
**This is a closed list** — see the register below. A gate is Tier 1 because it appears
there, not because it feels serious.

### Tier 2 — Decide, act, report

The rule already states the answer. The agent applies it, then says what it did and why in
its reply. No click. **This is the default**: every rule in `CLAUDE.md` and the
`docs/conventions/` corpus is Tier 2 unless the register lists it as Tier 1, or it names a
validator or CI step, which makes it Tier 3.

The default is the point. A rule added next year is Tier 2 automatically rather than
silently untiered, so no section can fall outside the model — the failure the SUG-281
verification review found in the first draft, where 3 of 16 gates mapped to no tier at all.

A Tier 2 rule is not weaker for being Tier 2. It is still blocking on the *agent*: it may
not be skipped, only decided without asking. "I applied X because Y" is the required
output; silence is not.

### Tier 3 — Automated, silent unless failing

Validators, pre-commit hooks, CI steps. No human in the loop by design.

## Tier 1 register

| Gate | Where |
|---|---|
| Phase 0 visual spec gate | `CLAUDE.md` §Phase 0 |
| Content Write Gate | `CLAUDE.md` §Content Write Gate |
| The Human-Publishes Rule | `CLAUDE.md` §The Human-Publishes Rule |
| Instruction & Rule File Write Gate | `CLAUDE.md` §Instruction & Rule File Write Gate |
| Technical diagram red-pen gate | `CLAUDE.md` §Technical diagram red-pen gate |
| Visual QA approval | `CLAUDE.md` close-out step 3, §When a vspec exists |
| Chromatic approval | `CLAUDE.md` close-out step 4, `/chromatic` |
| Push to `origin` | `/eod` |
| Destructive git — `reset --hard`, branch delete, force push | `/eod`, `/morning` |
| Production data mutation | ad hoc — no owning section; see Known gaps |

**10 gates. These are worth the interruption.** Adding a row is a deliberate act: it costs
every future session a click, so it belongs in an epic with a stated reason, not in a
passing edit.

### Known gaps

- **Production data mutation has no owning file.** It is Tier 1 by intent and enforced by
  nothing — no `CLAUDE.md` section, no skill line, no register row. Recorded rather than
  quietly dropped.
- Nothing machine-checks that this register matches the tier tags in `CLAUDE.md`. Drift
  between two declarations of the same fact is most of this repo's incident log; this is a
  known instance, not an oversight.

## Response mechanisms (Tier 1 only)

Tier 2 needs no mechanism — the agent decides and reports. These apply when a Tier 1 gate
fires.

### 1. Select-list gate
Valid responses form a small closed set — a binary confirm, a named 2-5 option choice, or a
single "magic word" gating one action. Covers most Tier 1 gates: the Visual QA gate, the
Content Write Gate's proposal table, the CSS naming proposal, DS doc Gate 2's template lock.

**Mechanism:** `AskUserQuestion`, single-select. Option labels are the full action, not a
bare word — "Write it — bump versions and commit," not "Yes." On irreversible or
high-blast-radius actions (push, publish, merge, delete), always include an explicit
"Stop — let me review again" option rather than relying on the human to type "stop."

### 2. Row-level multi-select batch gate
Approve or reject individual items from a list — `/glossy`'s batch term approval,
`/red-pen`'s "apply 1,3,5."

**Mechanism:** `AskUserQuestion` with `multiSelect: true`, one option per item, labeled with
enough context to identify it without scrolling back (id + short summary).

**Known tool constraint:** one `AskUserQuestion` call supports up to 4 questions of 2-4
options — at most 16 items per call. For batches of ≤16, chunk into groups of ≤4. For larger
batches, don't force granular per-row selection: default to "approve all / flag exceptions"
(one question: "Approve all N, or would you like to flag specific ones?") and handle flagged
exceptions in a follow-up call.

### 3. Open-ended content intake
Genuinely free text — `becky-boop`'s "which article is this for?", PRD-writer's clarifying
questions. No conversion needed. One sentence, no compound asks.

### 4. Structured multi-field intake
A form mixing enumerated and free-text fields — `/new-epic`'s Step 0 (priority and merge
strategy enumerated; name and description free text).

**Mechanism:** hybrid — `AskUserQuestion` for the enumerated fields, free text handled
separately in the same turn.

### 5. Negative/absence gate
Fires on the *absence* of an explicit instruction rather than on a shown prompt — the
Content Write Gate's publish half, the Human-Publishes Rule. Nothing to convert to a UI.

**Guidance:** keep the block message to one or two sentences, naming the exact instruction
that would unblock it.

## Response wording standard

- The question itself: one sentence wherever possible.
- Option labels are the full action, not a bare word — this closes the exact-phrase
  brittleness (typo → silent gate failure) the SUG-227 audit found in 41 of 44 gates.
- Never require a case-sensitive or punctuation-sensitive exact string. Where a gate's intent
  is a durable receipt (e.g. Visual QA), the transcript's recorded tool call and selection
  already satisfy it — string matching adds fragility without adding proof.

## Migration notes

- Converting a gate's mechanism changes *how* a human responds, never *what* is required to
  unblock it. Do not loosen strictness during conversion.
- Demoting a gate from Tier 1 to Tier 2 is a real reduction and belongs in an epic with a
  stated reason, the same as adding one.
- Full gate inventory this taxonomy was derived from:
  `docs/backlog/SUG-227-formalize-ai-claude-workflow.md`.
