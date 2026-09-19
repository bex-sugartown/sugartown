# Release Notes — v0.36.0

**Date:** 2026-09-19
**Scope:** Sugartown monorepo (apps/web, packages/design-system, apps/storybook, process/tooling, docs)

---

## What this release is

Google Analytics now runs only with a visitor's consent, and a contrast fix brings every Callout
banner up to WCAG AA. Behind the site, the epic process became one checked loop from pickup to
post-ship, Linear was retired in favour of GitHub, and several tools that reported success while
doing nothing were fixed.

---

## What changed

### Analytics runs only after consent

Visitors see a bar at the bottom of the page on their first visit, with Accept analytics and
Reject analytics given equal weight. Until they accept, Google Analytics is not loaded at all
(Consent Mode v2, basic implementation). The choice is remembered, "Cookie settings" in the footer
reopens the bar, and rejecting after accepting removes the GA cookies.

Loading moved from an inline snippet in `index.html` into the app itself. The prebuilt article,
node and case-study pages had been dropping that inline snippet, so visitors landing on them
directly were never counted; they now load GA on consent like every other page.

### Callout banners meet WCAG AA

The light-theme Callout banner label was pink on grey at 2.85:1, below the AA minimum for text. It
now uses the brand text colour, maroon, at 4.82:1, which fixes every existing banner. Callout also
takes optional `role` and `ariaLabel` props, so a banner can be announced as a labelled region
rather than a live status, and its layout stacks the label above the text on narrow screens.

### The epic process is one checked loop

An epic doc is now checked against the template when work starts, by `scripts/check-epic-doc.js`,
which reads the required sections from the template itself. Questions are asked in one batch at
the start; Phase 0 sign-off covers the design, copy, CSS class names and rule changes together; a
Close-out review records what didn't work and where each follow-up went; and `/ship` runs the
post-ship checks on the live site. `/new-tool` gives tooling work its own issue-only spec, and
`/new-epic` now labels the issues it files.

### Gates that were assumed to work are now proven

`pnpm validate:liveness-probes` runs 13 gates against a deliberate violation each, in CI, and
fails if any stays green. The ESLint boundary rules, which had reported as configured for 176 days
while enforcing nothing, are among them. `Header.jsx` and `Footer.jsx`, left out of linting for
seven months after a migration, are linted again.

### One tracker, and backups that report honestly

Linear is retired; GitHub Issues and project 1 are the only tracker, and the governance page's
roadmap reads from GitHub. The commit backup to `wip/` branches had several silent failure modes,
including one that logged success for a commit that never left the disk; those are fixed, and
`/morning` now reads the backup log and flags a failure.

### Multi-repo operations and lighter sessions

`/sweep` checks every repository under `SUGARTOWN_DEV` in one run and pushes the private ones on
approval. A hook blocks any session from reading the two private directories, and each repository
now carries its own settings. `CLAUDE.md` shrank from about 1,000 to about 630 lines, with rules
that apply to one kind of file loading only when that file is read. `/ship --release` costs one
Netlify deploy instead of two, and releases are now tagged, with milestones and GitHub Releases
created at ship time.

### Documentation

The `docs/drafts` folder was audited (71 files classified, 6 issues filed), the Todo backlog was
re-verified against the repo, issue status rules were tightened, and the data-handling note now
records consent-gated analytics.

---

## Not in this release

- The Privacy page text describing the cookie banner is drafted in Sanity and not yet published.
- Confirming consented visits in GA Realtime is a manual check still owed.
- Existing backlog docs predate the new required `Visual` line and close-out sections; each is
  updated when its epic is picked up, not in bulk.

---

## Validator state at release

Run 2026-09-19 on the release commit's tree:

| Check | Result |
|---|---|
| `pnpm validate:tokens` | All `var(--st-*)` references resolve |
| `pnpm --filter web validate:tokens:strict` | No hardcoded colour values |
| `pnpm --filter web validate:style-mirror` | All mirrors byte-identical |
| `pnpm lint` | exit 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm validate:liveness-probes` | 13 gates proven live, 0 inert |
| CI run 35445972651 (pushed tree) | success, including Chromatic VRT |
