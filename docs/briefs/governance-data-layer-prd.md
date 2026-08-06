# Governance Data Layer — Product Requirements Document

**PRD Version:** v1.2
**Status:** Draft
**Author:** Bex Head
**Domain:** Mixed (platform tooling; touches the web render surface as a consumer only)
**Last updated:** 2026-08-06
**Related epics:** SUG-256 (Ph4 absorbed by this scope, see §12), SUG-268 (implementing, Phase 1 shipped, Phase 2 activated)
**Verification review:** run 2026-08-02 against this draft (3 blockers, 10 gaps, all incorporated). Re-run 2026-08-06 against SUG-268 Phase 2's proposed design, per CLAUDE.md: 7 blockers returned, two of which are corrected here. Verdict on the architecture is unchanged; the corrections are naming and sequencing.

**v1.2 (2026-08-06) — both gates renamed under the `validate:` prefix.** `governance:validate`
became `validate:governance` (13 references) and `governance:diff-clean` became
`validate:governance-diff` (6). `validate:validators` and `validate-control-register` both
auto-discover gates by that prefix (`validate-validators.js:63`,
`validate-control-register.js:176`), so under the old names either gate could be unwired from
pre-commit and CI with every meta-check still green — the SUG-239 failure shape. `governance:build`
keeps its name deliberately: it is a build, matching `tokens:build` and `registry:build`, and
builds sit outside the gate net correctly.

Naming alone does not close it. `'validate:governance-tally'.includes('validate:governance')` is
`true`, and `validate-control-register.js:267-276` matches by substring, so the new gate would be
masked by CTL-027's existing row. The completeness check moves to delimited-token matching in
SUG-268 Phase 2 (SUG-275).

Two §5.2 specifications are also known-unimplementable as written and are being corrected in the
epic rather than here, pending their implementation: `claim.command`'s "first token resolves to a
`package.json` script or an existing repo path" rejects every seed claim, whose first token is
`pnpm`; and `claim.statsKey`'s "must resolve in `stats.json`" is enforced by nothing.

**v1.1 (2026-08-05) — §5.2 claim table gains `value` and `statsKey`.** The table specified
neither, while §3's "Typed claim contract" goal and US-005's P0 acceptance criterion both
require a value, and the `valueSource` row described an `external` claim as naming "a pipeline
key that must resolve in `stats.json`" with no field to hold that key. As written, no claim
could produce a number. Found during SUG-268 Phase 1's verification review; the schema shipped
with both fields and an inline note pending this correction.

---

## 2. Problem Statement

Governance data lives as prose in three hand-maintained Markdown registries (`control-register.md`, `governance-coverage.md`, the rule register) plus a hardcoded array in page JSX, parsed by regex and `indexOf` across four validator scripts. The coverage components and the control rows use two different taxonomies with no machine-readable join: SUG-256 exists because "re-measure the 30 components against liveness data" was not executable until a mapping was researched by hand. In one week this substrate produced four concrete failures: a `\|` in a table cell broke a validator's column count, a doc comment restating a declaration made a parser lock onto prose and drop a tile, a liveness probe hardcoded a value and whitespace from a JSX file it mutates, and a published statistic (`Vulnerabilities: 0`) sat as a string literal while its derived, dated value existed unused in `stats.json`. Every failure traces to the same root: the data layer is prose, and every consumer reimplements a fragile parser for it.

## 3. Goals & Non-Goals

| Goal | Description |
|------|-------------|
| One source of truth | A structured, schema-validated source (`governance/source/`) holds controls, coverage components, statuses, claims, probes, and the mappings between them. Nothing governance-shaped is hand-maintained in two places |
| Generated registers | `control-register.md` and `governance-coverage.md`'s tables and tally are build outputs carrying a "do not edit directly" header, exactly as `tokens.css` is to `tokens.json` |
| Generated page data | `apps/web/src/generated/governance.json` is the only governance data the frontend touches. No governance script reads, greps, or mutates JSX ever again |
| Structural agreement | The derived/stated/published three-way agreement that `validate:governance-tally` polices today becomes impossible to violate for anything flowing through the pipeline, because there is one source and everything else is generated. The one path around the pipeline (a hand-written stat literal in page JSX) is closed by a v1 lint, with its residual stated honestly in §11 |
| Deterministic builds | `pnpm governance:build` is a pure function of source. No wall-clock stamps in generated output: derived measurement dates are source fields, updated in the same commit as the value change, and the generator fails when they are not. Determinism is what makes the diff-clean check a gate rather than a flake |
| Typed claim contract | Every published governance statistic is a claim record with value, measurement date, reproducing command, evidence class, and claim type (sufficiency vs attribution vs count). The schema rejects a claim missing any of these |
| Probe contract | Probes derive their injections and assertions from the artifact they test. A hardcoded needle is a schema violation, not a code-review catch |
| Framework crosswalk | The six-layer model maps to NIST AI RMF functions in a machine-readable crosswalk carrying its assessment date and the RMF version |
| Referential integrity in CI | Dangling references (a component citing a retired control, an `artifact:` path that does not exist, a probe citing a missing gate) fail the build. Entry validation is closed-world: anything that matches no recognized form is an error, never skipped |

| Non-Goal | Why excluded |
|----------|-------------|
| Building probes for the 15 unprobed controls | Unchanged SUG-256 Non-Goal. This PRD changes where the gap is recorded, not whether it is closed |
| Redesigning `/platform/governance` or the draft page | Display decisions come after the data layer exists and get their own Phase 0. The current §05 arrangement is the holding position |
| Storing governance data in Sanity | Controls version with the code they describe; a control row and the validator it names must change in the same commit. Sanity's draft/publish lifecycle and the Human-Publishes Rule are the wrong fit for machine-derived records |
| A UI for editing governance data | The editors are Bex and agent sessions working in the repo. A form over a JSON file is surface area with no reader |
| Verifying that `claim.command` produces the claimed value | Run-and-compare is a build-time execution of arbitrary commands; out of scope. A cheap existence check ships instead (§5.2, claim notes) |
| Migrating the rule register (RULE-NNN) in v1 | Different lifecycle (narrative incident records, CLAUDE.md coupling). Candidate for v2 once the control migration proves the pipeline; see §12 |
| Historical trending of statuses over time | Git history already provides it. A time-series store is deferred until a reader exists |
| Replacing the incident log or MTTN mechanics | They work, they are read, and `mttn.js` already parses a stable format |

## 4. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Single edit, every surface | As the maintainer, I want to change one record in one file so that the register, the coverage doc, and the page data all update in the same build | Editing one control's class and running `pnpm governance:build` updates all three generated outputs; a field-level diff shows no other change | P0 |
| US-002 | Regeneration is checkable | As a session agent, I want CI to fail when generated outputs drift from source so that hand-edits to generated files cannot ship | Hand-editing a generated file fails `validate:governance-diff` in pre-commit (against staged bytes) and CI (against committed bytes), with an error naming the source file to edit instead. The check regenerates into a scratch directory and never writes to tracked files | P0 |
| US-003 | Schema rejects malformed records | As a session agent, I want the schema validated in CI so that a typo'd status value or missing field fails before merge | A record with `layerStatus: "stong"` or a claim missing `measuredAt` fails `validate:governance` with the record ID and field named | P0 |
| US-004 | Referential integrity | As the maintainer, I want every cross-reference resolved at build time so that a retired control cannot be silently cited | A component citing `CTL-999` fails the build naming the component and the dangling ID. A typo form (`ctl-001`) is rejected as unrecognized, not skipped. Retiring a control that is still cited fails with the list of citers. An `artifact:` path that does not exist on disk fails | P0 |
| US-005 | Claims carry their evidence | As a site visitor, I want every published governance number to carry its measurement date and reproducing command so that I can distinguish a measured claim from an assertion | Every statistic in `governance.json` has `value`, `measuredAt`, `command`, `evidenceClass`; the schema makes them required; the FE can render date and command without new data work | P0 |
| US-006 | Probes cannot go stale silently | As a validator author, I want probe injections derived from the target so that relocating or re-measuring a value cannot stale a probe into misreporting the gate | No probe contains a literal copied from a target file. The existing no-op guard stays. A probe whose derivation fails reports PROBE INVALID, never gate-inert | P1 |
| US-007 | Framework crosswalk | As an external reviewer, I want the six-layer model mapped to NIST AI RMF functions so that the taxonomy anchors to a recognized standard | A crosswalk record maps each layer to one or more AI RMF functions (GOVERN, MAP, MEASURE, MANAGE) with a rationale, an assessment date, and the RMF version | P1 |
| US-008 | Lossless migration | As the maintainer, I want the 29 control rows and 30 components migrated with a field-by-field audit so that no bypass narrative or caveat is lost in the cutover | `scripts/verify-migration.js` parses the pre-cutover registers at a pinned SHA with the old regex parsers and byte-compares every prose cell against the source records; its exit-0 output is committed in the migration report before the old parsers are deleted. Counts match, including the CTL-026 reservation | P0 |
| US-009 | Register history survives | As a future session, I want the append-only changelog and retired-row semantics preserved so that the register's own history rules are not broken by the migration | Retired controls carry `status: retired` and reserved IDs carry `status: reserved`; both are excluded from active counts but present in source; generated register renders them per current convention | P1 |
| US-010 | No literal stats in page code | As the maintainer, I want a lint that rejects hand-written statistics in platform pages so that the `Vulnerabilities: "0"` class cannot recur | `governance:no-literal-stats` fails on stat-shaped object literals, `*_TALLY` const arrays, and stat-shaped strings in `apps/web/src/pages/platform/`, with the file and line named | P1 |

## 5. Technical Architecture

No code in this section. Contracts, boundaries, and data flow only.

### 5.1 Pipeline shape

The token pipeline is the architectural precedent and the shape is copied deliberately:

| Stage | Token pipeline (exists) | Governance pipeline (this PRD) |
|---|---|---|
| Source | `tokens/source/tokens.json` | `governance/source/*.json` |
| Build | `pnpm tokens:build` (Style Dictionary) | `pnpm governance:build` (plain Node script, deterministic: no wall-clock reads) |
| Outputs | two generated `tokens.css` | generated `control-register.md`, `governance-coverage.md` tables + tally, `apps/web/src/generated/governance.json` |
| Guard | pre-commit "do not edit directly" block + `validate:style-mirror` | same header block + `validate:governance-diff`: regenerate into a scratch directory, byte-compare against staged bytes (pre-commit, via the index) or committed bytes (CI, via HEAD). The check never writes to tracked files; in-place regeneration would destroy the hand-edit under test and compare the generator to itself |
| Validation | `validate:tokens` (references resolve) | `validate:governance` (schema + referential integrity + overdue next-reads + a scan for governance-data patterns outside `governance/source/`) |

Generated Markdown keeps its current paths (`docs/ai/agentic-caucus/`) so existing links, CLAUDE.md citations, and `[[rule-register]]`-style references do not break. The generator owns pipe-escaping in table cells: the `\|` column-count failure class dies in one place instead of in every author's head.

### 5.2 Entities and fields

Field types are explicit. Enums are exhaustive.

**control** (migrates the 29 CTL rows)

| Field | Type | Required? | Validation | Notes |
|-------|------|-----------|-----------|-------|
| `id` | string | Yes | `^CTL-\d{3}$`, unique, never reused | |
| `name` | string | Yes | non-empty | the Control cell |
| `class` | string enum | Yes | `enforced-by-code` / `measured` / `convention` / `roadmap` | the evidence-class taxonomy, now schema-enforced |
| `probeId` | string or null | Yes (nullable) | must resolve to a probe record when non-null | |
| `noProbeReason` | string | Required when `probeId` is null | non-empty | today's "none, because" prose |
| `reader` | string | Yes | non-empty | who or what consumes the result |
| `cadence` | string enum | Yes | `continuous` / `dated` | |
| `nextRead` | date | Required when `cadence` is `dated` | ISO date | `validate:governance` fails when overdue, replacing the current regex check |
| `bypass` | string | Yes | non-empty | the narrative cell; prose is a value here, not structure |
| `status` | string enum | Yes | `active` / `retired` / `reserved` | `reserved` exists so CTL-026 survives migration as data: a next-free-ID computation over records lacking it would reallocate it. Reserved rows carry only `id`, `status`, and a `reservedFor` string |

**component** (migrates the 30 coverage rows)

| Field | Type | Required? | Validation | Notes |
|-------|------|-----------|-----------|-------|
| `id` | string | Yes | `^COMP-\d{3}$`, unique | new; components have no stable IDs today, which is part of the mapping problem |
| `name` | string | Yes | non-empty | |
| `layer` | integer | Yes | 1 to 6 | the six-layer model |
| `layerStatus` | string enum | Yes | `strong` / `partial` / `inherited` / `not-applicable` | the status judgement, schema-constrained for the first time |
| `statusDate` | date | Yes | ISO date, not in the future | when the judgement was made; fixes the one-date-covering-two-things failure |
| `statusEvidence` | string | Yes | non-empty | what the judgement rests on |
| `enforcedBy` | array | Yes | closed-world: every entry MUST match `^CTL-\d{3}$` and resolve to an `active` control, OR begin with `artifact:` and name a path that exists on disk. Anything else is an error, never skipped: `ctl-021` is a rejection, not an ignored string | the SUG-256 Phase 1 mapping, machine-readable at last |
| `livenessCaveat` | string or null | No | | today's warning annotations |

**claim** (every published governance statistic)

| Field | Type | Required? | Validation | Notes |
|-------|------|-----------|-----------|-------|
| `id` | string | Yes | `^CLM-\d{3}$`, unique | |
| `surface` | string | Yes | route + location, e.g. `/platform/governance#hero` | |
| `type` | string enum | Yes | `sufficiency` / `attribution` / `count` | the distinction that made SUG-256 Ph3's split coherent |
| `value` | string | Yes | non-empty | the published figure as it renders, e.g. `30 checkpoints`. String rather than number because claims publish units and qualifiers, not bare integers |
| `valueSource` | string enum | Yes | `derived` / `external` | `derived` values are computed from other source records; `external` values come from the pipeline key in `statsKey` |
| `statsKey` | string | Required when `valueSource` is `external` | non-empty; must resolve in `stats.json`. Forbidden when `valueSource` is `derived` | the pipeline key, e.g. `security.vulnerabilities`. Closes the `Vulnerabilities: 0` failure class: a published statistic whose derived value already existed in `stats.json`, unwired |
| `measuredAt` | date | Yes | ISO date, not in the future. **A source field in all cases, never a build-time stamp**: the generator is deterministic, and it fails when a derived value changes without a same-commit `measuredAt` update. A wall-clock stamp would be `Date.now()` laundered into a measurement date, and would make the diff-clean check fail on a clean tree the day after the last build | |
| `command` | string | Yes | non-empty; cheap existence check: the first token resolves to a `package.json` script or an existing repo path | full run-and-compare is a Non-Goal (§3) |
| `evidenceClass` | string enum | Yes | same enum as control `class` | |
| `controlId` | string | Yes | must resolve | the control that polices this claim |

**probe** (mirrors the `PROBES` array's registry needs)

| Field | Type | Required? | Validation | Notes |
|-------|------|-----------|-----------|-------|
| `id` | string | Yes | unique | |
| `gate` | string | Yes | two-way check against the harness: every probe record has a harness entry and every harness entry has a probe record | the harness is JS, so this is buildable only against a machine-readable interface: `validate-enforcement-liveness.js --list-gates` emitting JSON, or gate names extracted to a shared module both import. **Regex over the harness source is forbidden**: it recreates the fragile-parser class this PRD exists to kill |
| `derivation` | string enum | Yes | `derived-from-target` / `static-input` | `static-input` requires `staticJustification` |
| `staticJustification` | string | Required when `derivation` is `static-input` | non-empty | some probes legitimately use fixed fixtures; say why |

**crosswalk** (framework anchor)

| Field | Type | Required? | Validation | Notes |
|-------|------|-----------|-----------|-------|
| `layer` | integer | Yes | 1 to 6 | |
| `airmfFunctions` | array of string enum | Yes | `GOVERN` / `MAP` / `MEASURE` / `MANAGE`, min 1 | NIST AI RMF 1.0 functions |
| `airmfVersion` | string enum | Yes | `1.0` | an RMF version bump is a schema change, deliberately |
| `assessedAt` | date | Yes | ISO date, not in the future | without it, §10's crosswalk criterion is unverifiable |
| `rationale` | string | Yes | non-empty | |

### 5.3 Consumer contract

| Consumer | Today | After |
|---|---|---|
| `validate-governance-tally.js` | regex-parses two Markdown files and one JSX file | retired. Tally is computed at build from `component.layerStatus`; page renders `governance.json`. Three-source drift is structurally impossible, so the gate's job disappears. CTL-027 is amended to cover `validate:governance-diff` instead |
| `validate-control-register.js` | regex-parses Markdown columns and probe quotes | becomes a thin wrapper over `validate:governance` |
| CTL-027 liveness probe | mutates page JSX with a derived needle | mutates one generated output (append one character, no rebuild), runs `validate:governance-diff`, asserts non-zero and that the error names the source file to edit. **The mutate-source-then-rebuild design was reviewed and struck**: a rebuilt tree is the legitimate edit state the check must pass, and a generator run inside a probe writes files the harness cleanup registry never registered, failing CI's no-residue step |
| `GovernancePage.jsx` / draft page | hardcoded arrays and string literals | imports `governance.json`. The FE is a pure consumer, and `governance:no-literal-stats` polices the seam |
| Netlify build | publishes whatever `main` holds, regardless of CI (CTL-020) | `pnpm validate:governance` (check only, no regeneration, so no dual authority) runs in the Netlify build command, closing the schema-invalid half of the skip-ci-plus-deploy bypass |
| SUG-256 Ph4 (CTL-026 coverage xref) | planned regex scan of an `Enforced by` column | absorbed. Closed-world `enforcedBy` validation is a strict superset of the planned check **provided entries are rejected by default**: a typo form cannot merge, which covers the detection intent and adds retirement protection the planned scan lacked. Residual, stated honestly: a `ctl-021` buried in a free-prose field (`bypass`, `statusEvidence`, `rationale`) is invisible to referential integrity; that class migrates to prose and stays under human read |

### 5.4 Migration path

1. The migration report's header pins the pre-cutover SHA. `scripts/verify-migration.js` reads the registers at that SHA via `git show`, parses them **with the old regex parsers**, and byte-compares every prose cell (`bypass`, caveats, `noProbeReason`) against the source records. Exit 0/1; output committed in the report. The old parsers are the independent verifier of the migration, so they are deleted only after that output is committed, never in the same commit that lands the source.
2. Generated outputs are diffed against the current hand-written files. Prose cells must survive byte-exact; structural cells may reformat.
3. Cutover uses **merge strategy (b): one feature branch, atomic merge**. Sequence on the branch: source + generators + verification report, diff confirmation, then parser deletion and gated-file scope update. Nothing lands on `main` in between, because Netlify deploys every push to `main` regardless of CI (CTL-020): an intermediate commit that deletes `validate-governance-tally.js` before `validate:governance` is wired would be live in production with the register unpoliced. An interrupted branch is recoverable; an interrupted series on `main` is deployed.
4. `validate:enforcement-liveness` runs post-cutover; acceptance is exit 0 with 0 inert, recording the live/skipped split and environment.

## 6. Content Model

Omitted. No Sanity document type or field changes. The governance schema is repo-resident and specified in §5.2. The only Sanity-adjacent constraint is a Non-Goal (§3): governance data does not move into Sanity.

## 7. Design Constraints

This PRD ships no new visual surface. `governance.json` feeds existing, already-reviewed components. Two constraints bind anyway:

- Any future epic that changes what renders (e.g. adding measurement dates to hero tiles per CTL-029's residual gap) runs the Phase 0 assessment on its own; this PRD does not pre-authorize display changes.
- Generated Markdown must render acceptably on GitHub, because the registers are read there. The generator owns pipe-escaping (§5.1).

## 8. Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| Source format | A: JSON (matches `tokens/source/`, zero new dependencies, native Node parsing). B: YAML (kinder to long prose cells like bypass narratives, needs a parser dependency). Recommendation: A, because agents do most edits and prose-as-string is tolerable; revisit only if hand-editing friction proves real | Bex | before the implementing epic's Phase 1 |
| Framework anchor | A: keep six-layer model as primary taxonomy + machine-readable NIST AI RMF crosswalk (recommendation: AI RMF is public and freely citable; ISO/IEC 42001 is paywalled; a full remap churns shipped content for no reader benefit). B: adopt AI RMF functions as the primary taxonomy. C: dual-publish both | Bex | before schema freeze; shapes `crosswalk` and possibly `component.layer` |
| Gated-file scope | The Rule File Write Gate covers `docs/ai/agentic-caucus/**`. Once registers are generated, the gate must move to `governance/source/**` (the file a diff actually changes). Requires a CLAUDE.md edit, itself gated | Bex | same branch as cutover (§5.4 step 3) |
| Harness interface for the two-way probe check | A: `--list-gates` JSON flag on the harness. B: gate names extracted to a shared module both import. Either satisfies §5.2; regex over the harness JS is forbidden under both | implementing epic | Phase 1 |
| `stats.json` relationship | A: governance build stays separate from the stats pipeline (recommendation: different cadences; stats is CI-cron, governance is commit-time). B: merge them | Bex | before the implementing epic's Phase 1 |
| Rule register migration | In or out of v2. Depends on how the control migration lands | Bex | after cutover retrospective |

## 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| The migration itself introduces the drift it exists to kill (two sources live during transition) | High | Strategy-(b) atomic cutover (§5.4 step 3); the diff-clean check lands on the same branch as the source, so the window with two authorities is one branch, never a deployed state |
| The mapping (`enforcedBy`) becomes the unmaintained third registry SUG-256 warned about | High | It is not a third registry: it is a required field on a schema-validated record, and closed-world referential integrity fails CI on anything unresolvable. An unmaintained mapping is now a red build, not a quiet lie |
| A non-deterministic generator turns diff-clean into a flake (red on clean trees, then normalized into being ignored) | High | The determinism goal (§3) is load-bearing: no wall-clock reads in the generator, derived `measuredAt` lives in source, and the CTL-027 probe's clean-tree control run fails loudly if determinism regresses |
| Generated register loses fidelity for prose-heavy cells | Med | `verify-migration.js` against the pinned SHA (§5.4 step 1); bypass narratives are values, not structure, and pass through untransformed |
| The Rule File Write Gate briefly covers neither source nor output during cutover | Med | The CLAUDE.md scope edit ships on the same cutover branch; the epic doc's checklist carries it as a named step |
| Schema freeze happens before the framework-anchor decision, then the decision changes the schema | Med | §8 orders the anchor decision before schema freeze; the crosswalk entity is additive either way |
| A schema-valid, value-level hand-edit to committed `governance.json` deploys via Netlify before CI catches the diff | Med | Enumerated, not fully closable: `validate:governance` in the Netlify build catches schema violations; a plausible-but-wrong value is caught by CI's diff-clean after the fact. Same detectable-not-unshippable honesty CTL-027 records today |
| `governance:build` becomes a second Style-Dictionary-shaped dependency to maintain | Low | Plain Node script, no framework; the generator is under 300 lines or it is doing too much |

Dependency checks per the skill: no schema changes owned by other epics (Sanity untouched); no third-party API contracts (all repo-local); no new tokens; no new routes; `featuredImage` does not appear in scope.

## 10. Success Criteria

Every criterion names its command or artifact. None is self-referential.

| Area | Metric |
|------|--------|
| Single source | `validate:governance`'s outside-source scan reports zero governance-data patterns (stat literals, `*_TALLY` arrays, CTL-row tables) outside `governance/source/` and generated outputs; the scan is a committed check, not a one-off grep |
| Structural agreement | `validate-governance-tally.js` is deleted; its CI step is replaced by `validate:governance-diff`; one hand-edit failure is recorded, with output, in the shipping epic doc |
| Migration integrity | `scripts/verify-migration.js` exit-0 output committed in the migration report, with the pre-cutover SHA pinned in its header; counts match including the CTL-026 reservation |
| Liveness | `pnpm validate:enforcement-liveness` exits 0 with 0 inert post-cutover, live/skipped split and environment recorded |
| Claim completeness | The permanent `validate:governance` probe (fixture claim missing `measuredAt`) fails with the record ID named, recorded in the harness run |
| Crosswalk | Every crosswalk record carries `assessedAt` and `airmfVersion`, enforced by schema; verified by the same probe fixture |
| Referential integrity | The permanent probe's fixture (dangling CTL id, typo form, missing artifact path) fails with each named; a `PROBES` entry, not a one-off |
| CI | The shipping epic records the run ID of the first green run containing the new checks, per close-out step 1b |

## 11. Verification & Ownership

Reviewed 2026-08-02 by the `verification-reviewer` subagent against this draft; rows below incorporate its rewrites. The review runs again at epic scoping per CLAUDE.md before any gate is built. New register IDs allocated: **CTL-031, CTL-032, CTL-033**; CTL-027 is amended in place; CTL-026 stays reserved. Rows land in `control-register.md` only when their gates and probes exist, because `validate:controls` cross-references probes against the real `PROBES` array.

| Control | Liveness proof | Probe | Bypass paths | Reader + cadence |
|---------|----------------|-------|--------------|------------------|
| CTL-031 `validate:governance` (schema + referential integrity + overdue next-reads + outside-source scan) | permanent `PROBES` entry; CI run ID of first green run recorded in the shipping epic doc | fixture source record carrying an invalid enum, a dangling `enforcedBy` id, a typo form (`ctl-001`) that must be rejected as unrecognized, a missing `artifact:` path, and a claim missing `measuredAt`; asserts non-zero and that the output names each record ID and field | `git commit --no-verify` (wired into pre-commit in v1: local JSON, no network); a skip-ci commit runs no CI; Netlify publishes regardless of CI (CTL-020), closed by running the check in the Netlify build command | pre-commit blocks the commit; `ci.yml` step, then `ci-failure-alert.yml`; continuous |
| CTL-027 (amended) `validate:governance-diff`: regenerate into a scratch directory, byte-compare against staged (pre-commit, via the index) or committed (CI, HEAD) bytes; never writes tracked files | permanent `PROBES` entry; one recorded hand-edit failure with output in the shipping epic doc | `mutateFile` one generated output (append one character, no rebuild), run the check, assert non-zero and that the error names the source file to edit. Determinism precondition: no wall-clock stamps in generated output, or the clean-tree control run goes red the day after the last build | `--no-verify`; skip-ci; a schema-valid value-level hand-edit to committed `governance.json` still deploys via Netlify (CTL-020), detectable after the fact, not unshippable; the pre-commit variant diffs against the index or partial staging slips through | pre-commit + `ci.yml` step, then `ci-failure-alert.yml`; the liveness job re-proves it every run; continuous |
| Claim schema (`measuredAt` + `command` required; derived `measuredAt` is a source field, and the generator fails when a derived value changes without a same-commit update) | `validate:governance` probe output (fixture above); CI run ID | covered by the CTL-031 fixture (claim missing `measuredAt` fails, record ID named) | hand-written stat literals in page JSX, closed in v1 by CTL-033; residual: prose claims matching neither digits nor the keyword set, and platform claims on pages outside `pages/platform/`; both stay convention with a dated human read | schema: CI, continuous; residual prose class: human, at the register `Next read` date |
| CTL-032 crosswalk publication (well-formedness enforced; mapping accuracy is human judgement) | build output carries `assessedAt` + `airmfVersion`; `validate:governance` probe output for the enum check | invalid `airmfFunctions` value and missing `assessedAt` in the fixture must fail | schema proves shape, not correctness; an RMF version bump goes unnoticed between reads | human, at a concrete date set at cutover (ship + 3 months); `validate:controls` fails once it passes |
| CTL-033 `governance:no-literal-stats` (lint over `apps/web/src/pages/platform/`) | permanent `PROBES` entry; CI run ID | inject a stat-shaped literal into a platform page fixture; must fail with file and line named | prose claims with neither digits nor the keyword set; platform claims published from pages outside `pages/platform/` | `ci.yml`, then `ci-failure-alert.yml`; continuous |
| Probe-to-harness two-way check (part of CTL-031) | `validate:governance` output listing both directions | delete one side of a matched pair in a fixture; both directions must fail with the orphan named | buildable only against a machine-readable harness interface (`--list-gates` JSON or a shared module); regex over the harness JS is forbidden | CI, continuous |

## 12. Out of Scope (Deferred)

- **SUG-256 Ph4 (CTL-026)** is absorbed by closed-world referential integrity (§5.3) and should be closed against this PRD when it ships, not built separately. The CTL-026 reservation transfers into source as a `reserved` record.
- **CTL-029 residual gap** (hero tiles render no measurement date): display change, owns its own Phase 0, unblocked by `governance.json` carrying the dates.
- **Prose-field reference checking**: a `ctl-021` buried in `bypass` or `rationale` prose is invisible to referential integrity. The class migrates from structure to prose and stays under human read; recorded here so nobody claims the schema closed it.
- **Rule register (RULE-NNN) migration**: v2 candidate, decision owner Bex, after cutover retrospective.
- **Probes for the 15 unprobed controls**: unchanged standing follow-up, recorded in the register's Known coverage gaps.
- **Historical status trending**: no reader identified; git history suffices.
- **`stats.json` pipeline merge**: open decision §8; not required for v1.

## 13. Authoring Checklist

- [x] Every claim references a real system, not an aspiration
- [x] Field types are explicit; no TBD in the schema tables
- [x] Enum values are exhaustive; no "etc."
- [x] Non-goals name the reason for exclusion
- [x] Open decisions have owners
- [x] Success criteria are independently verifiable and name their commands
- [x] Every control has a named probe, or a stated reason it has none
- [x] Every published claim carries a measurement date and a reproducing command (schema-enforced, §5.2)
- [x] `featuredImage` does not appear anywhere
- [x] Brand voice check: no em dashes, no adjective triads, no future-tense promises on shipped surfaces
- [x] Verification review run against this draft (2026-08-02); blockers and gaps incorporated
- [ ] A senior engineer could start writing epics from this doc without a meeting (reviewer judgement, not self-assessed)
