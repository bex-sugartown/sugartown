# Human Gate Conventions

> Canonical taxonomy for every point where a Sugartown skill or workflow prompt requires
> a human response before an AI session proceeds. Defines which response mechanism each
> gate type must use. Derived from the SUG-227 audit (44 gates found across 15 skills,
> 93% free-text/exact-phrase) — see `docs/backlog/SUG-227-formalize-ai-claude-workflow.md`.

## Taxonomy

### 1. Select-list gate
Any gate whose valid responses form a small closed set — a binary confirm (proceed/stop),
a named 2-5 option choice, or a single "magic word" gating one action. Covers most gates
in the corpus: `/release`'s "Approved"/"Write it"/"Commit it", `/chromatic`'s
"approved"/"skip", the Visual QA Gate's "Visual QA approved", the CSS proposal gate, DS
doc Gate 2's template-lock sign-off.

**Mechanism:** `AskUserQuestion`, single-select. Option labels are the full action, not a
bare word — e.g. "Write it — bump versions and commit," not "Yes." On irreversible or
high-blast-radius actions (push, publish, merge, delete), always include an explicit
"Stop — let me review again" option rather than relying on the human to type "stop."

### 2. Row-level multi-select batch gate
Approve/reject individual items from a list — `/glossy`'s batch term approval, `/red-pen`'s
"apply 1,3,5."

**Mechanism:** `AskUserQuestion` with `multiSelect: true`, one option per item, labeled with
enough context to identify it without scrolling back (id + short summary).

**Known tool constraint:** a single `AskUserQuestion` call supports up to 4 questions, each
with 2-4 options — so at most 16 items per call via multiple multi-select questions grouped
in one call. For batches of ≤16 items, chunk into groups of ≤4. For larger batches, don't
force granular per-row selection — default to an "approve all / flag exceptions" pattern
(one question: "Approve all N, or would you like to flag specific ones?") and handle flagged
exceptions in a follow-up call.

### 3. Open-ended content intake
Genuinely free text — `becky-boop`'s "which article is this for?", PRD-writer's clarifying
questions. No conversion needed. Keep the question to one sentence, no compound asks.

### 4. Structured multi-field intake
A form mixing enumerated and free-text fields — `/new-epic`'s Step 0 (priority + merge
strategy are enumerated; name + description are free text).

**Mechanism:** hybrid — `AskUserQuestion` for the enumerated fields (can combine into one
call, up to 4 questions), free text handled separately in the same turn for open fields.

### 5. Negative/absence gate
The gate fires on the *absence* of an explicit instruction, not on a shown prompt — the
Content Write Gate, the Human-Publishes Rule ("no separate publish instruction ⇒ don't
publish"). Nothing to convert to a UI.

**Guidance:** keep the block message to one or two sentences, naming the exact instruction
that would unblock it.

## Response wording standard

- The question itself: one sentence wherever possible.
- Option labels are the full action, not a bare word — this directly closes the
  exact-phrase brittleness (typo → silent gate failure) the SUG-227 audit found in 41 of
  44 gates.
- Never require a case-sensitive or punctuation-sensitive exact string. Where a gate's
  intent is a durable receipt (e.g. Visual QA Gate), the transcript's recorded tool call +
  selection already satisfies that — string matching adds fragility without adding proof.

## Migration notes

- Converting an existing gate changes *how* a human responds, never *what* is required to
  unblock it. Do not loosen a gate's strictness during conversion.
- Full gate inventory this taxonomy was derived from: `docs/backlog/SUG-227-formalize-ai-claude-workflow.md`.
