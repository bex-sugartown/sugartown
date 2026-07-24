---
**Epic:** SUG-229 — Convert remaining human-gate skills to AskUserQuestion
**Linear Issue:** [SUG-229](https://linear.app/sugartown/issue/SUG-229)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-229 — Convert remaining human-gate skills to AskUserQuestion

Follow-on to [SUG-227](https://linear.app/sugartown/issue/SUG-227). Converts the 11 skills/docs SUG-227's audit identified but deliberately left out of pilot scope, using the taxonomy and standard SUG-227 already shipped.

## Background

SUG-227 audited all 15 active `.claude/skills/*/SKILL.md` files and their target docs, found 44 human-response gates (93% free-text/exact-phrase), defined a 5-category taxonomy and an `AskUserQuestion` response-mechanism standard (`docs/conventions/human-gate-conventions.md`), and piloted the conversion on two reference implementations: `/release` (7 gates, single-select category) and `/red-pen` (row-level multi-select batch category). It deliberately scoped out full conversion of the remaining 11 skills/docs as a pilot-only decision, and recorded them in a Deferred Conversion Inventory table in its own epic doc.

This epic exists because a doc-section inventory with no Linear tracking is exactly the shape of thing that gets silently forgotten — flagged directly by Bex when SUG-227's close-out was proposed without a tracked follow-on. SUG-229 gives the deferred list an actual queue position instead of letting it live only as a paragraph in a shipped doc.

Reference surfaces: `docs/mini-release-prompt.md`, `docs/workflows/morning-housekeeping-prompt.md`, `docs/workflows/eod-prompt.md`, `docs/switch-prompt.md`, `.claude/skills/new-epic/docs/new-epic-prompt.md`, `docs/glossy-prompt.md`, `docs/chromatic-prompt.md`, `docs/epic-template.md`, `.claude/skills/update-cwv/skill.md`, `.claude/skills/sugartown-prd-writer/SKILL.md`, `.claude/skills/sugartown-epic-writer/SKILL.md`.

## Objective

After this epic: every remaining select-list and multi-select-batch gate in the corpus (per SUG-227's taxonomy) uses `AskUserQuestion` instead of typed exact-phrase confirmation, and the two identified gaps (`sugartown-prd-writer`, `sugartown-epic-writer` — currently no approval gate at all before writing their output file) have a select-list gate added. Open-ended intake gates (category 3, e.g. `/becky-boop`) are explicitly out of scope — they're correctly free text already. This epic touches only the tooling/instruction layer, same boundary as SUG-227: no schema, query, or render-layer changes.

## Scope

- [ ] Convert `/mini-release`'s 4 gates (`docs/mini-release-prompt.md`) — layer: tooling (workflow prompt doc)
- [ ] Convert `/morning`'s 3 gates (`docs/workflows/morning-housekeeping-prompt.md`) — layer: tooling
- [ ] Convert `/eod`'s 4 gates (`docs/workflows/eod-prompt.md`), including a "Stop — let me review again" option on the push-confirmation gate — layer: tooling
- [ ] Convert `/switch`'s 6 gates (`docs/switch-prompt.md`) — layer: tooling
- [ ] Convert `/new-epic`'s Step 0 GATHER to a structured multi-field intake (`AskUserQuestion` for priority + merge strategy, free text for name/description) plus its 2 remaining select-list gates — layer: tooling (skill doc), validates the structured-intake category for the first time
- [ ] Convert `/glossy`'s 2 content gates (`docs/glossy-prompt.md`), reusing the multi-select chunking spec from SUG-227 Phase 3 for batch mode's Gate 1 — layer: tooling
- [ ] Convert `/chromatic`'s 2 gates (`docs/chromatic-prompt.md`) — layer: tooling
- [ ] Convert `docs/epic-template.md`'s Phase 0 sign-off and Visual QA Gate (the strictest remaining exact-phrase gate, "Visual QA approved") — layer: tooling (governance doc, NOT covered by SUG-227's CLAUDE.md pointer since this file restates its own language)
- [ ] Convert `/update-cwv`'s 2 gates (`.claude/skills/update-cwv/skill.md`) — layer: tooling
- [ ] Add a select-list gate to `sugartown-prd-writer` before it writes the PRD file (currently has none) — layer: tooling, this is a gap-fill, not a conversion
- [ ] Add a select-list gate to `sugartown-epic-writer` before it writes the epic execution prompt file (currently has none) — layer: tooling, same gap-fill

## Phases

**Phase 1 — High-priority, every-session skills.** `/mini-release`, `/morning`, `/eod`. Highest leverage: these three run at the start/end of nearly every session.

**Phase 2 — Medium-priority skills.** `/switch`, `/new-epic`, `/glossy`, `/chromatic`, `docs/epic-template.md`. `/new-epic` is the first real test of the structured multi-field intake category.

**Phase 3 — Low-priority + gap-fills.** `/update-cwv`, plus adding the missing gate to `sugartown-prd-writer` and `sugartown-epic-writer`.

Each phase ships as its own commit/mini-release per the merge-as-you-go strategy — activation can further split a phase into per-skill commits if a phase's diff review gets unwieldy across multiple files.

## Acceptance criteria

- [ ] All 4 `/mini-release` gates, all 3 `/morning` gates, and all 4 `/eod` gates use `AskUserQuestion` — diff shown and approved before each commit
- [ ] `/switch`'s 6 gates, `/new-epic`'s Step 0 + 2 gates, `/glossy`'s 2 gates, `/chromatic`'s 2 gates, and `docs/epic-template.md`'s Phase 0 + Visual QA gates all use `AskUserQuestion` — diff shown and approved before each commit
- [ ] `/update-cwv`'s 2 gates use `AskUserQuestion`; `sugartown-prd-writer` and `sugartown-epic-writer` each gain a new select-list gate before their file-write step — diff shown and approved before each commit
- [ ] A manual dry-run per phase confirms at least one converted gate renders as a clickable option list
- [ ] Every file this epic edits has its diff shown and explicit approval obtained before the corresponding commit, per CLAUDE.md's Instruction & Rule File Write Gate

## Human QA Walkthrough — example local pages

Not applicable — no CSS, layout token, or component changes, same boundary as SUG-227.

## Technical notes

- **Instruction & Rule File Write Gate fires on every file this epic touches** (all are under `.claude/skills/**` or its referenced docs, or `docs/epic-template.md`) — each phase's commits are gated individually per file, same discipline as SUG-227.
- **Reuse, don't re-derive:** the taxonomy, mechanism, and known `AskUserQuestion` tool constraints (4 questions/call, 2-4 options/question, 16-item batch ceiling) are already documented in `docs/conventions/human-gate-conventions.md` — read it before drafting any conversion, do not re-audit the gates from scratch (SUG-227's audit + this epic's Scope bullets already have the gate inventory per file).
- **`/new-epic`'s Step 0 is the first structured multi-field intake conversion** — validates category 4 of the taxonomy for the first time (SUG-227 only validated categories 1 and 2). Treat it as a second reference implementation, not just another conversion.
- **`sugartown-prd-writer` and `sugartown-epic-writer` are gap-fills, not conversions** — designing a new gate from scratch (option labels, when it fires) rather than translating existing free-text language. Give these their own diff-approval ask distinct from "does this match the existing gate" framing.

## Model & Mode [REQUIRED]

`/model sonnet` — same rationale as SUG-227: well-scoped doc/prompt editing against an already-defined taxonomy, no architectural ambiguity.

## Non-Goals

- **Converting `/becky-boop` or any other genuinely open-ended intake gate.** Category 3 per the taxonomy — correctly free text, no conversion applies.
- **Changing any gate's underlying approval requirement or strictness**, same as SUG-227 — mechanism only, never whether a response is required.
- **Re-auditing the gate corpus.** The inventory is already written (SUG-227's Deferred Conversion Inventory); this epic executes against it rather than re-discovering it.

## Related

- **Linear:** [SUG-229](https://linear.app/sugartown/issue/SUG-229)
- **Parent/originating epic:** [SUG-227](https://linear.app/sugartown/issue/SUG-227) — `docs/shipped/SUG-227-formalize-ai-claude-workflow.md` (Deferred Conversion Inventory table is the source for this epic's Scope)
- **Convention doc:** `docs/conventions/human-gate-conventions.md`
- **Epic template:** `docs/epic-template.md`
