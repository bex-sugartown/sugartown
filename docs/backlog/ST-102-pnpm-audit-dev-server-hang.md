---
**Epic:** ST-102 — Stats pipeline security collector blocks web dev server startup
**Issue:** [#102](https://github.com/bex-sugartown/sugartown/issues/102)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
---

# ST-102 — Stats pipeline security collector blocks web dev server startup

The `security` stats collector runs `pnpm audit --json` synchronously with no timeout on every `apps/web` dev-server start, adding well over a minute to cold boot. Give it the same graceful-degradation behavior every other network collector already has.

## Background

`/morning` on 2026-08-21 found the `web` dev server down after a restart and, once
`preview_start` relaunched it, it took 95440ms to reach "ready" — visible in the Vite log as a
long silent gap right after `[stats] perf: stale — falling back to last-good` and before the
`VITE ready in...` line. Isolating the cause: `apps/web/scripts/stats/security.js`
`collectSecurity()` calls `execSync('pnpm audit --json', ...)` with no `timeout` option, invoked
synchronously from `collect-stats.js`, which itself runs on every `apps/web` dev-server start via
the `sugartown:stats` Vite plugin's `buildStart` hook (`apps/web/vite.config.js`). Measured
standalone the same session: `pnpm audit --json` was still running after 35+ seconds, climbing
past 100% CPU and ~4GB memory. `execSync` blocks the Node event loop for its entire duration, so
nothing else in `collect-stats.js` — and no part of Vite's own startup — can proceed until it
returns.

Every other network collector in the pipeline (`crux.js`, `github.js`, `sanity.js`, `graph.js`,
`linear.js`) already degrades to `{ stale: true }` or last-good data on failure per
`collect-stats.js`'s documented contract ("Network collector failure → degrades to stale data").
`security.js` is the one collector that can't fail fast — it just blocks until `pnpm audit`
finishes, however long that takes.

## Objective

`collectSecurity()` returns within a bounded time on every `apps/web` dev-server start,
degrading to stale/last-good data (consistent with the other network collectors) if `pnpm audit`
doesn't finish inside that bound, instead of blocking Vite startup indefinitely. No change to
`stats.json`'s `security` shape, `Objective` only touches `apps/web/scripts/stats/security.js`
and, if needed, `collect-stats.js`'s collector-invocation loop — no schema, no GROQ, no React
render layer.

## Scope

- [ ] Give `collectSecurity()`'s `execSync` call a timeout, and treat a timeout the same as any
      other collector failure (`{ stale: true, error: ... }`, falling back to last-good per the
      existing `collect-stats.js` contract) — layer: tooling
- [ ] Confirm whether `execSync`'s blocking nature is itself the problem (event-loop stall even
      within a timeout window) or only the missing bound — if the former, convert to
      non-blocking `exec`/`execFile` with a `Promise` wrapper instead — layer: tooling
- [ ] Re-measure `apps/web` dev-server cold-boot time before/after and record both numbers in
      the shipped doc — layer: tooling

## Acceptance criteria

- [ ] `pnpm --filter web dev` reaches Vite's "ready" line without waiting on `pnpm audit` to
      fully complete when `pnpm audit` is deliberately slowed (e.g. throttled network) or made to
      hang — verified locally, not just by code inspection
- [ ] A failed or timed-out `collectSecurity()` call produces the same `{ stale: true, error }`
      shape the other network collectors already produce, and `stats.json`'s `security` key
      falls back to `last-good` exactly as `crux`/`github`/`sanity` do today
      (`collect-stats.js` lines 108–120 — read current line numbers at activation, this is
      pre-existing logic, not new)
- [ ] CI's own `pnpm audit` usage (if `collect-stats.js` also runs in CI/build) is unaffected —
      confirm whether CI needs the full unbounded audit result and, if so, that this change
      doesn't silently degrade CI's `security` stats to stale on every run

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic is scoped to
one Node build-tooling script; nothing it touches renders on any page.

## Technical notes

- **Content Write Gate**: does not apply — no Sanity content or copy is touched.
- **Schema changes**: none.
- **Upstream dependencies**: none known.
- **Activation audit**: read `apps/web/scripts/collect-stats.js` in full (not just the excerpt
  reviewed during triage) to confirm the exact fallback contract before changing
  `security.js` — in particular re-check the `envGuards` map (currently only `linearRoadmap`
  and `github` are env-guarded) to decide whether `security` needs a similar guard or just a
  timeout.
- **Activation audit**: read `apps/web/vite.config.js`'s `sugartown:stats` plugin definition to
  confirm `collect-stats.js` really does run on `buildStart` for `pnpm dev` (not only
  `pnpm build`) — this was inferred from the observed startup log, not read directly from the
  plugin source, during triage.
- **Model & Mode**: `/model sonnet` — this is a scoped Node.js tooling fix (one collector
  function, a timeout/error-handling change) with a clear existing pattern to follow
  (`crux.js`/`github.js`'s own graceful-degradation shape). No architectural ambiguity; Sonnet 5
  executes directly, no plan-mode handoff needed.

## Model & Mode [REQUIRED]

`/model sonnet` — scoped tooling fix, existing pattern to follow, no architecture decision.

## Non-Goals

- Rewriting the stats pipeline's collector architecture. This epic touches one collector's
  failure handling, not `collect-stats.js`'s overall design.
- Speeding up `pnpm audit` itself (e.g. caching its result, running it out-of-band). The fix is
  bounding how long the dev server waits on it, not making the underlying command faster.
- Adding the `security` collector to the `envGuards` skip-list, unless the activation audit
  shows that's the right mechanism rather than a timeout — decide at activation, not now.

## Related

- **GitHub:** [#102](https://github.com/bex-sugartown/sugartown/issues/102)
- **Found during:** `/morning` housekeeping, 2026-08-21 (dev-server restart after all four local
  services were found down)
