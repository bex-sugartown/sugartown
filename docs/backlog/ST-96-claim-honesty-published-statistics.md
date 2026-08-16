---
**Epic:** ST-96 — Claim honesty for published statistics
**GitHub Issue:** [#96](https://github.com/bex-sugartown/sugartown/issues/96)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go
---

# ST-96 — Claim honesty for published statistics

## Background

Build-back item 2 of 3 from the governance post-mortem
(`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7).

INC-007: `/platform/governance` published "30 checkpoints · 0 gaps". It was false for its
entire 27-day life, published `50598f8c` on 2026-06-30, which was 51 days after CI went red on
2026-05-10, and removed by `52a86dbb` on 2026-07-27. It was revised three times in that window
and corrected zero times. A tally that is true when written and never re-measured becomes a
false public claim silently.

The tally is not published anywhere as of v0.33.0. SUG-284 removed
`/platform/governance-draft`, the `noindex` page that had been hosting it.

## Objective

Any rendered count about the platform's own rigour carries a measurement date and the command
that produced it, or it is not published.

## Scope

- [ ] Inventory every published self-referential statistic currently rendered — layer: audit
- [ ] Decide the mechanism: a schema field pair, a generated block, or a red-pen gate extension — layer: process
- [ ] Implement — layer: web
- [ ] Reconcile with CLAUDE.md's technical-diagram red-pen gate, which already carries part of this — layer: process

## Non-Goals

- Republishing the retired coverage tally. Whether it returns at all is a separate decision.
- Any register or index. That is ST-97, conditional on this epic and ST-95 both proving
  out.

## Kill criterion

**Retire if no such statistic is published for 90 days.** Set at birth per post-mortem 6.7.

## Blocked by

**ST-95** ([#95](https://github.com/bex-sugartown/sugartown/issues/95)). This epic does not
open until ST-95 has run a full epic cycle and the written answer to "did it catch anything
a human would not have?" is yes. Two consecutive noes end the rebuild and this epic is
cancelled rather than started.

## Prior art already live

CLAUDE.md's technical-diagram red-pen gate already requires that published governance
statistics carry a measurement date and name the command producing the number. This epic is
partly a question of whether that rule is sufficient and merely needs enforcement, or whether
it needs a mechanism.

## Related

- **GitHub:** [#96](https://github.com/bex-sugartown/sugartown/issues/96)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7
- **Blocked by:** ST-95 ([#95](https://github.com/bex-sugartown/sugartown/issues/95))
- **Next in sequence:** ST-97 ([#97](https://github.com/bex-sugartown/sugartown/issues/97))
