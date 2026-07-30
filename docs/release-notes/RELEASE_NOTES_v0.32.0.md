# Release Notes — v0.32.0

**Date:** 2026-07-30
**Scope:** Sugartown monorepo — apps/web, apps/studio, apps/storybook, apps/contentful-poc,
packages/design-system, packages/eslint-config, packages/storybook-docs, packages/mcp-server,
CI, governance docs

---

## What this release is

This release is about the difference between a rule being declared and a rule being enforced.
Four architectural boundary rules had been reporting as configured while matching nothing for
176 days. CI had never passed. A published governance claim asserted zero gaps while the
pipeline behind it was red. Each of those is now either fixed or measured, and the machinery
added here exists to make the next instance visible rather than silent.

---

## What changed

### Boundary rules that were configured and doing nothing

`packages/eslint-config` used glob-matched ESLint overrides to scope four architectural
boundary rules. The globs matched no files, so the rules never fired — but nothing reported
that, because a rule that matches nothing produces no errors and no warnings. `boundaries.js`
is replaced by `boundary-rules.js` and `boundaries-for.js`, with glob-free scope keys shared
across the ESLint v8 and v9 config split so both halves of the repo use the same definitions.

`sugartown_check_boundary` had the same shape of problem from the other direction: it answered
from the rules as documented rather than as enforced, so it returned a pass for boundaries that
were inert. It now reports enforced behaviour.

### Gates that prove they fail

`validate:enforcement-liveness` is new, and it inverts how gates are checked. Rather than
confirming a validator exists and is wired, it feeds each gate a deliberately broken input and
asserts the gate rejects it. Thirteen gates are proven live this way.

Alongside it, `validate:controls` and a control register record every gate, validator, deploy
path and published claim in the platform — 25 rows, each naming its probe, who reads its
result, and by when. A `verification-reviewer` subagent runs before any new gate is built.

`ci-failure-alert.yml` surfaces a red run on `main` through a rolling issue. That gap is why CI
was able to stay red unnoticed: it passed on `main` for the first time in the workflow's
existence this cycle, on run `30365991635`, after 212 runs since 2026-02-20.

### The instruction surface has a size limit

CLAUDE.md is read in full at the start of every session, and it had grown to 907 lines by
appending. It is now 811 lines and 10,331 words, and the surface a session actually reads —
CLAUDE.md plus the convention files it links to — is capped at 20,150 words and enforced in CI
by `validate:doc-budget`. The cap measures words across the whole surface rather than lines in
one file, so neither deleting blank lines nor moving text into `docs/conventions/` moves the
number.

All 60 rules in CLAUDE.md now have stable `RULE-NNN` IDs and a register recording each rule's
origin, classification and location. Nine incident narratives moved out of CLAUDE.md into that
register, keyed by ID, so a rule can be followed without reading its history. The strikethrough
convention for retired rules is gone — a retired rule kept its full text in place, which meant
reading it to discover it no longer applied.

### A published claim that was not true

`/platform/governance` asserted "0 gaps" with no measurement date and no reproducing command,
while the pipeline behind the claim had been red for three months. The assertion is removed and
the claim now carries a liveness caveat until enforcement liveness is measured.

### Studio validation limits that never reached editors

`seoMetadata`, `linkItem` and `navigation` each had two `description` keys on the same field.
In JavaScript the later key silently wins, so the description carrying the stated character
limit was discarded before Studio rendered anything. Editors saw a field with no limit stated
while validation still enforced one. The keys are merged.

### Storybook doc helpers live in their own package

Shared Storybook doc helpers sat inside `apps/storybook`, which meant other packages reached
across a boundary to use them. They now live in `packages/storybook-docs`.
`EntityDetailPageDocs` moved the other way, into `apps/web`, the app that actually owns it.

Separately, `__APP_VERSION__` was not frozen in Storybook's build config, so every version bump
produced a Chromatic diff on the Footer story with no visual change. Build-time globals are now
frozen.

---

## Not in this release

- **`validate:banned-words` is not built.** The words-to-avoid check in the instruction style
  guide is fixed and returns zero, but it runs by hand. Wiring it as a gate is SUG-264.
- **Nine controls in the register have no probe.** They are wired and they run; nothing proves
  they would fail against a broken input. Six are SUG-256 follow-ups.
- **`ci-failure-alert.yml` has never fired.** Exercising it needs a genuinely red run on
  `main`, so it remains an unproven control despite backing eleven other rows.
- **`/platform/governance` statistics are not re-measured.** The false assertion is removed;
  deriving the real figure is outstanding.
- **SUG-238 is mid-epic.** Phase 1 shipped `user-story-conventions.md`; phases 2–3 are open.
- **`docs/epic-template.md` was not fully restyled.** Its narrative was extracted; the
  checklist scaffolding was deliberately left alone.

---

## Validator state at release

```
validate:doc-budget           18,906 / 20,150 words — 1,244 headroom
validate:controls             every row complete, every probe reference resolves, nothing overdue
validate:enforcement-liveness 13 gates proven live, 0 inert
validate:validators           13 wired, 1 manual-by-design, 0 orphaned
pnpm lint                     0 errors; 4 warnings across 3 packages
CI                            run 30542636194, success on 02599e2c
```
