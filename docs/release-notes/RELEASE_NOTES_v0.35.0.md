# Release Notes — v0.35.0

**Date:** 2026-08-21
**Scope:** Sugartown monorepo (apps/web, apps/contentful-poc, process/tooling)

---

## What this release is

A maintenance and process release: a dev-server performance fix that also surfaced a
long-standing hidden data-accuracy bug, a documented security decision, a CI flake fix, and
the epic close-out workflow consolidated into `/ship --release`.

---

## What changed

### Dev-server startup, and a hidden security-stats bug

The web app's dev server was taking 95+ seconds to boot because a background stats collector
ran a slow, unbounded audit command with no working timeout. That's now bounded — dev-server
cold boot is down to about 7 seconds — with a longer allowance kept for CI's own daily
collection so it doesn't lose access to real data.

While tracking that down, a second, unrelated bug turned up: the same collector's output
parser expected a data format the installed tooling doesn't actually produce, so it has been
silently reporting zero security vulnerabilities regardless of the real count. That's fixed
too — the real count (211, across severity levels) is now captured correctly.

### htmlSection: a security posture decided, not just fixed

A previously undocumented behavior — one content section type executes embedded scripts
without sanitization — has been reviewed and formally accepted as a risk, rather than left
ambiguous. Every published use was audited first: only one actual script tag exists across
the whole site (a trusted video-player embed), everything else is an iframe or static markup
that never needed this behavior at all. The accepted conditions are now written down, so a
future change to that pattern (user-submitted HTML, an unfamiliar embed source) is a clear
signal to revisit the decision.

### CI stability

A flaky CI failure on the Contentful proof-of-concept app, caused by a duplicate dependency
resolution, is fixed with a scoped pin — the workspace's other packages are unaffected.

### Process: how epics ship

The epic close-out workflow is now fully consolidated into a single `/ship --release` command,
replacing two commands that had drifted apart. Work now moves through a clearer `Done` →
`Shipped` distinction, and the morning status check now shows how long completed work has
been waiting to ship.

---

## Not in this release

- **A liveness-probe harness for CI gates** (proving gates actually fire, not just that
  they're configured) is built and wired into CI, but the epic itself isn't closed yet — it's
  waiting on a future check-in date before it can be marked complete.
- **A tool to catch dangling references after a renamed doc heading** is built and already
  caught one real, previously-unnoticed stale reference — but two of its five planned steps
  are still open, waiting for the right kind of future edit to test against.

---

## Validator state at release

- `pnpm lint` — clean across all 9 packages (pre-existing warnings only, no errors)
- `pnpm test:smoke` — 5/5 route smoke tests passing
- Chromatic VRT — no visual changes detected
- CI run (this release's push) — concluded `success`
