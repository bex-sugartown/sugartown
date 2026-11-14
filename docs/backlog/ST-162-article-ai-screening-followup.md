---
**Epic:** ST-162: Article: AI screening follow-up to the funnel postmortem (working title)
**Issue:** [#162](https://github.com/bex-sugartown/sugartown/issues/162)
**Status:** In Progress (resumed 2026-11-08; final data cut to 2026-11-05 done; drafting)
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out: outline, data, draft and publish as one unit
**Visual:** no (reuses `tableBlock` and `htmlSection`; there is no chart block, and the original post's charts are `htmlSection` embeds, corrected 2026-11-01. If a chart needs a new block, stop and open Phase 0)
---

# ST-162: Article: AI screening follow-up to the funnel postmortem (working title)

An article that reopens a chapter closed in "I Treated My Job Search Like a Data Pipeline" and puts new funnel data beside the public evidence on AI hiring bias.

## Model & Mode

Plain `/model sonnet`. Editorial epic, no architectural ambiguity.

## Background

- **Original post:** [I Treated My Job Search Like a Data Pipeline](https://sugartown.io/articles/job-search-funnel-data-postmortem). Published 2026-05-20 (Sanity `publishedAt`; call it "the earlier post", not "the June post"). Cohort Jul 2025 to May 2026, about 111 applications, 19 recruiter screens, 5 panels, 1 offer. Four chapters: CH1 Electric Resumes (marked Solved), CH2 Six Out of 100 (cold apply 6.7% vs an 8% benchmark), CH3 All or Nothing (recruiter inbound works), CH4 These Should Have Been a Shoe-In (panels stall). Closes with a six-item plan.
- **New data:** Resume Factory era, 2026-06-01 to 2026-10-20, re-cut 2026-10-22 (10-12 outputs frozen in `_frozen_2026-10-12/`). Source: `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/findings.json` and `HANDOFF_2026-10-12.md` beside it.
- **Handoffs (internal, outside this repo, fail the publish gate on purpose):**
  - `resume-factory/data/content/drafts/ai-screening/HANDOFF_2026-10-12_article.md` (angle, shape, decisions)
  - `resume-factory/data/content/drafts/ai-screening/RESEARCH-BRIEF_AI-hiring-bias_2026-10-12.md` (every external claim, labelled Record / Reported / Theory)
- **Sibling:** [SUG-234](SUG-234-article-incredible-shrinking-job.md), "The Incredible Shrinking Job". That post is the human door, this one is the portal door. Cross-link both ways. Publish order is undecided (see Open decisions).
- **Teaser:** [ST-173](../shipped/ST-173-article-five-minute-call-that-was-an-application.md), a short separate article that previews this one and publishes first. Tracked on its own; nothing in this epic's scope depends on it.
- **Pre-flight on the original post (read 2026-10-12):** its headline recruiter-inbound figure is **67% (n=12)**; the handoff cites "69% of warm touches". Resolve before the "then" column is published (see Data reconciliation).

**No mock and no draft exists.** Nothing is written to Sanity until Bex asks.

### Workstream timeline (added 2026-11-14)

This epic was filed 2026-10-12, but the work began on 2026-08-29 in resume-factory. Dates are file modification dates in `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/` (FA) and `resume-factory/data/content/` (content), plus git and issue dates here.

| Date | Workstream | What happened | Evidence |
|---|---|---|---|
| 2026-05-20 | Article series | First post published, "I Treated My Job Search Like a Data Pipeline" | Sanity `publishedAt` |
| 2026-06-17 to 07-07 | Shrinking Job (SUG-234) | Outline, archive audit, discourse notes, two mocks | `content/drafts/shrinking-job/` |
| 2026-06-27 | Pipeline | Tracker and Gmail mirror live (charter v1.0) | charter change log |
| **2026-08-29 to 08-30** | **This article, first draft** | "Season Two: The Pipeline Got Faster and the Funnel Got Worse" (later "The Bar Went Up, the Rate Held Flat, and My Funnel Quietly Inverted"), "Career Engineering, Part 2", working drafts v1 to v8. `analyze.py`, `focus_yoy.py` and `comp_history.py` written; cohort frozen 08-29; five pipeline changes shipped 08-30 | FA `charts-and-findings_v1` to `v8.html`, copied to `content/reports/`; FA `_frozen_2026-08-29/` |
| 2026-08-31 | Staging | `content/` created as the staging area with the `check_tiers.py --publish` gate; Shrinking Job evidence brief | `content/README.md`, `EVIDENCE-BRIEF_2026-08-31.md` |
| 2026-09-29 to 10-01 | Funnel analysis | Thirty-day review of the 08-30 changes, then a handoff | FA `Review_2026-09-29_Thirty-Day.md`, `HANDOFF_2026-10-01.md` |
| **2026-10-12** | **This article, re-scoped** | Funnel re-cut, article handoff, research brief; angle decided; ST-162 filed the same day | FA `HANDOFF_2026-10-12.md`; `content/drafts/ai-screening/`; issue #162 created 2026-10-12 |
| 2026-10-13 to 10-17 | Teaser (ST-173) | Bait-and-switch LinkedIn post and article, shipped 10-17 | `content/drafts/linkedin-ziprecruiter/`; commit `d37be5d7` |
| 2026-10-22 to 11-12 | This article | Re-cuts to 10-20, 10-23, 10-30, 11-05; Sanity draft 11-08; correction 11-12; red pen 11-12 and 11-13 | FA `_frozen_*`; this doc |

**Where the tailoring error came from.** The 10-12 article handoff got the "then" column right ("Fixed with channel-specific, JD-tailored variants") but wrote the "now" column as "Tailoring shipped at scale". The same framing, "Tailoring per JD did not move it", is in FA `HANDOFF_2026-10-12.md` §1. A2 and the Sanity draft inherited it. Corrected 2026-11-14 (§Resume tailoring audit). The Season Two draft does not make this claim: it says "Nothing about the resume ... changed" between June and August.

**The article's line "I have been writing this post for two months" holds.** It is 11 weeks from 2026-08-29 to 2026-11-14. "Since August" would be more exact.

## Objective

A published article at `/articles/{slug}`, in Bex's first-person voice, with a thesis and no incident-report arc. Thesis: when a person chooses her first she gets a call almost every time; through a portal she almost never does; whatever sits behind the portal is the filter, and this post does not claim to know what it is. Layers touched: content (one Sanity `article` draft) and process (data check, compliance gate, review). No schema, GROQ, React or CSS changes.

**Angle (decided by Bex 2026-10-12):** "I fixed the resume. The rate went down." The thing she controlled improved; the thing she did not control decided. Honest bias question, no overclaim.

## Outline (proposed, not copy)

Target 1,600 words, long-form band, justified by two data blocks and a sourced evidence tour. Cut order if over: evidence tour detail first, never the thesis or the closer.

| # | Section (working subhead) | Job | Data / evidence |
|---|---|---|---|
| 1 | Cold open | Quote the line that marked CH1 Solved, then the per-month number: twice the applications, the same 0.6 cold screens a month | Per-month table: 10.1 to 20.0 applications, 0.64 to 0.60 cold-only screens (corrected 2026-10-30 to the 10-30 cut; the old row read 21.0 and 0.63) |
| 2 | Two doors | Human door vs portal door, one table or bar, per month | 9 of 10 recruiter-first applications vs 3 of 84 cold-only (reconciliation 5); warm screens 1.0 to 2.2 a month |
| 2b | Before and after the tracker | What the system changed and what it did not: intake 10x, applications 2x, cold yield flat | System epochs table; per-month table |
| 3 | What is behind the door | Short, sourced tour; each item labelled allegation / study / theory | Research brief §1 to §3 |
| 4 | What my data cannot say | Resume already strips age proxies; cohorts differ; small n; no vendor proof | Handoff §4 |
| 5 | It is not just me | Duration gap, ghost postings, application volume, Hidden Workers | BLS, Greenhouse, LinkedIn, HBS/Accenture |
| 6 | The human door, briefly | One recruiter carried a seat to a hiring manager and came back with a specific no. Link SUG-234 | Hiring-manager feedback (no names) |
| 7 | What I am changing | Headline recruiters search, warm paths before portals, an ATS field on the tracker | Handoff §5 items A and the ATS proposal |
| 8 | Close | The six-item plan from the original post, scored | Original plan list |

Skim skeleton to test at draft time: title, subheads, first sentence of each section, closer.

### Approved 2026-10-30 (Bex)

**Headline (approved): "Twice the Applications, the Same Number of Cold Calls".** It is the only candidate the data supports. Rejected or held: "I Fixed the Resume. The Rate Went Down." (R2: the 6.7% to 3.6% drop is inside chance, p=0.52; keep it only as "stayed flat"), "Nine of Ten, Three of Eighty-Four" (depends on reconciliation 5), "Two Doors, One Resume" (softer), "The Resume Wasn't the Problem" (claims a conclusion the post says it cannot reach).

**Outline above approved as the structure.** Bex expects to rework the language, narrative and drama heavily, so the skeleton is a starting shape and not copy. Working skeleton (title, subheads, first sentences, closer), local only: `docs/drafts/ST-162-skim-skeleton.md`. Closer, working line: "I improved the part I controlled, and the part I didn't control decided."

Open when work resumes: row 8 (the six-item plan, scored) needs the plan list from the original post; the LinkedIn application-volume line in row 5 must be attributed as Reported (New York Times via eWeek); the angle "the rate went down" is not to be stated as a finding.

Nothing is written to Sanity. The Content Write Gate still applies at Scope 5.

## Data draft (publishable figures only)

**Cohort names (decided 2026-10-22; replaces "first post" and "now" as cohort labels).** **25-26** is the original post's cohort: Jul 2025 to May 2026, 11 months, 111 applications. **Jun-Nov 26** is this post's cohort: Jun 1 to Nov 5, 2026, 5.2 months, 109 applications (108 until the 2026-11-12 correction below; renamed from "Jun-Oct 26" on 2026-11-08 when Bex asked for the cut to run to 11-05; every older section below that says "Jun-Oct 26" is a superseded cut).

**Final cut, 2026-11-05 (run 2026-11-08; supersedes every table below).** `END = 2026-11-05` in `os/scripts/analyze.py`; `LOOPS` gained JD-0844 (Patagonia via TEKsystems: recruiter screen 10-15, hiring-manager round 1 held 2026-11-04, debrief on file). 10-30 outputs frozen in `_frozen_2026-10-30/`. `build_source_report.py` regenerated and `check_funnel_integrity.py` is clean (108 applied, 17 screened, 9 looped).

**Correction, 2026-11-12 (figures below are corrected in place; old value in brackets).** Bex asked to classify the 3 screens with no application. (1) **JD-0050 was never a screen**: its only evidence was Status `Phone Screen`, and the row's own 2026-09-01 close note says that status claimed "a conversation that never happened". Removed from `SCREENS` in `analyze.py`. (2) **JD-0033 was an application**: Bex's Apple Mail (bex@sugartown.io) shows the tailored resume emailed to the Veridian recruiter 2026-06-18 2:33 PM and his 3:21 PM reply that the hiring manager had reviewed it. Recorded as a dated Notes line on the tracker row (`Date Applied` stays blank: warm row, Charter schema col 13), which `applied()` reads. (3) **JD-0393 stays a screen with no application** (Levi's via PineQ, closed same day); excluded from rates, footnoted. Decided by Bex 2026-11-12: applications-only basis, footnote it. Re-run diff against the 11-08 `findings.json`: applied +JD-0033, screened -JD-0050, no-answer +JD-0033; nothing else moved. Charts rebuilt. Per-month figures in the per-month table are read from the rebuilt `7-per-month-comparison.html`. Charts regenerated: `docs/drafts/ST-162-twice-the-applications/ST-162-charts/index.html`. Command for every figure: `python3 os/scripts/analyze.py` in `resume-factory/os`, then the keys named in the Source column; per-month figures divide by 158 days / 30.44 = 5.19.

| Figure | 10-30 cut | **11-05 cut (final)** | Source (`findings.json` key) |
|---|---:|---:|---|
| Captured / packaged | 854 / 115 | **871 / 123** | `funnel` |
| Applications | 100 | **109** [108] | `funnel.applied` (8 new: all with `Date Applied` 11-04 or 11-05; +JD-0033, correction 11-12) |
| Screens / loops / offers | 17 / 8 / 0 | **16 / 9 / 0** [17 / 9 / 0] | `funnel`; the new loop is the Patagonia hiring-manager round |
| Applied-to-screen | 14.0% (14 of 100) | **13.8% (15 of 109)** [13.0%, 14 of 108] | `screened_ids` against `applied_ids`; 1 screen has no application (JD-0393) |
| Rejected / closed with no answer / still open | 52 / 15 / 33 | **56 / 16 / 37** [56 / 15 / 37] | `outcomes`; 4 new rejections, one of them the Etsy referral (no screen) |
| Cold-only to screen | 3 of 84 (3.6%) | **3 of 91 (3.3%)** | Job Alert 33 + Board 33 + Cold 23 + Untagged 2 = 91; screened Board 2, Cold 1 |
| Warm (recruiter-first plus referral) to screen | 11 of 16 (69%) | **12 of 18 (67%)** [11 of 17, 65%] | one new recruiter-first application (Disney via a staffing firm, 11-04), not yet screened |
| Recruiter-first to screen | 9 of 10 | **10 of 12** [9 of 11] | `channel["Recruiter Inbound"]` applied 12, screened 11, of which JD-0393 has no application (correction 11-12). All 3 cold screens are on applications. |
| Referral to screen | 2 of 6 | **2 of 6** | `channel["Referral"]` |
| Age cues by resume version (added 2026-11-09 for "What my data cannot say") | 2013: roles from 1992, school 1988, "14+ years". 2021-22: from 2004, school 1990-91, "20 years". 2023-24: from 2012, no school year, "20+ years". Dec 2024 to Apr 2026 (every Cohort 1 variant): from 2012, no school year, no tenure line | **1 May 2026 prototype r3 onward (Cohort 2): from 2017, no school year, "15+ years"; "9+ in product" added 30 Jun** | `python3 os/scripts/resume_age_signals.py` in `resume-factory/os` (reads the Drive recovery copy under `~/Documents` and the prototype archive; .docx only). One Nov 2025 variant (vAI+Content) was cut at 2017 early; the sent versions on record for Nov 2025 are the 2012-dated ones. |
| Listing lifetime before it died on its own (added 2026-11-09 for the "I was the bottleneck" paragraph) | n/a | **209 dead listings with dates: median 13 days from capture; 35% dead within 5 days, 54% within 14, 85% within 30** | `python3 os/scripts/listing_lifetime.py` in `resume-factory/os`; regex over Notes, so quote as "about". "The interesting ones went first" is Bex's observation, not measured. |
| Cold-only rate, 25-26 vs Jun-Nov 26 | 6.7% vs 3.6%, p=0.52 | **6.7% vs 3.3%, p=0.34** | two-sided Fisher exact on 7 of 105 vs 3 of 91; inside chance, so "flat", never "fell" |

**Per month, 25-26 against Jun-Nov 26 (final).** 25-26 is 11 months; Jun-Nov 26 is 5.19.

| Measure | 25-26 total | 25-26 per month | Jun-Nov 26 total | Jun-Nov 26 per month | Change |
|---|---:|---:|---:|---:|---:|
| Applications | 111 | 10.1 | 109 | 21.0 | **2.1x** |
| Cold applications | 105 | 9.5 | 91 | 17.5 | 1.8x |
| **Cold-only screens** | 7 | **0.64** | 3 | **0.58** | **0.9x (flat)** |
| Warm touches (inbound plus referral applications) | 16 | 1.5 | 18 | 3.5 | 2.4x |
| Warm screens | 11 | 1.0 | 12 | 2.3 | 2.3x |
| All recruiter screens | 19 | 1.7 | 16 | 3.1 | 1.8x |
| Hiring-manager round or later (25-26: HM screen 9; Jun-Nov 26: loops 9) | 9 | 0.8 | 9 | 1.7 | 2.1x |
| Offers | 1 | 0.09 | 0 | 0 | none |
| Explicit rejections | 46 | 4.2 | 56 | 10.8 | 2.6x |
| Closed with no answer | 70 | 6.4 | 16 | 3.1 | not comparable (R3, clock rule) |
| JDs captured | not tracked | n/a | 871 | 168 | n/a |

**By month, final (month = Date Captured; Recr = applications that reached a screen; Loop = rows in `LOOPS`; Ghost is clock-based, so Aug onward reads 0 until day 60):**

| Month | Apps | Cold | Inbnd | Refrl | Recr | Loop | Denied | Ghost |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Jun '26 | 21 | 17 | 2 | 2 | 4 | 2 | 15 | 6 |
| Jul '26 | 24 | 19 | 4 | 1 | 3 | 1 | 14 | 10 |
| Aug '26 | 23 | 20 | 2 | 1 | 3 | 2 | 16 | 0 |
| Sep '26 | 12 | 11 | 1 | 0 | 2 | 1 | 4 | 0 |
| Oct '26 | 23 | 19 | 2 | 2 | 3 | 3 | 7 | 0 |
| Nov '26 (to 11-05) | 6 | 5 | 1 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **109** | **91** | **12** | **6** | **15** | **9** | **56** | **16** |

**System epochs, final (same epoch boundaries; epoch 4 now runs to 11-05):**

| Epoch | Dates | Months | Captured / month | Applications / month | Apps to screen | Loops |
|---|---|---:|---:|---:|---:|---:|
| 0. Manual | Jul 2025 to May 2026 | 11 | not tracked | 10.1 | 19 of 111 (17.1%) | 9 HM rounds |
| 1. Backfill | 06-01 to 06-26 | 0.85 | 20 | 18.7 | 4 of 16 | 2 |
| 2. Tracker plus Gmail, open intake | 06-27 to 08-04 | 1.28 | 179 | 26.5 | 3 of 34 | 1 |
| 3. Gates and P2 queue | 08-05 to 09-19 | 1.51 | 302 | 15.2 | 4 of 23 | 3 |
| 4. Tight filters | 09-20 to 11-05 | 1.54 | 109 | 23.3 | 4 of 36 | 3 |

Epochs 2 and 3 read 34 and 23 applications here against 35 and 28 in the older table below, because the 10-30 count rules (no unsent packages, no duplicate captures, no cross-references) removed rows; the older table is kept for the record only.

**Weekly, final (week of Monday; applications by `Date Applied`, recruiter inbound by `Date Captured`):** 10-05: 6 / 2; 10-12: 10 / 2; 10-19: 2 / 2; 10-26: 6 / 5; 11-02 (four days): 8 / 1. The 10-26 inbound week (5) is the highest since August; count seats, not threads, before quoting it (R4).

**What moved between 10-30 and 11-05:** 8 applications (6 cold, 1 recruiter-first, 1 board), 4 rejections (3 cold, 1 referral), 1 loop (Patagonia hiring-manager round 1, 11-04; still live, so the post names no company), 0 new screens, 0 offers. Data draft tables from 10-30 and earlier remain below as the audit trail. Use these in every chart, table and sentence. Compare on rates and per-month pace, never on totals, because the windows differ in length. Pre-flight: the original post's By the Numbers kicker reads "Jun '25-May '26" while its body and charts say Jul 2025. Confirm the true start month before "25-26" goes public; fixing the original is a Content Write Gate item.

**Re-cut to 2026-10-30, corrected on 2026-10-30 (latest, supersedes the first 10-30 read of 107 applications).** `END = 2026-10-30`; analyze.py commits 4dbfd30 and 4e55ed8. Screens stay 17 (14 on an application, 3 with none). Loops go 7 to 8 (lululemon hiring-manager round 1, 10-29). Three rule changes since the 10-23 cut, so the 10-23 column below is not like for like and needs a footnote wherever it is quoted: (1) an application dated after END does not count; (2) a built-but-unsent package, a duplicate capture and another row's apply quoted in Notes no longer count as applications (7 rows dropped); (3) **closed with no answer is clock-based**: no rejection, not withdrawn, and at least 60 days since Date Applied at END. The 10-27 ghost sweep closed 14 rows 18 to 47 days after applying, so the first read of 36 no-answer was not real. Rejections 50 to 52. Still open 33, of which 9 reach day 60 in November and 24 in December, so 11-30 is the first cut where no-answer is meaningful for Sep and Oct applies. Source report regenerated and the integrity check is clean.

| Figure | 10-23 cut (old rules) | **10-30 cut** |
|---|---:|---:|
| Captured / packaged | 835 / 115 | **854 / 115** |
| Applications | 100 | **100** |
| Screens / loops / offers | 17 / 7 / 0 | **17 / 8 / 0** |
| Applied-to-screen | 15.0% (15 of 100) | **14.0% (14 of 100)** |
| Rejected / closed with no answer / still open | 50 / 22 / 28 | **52 / 15 / 33** |
| Cold-only to screen | 3 of 83 (3.6%) | **3 of 84 (3.6%)** |
| Warm (recruiter-first plus referral) to screen | 12 of 17 | **11 of 16 (69%)** |
| Recruiter-first to screen | 10 of 12 | **9 of 10** |
| Referral to screen | 2 of 5 | **2 of 6** |

**Previous cut, 2026-10-23 (re-cut 2026-10-24).** Same source and method, `END = 2026-10-23`; 10-20 outputs frozen in `_frozen_2026-10-20/`. One new screen with a debrief on disk (recruiter screen 10-23, recruiter inbound; hiring-manager round booked 10-29 and not yet held, so it is not a loop). Loops go 6 to 7 for a different reason: Third and Grove round 2 (director of PM, 10-20) had a debrief on disk but was missed in the 10-20 cut. One new application (JD-0870). Count rule changed 2026-10-26: an application dated after the cut's END no longer counts, so later applies to older rows (JD-0799 on 10-24, JD-0833 and JD-0875 on 10-26) stay out; without it the same cut read 103. `packaged` is not frozen the same way (115, not 114). The next check is 10-30. The tables below keep the 10-20 cut for comparison; the **10-23 column** is the current figure. The by-month and weekly tables are not re-cut yet (see the note under each).

| Figure | 10-20 cut | **10-23 cut** | Source (`findings.json` key) |
|---|---:|---:|---|
| Captured / packaged | 810 / 111 | **835 / 115** | `funnel` |
| JDs entering per month, Oct (to the 23rd) | 56 (to the 20th) | **81** | `monthly["2026-10"].captured` |
| Applications | 99 | **100** | `funnel.applied` |
| Screens / loops / offers | 16 / 6 / 0 | **17 / 7 / 0** | `funnel` |
| Applied-to-screen, all channels | 14.1% (14 of 99) | **15.0% (15 of 100)** | `screened_ids` against `applied_ids` |
| Rejected / closed with no answer / still open | 50 / 21 / 28 | **50 / 22 / 28** | `outcomes` |
| Recruiter-first applications that reached a screen | 9 of 11 | **10 of 12** | `channel["Recruiter Inbound"]`, minus the 2 screens with no application |
| Referral applications to screen | 2 of 5 | **2 of 5** | `channel["Referral"]` |
| Cold-only applications to screen | 3 of 83 (3.6%) | **3 of 83 (3.6%)** | Job Alert 30 + Board 28 + Cold 23 + Untagged 2 = 83; screened Board 2, Cold 1 |
| All non-recruiter applications to screen | 5 of 88 (5.7%) | **5 of 88 (5.7%)** | cold-only 84 plus Referral 5 |

Note: Board 29 to 28 and Cold 22 to 23 between cuts means one row changed channel; confirm which before publishing the cold-only denominator. Jun-Oct 26 is now Jun 1 to Oct 23, 100 applications, 4.8 months.

**Previous cut, 2026-10-20 (re-cut 2026-10-22).** Cohort: Date Captured 2026-06-01 to 2026-10-20. Source: `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/findings.json`, generated by `python3 os/scripts/analyze.py` (`END = 2026-10-20`). The 10-12 outputs are frozen beside it in `_frozen_2026-10-12/`. Every figure below is read from that file. Passes the gate as written; no company names, row IDs, rates or comp.

| Figure | 10-12 cut | **10-20 cut** | Source (`findings.json` key) |
|---|---:|---:|---|
| Captured / packaged | 793 / 106 | **810 / 111** | `funnel.captured`, `funnel.packaged` |
| JDs entering the system, per month (added 2026-10-22 at Bex's request) | n/a | **810 captured: Jun 32, Jul 169, Aug 425, Sep 128, Oct 56 (to the 20th)** | `monthly[*].captured`. Jun-Oct 26 only: 25-26 predates the tracker, so there is no comparable count. Chart it as a Jun-Oct 26 series beside applications per month, and say why 25-26 has none. |
| Applications | 92 | **99** | `funnel.applied` |
| Screens / loops / offers | 13 / 6 / 0 | **16 / 6 / 0** | `funnel` |
| Applied-to-screen, all channels | 12.0% (11 of 92; the handoff's 14.1% was 13 of 92 and counted two screens with no application) | **14.1%** (14 of 99) | `screened_ids` against `applied_ids` |
| Rejected / closed with no answer / still open | not cut | **50 / 21 / 28** | `outcomes` |
| Recruiter-first rows that reached a screen | 10 | **11** (5 became loops) | `channel["Recruiter Inbound"]` |
| Recruiter-first applications that reached a screen | read as "10 of 10" | **9 of 11** | `screened_ids` against `applied_ids` (see reconciliation 5) |
| Referral applications to screen | 1 of 4 | **2 of 5** | `channel["Referral"]` |
| Cold-only applications to screen (no prior relationship) | 2 of 78 (2.6%) | **3 of 83 (3.6%)** | `channel`: Job Alert 30 + Board 29 + Cold 22 + Untagged 2 = 83 applied; screened Board 2, Cold 1 |
| All non-recruiter applications to screen | 3 of 82 (3.7%) | **5 of 88 (5.7%)** | cold-only 83 plus Referral 5 |
| Workday-hosted portals | 1 of 19 | **stale, not re-cut** | pattern-matched, never a column; needs the `ATS` column first |

**What moved between 10-12 and 10-20 (three new screens, each with a debrief file on disk)**

| Row (internal only) | Entry | Screen held | Counted as |
|---|---|---|---|
| Web agency PM role | Referral via a reference | 2026-10-14 | Referral (tracker `Channel` changed from Job Alert on 2026-10-22, per Bex) |
| Ecommerce contract via a staffing firm | Recruiter outreach | 2026-10-15 | Recruiter Inbound (a recruiter screen, not a client screen) |
| DXP systems analyst role | Cold portal apply | 2026-10-21 | Board, cold-only. One day past the `END` date; the application predates it |

**By month, in the shape of the original post's monthly table** (month = Date Captured; Recr = rows in `SCREENS`; Loop = rows in `LOOPS`; the original post's Any IV, HM and Panel columns have no equivalent here)

| Month | Apps | Cold | Inbnd | Refrl | Recr | Loop | Denied | Ghost |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Jun '26 | 20 | 17 | 1 | 2 | 3 | 2 | 15 | 5 |
| Jul '26 | 25 | 19 | 5 | 1 | 3 | 1 | 14 | 11 |
| Aug '26 | 26 | 22 | 3 | 1 | 4 | 2 | 17 | 2 |
| Sep '26 | 14 | 13 | 1 | 0 | 2 | 1 | 2 | 2 |
| Oct '26 (to 10-20) | 14 | 12 | 1 | 1 | 2 | 0 | 2 | 1 |

10-30 cut, by month (Apps/Cold/Inbnd/Refrl/Recr/Denied/Ghost): Jun 20/17/1/2/3/15/5, Jul 24/19/4/1/3/14/10, Aug 23/20/2/1/3/16/0, Sep 12/11/1/0/2/4/0, Oct (to 10-30) 21/17/2/2/3/3/0; total 100/84/10/6/14/52/15. Ghost is clock-based now, so Aug to Oct read 0 until day 60. Full table: `docs/drafts/ST-162-twice-the-applications/ST-162-charts/6-monthly-table.html`.
| **Total** | **99** | **83** | **11** | **5** | **14** | **6** | **50** | **21** |

Read Sep and Oct Denied and Ghost low: those applications have had under 8 weeks to resolve. Recr totals 14 here, not 16, because two screens (a recruiter pitch with no application) have no application month.

**Weekly series** (week starting Monday; computed from the tracker with the same rule as `analyze.py`)

| Week of | Applications (`Date Applied`, a floor: filled on 38 of 99 rows) | Recruiter inbound (`Date Captured`) |
|---|---:|---:|
| 08-03 | 2 | 8 |
| 08-10 | 0 | 7 |
| 08-17 | 1 | 9 |
| 08-24 | 0 | 4 |
| 08-31 | 1 | 1 |
| 09-07 | 4 | 3 |
| 09-14 | 3 | 1 |
| 09-21 | 5 | 2 |
| 09-28 | 5 | 0 |
| 10-05 | 6 | 2 |
| 10-12 | 11 | 2 |
| 10-19 (two days) | 0 | 0 |

The 10-05 inbound count carries the touches-versus-seats caveat from the 10-12 handoff (§5): nine or more recruiter threads that week were for one closed seat.

**25-26 vs Jun-Oct 26**

| | 25-26 (Jul 2025 to May 2026) | Jun-Oct 26 (Jun 1 to Oct 30, 2026) |
|---|---|---|
| Applications | 111 | 100 |
| Cold-only screen rate (no prior relationship) | 6.7% (7 of 105) | 3.6% (3 of 84) |
| Warm (recruiter inbound plus referral) screen rate | 69% (11 of 16) | 69% (11 of 16: 9 of 10 recruiter-first, 2 of 6 referral; see reconciliation 5) |
| Recruiter inbound alone | 67% (8 of 12) | 9 of 10 applications reached a screen |
| Referral alone | 75% (3 of 4) | 2 of 6 |
| Offers | 1 | 0 |

The warm rate (11 of 16, 69%) equals the original post's 69% (11 of 16). With n of 16 on each side that is a coincidence, not stability. The change is inside it: referral fell from 3 of 4 to 2 of 6.

## Per-month comparison and system epochs (added 2026-10-26)

The windows differ (25-26 is 11 months, Jun-Oct 26 is 5.0: 152 days to 10-30, divided by 30.44). Totals are never compared; every figure below is per month. The 25-26 column comes from the original post's published monthly table and funnel chart (read from Sanity 2026-10-26, `sections` of `job-search-funnel-data-postmortem`). The Jun-Oct 26 column comes from `findings.json` at the 10-30 cut.

### Per month, 25-26 against Jun-Oct 26

| Measure | 25-26 total | 25-26 per month (11) | Jun-Oct 26 total | Jun-Oct 26 per month (5.0) | Change |
|---|---:|---:|---:|---:|---:|
| Applications | 111 | 10.1 | 100 | 20.0 | **2.0x** |
| Cold applications | 105 | 9.5 | 84 | 16.8 | 1.8x |
| **Cold-only screens** | 7 | **0.64** | 3 | **0.60** | **0.9x (flat)** |
| Warm touches (inbound plus referral) | 16 | 1.5 | 16 | 3.2 | 2.2x |
| Warm screens | 11 | 1.0 | 11 | 2.2 | 2.2x |
| All recruiter screens | 19 | 1.7 | 17 | 3.4 | 2.0x |
| Hiring-manager round or later | 9 | 0.8 | 8 (loops) | 1.6 | 1.9x |
| Offers | 1 | 0.09 | 0 | 0 | none |
| Explicit rejections | 46 | 4.2 | 52 | 10.4 | 2.5x |
| Closed with no answer | 70 | 6.4 | 15 | 3.0 | not comparable until 11-30 (R3, clock rule) |
| JDs captured | not tracked | n/a | 854 | 171 | n/a |
| Applied-to-screen rate | 17.1% | | 14.0% | | about flat |

Source for Jun-Oct 26: `findings.json` keys `funnel`, `channel`, `outcomes`, `applied_ids`, `screened_ids`, `looped_ids`, via `python3 os/scripts/analyze.py` (`END = 2026-10-30`). Warm touches 16 is 10 recruiter-first plus 6 referral applications; warm screens 11 is 9 of 10 plus 2 of 6.

Definition mismatches to state in the post, not hide: (1) 25-26 "recruiter screens" is 19 in the funnel chart but 18 in the monthly table (7 cold plus 11 warm is 18); use 19 as published and flag the one-row gap. (2) 25-26 Inbnd and Refrl columns count contacts, and 105 cold plus 12 plus 4 exceeds 111 applications, so some warm touches were never applications. (3) "Hiring-manager round or later" (25-26) and "loops" (Jun-Oct 26) are close, not identical. (4) "No answer" is defined differently (R3).

### The story the per-month numbers tell (proposed, for outline approval)

1. **Effort doubled and cold results did not move.** Applications per month went from 10.1 to 20.0. Cold-only screens per month went from 0.64 to 0.60. Twice the cold volume bought no extra cold screen. Small n (7 then 3), so say "flat", not "fell"; p=0.35 on the rate (R2).
2. **The extra screens were all warm.** Warm screens per month went from 1.0 to 2.2. Screens per month doubled (1.7 to 3.4), and the whole gain came from recruiters and referrals, not from the portal.
3. **The machine widened the top, not the middle.** 854 JDs captured (171 a month) and 115 packaged, but applications stayed near 12 to 27 a month in every epoch below. Intake grew about 10x; applications did not follow it, because the gates and Bex's hours cap them.
4. **Rejections rose with volume.** Explicit rejections per month went from 4.2 to 10.4 (2.5x). More applications means more answers, mostly no.
5. **No offer in either window that came from an application.** The one 25-26 offer arrived as cold recruiter inbound with no application. Jun-Oct 26 has none yet.

Do not claim the machine failed or that portals use AI to screen. The claim is narrower: the same cold yield at twice the effort, and the gain came from the human door. Cohorts differ in market, role scope (PM and web platform roles added in October) and tooling.

### System epochs: before and after the tracker

Before 2026-06-27 everything was manual: sourcing, inbound and referrals, logged in Evernote tags. The tracker (charter v1.0) and the Gmail mirror arrived 2026-06-27, so the Jun-Oct 26 cohort starts 26 days before the tracker existed and its earliest rows were backfilled. Epoch = the row's Date Captured date range. Source: `findings.json` ids joined to the tracker's `Date Captured`; change dates from the charter change log (`resume-factory/os/01 PRIVATE/Job-Search-OS_Charter.md`).

| Epoch | Dates | What changed (charter) | Months | Captured / month | Applications / month | Screens (rows) | Apps to screen |
|---|---|---|---:|---:|---:|---:|---:|
| 0. Manual | Jul 2025 to May 2026 | Evernote tags, manual sourcing, inbound and referrals | 11 | not tracked | 10.1 | 19 | 19 of 111 (17.1%) |
| 1. Backfill | 06-01 to 06-26 | Resume Factory era starts; rows backfilled before the tracker | 0.85 | 20 | 17.6 | 5 (3 from apps) | 3 of 15 |
| 2. Tracker plus Gmail, open intake | 06-27 to 08-04 | v1.0 tracker built, Gmail mirror (06-27); hard gates v1.1 to v1.7 | 1.28 | 179 | 27.3 | 3 | 3 of 35 |
| 3. Gates and P2 queue | 08-05 to 09-19 | Consumer, AI, federal and commute gates (v2.0 to v2.4); P2 queue and scoring (v2.9); funnel recommendations R2 to R5 (v3.1, 08-30); dedup as code (v4.13); PjM lane (v4.15, 09-04) | 1.51 | 302 | 18.5 | 5 | 5 of 28 |
| 4. Tight filters | 09-20 to 10-30 | `Date Applied` column and follow-up clock (v4.26, 09-20); seniority ceiling (v4.29, 09-22); Shopify focus (v4.33); comp floor to $100k and PjM lane (v4.36, 10-16); Director tier cut (v4.38, 10-18); LinkedIn alerts rebuilt remote-only (v4.40, 10-19) | 1.35 | 113 | 21.5 | 4 | 4 of 29 |

Reading it: intake peaked in epoch 3 (about 300 JDs a month) and fell by more than half in epoch 4 as the filters tightened, while applications held at 18 to 20 a month. Screen counts per epoch are 3 to 5 rows, so no rate in this table is a finding. Two limits: (1) a screen is attributed to the row's capture date, not the date the screen happened, and the newest rows have had under eight weeks to resolve; (2) epoch 1 is a backfill, so its pace is not a real pre-tracker measurement.

Before the post uses the epoch table: confirm with Bex which of these changes she counts as big, and whether June's backfilled rows should be shown as their own epoch or folded into epoch 2. The charter has 40+ entries; this table keeps the ones that change what gets captured, packaged or applied to.

## Two perspectives to cover before writing (added 2026-10-26)

Both perspectives must be covered before drafting: **A. the personal journey** (the pipeline and the tools that automate it) and **B. outside influences** (market, layoffs, bias). Local working files: `docs/drafts/ST-162-market-timeline.md` (month-by-month market data, sources read 2026-10-26), `docs/drafts/ST-162-research-check.md` (link check and hypotheses), `docs/drafts/ST-162-third-party-sources.md` (the source list), `docs/drafts/ST-162-twice-the-applications/ST-162-charts/index.html` (eight charts, regenerated by `build_charts.py` beside it). Every tie between A and B below is **theoretical** unless a status column says otherwise.

### A. Personal journey: the pipeline and the tools

Before 2026-06-27 the search was manual: Evernote tags, hand sourcing, inbound and referrals. The pipeline below is what changed (charter change log, `resume-factory/os/01 PRIVATE/Job-Search-OS_Charter.md`).

| Stage | Manual era (25-26) | Pipeline era (Jun-Oct 26) | Numbers (10-23 cut) |
|---|---|---|---|
| Sourcing | Job boards, recruiter inbound, referrals | Gmail Inbox Engine reads alert and recruiter mail into the tracker; LinkedIn saved searches (rebuilt remote-only 10-19) | 854 JDs captured, 171 a month |
| Triage | By eye | Hard gates (role, level, commute, federal, AI-as-product), P2 triage board with scoring (08-21), Director tier cut (10-18) | captured per month 20, 179, 302, 114 across the four epochs |
| De-duplication | By memory | `check_duplicate.py` (09-04) | not measured |
| Packaging | **Corrected 2026-11-14 (was "One resume, edited per role"):** category variants from Aug 2025; from 2026-03-02 one prototype resume, AI-tailored per JD under a written no-fabrication prompt (v2 to v5). See §Resume tailoring audit | Resume Factory: six family prototypes plus a master, a story bank, the same rules run as a Cowork skill, cover letter in every package | 115 packaged |
| Apply | Manual | Manual, now with a `Date Applied` column and a 14-day follow-up clock (09-20) | 100 applications; `Date Applied` is filled on only 38 of 99 older rows |
| Tracking and analysis | Evernote tags, a one-off analysis | Tracker, dashboard, `analyze.py`, funnel integrity check | this epic's tables |

What the tools changed, in numbers: intake grew about 10x, packaging reached 115, and applications doubled to 20 a month. What they did not change: the cold-only screen rate per month (0.64 then 0.60). Applications are capped by Bex's hours and the gates, not by intake. Not measured anywhere: hours spent per application, time from capture to apply, and cost per screen. These are the gaps in Perspective A.

| ID | Hypothesis about the pipeline (unverified) | Check | Data in hand? |
|---|---|---|---|
| A1 | Automation widened the top of the funnel and the gates, not the tools, decided what got applied to. | Captured, packaged and applied by epoch (table above); applications stayed at 18 to 27 a month while captures moved 10x. | Yes |
| A2 | **Reworded 2026-11-14.** Deeper tailoring did not change the cold-door yield. Both cohorts were tailored; what changed at the pipeline was how much and from what (§Resume tailoring audit). | Cold-only screens by tailoring phase: category variants 6 of 74 (8.1%), per-JD AI tailoring under rules 1 of 31 (3.2%), Resume Factory 3 of 91 (3.3%). All inside chance. The old wording ("0.64 before tailoring, 0.60 after") was wrong: Cohort 1 was tailored. Confounded by market, role mix and the Oct scope change. | Yes (phase split run 2026-11-14) |
| A3 | The tighter filters in Sep and Oct raised quality per application, and it is too early to see it. | Apps-to-screen by epoch: 3 of 35, 5 of 28, 4 of 22. Rows under eight weeks old have not resolved. Re-run on 11-02 and again on 11-30. | Not yet |
| A4 | Most of Bex's time went to packaging and following up, not sourcing. | Needs hours. Add a time log, or drop the claim. | No |

### Resume tailoring audit, before and after the pipeline (added 2026-11-14)

**Finding: tailoring did not start with the Resume Factory.** Bex was tailoring every application from 2026-03-02, with a prototype resume and a written no-fabrication prompt, three months before Cohort 2. The original post says the same thing in chapter one ("built channel-specific variants across CMS, ECOM, DAM, and Platform, then customized each against the specific JD"). The Sanity draft and row A2 framed Cohort 1 as untailored; that framing is wrong. Raised by Bex 2026-11-14.

**Tailoring phases, from file evidence** (paths under `~/Documents/GDRIVE RECOVERY/04 Resumes & Job Search/01 Resumes/` unless stated; dates are file modification dates)

| Phase | Dates | Base resume | Per-JD step | Guardrails | Evidence |
|---|---|---|---|---|---|
| 0. One base | Dec 2024 to mid Aug 2025 | `Becky-Head-Product-Leader-2025.docx` (2024-12-21) | not evidenced in files | none written | `Resume 2025/` |
| 1. Category variants | Aug 2025 to Feb 2026 | vDigital Product & Ops (08-14), vCMS and vDS (08-23), vECOM (11-17), vAI+Content (11-24), CMS-Design-System r1 to r4 (Nov 2025 to Mar 2026); `MASTER_RESUME`, `resume_data*.xlsx` and a `resume_generator_template` (11-26 to 12-07) | Category picked per role, then hand edits; no AI per-JD step (confirmed by Bex 2026-11-14). Sent files are named by category, not company (`Sent_Versions/`, Nov 2025) | none written | `Resume 2025/`, `Resume 2026/source/`, `Resume 2026/Sent_Versions/` |
| 2. Prototype plus AI per JD, with rules | 2026-03-02 to 2026-05-31 | `Becky-Head_PROTOTYPE_Resume_2026` r1, r2 (03-09), r3 (05-05) | Prototype and JD pasted into a Claude chat. About 32 company- or role-named resumes and about 19 cover letters, against 32 Cohort 1 applications in Mar to May | `resume-tailor-prompt` v2 (03-02) to v5 (03-09): never invent skills or results, never move a stat between roles, never change titles or dates, no em dashes, no AI filler, `[ADD: metric?]` instead of an estimate, locked strength phrases, edit only the summary and the last three roles | `Resume 2026/test resume ai/` |
| 3. Resume Factory (Cohort 2) | 2026-06-01 onward | Six family prototypes (first family r1 2026-07-10; now r20 to r40) plus a MASTER superset (r1 2026-09-23), revision-logged in `PROTOTYPE-INDEX_and_CHANGELOG.md` | `sugartown-resume-tailor` skill in Cowork, per JD, from the tracker. Cover letter in every package. 123 packages, 109 applications | Phase 2 rules carried over, plus a story bank, an older-roles reference and a new-fact intake rule | `resume-factory/data/00 PROMPT + PROTOTYPE/` |

**What changed at the pipeline, and what did not**

| Dimension | Phase 2 (Mar to May 2026) | Phase 3 (Resume Factory) | Changed? |
|---|---|---|---|
| Tailored per JD | Yes, about one resume per application | Yes, one package per application | No |
| No-fabrication rules | Written prompt v5 | Same rules, run as a skill | No (form only) |
| Base | One prototype | Six family prototypes plus a master | Yes |
| Fact source | The prototype's own text | Story bank, older-roles reference, new facts added from interviews and archives (for example Sephora PIM RFP, AEM Cloud migration) | Yes, more true material to tailor from |
| Accuracy audits | None recorded | Logged corrections that removed claims (2026-09-23 Backroads, 2026-09-23 Sephora content ops, 2026-11-05 ELC AI claims) | Yes |
| Layout and parse rules | ATS intake work per chapter one of the original post | Page-flow rule (09-10), `City, ST` locations (09-22), one role-header standard (09-23) | Refined |
| Cover letters | About 19 of 32 | Every package | Yes |
| Throughput | About 10 applications a month (Mar to May: 32 in 3 months) | 21.0 a month | Yes, 2.1x |
| Age cues | Cut to 2017 at prototype r3, 2026-05-05 | Same | No. The age-cue row above labels this "Cohort 2"; r3 is dated inside Cohort 1's last month (8 applications, 0 screens) |

**Cold-only yield by tailoring phase.** Cohort 1 rows from `resume-factory/data/00 JOB SEARCH OS/Funnel Pipeline/reports/evernote_notes_enriched.csv` (`in_cohort == 1`, applied, not inbound or referral, by `created` month); Jul 2025 to Apr 2026 reproduce the published monthly table exactly, and May uses the published row (8 cold, 0 screens; the CSV holds 15 May rows, also 0 cold screens). Cohort 2 from `findings.json`. Fisher exact, two-sided, run 2026-11-14 (the same method gives 0.34 for Cohort 1 against Cohort 2, matching the figure above).

| Phase | Months | Cold applications | Cold screens | Rate | Cold screens a month |
|---|---:|---:|---:|---:|---:|
| 0 and 1. Base, then category variants (Jul 2025 to Feb 2026) | 8 | 74 | 6 | 8.1% | 0.75 |
| 2. Prototype plus AI per JD, with rules (Mar to May 2026) | 3 | 31 | 1 | 3.2% | 0.33 |
| 3. Resume Factory (Jun 1 to Nov 5, 2026) | 5.19 | 91 | 3 | 3.3% | 0.58 |

p-values: phase 1 vs 2, 0.67; 1 vs 3, 0.30; 1 vs 2 and 3 together, 0.18; 2 vs 3, 1.0. **None is a finding.** What the split does say: if the cold rate moved at all, it moved in March 2026, when per-JD AI tailoring started, not in June when the pipeline started. Phases 2 and 3 are the same rate. The market changed over the same months, so this is not evidence that tailoring hurt.

**Corrections the article draft needs** (Sanity `drafts.c1415fdb-...`; proposals only, Content Write Gate applies)

| Section | Current text | Problem |
|---|---|---|
| The line I got wrong | "a script that tailors a resume and cover letter to each posting (with strict ... guardrails and a story bank I wrote myself)" | Reads as if tailoring and guardrails were new. The guardrails date from March; the story bank and the scale are new |
| What the machine changed | "The tailoring, which is the thing chapter one said would fix the cold door, shipped at scale and the cold door did not notice." | Chapter one said tailoring was already done. What shipped at scale was deeper, faster tailoring |
| Why the portal might not answer | "tailoring is the thing I doubled" | Wrong. Applications doubled; tailoring was already near every application from March |
| What the machine changed | "A parse-clean, role-tailored resume did not raise my cold screen rate." | True, but needs its comparison: both cohorts were parse-clean and role-tailored |
| Twice the effort | Cohort comparison only | Consider the three-phase table: it is the accurate before and after |

**Applied 2026-11-14 (Bex approved rows 1 to 5).** Patched on the draft at rev `20mWqb5JxEZ7f25aDRxJsk` and verified by re-query: `w2a` (The line I got wrong), `m2a` and `m3a` (What the machine changed), `y2a` (Why the portal might not answer), and a new block `e3` after `e2` in `s-effort-2` carrying the three-phase split. Not published. The ST-223 link sentence is still to come, once the node exists.

**Applied 2026-11-14, table cells (Bex approved; found by the first stage 3 export, `docs/write-pipeline-prompt.md` §0b).** At rev `20mWqb5JxEZ7f25aDVzvr1`: `m1-tbl` row `mr2` (Packaging, before and after), `y-tbl` row `yr1` (tailoring theory, what my data shows), `c-tbl` row `cr3` ("From May 2026"; May 2026 noted as 8 applications, 0 screens). Re-exported to `docs/drafts/ST-162-twice-the-applications/ST-162-twice-the-applications-sanity-latest.html` at rev `TiskbWAg8339xLi9CRtOos`; the new text is present and the old text is gone. Not published.

**Accurate framing, one sentence (proposed, not copy):** I was already tailoring every application with an AI prompt and rules against making things up; the pipeline gave me six base resumes instead of one, a bank of true stories to draw on, and twice the throughput, and the cold rate did not notice any of it.

**Spinoff candidate.** The four phases (one base, category variants, prompt with rules, Resume Factory) are a story of their own: how the guardrails were written, what the audits caught, and what the story bank adds. It does not fit this article's word budget. **Decided by Bex 2026-11-14: a separate node, filed as its own epic.** This article keeps one sentence and links to it.

### B. Outside influences: market, layoffs and bias

Market data is by month, Jul 2025 to Oct 2026, from Challenger (announced cuts), JOLTS (BLS openings and hires), Indeed Hiring Lab (postings index, 2020-02-01 = 100, monthly means calculated from Indeed's published CSVs) and named layoffs from trade press. Bias evidence is in the research table above and the source list. Definition cautions (Challenger counts announcements, JOLTS was benchmarked in Jan 2026, Indeed's AI share is a keyword count) are in `ST-162-market-timeline.md` section Cautions.

**Her month against the market** (Apps, Screens and Denied are the cohort tables; Screens = applications that reached a recruiter screen; Challenger tech = announced tech cuts, thousands; Indeed = postings index; JOLTS info = information-sector openings rate, %):

| Month | Apps | Screens | Denied | Challenger tech (k) | Indeed software dev | Indeed project mgmt | Indeed marketing | JOLTS info openings |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Jul '25 | 10 | 0 | 6 | 13.0 | 65.4 | 99.3 | 74.8 | 6.4 |
| Aug '25 | 7 | 1 | 2 | 13.0 | 66.1 | 100.2 | 77.3 | 4.7 |
| Sep '25 | 16 | 2 | 6 | 5.6 | 64.7 | 99.5 | 77.7 | 6.5 |
| Oct '25 | 6 | 3 | 3 | 33.3 | 64.9 | 100.6 | 77.9 | 4.1 |
| Nov '25 | 24 | 3 | 10 | 12.4 | 66.2 | 101.6 | 78.5 | 3.0 |
| Dec '25 | 9 | 1 | 4 | 0.9 | 66.9 | 104.0 | 79.6 | 3.8 |
| Jan '26 | 1 | 1 | 1 | 22.3 | 68.1 | 105.5 | 79.3 | 3.4 |
| Feb '26 | 6 | 0 | 2 | 11.0 | 70.3 | 106.7 | 76.7 | 2.8 |
| Mar '26 | 19 | 4 | 7 | 18.7 | 71.6 | 106.7 | 74.8 | 2.9 |
| Apr '26 | 5 | 3 | 2 | 33.4 | 72.8 | 106.6 | 74.1 | 3.1 |
| May '26 | 8 | 0 | 3 | 38.2 | 74.1 | 107.0 | 75.8 | 2.5 |
| Jun '26 | 20 | 3 | 15 | 15.5 | 73.1 | 108.0 | 74.0 | 3.1 |
| Jul '26 | 25 | 3 | 14 | 9.9 | 75.0 | 110.7 | 74.7 | 2.8 |
| Aug '26 | 26 | 4 | 17 | 6.1 | 74.4 | 112.6 | 76.5 | 4.3 (prelim) |
| Sep '26 | 14 | 2 | 4 | 10.8 | 77.1 | 116.8 | 76.2 | not yet published |
| Oct '26 | 22 | 3 | 3 | not yet published | 78.3 (to 10-16) | 117.7 (to 10-16) | 75.4 (to 10-16) | not yet published |

Market in one paragraph (Record or Estimate, see the file): announced US cuts through September are down 39% on 2025 (573,195 vs 946,426) but tech cuts are up 54% (165,925 vs 107,878), peaking at 38,242 in May 2026. Software-development postings rose from about 65 to 78 and project-management postings from 99 to 118, while marketing and retail stayed flat to down. Information-sector openings roughly halved, from 6.5% to about 3%. JOLTS layoffs stayed near 1.0 to 1.2%. Ghost postings held in Greenhouse's 18% to 22% range.

**Ties between her moves and outside events (reviewed with Bex 2026-10-30).** Seven were proposed; two were dropped, one lost its market cause, and four stand. Each remaining tie is a theory: the data lines up, but a third cause could explain it.

| ID | Her move | Outside event | Tie | Status | What would confirm or kill it |
|---|---|---|---|---|---|
| T1 | Widened into project and program roles (09-04, 10-16) | Project-management postings up about 18% since Jul 2025, the fastest-growing sector tracked; software dev up about 20% but still below the pre-pandemic baseline; marketing and retail flat | Her core buckets (ecommerce, DAM, design system) sit in the flat sectors; she moved toward where postings grew. | **Stands.** Bex confirmed the intent: to follow where postings were. | Market side is Estimate data (Indeed's index, monthly means calculated from its CSVs). Kill: Indeed's sectors do not map to her roles; there is no product-manager or ecommerce sector. |
| T2 | Captures fell from 425 (Aug) to 81 (Oct) | Indeed all-postings index flat, 101.9 to 104.0 | The drop is her filters (Director cut, remote-only alerts, seniority ceiling), not a shrinking market. | **Stands.** Bex confirmed it was her filters. | Kill: alert email volume fell before the gates ran. Compare alert emails received by month. |
| T3 | "Closed with no answer" fell from 63% to 34% | Ghost postings steady at about 19% | The market's ghost share did not change, so the fall is the cohorts' definition and the ghost sweep (R3), not employers answering more. | **Stands.** Bex agreed. | Kill: recompute 25-26 on the pipeline-era definition. |

Context, not ties:

- **Competition (was T5).** Rejections per month rose 2.5x with volume and cold yield stayed flat, while tech cuts are up 54% year to date and information-sector openings roughly halved. State this as market context in the post. Do not claim it explains her numbers: applicants per posting is the missing measure (Greenhouse figures of about 244 per role are vendor blog data). Record the applicant count at apply time from now on.
- **Apr and May 2026 (was T2).** Applications were low (5 and 8) while tech cuts peaked, but Bex says interviews took her time (4 in Mar and Apr). No market tie.

Dropped by Bex: the Nov 2025 spike against the Oct 2025 layoffs (was T1), and warm screens against a shift to contract (was T7, no data supports it).

Not found, so not claimed: layoffs.fyi monthly counts (secondary 2026 totals range from 125,759 to 205,832), JOLTS for Sep 2026, any measure of AI screening use year over year, and any neutral cold-response rate by month. Named layoffs for her target employers are in the market file; two employers with rows in her tracker appear on the 2026 list. Do not name them in the article (no live pursuits).

## Research data (outlined and linked)

Full text, every link and the Record / Reported / Theory labels: `resume-factory/data/content/drafts/ai-screening/RESEARCH-BRIEF_AI-hiring-bias_2026-10-12.md` (internal, outside this repo). Links below are copied from it. Scope item 2 re-opens each one before publish.

| Group | Claim | Label | Link |
|---|---|---|---|
| Litigation | iTutorGroup: software auto-rejected women 55+ and men 60+, 200+ applicants, EEOC settlement 2023 (hard-coded rule, not ML; the dollar figure trips the publish gate) | Record | [EEOC](https://www.eeoc.gov/newsroom/itutorgroup-pay-365000-settle-eeoc-discriminatory-hiring-suit) |
| Litigation | Mobley v. Workday: age collective certified May 2025, expanded to HiredScore Jul 2025, motion to dismiss largely denied 2026-06-22, Rule 23 class certification motion filed 2026-09-14 (Workday opposition due 2026-11-10, hearing 2027-03-09); no liability finding. Re-check the docket on publish day | Allegation | [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/05/federal-court-allows-collective-action-lawsuit-over-alleged), [AI Governance for HR](https://www.aigovernanceforhr.com/p/the-mobley-v-workday-case-didnt-end), [Wiggins Childs](https://www.wigginschilds.com/news/workday-case-update/), [RPJ](https://rpjlaw.com/recent-developments-in-mobley-v-workday-california-court-allows-key-ai-hiring-bias-claims-to-move-forward/) |
| Litigation | Harper v. Sirius XM (iCIMS), a race case, E.D. Mich. 2:25-cv-12403: dismissed 2026-09-30. HR Dive says summary judgment; one tracker says judgment on the pleadings, without prejudice. Docket not read, so do not write "summary judgment" or a final merits loss | Allegation, outcome reported | [HR Dive](https://www.hrdive.com/news/sirius-xm-beats-allegations-of-ai-fueled-racial-bias/832115/) |
| Litigation | Kistler v. Eightfold AI: FCRA class action over undisclosed profiling, pleading stage | Allegation | [Akin](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/ai-hiring-platform-faces-fcra-class-action-over-data-use-or-kistler-et-al-v-eightfold-ai-inc) |
| Studies | Name-based race and gender bias in LLM resume retrievers (UW, AIES 2024); age not tested | Study | [AIES](https://ojs.aaai.org/index.php/AIES/article/view/31748) |
| Studies | ChatGPT wrote women's resumes as younger and rated older men highest (*Nature*, Oct 2025) | Study | [Stanford News](https://news.stanford.edu/stories/2025/10/ai-llms-age-bias-older-working-women-research) |
| Studies | Age cues cut human and model invitations, 75.3% young vs 53.1% old (UNC, FLAIRS); 12 base CVs. **Not found in any source seen 2026-10-26 (the paper looks like Harris, FLAIRS vol. 36, crowdworker ratings and bias correction). Open the PDF by hand before keeping this row.** | Study, unverified | [FLAIRS](https://journals.flvc.org/FLAIRS/article/download/133236/137923/247012) |
| Studies | LLMs prefer LLM-written text (*PNAS*, Aug 2025); prefer their own resumes (AIES 2025) | Study | [PNAS](https://ideas.repec.org/a/nas/journl/v122y2025pe2415697122.html), [arXiv](https://arxiv.org/abs/2509.00462) |
| Studies | Credit line (Bex, 2026-11-01): Joy Buolamwini, the reason Bex has a perspective on algorithmic bias. Buolamwini and Gebru, "Gender Shades" (PMLR 81:77-91, 2018): three commercial gender classifiers, darker-skinned women the most misclassified group, error up to 34.7%, vs a maximum of 0.8% for lighter-skinned men. Read from the abstract only on 2026-11-01; vendor names, dataset size and body quotes not confirmed (PDF unreadable). Face analysis, not hiring: use as the origin of the perspective, never as evidence about screeners. Candidate quote, under 15 words, from the abstract: "darker-skinned females are the most misclassified group". Timnit Gebru is the co-author; credit both names. **Decided 2026-11-01 (Bex): credit Buolamwini and Gebru by name in the bias section. Sweeney and Noble rows stay in the table as optional, not credited.** Bex to confirm this is the right person (the paper is 2018, not over 10 years ago) | Study | [PMLR](https://proceedings.mlr.press/v81/buolamwini18a.html) |
| Studies | Latanya Sweeney, "Discrimination in Online Ad Delivery" (arXiv 1301.6822, submitted 2013-01-29; sole author; no journal named on the arXiv page, PDF not opened): ads for searches of racially associated names were more likely to suggest an arrest record for names associated with Black babies, 2184 names, two websites. The earliest of the three, and the only one over 10 years old. Candidate quote, 6 words, from the abstract: "statistically significant discrimination in ad delivery". Ad delivery, not hiring | Study | [arXiv](https://arxiv.org/abs/1301.6822) |
| Studies | Safiya Umoja Noble, *Algorithms of Oppression: How Search Engines Reinforce Racism* (NYU Press, February 2018, 248 pp.): argues search engines are not neutral and favour whiteness, with women of color most affected; built on analysis of search results and paid ads. Candidate quote, 7 words, from the publisher's description: "Data discrimination is a real social problem". Search, not hiring. Publisher page read 2026-11-01; book not read | Study | [NYU Press](https://nyupress.org/9781479837243/algorithms-of-oppression/) |
| Studies | Bloomberg: GPT-3.5 ranked identical resumes 1,000 times, name-based disparities | Reported | [Bloomberg](https://prod.cm.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/) |
| Market | Average weeks unemployed, 55-64 vs all 16+: 34.9 vs 25.4 (BLS, Sept 2026); the long-term share is 30.7% (55-64) vs 28.2% (all) on BLS and about equal on AARP's 55+ cut; name the cut | Record, attributes nothing to AI | [BLS](https://www.bls.gov/web/empsit/cpseea36.htm), [AARP](https://www.aarp.org/pri/topics/work-finances-retirement/employers-workforce/employment-data-digest/) |
| Market | "Hidden Workers": 88% of employers say qualified candidates are screened out for not matching exactly (HBS and Accenture, 2021) | Reported, employer survey | [HR Dive](https://www.hrdive.com/news/report-applicant-tracking-systems-may-exclude-whole-segments-of-candidates/606614/) |
| Market | LinkedIn at about 11,000 applications a minute, up 45% in a year (2025); eWeek attributes it to the New York Times, not LinkedIn | Reported | [eWeek](https://www.eweek.com/news/ai-job-applications-linkedin/) |
| Market | About 1 in 5 postings never filled (Greenhouse data) | Reported | [Korn Ferry](https://www.kornferry.com/insights/this-week-in-leadership/ghost-job-posts-a-mounting-frustration) |
| Market | 21% of employers let AI reject at every stage without human review; 47% of companies believe AI leads to age bias, a belief, not an observation (Resume Builder, n=948 business leaders, survey launched Oct 2024) | Reported | [Resume Builder](https://resumebuilder.com/7-in-10-companies-will-use-ai-in-the-hiring-process-in-2025-despite-most-saying-its-biased/) |
| Market | Women 26% of new hires in AI roles vs 50% in non-AI; Millennials 60% of Head of AI hires (LinkedIn Economic Graph, "The AI Talent Divide", Aug 2026, 17 pp, descriptive, US member data). Covers who is hired into AI roles, not who is screened out; section 5 context only. Local PDF `~/Downloads/The_AI_Talent_Divide_2026.pdf`; public URL to add before publish | Study | add before publish |
| Market | Pew, Oct 22 2026 (Nicole Smith; CPS 2017-19 vs Jan 2023-Jun 2026, O*NET v30.3 exposure score, 480 occupations): per one-point rise in AI exposure, men's employment grew 6.3% and women's 0.2%; in the least-exposed jobs women's growth beat men's. By education: high school or less, men +8.8%, women -9.5%; some college, men +3.6%, women -6%; bachelor's or higher, +0.8% vs +0.7%, neither significant. Pew says association, not proof AI caused it. Covers employment by occupation, not screening; section 5 context. Note: the LinkedIn post that surfaced this says "without a college degree", which is the high-school-or-less row only. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/short-reads/2026/10/22/men-are-experiencing-more-job-growth-than-women-in-ai-exposed-occupations/) |
| Market | Pew, Apr 2023 (ATP, n=11,004, fieldwork Dec 12-18 2022): 71% of US adults oppose AI making a final hiring decision, 7% favor; 61% had heard nothing about AI in hiring; 47% say AI would treat all applicants the same better than humans, 15% worse; 70% of women vs 61% of men would not apply to an employer that uses AI in hiring. Dated, pre-dates the cohort. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/internet/2023/04/20/ai-in-hiring-and-evaluating-workers-what-americans-think/) |
| Market | Pew, Jul 2023 (O*NET v27.3, CPS 2022): 21% of women vs 17% of men work in the most AI-exposed jobs; exposure, not predicted loss or gain. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/social-trends/2023/07/26/which-u-s-workers-are-more-exposed-to-ai-on-their-jobs/) |
| Regulation | NYC LL 144: 18 of 391 employers posted bias audits | Record | [arXiv](https://arxiv.org/abs/2406.01399) |
| Regulation | California ADS rules (effective 2025-10-01), Illinois HB 3773 (effective 2026-01-01), Colorado SB 26-189 (signed 2026-05-14, effective 2027-01-01, employment coverage unverified), EU AI Act (high-risk obligations reportedly 2027-12-02), EEOC removed its AI guidance 2025-01-27 | Reported | [Paul Hastings](https://www.paulhastings.com/insights/client-alerts/new-california-regulations-on-employers-use-of-ai-to-make-decisions-go-into-effect-oct-1-2025), [Duane Morris](https://www.duanemorris.com/alerts/illinois_enacts_artificial_intelligence_law_focused_employment_practices_0824.html), [McDermott](https://www.mcdermottlaw.com/insights/colorado-ai-law-in-flux-comprehensive-replacement-bill-signed-after-federal-court-blocks-predecessors-enforcement/), [Jones Walker](https://www.joneswalker.com/en/insights/blogs/ai-law-blog/yes-august-2-still-matters-the-eu-approved-a-high-risk-ai-delay-but-most-trans.html?id=102nbon), [K&L Gates](https://www.klgates.com/The-Changing-Landscape-of-AI-Federal-Guidance-for-Employers-Reverses-Course-with-New-Administration-1-31-2025) |
| Mechanism | Algorithmic monoculture: shared data raised outcome homogenization (Bommasani, mixed for shared models); shared algorithms lower overall decision quality (Kleinberg and Raghavan). Neither paper shows one person rejected everywhere | Theory | [Bommasani et al.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/17a234c91f746d9625a75cf8a8731ee2-Abstract.html), [Kleinberg and Raghavan](https://ar5iv.labs.arxiv.org/html/2101.05853) |
| Mechanism | Age proxies at scale: graduation years, experience totals, stack recency | Theory | [AARP to EEOC](https://www.eeoc.gov/meetings/meeting-january-31-2023-navigating-employment-discrimination-ai-and-automated-systems-new/tinsley-fix) |
| Mechanism | The arms race: applicants automate, employers automate, both lose signal | Theory | eWeek link above |
| Gap | No large peer-reviewed audit isolates graduation-year or experience-length effects in a commercial LLM screener | Stated absence | none |

**Bottom line from the brief:** lab studies show AI screeners prefer some groups over others. No court has found that an AI hiring tool discriminated by age. The one confirmed automated age exclusion was a hard-coded rule.

### Research flags (big moves with no known cause)

Comparison charts: `docs/drafts/ST-162-twice-the-applications/ST-162-charts/` (local, gitignored; `index.html` previews all six). Each flag below is a question, not a finding. Hypotheses are unverified until the check is run.

| ID | Move | What is known | Hypotheses (unverified) | Check |
|---|---|---|---|---|
| R1 | Applications per month 10.1 (25-26) to 20.0 (Jun-Oct 26), then 22 a month in Jun-Aug to 12 in Sep and 21 in Oct (to the 30th). The total is lower (100 vs 111) only because the window is 5.0 months, not 11. | Captures per month fell 425 (Aug), 128 (Sep), 56 (Oct to the 20th) (`monthly`). 688 of 759 closed rows closed before an application (`closes`). The Sourced backlog fell 46 to 16 between 09-29 and 10-12 (10-12 handoff). | Automation lowered the cost of an application. The August intake was a bulk pass that has been worked through. Rule changes in Sep and Oct (Ecom and DAM re-rank 10-02, Director tier cut 10-18, scope widened to PM roles) removed candidates before the apply stage. Bex's own question: did the volume overwhelm the pipeline? | Compare captures, pre-application closes and applications by month from `findings.json`; check whether the intake method changed when captures fell; time per package is not recorded anywhere. |
| R2 | Cold-only screen rate 6.7% to 3.6% | 7 of 105 vs 3 of 83; p=0.52, so the drop is inside chance. | A real portal effect, a different role mix, or nothing. | Wait for the 11-02 maturity read; add the `ATS` column; compare by Focus. Do not state the drop as a finding without that. |
| R3 | Closed with no answer 63% (25-26) vs 34% (Jun-Oct 26) | 70 of 111 (63%) vs 15 of 100 (15%) under the new clock rule (60 days since applying, decided 2026-10-30). 33 Jun-Oct 26 applications are still open; 9 reach day 60 in November and 24 in December. | The two cohorts defined "no answer" differently: 25-26 by hand, Jun-Oct 26 by a ghost sweep that closed 14 rows 18 to 47 days after applying. The clock rule removes that. | Recompute 25-26 under the clock rule if its dates allow; otherwise do not compare no-answer rates. First meaningful cut for Sep and Oct applies is 11-30. |
| R4 | Recruiter inbound rows per week: 9 at the mid-August peak, 0 to 3 since | Headline decision A has been open 43 days (10-12 handoff). The week of 10-05 counts rows, not threads. | Market change, an unchanged headline, one seat inflating August, or a change in how rows are captured. | Count distinct seats, not touches, by week; check the mailbox against the tracker. |

### Data reconciliation (resolve before drafting)

1. **Inbound rate (resolved):** the original post's 67% is 8 of 12 recruiter inbound; its 69% is 11 of 16 warm (inbound plus referral). Both are in the post; the handoff's "69% of warm touches" was the second one, not an error.
2. **"Pure portal" denominator (resolved 2026-10-18, re-cut 2026-10-22):** cold-only is the like-for-like with the original post's definition (no prior relationship, referrals excluded): 3 of 83 (3.6%). All non-recruiter routes: 5 of 88 (5.7%), reported separately. The handoff's earlier "2 of 81" matches no channel split; do not cite it. [ST-173](../shipped/ST-173-article-five-minute-call-that-was-an-application.md) and "Bait and Switch, or Just a Bug" state the 10-12 figures (92 applications, 2 in 78, 3 in 82). Those are accurate as of 10-12 and now lag this cut.
3. **Cohort comparability:** different windows, market and role mix; scope widened to PM and web platform roles in October. Say so in the post.
4. **Her age:** the resume strips date proxies, the site does not (28-year career in the original). Bex's call whether the post states it.
5. **"10 of 10" was a numerator problem (found 2026-10-22):** `channel["Recruiter Inbound"]` counts screens across all rows in the channel, including two (JD-0033, JD-0050) where Bex never submitted an application. Among recruiter-first applications the rate is 9 of 11 at the 10-20 cut. The "10 of 10" form appears in the 10-12 handoffs, the ST-173 shipped doc (lines 21 and 211), two red-pen records (`docs/reviews/red-pen/2026-10-16-five-minute-call-that-was-an-application.md`, `2026-10-17-bait-and-switch-or-just-a-bug.md`) and the old outline row 2. Neither live article body states it (read from Sanity 2026-10-22). Use "11 recruiter-first roles reached a screen" or "9 of 11 recruiter-first applications", never "10 of 10" or "11 of 11".
6. **Recruiter screen is not a client screen (resolved 2026-11-08):** the Patagonia row's screen (10-15) was with the staffing recruiter, not the end client; the client hiring-manager round was held 2026-11-04 and the row is now a loop (`LOOPS["JD-0844"]`). The post counts a staffing-recruiter screen as a recruiter screen, the same way the original post did, and says so.
7. **One screen is past the cut:** the DXP analyst screen (2026-10-21) is one day after `END`. Counted because the application predates the cut; flag it in the figures note.

## Themes for the rewrite (added 2026-11-01, Bex)

Bex's framing, paraphrased: "I still don't have a job. The data pipeline can only tell us so much." The article concentrates on what the data can say, then brings in outside-force theories from the research links above, then adds Bex's own observations, labelled as observation. Nothing here is copy. Nothing here changes the approved headline or outline until Bex says so.

### Theme 1. What the data can say (supported, keep)

| # | Statement | Evidence in this doc |
|---|---|---|
| D1 | Applications doubled (10.1 to 20.0 a month); cold-only screens per month stayed flat (0.64 to 0.60). | Per-month table |
| D2 | The extra screens were warm (recruiter or referral). Warm screens per month 1.0 to 2.2. | Per-month table |
| D3 | Intake grew about 10x (854 JDs captured); applications did not follow, because gates and hours cap them. | System epochs table |
| D4 | Rejections rose with volume (4.2 to 10.4 a month). | Per-month table |
| D5 | No offer came from an application in either window. | Story point 5 |
| D6 | The resume change did not move the cold rate; the 6.7% to 3.6% drop is inside chance (p=0.52). Say "stayed flat". | R2 |

The limit to state in the post: small numbers (7 then 3 cold screens), different windows, different role mix. The data cannot say why a portal said no.

### Theme 2. Outside-force theories (cite the research table, label each)

Each of these is a Theory or Reported row in the research table, not a finding about Bex. Use the label in the sentence.

| # | Theory | Research row | Label |
|---|---|---|---|
| O1 | Volume arms race: applicants automate, employers automate, both lose signal. | LinkedIn about 11,000 applications a minute; arms race row | Reported, Theory |
| O2 | Exact-match filtering screens out qualified people. | Hidden Workers, HBS and Accenture | Reported, employer survey |
| O3 | Postings that never fill dilute every cold apply. | Greenhouse about 1 in 5 postings | Reported |
| O4 | Shared screening tools produce the same rejection everywhere. | Algorithmic monoculture | Theory |
| O5 | Tech cuts up 54% and information-sector openings roughly halved, so more people compete for fewer seats. | Market timeline, Challenger and JOLTS | Record and Estimate; applicants per posting is not measured |
| O6 | Time unemployed is longer for 55 to 64. | BLS weeks unemployed | Record, attributes nothing to AI |

### Theme 3. Bias, and what the resume was built to do

- **What is verified:** the resume already strips the classic age proxies: no dates before 2017, no graduation years, experience capped at "15+ years" (`HANDOFF_2026-10-12_article.md` §4, marked Certain there). This was a deliberate structure choice made before the Jun-Oct 26 cohort.
- **What the public record says:** one confirmed automated age exclusion (iTutorGroup, a hard-coded rule); Mobley v. Workday and the other cases are allegations; lab studies show model preferences by name, gender and age cues. No court has found an AI tool discriminated by age.
- **What the data cannot say:** whether any portal read age, which portals used AI, and whether stripping proxies helped. There is no before-and-after for it. The cold rate did not rise after the structure change, which fits "it did not help" and also fits "it helped and the market got worse".
- **Age (decided 2026-11-01):** the post says "over 50". The site and the career length on the original post are not stripped, and the original says 28 years while the real figure from a 1992 start is 34. Fix or footnote before publish.
- **Possible counter-point to raise honestly:** a "15+ years" cap and missing dates can themselves read as a gap to a human screener. No data either way.

### Theme 4. Bex's own observations (first person, labelled as observation, not finding)

| ID | Observation (Bex) | Data in hand | Status |
|---|---|---|---|
| U1 | PM roles now expect to be more technical because of AI. Bex is technical, not an engineer. | Partial. The tracker records gates that closed rows on stated hands-on engineering requirements (charter v4.43, 2026-10-29) and on AI-as-the-product titles. Rows closed by those gates could be counted by month. | Pull the count, or present as observation only |
| U2 | PMs are expected to be "builders"; the phrase has appeared again and again in the last six months. | Unknown. Only checkable if the archived JD text for the 854 captured rows is searchable by month. | Check whether JD text is stored; if not, cut the "again and again" and keep the phrase as one anecdote |
| U3 | The portfolio relaunch was well timed for that shift. | None. No measure links the site to a screen or a reply. | Hunch. Keep as a short aside or cut |
| U4 | Roles now ask for specific platform experience (for example Salsify) rather than wider PIM or data experience. | Partial. The single-platform implementation remit gate (2026-09-01) closes rows on this basis. Counting JDs that name one vendor in the requirements would give a number for Jun-Oct 26. | Pull the count |
| U5 | In earlier years, being able to learn the platform was enough. Bex's own hires: Critical Path (prove HTML, CSS, JS and Unix; learned the rest), Lyris (an email-marketing company, not generic webmail; same pattern), TWE (first B2C and ecommerce role; had managed a small web dev team and supported web), then PM for CMS (taken on green except general content management in Joomla, Hot Banana and eWinery). | Her own career record. Checkable against her resume and past offer or JD records, if kept. No market data. | **Kept (decided 2026-11-01) as a personal-experience trend**, stated as hers. Verify each role's requirements against what the resume says before publish |
| U6 | Until this past year she cross-referenced specific platforms (Sitecore or AEM versus CMS in general); now each role names a particular tool (GraphQL versus APIs and data management in general). | "Now" half: countable from Jun-Oct 26 JDs if text is stored. "Before" half: her own roles (U5), not market data. | Frame as her trend, not the market's. The count, if it exists, backs only the "now" half |

### Assumptions and ideas without good backing (decide: research, keep as observation, or cut)

| # | Item | Why it is unbacked | Suggested call |
|---|---|---|---|
| X1 | "PMs are expected to be builders" is a market-wide shift. | One person's JD feed, no external source in the research table. | **Decided 2026-11-01: research, then decide.** Find one or two postings-trend sources; count the phrase in captured JD text by month if stored |
| X2 | The shift is caused by AI. | Plausible, no source. Could equally be a downturn effect (employers asking for more per seat). | **Decided 2026-11-01: research, then decide.** If no source, drop the cause and describe the shift only |
| X3 | Platform-specific demand has risen compared with earlier years. | No market data for earlier years. Bex's own role history (U5) is the evidence. | **Decided 2026-11-01: do not cut.** Keep as a personal-experience trend backed by her role history; do not state it as a market finding |
| X4 | The relaunch timing was a good instinct. | No outcome measure. | **Decided 2026-11-01: keep as a one-line aside**, labelled instinct |
| X5 | The resume's proxy-stripping helped, or hurt. | No before-and-after. | **Decided 2026-11-01:** say it was done and that its effect is unknown |
| X6 | Older-worker framing (O6) applies to Bex. | Depends on the age decision; BLS row attributes nothing to AI. | **Decided 2026-11-01:** age decision made ("over 50"), so the older-worker framing is unblocked. Use BLS as Record, attributing nothing to AI |
| X7 | Technical-expectation shift ties to the "AI as product" and "hands-on engineering" gates showing up more. | Gate dates are in the charter, but a gate being added is not the same as more JDs matching it. | Count matches by month before using |
| X8 | A4 from Perspective A: most of Bex's time went to packaging and following up. | No hours logged (already listed as A4). | **Decided 2026-11-01:** drop the claim; no time log |

### What this changes in the outline (proposed, not applied)

- Row 3 ("What is behind the door") and row 5 ("It is not just me") merge into Theme 2, with every item labelled.
- A new short section between rows 5 and 6, working title "What the postings are asking for", carries Theme 4 (U1, U2, U4) only if the counts exist. If they do not, it shrinks to one labelled paragraph.
- Row 4 ("What my data cannot say") is where Theme 3's limits and the X-items that stay land.
- The approved headline still fits Theme 1. The closer ("I improved the part I controlled, and the part I didn't control decided") needs a pass, since the new framing leans on "the data can only tell us so much".
- Word budget: the 1,600 target is already tight with eight sections. Adding a section means cutting evidence-tour detail first, per the existing cut order.

## Scope

- [ ] **1d. Themes and unbacked claims (added 2026-11-01):** Bex decides, for each X-item above, research, keep as observation or cut; run the JD counts for U1, U2, U4 and X7 if archived JD text allows; open the sources for X1 and X2 if Bex chooses research (layer: editorial)
- [ ] **1c. Two perspectives:** confirm the pipeline account (Perspective A) is accurate in Bex's words, keep the three confirmed ties T1 to T3 and the context items (reviewed 2026-10-30), and add three tracker fields (posting age at apply, applicant count at apply, ATS) so A3, the competition context and the ghost-posting test can run on new rows (layer: editorial; the tracker change belongs to resume-factory)
- [x] **1b. Per-month and epoch tables:** re-run both tables from `findings.json` and the tracker at the final cut date, settle which tracker changes count as big, and chart 25-26 against Jun-Nov 26 per month (layer: editorial). Done 2026-11-08 at the 11-05 cut; epoch boundaries kept as proposed.
- [x] **1. Data check:** re-run the source commands for every row in the data draft, record the command beside each figure, settle the four reconciliation items (layer: editorial). Done 2026-11-08: final-cut table carries the command and key per row; reconciliation items 1, 2, 5, 6 and 7 resolved, 3 and 4 are stated in the post.
- [ ] **2. Evidence check:** open each external link in the research brief, confirm it resolves and says what the brief claims, drop any that fail (layer: editorial)
- [ ] **3. Discovery:** taxonomy pre-flight and related-content check per `docs/write-pipeline-prompt.md` §1 (article target: 1 to 2 categories, 3 to 6 tags, Bex Head as author, tool `claude-code` for attribution) (layer: process)
- [ ] **4. Outline approval:** Bex approves or edits the outline above and settles the open decisions (layer: process). Outline and headline approved 2026-10-30; the four open decisions below are still open.
- [x] **5. Draft created in Sanity** via `create_documents` only, with `aiDisclosure` set (layer: content). Done 2026-11-08: `drafts.c1415fdb-baf2-4561-85f0-745ba125cc31`, slug `twice-the-applications-same-number-of-cold-calls`, about 2,250 words including three `tableBlock`s and the labelled evidence table; 14 `citations[]`; related: the original post and "Bait and Switch"; `aiDisclosure` set. Bex to rework language, narrative and drama in Studio (her stated intent 2026-10-30). Not published.
- [ ] **6. Compliance gate** passed (`docs/write-pipeline-prompt.md` §4, zero em dashes, publish gate on the final text) (layer: process)
- [ ] **8. Two missing gates, one pipeline** (handed off from ST-173, which cut it to one paragraph): the RSVP email checked no session before the send, the testjob email checked no listing before the send; argue them as one pipeline failure, link the published ST-173 article (`/articles/bait-and-switch-or-just-a-bug`) and use its screening-call versus application stage table rather than rebuilding it (layer: editorial)
- [ ] **7. Human review and publish decision**, cross-links to SUG-234 added once both exist (layer: process; Human-Publishes Rule applies)

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 1 | Verified data table and evidence list, discovery notes | 1, 1d, 2, 3 |
| 2 | Approved outline | 4, 8 |
| 3 | Sanity draft, compliance gate passed | 5, 6 |
| 4 | Human review, publish decision (not before the 10-30 headline read) | 7 |

## Open decisions (Bex, at activation)

- ~~Name her age, say "over 50", or leave it to the evidence.~~ **Decided 2026-11-01 (Bex): say "over 50".** Career length: first tech job 1992 (Data Processing Goddess, then accounting at Wired Magazine because she could use a computer), so 34 years at 2026, not the 28 in the original post. Reconcile before publish (Content Write Gate applies to fixing the original).
- Publish order relative to SUG-234.
- ~~Publish now, or after the JD-0813 outcome and the 10-30 headline read.~~ Resolved 2026-11-08: Bex asked for the final cut at 11-05, so the draft is written from that cut.
- **One article or two (raised by Bex 2026-11-01, decide later).** Article 1: "I automated my pipeline, here are the numbers" (Perspective A, Theme 1, the per-month and epoch tables). Article 2: "why don't I have a job?" (Perspective B, Themes 2 to 4, the unbacked-claims list, bias credits). Pointers for the decision: the 1,600-word target is already tight with eight sections plus the new Themes section; a split needs a second issue via `/new-epic` (one epic is one issue, no sub-issues); the 2026-12-01 kill criterion would apply to each; the approved headline fits article 1 best.
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
