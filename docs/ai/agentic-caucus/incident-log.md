# Agentic Caucus — Incident Log

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 30 June 2026
**Related:** [[failure-modes]] (`docs/ai/agentic-caucus/failure-modes.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[methodology]] (`docs/ai/agentic-caucus/methodology.md`)

---

## Purpose

This is the append-only home for confirmed incidents. It closes the Layer 6
incident-reporting gap recorded in [[governance-coverage]]: before this log, confirmed
failures were scattered across session post-mortems, "process failure" annotations in
commits, and ad-hoc notes. They now have one registry.

The distinction from [[failure-modes]] matters:

- **A failure mode** is a *class*: a reproducible pattern an agent exhibits (FM-C-03
  speculative fixes, FM-X-02 confidence without verification).
- **An incident** is a dated *instance*: a specific occurrence in a real session that
  produced a real consequence. An incident usually maps to a failure mode, and confirms
  it. A new incident with no matching failure mode is a signal to add one.

This log records instances. Failure modes live next door.

---

## When to append

Add an entry when a failure has **occurred in a real session and produced a real
consequence** (wasted work, a broken build, a lost session, a misleading output that
reached a decision). The same bar as [[failure-modes]]: confirmed and consequential, not
suspected or harmless.

Do not log routine corrections, expected gate stops, or anything caught before it cost
something. The log is a record of what got through, not a diary.

## Append format

Newest entries at the top of the registry. One entry per incident:

```markdown
### INC-NNN — <short title>
**Introduced:** YYYY-MM-DD · **Noticed:** YYYY-MM-DD · **Severity:** <Low | Medium | High>
**Failure mode:** <FM-ID or "new pattern"> · **Found by:** <automated gate | scheduled audit | tool symptom | investigation | accident>

**What happened:** One or two sentences. What the agent did, in which surface.
**Consequence:** The real cost. Commits squashed, time lost, build broken, output corrected.
**Resolution:** How it was caught and fixed, and any rule or validator added so it does not recur.
```

`INC-NNN` increments monotonically and is never reused. Severity is the cost, not the
likelihood: High means lost work or a shipped-then-reverted change; Medium means a
correction cycle; Low means a noise commit squashed before merge.

**`Introduced` and `Noticed` are both required**, and the gap between them is the point.
Mean Time To Notice is the metric this log exists to make computable — the industry tracks
Mean Time To *Recovery*, which measures how fast you fix what you already know about, and
says nothing about how long you did not know. Capture both dates **at the time**;
reconstructing an introduction date later is forensic work, and the reconstruction is
usually the expensive part of the incident.

Where `Introduced` is genuinely indeterminable, write `unknown` — `scripts/mttn.js` excludes
those rows rather than guessing. Where it is approximate (a drift that began when two files
stopped being updated together), give the date and mark it `~`.

**`Found by`** records the mechanism, not the person. `automated gate` means a check failed
and that failure is what surfaced it. If a human went looking, it is `investigation`, however
sophisticated the looking was. The distinction matters: a log where nothing is ever found by
a gate is a log describing gates that do not work.

---

## Incident Registry

### INC-011 — Four architectural boundary rules declared, none ever firing
**Introduced:** 2026-02-01 · **Noticed:** 2026-07-27 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** `packages/eslint-config/boundaries.js` declared four `no-restricted-imports`
architectural rules. None fired for any package, ever, via four independent causes: override
globs anchored to the consuming package's own directory rather than repo root; a last-wins
override collision silently discarding Rule 1; flat-config apps that never imported the file;
and `**/*.{ts}`, a single-element brace minimatch does not expand.
**Consequence:** Architecture unpoliced for 176 days. Two real violations accrued in
`packages/design-system`. Worse, `sugartown_check_boundary` read the same file and interpreted
its globs as *intended*, so the MCP tool confidently answered "not permitted" for imports
ESLint was silently allowing — a false-confidence oracle built on a dead rule.
**Resolution:** SUG-254 (paused behind SUG-255). Approved design replaces glob-matched
overrides with explicit, glob-free scope keys, making three of the four causes structurally
impossible. `docs/epic-template.md` gained an enforcement-liveness gate: prove a rule fires,
do not confirm it exists.

### INC-010 — CI workflow has never passed
**Introduced:** 2026-02-20 · **Noticed:** 2026-07-27 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** The CI workflow was added 2026-02-20. Across 210 recorded runs on all
branches it has concluded `success` zero times. It fails at its first step, so `typecheck`,
four `validate:*` steps, `build` and the route smoke tests have never executed in CI at all.
**Consequence:** Every close-out gate reading "CI green" was unverifiable for 157 days. Six
releases shipped through it in the final 48 hours alone. Because CI was never green there was
no transition to notice — an always-red gate is indistinguishable from an unread one.
**Resolution:** SUG-255. 79 of 84 lint errors cleared; typecheck, Chromatic and a failure
notification tracked. CLAUDE.md close-out step 1b now requires a named green run ID rather
than an assertion.

### INC-009 — Chromatic VRT died before its first line, on every CI run
**Introduced:** 2026-06-21 · **Noticed:** 2026-07-27 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** `apps/storybook/scripts/chromatic.sh` opened with
`set -a; . ./.env 2>/dev/null; set +a`. The POSIX dot command is a special builtin: when the
file is missing, a non-interactive shell exits immediately, and `2>/dev/null` suppressed the
message but not the exit. `.env` is gitignored, so it never exists in CI.
**Consequence:** Visual regression testing did not run in CI for 36 days. Because the script
died before its first `echo`, the logs were empty, so the failure read as a Chromatic problem
rather than a shell one. INC-008 reached production inside this window.
**Resolution:** SUG-255 Phase 3. `docs/architecture/monorepo-overview.md` now requires CI
shell scripts to be tested under `dash` with CI's assumptions, not just macOS `/bin/sh` —
the two differ in exit code and in whether the script survives at all.

### INC-008 — Design-system regression live in production, found by accident
**Introduced:** 2026-07-24 · **Noticed:** 2026-07-26 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** accident

**What happened:** `esbuild-css-modules-plugin` camelCases class names in its compiled map,
while component source read them via hyphenated bracket notation. The lookup returned
`undefined` and the modifier class silently never applied — in the *built* package only, which
is what every consumer resolves. Grid hairline dividers, Card variant styling, Columns layout
and Metric trend colour all broke.
**Consequence:** Two days live on production. Found while working an unrelated epic (SUG-245),
not by any gate — Chromatic, the check that exists precisely to catch this, had been dead for
five weeks (INC-009).
**Resolution:** SUG-247 renamed the classes to camelCase-safe names with explicit lookup maps.

### INC-007 — "0 gaps" published as a public governance claim while false
**Introduced:** 2026-06-30 · **Noticed:** 2026-07-27 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** `/platform/governance` §05 published "30 checkpoints · 0 gaps" with no
measurement date and no source. CI had already been red for 51 days when the claim was
written, so it was false for its entire life. The line was then revised three times —
`components` → `checks` → `checkpoints` — including once during SUG-245, an epic explicitly
named an accuracy pass. Every revision changed the noun. The number was never questioned.
**Consequence:** 27 days of a public, unbacked claim about the platform's own rigour, on a
platform whose positioning is the portfolio. For two of those days it rendered inside the
exact `<Grid spacing="0">` that INC-008 proved was broken.
**Resolution:** Claim replaced with "30 checkpoints · mapped 2026-07-26" and deployed.
`governance-coverage.md` v1.3 added a liveness caveat and three ⚠️ rows. CLAUDE.md's red-pen
gate now covers published governance statistics: measurement date plus a named source.
Re-derivation tracked as SUG-256.

### INC-006 — Repo-wide lint red for three days, reported as one-twelfth its size
**Introduced:** 2026-07-24 · **Noticed:** 2026-07-27 · **Severity:** Medium
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** 84 lint errors across three packages. `.husky/pre-commit` lints only
`apps/web`, so nothing local caught it; CI is fail-fast, so its log reported the first failing
package and stopped — showing 7 errors where 84 existed.
**Consequence:** The first scoping pass of SUG-255 trusted the CI log and understated the
problem twelvefold. Later in the same session an ad-hoc script over-counted a *different*
defect 35× (143 reported, 4 real) — the same error in the opposite direction, hours apart.
**Resolution:** 79 fixed in `52eb7702`. CLAUDE.md §Verify before citing now states that CI
logs are not an audit oracle. Widening pre-commit and `turbo run lint --continue` tracked in
SUG-255 Phase 4.

### INC-005 — `__APP_VERSION__` unfrozen for 94 days; its sibling took 26
**Introduced:** 2026-04-16 · **Noticed:** 2026-07-19 · **Severity:** Medium
**Failure mode:** FM-C-03 (speculative / partial fixes) · **Found by:** tool symptom

**What happened:** `__BUILD_DATE__` and `__APP_VERSION__` were introduced in the same commit
(`a364db59`, SUG-65). Both are build-time globals that make Storybook stories diff on every
build. `__BUILD_DATE__` was frozen 2026-05-12. The fix never circled back to its sibling from
its own origin commit.
**Consequence:** The Footer story diffed on Chromatic on every version bump for 94 days,
training the reviewer to treat that story's diffs as noise. Same bug, same commit, 68 days
apart.
**Resolution:** `56da62ff` froze `__APP_VERSION__`. CLAUDE.md now requires re-checking every
*existing* `define:` entry when a new one is added, not only the one that prompted the report.

### INC-004 — Root `validate-tokens.js` orphaned and stale for 127 days
**Introduced:** 2026-03-14 · **Noticed:** 2026-07-19 · **Severity:** Low
**Failure mode:** FM-C-02 (reinvention under uncertainty) · **Found by:** scheduled audit

**What happened:** A root-level `scripts/validate-tokens.js` sat alongside the canonical
`apps/web` version, genuinely different in implementation, wired only to its own
`package.json` entry and invoked by nothing automated.
**Consequence:** A validator that appeared to exist and ran on no hook and no CI job. Low
direct cost; it is logged because it is the same class as INC-009 and INC-010, and it is the
only one on this list found by a deliberate scheduled audit rather than by someone tripping
over it.
**Resolution:** SUG-221 rules audit finding 12. Script retired, root entry repointed.

### INC-003 — Four schema fields silently discarded their validation limits
**Introduced:** unknown · **Noticed:** 2026-07-27 · **Severity:** Low
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** tool symptom

**What happened:** Four fields declared `description` twice in one object literal. The later
key wins in JavaScript, so the validation-limit parenthetical was discarded in every case and
never rendered in Studio. CLAUDE.md's own convention specifies merging into an existing
trailing parenthetical rather than stacking a second key.
**Consequence:** Editors typed past `Rule.max()` limits with no hint and were rejected on
save. The source read as compliant while the product was not. `Introduced` is `unknown`: the
limits were added across several unrelated commits and the exact first instance is not worth
reconstructing.
**Resolution:** `d5b53567` merged all four. Surfaced by esbuild's own "Duplicate key" warnings,
which had been printing on every Studio dev start and going unread.

### INC-002 — DS-package theme file decayed to a stale subset
**Introduced:** ~2026-04-08 · **Noticed:** 2026-06-13 · **Severity:** High
**Failure mode:** FM-X-02 (confidence without verification) · **Found by:** investigation

**What happened:** The `theme.pink-moon.css` copy in the DS package silently drifted from
the canonical web copy, decaying to a stale subset missing 93 token overrides. The
`validate:tokens` check passed throughout, because every `var(--st-*)` reference still
*resolved* via the shared `tokens.css` — it never checked that the two theme files carried
the same override set.
**Consequence:** DS components rendered incorrectly in Storybook while production looked
fine, hiding the drift. "Refs resolve" was mistaken for "themes match."
**Resolution:** Added `validate:style-mirror` to enforce byte-identical parity across the
mirrored style files, wired into pre-commit. The mirrored-file registry in `CLAUDE.md` now
names every must-be-identical pair and its enforcement mechanism.

### INC-001 — One-off `term*` CSS instead of shared vocabulary
**Introduced:** 2026-06-09 · **Noticed:** 2026-06-10 · **Severity:** Medium
**Failure mode:** FM-C-02 (over-documentation / reinvention under uncertainty) · **Found by:** investigation

**What happened:** `GlossaryTermPage` shipped with roughly nine one-off `term*` CSS patterns,
each of which had an existing shared class or component already available. The build session
reached for new CSS rather than the established detail-page vocabulary.
**Consequence:** A follow-up refactor deleted around 150 lines and took a full session that
would not have been needed had the page started from the shared vocabulary.
**Resolution:** Wrote `docs/conventions/detail-page-recipe.md` (component-first vocabulary)
and the CSS class pre-implementation reuse audit + proposal-table gate in `CLAUDE.md`, so a
new detail page starts from the shared map instead of rediscovering it.

---

## Changelog

### v1.1 — 2026-07-27
SUG-255 / SUG-259. Format changed: `Date` split into **`Introduced`** and **`Noticed`**, and
a **`Found by`** field added, so Mean Time To Notice becomes computable — see
`scripts/mttn.js` and `pnpm mttn`. INC-001 and INC-002 backfilled with both dates.

Appended nine incidents (INC-003 → INC-011), seven of them pre-dating this entry and
recovered from committed post-mortems, the SUG-221 rules audit, and the 2026-07-25→27
session. Across the eleven logged incidents: **MTTN 65 days, median 36, range 1–176, and
none found by an automated gate.**

Two observations this backfill produced, recorded because they are the reason the format
changed. First: **this log went 27 days un-appended after its own creation**, including
INC-008 — a shipped-then-reverted production regression that met its stated High bar. A log
nobody appends to is another mechanism that is declared and not firing, which is the failure
class most of these entries describe. CLAUDE.md close-out step 8b now requires an
incident-log check whenever an epic fixes something already shipped, with "no incident" as
an explicit permitted answer.

Second: the reason this backfill was possible at all is that CI produced **no** usable
history — it has never passed, so there is no red-to-green transition anywhere to mine. Every
date here came from a post-mortem, an audit, or `git log`. Prose written at the time turned
out to be better telemetry than the pipeline built to produce telemetry.

### v1.0 — 30 June 2026
Initial document (SUG-198). Defined the append format and the failure-mode/incident
distinction. Seeded with two confirmed, dated incidents (INC-001, INC-002) drawn from
existing post-mortems. Closes the Layer 6 incident-reporting gap in [[governance-coverage]].
