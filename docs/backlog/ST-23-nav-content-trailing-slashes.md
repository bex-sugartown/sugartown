---
**Epic:** ST-23 — validate:urls reads the old nav link shape (24 false warnings)
**GitHub Issue:** [#23](https://github.com/bex-sugartown/sugartown/issues/23)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (a) Merge-as-you-go
---

# ST-23 — validate:urls reads the old nav link shape

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

**The problem this doc describes is gone, and a different one has replaced it.**

- **Trailing slashes: fixed.** No nav item carries `/knowledge-graph/` or `/case-studies/` (GROQ on `navigation`, published, 2026-09-19).
- **PROJ-002 item: gone.** No such nav item exists.
- **`validate:urls` reports 24 nav warnings, and they are false.** `apps/web/scripts/validate-urls.js:147-156` reads `link.url`. Nav items now use `linkType` with `internalPage` (a reference) or `externalUrl`, which `apps/web/src/lib/resolveNavUrl.js` resolves for the live site. The validator never learned the new shape, so every item except `About` (which still has a legacy `link.url`) reads as "(no url)". The live nav works.
- **One real content issue.** Four Platform children (Governance, Monorepo, CMS, Design System) are `linkType: external` pointing at `https://sugartown.io/platform/...`. They should be internal links. Content Write Gate applies.

**New scope:** teach `validate:urls` the `linkType` shape (reuse `resolveNavUrl.js` logic, do not copy it), confirm the warnings drop to real ones only, then propose the four link fixes. `project_nav_content_issues.md` in session memory was updated 2026-09-19 to match.

## Background

Filed as GitHub issue #23 in February 2026 and never done. Rediscovered 2026-08-15 during
migration Phase 2, and independently still recorded in MEMORY.md as a known open issue:

> Nav content issues — known Sanity nav data issues (trailing slashes, missing URL); content
> fixes not code bugs

**This is a content defect, not a code defect.** The navigation schema and renderer are correct;
individual `navigation` documents in Sanity carry malformed URL values — trailing slashes that
produce redirect hops, and entries with no URL at all.

Six months open is itself the finding: it survived because it belongs to neither the code
backlog nor a content review, and no validator covers Sanity nav data.

## Scope

- [ ] Query all `navigation` documents and list every URL value
- [ ] Classify: trailing slash, missing URL, correct
- [ ] Fix in Sanity via the Content Write Gate — this is a content write, so it needs a
      before/after proposal and explicit approval
- [ ] Decide whether `validate:urls` should cover nav documents. It already judges published
      Sanity content, so this may be a small extension rather than a new validator
- [ ] Remove the MEMORY.md entry once closed

## Non-Goals

- Changing the `navigation` schema. The schema is fine; the data is not.

## Related

- **GitHub:** [#23](https://github.com/bex-sugartown/sugartown/issues/23)
- MEMORY.md — `project_nav_content_issues.md`
- SUG-269 — makes the Sanity-backed validators probeable; relevant if `validate:urls` is extended
