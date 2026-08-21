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

**One variable is unmeasured.** Netlify's default behavior for two pushes to the same branch
in quick succession — whether it cancels/supersedes the first build and only bills the second,
or bills both — is not verified anywhere in this repo. `docs/shipped/ST-100-close-out-eod-
boundary.md` S9b measured deploy cost per push (15 credits, from `listSiteDeploys` and the
billing UI) but never tested two rapid successive pushes specifically. Whether this epic is
solving a real double cost or a perceived one depends on this number.

## Objective

Either: `/ship --release` produces one deploy total (design and implement the change that
gets there, stating what invariant — if any — is traded off to do it), or: a recorded decision
that two deploys is the correct cost of the verify-before-release guarantee, with the actual
Netlify billing behavior for rapid successive pushes measured and written down either way.

## Scope

- [ ] **Measure Netlify's actual behavior for two pushes to `main` within a short window**
      (e.g. seconds to low minutes apart, matching the observed 2026-08-21 pattern) — does it
      cancel/supersede the first build, or run and bill both? Use `listSiteDeploys` / the
      billing UI's own deploy list, the same sources ST-100 S9b used, not an assumption —
      layer: process
- [ ] **Decide the model**, informed by the measurement above:
      - If Netlify already dedupes rapid successive pushes: the "two deploys" problem may
        already be smaller (or nonexistent) than it looks — document this and decide whether
        any code change is still warranted
      - If Netlify bills both: decide between (a) bundling the release commit into the same
        push as the accumulated work, accepting release-before-CI-verification, or (b) some
        other restructuring (e.g. a single combined push with the release step happening
        first, gated on a *previous* known-green state instead of this run's own CI), or (c)
        recording that two deploys is the accepted cost of the current guarantee — layer:
        process
      — layer: process
- [ ] **Implement the decided model** in `docs/ship-prompt.md` and
      `docs/workflows/release-assistant-prompt.md` (both under the Instruction & Rule File
      Write Gate — diffs shown, approved before landing) — layer: process
- [ ] **Walk the changed prompts end to end** (rule-file followability walkthrough,
      `CLAUDE.md` §Rule-file followability walkthrough — this scope is explicitly listed:
      `docs/ship-prompt.md` is in scope) before committing — layer: process

## Non-Goals

- Changing what triggers a Netlify deploy in general (a push to `main` deploys — unchanged,
  per `docs/shipped/ST-100-close-out-eod-boundary.md`'s own Non-Goals, still true here)
- Removing the verify-before-`Shipped` guarantee for the accumulated-work push (Phase 3 steps
  5–6) — only the *release* step's ordering is in scope
- Branch protection or required status checks on `main` — deliberately absent (SUG-255),
  unchanged by this epic

## Acceptance criteria

- [ ] Netlify's rapid-successive-push billing behavior is measured and recorded, with the
      command or UI view that produced the number (not asserted from memory)
- [ ] `/ship --release` either produces one deploy, verified by running it for real and
      counting billed deploys afterward — not by code inspection — or a written decision
      explains why two remains correct, with the tradeoff stated explicitly
- [ ] `docs/ship-prompt.md` and `docs/workflows/release-assistant-prompt.md` agree with each
      other on the model (no restating one prompt's mechanic in the other, per the pattern
      SUG-265 was originally filed to prevent)

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
