---
**Epic:** SUG-195 — Design-Reviewer Subagent — VQA Gate Automation
**Linear Issue:** [SUG-195](https://linear.app/sugartown/issue/SUG-195/design-reviewer-subagent-vqa-gate-automation)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-195 — Design-Reviewer Subagent — VQA Gate Automation

Build a `.claude/agents/design-reviewer.md` subagent that checks implemented components and pages against Sugartown's design tokens, CLAUDE.md visual QA rules, and Phase 0 mocks — flagging drift before it ships, in a fresh context that can't rationalise what it just built.

## Background

Sugartown's current VQA process is manual: after every implementation epic, CLAUDE.md requires a mock-to-implementation comparison table listing every visual element as Match / Drift / Missing, presented to the user before close-out. This gate works, but it runs in the same context that built the component — the same model that wrote the CSS is also deciding whether the CSS matches the spec. That creates an inherent rationalisation bias: the builder leans toward "looks done" rather than "matches the brief."

Carmen Rincon's design-reviewer pattern (Claude Code subagent post, 2026-06) identifies the structural fix: a separate agent with read-only tools, its own fresh context, and no visibility into the implementation session. It knows the project rules (via CLAUDE.md) but not the excuses. For Sugartown this maps directly onto the existing VQA gate — the subagent produces the comparison table, flags token violations, and reports missing states, replacing the ad-hoc self-review with a structured automated check.

## Objective

After this epic, a `.claude/agents/design-reviewer.md` subagent exists in the repo that can be invoked with "use the design-reviewer subagent to review [component/page]". It reads the Phase 0 mock (if one exists), the relevant CSS module and JSX, `tokens.css`, and CLAUDE.md visual rules, then outputs a Match / Drift / Missing table covering typography, spacing, colour, layout, and component choice. It flags only violations — not style preferences, not speculative improvements. The main session's VQA gate invocation remains unchanged; the subagent produces the evidence the gate requires.

## Scope

- [ ] **Create `.claude/agents/design-reviewer.md`** with `tools: Read, Grep, Glob, Bash` (no Write) and a system prompt scoped to Sugartown's VQA criteria. Layer: tooling
- [ ] **System prompt covers all Sugartown VQA dimensions:** token compliance (every `background`, `color`, `font-*` references a `--st-*` token), Phase 0 mock comparison (if a `docs/drafts/SUG-{N}-*.html` mock exists), component choice audit (checks for DS primitive reuse vs new component), spacing contract (section-break tokens, no hardcoded `px` margin), and CSS class naming conventions. Layer: tooling
- [ ] **Output format:** structured Match / Drift / Missing table per CLAUDE.md VQA gate format, with file and line references where possible. Severity levels: Blocker (breaks the spec gate) vs Note (informational). Layer: tooling
- [ ] **Model selection:** configure the subagent to use `claude-haiku-4-5-20251001` (fast, cheap) so it can run after every implementation commit without session cost concern. Layer: tooling
- [ ] **Invocation documentation:** add a `## Design-Reviewer Subagent` section to `docs/conventions/vqa-workflow.md` (create if absent) covering the invocation pattern, what the subagent reads, and how its output maps to the CLAUDE.md VQA gate table. Layer: documentation
- [ ] **Smoke-test the subagent** against one existing shipped component (e.g. MetadataCard or IndexCell) and verify the output catches at least one known past drift item from the shipped epic doc, or reports clean if genuinely clean. Layer: validation

## Acceptance criteria

- [ ] `.claude/agents/design-reviewer.md` exists with `tools: Read, Grep, Glob, Bash` — no Write tool present
- [ ] Invoking "use the design-reviewer subagent to review [component]" from the main session produces a Match / Drift / Missing table without the agent making any file edits
- [ ] The table format matches the CLAUDE.md VQA gate structure (every visual element flagged as Match, Drift, or Missing)
- [ ] Token check catches any `background-color: #hex` or `color: rgba()` in the reviewed CSS (i.e. a hardcoded value surfaces as a Drift row)
- [ ] If a Phase 0 mock exists at `docs/drafts/SUG-{N}-*.html`, the subagent reads it and compares — it does not silently skip mock comparison when a mock is present
- [ ] Smoke test against one shipped component produces output (pass or fail) without error
- [ ] Subagent is configured to use `claude-haiku-4-5-20251001`

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes. This epic creates a tooling agent file only.

## Technical notes

**Activation audits before writing the agent file:**
1. Check whether a `vqa-workflow.md` doc already exists: `find docs/conventions -name "*vqa*"`
2. Read `CLAUDE.md` §Visual Verification Rules and §Phase 0 hard-stop to extract the exact VQA dimensions the agent system prompt must cover — the prompt must match these exactly, not paraphrase them
3. Read `.claude/agents/` to see if any other agents already exist and follow the same frontmatter format: `ls .claude/agents/` — if the directory doesn't exist yet, create it

**Agent file format** (from Carmen Rincon's pattern + Claude Code agent spec):
```markdown
---
name: design-reviewer
description: Reviews a built component or page against Phase 0 mocks, token rules, CLAUDE.md VQA criteria, and DS component-choice conventions. Use after any implementation commit.
model: claude-haiku-4-5-20251001
tools: Read, Grep, Glob, Bash
---

[system prompt body — see Scope bullets for required coverage]
```

**Scope discipline:** the agent must be told to flag only what breaks the spec. A reviewer asked to "find problems" will always find something. The system prompt must include an explicit instruction: "If something is correct and matches the spec, say so and move on. Do not flag style preferences, speculative improvements, or anything not covered by the criteria above."

**No Write tool:** this is a hard constraint. The agent proposes; the main session decides and acts. Adding Write would allow the agent to silently modify files, which defeats the independent-review guarantee.

**VQA dimensions to cover in the system prompt:**
- Token compliance: every `background`, `color`, `border-color`, `font-*` property in the reviewed CSS module must reference a `--st-*` token. Flag any raw hex, rgba, or hsla as Drift.
- Phase 0 mock comparison: if `docs/drafts/SUG-{N}-*.html` exists for the epic, read it and compare typography (font-family, size, weight), spacing (gap, padding, margin values mapped to tokens), colour (bg, fg, border), and layout (flex/grid structure) against the implementation.
- Component choice: verify DS primitive reuse. If the implementation contains a `<table>` not wrapping `<Table>`, a `<button>` not wrapping `<Button>`, or similar, flag as Drift.
- Spacing contract: verify no hardcoded `px` values in `margin` or `padding` that should be token references. Check `gap` values against the token scale.
- CSS class naming: no location-named or content-type-prefixed class names (e.g. `.toolUrl`, `.tagRow`). Semantic names only per CLAUDE.md naming conventions.
- Dark mode: if a `dark-pink-moon` story variant is expected, verify the component has dark-mode token overrides.

**Model & Mode [REQUIRED]:** `/model sonnet` — this is a single-file tooling epic, no architecture decisions required. The agent file itself is authored; no code or schema changes.

## Non-Goals

- Does not replace the human "Visual QA approved" sign-off — the subagent produces evidence; the human still approves
- Does not cover Chromatic VRT — that is a separate gate for snapshot regression
- Does not review Sanity Studio UI or content quality — only web app CSS and component structure
- Does not auto-fix drift — output is read-only by design
- Does not run in CI — this is an on-demand invocation tool, not an automated pipeline step (that could be a follow-on SUG)

## Related

- **Linear:** [SUG-195](https://linear.app/sugartown/issue/SUG-195/design-reviewer-subagent-vqa-gate-automation)
- **Source concept:** Carmen Rincon, "Design-reviewer sub agent in Claude Code" (2026-06)
- **CLAUDE.md §Visual Verification Rules** — the dimensions this agent must cover
- **CLAUDE.md §Phase 0 hard-stop** — mock gate this agent automates evidence for
- **Epic template:** `docs/epic-template.md`
