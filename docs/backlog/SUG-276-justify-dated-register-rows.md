---
**Epic:** SUG-276 — Justify or retire the dated rows in the control register
**Linear Issue:** [SUG-276](https://linear.app/sugartown/issue/SUG-276/justify-or-retire-the-dated-rows-in-the-control-register-due-2026-08)
**Status:** Backlog
**Priority:** 🟠 Due 2026-08-28 — the five rows below turn CI red on 2026-08-29
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-276 — Justify or retire the dated rows in the control register

Filed 2026-08-07 at Bex's direction, during SUG-268 Phase 2.

## Background

The `Next read` dates in `docs/ai/agentic-caucus/control-register.md` are arbitrary. Every one
is `+1 month` or `+3 months` from the day the register was written (2026-07-28):

| Due | Rows |
|---|---|
| 2026-08-28 | 5 |
| 2026-09-02 | 2 |
| 2026-09-30 | 2 |
| 2026-10-28 | 8 |
| 2026-11-06 | 1 |

Nothing happens on those dates. They are a forced re-read interval, not a prediction — which is
defensible for some rows and empty ritual for others.

Bex, 2026-08-07: *"do we need this totally arbitrarily chosen date?"*

## Objective

The rows that genuinely need a person to look keep their dates for now. By **2026-08-28**, each
one is:

1. **Explained** — to Bex, in plain language, in one or two sentences
2. **Documented** — written where the person debugging the red build will find it
3. **Shown to be necessary** — the right control, in the right place, at the right time

A row that cannot survive all three is retired or converted, not re-dated. *"Do not simply move
the date"* is already the register's own rule; this is the test of whether we mean it.

## Scope

- [ ] Work through the five rows due 2026-08-28 — CTL-013, CTL-019, CTL-020, CTL-022, CTL-023 —
      one at a time, against the three tests above — layer: docs (gated)
- [ ] Retire or convert any row that fails a test, rather than re-dating it — layer: docs (gated)
- [ ] Record the outcome where a person hitting the red build will see it, which is the row's own
      Bypass cell — layer: docs (gated)

## What the dates currently conflate

One column doing three jobs, and the reader cannot tell which one fired:

| What the date means | Rows | What should happen when it fires |
|---|---|---|
| A person genuinely has to look; no machine can | CTL-020 (Netlify deploy path), CTL-022 (MCP boundary tool), CTL-023 (unpushed commits) | read it — the recurring read is the only control there is |
| "No probe yet" — a backlog item wearing a date | CTL-008 to CTL-011, CTL-016, CTL-018 | write the probe; re-dating is avoidance |
| Cannot be exercised locally | CTL-013 (CI-red signal), CTL-019 (Chromatic) | a third case, currently unnamed |

## What happens on 2026-08-29 if nothing changes

Reproduced by running `scripts/validate-control-register.js` with the clock forced to that date:
exit 1, five OVERDUE errors. Because `gateProbe`'s control run reads a non-zero exit, both probes
on `validate:controls` report `PROBE INVALID`, so the liveness job goes red saying **"Fix the
probe"** about probes that are working — and the "Inert gates" summary is suppressed for that
run, so a check that genuinely died that day shows up only as an inline line.

Pre-commit is unaffected today: `validate:controls` is not in `.husky/pre-commit`, and no
`governance/source/` record is dated before 2026-10-28. That changes at SUG-268 Phase 3 — once
the register migrates into `controls.json`, the same event runs through `validate:governance`,
which **is** in pre-commit, and blocks every commit in the repo.

## Non-Goals

- Redesigning the `Next read` column. The structural fix — splitting it by what the date means —
  is a **SUG-268 Phase 3** decision, since the migration rewrites every row anyway and
  `control.cadence` is already a schema field with that shape. This issue is the interim
  obligation for the rows keeping their dates.
- Touching the "no probe yet" rows. Those are a separate conversation about whether a date is the
  right container for a backlog item.

## Related

- SUG-268 Phase 3 — the structural fix
- `docs/conventions/verification-review.md` — what a control's Reader and Next read are for

## Verify

```bash
grep -oE "\| (20[0-9]{2}-[0-9]{2}-[0-9]{2}|continuous) \|" docs/ai/agentic-caucus/control-register.md \
  | sort | uniq -c | sort -rn
```
