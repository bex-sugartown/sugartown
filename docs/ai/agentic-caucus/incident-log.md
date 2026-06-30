# Agentic Caucus — Incident Log

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 30 June 2026
**Related:** [[failure-modes]] (`docs/ai/agentic-caucus/failure-modes.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[methodology]] (`docs/ai/agentic-caucus/methodology.md`)

---

## Purpose

This is the append-only home for confirmed incidents. It closes the Layer 6
incident-reporting gap recorded in [[governance-coverage]]: before this log, confirmed
failures were scattered across session post-mortems, "process failure" annotations in
commits, and ad-hoc notes. They now have one registry.

The distinction from [[failure-modes]] matters:

- **A failure mode** is a *class*: a reproducible pattern an agent exhibits (FM-C-03
  speculative fixes, FM-X-02 confidence without verification).
- **An incident** is a dated *instance*: a specific occurrence in a real session that
  produced a real consequence. An incident usually maps to a failure mode, and confirms
  it. A new incident with no matching failure mode is a signal to add one.

This log records instances. Failure modes live next door.

---

## When to append

Add an entry when a failure has **occurred in a real session and produced a real
consequence** (wasted work, a broken build, a lost session, a misleading output that
reached a decision). The same bar as [[failure-modes]]: confirmed and consequential, not
suspected or harmless.

Do not log routine corrections, expected gate stops, or anything caught before it cost
something. The log is a record of what got through, not a diary.

## Append format

Newest entries at the top of the registry. One entry per incident:

```markdown
### INC-NNN — <short title>
**Date:** YYYY-MM-DD · **Failure mode:** <FM-ID or "new pattern"> · **Severity:** <Low | Medium | High>

**What happened:** One or two sentences. What the agent did, in which surface.
**Consequence:** The real cost. Commits squashed, time lost, build broken, output corrected.
**Resolution:** How it was caught and fixed, and any rule or validator added so it does not recur.
```

`INC-NNN` increments monotonically and is never reused. Severity is the cost, not the
likelihood: High means lost work or a shipped-then-reverted change; Medium means a
correction cycle; Low means a noise commit squashed before merge.

---

## Incident Registry

### INC-002 — DS-package theme file decayed to a stale subset
**Date:** 2026-06-13 · **Failure mode:** FM-X-02 (confidence without verification) · **Severity:** High

**What happened:** The `theme.pink-moon.css` copy in the DS package silently drifted from
the canonical web copy, decaying to a stale subset missing 93 token overrides. The
`validate:tokens` check passed throughout, because every `var(--st-*)` reference still
*resolved* via the shared `tokens.css` — it never checked that the two theme files carried
the same override set.
**Consequence:** DS components rendered incorrectly in Storybook while production looked
fine, hiding the drift. "Refs resolve" was mistaken for "themes match."
**Resolution:** Added `validate:style-mirror` to enforce byte-identical parity across the
mirrored style files, wired into pre-commit. The mirrored-file registry in `CLAUDE.md` now
names every must-be-identical pair and its enforcement mechanism.

### INC-001 — One-off `term*` CSS instead of shared vocabulary
**Date:** 2026-06-10 · **Failure mode:** FM-C-02 (over-documentation / reinvention under uncertainty) · **Severity:** Medium

**What happened:** `GlossaryTermPage` shipped with roughly nine one-off `term*` CSS patterns,
each of which had an existing shared class or component already available. The build session
reached for new CSS rather than the established detail-page vocabulary.
**Consequence:** A follow-up refactor deleted around 150 lines and took a full session that
would not have been needed had the page started from the shared vocabulary.
**Resolution:** Wrote `docs/conventions/detail-page-recipe.md` (component-first vocabulary)
and the CSS class pre-implementation reuse audit + proposal-table gate in `CLAUDE.md`, so a
new detail page starts from the shared map instead of rediscovering it.

---

## Changelog

### v1.0 — 30 June 2026
Initial document (SUG-198). Defined the append format and the failure-mode/incident
distinction. Seeded with two confirmed, dated incidents (INC-001, INC-002) drawn from
existing post-mortems. Closes the Layer 6 incident-reporting gap in [[governance-coverage]].
