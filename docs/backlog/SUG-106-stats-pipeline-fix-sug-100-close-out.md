---
**Epic:** SUG-106 — Stats pipeline fix + SUG-100 close-out
**Linear Issue:** [SUG-106](https://linear.app/sugartown/issue/SUG-106/stats-pipeline-fix-sug-100-close-out)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-106 — Stats pipeline fix + SUG-100 close-out

Fix the daily stats CI pipeline so Lighthouse and Sanity collectors produce live data, address low mobile Lighthouse scores, and formally close SUG-100 once the CWV widget is backed by real pipeline output.

## Background

SUG-100 shipped the CWV Snapshot widget (`CwvSnapshot.jsx`) with `PERF_BACKUP` and `CRUX_BACKUP` constants as stand-ins for live data. The stats pipeline (`stats.yml`) runs daily but two collectors are still stale: `perf` (LHCI writes no JSON to `.lighthouseci` in GitHub Actions) and `sanity` (`VITE_SANITY_*` secrets are not set in the Actions environment). The `crux` collector was unblocked today (May 8) when the API key's "Websites" restriction was removed — but CrUX will return `no-data` until sugartown.io accumulates ~1,000 Chrome user visits over 28 days.

The backup data recorded during SUG-100 development shows concerning mobile scores (performance 68, best practices 42) that warrant investigation before SUG-100 is marked Done in Linear.

## Objective

After this epic: the daily CI run produces a committed `stats.json` with live Lighthouse data for all audited URLs (both mobile and desktop), live Sanity content counts, and CrUX data once traffic thresholds are met. The `PERF_BACKUP` in `CwvSnapshot.jsx` reflects the most recent verified run. Low mobile scores are diagnosed and either fixed or documented with a remediation plan. SUG-100 is transitioned to Done in Linear.

## Scope

- [ ] **Diagnose LHCI failure** — check why `lhci autorun` produces no JSON in CI. Likely candidates: Chrome not found, `startServerCommand: ''` not accepted for external URLs in this LHCI version, or output dir not matching. Read CI logs from the `ff710fd` stats commit run — layer: tooling / CI
- [ ] **Fix LHCI config** — update `lighthouserc.cjs` and/or `stats.yml` so JSON results land in `.lighthouseci` and `perf.js` can read them — layer: tooling / CI
- [ ] **Add Sanity secrets to GitHub Actions** — add `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION`, `VITE_SANITY_TOKEN` to repository secrets so the sanity collector stops returning `stale: true` — layer: CI / infrastructure (manual step — document in epic, cannot be committed)
- [ ] **Investigate mobile scores** — run Lighthouse locally against `https://sugartown.io` in mobile preset and read the report. Performance 68 and best practices 42 from backup data need a root cause. Likely culprits: render-blocking resources, best-practices flags (mixed content, console errors, deprecated APIs) — layer: frontend / tooling
- [ ] **Fix or document mobile score issues** — for each flagged item, either fix it (code change) or document it as a known limitation with a remediation note in `docs/shipped/SUG-100` — layer: frontend
- [ ] **Update `PERF_BACKUP` and `CRUX_BACKUP`** — once a clean Lighthouse run completes, update the constants in `CwvSnapshot.jsx` with the verified values and the run date — layer: frontend
- [ ] **Document manual backup update workflow** — add a short note to `docs/conventions/stats-pipeline.md` explaining how to manually update `PERF_BACKUP`: run `lhci autorun` locally, read `.lighthouseci/*.json`, update constants, commit — layer: docs
- [ ] **Confirm pipeline green** — trigger `stats.yml` via workflow_dispatch after fixes land, verify committed `stats.json` has live `perf` and `sanity` data — layer: CI
- [ ] **Close SUG-100** — move `docs/backlog/SUG-100-cwv-snapshot-product-widget.md` to `docs/shipped/`, update Linear SUG-100 → Done — layer: docs / process

## Phases

**Phase 1 — Pipeline fix**
Fix LHCI, add Sanity secrets (documented), verify CI produces live perf + sanity data. Commit + mini-release.

**Phase 2 — Mobile score remediation + SUG-100 close-out**
Diagnose mobile scores, fix what's fixable, update backup constants, close SUG-100.

## Acceptance criteria

- [ ] `pnpm --filter web collect:stats` locally produces a `stats.json` with `perf.stale: false` and at least one URL result in `perf.runs`
- [ ] A `chore(stats): update trust signals` CI commit contains `perf` data with real Lighthouse scores (not `stale: true`)
- [ ] A `chore(stats): update trust signals` CI commit contains `sanity.counts` with real document counts (not `stale: true`)
- [ ] Mobile Lighthouse performance score diagnosed — root cause documented or fix committed
- [ ] Mobile best practices score ≥ 80, or each failing audit documented with remediation note
- [ ] `PERF_BACKUP` in `CwvSnapshot.jsx` updated to reflect a verified run with a date comment
- [ ] `docs/conventions/stats-pipeline.md` includes manual backup update instructions
- [ ] `docs/backlog/SUG-100-*.md` moved to `docs/shipped/`
- [ ] Linear SUG-100 → Done

## Technical notes

- **Activation audit:** Read the most recent failed CI run logs at github.com/bex-sugartown/sugartown/actions to get the exact LHCI error output before touching `lighthouserc.cjs`.
- **LHCI version check:** Run `lhci --version` in CI context — `startServerCommand: ''` behavior may differ between versions. The `collect` config may need `url` passed directly without a server command block for external URLs.
- **Sanity secrets:** These must be added manually via GitHub → Settings → Secrets and variables → Actions. The values are in `apps/web/.env.local` (not committed). This is a human action, not a code change — document the required secret names and leave a note in the epic.
- **Best practices 42:** This is a very low score. Common causes at this level: mixed content warnings, console errors being thrown on page load, use of deprecated APIs (e.g. `document.write`), or unload event listeners. Check the Lighthouse report's "Best Practices" section directly.
- **CrUX timeline:** Will remain `no-data` until ~1,000 Chrome visits over 28 days. No action needed — the collector is working correctly. `CRUX_BACKUP` stays as estimated field data until real data flows.
- **Model recommendation:** Single-developer tooling fix — `/model sonnet` is sufficient.

## Non-Goals

- CrUX data — pipeline is correct, waiting on traffic. Out of scope.
- Lighthouse score improvements beyond diagnosing and fixing best-practices / performance regressions — deep performance optimization is a separate epic.
- Changing the CWV widget UI — SUG-100 shipped; this epic only updates the data backing it.

## Related

- **Linear:** [SUG-106](https://linear.app/sugartown/issue/SUG-106/stats-pipeline-fix-sug-100-close-out)
- **Depends on:** SUG-100 (shipped — CWV widget exists, pipeline backing it is incomplete)
- **Epic template:** `docs/epic-template.md`
- **Stats pipeline conventions:** `docs/conventions/stats-pipeline.md`
- **CwvSnapshot backup constants:** `apps/web/src/components/CwvSnapshot.jsx` lines 23–48
