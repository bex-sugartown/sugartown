---
**Epic:** SUG-269 — Make the Sanity-backed validators probeable
**Issue:** [#93](https://github.com/bex-sugartown/sugartown/issues/93). The Linear original [SUG-269](https://linear.app/sugartown/issue/SUG-269/make-the-sanity-backed-validators-probeable) is retired; this ID was reused from a cancelled epic absorbed into [SUG-177](docs/backlog/SUG-177-list-component-audit-site-list-patterns.md). References to "SUG-269, cancelled the same day" in `SUG-268-governance-data-layer.md` and `SUG-177-*.md` describe that prior life, not this epic.
**Origin:** AOP-0, 2026-08-09. Three of its six controls were structurally unprobeable; rewritten 2026-11-08 against the shipped ST-95 harness.
**Aligned:** 2026-11-08
**Status:** Backlog, ready to start once this rewrite is approved
**Priority:** 🟣 Soon: five CI or manual gates are trusted without proof, none newly broken
**Merge strategy:** (a) Merge-as-you-go, one validator per commit
**Depends on:** ST-95 ([#95](https://github.com/bex-sugartown/sugartown/issues/95)), closed 2026-10-31. Its harness, `scripts/validate-liveness-probes.js`, is reused; do not build a second one.
**Visual:** no
---

# SUG-269 — Make the Sanity-backed validators probeable

## Model & Mode

Plain `/model sonnet`. Mechanical refactor plus one probe per validator; the pattern is set by ST-95.

## Background

`pnpm validate:liveness-probes` (ST-95) proves a gate is live by breaking a repo file, running the gate, and asserting a non-zero exit. It cannot reach validators that judge **remote Sanity data**, because failing them means writing bad data to the production dataset. Five validators have that shape:

| Validator | Script | Fetches | Runs in |
|---|---|---|---|
| `validate:urls` | `apps/web/scripts/validate-urls.js` | published docs, then checks duplicate canonical URLs and missing slugs | manual pre-PR; also `ci.yml` |
| `validate:filters` | `apps/web/scripts/validate-filters.js` | `archivePage` docs and content items, then `buildFilterModel()` | `ci.yml` |
| `validate:taxonomy` | `apps/web/scripts/validate-taxonomy.js` | content, tool, tag, person and project docs | `ci.yml` |
| `validate:content` | `apps/web/scripts/validate-content.js` | published docs, then slug, required-field, orphan and entity checks | manual pre-PR only |
| `validate:schema-parity` | `apps/studio/scripts/validate-schema-parity.js` | deployed schema via `sanity schema list`, compared to a local manifest | `ci.yml` |

The original filing (2026-08-09) named the first three. `validate:content` and `validate:schema-parity` were added on 2026-08-21 and re-confirmed 2026-11-08 by reading the scripts.

The old mechanics (`control-register.md`, `governance/source/probes.json`, `validate:enforcement-liveness`, CTL-008/009/010) were removed by SUG-284 and are not used. The target is the `PROBES` array in `scripts/validate-liveness-probes.js`.

**Existing-system claims verified 2026-11-08**

| Claim | Command |
|---|---|
| ST-95 is closed | `gh issue view 95 --json state` returns `CLOSED` |
| The harness exists | `ls scripts/validate-liveness-probes.js` |
| The harness has `gateProbe`, `tempFile`, `mutateFile`, a cleanup stack and a `PROBES` array | `grep -nE "function (gateProbe\|tempFile\|mutateFile)\|^const PROBES" scripts/validate-liveness-probes.js` |
| Which of the five run in CI | `grep -nE "validate:(urls\|filters\|taxonomy\|content\|schema-parity)" .github/workflows/ci.yml .husky/pre-commit` |
| `validate:filters` and `validate:taxonomy` take `--no-token` | `grep -n "no-token" apps/web/scripts/validate-{filters,taxonomy}.js` |
| `validate:content` has `--strict` and `--report` | `grep -nE "STRICT\|REPORT" apps/web/scripts/validate-content.js` |

Still to confirm during Phase 1, per validator, before the refactor: which functions are already pure. `buildFilterModel()` is a function over `(archivePage, contentItems)` in `validate-filters.js`. `canonicalize()`, `fieldNames()` and `diffFieldNames()` in `validate-schema-parity.js` look pure. Rule logic in `urls`, `taxonomy` and `content` sits inside `run()` and must be extracted.

## Objective

Each of the five validators separates **fetching** from **judging**. The judging logic lives in a module that exports a pure function over a document array (or a manifest pair, for schema-parity). The validator calls that function; the probe calls the same function with a deliberately broken fixture and asserts it reports an error. The probes are entries in the existing `PROBES` array, so `pnpm validate:liveness-probes` covers all five.

## Scope

- [ ] **S1** `validate:urls`: extract the rules into a pure function; probe with a fixture holding a duplicate canonical URL and a published doc with no slug. Layer: tooling. Phase 1
- [ ] **S2** `validate:filters`: same shape; `buildFilterModel()` is already pure, so the seam is cheap. Layer: tooling. Phase 1
- [ ] **S3** `validate:taxonomy`: same shape; fixture holds a document with 0 categories and one with more than 2. Layer: tooling. Phase 1
- [ ] **S4** `validate:content`: same shape; fixture holds a missing slug, an orphaned taxonomy ref, a duplicate slug and an HTML entity in Portable Text. Layer: tooling. Phase 2
- [ ] **S5** `validate:schema-parity`: probe the comparison with a local and a deployed manifest that differ by one field. Layer: tooling. Phase 2
- [ ] **S6** Add one `PROBES` entry per validator in `scripts/validate-liveness-probes.js`, each with a control run on clean input and a violating run, per `gateProbe`'s contract. Update the harness header comment's probe count. Layer: tooling. Phases 1 and 2, with each validator

## Phases

| Phase | What ships | Gate | Done |
|---|---|---|---|
| 1 | S1, S2, S3 and their `PROBES` entries (the three originally filed) | none | [ ] |
| 2 | S4, S5 and their `PROBES` entries (found 2026-08-21) | none | [ ] |

Merge strategy (a): one commit per validator, each merging to `main` when its probe passes.

## Non-Goals

- Changing what any validator **checks**. This is about provability, not coverage.
- A fixture Sanity dataset. Rejected in AOP-0: a second dataset to pay for and keep in sync, and a stale fixture proves nothing while looking green.
- A second harness, a register, a coverage tally, or any published count. ST-95 removed those on purpose.
- Wiring `validate:content` into CI or pre-commit. Whether it should run there is a separate decision; this epic only makes it provable.
- `pnpm test:smoke` (CTL-018). It needs a full production build per run; that cost decision stays with whoever owns the smoke suite and is not part of this epic.
- Studio schema changes. None are needed.

Scope and Non-Goals read against each other 2026-11-08: no Scope item requires anything listed above.

## Technical Constraints

- **The pure function must be the one the validator calls.** A probe against a copy of the logic proves the copy works. Show it: the validator and the probe both import the same exported function.
- Importing a validator today runs it (top-level `createClient`, `process.exit`). The extracted rules go in a sibling module with no side effects at import; the validator keeps the fetch and the exit code.
- Probes run offline: no Sanity client, no token. The control run for each uses a clean fixture, not live data.
- Follow `gateProbe`'s rule that the clean run must exit 0 and the violating run non-zero, otherwise the probe is reported invalid, not passed.

## Acceptance Criteria

- [ ] For each of the five validators, the probe fails on its broken fixture and passes on its clean one; output recorded in the issue comment
- [ ] `pnpm validate:liveness-probes` exits 0 and lists five more gates live than before this epic (count before and after recorded, from the command's output)
- [ ] For each validator, the function the probe feeds is the function the validator calls: `grep -n` of the import in both files, pasted
- [ ] `pnpm validate:urls`, `validate:filters`, `validate:taxonomy`, `validate:content` and `validate:schema-parity` produce the same exit code and the same report text on live data as before the refactor (run both on `main` and on the branch, diff the output)
- [ ] A mutation check per probe: weaken the rule in the extracted function and confirm the probe goes red, then revert
- [ ] `pnpm lint` and `pnpm validate:style-mirror` unaffected (zero new errors)
- [ ] Close-out review present: `node scripts/check-epic-doc.js <doc> --stage close-out` exits 0

## Kill criterion

Remove a probe if its validator is retired, or if the probe has failed three times for reasons other than a real regression (stale fixture). Check at the 60-day review of ST-95's harness (`docs/shipped/ST-95-liveness-probes-only.md`).

## Risks

- **A probe on a parallel copy of the rules.** The failure this repo keeps hitting: a check that reports healthy while checking nothing. Guarded by the import-sharing acceptance criterion above.
- **Behaviour drift in the refactor.** Moving rule logic can change output. Guarded by the before-and-after output diff.
- **`validate:content` is 746 lines** and the largest extraction. If its rules do not separate cleanly, split it into its own follow-up issue and ship Phase 1 and S5 first.
