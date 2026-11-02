# Release Notes — v0.39.0

**Date:** 2026-11-02
**Scope:** Sugartown monorepo (test suite, skills, process and tooling; no application code)

---

## What this release is

The automated accessibility checks now cover eight pages in both the light and dark themes, and four new skills carry a piece of work from requirements through to an epic and out to a shareable folder. No page on the site changes.

---

## What changed

### Accessibility checks cover more pages and both themes

The axe gate scanned five pages in the light theme. It now scans eight, including the first case study, node and glossary term found from each archive, in both themes (16 tests). A new guard fails the run if the dark theme did not apply, so a dark scan cannot quietly run in light. The link crawl adds the same three pages and now resolves same-page anchors against the page they sit on, which removed 14 false failures. The wider scan found three problems on the live site, filed as #184, #185 and #187 and allowlisted until they are fixed.

### A requirements-to-epic skill chain

Four skills now run in order: `/sugartown-prd-ai-writer` (requirements for AI agents, each with a check), `/sugartown-prototype-writer` (a placeholder for time-boxed experiments), `/sugartown-fsd-writer` (how the system behaves) and the existing epic writer. The chain ran once end to end on #166.

### Project export

`/sugartown-project-export` copies a project's documents into a share folder with a README, a glossary and a manifest. Its update mode compares each file with its source, adds changes, shipping release notes and linked issues, and logs the update in the README. `docs/conventions/project-artifacts.md` lists where each kind of artifact is stored.

### Release notes list their issues

Each release note now ends with an "Issues in this release" list built from the CHANGELOG entry. The notes for v0.36.0, v0.37.0 and v0.38.0 were backfilled.

---

## Not in this release

- Three accessibility findings stay open: #184 (ContentNav title contrast), #185 (glossary links told apart by colour alone) and #187 (muted grey text in dark). The #185 and #187 allowlist caps follow page content, so a publish with more glossary terms or filter options can turn the gate red until they are fixed.
- Contrast findings already allowlisted against #164, #171 and #172 remain.
- Platform pages and `/about` are not covered by the axe gate.
- The export skill's update path for changed source files, the swap from unreleased to released notes, and the GitHub Release body are untested.
- The Sanity release note type has no issues field, so published notes cannot show issue numbers as data (#188).

---

## Validator state at release

- CI run 41447469534 on `c1135896`: success, including the new axe and link tests.
- `pnpm test:smoke`: 28 passed (local, 2026-11-02); the CI smoke step took 3m19s against 3m21s before #166.
- Pre-commit validators on `de425754`: tokens, style mirror, strict colours, dead references, CSS names and lint passed.

---

## Issues in this release

Issue and epic numbers cited in the CHANGELOG entry for this version, as written there. `#n` and `ST-n` are GitHub issue n; `SUG-n` is a legacy ID from the retired Linear tracker. State is as of 2026-11-02.

| ID | Title | State |
|---|---|---|
| #166 (ST-166) | Axe and link-check coverage for case study, node and glossary pages (light theme) | Closed |
| #184 | ContentNav next and previous titles fail text contrast on case study, node and glossary pages (3.23:1) | Open |
| #185 | Glossary term links in body text are told apart by colour alone (axe link-in-text-block) | Open |
| #186 | Axe dark-theme pass: scan the existing and discovered routes in dark-pink-moon | Closed |
| #187 | Muted grey text (#888888) fails contrast in the dark theme: article filter counts and node sidebar series label | Open |
