# Post-Mortem — Chromatic Footer Version Diff (Minimal + Surgical)

**Date:** 2026-07-19
**Trigger:** Chromatic build 75 (v0.29.0 full release) flagged 6 visual changes; inspection showed the only real diff was the Footer colophon's version chip (`v0.28.0` → `v0.29.0`) — a false positive that recurs on every release.

---

## 1. What was expected

CLAUDE.md's "Storybook — build-time globals must be frozen" rule exists precisely to stop build-time values from causing false-positive Chromatic diffs. It should have covered every `__VARIABLE__` injected via Vite `define`, not just the one it was originally written to fix.

## 2. What we got

`__BUILD_DATE__` was frozen in Storybook's `viteFinal`; `__APP_VERSION__` was not. The Footer's version chip diffs on every single release (mini or full) with zero actual visual/behavioral change to the component.

## 3. Gaps / misalignment

- The original fix (`000526a1`, 2026-05-12) solved the *reported symptom* (date diffing) rather than the *class of problem* (any build-time global diffing) — it never asked "are there other `__VARIABLE__` entries with this same shape?"
- `__APP_VERSION__` and `__BUILD_DATE__` were introduced together in the same commit (`a364db59`, 2026-04-16, SUG-65) — the later partial fix didn't circle back to the sibling variable from its own origin commit.
- CLAUDE.md's rule, written after the partial fix, states the general principle correctly but its only worked example was `__BUILD_DATE__` — a future reader (human or AI) matches the example and doesn't independently audit the other `define:` entries in the same block.
- `apps/storybook/vite.config.ts` has its own separate `define` block (distinct from `main.ts`'s `viteFinal`) that reintroduces `__APP_VERSION__` as live — a second surface the "check when a new define: entry is added" language didn't flag as needing an audit.

## 4. Root cause categorization

- **Tooling/config drift** — a fix landed for one instance of a bug class without generalizing to sibling instances that existed at the same time.
- **Process gap** — the "when a new define: entry is added, check if it needs freezing" instruction is reactive (fires on *new* additions) with no equivalent "audit existing defines against this rule" sweep, so a pre-existing sibling variable never got checked retroactively.

## 5. System improvements

| Fix | Where it lives | Priority | Status |
|---|---|---|---|
| Freeze `__APP_VERSION__` to `'0.0.0-storybook'` in Storybook's `viteFinal`, alongside `__BUILD_DATE__` | `apps/storybook/.storybook/main.ts` | Must-have | ✅ Applied same day |
| Rewrite the CLAUDE.md rule to list every current `__VARIABLE__` instance by name as a checklist, not a single worked example | CLAUDE.md §Storybook build-time globals | Must-have | ✅ Applied same day |
| Add a self-check to `/mini-release` and `/eod`'s Chromatic pre-flight: if the only visual diff is a version-string/colophon change, treat it as a build-time-global freeze gap, not an approved visual change | `docs/mini-release-prompt.md`, `docs/workflows/eod-prompt.md` | Nice-to-have | Deferred |

## Verification

Re-ran Chromatic directly (bypassing the `HEAD~1`-limited skip-gate wrapper, same as the original EOD run) after applying the `__APP_VERSION__` freeze. Build 76 still showed 6 visual changes — expected, since the prior baseline (build 71) predates the fix and still has the real dynamic version baked in; build 76 was the first to show the new frozen sentinel (`0.0.0-storybook`), which necessarily differs from the old baseline's real value once. Bex confirmed the diff was the sentinel transition (not a real regression) and accepted build 76 as the new baseline. From this point forward, every build will consistently show the same frozen sentinel and the Footer story will stop diffing on version bumps.
