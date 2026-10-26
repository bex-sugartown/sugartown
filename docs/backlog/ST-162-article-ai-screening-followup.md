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

- **Original post:** [I Treated My Job Search Like a Data Pipeline](https://sugartown.io/articles/job-search-funnel-data-postmortem). Published 2026-05-20 (Sanity `publishedAt`; call it "the earlier post", not "the June post"). Cohort Jul 2025 to May 2026, about 111 applications, 19 recruiter screens, 5 panels, 1 offer. Four chapters: CH1 Electric Resumes (marked Solved), CH2 Six Out of 100 (cold apply 6.7% vs an 8% benchmark), CH3 All or Nothing (recruiter inbound works), CH4 These Should Have Been a Shoe-In (panels stall). Closes with a six-item plan.
- **New data:** Resume Factory era, 2026-06-01 to 2026-10-20, re-cut 2026-10-22 (10-12 outputs frozen in `_frozen_2026-10-12/`). Source: `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/findings.json` and `HANDOFF_2026-10-12.md` beside it.
- **Handoffs (internal, outside this repo, fail the publish gate on purpose):**
  - `resume-factory/data/content/drafts/ai-screening/HANDOFF_2026-10-12_article.md` (angle, shape, decisions)
  - `resume-factory/data/content/drafts/ai-screening/RESEARCH-BRIEF_AI-hiring-bias_2026-10-12.md` (every external claim, labelled Record / Reported / Theory)
- **Sibling:** [SUG-234](SUG-234-article-incredible-shrinking-job.md), "The Incredible Shrinking Job". That post is the human door, this one is the portal door. Cross-link both ways. Publish order is undecided (see Open decisions).
- **Teaser:** [ST-173](../shipped/ST-173-article-five-minute-call-that-was-an-application.md), a short separate article that previews this one and publishes first. Tracked on its own; nothing in this epic's scope depends on it.
- **Pre-flight on the original post (read 2026-10-12):** its headline recruiter-inbound figure is **67% (n=12)**; the handoff cites "69% of warm touches". Resolve before the "then" column is published (see Data reconciliation).

**No mock and no draft exists.** Nothing is written to Sanity until Bex asks.

## Objective

A published article at `/articles/{slug}`, in Bex's first-person voice, with a thesis and no incident-report arc. Thesis: when a person chooses her first she gets a call almost every time; through a portal she almost never does; whatever sits behind the portal is the filter, and this post does not claim to know what it is. Layers touched: content (one Sanity `article` draft) and process (data check, compliance gate, review). No schema, GROQ, React or CSS changes.

**Angle (decided by Bex 2026-10-12):** "I fixed the resume. The rate went down." The thing she controlled improved; the thing she did not control decided. Honest bias question, no overclaim.

## Outline (proposed, not copy)

Target 1,600 words, long-form band, justified by two data blocks and a sourced evidence tour. Cut order if over: evidence tour detail first, never the thesis or the closer.

| # | Section (working subhead) | Job | Data / evidence |
|---|---|---|---|
| 1 | Cold open | Quote the line that marked CH1 Solved, then the new number | CH1 vs 6.7% cold-only, then 3.6% cold-only (3 of 83) |
| 2 | Two doors | Human door vs portal door, one table or bar | 9 of 11 recruiter-first applications vs 3 of 83 cold-only (reconciliation 5) |
| 3 | What is behind the door | Short, sourced tour; each item labelled allegation / study / theory | Research brief §1 to §3 |
| 4 | What my data cannot say | Resume already strips age proxies; cohorts differ; small n; no vendor proof | Handoff §4 |
| 5 | It is not just me | Duration gap, ghost postings, application volume, Hidden Workers | BLS, Greenhouse, LinkedIn, HBS/Accenture |
| 6 | The human door, briefly | One recruiter carried a seat to a hiring manager and came back with a specific no. Link SUG-234 | Hiring-manager feedback (no names) |
| 7 | What I am changing | Headline recruiters search, warm paths before portals, an ATS field on the tracker | Handoff §5 items A and the ATS proposal |
| 8 | Close | The six-item plan from the original post, scored | Original plan list |

Skim skeleton to test at draft time: title, subheads, first sentence of each section, closer.

## Data draft (publishable figures only)

**Cohort names (decided 2026-10-22; replaces "first post" and "now" as cohort labels).** **25-26** is the original post's cohort: Jul 2025 to May 2026, 11 months, 111 applications. **Jun-Oct 26** is this post's cohort: Jun 1 to Oct 23, 2026, 4.7 months, 101 applications. Use these in every chart, table and sentence. Compare on rates and per-month pace, never on totals, because the windows differ in length. Pre-flight: the original post's By the Numbers kicker reads "Jun '25-May '26" while its body and charts say Jul 2025. Confirm the true start month before "25-26" goes public; fixing the original is a Content Write Gate item.

**Re-cut to 2026-10-23 on 2026-10-24 (latest).** Same source and method, `END = 2026-10-23`; 10-20 outputs frozen in `_frozen_2026-10-20/`. One new screen with a debrief on disk (recruiter screen 10-23, recruiter inbound; hiring-manager round booked 10-29 and not yet held, so it is not a loop). Loops go 6 to 7 for a different reason: Third and Grove round 2 (director of PM, 10-20) had a debrief on disk but was missed in the 10-20 cut. Two new applications. The next check is 10-30. The tables below keep the 10-20 cut for comparison; the **10-23 column** is the current figure. The by-month and weekly tables are not re-cut yet (see the note under each).

| Figure | 10-20 cut | **10-23 cut** | Source (`findings.json` key) |
|---|---:|---:|---|
| Captured / packaged | 810 / 111 | **835 / 114** | `funnel` |
| JDs entering per month, Oct (to the 23rd) | 56 (to the 20th) | **81** | `monthly["2026-10"].captured` |
| Applications | 99 | **101** | `funnel.applied` |
| Screens / loops / offers | 16 / 6 / 0 | **17 / 7 / 0** | `funnel` |
| Applied-to-screen, all channels | 14.1% (14 of 99) | **14.9% (15 of 101)** | `screened_ids` against `applied_ids` |
| Rejected / closed with no answer / still open | 50 / 21 / 28 | **50 / 22 / 29** | `outcomes` |
| Recruiter-first applications that reached a screen | 9 of 11 | **10 of 12** | `channel["Recruiter Inbound"]`, minus the 2 screens with no application |
| Referral applications to screen | 2 of 5 | **2 of 5** | `channel["Referral"]` |
| Cold-only applications to screen | 3 of 83 (3.6%) | **3 of 84 (3.6%)** | Job Alert 31 + Board 28 + Cold 23 + Untagged 2 = 84; screened Board 2, Cold 1 |
| All non-recruiter applications to screen | 5 of 88 (5.7%) | **5 of 89 (5.6%)** | cold-only 84 plus Referral 5 |

Note: Board 29 to 28 and Cold 22 to 23 between cuts means one row changed channel; confirm which before publishing the cold-only denominator. Jun-Oct 26 is now Jun 1 to Oct 23, 101 applications, 4.7 months.

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

10-23 cut, Oct only: Apps 16 (was 14), Recr 3 (was 2). Cold, Inbnd, Refrl, Denied and Ghost for Oct are not re-cut; Inbnd is 2 if the new row is the only addition.
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

| | 25-26 (Jul 2025 to May 2026) | Jun-Oct 26 (Jun 1 to Oct 23, 2026) |
|---|---|---|
| Applications | 111 | 101 |
| Cold-only screen rate (no prior relationship) | 6.7% (7 of 105) | 3.6% (3 of 83) |
| Warm (recruiter inbound plus referral) screen rate | 69% (11 of 16) | 69% (11 of 16: 9 of 11 recruiter-first, 2 of 5 referral; see reconciliation 5) |
| Recruiter inbound alone | 67% (8 of 12) | 9 of 11 applications reached a screen |
| Referral alone | 75% (3 of 4) | 2 of 5 |
| Offers | 1 | 0 |

The warm rate (11 of 16, 69%) equals the original post's to the percent. With n=16 on each side that is a coincidence, not stability. The change is inside it: referral fell from 3 of 4 to 2 of 5.

## Research data (outlined and linked)

Full text, every link and the Record / Reported / Theory labels: `resume-factory/data/content/drafts/ai-screening/RESEARCH-BRIEF_AI-hiring-bias_2026-10-12.md` (internal, outside this repo). Links below are copied from it. Scope item 2 re-opens each one before publish.

| Group | Claim | Label | Link |
|---|---|---|---|
| Litigation | iTutorGroup: software auto-rejected women 55+ and men 60+, 200+ applicants, EEOC settlement 2023 (hard-coded rule, not ML; the dollar figure trips the publish gate) | Record | [EEOC](https://www.eeoc.gov/newsroom/itutorgroup-pay-365000-settle-eeoc-discriminatory-hiring-suit) |
| Litigation | Mobley v. Workday: age collective certified May 2025, expanded to HiredScore Jul 2025, motion to dismiss largely denied Jun 2026, in discovery | Allegation | [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/05/federal-court-allows-collective-action-lawsuit-over-alleged), [AI Governance for HR](https://www.aigovernanceforhr.com/p/the-mobley-v-workday-case-didnt-end), [Wiggins Childs](https://www.wigginschilds.com/news/workday-case-update/), [RPJ](https://rpjlaw.com/recent-developments-in-mobley-v-workday-california-court-allows-key-ai-hiring-bias-claims-to-move-forward/) |
| Litigation | Harper v. Sirius XM (iCIMS): summary judgment for the employer, reported 2026-09-30; docket not checked | Allegation, outcome reported | [HR Dive](https://www.hrdive.com/news/sirius-xm-beats-allegations-of-ai-fueled-racial-bias/832115/) |
| Litigation | Kistler v. Eightfold AI: FCRA class action over undisclosed profiling, pleading stage | Allegation | [Akin](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/ai-hiring-platform-faces-fcra-class-action-over-data-use-or-kistler-et-al-v-eightfold-ai-inc) |
| Studies | Name-based race and gender bias in LLM resume retrievers (UW, AIES 2024); age not tested | Study | [AIES](https://ojs.aaai.org/index.php/AIES/article/view/31748) |
| Studies | ChatGPT wrote women's resumes as younger and rated older men highest (*Nature*, Oct 2025) | Study | [Stanford News](https://news.stanford.edu/stories/2025/10/ai-llms-age-bias-older-working-women-research) |
| Studies | Age cues cut human and model invitations, 75.3% young vs 53.1% old (UNC, FLAIRS); 12 base CVs | Study, small n | [FLAIRS](https://journals.flvc.org/FLAIRS/article/download/133236/137923/247012) |
| Studies | LLMs prefer LLM-written text (*PNAS*, Aug 2025); prefer their own resumes (AIES 2025) | Study | [PNAS](https://ideas.repec.org/a/nas/journl/v122y2025pe2415697122.html), [arXiv](https://arxiv.org/abs/2509.00462) |
| Studies | Bloomberg: GPT-3.5 ranked identical resumes 1,000 times, name-based disparities | Reported | [Bloomberg](https://prod.cm.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/) |
| Market | Average weeks unemployed, 55-64 vs all 16+: 34.9 vs 25.4 (BLS, Sept 2026); the long-term share is about equal across ages | Record, attributes nothing to AI | [BLS](https://www.bls.gov/web/empsit/cpseea36.htm), [AARP](https://www.aarp.org/pri/topics/work-finances-retirement/employers-workforce/employment-data-digest/) |
| Market | "Hidden Workers": 88% of employers say qualified candidates are screened out for not matching exactly (HBS and Accenture, 2021) | Reported, employer survey | [HR Dive](https://www.hrdive.com/news/report-applicant-tracking-systems-may-exclude-whole-segments-of-candidates/606614/) |
| Market | LinkedIn at about 11,000 applications a minute, up 45% in a year (2025) | Reported | [eWeek](https://www.eweek.com/news/ai-job-applications-linkedin/) |
| Market | About 1 in 5 postings never filled (Greenhouse data) | Reported | [Korn Ferry](https://www.kornferry.com/insights/this-week-in-leadership/ghost-job-posts-a-mounting-frustration) |
| Market | 21% of employers let AI reject at every stage without human review; 47% of users saw age bias (Resume Builder, n=948, self-report) | Reported | [Resume Builder](https://resumebuilder.com/7-in-10-companies-will-use-ai-in-the-hiring-process-in-2025-despite-most-saying-its-biased/) |
| Market | Women 26% of new hires in AI roles vs 50% in non-AI; Millennials 60% of Head of AI hires (LinkedIn Economic Graph, "The AI Talent Divide", Aug 2026, 17 pp, descriptive, US member data). Covers who is hired into AI roles, not who is screened out; section 5 context only. Local PDF `~/Downloads/The_AI_Talent_Divide_2026.pdf`; public URL to add before publish | Study | add before publish |
| Market | Pew, Oct 22 2026 (Nicole Smith; CPS 2017-19 vs Jan 2023-Jun 2026, O*NET v30.3 exposure score, 480 occupations): per one-point rise in AI exposure, men's employment grew 6.3% and women's 0.2%; in the least-exposed jobs women's growth beat men's. By education: high school or less, men +8.8%, women -9.5%; some college, men +3.6%, women -6%; bachelor's or higher, +0.8% vs +0.7%, neither significant. Pew says association, not proof AI caused it. Covers employment by occupation, not screening; section 5 context. Note: the LinkedIn post that surfaced this says "without a college degree", which is the high-school-or-less row only. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/short-reads/2026/10/22/men-are-experiencing-more-job-growth-than-women-in-ai-exposed-occupations/) |
| Market | Pew, Apr 2023 (ATP, n=11,004, fieldwork Dec 12-18 2022): 71% of US adults oppose AI making a final hiring decision, 7% favor; 61% had heard nothing about AI in hiring; 47% say AI would treat all applicants the same better than humans, 15% worse; 70% of women vs 61% of men would not apply to an employer that uses AI in hiring. Dated, pre-dates the cohort. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/internet/2023/04/20/ai-in-hiring-and-evaluating-workers-what-americans-think/) |
| Market | Pew, Jul 2023 (O*NET v27.3, CPS 2022): 21% of women vs 17% of men work in the most AI-exposed jobs; exposure, not predicted loss or gain. Read from the primary page 2026-10-24 | Study | [Pew](https://www.pewresearch.org/social-trends/2023/07/26/which-u-s-workers-are-more-exposed-to-ai-on-their-jobs/) |
| Regulation | NYC LL 144: 18 of 391 employers posted bias audits | Record | [arXiv](https://arxiv.org/abs/2406.01399) |
| Regulation | California ADS rules (effective 2025-10-01), Illinois HB 3773 (effective 2026-01-01), Colorado SB 26-189 (signed 2026-05-14, effective 2027-01-01, employment coverage unverified), EU AI Act (high-risk obligations reportedly 2027-12-02), EEOC removed its AI guidance 2025-01-27 | Reported | [Paul Hastings](https://www.paulhastings.com/insights/client-alerts/new-california-regulations-on-employers-use-of-ai-to-make-decisions-go-into-effect-oct-1-2025), [Duane Morris](https://www.duanemorris.com/alerts/illinois_enacts_artificial_intelligence_law_focused_employment_practices_0824.html), [McDermott](https://www.mcdermottlaw.com/insights/colorado-ai-law-in-flux-comprehensive-replacement-bill-signed-after-federal-court-blocks-predecessors-enforcement/), [Jones Walker](https://www.joneswalker.com/en/insights/blogs/ai-law-blog/yes-august-2-still-matters-the-eu-approved-a-high-risk-ai-delay-but-most-trans.html?id=102nbon), [K&L Gates](https://www.klgates.com/The-Changing-Landscape-of-AI-Federal-Guidance-for-Employers-Reverses-Course-with-New-Administration-1-31-2025) |
| Mechanism | Algorithmic monoculture: the same model or vendor says no to the same person everywhere | Theory | [Bommasani et al.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/17a234c91f746d9625a75cf8a8731ee2-Abstract.html), [Kleinberg and Raghavan](https://ar5iv.labs.arxiv.org/html/2101.05853) |
| Mechanism | Age proxies at scale: graduation years, experience totals, stack recency | Theory | [AARP to EEOC](https://www.eeoc.gov/meetings/meeting-january-31-2023-navigating-employment-discrimination-ai-and-automated-systems-new/tinsley-fix) |
| Mechanism | The arms race: applicants automate, employers automate, both lose signal | Theory | eWeek link above |
| Gap | No large peer-reviewed audit isolates graduation-year or experience-length effects in a commercial LLM screener | Stated absence | none |

**Bottom line from the brief:** lab studies show AI screeners prefer some groups over others. No court has found that an AI hiring tool discriminated by age. The one confirmed automated age exclusion was a hard-coded rule.

### Research flags (big moves with no known cause)

Comparison charts: `docs/drafts/ST-162-charts/` (local, gitignored; `index.html` previews all six). Each flag below is a question, not a finding. Hypotheses are unverified until the check is run.

| ID | Move | What is known | Hypotheses (unverified) | Check |
|---|---|---|---|---|
| R1 | Applications per month 10.1 (25-26) to 21.5 (Jun-Oct 26), then 24 a month in Jun-Aug to 14 in Sep and 16 in Oct (to the 23rd). The total is lower (101 vs 111) only because the window is 4.7 months, not 11. | Captures per month fell 425 (Aug), 128 (Sep), 56 (Oct to the 20th) (`monthly`). 688 of 759 closed rows closed before an application (`closes`). The Sourced backlog fell 46 to 16 between 09-29 and 10-12 (10-12 handoff). | Automation lowered the cost of an application. The August intake was a bulk pass that has been worked through. Rule changes in Sep and Oct (Ecom and DAM re-rank 10-02, Director tier cut 10-18, scope widened to PM roles) removed candidates before the apply stage. Bex's own question: did the volume overwhelm the pipeline? | Compare captures, pre-application closes and applications by month from `findings.json`; check whether the intake method changed when captures fell; time per package is not recorded anywhere. |
| R2 | Cold-only screen rate 6.7% to 3.6% | 7 of 105 vs 3 of 83; p=0.52, so the drop is inside chance. | A real portal effect, a different role mix, or nothing. | Wait for the 11-02 maturity read; add the `ATS` column; compare by Focus. Do not state the drop as a finding without that. |
| R3 | Closed with no answer 63% (25-26) vs 22% (Jun-Oct 26) | 70 of 111 vs 22 of 101. 29 Jun-Oct 26 applications are still open. | The two cohorts define "no answer" differently. Sep and Oct rows have not had time to go silent. A ghost sweep script appeared on 10-04. | Recompute the 25-26 definition on the new cohort; compare Jun-Aug applications only, which have had time to resolve. |
| R4 | Recruiter inbound rows per week: 9 at the mid-August peak, 0 to 3 since | Headline decision A has been open 43 days (10-12 handoff). The week of 10-05 counts rows, not threads. | Market change, an unchanged headline, one seat inflating August, or a change in how rows are captured. | Count distinct seats, not touches, by week; check the mailbox against the tracker. |

### Data reconciliation (resolve before drafting)

1. **Inbound rate (resolved):** the original post's 67% is 8 of 12 recruiter inbound; its 69% is 11 of 16 warm (inbound plus referral). Both are in the post; the handoff's "69% of warm touches" was the second one, not an error.
2. **"Pure portal" denominator (resolved 2026-10-18, re-cut 2026-10-22):** cold-only is the like-for-like with the original post's definition (no prior relationship, referrals excluded): 3 of 83 (3.6%). All non-recruiter routes: 5 of 88 (5.7%), reported separately. The handoff's earlier "2 of 81" matches no channel split; do not cite it. [ST-173](../shipped/ST-173-article-five-minute-call-that-was-an-application.md) and "Bait and Switch, or Just a Bug" state the 10-12 figures (92 applications, 2 in 78, 3 in 82). Those are accurate as of 10-12 and now lag this cut.
3. **Cohort comparability:** different windows, market and role mix; scope widened to PM and web platform roles in October. Say so in the post.
4. **Her age:** the resume strips date proxies, the site does not (28-year career in the original). Bex's call whether the post states it.
5. **"10 of 10" was a numerator problem (found 2026-10-22):** `channel["Recruiter Inbound"]` counts screens across all rows in the channel, including two (JD-0033, JD-0050) where Bex never submitted an application. Among recruiter-first applications the rate is 9 of 11 at the 10-20 cut. The "10 of 10" form appears in the 10-12 handoffs, the ST-173 shipped doc (lines 21 and 211), two red-pen records (`docs/reviews/red-pen/2026-10-16-five-minute-call-that-was-an-application.md`, `2026-10-17-bait-and-switch-or-just-a-bug.md`) and the old outline row 2. Neither live article body states it (read from Sanity 2026-10-22). Use "11 recruiter-first roles reached a screen" or "9 of 11 recruiter-first applications", never "10 of 10" or "11 of 11".
6. **Recruiter screen is not a client screen:** the Patagonia row's screen was with the staffing recruiter, not the end client, and the manager meeting is still pending. The first post's definition of "recruiter screen" should be applied the same way; say which in the post.
7. **One screen is past the cut:** the DXP analyst screen (2026-10-21) is one day after `END`. Counted because the application predates the cut; flag it in the figures note.

## Scope

- [ ] **1. Data check:** re-run the source commands for every row in the data draft, record the command beside each figure, settle the four reconciliation items (layer: editorial)
- [ ] **2. Evidence check:** open each external link in the research brief, confirm it resolves and says what the brief claims, drop any that fail (layer: editorial)
- [ ] **3. Discovery:** taxonomy pre-flight and related-content check per `docs/write-pipeline-prompt.md` §1 (article target: 1 to 2 categories, 3 to 6 tags, Bex Head as author, tool `claude-code` for attribution) (layer: process)
- [ ] **4. Outline approval:** Bex approves or edits the outline above and settles the open decisions (layer: process)
- [ ] **5. Draft created in Sanity** via `create_documents` only, with `aiDisclosure` set (layer: content)
- [ ] **6. Compliance gate** passed (`docs/write-pipeline-prompt.md` §4, zero em dashes, publish gate on the final text) (layer: process)
- [ ] **8. Two missing gates, one pipeline** (handed off from ST-173, which cut it to one paragraph): the RSVP email checked no session before the send, the testjob email checked no listing before the send; argue them as one pipeline failure, link the published ST-173 article (`/articles/bait-and-switch-or-just-a-bug`) and use its screening-call versus application stage table rather than rebuilding it (layer: editorial)
- [ ] **7. Human review and publish decision**, cross-links to SUG-234 added once both exist (layer: process; Human-Publishes Rule applies)

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 1 | Verified data table and evidence list, discovery notes | 1, 2, 3 |
| 2 | Approved outline | 4, 8 |
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
