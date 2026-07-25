# Visual QA Workflow

**Origin:** SUG-195 (2026-06-30). Sugartown's VQA gate is defined in CLAUDE.md
§Visual Verification Rules: after every implementation epic, a vspec-to-build
comparison table flags every visual element as Match / Drift /
Missing, presented to Bex before close-out, blocked until the explicit text
**"Visual QA approved."**

That gate is unchanged. This doc covers the tool that produces its evidence.

---

## The rationalisation problem

The VQA table has always been authored by the same session that wrote the code.
The model that wrote the CSS is also deciding whether the CSS matches the spec —
an inherent bias toward "looks done" over "matches the brief." The
design-reviewer subagent removes that bias by running the check in a fresh
context with no visibility into the implementation session: it knows the rules,
not the excuses.

Source concept: Carmen Rincon, "Design-reviewer sub agent in Claude Code"
(2026-06).

## The Design-Reviewer Subagent

**File:** [`.claude/agents/design-reviewer.md`](../../.claude/agents/design-reviewer.md)
**Model:** `claude-haiku-4-5-20251001` (fast and cheap — runs after every
implementation commit without session-cost concern).
**Tools:** `Read, Grep, Glob, Bash` — **no Write**. The agent proposes; the main
session decides and acts. The missing Write tool is the independent-review
guarantee, not an oversight.

### Invocation

From the main session, after an implementation commit:

> use the design-reviewer subagent to review [component or page]

Examples:

> use the design-reviewer subagent to review the MetadataCard component
> use the design-reviewer subagent to review ProjectDetailPage

### What it reads

- The component/page CSS module and JSX under `apps/web/src/`.
- The Phase 0 vspec at `docs/drafts/SUG-{N}-*.vspec.html`, if one exists.
- The token source of truth `apps/web/src/design-system/styles/tokens.css`.
- It may run `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors`
  for corroboration.

### What it checks

Six dimensions, each mapped to a CLAUDE.md rule:

1. **Token compliance** — every colour/font property resolves through a
   `--st-*` token; raw hex/rgba/hsla is a Blocker; referenced tokens must exist.
2. **Phase 0 vspec comparison** — typography, spacing, colour, layout against the
   vspec when one is present.
3. **Component choice** — DS-primitive reuse; raw `<table>`/`<button>` or
   re-implemented primitives are Drift.
4. **Spacing contract** — no hardcoded `px` margins/padding; section-break
   tokens; parent-owns-gap.
5. **CSS class naming** — semantic names only; no location- or content-type
   prefixes.
6. **Dark mode** — `dark-pink-moon` token overrides present where expected.

### Output → the CLAUDE.md VQA gate

The subagent emits a Match / Drift / Missing table with file/line references and
Blocker/Note severity, ending in a verdict (Blocker count + clears-the-gate?).
That table **is** the evidence the CLAUDE.md VQA gate requires. The main session
presents it to Bex; Bex gives the "Visual QA approved" sign-off. The subagent
does not replace the human approval — it replaces the ad-hoc self-review that
used to stand in for structured evidence.

## What this does not do

- Does not give the final sign-off — the human still approves.
- Does not cover Chromatic VRT — that is a separate snapshot-regression gate.
- Does not review Sanity Studio UI or content quality — web CSS and component
  structure only.
- Does not auto-fix drift — read-only by design.
- Does not run in CI — on-demand invocation, not a pipeline step.
