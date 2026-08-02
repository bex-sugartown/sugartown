---
**Epic:** SUG-265 — Release flow: `/release` skips `/mini-release` steps, and close-out costs two deploys
**Linear Issue:** [SUG-265](https://linear.app/sugartown/issue/SUG-265/release-flow-release-skips-mini-release-steps-and-close-out-costs-two)
**Status:** Backlog
**Priority:** 🟣 Soon — Part A repeats on every `/release`; Part B on every on-`main` close-out
**Merge strategy:** (a) Merge-as-you-go. Two parts, independently shippable.
---

# SUG-265 — Release flow defects

Found during SUG-243's close-out and release, 2026-07-30. Two independent defects. Scope
widened from prompt-parity alone on 2026-07-30; the title was updated in the same edit rather
than left describing half the issue.

## Part A — `/release` skips steps `/mini-release` runs

`docs/mini-release-prompt.md` carries two steps `docs/workflows/release-assistant-prompt.md`
has no equivalent for:

| Mini-release step | What it does |
|---|---|
| §3B item 2 | Caps the `> Updated` header at the 8 most recent entries, moving older ones to `## Changelog` |
| §0A | Chromatic VRT pre-check when the epic touched CSS or components |

The header cap is not cosmetic. The mini-release prompt says trimming is part of the release,
not separate housekeeping, and records the line reaching **20,391 characters** by 2026-07-22.

v0.32.0 left it at **9 entries / 8,509 characters**, one over the cap. Corrected in `68fcc629`,
but only because a human asked whether `/release` had skipped anything. Chromatic was genuinely
N/A for v0.32.0, so that half is unproven rather than known-broken.

## Part B — close-out that needs CI costs two deploys

Close-out step 1b requires a CI run against the epic's own commits with the run ID recorded. An
epic running directly on `main` can only get one by pushing, and pushing `main` triggers a
Netlify production deploy regardless of CI (CTL-020).

On 2026-07-30 that cost **two production deploys in one day**:

1. `main@02599e2` at 05:27 — pushed solely to obtain CI run `30542636194`. Touched **nothing**
   under `apps/web/src` or `packages/design-system/src`, verified by
   `git diff --name-only 795e6c00..02599e2c`. Netlify redeployed byte-identical rendered output
2. A second at `/eod` carrying the real change: `apps/web/package.json` 0.31.2 → 0.32.0, which
   renders via `__APP_VERSION__` in the footer

**Two rules disagree here and nothing names which wins.** CLAUDE.md §Mid-epic commit checkpoints
sets the threshold at "~15 unpushed commits, or at any session end" — there were 12, mid-session,
so it said wait. Close-out step 1b said it needed CI to close.

**A commit can suppress its own CI run (found 2026-08-02).** GitHub scans the whole commit
message for the skip marker, not just the subject line. A SUG-256 commit whose body quoted
*"`[skip ci]` is routine"* — describing the CTL-020 bypass — skipped CI entirely. CodeQL ran on
that SHA; the CI workflow produced no run.

Consequence for this epic: close-out step 1b requires a CI run for the epic's own commits, and a
commit message discussing a bypass can silently prevent one. Nothing warns at push time. Writing
the marker as `skip-ci` avoids it, but that is a convention nobody currently knows.

### Verified vs unknown

- **Verified** from `.github/workflows/ci.yml`: CI triggers on `push: branches: [main]` **and**
  `pull_request: branches: [main]`. A `wip/<epic>` branch push alone runs no CI; a PR against
  `main` does, which would give close-out a real run ID without touching `main`
- **Unknown:** whether Netlify builds branches or deploy previews. `netlify.toml` is entirely
  commented out and the build config lives in the Netlify UI, so the repo cannot answer it. A
  deploy preview is not a production deploy but still consumes build minutes

## Scope

- [ ] Decide Part A's model: does `/release` inherit the shared steps, or does each prompt carry
      its own copy?
- [ ] If shared, extract the common steps to one file both reference. If duplicated, add both to
      `release-assistant-prompt.md` Step 4 and register the two prompts as a must-match pair
- [ ] **Diff the two prompts' full step lists.** Part A names two gaps found by reading; a
      complete comparison has not been done
- [ ] Check the Netlify UI for branch-deploy and deploy-preview settings and record them in-repo,
      so the next session need not open a dashboard
- [ ] Establish the close-out-with-CI recipe: likely `wip/<epic>` → PR to `main` → CI on the PR →
      record the run ID → merge once. **Confirm a PR run satisfies step 1b's "CI run for the
      merged commit"** — a PR run tests the merge candidate, not the merge commit
- [ ] **Reconcile the two rules that disagree**, stating which governs, in both places

## Non-Goals

- Rewriting either prompt's gate structure. The 7-gate flow works.
- Adding branch protection to `main`. It has none and zero rulesets by deliberate choice
  (SUG-255): notification was preferred over required status checks so merge-as-you-go is not
  blocked.

## Files to Modify

- `docs/workflows/release-assistant-prompt.md`, `docs/mini-release-prompt.md`, and likely
  `CLAUDE.md` §Mid-epic commit checkpoints and §Epic close-out sequence — all gated under the
  Instruction & Rule File Write Gate, so diffs are shown before any edit

## Acceptance Criteria

- [ ] A named mechanism keeps the two prompts in step, or a recorded decision says they diverge
      deliberately and why
- [ ] The full step-list diff is in this doc, not just the two gaps already known
- [ ] An epic running on `main` can close out with a real CI run ID and one production deploy,
      or it is recorded why that is not possible
- [ ] Netlify's branch and preview settings are written down in-repo

## Risks

- **Extraction changes behaviour.** Both prompts are followed literally by an agent; moving a step
  into a referenced file risks it being skipped rather than read. Prefer duplication plus a parity
  check over indirection if that risk looks real.
- **A PR-based close-out may not satisfy step 1b as written.** If the rule means the merge commit
  specifically, the recipe does not work and the rule needs amending, not the workflow.
