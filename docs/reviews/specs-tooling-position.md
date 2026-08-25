# Specs tooling — Sugartown's position

**Position record.** Written 2026-08-21 from a Nathan Curtis LinkedIn post arguing that
deterministic design-system specs tooling beats LLM inference, and that the market picked
inference for economic rather than technical reasons.

**Measured at:** v0.35.0, branch `claude/specs-tooling-philosophy-94siy9`.

**Summary:** Sugartown already holds the deterministic position Curtis argues for, in the
token layer and in the agent-context layer, and inverted his problem by making code the
design source of truth instead of Figma. Two of his claims land as open gaps: the visual
spec does not survive the epic that produced it, and the component register is generated but
never regenerated.

---

## What the source post argues

Curtis's post makes five claims about specs tooling for design systems.

| # | Claim |
|---|---|
| 1 | The vendors selling the inference alternative are paid in tokens, so the economics select against a deterministic pipeline that runs in 1.5s of CPU |
| 2 | Determinism forces a confrontation inference lets you dodge: conventions burden authoring, and inference is a way to avoid telling designers their file is wrong |
| 3 | Design tokens are the counter-evidence hiding in plain sight: DTCG and Style Dictionary gave tokens a schema, and nobody uses an LLM to guess token values. Components never got that schema |
| 4 | Demo economics run backwards: inference demos in 30 seconds on any file, a spec pipeline demos only after a library meets conventions |
| 5 | The market framed the wrong problem. "Generate a component" is one-shot; the design systems problem is lifecycle, and without determinism there is no diff, no regen, no trust the second time |

His caveat: for someone with no governed library, inference is the only move. His closing
claim: an agent working on top of the spec beats an agent staring at pixels, because it
inherits ground truth instead of re-deriving it.

## Claim 3 is Sugartown's shipped token pipeline

Sugartown ran the deterministic token play Curtis names, and enforces it mechanically.

| Element | Evidence | Class |
|---|---|---|
| One token source | `tokens/source/tokens.json` | enforced-by-code |
| Deterministic build | `sd.config.mjs`, Style Dictionary v5, `pnpm tokens:build` (SUG-86) | enforced-by-code |
| 655 generated declarations | `grep -c "^  --st-" apps/web/src/design-system/styles/tokens.css` → 655 (2026-08-21) | measured |
| Hand edits to generated output blocked | `.husky/pre-commit` "Do not edit directly" check | enforced-by-code |
| Every `var(--st-*)` resolves | `pnpm validate:tokens` | enforced-by-code |
| No raw hex or rgba in component CSS | `pnpm validate:tokens --strict-colors` | enforced-by-code |
| Mirrored style files stay byte-identical | `pnpm validate:style-mirror` | enforced-by-code |
| No inline custom-property injection, no `var(--st-token, #hex)` fallback | CLAUDE.md §DS Component Authoring — Token-First Rule | convention |

No model participates in any step. This is Curtis's "where a schema exists, determinism wins
totally", implemented and enforced at commit time.

## Claim 2 is the Phase 0 gate and the handoff anti-checklist

Curtis's sharpest line, that inference is a way to avoid telling designers their file is
wrong, has a direct Sugartown counterpart: telling the handoff it is wrong is a documented,
blocking step.

- `docs/conventions/design-handoff-template.md` runs an anti-checklist over any external
  design handoff, flagging framework assumptions, invented schema fields, literal URL paths,
  content-type-prefixed CSS classes, and PT-replacement arrays. Corrections are surfaced
  before Phase 0 sign-off.
- CLAUDE.md §Phase 0 visual spec gate blocks all code in `apps/web/src/` and
  `apps/studio/schemas/` until an approved vspec exists.
- Vspec class names are the production class names, so the spec binds the implementation
  rather than describing it.

The authoring burden Curtis says almost nobody accepts is visible as CLAUDE.md's own size:
941 lines (`wc -l CLAUDE.md`, 2026-08-21).

## Claim 5 is the close-out sequence, stated as a rule

Sugartown's governance is organized around the second time, which is Curtis's lifecycle
argument in different words.

CLAUDE.md §Building a mechanism rule 3 states it directly: "A register is generated or it
does not exist. Any table mapping IDs to owners, files to states, or rules to enforcement is
derived from the repo by a command, never hand-maintained." Supporting machinery: the
vspec-to-build comparison table at the Visual QA gate, `validate:style-mirror`,
`validate:dead-refs`, Chromatic VRT, and the epic close-out sequence.

## The closing claim is the MCP server's reason to exist

Curtis's "an agent working on top of the spec beats an agent staring at pixels" describes
`packages/mcp-server`, which serves ground truth to the agent instead of making it re-derive
ground truth from source files.

Eight read-only tools: `sugartown_get_schema` (AST-parsed from
`apps/studio/schemas/documents/*.ts`), `sugartown_get_tokens` (resolved values plus
mirror-drift detection), `sugartown_get_component` (existence plus nearest-name
suggestions), `sugartown_check_boundary`, `sugartown_get_rule`, `sugartown_validate_field`,
`sugartown_get_epic`, `sugartown_get_changelog`. CLAUDE.md's first instruction is to call
`sugartown_get_epic()` and `sugartown_get_changelog(3)` at session start, before acting.

## Sugartown inverted the arrow Curtis is arguing about

Curtis's problem space is Figma to code: extract specs from a design file that may not meet
conventions. Sugartown's design source of truth is not Figma. It is hand-authored HTML
vspecs plus the code, stated outright in `docs/backlog/SUG-206-property-cluster-hypertoken-drift-audit.md`:
"Sugartown's design source of truth is hand-authored HTML mocks (`docs/drafts/`), not
Figma."

SUG-109 (shipped 2026-05-13) ran the pipeline the other way: `tokens.json` to Figma
variables to component frames to Code Connect. Sugartown did not solve the extraction
problem, it removed the need for one. The convention burden Curtis describes still exists,
but it falls on the vspec author rather than on a Figma librarian.

## Claim 1's economics do not bind Sugartown, and the inverse cost is measured

Sugartown is not selling a specs pipeline, so "everyone selling the alternative is paid in
tokens" has no commercial force here. The inverse cost is real and measured:
`docs/briefs/agent-operability-prd.md` records 24 decision prompts against 19 human messages
in one session (2026-08-08), and 3 failures across the last 10 CI runs on `main`, all three
caused by gates added in the previous 10 days, none of which caught a product defect.

Determinism is not free in this repo. It is billed in human attention rather than in tokens.

## Sugartown holds both sides of the argument deliberately

Curtis's caveat, that inference is the only move for someone with no governed library, is
already a Sugartown product spec. `docs/briefs/design-alignment-checker-prd.md` describes a
vision-plus-inference alignment checker with an explicit non-goal of repo-level checks,
built for PMs, designers, and artists with no repo access.

The split is deliberate: determinism inside the governed library, inference outside it.

## Gap 1 — the spec does not survive the epic

The vspec that governs an epic is deleted in practice, so there is nothing to diff or
regenerate against later.

`docs/drafts/` is gitignored and local-only per CLAUDE.md §Local-only directories, so every
vspec that governed a shipped epic is absent from the repo. The preserve-the-vspec rule
(close-out step 6b) was added on 2026-08-15 (`git log -S "Preserve the vspec" -- CLAUDE.md`).
As of 2026-08-21, `ls docs/shipped/*.vspec.html` returns 0 files, while 11 shipped epic docs
reference a vspec (`grep -rl "vspec" docs/shipped/*.md | wc -l`).

Curtis's claim 5 applies to Sugartown here: no spec in the repo means no diff, no regen, and
no trust the second time.

## Gap 2 — the component register is generated but never regenerated

Sugartown's component register is stale by 30 components, because nothing runs the generator.

`component-registry.json` carries `"generated": "2026-04-27"` and lists 12 components.
Running `node scripts/registry-build.js` on 2026-08-21 produces 42 (verified, then reverted;
tree left clean). `registry:build` appears in `package.json` only: no pre-commit hook, no CI
job, no turbo task (`grep -rn "registry:build\|registry-build" .github/ package.json turbo.json .husky/`).

The register's `spec` field looks for `*_SPEC.md` or `*_spec.md` beside each component and
finds none, so every component's spec slot is `null`. This is the layer Curtis says
components never got, and Sugartown does not have it either. A register that is generated
but not regenerated is the stale document that CLAUDE.md rule 3 exists to prevent.

## What this record does not do

This record does not propose adopting a Figma extraction pipeline, and does not evaluate any
third-party specs tool. The two gaps above are tracked as issues; closing them is scoped
separately.

| Gap | Issue |
|---|---|
| Vspecs do not survive their epic | [#104](https://github.com/bex-sugartown/sugartown/issues/104) |
| Component register never regenerated | [#105](https://github.com/bex-sugartown/sugartown/issues/105) |
