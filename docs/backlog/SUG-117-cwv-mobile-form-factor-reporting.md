---
**Epic:** SUG-117 — CWV mobile form-factor reporting
**Linear Issue:** [SUG-117](https://linear.app/sugartown/issue/SUG-117/cwv-mobile-form-factor-reporting)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-117 — CWV mobile form-factor reporting

Fix LHCI mobile throttling so mobile/desktop Lighthouse scores diverge correctly, then re-enable the form-factor toggle in CwvSnapshot.

## Background

The stats pipeline runs two LHCI passes — one intended as mobile, one desktop — but both currently produce identical scores. The root cause: `--settings.emulatedFormFactor=mobile` is deprecated in Lighthouse 10+. Newer Lighthouse uses `formFactor` + `screenEmulation` flags. As a result, CI collects two runs with the same desktop-level throttling profile, and `perf.js`'s `extractFormFactor()` reads `configSettings.emulatedFormFactor` (which is now absent) and falls through to flat/desktop.

The `CwvSnapshot` mobile/desktop toggle was hidden in SUG-113 close-out (2026-05-15) pending this fix. The toggle UI exists and works — it just shows identical data on both sides until the pipeline diverges correctly.

## Objective

After this epic, the daily stats workflow runs two genuinely distinct LHCI passes (mobile with 4G throttling + viewport emulation, desktop with no throttling), `perf.js` correctly slots each run into `mobile` or `desktop` keys, and `CwvSnapshot` re-enables the form-factor toggle to show meaningfully different scores. No schema or Sanity changes required — this is a pure pipeline + frontend toggle fix.

## Scope

- [ ] Update `stats.yml`: replace deprecated `--settings.emulatedFormFactor=mobile` with correct Lighthouse 10+ flags (`--settings.formFactor=mobile --settings.screenEmulation.mobile=true --settings.throttlingMethod=simulate --settings.throttling.rttMs=150 --settings.throttling.throughputKbps=1638.4`) — tooling layer
- [ ] Update `apps/web/scripts/stats/perf.js` `extractFormFactor()`: add detection of `configSettings.formFactor` (already present as fallback) and verify it correctly reads Lighthouse 10+ output — tooling layer
- [ ] Verify CI produces diverging mobile/desktop scores (manual trigger + inspect `stats.json`) — tooling layer
- [ ] Re-enable the form-factor toggle in `CwvSnapshot.jsx` by removing the `{false && ...}` wrapper — frontend layer
- [ ] Update `PERF_BACKUP` mobile values if the real CI mobile scores differ significantly from the current backup — frontend layer

## Acceptance criteria

- [ ] `stats.json` after a CI run contains `perf.runs["https://sugartown.io/"].mobile.performance` that is measurably lower than `.desktop.performance` (at minimum 10 points difference expected given mobile throttling)
- [ ] `CwvSnapshot` form-factor toggle is visible and toggleing between Mobile/Desktop shows different score ring values
- [ ] `perf.js` `extractFormFactor()` correctly tags both runs — confirmed by inspecting the `.lighthouseci/` JSON `configSettings` keys

## Technical notes

- **Activation audit:** Before writing any code, run `lhci collect` locally with `--settings.formFactor=mobile` and inspect the resulting JSON at `.lighthouseci/*.json` to confirm `configSettings.formFactor === 'mobile'` is present. This verifies `extractFormFactor()` will pick it up without changes.
- **Lighthouse 10+ mobile flags reference:** `formFactor: 'mobile'`, `screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 3 }`, `throttling: { rttMs: 150, throughputKbps: 1638.4 }`. The `emulatedFormFactor` key is absent entirely in Lighthouse 10+ output.
- **`extractFormFactor()` already handles `configSettings.formFactor`** — line 54 of `perf.js`. Verify this is sufficient; no code change may be needed in `perf.js` itself.
- **Toggle re-enable:** `CwvSnapshot.jsx` line wrapping the toggleRow in `{false && (...)}` — remove the wrapper. The `{false && ...}` comment references `SUG-TODO` which should be updated to `SUG-117`.
- **Model recommendation:** `/model sonnet` — no schema changes, targeted pipeline + JSX edits.

## Non-Goals

- CrUX per-form-factor split (already noted as a future extension in `CwvSnapshot.jsx` comments — out of scope here)
- Any changes to CWV tile data (those come from CrUX, not LHCI)
- Chromatic story changes (toggle is already in the existing CwvSnapshot story; re-enabling it produces no new story)

## Related

- **Linear:** [SUG-117](https://linear.app/sugartown/issue/SUG-117/cwv-mobile-form-factor-reporting)
- **Parent epic:** SUG-113 (dynamic reporting pipeline) — toggle was hidden at SUG-113 close-out
- **Epic template:** `docs/epic-template.md`
