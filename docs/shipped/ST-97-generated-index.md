---
**Epic:** ST-97 — Generated index, only if #95 and #96 prove out
**GitHub Issue:** [#97](https://github.com/bex-sugartown/sugartown/issues/97)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go
---

# ST-97 — Generated index, only if #95 and #96 prove out

## Background

Build-back item 3 of 3 from the governance post-mortem
(`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7).

**This is a conditional item, not a scheduled one.** It exists so that if anything
register-shaped ever returns, the preconditions are written down in advance rather than
rediscovered.

Two findings make it a precondition. §3.4: the removed layer ran six ID namespaces with no
index, so there was no single place to answer "what applies to the change I am about to make?"
§3.6: counts were wrong in every direction, repeatedly, because the registers were
hand-maintained with no generation step, which made every claim provisional until re-measured.

## Objective

One index mapping every governance ID to its owner, regenerated from the repo, never
hand-maintained, one ID scheme.

## Scope

- [ ] Confirm both preconditions were met, in writing, before any other scope item starts — layer: process
- [ ] Define the single ID scheme — layer: process
- [ ] Build the generator — layer: tooling
- [ ] Name the consumer before the generator ships, per post-mortem 6.1 — layer: process

## Non-Goals

- Any hand-maintained table. §6.4: registers are generated or they do not exist.
- Reviving `control-register.md`, `rule-register.md`, or `governance-coverage.md`. All three
  are archived in `zArchive/2026-08-sug284-governance-layer/` and are on §7's "explicitly not
  rebuilt" list.

## Kill criterion

**Never hand-edit. If it drifts, delete it.** Set at birth per post-mortem 6.7.

## Blocked by

**ST-95** ([#95](https://github.com/bex-sugartown/sugartown/issues/95)) **and ST-96**
([#96](https://github.com/bex-sugartown/sugartown/issues/96)). Opens only if both prove out.
If either returns two consecutive "caught nothing a human would not have" answers, the rebuild
ends and this epic is cancelled unstarted.

## The consumer question

Post-mortem 6.1 is the rule this epic is most likely to break: no generator ships before the
thing that reads its output exists. The removed `governance.json` had zero consumers anywhere
in the app. Before any generator is written here, name the reader.

## Related

- **GitHub:** [#97](https://github.com/bex-sugartown/sugartown/issues/97)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §3.4, §3.6, §7
- **Blocked by:** ST-95 ([#95](https://github.com/bex-sugartown/sugartown/issues/95)), ST-96 ([#96](https://github.com/bex-sugartown/sugartown/issues/96))
