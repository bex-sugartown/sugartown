---
**Epic:** SUG-1005 — Nav content: trailing slashes and missing URLs
**GitHub Issue:** [#23](https://github.com/bex-sugartown/sugartown/issues/23)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-1005 — Nav content: trailing slashes and missing URLs

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
