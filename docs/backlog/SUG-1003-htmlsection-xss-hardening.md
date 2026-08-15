---
**Epic:** SUG-1003 — htmlSection XSS hardening: decide, then act
**GitHub Issue:** [#16](https://github.com/bex-sugartown/sugartown/issues/16)
**Status:** Backlog
**Priority:** 🟠 High
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-1003 — htmlSection XSS hardening: decide, then act

> First epic doc tracked in GitHub rather than Linear, per the migration trial
> (`docs/briefs/linear-to-github-migration-plan.md` §2.1). `SUG-NNN` stays canonical; the
> GitHub issue is the mirror.

## Background

Filed as GitHub issue #16 in February 2026 as "htmlSection XSS hardening & Portable Text
conversion pipeline" and never done. Rediscovered 2026-08-15 during migration Phase 2, when
every legacy issue was verified against the codebase rather than assumed shipped.

`HtmlSection` in `apps/web/src/components/PageSections.jsx` (~line 719) says so in its own
comment:

```
// htmlSection — renders raw HTML as-is; no sanitization applied
// dangerouslySetInnerHTML does not execute <script> tags, so we re-append them
// as real DOM script elements after mount so embedded charts/widgets initialise.
```

Measured 2026-08-15:

- No sanitiser is installed anywhere in the repo — no `dompurify`, no `sanitize-html`, no `xss`
- The component renders `dangerouslySetInnerHTML={{ __html: section.html }}`
- A `useEffect` then finds every `<script>` the React render neutralised and **re-appends it as
  a live DOM element**, restoring execution

## The decision this epic exists to make

This is deliberate behaviour, not an oversight: embedded charts and widgets need their scripts
to run. And the only author of `htmlSection` content is Bex, so there is no untrusted input
path today. **This is not an active vulnerability.**

What it is: an undocumented, unbounded script-execution path with no stated boundary. Decide
which of these it is, and make the code say so:

| Option | What it means | Cost |
|---|---|---|
| **A. Accept and document** | Script execution is a required feature. Record it as an accepted risk with the conditions under which it stays acceptable (single trusted author, no user-submitted HTML, no third-party embeds from unvetted sources) | One comment block, one convention line |
| **B. Sanitise, allow-list scripts** | Add DOMPurify; keep an explicit allow-list of script sources permitted to execute | A dependency, plus per-embed maintenance |
| **C. Sanitise fully, drop script re-execution** | Any embed needing JS moves to a purpose-built section type | Breaks existing embeds; needs an audit of what uses htmlSection today |

**Do not skip to B or C.** Option A may well be right, and the failure this epic corrects is
that nobody wrote down which it was.

## Scope

- [ ] Audit which published documents actually use `htmlSection`, and what their HTML contains
- [ ] Decide A, B or C with the audit in hand
- [ ] Implement the decision
- [ ] If A: the accepted-risk note goes in `PageSections.jsx` **and** a convention line, with
      the conditions that would invalidate it
- [ ] If B or C: verify every existing `htmlSection` embed still renders

## Non-Goals

- The "Portable Text conversion pipeline" half of the original #16 title. If `htmlSection`
  content should become Portable Text, that is a separate content-migration epic. Split it out
  rather than bundling it here.

## Related

- **GitHub:** [#16](https://github.com/bex-sugartown/sugartown/issues/16)
- Discovered during migration Phase 2, `docs/briefs/linear-to-github-migration-plan.md`
