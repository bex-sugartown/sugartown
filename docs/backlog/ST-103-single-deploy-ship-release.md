---
**Epic:** ST-103 — Single-deploy `/ship --release`
**Issue:** [#103](https://github.com/bex-sugartown/sugartown/issues/103)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
---

# ST-103 — Single-deploy `/ship --release`

`/ship --release` triggers two Netlify deploys where the expectation is one for `/ship` and
one for `/ship --release` (not two). Investigate whether that's collapsible, and implement
whichever resolution the investigation supports.

## Background

Observed live 2026-08-21, `/ship --release` run covering ST-95/ST-101/ST-16/ST-102/SUG-265:

1. Phase 3 step 3 pushed 14 accumulated commits (the epics' own work) → deploy 1
2. Phase 3 step 5 verified CI on that push (`success`)
3. Phase 3 step 6 transitioned 5 `Done` issues to `Shipped` (metadata only, no commit)
4. Phase 3 step 7 invoked `/release` (`docs/workflows/release-assistant-prompt.md`), which
   generated a NEW commit (version bump, `CHANGELOG.md`, `RELEASE_NOTES.md`) — this commit did
   not exist before step 7 ran, so it could not have been part of the step-3 push
5. That release commit needed its own confirmation and its own `git push` to go live → deploy 2

**Why this isn't a simple reordering fix.** `/release`'s Step 7 gate is deliberate: it only
runs "if step 5's CI run concluded `success`" — the design intent is that a release is never
cut against code CI hasn't verified (`docs/ship-prompt.md` Phase 3 step 7). Moving release-
artifact generation earlier, so its commit rides in the same push as the accumulated work,
means the version bump would be committed and pushed *before* CI confirms the code — the
inverse of the current guarantee. This is a real tradeoff between deploy cost and the
verify-before-release invariant, not a mechanical bug.

**Measured 2026-08-21, from the Netlify Deploys UI directly** (`sugartown.io` → Deploys),
same day this epic was filed: `main@d31b136` (the accumulated-work push, "Today at 5:40 AM",
built in 1m22s) and `main@9649f05` (the release-commit push, "Today at 5:55 AM", built in
1m24s) are **both fully completed, billed production deploys** — 15 minutes apart, neither
canceled nor superseded before finishing. Contrast with `main@1773f68` further down the same
list, tagged `Canceled` — Netlify *can* cancel a deploy, it just didn't here. **Netlify does
not dedupe or cancel these two rapid successive pushes.** The double-deploy cost is real, not
a measurement artifact — confirms `docs/shipped/ST-100-close-out-eod-boundary.md` S9b's
per-push cost (15 credits) applies to both.

**Leading resolution, proposed by Bex the same day, stronger than the reordering options
below: stop making `/release` push at all.** `/ship` keeps deploying — that's its whole job,
unchanged. `/release` commits its version bump/`CHANGELOG.md`/`RELEASE_NOTES.md` locally and
stops, exactly like any other epic close-out commit — no "push it now?" gate. The verify-
before-release guarantee is **not weakened**: `/release` still only runs after Phase 3 step 5
confirms CI succeeded on the accumulated-work push that already happened; deferring the
release commit's own push doesn't touch that ordering. The release commit simply rides along
whenever the *next* `/ship` naturally runs — one deploy, same as any other accumulated work.
This avoids the release-before-CI-verification tradeoff entirely rather than accepting it,
which the two reordering options further down do not.

## Objective

Implement the leading resolution above (`/release` stops pushing; its commit waits for the
next natural `/ship`), or record why a different model was chosen instead if the leading
resolution turns out to have a problem not yet found. Either way, `/ship --release`'s realized
deploy count per invocation drops from 2 to 1 (verified by running it for real, not by code
inspection), without weakening the verify-before-release guarantee.

## Scope

- [x] **Measure Netlify's actual behavior for two pushes to `main` within a short window** —
      **Done 2026-08-21**, from the Deploys UI directly (see Background). Both pushes billed
      in full; no dedup. — layer: process
- [ ] **Implement the leading resolution**: `docs/workflows/release-assistant-prompt.md`
      Step 3C / Gate 5 stops asking to push — commits and stops. `docs/ship-prompt.md`
      Phase 3 step 7 and Phase 4's closing template update to describe the release commit as
      picked up by a future `/ship`, not pushed by this one. State plainly in both files that
      this is deliberate, not a dropped step — a future session reading either prompt in
      isolation must not read "commit, then stop" as incomplete. Both files are under the
      Instruction & Rule File Write Gate — diffs shown, approved before landing — layer:
      process
- [ ] **Confirm the two other options were considered and correctly rejected**, in the doc:
      (a) bundling the release commit into the same push as the accumulated work
      (release-before-CI-verification — rejected, weakens the guarantee), (b) reordering so
      release gates on a *previous* known-green state instead of this run's — more complex,
      solves nothing the deferred-push model doesn't already solve more simply — layer:
      process
- [ ] **Documentation sweep — every live doc asserting "one Netlify deploy per `/ship`" as a
      fact needs checking against the new model, not just the two prompt files that implement
      it.** Found by grep, not assumed complete — re-grep at execution time in case more have
      landed since 2026-08-21:
      | File | Line | Current claim | Action needed |
      |---|---|---|---|
      | `CLAUDE.md` | ~129 | "Pushing `origin/main`... triggers **a** Netlify deploy (15 credits)" | Verify still true once `/release` stops pushing — it becomes newly-accurate for the `--release` case rather than newly-false, but confirm the wording doesn't need a caveat about the release commit riding a *later* push |
      | `docs/switch-prompt.md` | ~13 | "`/ship` closes a machine... (**one** Netlify deploy)" | Same — should become straightforwardly true; confirm, don't assume |
      | `docs/switch-prompt.md` | ~267 | "push-once-at-`/ship` model (**one** Netlify deploy per ship...)" | Same |
      | `docs/workflows/morning-housekeeping-prompt.md` | ~280 | "Pushing triggers a Netlify deploy" | Generic, doesn't assert a count — likely needs no change, confirm rather than skip |
      All four are outside the Rule-file followability walkthrough's core scope list except
      `docs/ship-prompt.md` itself, but the walkthrough's own §Scope already widens to
      `docs/workflows/**` and named prompts for exactly this reason — treat this sweep as part
      of that same walkthrough, not a separate pass — layer: process
- [ ] **Walk the changed prompts end to end** (rule-file followability walkthrough,
      `CLAUDE.md` §Rule-file followability walkthrough — this scope is explicitly listed:
      `docs/ship-prompt.md` is in scope; the documentation-sweep item above is this walkthrough's
      step 1, "name the workflows the change touches," done in writing ahead of time) before
      committing — layer: process

## Non-Goals

- Changing what triggers a Netlify deploy in general (a push to `main` deploys — unchanged,
  per `docs/shipped/ST-100-close-out-eod-boundary.md`'s own Non-Goals, still true here)
- Removing the verify-before-`Shipped` guarantee for the accumulated-work push (Phase 3 steps
  5–6) — only the *release* step's ordering is in scope
- Branch protection or required status checks on `main` — deliberately absent (SUG-255),
  unchanged by this epic

## Acceptance criteria

- [x] Netlify's rapid-successive-push billing behavior is measured and recorded, with the
      view that produced it (not asserted from memory) — **done, see Background**: Deploys UI,
      both `d31b136` and `9649f05` billed in full
- [ ] `/ship --release`'s next real run produces exactly 1 deploy, verified by checking the
      Deploys UI afterward — not by code inspection — with the release commit visibly still
      unpushed (local-only) immediately after that run completes, then picked up correctly by
      whatever `/ship` runs after it
- [ ] `docs/ship-prompt.md` and `docs/workflows/release-assistant-prompt.md` agree with each
      other on the model (no restating one prompt's mechanic in the other, per the pattern
      SUG-265 was originally filed to prevent)
- [ ] Every file in the documentation-sweep table (Scope) has been individually re-read and
      confirmed accurate against the new model — not skipped because it "probably still holds"

## Model & Mode [REQUIRED]

`/model sonnet` — this is a measurement-first process/workflow change (two prompt files, no
application code), with a clear existing pattern to extend rather than an open architecture
question. No plan-mode handoff needed; the ambiguity is in the Netlify-behavior *measurement*,
not in how to write the fix once that's known.

## Related

- **GitHub:** [#103](https://github.com/bex-sugartown/sugartown/issues/103)
- **Found during:** `/ship --release`, 2026-08-21, covering ST-95/ST-101/ST-16/ST-102/SUG-265
- **Deploy cost baseline:** `docs/shipped/ST-100-close-out-eod-boundary.md` S9b (15 credits per
  production deploy, ~66/month ceiling, 96% of credit spend is deploys)
- **Adjacent, not duplicate:** `docs/shipped/SUG-265-release-prompt-step-parity.md` — an earlier
  "close-out costs two deploys" finding, absorbed into ST-100 (different mechanism: that was
  about needing a CI run for an on-`main` epic; this is about `/release`'s own commit needing
  a second push after the main push already ran)
