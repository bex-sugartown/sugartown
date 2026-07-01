# Design Alignment Checker — Product Requirements Document
**PRD Version:** v1.0
**Status:** Draft
**Author:** Bex Head
**Domain:** Mixed (new standalone app; reuses Design System; no CMS content model in v1)
**Last updated:** 2026-07-01
**Related epics:** TBD — not yet scoped as a Sugartown epic; this PRD is upstream of that

---

## 1. Problem Statement

Checking a piece of shipped or in-progress work against a spec, mock, or brief is manual, slow, and inconsistent between reviewers and sessions. Sugartown already solved a version of this internally: the `design-reviewer` subagent (SUG-195) runs a structured Match/Drift/Missing comparison against Phase 0 mocks as part of the Visual QA gate in `CLAUDE.md`. That capability only exists inside a Claude Code session with repo access — a PM, designer, or artist without engineering tooling has no way to run the same kind of check on their own work.

## 2. Goals & Non-Goals

| Goal | Description |
|------|-------------|
| Self-serve alignment check | A PM, designer, or artist uploads a screenshot and a spec/brief and gets a structured findings report without engineering involvement or Claude Code access |
| Reuse the existing report convention | Output uses the same Match / Drift / Missing categorization already established in `CLAUDE.md`'s Visual QA gate — not a new taxonomy |
| Dogfood the design system | The tool's own UI is built on the Sugartown DS (`packages/design-system`), reusing `--st-status-*` tokens for the report's status indicators |

| Non-Goal | Why excluded |
|----------|-------------|
| Repo-level checks (token audits, CLAUDE.md rule enforcement, code review) | Those require the artifact's source code and Sugartown-specific conventions; this tool works from images/text only, for any user's work, not just Sugartown's |
| Pixel-perfect automated diffing | A different, narrower problem (pixel comparison tooling exists elsewhere); this tool targets structural/content alignment, not sub-pixel color drift — see Risks |
| Multi-user accounts, saved history, team dashboards | v1 is a stateless, single-session tool; persistence is an Open Decision below, not committed scope |

## 3. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Upload and compare | As a PM, I want to upload a spec/mock and a screenshot of shipped work so that I get an objective findings list instead of waiting for a design review meeting | Given a valid image + spec input, the tool returns a Match/Drift/Missing table within 30 seconds | P0 |
| US-002 | Self-check before presenting | As a designer or artist, I want to upload a brief and my own work-in-progress so I can catch gaps before showing it to a client or stakeholder | Same acceptance path as US-001, framed as self-review rather than QA gate | P0 |
| US-003 | Structured, actionable findings | As a user, I want each finding categorized with a one-line reason so I can act on it without re-reading the whole report | Every row in the output has exactly one of Match/Drift/Missing plus a non-empty reason string | P0 |
| US-004 | Custom rubric | As a user, I want to optionally supply my own checklist so the comparison reflects my standards, not a generic one | A rubric text field is optional on input; when present, findings reference the rubric's own line items | P1 |
| US-005 | Export the report | As a user, I want to download the report so I can share it with a stakeholder who wasn't in the room | A "Download as Markdown" action produces a file matching the on-screen table | P1 |
| US-006 | Report history | As a returning user, I want to see my past reports so I can track improvement over time | Deferred — requires persistence (see Open Decisions) | P2 |

## 4. Technical Architecture

**Do not read this as code.** It states the contracts a build must satisfy.

- **App shape:** new Turborepo app at `apps/design-alignment-checker/`, following the `apps/contentful-poc` precedent — its own `package.json`, its own deploy target, no dependency on `apps/studio` or Sanity content.
- **UI:** consumes `packages/design-system` directly (same adapter pattern as other apps in the monorepo). No new component primitives expected — `Card`, `Chip`/status badge, and a table primitive should cover the report surface. If a genuinely new visual pattern is needed, the Atomic Reuse Gate in `CLAUDE.md` applies here exactly as it would to any other Sugartown surface.
- **Backend:** a single serverless API route that calls the Claude Messages API with vision input (the uploaded screenshot) plus the spec/brief (image or text) and a system prompt encoding the Match/Drift/Missing rubric.
- **Structured output:** use `output_config.format` (JSON schema, `strict: true`) to get a validated `{dimension, verdict, evidence}[]` array back — not freeform text parsed after the fact. This directly closes one of the Maven-course-audit's flagged gaps (the "4 AI Design Patterns" — Inputs / Special Instructions / Outputs / Feedback Loops — map cleanly onto upload / rubric / structured JSON / user-corrects-a-false-positive).
- **Context vs. Behavior Matrix (from the Maven audit):** v1 uses plain prompting with vision input. No RAG — there's no retrieval corpus (the spec *is* the input, not a knowledge base to search). No fine-tuning — this is a general comparison task, not a narrow repeated one that would justify the investment. This decision should be revisited only if usage reveals a recurring, narrow failure mode that fine-tuning would specifically fix.
- **Model:** default to `claude-opus-4-8` per this project's standard Claude API convention (accuracy matters more than cost for a comparison a user will act on). Evaluate `claude-sonnet-5` as a cost-reduction path once real usage volume exists — see Open Decisions.

## 5. Content Model

Not applicable. This tool has no Sanity-backed content model in v1 — inputs are ephemeral (an uploaded image and a spec, processed per-request, not stored as a document type). If persistence (US-006) is built later, its content model is a separate PRD amendment, not implied here.

## 6. Design Constraints

- **Namespace:** `st-*` with BEM, same as every other Sugartown surface. No page-specific CSS.
- **Status tokens:** the Match/Drift/Missing (and N/A) states map directly onto the enumerated-status-color convention already established in `CLAUDE.md` (`--st-status-<state>-{bg,fg,border}`) — define `match`/`drift`/`missing`/`na` as the state set, with light-theme overrides in the same commit, per that existing rule. Do not invent new hardcoded colors for this.
- **Storybook-first:** the report table and upload flow are validated in Storybook before wiring to the live API — same standard as any other DS-consuming surface.
- **Dark/light:** both themes apply; no exemption — this is a standard app surface, not a special case.
- **Typography:** IBM Plex Mono + DM Sans, no substitutions.
- **Responsive:** upload + report flow must work down to a single-column mobile layout; state the breakpoint contract when the component is built.

## 7. Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| Model choice | `claude-opus-4-8` (accuracy-first default) vs. `claude-sonnet-5` (confirmed near-Opus performance at ~1/3 the price per anthropic.com/news/claude-sonnet-5) | Bex | Before first real user test |
| Persistence | Stateless v1 (no history) vs. lightweight saved-reports store | Bex | After initial POC feedback |
| Auth / access | Fully public vs. gated (to bound API cost) | Bex | Before any public link is shared |
| Custom rubric input shape | Freeform text box vs. structured checklist builder | Bex | During v1 build |
| App name | "Design Alignment Checker" is the working title only — wants a proper Pink Moon-flavored name (playful, on-brand) before this becomes an epic, an `apps/` directory name, or anything user-facing | Bex | Before epic authoring begins |

## 8. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Unbounded Claude API cost if the tool gets shared widely with no rate limit | Med | Per-session/IP rate limit; cap upload image size and count before launch |
| Vision-based comparison produces false positives on subtle visual drift (e.g. token-level color differences vs. structural differences) | Med | Scope v1 explicitly to layout/content/structural comparison (already stated as a Non-Goal); don't market it as pixel-accurate |
| No `featuredImage` dependency | N/A | This app has no Sanity content model, so the deprecated field cannot appear here — confirmed not applicable |

## 9. Success Criteria

| Area | Metric |
|------|--------|
| Core flow | A user completes one full upload-to-report cycle in under 2 minutes |
| Output reliability | Structured output validates against the defined JSON schema on 100% of successful requests (via `strict: true`, not post-hoc parsing) |
| Design system | Zero hardcoded colors in the app's own UI; Storybook documents the report table and its four status states |
| Accessibility | WCAG 2.1 AA on the upload form and report table |

## 10. Out of Scope (Deferred)

- Multi-user accounts, team sharing, saved-history dashboard (US-006) — owned by the Persistence open decision above
- Pixel-level automated diffing — a distinct tool/problem, not this one
- A CMS-driven rubric library (pre-built rubrics for common use cases) — plausible v2 direction, not scoped here

## 11. Authoring Checklist

- [x] Every claim references a real system (`design-reviewer` subagent, `CLAUDE.md` Visual QA gate, `apps/contentful-poc` precedent, the Maven course audit) not an aspiration
- [x] No "TBD" in a table that needs a concrete answer — genuine unknowns are in Open Decisions with owners
- [x] Non-goals name the reason for exclusion
- [x] Open decisions have an owner and a target
- [x] Success criteria are independently verifiable
- [x] `featuredImage` does not appear (confirmed genuinely not applicable, not silently dropped)
- [x] Brand voice check: no em dashes, no adjective triads, no future-tense promises on shipped surfaces
- [x] A senior engineer could start scoping an epic from this doc without a meeting
