---
**Epic:** ST-162: Article: AI screening follow-up to the funnel postmortem (working title)
**Issue:** [#162](https://github.com/bex-sugartown/sugartown/issues/162)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out: outline, data, draft and publish as one unit
**Visual:** no (reuses existing table and chart blocks; if the two-door chart needs a new block, stop and open Phase 0)
---

# ST-162: Article: AI screening follow-up to the funnel postmortem (working title)

An article that reopens a chapter closed in "I Treated My Job Search Like a Data Pipeline" and puts new funnel data beside the public evidence on AI hiring bias.

## Model & Mode

Plain `/model sonnet`. Editorial epic, no architectural ambiguity.

## Background

- **Original post:** [I Treated My Job Search Like a Data Pipeline](https://sugartown.io/articles/job-search-funnel-data-postmortem). Cohort Jul 2025 to May 2026, about 111 applications, 19 recruiter screens, 5 panels, 1 offer. Four chapters: CH1 Electric Resumes (marked Solved), CH2 Six Out of 100 (cold apply 6.7% vs an 8% benchmark), CH3 All or Nothing (recruiter inbound works), CH4 These Should Have Been a Shoe-In (panels stall). Closes with a six-item plan.
- **New data:** Resume Factory era, 2026-06-01 to 2026-10-12, re-cut 2026-10-12. Source: `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/findings.json` and `HANDOFF_2026-10-12.md` beside it.
- **Handoffs (internal, outside this repo, fail the publish gate on purpose):**
  - `resume-factory/data/content/drafts/ai-screening/HANDOFF_2026-10-12_article.md` (angle, shape, decisions)
  - `resume-factory/data/content/drafts/ai-screening/RESEARCH-BRIEF_AI-hiring-bias_2026-10-12.md` (every external claim, labelled Record / Reported / Theory)
- **Sibling:** [SUG-234](SUG-234-article-incredible-shrinking-job.md), "The Incredible Shrinking Job". That post is the human door, this one is the portal door. Cross-link both ways. Publish order is undecided (see Open decisions).
- **Teaser:** [ST-173](ST-173-article-five-minute-call-that-was-an-application.md), a short separate article that previews this one and publishes first. Tracked on its own; nothing in this epic's scope depends on it.
- **Pre-flight on the original post (read 2026-10-12):** its headline recruiter-inbound figure is **67% (n=12)**; the handoff cites "69% of warm touches". Resolve before the "then" column is published (see Data reconciliation).

**No mock and no draft exists.** Nothing is written to Sanity until Bex asks.

## Objective

A published article at `/articles/{slug}`, in Bex's first-person voice, with a thesis and no incident-report arc. Thesis: when a person chooses her first she gets a call almost every time; through a portal she almost never does; whatever sits behind the portal is the filter, and this post does not claim to know what it is. Layers touched: content (one Sanity `article` draft) and process (data check, compliance gate, review). No schema, GROQ, React or CSS changes.

**Angle (decided by Bex 2026-10-12):** "I fixed the resume. The rate went down." The thing she controlled improved; the thing she did not control decided. Honest bias question, no overclaim.

## Outline (proposed, not copy)

Target 1,600 words, long-form band, justified by two data blocks and a sourced evidence tour. Cut order if over: evidence tour detail first, never the thesis or the closer.

| # | Section (working subhead) | Job | Data / evidence |
|---|---|---|---|
| 1 | Cold open | Quote the line that marked CH1 Solved, then the new number | CH1 vs 6.7% to 3.7% |
| 2 | Two doors | Human door vs portal door, one table or bar | 10 of 10 vs 3 of 82 |
| 3 | What is behind the door | Short, sourced tour; each item labelled allegation / study / theory | Research brief §1 to §3 |
| 4 | What my data cannot say | Resume already strips age proxies; cohorts differ; small n; no vendor proof | Handoff §4 |
| 5 | It is not just me | Duration gap, ghost postings, application volume, Hidden Workers | BLS, Greenhouse, LinkedIn, HBS/Accenture |
| 6 | The human door, briefly | One recruiter carried a seat to a hiring manager and came back with a specific no. Link SUG-234 | Hiring-manager feedback (no names) |
| 7 | What I am changing | Headline recruiters search, warm paths before portals, an ATS field on the tracker | Handoff §5 items A and the ATS proposal |
| 8 | Close | The six-item plan from the first post, scored | Original plan list |

Skim skeleton to test at draft time: title, subheads, first sentence of each section, closer.

## Data draft (publishable figures only)

Every figure carries its command or file. Passes the gate as written; no company names, row IDs, rates or comp.

| Figure | Value | Source |
|---|---|---|
| Applications, 2026-06-01 to 2026-10-12 | 92 | `findings.json` `funnel.applied` |
| Screens / loops / offers | 13 / 6 / 0 | `funnel` |
| Captured, packaged | 793 / 106 | `funnel` |
| Recruiter-first applications to screen | 10 of 10, 5 became loops | `channel["Recruiter Inbound"]` |
| Non-inbound applications to screen | 3 of 82 (3.7%) | `channel`, sum of Job Alert 28, Board 27, Cold 21, Untagged 2, Referral 4 |
| Of those, screened | Board 1, Cold 1, Referral 1 | `channel` |
| Applied-to-screen, all channels | 14.1% (floor until about 11-02) | handoff §2 |
| Workday-hosted portals | 1 of 19, the one with a referral | handoff §4, pattern-matched, not a column |
| Applications per week, Sept to Oct | 3 to 6, rising | `Date Applied` (a floor) |
| Recruiter inbound by week | 9 at the August peak, 0 to 3 since | `Date Captured` |

**Then vs now**

| | First post (Jul 2025 to May 2026) | This post (Jun to Oct 2026) |
|---|---|---|
| Applications | about 111 | 92 |
| Cold / portal rate | 6.7% | 3.7% |
| Recruiter-first to screen | 67% (n=12) | 10 of 10 |
| Offers | 1 | 0 |

**External evidence to use, with labels** (full links in the research brief; re-verify each before publish)

| Claim | Label |
|---|---|
| iTutorGroup: software auto-rejected older applicants, EEOC settlement 2023 | Record, hard-coded rule, not ML |
| Mobley v. Workday: age collective certified, in discovery | Allegation |
| Name-based race and gender bias in LLM screeners (UW, AIES 2024) | Study |
| ChatGPT rated older women's resumes lower (*Nature*, Oct 2025) | Study |
| LLMs prefer AI-written text and their own resumes (PNAS 2025, AIES 2025) | Study |
| Average weeks unemployed, 55-64 vs all 16+: 34.9 vs 25.4 (BLS, Sept 2026) | Record; attributes nothing to AI |
| Monoculture, arms race, age proxies at scale | Theory |

### Data reconciliation (resolve before drafting)

1. **Inbound rate:** original post says 67% (n=12); handoff says 69%. Use the post's own figure for "then".
2. **"Pure portal" denominator:** the handoff removes one referral (2 of 81). `channel` shows 4 Referral applications; removing all four gives 2 of 78 (2.6%). Pick one definition and state it.
3. **Cohort comparability:** different windows, market and role mix; scope widened to PM and web platform roles in October. Say so in the post.
4. **Her age:** the resume strips date proxies, the site does not (28-year career in the original). Bex's call whether the post states it.

## Scope

- [ ] **1. Data check:** re-run the source commands for every row in the data draft, record the command beside each figure, settle the four reconciliation items (layer: editorial)
- [ ] **2. Evidence check:** open each external link in the research brief, confirm it resolves and says what the brief claims, drop any that fail (layer: editorial)
- [ ] **3. Discovery:** taxonomy pre-flight and related-content check per `docs/write-pipeline-prompt.md` §1 (article target: 1 to 2 categories, 3 to 6 tags, Bex Head as author, tool `claude-code` for attribution) (layer: process)
- [ ] **4. Outline approval:** Bex approves or edits the outline above and settles the open decisions (layer: process)
- [ ] **5. Draft created in Sanity** via `create_documents` only, with `aiDisclosure` set (layer: content)
- [ ] **6. Compliance gate** passed (`docs/write-pipeline-prompt.md` §4, zero em dashes, publish gate on the final text) (layer: process)
- [ ] **7. Human review and publish decision**, cross-links to SUG-234 added once both exist (layer: process; Human-Publishes Rule applies)

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 1 | Verified data table and evidence list, discovery notes | 1, 2, 3 |
| 2 | Approved outline | 4 |
| 3 | Sanity draft, compliance gate passed | 5, 6 |
| 4 | Human review, publish decision (not before the 10-30 headline read) | 7 |

## Open decisions (Bex, at activation)

- Name her age, say "over 50", or leave it to the evidence.
- Publish order relative to SUG-234.
- Publish now, or after the JD-0813 outcome and the 10-30 headline read (handoff recommends waiting; the 14 newest applications mature by about 11-02).
- Build the `ATS` tracker column first, so the vendor cut is a real column and not a pattern match.

## Acceptance Criteria

- [ ] Every figure in the published text traces to a command or file named in this doc; none is copied from the original post or the handoffs without a re-check.
- [ ] Every external claim carries a working link and the word allegation, study or theory where it belongs; no allegation is stated as fact.
- [ ] The post says what her data cannot show: which portals used AI, whether age was read, and that the cohorts differ.
- [ ] `python3 os/checks/check_tiers.py --publish` (run in `resume-factory/os`) passes on the final text; the iTutorGroup dollar figure is either omitted or overridden deliberately.
- [ ] No company names on live pursuits, row IDs, recruiter or firm names, rates or comp.
- [ ] Zero em dashes; compliance gate passed; `aiDisclosure` set to match who drafted it.
- [ ] Draft exists as `drafts.*` in Sanity with taxonomy attached and no document published without Bex's standalone instruction.
- [ ] `node scripts/check-epic-doc.js docs/backlog/ST-162-article-ai-screening-followup.md` exits 0.

## Non-Goals

- No mock and no final copy in this step.
- No Sanity writes until the outline is approved (Content Write Gate).
- No claim that any named vendor's AI rejected her. 1 of 19 against 1 of 13 is noise.
- No schema, GROQ, component or CSS changes. New taxonomy documents are not created (pre-flight rule).
- The comp analysis is a separate post. The Shrinking Job rewrite stays in SUG-234.
- Building the `ATS` column belongs to resume-factory, not this repo.

## Kill criterion

If the post is not drafted by 2026-12-01, close it as declined and keep the handoffs; the data goes stale after the 10-30 and 11-02 reads.
