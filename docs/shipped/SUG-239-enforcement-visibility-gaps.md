---
**Epic:** SUG-239 — Close the enforcement-visibility gaps (orphaned validators + design-reviewer wiring)
**Linear Issue:** [SUG-239](https://linear.app/sugartown/issue/SUG-239/close-the-enforcement-visibility-gaps-orphaned-validators-design)
**Status:** Backlog
**Priority:** 🟢 Next — the docs currently claim coverage that doesn't exist
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-239 — Close the enforcement-visibility gaps

Two unrelated-looking findings from `docs/drafts/workflow-audit-v0.3-grounded.md` share
one root cause: something CLAUDE.md describes as enforced is not actually running. Fix
both in one small epic because the fix shape is identical — wire up what already exists,
build nothing new.

## Template adaptation — declared once

Process/tooling epic. No Sanity schema, GROQ, or render-layer work.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No visual surface |
| Doc Type Coverage Audit | N/A | No content doc type touched |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Themed Colour Variant Audit | N/A | No themed surface touched |
| Migration Script Constraints | N/A | No data transform |
| Human QA Walkthrough | N/A | No CSS/layout/component rendering |
| Visual QA Gate | N/A | No visual output |

Phase 0 does not fire — no rendered surface changes.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `.husky/pre-commit`, `.github/workflows/ci.yml`,
  `package.json` (root + `apps/web/`), `CLAUDE.md` — all confirmed present during the
  originating audit
- [x] **Scope ↔ Non-Goals consistency** — checked, no contradiction
- [ ] **Instruction & Rule File Write Gate pre-flight** — Phase 2 edits `CLAUDE.md`
  directly (close-out step 3). Diff must be shown and approved before writing, per the
  existing hard stop. Epic approval here is not diff approval.

## Context [REQUIRED]

**Phase 1 finding:** `validate:css-names` was built by SUG-124 specifically to enforce
the CSS class naming rule CLAUDE.md labels blocking — it found 25 violations and drove
them to zero. It runs on no pre-commit hook and in no CI job. `validate:taxonomy` is the
same story. SUG-162's design handoff notes even warn a future session that a class name
"is blocked by `pnpm validate:css-names`" — it would not have been.

Also found and left as an open decision in the audit: `validate:tokens:sync` is
similarly orphaned, but it's unclear whether it does anything `validate:style-mirror`
doesn't already cover. This epic's Phase 1 includes reading both scripts to decide wire
vs. delete, rather than assuming.

**Decision (recorded during Phase 1 execution): deleted, not wired.**
`validate:tokens:sync` (`validate-tokens.js --check-sync`) diffs `:root` token *values*
between exactly the same two files (`apps/web/.../tokens.css`,
`packages/design-system/.../tokens.css`) that `validate:style-mirror` already requires to
be **byte-identical**. Byte-identical files trivially have identical `:root` values, so
`--check-sync` can never fail when `validate:style-mirror` passes — it is a strict subset
check of a stronger guarantee already enforced elsewhere, and it's weaker in one respect
too (it silently skips web-only keys `pkgTokens` doesn't have, where `validate:style-mirror`
would catch any diff at all). Removed the flag, its two now-dead helper functions
(`extractRootBlock`, `parseTokenBlock`), and the `validate:tokens:sync` script entries from
both `package.json` files.

**Phase 1 finding, discovered during execution (not in the originating audit):**
`apps/studio`'s `validate:schema-parity` is a fourth orphaned validator — the originating
audit only scanned root + `apps/web` package.json files, missing `apps/studio` entirely.
Worse: it isn't just unwired, it's functionally incomplete. `validate-schema-parity.js`
extracts the local schema and tries to fetch deployed schema info via
`npx sanity schema list --json`, but Step 4 (the actual local-vs-deployed type diff) was
never implemented — the script unconditionally prints "run npx sanity schema deploy" and
exits 0 in every case except a hard extraction/parse failure. It can never currently detect
real drift. Wiring a check that can't fail into CI would be checkbox theater, not
enforcement, and completing its comparison logic is new validator work this epic's own
Non-Goals rule out ("wire up what exists, build nothing new"). **Decision: allowlisted in
`validate:validators`'s `MANUAL_BY_DESIGN` with the real reason recorded (not just
"unwired" — "comparison logic incomplete"), and spun off as a separate follow-on task to
implement the real diff and wire it into CI once it can actually fail.**

**Phase 2 finding:** `.claude/agents/design-reviewer.md` exists — fresh context,
read-only by design (`Read, Grep, Glob, Bash`, deliberately no `Write`), six review
dimensions each mapped to a CLAUDE.md rule, documented in
`docs/conventions/vqa-workflow.md` as the fix for exactly the rationalization bias its
own doc describes ("the model that wrote the CSS is also deciding whether the CSS
matches the spec"). CLAUDE.md's close-out step 3 — the single strongest gate in the
system — never names it. Zero mentions across 797 lines.

## Objective [REQUIRED]

After this epic: `validate:css-names` and `validate:taxonomy` run in `.husky/pre-commit`
and fail commits on violation, matching what CLAUDE.md and shipped epic docs already
claim. A new `validate:validators` meta-check asserts every `validate:*` script in any
`package.json` is referenced by a hook or a CI workflow, with an explicit
`MANUAL_BY_DESIGN` allowlist for deliberate exceptions (`validate:content`, which is
already documented as manual-by-design). This class of decay becomes structurally
impossible to repeat silently. Separately, CLAUDE.md's close-out step 3 names the
design-reviewer subagent as the producer of the VQA table's evidence, linking
`docs/conventions/vqa-workflow.md`.

## Scope [REQUIRED]

**Phase 1 — Wire the orphaned validators**
- [ ] Read `scripts/validate-tokens-sync.js` (or equivalent) vs. `validate-style-mirror.js`
  and decide: wire `validate:tokens:sync` into pre-commit, or delete it. Record the
  reasoning in this doc before executing either.
- [ ] Add `validate:css-names` and `validate:taxonomy` to `.husky/pre-commit`
- [ ] Confirm both run clean on the current `main` (zero violations) before landing —
  if either fails, that's a second, larger finding: fix the violations first, in a
  separate commit, before making the check blocking

**Phase 1b — `validate:validators` meta-check**
- [ ] Write `scripts/validate-validators.js`: enumerate every `validate:*` script across
  root + workspace `package.json` files, assert each is referenced by name in
  `.husky/pre-commit` or a `.github/workflows/*.yml` file, or is present in a
  `MANUAL_BY_DESIGN` allowlist with a one-line reason
- [ ] Add to `.husky/pre-commit`
- [ ] Seed the allowlist with `validate:content` (already documented as manual,
  requires Sanity API)

**Phase 2 — Name the design-reviewer in close-out**
- [ ] CLAUDE.md close-out step 3 (Visual QA gate): add a sentence naming the
  design-reviewer subagent as the way to produce the Match/Drift/Missing table's
  evidence, linking `docs/conventions/vqa-workflow.md`. Human approval requirement
  ("Visual QA approved") is unchanged — this only changes how the evidence gets
  produced, not who signs off.
- [ ] **Diff shown, explicit approval received, before the `Edit` call** — this is the
  Instruction & Rule File Write Gate, not optional.

## Non-Goals [REQUIRED]

- **Retroactively re-validating every past commit against the now-enforced rules.** If
  Phase 1's clean-`main` check fails, that's scoped as a blocking prerequisite within
  this epic, not a separate historical audit.
- **Building new validators.** This epic wires up what exists. Nothing new is invented
  except the thin `validate:validators` meta-check.
- **Making the design-reviewer subagent mandatory/blocking.** It stays what
  `vqa-workflow.md` already documents: the agent proposes evidence, the human still
  approves. This epic makes it discoverable and used, not compulsory.

## Technical Constraints [REQUIRED]

- `.husky/pre-commit` already runs `validate:tokens`, `validate:tokens:strict`,
  `validate:style-mirror`, `validate:dead-refs` in sequence, each `|| exit 1`. New
  validators follow the same pattern.
- `validate:validators` reads `package.json` files via Node's `fs`/`JSON.parse` — no new
  dependency needed.

## Files to Modify [REQUIRED]

- `.husky/pre-commit` — add `validate:css-names` + `validate:validators` — Phase 1/1b
- `.github/workflows/ci.yml` — add `validate:taxonomy` job (deviation from literal
  scope — see AC; same Sanity-secrets pattern as `validate:urls`/`validate:filters`) —
  Phase 1
- `apps/web/scripts/validate-tokens.js` — remove `--check-sync` flag + dead helpers —
  Phase 1
- `apps/web/package.json`, `package.json` (root) — remove `validate:tokens:sync`, add
  `validate:validators` — Phase 1/1b
- `scripts/validate-validators.js` — CREATE — Phase 1b
- `CLAUDE.md` — close-out step 3, one new sentence + link — Phase 2 (gated)
- `apps/web/src/pages/platform/ContentModelsPage.{jsx,module.css}` — pre-existing
  `validate:css-names` violation fixed before the hook could go blocking (not
  originally listed; required by the epic's own Risk section)

## Deliverables [REQUIRED]

1. `validate:css-names` blocks commits on violation (pre-commit); `validate:taxonomy`
   blocks CI builds on violation (CI, not pre-commit — see AC deviation)
2. `validate:validators` exists and fails on any unwired `validate:*` script
3. CLAUDE.md close-out step 3 names the design-reviewer subagent

## Acceptance Criteria [REQUIRED]

- [x] `.husky/pre-commit` runs `validate:css-names`; a deliberately seeded violation
  blocks the commit — confirmed via the real pre-existing `.taxonomyNote` violation
  found and fixed during Phase 1. **Deviation from literal scope, approved
  mid-execution:** `validate:taxonomy` was wired into `.github/workflows/ci.yml`
  instead of `.husky/pre-commit` — it hits the live Sanity API, which the pre-commit
  hook's own header comment explicitly excludes ("validators that require Sanity API
  run manually pre-PR"), same reason `validate:urls`/`validate:filters` are CI-only.
  Blocks the CI build on a real error-level finding (`errors > 0` exit path), not
  local commits.
- [x] `validate:validators` fails when a test `validate:*` script is added to
  `package.json` without hook/CI wiring or an allowlist entry, and passes once
  removed — verified via a live smoke test (added `validate:smoke-test-orphan`,
  confirmed exit 1 + correct error output, reverted)
- [x] `validate:tokens:sync` removed (not wired) — decision + reasoning recorded above
  in Context: it diffs `:root` values between exactly the two files
  `validate:style-mirror` already requires to be byte-identical, so it can never fail
  when style-mirror passes. Pure redundancy.
- [x] `grep -n "design-reviewer" CLAUDE.md` returns ≥1 hit in the close-out section —
  confirmed
- [x] The CLAUDE.md diff was shown and approved before writing, confirmed by the
  approval existing in the session transcript

**Found during execution, not in original AC:** a fourth orphaned validator
(`apps/studio`'s `validate:schema-parity`) — allowlisted with its real reason
(comparison logic incomplete, not just unwired); follow-on task spun off to finish
the actual diff logic before it's wired into CI.

## Risks / Edge Cases [REQUIRED]

- **`validate:css-names` or `validate:taxonomy` isn't actually clean on `main`.** Given
  they've been silently unenforced, drift may have accumulated. If either fails on a
  clean check, fix violations in a preceding commit before flipping the hook to
  blocking — don't ship a hook that immediately blocks every future commit on
  pre-existing debt.
- **`validate:validators`' allowlist becomes a dumping ground.** Any new manual-by-design
  entry should carry a real reason (matching `validate:content`'s "requires Sanity API"
  pattern), not become a silent escape hatch that recreates this exact bug.

## Post-Epic Close-Out [REQUIRED]

1. Visual QA gate — N/A
2. Chromatic — N/A
3. Data pipeline gap check — N/A
4. Move `docs/backlog/SUG-239-enforcement-visibility-gaps.md` →
   `docs/shipped/SUG-239-enforcement-visibility-gaps.md`
5. Confirm clean tree
6. `/mini-release SUG-239 Close the enforcement-visibility gaps`
7. Transition SUG-239 to **Done** in Linear
8. Start next epic only after mini-release commit is confirmed
