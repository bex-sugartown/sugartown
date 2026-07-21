---
**Epic:** SUG-227 — Formalize AI/Claude workflow
**Linear Issue:** [SUG-227](https://linear.app/sugartown/issue/SUG-227)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-227 — Formalize AI/Claude workflow

Standardize how skills and workflow prompts queue humans for a response and how those responses are collected — moving free-text "type a word to confirm" gates toward clickable/selectable option lists, and tightening the wording humans have to read.

## Background

A pre-execution audit (this session, 2026-07-21) read all 15 active `.claude/skills/*/SKILL.md` files, every doc file they delegate to, `docs/epic-template.md`, and the canonical gate definitions in `CLAUDE.md`. It found **44 distinct human-response gates** across the corpus. **41 of 44 (93%) are free-text gates** — the human types a word into chat ("yes", "approved", "Write it", "Commit it", "Visual QA approved", "bundle all") rather than choosing from a rendered option list. Several require an *exact* phrase, which fails silently on a typo or paraphrase rather than surfacing the valid options. Only 3 gates (all in `/new-epic`'s Step 0 intake and `/mini-release`'s Chromatic choice) already carry a closed, named set of options in their content — and even those are still typed, not clicked. Zero gates in the corpus use an actual selectable-UI mechanism, despite the `AskUserQuestion` tool being available in every Claude Code session and rendering as a real clickable list.

This matters now because the gate density is uneven and growing ad hoc: `/release` alone accounts for 7 of the 44 gates, `/mini-release` and `/switch` 4–6 each, and new skills keep inventing their own confirmation language independently (compare `/morning`'s "yes/go ahead/skip/stop" vocabulary to `/glossy`'s "yes/approved/looks good" to `/red-pen`'s row-level "apply 1,3,5" — three different response grammars for structurally similar decisions). SUG-227 was opened as a stub by Bex directly ("write it, commit, approved, etc etc. both typed commands and prompts. audit and then approve working") naming this inconsistency.

Reference surfaces: every file under `.claude/skills/**`, their target docs under `docs/*.md` and `docs/workflows/*.md`, `docs/epic-template.md`, and the gate definitions in `CLAUDE.md` (Content Write Gate, Human-Publishes Rule, Instruction & Rule File Write Gate, Phase 0 hard-stop, DS doc Gate 2, CSS proposal gate).

## Objective

After this epic: a written convention doc defines a taxonomy of human-response gate types and states which UI mechanism each type must use going forward, and two pilot skills (`/release` and `/red-pen`) are converted to the new mechanism as reference implementations other skills can be modeled on later. This epic touches only the tooling/instruction layer — `.claude/skills/**`, `docs/workflows/*.md`, `docs/conventions/*.md`, and `CLAUDE.md` cross-references. No Sanity schema, GROQ query, or React render layer is touched. No gate's underlying *approval requirement* changes — only the *mechanism* a human uses to respond.

## Scope

- [x] Publish `docs/conventions/human-gate-conventions.md` documenting the gate taxonomy and the required response mechanism per category — layer: tooling/docs
- [x] Add a cross-reference from `CLAUDE.md`'s existing gate definitions (Content Write Gate, Human-Publishes Rule, Instruction & Rule File Write Gate, Phase 0 hard-stop, DS doc Gate 2, CSS proposal gate) to the new convention doc — layer: tooling (governance doc edit)
- [x] Convert all 7 gates in `docs/workflows/release-assistant-prompt.md` (`/release`) from exact-phrase free text to `AskUserQuestion`-based selection — layer: tooling (workflow prompt doc)
- [x] Convert `/red-pen`'s row-level batch-approval gate from typed "apply 1,3,5" syntax to `AskUserQuestion` multi-select — layer: tooling (skill file)
- [x] Produce a deferred-conversion list naming the remaining ~13 skills/docs and their gate counts, for follow-on epics — layer: docs/planning (see **Deferred Conversion Inventory** below)

## Phases

**Phase 1 — Taxonomy + convention doc.** Write `docs/conventions/human-gate-conventions.md` (5 categories below) and cross-reference it from `CLAUDE.md`. No skill files touched. Ships as its own commit/mini-release.

**Phase 2 — Pilot: `/release`.** Convert its 7 gates (the densest sequence in the corpus) to the `AskUserQuestion` pattern defined in Phase 1. Ships as its own commit/mini-release; validates the standard against the hardest case first.

**Phase 3 — Pilot: `/red-pen`.** Convert its row-level multi-select batch-approval gate. Validates the multi-select category specifically (distinct from `/release`'s single-select gates). Ships as its own commit/mini-release.

**Phase 4 — Deferred-conversion list + close-out.** Write the remaining-skills inventory (name, file, gate count, category) as a section in this epic's shipped doc or as new backlog stub(s) — human's call at that point whether it's one follow-on epic or several. **Decided 2026-07-21: section in this epic doc only** (see **Deferred Conversion Inventory** below) — no new Linear issues yet; scope follow-on epics individually when picked up.

## Acceptance criteria

- [x] `docs/conventions/human-gate-conventions.md` exists and documents 5 gate categories (select-list, multi-select batch, open-ended intake, structured multi-field intake, negative/absence) with the required mechanism for each
- [x] `CLAUDE.md` cross-references the new convention doc from each canonical gate definition it names above — diff shown and explicitly approved before commit (Instruction & Rule File Write Gate fires on this file)
- [x] All 7 `/release` gates in `docs/workflows/release-assistant-prompt.md` are rewritten to instruct use of `AskUserQuestion` with named options instead of exact-phrase free text — diff shown and explicitly approved before commit (this file is under `.claude/skills/**`'s referenced-doc scope; treat as rule-defining and gate accordingly)
- [x] `/red-pen`'s batch-approval gate is rewritten to instruct `AskUserQuestion` multi-select instead of typed row-number syntax — diff shown and explicitly approved before commit
- [x] A manual dry-run of `/release` (or a walkthrough without executing real actions) confirms at least one gate renders as a clickable option list, not typed text — verified live for both the `/release` select-list pattern (Gate 1) and `/red-pen`'s multi-select pattern, including the "Approve all N" shortcut
- [x] The deferred-conversion list is written and named (file path or Linear issue IDs) at close-out — see **Deferred Conversion Inventory** below
- [x] Every skill/doc file this epic edits has its diff shown and explicit approval obtained before the corresponding commit, per CLAUDE.md's Instruction & Rule File Write Gate — this applies to every Scope bullet above, not just the CLAUDE.md edit

## Human QA Walkthrough — example local pages

Not applicable — no CSS, layout token, or component changes. This epic edits only Markdown instruction/prompt files consumed by Claude Code sessions; there is no rendered page surface to visually QA.

## Technical notes

- **Instruction & Rule File Write Gate fires on every file this epic touches.** `CLAUDE.md`, `docs/conventions/human-gate-conventions.md` (new file, still under the gated `docs/conventions/**` path), and the skill/prompt files under `.claude/skills/**` (`docs/workflows/release-assistant-prompt.md`, `.claude/skills/red-pen/SKILL.md` or its target doc) all require an exact-diff human approval before landing, per CLAUDE.md. Each Phase's commit is therefore gated individually — do not batch multiple files' diffs into a single approval ask.
- **No Content Write Gate / Human-Publishes Rule applicability.** This epic's own execution never writes to Sanity — those two rules are being *documented*, not *triggered*, by this work.
- **Activation audit:** the full current gate wording for every affected file was captured verbatim during this session's audit (see the completed research above) — re-read the target file immediately before editing it anyway, since instruction docs can drift between epic authoring and execution.
- **Gate taxonomy (locked in this epic, merged per Bex's 2026-07-21 decision):**
  1. **Select-list gate** — any gate whose valid responses form a small closed set: binary confirm (proceed/stop), named 2–5 option choice, or a single "magic word" gating one action. Covers what were originally three separate categories (binary confirm, closed named choice, exact-phrase). → `AskUserQuestion` single-select.
  2. **Row-level multi-select batch** — approve/reject individual items from a numbered list (e.g. `/glossy`, `/red-pen`'s "apply 1,3,5"). → `AskUserQuestion` multi-select, one option per row.
  3. **Open-ended content intake** — genuinely free text (e.g. "which article is this banner for?", PRD-writer clarifying questions). Stays free text; keep the question to one sentence.
  4. **Structured multi-field intake** — a form with both enumerated and free-text fields (e.g. `/new-epic` Step 0: priority + merge strategy are enumerated, name + description are free text). Hybrid: `AskUserQuestion` for the enumerated fields, free text for the rest.
  5. **Negative/absence gate** — the gate fires on the *absence* of an explicit instruction (Content Write Gate, Human-Publishes Rule: "no separate publish instruction ⇒ don't publish"). Not a prompt at all — no UI conversion applies. Only the block/explanation message a human sees gets simplified for clarity.
- **Scope boundary (explicit, per Bex's pilot-only decision):** this epic converts `/release` and `/red-pen` only. The remaining ~13 skills/docs (`/mini-release`, `/switch`, `/eod`, `/morning`, `/glossy`, `/chromatic`, `/update-cwv`, `/new-epic`, `/becky-boop`, `sugartown-prd-writer`, `sugartown-epic-writer`, `docs/epic-template.md`'s Phase 0/Visual QA gates) are catalogued but not converted — tracked as Scope's last bullet, executed as follow-on epic(s).

## Model & Mode [REQUIRED]

`/model sonnet` — this is doc/prompt-instruction editing with a well-defined taxonomy and two named pilot targets already scoped. No architectural ambiguity; Sonnet 5 executes directly, gated per-file by the Instruction & Rule File Write Gate rather than needing Opus plan mode.

## Non-Goals

- **Converting all 15 skills in this epic.** Explicitly deferred to follow-on epic(s) per Bex's pilot-scope decision — full conversion in one pass was assessed as too large a single change surface given every file requires its own diff approval.
- **Changing any gate's underlying approval requirement or strictness.** The Visual QA Gate's "must say exactly 'Visual QA approved'" intent (a receipt in the transcript) is preserved by the select-list conversion, not loosened — the tool call + selection is still recorded in the transcript. This epic changes *how* a human responds, never *whether* a response is still required.
- **Converting negative/absence gates (Content Write Gate, Human-Publishes Rule) to any UI.** These don't present an interactive prompt to convert — only their block-message wording is in scope for simplification, and only where this epic's two pilot skills happen to touch that messaging.
- **Claude Code harness-level tool permission prompts** (the Bash/Edit/Write approval dialogs users see for tool calls generally). Those are a harness feature, not a Sugartown-authored skill gate, and out of scope here.

## Deferred Conversion Inventory

Written at Phase 4 close-out. Not yet converted — pick up as follow-on work, scoped individually when activated. Priority reflects usage frequency (skills run every session or every epic rank highest) and gate severity (exact-phrase gates rank above simple confirms).

| Skill / file | Gates | Category(ies) | Priority | Note |
|---|---|---|---|---|
| `/mini-release` (`docs/mini-release-prompt.md`) | 4 | Select-list (all) | **High** | Used at the end of every epic — this session ran it live 3× using informal `AskUserQuestion` substitution since the source doc itself is still unconverted; the doc is now the most out-of-date artifact relative to actual practice. |
| `/morning` (`docs/workflows/morning-housekeeping-prompt.md`) | 3 | Select-list (all) | **High** | Runs at every session start (this session opened with it). Fixed "yes/go ahead/skip/stop" vocabulary converts cleanly. |
| `/eod` (`docs/workflows/eod-prompt.md`) | 4 | Select-list (all) | **High** | Runs at every session end. Push confirmation gate should get a "Stop — let me review again" option per the commit-gate pattern from `/release` Gates 5/7. |
| `/switch` (`docs/switch-prompt.md`) | 6 | Select-list (all) | Medium | Only fires on machine-switch days, but has the most gates after `/release`. Divergence-resolution gate (3 named options) is a clean select-list conversion. |
| `/new-epic` (`.claude/skills/new-epic/docs/new-epic-prompt.md`) | 3 | 1 structured multi-field intake (Step 0 priority + merge strategy), 2 select-list | Medium | Already the closest existing pattern to the target — used to create this very epic. Good next pilot for the structured-intake category (not yet validated by Phases 1–3). |
| `/glossy` (`docs/glossy-prompt.md`) | 3 (2 content gates; publish already covered via Human-Publishes Rule reference) | 1 select-list (batch parse-confirm), 1 select-list/multi-select (Gate 1 table — multi-select needed for batch mode's selective "post 1,3,4") | Medium | Batch mode's Gate 1 needs the same chunking logic as `/red-pen`'s Phase 3 conversion — can reuse that spec directly. |
| `/chromatic` (`docs/chromatic-prompt.md`) | 2 | Select-list (both) | Medium | Both gates route through an external review (Chromatic's own UI) before the chat-side confirm — mechanism note in the convention doc's category 1 already covers this ("external-system approval" still gets a select-list ack). |
| `docs/epic-template.md` | 2 (Phase 0 sign-off, Visual QA Gate) + 1 excluded (Opus plan review — iterative loop, not a single-shot gate, no conversion applies per this epic's Non-Goals) | Select-list | **Medium-high** | Not covered by Phase 1's CLAUDE.md pointer — `CLAUDE.md`'s own Phase 0 section got the pointer, but `epic-template.md` restates its own Phase 0 and Visual QA language independently and needs its own edit. Visual QA Gate's exact-phrase "Visual QA approved" is the strictest remaining gate in the corpus. |
| `/update-cwv` (`.claude/skills/update-cwv/skill.md`) | 2 | Select-list (both) | Low | Low-frequency skill (perf snapshot updates). |
| `/becky-boop` (`docs/becky-boop-prompt.md`) | 1 | Open-ended content intake | **N/A — no conversion needed.** Correctly free text per taxonomy category 3; excluded from follow-on scope. |
| `sugartown-prd-writer` | 0 (gap, not a gate) | — | Low-medium | Not a conversion — a **missing gate**. Currently writes the PRD file with no approval step at all, unlike every other write-producing skill in the corpus. Follow-on should *add* a select-list gate ("Approve — write the PRD" / "Needs changes"), not convert an existing one. |
| `sugartown-epic-writer` | 0 (gap, not a gate) | — | Low-medium | Same gap as `sugartown-prd-writer` — no approval gate before writing the epic execution prompt file. |
| `docs/workflows/rules-tools-audit-runbook.md` | 1 (Step 7 human review) | Select-list | Low | Likely already effectively covered — this gate explicitly routes through CLAUDE.md's Instruction & Rule File Write Gate, which now points to the convention doc. Verify only; may need no direct edit. |

**Not on this list (already resolved by this epic):** the 5 canonical CLAUDE.md gate definitions (Content Write Gate, Human-Publishes Rule, Instruction & Rule File Write Gate, Phase 0 hard-stop *as defined in CLAUDE.md itself*, DS doc Gate 2, CSS proposal gate) — Phase 1 added the convention-doc cross-reference directly to their canonical definitions, so every skill that invokes them *by reference* (rather than restating the gate text, as `epic-template.md` does for Phase 0/Visual QA) inherits the standard automatically.

## Related

- **Linear:** [SUG-227](https://linear.app/sugartown/issue/SUG-227)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (note: this epic touches no schema or query layer, so those sections are expected to read "N/A" at activation, not be skipped silently)
