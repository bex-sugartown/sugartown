# SUG-117 — CWV Mobile Form-Factor Reporting

**Linear Issue:** SUG-117
**Status:** Done
**Shipped:** 2026-05-17 v0.23.35
**Commit:** `feat(sug-117): fix LHCI mobile throttling + re-enable form-factor toggle in CwvSnapshot`

---

## What shipped

### 1. LHCI mobile throttling fix (`stats.yml`)

Replaced the deprecated Lighthouse 9 flag:
```
--settings.emulatedFormFactor=mobile
```
With the correct Lighthouse 10+ flags:
```
--settings.formFactor=mobile
--settings.screenEmulation.mobile=true
--settings.throttlingMethod=simulate
--settings.throttling.rttMs=150
--settings.throttling.throughputKbps=1638.4
```

The desktop pass (`--settings.preset=desktop`) was already correct — unchanged.

### 2. `perf.js` — no changes needed

`extractFormFactor()` already handles `configSettings.formFactor` (line 54) and `configSettings.screenEmulation.disabled` (line 55). The deprecated `emulatedFormFactor` path remains as a fallback for older cached runs. No code changes required.

### 3. Uncalibrated data detection (`CwvSnapshot.jsx`)

Added `isUncalibrated` check: if `mobile.performance === desktop.performance && mobile.lcp === desktop.lcp` for the resolved CI run, the mobile pass was desktop-throttled. Falls back to `PERF_BACKUP` (manual run 2026-05-15, perf mobile:61 / desktop:81) automatically. Self-corrects once CI produces diverging data after the `stats.yml` fix.

### 4. Form-factor toggle re-enabled (`CwvSnapshot.jsx`)

Replaced `{null}` placeholder with the `SegmentedControl` toggle (Mobile / Desktop). Updated stale file comment. Renamed `_setFormFactor` → `setFormFactor` (was prefixed to suppress unused-var lint warning while hidden).

---

## Acceptance criteria

- [x] `stats.yml` uses Lighthouse 10+ mobile flags
- [x] `CwvSnapshot` form-factor toggle is visible — Mobile/Desktop buttons confirmed in DOM
- [x] CwvSnapshot added to `/platform/governance` as §04 Site Performance; sidebar nav updated
- [x] Uncalibrated CI data detected — PERF_BACKUP (mobile:61 / desktop:81) used until next CI run
- [x] `perf.js` `extractFormFactor()` correctly tags both runs — existing `formFactor` branch handles it
- [ ] `stats.json` after a CI run contains diverging `mobile.performance` vs `desktop.performance` — **pending next daily CI run** (06:00 UTC). Cannot verify locally without running LHCI against the live URL.

<!-- Data pipeline gap: diverging mobile/desktop scores will only appear in stats.json after the next daily CI run (stats.yml cron: 06:00 UTC). The PERF_BACKUP already has distinct mobile/desktop values (mobile perf: 61, desktop: 81) so the toggle shows meaningful differentiation until real CI data arrives. -->

---

## Related

- **Parent:** SUG-113 (toggle was hidden at close-out, ref: SUG-113 commit)
- **Pipeline:** `apps/web/scripts/stats/perf.js` — `extractFormFactor()`
- **CI:** `.github/workflows/stats.yml`
