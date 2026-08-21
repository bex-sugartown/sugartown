---
**Epic:** ST-102 — Stats pipeline security collector blocks web dev server startup
**Issue:** [#102](https://github.com/bex-sugartown/sugartown/issues/102)
**Status:** Done — 2026-08-21
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

- [x] Give `collectSecurity()`'s `execSync` call a timeout, and treat a timeout the same as any
      other collector failure (`{ stale: true, error: ... }`, falling back to last-good per the
      existing `collect-stats.js` contract) — layer: tooling

      **Done 2026-08-21 — not with a plain `execSync` timeout.** Tried that first, per the
      Scope's own original framing. Verified live that it doesn't work: `execSync(..., {
      timeout })` only sends its kill signal to the immediate child, and the installed `pnpm`
      binary re-execs itself as a nested `node .../pnpm/9.1.0/bin/pnpm` process — killing the
      shim leaves the real worker running, still holding the stdout pipe open, so the call never
      actually returns. Measured directly: a 3s timeout, checked again 8s later, both the outer
      `execSync` call and the audit worker were still alive. Rewrote using `spawn` with
      `detached: true` (own process group) and `process.kill(-pid, ...)` on timeout to reach the
      whole tree. SIGTERM alone also didn't work (worker outlived it by 20+s in testing) — uses
      SIGKILL, which is correct here since this is abandon-and-cleanup, not graceful shutdown.

- [x] Confirm whether `execSync`'s blocking nature is itself the problem (event-loop stall even
      within a timeout window) or only the missing bound — if the former, convert to
      non-blocking `exec`/`execFile` with a `Promise` wrapper instead — layer: tooling

      **Done 2026-08-21.** Neither, exactly — the real problem was process-tree scope (above),
      not event-loop blocking. Converted to async `spawn` anyway as part of the process-group
      fix (needed the child object mid-flight to send the group kill, which `execSync` doesn't
      expose). The *outer* call in `vite.config.js`'s `generate()` (`spawnSync('node',
      ['scripts/collect-stats.js'], ...)`) is still synchronous and still blocks `buildStart()`
      — untouched, out of scope (Non-Goals), and now bounded transitively since the inner chain
      resolves quickly.

- [x] Re-measure `apps/web` dev-server cold-boot time before/after and record both numbers in
      the shipped doc — layer: tooling

      **Done 2026-08-21**, both via `preview_start` → check logged Vite "ready" time, same
      method as the original measurement:

      | | Time | Note |
      |---|---|---|
      | Before | 95440ms | original bug measurement |
      | After (15s local bound, first pass) | 17452ms | included a one-time "Re-optimizing dependencies" event |
      | **After (5s local bound, final)** | **7368ms** | clean run |

      **The local timeout was shortened from 15s to 5s mid-implementation**, not part of the
      original plan. Reason: measured `pnpm audit --json`'s real completion time on this repo at
      **~97 seconds** (see next Scope item) — local dev can never realistically complete within
      any interactively-tolerable bound, so a shorter bound has zero downside and pure upside.

- [x] **Not in the original Scope — required by AC #3 below.** Confirm CI's `stats.yml`
      (`pnpm --filter web collect:stats`, daily) still gets real security data, not permanently
      stale data.

      **Measured 2026-08-21: `pnpm audit --json` takes ~97 seconds to complete naturally** on
      this monorepo (2062427 bytes of output, 1918 dependencies). A single timeout short enough
      to keep local dev boot fast (5–15s) would make CI's daily collection **permanently
      stale** — it could never once complete inside that bound. Split into
      `AUDIT_TIMEOUT_MS_LOCAL` (5s) and `AUDIT_TIMEOUT_MS_CI` (180s, ~2x headroom over the
      measured 97s), selected via `process.env.CI` — GitHub Actions' own standard convention,
      set automatically, no workflow file change needed. Verified end-to-end with `CI=true`
      set: `collectSecurity()` completed naturally at 93882ms (within the 180s bound), returned
      real parsed data, left no orphaned processes.

- [x] **Not in the original Scope — found while building the CI-path test above.** Fixed a
      pre-existing, unrelated parsing bug in `collectSecurity()`'s NDJSON-per-line parser.

      **The bug:** pnpm 9.1.0's `--json` output is **one pretty-printed multi-line JSON
      object**, not NDJSON (one object per line) as the code assumed and commented. The old
      per-line `JSON.parse(trimmed)` threw on the first non-trivial line every single time, and
      the surrounding `try { ... } catch { /* empty */ }` wrapped the *entire loop*, so the
      throw silently exited with `counts` still at its all-zero initial state. **Confirmed by
      testing all three real, currently-shipped code paths against the real captured output:
      0/50 lines parsed as standalone JSON.**

      **Real impact, measured against the same real audit run:** this repo currently has **211
      real vulnerabilities** (1 critical, 89 high, 103 moderate, 18 low) that `security` stats
      have been silently reporting as **zero**, for as long as this collector has run against
      this pnpm version — an inert-mechanism bug, the same shape as the post-mortem's incident
      log, just never a probed gate. Fixed: try `JSON.parse(raw)` as one whole object first
      (the confirmed-real v9+ shape, reads `.metadata.vulnerabilities` directly), fall back to
      the original per-line NDJSON scan only if that fails (kept for a v8-shaped output, never
      verified live, in case an older pnpm ever produces it again). Verified against the real
      captured 2MB output: correctly parses to `{total: 211, critical: 1, high: 89, moderate:
      103, low: 18, info: 0}`.

      **This finding is out of ST-102's stated Objective** ("No change to `stats.json`'s
      `security` shape") in letter — the *shape* is unchanged, only what fills it — but is
      directly load-bearing for the CI-path fix above: enabling CI to actually reach real data
      again (via the 180s bound) would have silently kept shipping zeros without this. Recorded
      here rather than deferred to a new issue because it was found, understood, and fixed
      within the same investigation, not a separate rabbit hole.

## Acceptance criteria

- [x] `pnpm --filter web dev` reaches Vite's "ready" line without waiting on `pnpm audit` to
      fully complete when `pnpm audit` is deliberately slowed (e.g. throttled network) or made to
      hang — verified locally, not just by code inspection

      **Verified 2026-08-21** — real `preview_start` dev-server boot: 95440ms → 7368ms.
- [x] A failed or timed-out `collectSecurity()` call produces the same `{ stale: true, error }`
      shape the other network collectors already produce, and `stats.json`'s `security` key
      falls back to `last-good` exactly as `crux`/`github`/`sanity` do today
      (`collect-stats.js` lines 108–120 — read current line numbers at activation, this is
      pre-existing logic, not new)

      **Verified 2026-08-21** — live dev boot log shows `[stats] security: stale — falling
      back to last-good`, same line shape as `perf`.
- [x] CI's own `pnpm audit` usage (if `collect-stats.js` also runs in CI/build) is unaffected —
      confirm whether CI needs the full unbounded audit result and, if so, that this change
      doesn't silently degrade CI's `security` stats to stale on every run

      **Verified 2026-08-21** — yes, CI needs it (daily `stats.yml`), and yes it would have
      silently degraded without the CI/local split above. `CI=true` end-to-end test: completes
      naturally at 93882ms, real 211-vulnerability data returned, no process leak.

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
