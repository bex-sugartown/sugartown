# Agentic Caucus — Control Register

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-28
**Related:** [[verification-review]] (`docs/conventions/verification-review.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[incident-log]] (`docs/ai/agentic-caucus/incident-log.md`)

---

## Purpose

One row per control: every gate, validator, test, deploy path, and published claim the
platform relies on.

[[governance-coverage]] maps the platform against a governance model and answers which layers
are covered. This answers a narrower question: for each control, is it probed, and who reads
its result?

Enforced by `pnpm validate:controls` (`scripts/validate-control-register.js`) in CI. See
`docs/conventions/verification-review.md` for what it checks and why.

## How to read a row

- **Class** — `enforced-by-code` (a validator, hook, or build step makes it true), `measured`
  (an empirical result with a committed record), `convention` (true by discipline), `roadmap`
  (not true yet). Same four values as the red-pen diagram gate.
- **Probe** — the `gate:` string in the `PROBES` array of
  `scripts/validate-enforcement-liveness.js`. `none — <reason>` is fine; blank is not.
- **Reader** — who or what reads the result. `continuous` in *Next read* means a machine reads
  every run. A date means a human must look by then.
- **Bypass** — paths to production that skip this control. `none known` is someone's
  assertion, not a guarantee.

## How to add a row

Run the `verification-reviewer` subagent against the plan. It emits paste-ready rows. Use the
next free `CTL-NNN`; IDs are never reused. A new gate ships with its probe and its row in the
same epic, so the probe set does not fall behind the gate set.

---

## Register

| ID | Control | Class | Probe | Reader | Next read | Bypass |
|---|---|---|---|---|---|---|
| CTL-001 | `validate:tokens` | enforced-by-code | `validate:tokens` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-002 | `validate:tokens:strict` | enforced-by-code | `validate:tokens:strict` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-003 | `validate:style-mirror` | enforced-by-code | `validate:style-mirror` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-004 | `validate:dead-refs` | enforced-by-code | `validate:dead-refs` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-005 | `validate:css-names` | enforced-by-code | `validate:css-names` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify`; only scans `apps/web/src/pages/` |
| CTL-006 | `validate:validators` | enforced-by-code | `validate:validators` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-007 | `pnpm lint` (incl. `boundaries.js`) | enforced-by-code | `pnpm lint` | `.husky/pre-commit` + `ci.yml` | continuous | `git commit --no-verify`; pre-commit ran web-only while repo-wide lint was red (SUG-255) |
| CTL-008 | `validate:urls` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Validate URLs* → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; a local commit is unchecked until it reaches CI |
| CTL-009 | `validate:filters` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Validate filters* → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-010 | `validate:taxonomy` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Validate taxonomy* → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-011 | `validate:schema-parity` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Validate schema parity* → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-012 | `validate:content` | convention | none — needs Sanity API + long runtime | human, pre-PR (`MANUAL_BY_DESIGN`) | 2026-10-28 | runs on no hook and no CI job by design; nothing detects it being skipped |
| CTL-013 | `ci-failure-alert.yml` (the CI-red signal) | enforced-by-code | none — needs a genuinely red run on `main` to exercise | human, via the rolling `ci-red` issue | 2026-08-28 | `workflow_run` runs the `main` copy, so an unmerged fix does nothing; silent if `GITHUB_TOKEN` issue perms are revoked |
| CTL-014 | `validate:enforcement-liveness` | enforced-by-code | none — the probe harness cannot probe itself | `ci.yml` step *Prove every gate fires* → `ci-failure-alert.yml` | 2026-10-28 | probes only the gates listed in `PROBES`; a gate with no probe is invisible to it |
| CTL-015 | `validate:controls` (this register) | enforced-by-code | `validate:controls` | `ci.yml` → `ci-failure-alert.yml` | continuous | rows enter only when a human or the reviewer adds them; non-script controls are not auto-discovered. **An overdue `Next read` exits 1 on a clean tree**, which `gateProbe`'s control run reports as `PROBE INVALID — cannot vouch for this gate` on both probes for this gate, taking the liveness job red with "Fix the probe" against working probes, and suppressing the "Inert gates" summary for that run. Accepted, not fixed (SUG-274 Part 2, option A). Five rows — CTL-013, 019, 020, 022, 023 — go overdue **2026-08-29**; reproduced by running `scripts/validate-control-register.js` with the clock set to that date |
| CTL-016 | `pnpm typecheck` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Type check* → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; `turbo` is fail-fast so a later package's errors stay hidden |
| CTL-017 | `pnpm build` | enforced-by-code | none — a broken build is self-evident | `ci.yml` step *Build* → `ci-failure-alert.yml` | continuous | Netlify builds independently of CI; a green Netlify deploy does not imply CI ran |
| CTL-018 | `pnpm test:smoke` (5 route specs) | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml` step *Route smoke tests* → `ci-failure-alert.yml` | 2026-10-28 | covers 5 routes; every other route is unproven at runtime |
| CTL-019 | Chromatic VRT | enforced-by-code | `chromatic.sh reachability` | human approval of diffs | 2026-08-28 | probe proves the script is *reachable*, not that it *catches a diff*; deferral is permitted per close-out step 4, and a deferred run has no reader |
| CTL-020 | Netlify deploy path | convention | none — no probe; deploy is external to CI | human, at deploy time | 2026-08-28 | Netlify builds from `main` on push regardless of CI conclusion (G4). Preview and staging targets would each be a separate unprobed path |
| CTL-021 | `/platform/governance` published claims: the §05 coverage-map notice, `'Release process — 7 gates'` (`GovernancePage.jsx:135`), the workflow diagram's layer tags (`:145-156`), the governance doc index (`:163-172`) | measured | none — no machine can assert a caption or a doc path is still true | human, at the `Next read` date; `pnpm validate:controls` fails the build once that date passes | 2026-09-02 | published "30 checkpoints · 0 gaps" with no date and no reproducing command while the pipeline was red (G11). **SUG-256 Ph3 (2026-08-02) narrowed this row**: the coverage tally moved to `/platform/governance-draft` (CTL-030) and is now derived by CTL-027; hero statistics split out to CTL-029. What remains is unprobed. The §05 notice says the tally is being re-measured — nothing fails when that stops being true, so this row's `Next read` date is its only reader |
| CTL-022 | `sugartown_check_boundary` (MCP tool) | convention | none — answers from documented intent, not behaviour | agent at call time; no human reads it | 2026-08-28 | reports boundary status from rules as written rather than as enforced, so it returns a pass where `boundaries.js` matched nothing (G8/G9) |
| CTL-023 | Release history pushed to remote | convention | none — a workflow habit, not a gate | human, at `/eod` | 2026-08-28 | nothing detects unpushed commits between `/eod` runs; 48 commits sat on one disk for two days (G10) |
| CTL-024 | Scope-creep filing (mid-epic findings), detection via `validate:epic-docs` | enforced-by-code | `validate:epic-docs` | `ci.yml` step *Validate epic docs* → `ci-failure-alert.yml` | continuous | proven live in CI run `30930818744` on `f82e50ed` (2026-08-04): ran against real Linear data ("2 in progress, 59 backlog, 20 recently shipped"), correctly failed the build, and named 10 real orphans (SUG-261, 154, 72, 71, 60, 57, 56, 51, 50, 18) — none synthetic. `SUG-261` was a stray test issue, canceled; the other 9 backfilled same day. Not in `.husky/pre-commit`, so a local commit is unchecked until CI, and a skip-ci commit runs no CI at all. 9 historical orphans (SUG-164/168/169/202/233-237) stay allowlisted pending a separate burn-down. The filing-and-committing half of scope-creep discipline — actually writing the doc once flagged — stays `convention`; this control only proves the gap gets *detected* |
| CTL-025 | `validate:doc-budget` | enforced-by-code | `validate:doc-budget` | `ci.yml` → `ci-failure-alert.yml` | continuous | not in pre-commit, so a local commit is unchecked until CI. Measures words across `CLAUDE.md` plus the `docs/conventions/` files it references, so neither blank-line collapsing nor relocation between the two moves the number — but `~/.claude/projects/.../memory/MEMORY.md` is auto-loaded from outside the repo and no repo-side cap can reach it. Cap is 20,150 words: the achieved figure plus 5%, from 19,187 measured 2026-07-30 by `pnpm validate:doc-budget` (SUG-243 Ph3). Probe padding derives from the gate's own reported headroom, not a fixed size — a hardcoded 400 words stopped violating when the cap tightened and the probe reported STAYED GREEN |
| CTL-027 | `validate:governance-tally` (page tally ≡ `governance-coverage.md` layer tables) | enforced-by-code | `validate:governance-tally` | `ci.yml` step *Validate governance tally* → `ci-failure-alert.yml` | continuous | not in `.husky/pre-commit`, so a local commit is unchecked until CI; a skip-ci commit runs no CI at all. Checks that the derived, stated and published tallies agree — **not** that any status value is still true (that is CTL-028). A component marked Strong whose control went inert still counts as Strong. `Gap` is derived and compared against the doc, but has no page tile. Since SUG-256 Ph3 the parsed page is `GovernanceDraftPage.jsx`; the probe derives its injection from the value it finds there rather than hardcoding it, and `mutateFile` now throws on a no-op transform, so a stale needle reports PROBE INVALID instead of misreporting the gate as inert |
| CTL-028 | `governance-coverage.md` status values (Strong / Partial / Inherited / N/A per component) | convention | none — no machine can assert a status judgement is still true; CTL-027 counts the values, it does not validate them | human, at the `Next read` date; `pnpm validate:controls` fails the build once that date passes | 2026-09-30 | three rows carry an unresolved ⚠️ liveness caveat pending re-measurement after SUG-255 (`governance-coverage.md:79, 98, 119`). A component marked Strong whose control went inert still counts as Strong in every downstream tally. Nothing detects a status becoming false. This is the gap CTL-027's Bypass cell names |
| CTL-029 | `/platform/governance` hero statistics — `In flight`, `Current release`, `Epics shipped`, `Vulnerabilities` (`GovernancePage.jsx:224-231`) | measured | none — the stats pipeline is a build-time data path, not a gate | `ci.yml` stats job commits `stats.json`; human, at the `Next read` date | 2026-09-30 | `Vulnerabilities` was the string literal `"0"` with no date and no source until SUG-256 Ph3 wired it to `stats.security.vulnerabilities.total` (dated by `stats.security.fetchedAt`, from `pnpm audit` via `apps/web/scripts/stats/security.js`). No tile renders its measurement date, so a reader cannot tell how fresh any of the four are. A stale `stats.last-good.json` renders as current for `security` with no `isStale` treatment, unlike `linearRoadmap` |
| CTL-030 | `/platform/governance-draft` kept out of search indexes | enforced-by-code | none — requires a deployed HTTP response, which the harness cannot reach | human, once after first deploy — run `curl -sI https://sugartown.io/platform/governance-draft` and read the `X-Robots-Tag` header — then at the `Next read` date | 2026-09-02 | three independent mechanisms, because `SeoHead`'s robots meta is JS-injected and platform routes are not prerendered: `X-Robots-Tag` in `netlify.toml` (load-bearing, needs no JS), `Disallow` in `robots.txt`, and the meta itself. Netlify publishes from `main` on push regardless of CI (CTL-020), so the route is live before any check runs. Nothing validates that the three still agree, and a later session adding the route to `build-sitemap.js` `STATIC_ROUTES` would publish it with nothing objecting |
| CTL-031 | `validate:governance` — schema and closed-world referential integrity over `governance/source/`, overdue `nextRead` on `cadence: dated` records, a scan for governance data authored outside `governance/source/`, two-way correspondence between `probe` records and the liveness harness gate list (obtained by spawning `validate-enforcement-liveness.js --list-gates`, never imported: `main()` runs at module scope), and existence resolution of `claim.command` and `claim.statsKey` | enforced-by-code | `validate:governance` | `.husky/pre-commit` blocks the commit; `ci.yml` step *Validate governance* → `ci-failure-alert.yml` (CTL-013) | continuous | `git commit --no-verify`; a `[skip ci]` commit runs no CI; merge commits run no pre-commit hook; Netlify publishes from `main` regardless of CI (CTL-020) and does not run this check until Phase 4. Proves correspondence and shape, never truth: a schema-valid but factually wrong value passes. **Which state each check reads:** the outside-source scan reads the INDEX; schema, referential integrity, overdue, `claim.command` and `claim.statsKey` read the WORKTREE, so a staged `package.json` deleting a script passes while the worktree still holds it. **Scan coverage:** at least 300 files across `apps/web/src/`, `docs/ai/agentic-caucus/`, `scripts/`, `packages/` — read the count from `pnpm validate:governance`, not from this cell. A register or coverage table under `docs/briefs/`, `docs/backlog/`, `docs/shipped/`, `docs/reviews/` or `.claude/` is invisible to it, as is a coverage table with any column reworded. Hardcoded governance values in JSX are out of scope by design → CTL-033 (Phase 4). **The two-way check proves correspondence, not coverage:** a gate with neither a probe nor a record passes both directions because there was nothing to check, and a record asserts a probe exists rather than that it ran. Gate-set coverage stays with `validate:controls` check 3. **`claim.command` proves a target exists, never that it reproduces the value** (full run-and-compare is a Non-Goal, PRD §3): `git`, `curl` and `gh` verify nothing at all and are reported as unverifiable on every run; `npx` verifies nothing unless the binary is in `node_modules/.bin`; a compound `a && b` checks only the first clause; and a bare `pnpm <script>` resolves against the root manifest only, `pnpm --filter <pkg> <script>` against that package's, because `pnpm validate:css-names` from root is `command not found`. **`claim.statsKey`** must resolve to a primitive: `security.vulnerabilities` resolves to an object while the published figure is `.total`, so a bare resolution check would pass the one record it exists to police. **Overdue reporting:** an overdue `nextRead` exits 1 on a clean tree, which `gateProbe`'s control run reports as `PROBE INVALID — cannot vouch for this gate`. Accepted, not fixed (SUG-274 Part 2, option A). No source record is dated before 2026-10-28 today, so the 2026-08-29 event lands on CTL-015, not here; once Phase 3 migrates the register into `controls.json` the same event blocks every commit in the repo via pre-commit and invalidates every probe on this gate. Read the probe count from `pnpm validate:governance` rather than from this cell. **Deferred, with owners:** crosswalk layer completeness → Phase 3 |
| CTL-034 | `validate:governance-diff` — the generated `apps/web/src/generated/governance.json` still corresponds to `governance/source/`. Regenerates into a scratch dir and byte-compares; never writes a tracked file | enforced-by-code | `validate:governance-diff` | `.husky/pre-commit` blocks the commit; `ci.yml` step *Validate governance diff-clean* → `ci-failure-alert.yml` (CTL-013) | continuous | `git commit --no-verify`; a `[skip ci]` commit runs no CI; Netlify publishes from `main` regardless of CI (CTL-020). A schema-valid but factually wrong *value* hand-edited into both source and artifact together passes — this proves correspondence, not truth. Named under the `validate:` prefix deliberately: under `governance:` it would be invisible to `validate:validators` and to this register's own completeness check, so unwiring it from pre-commit and CI would leave both green |
| CTL-035 | `probe.derivation` — whether each probe record's `derived-from-target` / `static-input` classification is true of the probe it names (`governance/source/probes.json`, published in `apps/web/src/generated/governance.json`) | convention | none — the schema checks the enum and requires `staticJustification`, never that the value matches the probe's code; the only mechanical alternative is regex over the harness source, forbidden by PRD §5.2 | human, at the `Next read` date; `pnpm validate:controls` fails the build once that date passes | 2026-11-06 | classified by hand, one record at a time, when the 21 records were seeded 2026-08-06. Nothing detects a misclassification, and nothing detects one going stale when a probe is rewritten to stop deriving its injection. `derived-from-target` is the cheaper label because it needs no justification, so the unaudited value is the one a hurried session reaches for. Rendered at Phase 4 with no measurement date in the artifact |

---

## Known coverage gaps

Measured 2026-07-28 by reading `PROBES` and every workspace `package.json`.

- **6 of 12 `validate:*` scripts have no probe** (CTL-008 to CTL-012, CTL-014). They are wired
  and they run. Nothing proves they would fail against a broken input.
- **`typecheck`, `build` and `test:smoke` have no probes** (CTL-016 to CTL-018).
- **4 controls are `convention` with no machine backstop** (CTL-012, CTL-020, CTL-022,
  CTL-023). Three of the four are materialised gaps in the 2026-07-28 post-mortem.
- **CTL-019's probe checks reachability, not detection.** It catches `chromatic.sh` dying on
  line 1. It would not catch Chromatic running and finding nothing.
- **CTL-013 backs up eleven other rows and has no probe.** It fails silently, so it has the
  shortest re-read interval here.

Closing these is SUG-256 follow-up work, not a precondition for the register being useful.

**`Reader` cells now name the CI step, not a line number (2026-08-01, SUG-256).** The SUG-256
verification review found four cells citing the wrong `ci.yml` line — CTL-011, CTL-014, CTL-017
and CTL-018 pointed at a different validator, a comment, an env var and a cache directive. The
first fix attempted was to correct the numbers. That fix broke itself: adding the
`Validate governance tally` step in the same change shifted every line below it, so four
freshly-corrected references were wrong again before they were committed.

Line numbers cannot survive an insertion, and nothing checks them. Step names can, and they
match on the workflow's own `- name:` values. Corrected references point at steps from here on.
