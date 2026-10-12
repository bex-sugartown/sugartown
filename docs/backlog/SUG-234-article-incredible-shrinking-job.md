---
**Epic:** SUG-234 — Article: draft + publish "The Incredible Shrinking Job" to Sanity
**Linear Issue:** [SUG-234](https://linear.app/sugartown/issue/sug-234)
**Status:** Backlog
**Priority:** 🔵 Low
**Labels:** Content, Sanity
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-234 — Article: draft + publish "The Incredible Shrinking Job" to Sanity

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Take the "The Incredible Shrinking Job" article from HTML mock to a live Sanity article.

**Current state (verified 2026-07-23):**

* Exists only as an HTML mock: `docs/drafts/article-shrinking-job-mock.html`
* No Sanity document (draft or published) — confirmed absent from the content query.
* Narrative: six years of a single enterprise-retail requisition shrinking in title/comp while being re-shopped across staffing agencies (VMS / preferred-vendor mechanic).

**Scope:**

* Convert the approved mock into a live Sanity `article` draft (PortableText, sections, metadata).
* Editorial pass (red-pen, anti-slop / brand voice) + taxonomy pre-flight.
* Content Write Gate before any create/patch; Human-Publishes Rule for go-live.
* Reuse the detail-page recipe; no new DS component unless an audit proves the mock's sidebar/pull-quote/data-table patterns can't map to existing components.

**Relationship to** [SUG-213](https://linear.app/sugartown/issue/SUG-213/article-shrinking-job-article-gap-parallel-recruitment-timeline-aside)**:** [SUG-213](https://linear.app/sugartown/issue/SUG-213/article-shrinking-job-article-gap-parallel-recruitment-timeline-aside) adds the GAP parallel timeline aside to the *mock only* and is explicitly out of scope for Sanity publishing. This ticket owns the mock → Sanity → publish step. Sequence: [SUG-213](https://linear.app/sugartown/issue/SUG-213/article-shrinking-job-article-gap-parallel-recruitment-timeline-aside)'s GAP aside can either land in the mock first (then both ship together here) or be added post-publish — decide at activation.

Filed to give the base article a home. See content audit: `docs/drafts/content-audit-backlog-burn.md`.

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Activation notes, 2026-10-12

Read before activating. Source material lives outside this repo, in
`resume-factory/data/content/drafts/shrinking-job/` (`EVIDENCE-BRIEF_2026-08-31.md`, then
`EVIDENCE-UPDATE_2026-10-12.md`). Both are internal and fail the publish gate on purpose.

- **The mock's lede is now false.** "I have never spoken to the hiring manager" stopped being true
  on 2026-09-24, when a fifth pass of the same seat reached a hiring-manager round. The lede, the
  pull quote and "The wall I never got past" all need rewriting before Sanity.
- **New ending:** a recruiter carried the seat to the hiring manager, the answer was a stated fit
  reason, and seven days later the same seat came back through another firm at a lower rate. The
  reseller layer has no memory. The human door can open; it opened once, because one recruiter
  was good.
- **The flood, 2026-10-06/07:** a week after the no, the same seat arrived 9+ times in about 31
  hours from at least 4 firms (one firm sent three recruiters), plus a morning of phone calls Bex
  had to mute. Mailbox-verified; table in the evidence update §7. This is the scene for the post.
- **Extend the descent table** with the Sep and Oct 2026 passes (rates in the evidence update).
- **Replace the 8% duplicate figure.** Not reproducible. Use the scripted floor from the evidence update.
- **Gap aside (SUG-213):** 14 rows now, including a repost under a new req ID and a pulled req.
- **Cross-link** with the follow-up to "I Treated My Job Search Like a Data Pipeline"
  (https://sugartown.io/articles/job-search-funnel-data-postmortem), handoff at
  `resume-factory/data/content/drafts/ai-screening/HANDOFF_2026-10-12_article.md`. That post is the
  portal door; this one is the human door.
- **Open decisions at activation:** name the retailer or not; Gap aside before or after publish;
  publish order relative to the AI post.

## Related

- **Linear:** [SUG-234](https://linear.app/sugartown/issue/sug-234)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
