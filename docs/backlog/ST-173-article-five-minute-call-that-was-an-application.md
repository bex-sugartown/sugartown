---
**Epic:** ST-173: Article: A Five-Minute Call That Was an Application
**Issue:** [#173](https://github.com/bex-sugartown/sugartown/issues/173)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out: draft, review and publish decision as one unit
**Visual:** no (existing table block only)
---

# ST-173: Article: A Five-Minute Call That Was an Application

A short article, adapted from Bex's LinkedIn post, about a recruiter invite whose RSVP page showed no open sessions. It previews the follow-up in [ST-162](ST-162-article-ai-screening-followup.md) and publishes before it. It is a separate piece with its own schedule.

## Model & Mode

Plain `/model sonnet`. Editorial epic, no architectural ambiguity.

## Background

- **Source:** the LinkedIn post and screenshots in `resume-factory/data/content/drafts/linkedin-ziprecruiter/` (internal, outside this repo).
- **Related, not merged:** ST-162 is the data follow-up to "I Treated My Job Search Like a Data Pipeline" and waits for the 10-30 headline read. This piece does not wait for it. Both use the same cohort figures (92 applications, 10 of 10 recruiter-first, 3 of 82 other).
- **Handoff 2026-10-15:** `resume-factory/data/content/drafts/linkedin-ziprecruiter/HANDOFF_2026-10-15_ST-173-Testjob-and-Post-Final.md` (internal, outside this repo) added the Oct 14 testjob email as a second example, and aligned the funnel bullets with the final LinkedIn post (three bullets, no closing question).
- **Origin:** drafted inside ST-162 as Scope 8 on 2026-10-13, then split out at Bex's request.

## Objective

A published article at `/articles/{slug}` in Bex's first-person voice, about 620 words, with a LinkedIn version posted separately. Layers touched: content (one Sanity `article` draft) and process (compliance gate, review). No schema, GROQ, React or CSS changes.

## Metadata plan

Chosen by the cost ladder proposed for `docs/write-pipeline-prompt.md` §1a (pending approval). Measured against the live dataset on 2026-10-13.

| Type | Existing (use) | New (recommend) |
|---|---|---|
| Categories | Career Engineering, AI | none |
| Tags | ATS, customer journey, process insight, data science | none. "Funnel" as a tag adds little over "customer journey", so the term carries it |
| Tools | Claude Code | none |
| Glossary terms | none fits (80 terms checked; no ATS, funnel or applicant term exists) | **ATS** (abbreviation "ATS", full form "Applicant tracking system"); **Funnel** |

| Term test | ATS | Funnel |
|---|---|---|
| Sourceable definition | yes | yes |
| Recurs in 3+ pieces | June post (tagged ATS), ST-162, ST-173 | June post, ST-162, ST-173 |
| Reader stalls without it | yes, the role title and the closing lines | yes, the whole article is about one |
| No existing term | confirmed by query | confirmed by query |

`/glossy` creates both terms, as a separate step after this draft is approved. Once they exist, the article links them through `relatedTerms`.

## Scope

- [x] **1. Draft in this doc**, with an evidence row for every figure (layer: editorial)
- [x] **2. LinkedIn version** at or under 3,000 characters, plus first comment (layer: editorial)
- [ ] **3. Bex reviews the draft below** (layer: process)
- [ ] **4. Sanity draft** via `create_documents` only, taxonomy and `aiDisclosure` attached, after item 3 (layer: content)
- [ ] **5. Human review and publish decision** (layer: process; Human-Publishes Rule applies)

## Phases

Single phase.

## Draft (in this doc first, per the content workflow)

**Status:** text only, awaiting Bex's review. Nothing is in Sanity.

| Field | Value |
|---|---|
| Working title | A Five-Minute Call That Was an Application |
| Slug | `five-minute-call-that-was-an-application` |
| Excerpt | A recruiter invite promised a live intro call. The page behind it said no sessions were scheduled. What that says about funnels, and a preview of my follow-up to the job-search data post. |
| Length | about 700 words, standard band (400 to 1,200) |
| Source | Bex's LinkedIn post, `resume-factory/data/content/drafts/linkedin-ziprecruiter/` (internal, outside this repo) |
| LinkedIn version | `linkedin-post_ziprecruiter_v2-3000.txt` (2,638 characters, limit 3,000) and `linkedin-first-comment_v2.txt` (615), same folder |
| `aiDisclosure` | "Drafted with Claude from Bex Head's own LinkedIn post, edited by Bex Head." |
| Categories | Career Engineering, AI |
| Tags | ATS, customer journey, process insight, data science |
| Tool | Claude Code |
| Project | The Resume Factory |
| Related | `job-search-funnel-data-postmortem` (June post); SUG-234 once it exists |
| Skim skeleton | Title; the seven subheads below; first sentence of each section. The closing rhetorical question was cut from the LinkedIn post and is cut here. |

### Evidence for every figure and claim

| Claim in the text | Source | Status |
|---|---|---|
| 92 applications since 1 June | `findings.json` `funnel.applied` = 92, cohort from 2026-06-01, read 2026-10-13 | measured |
| Recruiter-first: 10 applications, 10 screens | `findings.json` `channel["Recruiter Inbound"]` applied 10, screened 10 | measured |
| Everything else: 82 applications, 3 screens, 3.7% | `channel` applied 28+27+21+2+4 = 82; screened Board 1, Cold 1, Referral 1 = 3; 3/82 = 3.66% | measured; includes 4 referrals, see reconciliation item 2 |
| 6.7% in the June post | ST-162 §Background (cold apply, June post) | not re-opened on the live post; check at review |
| Email date, time slot, "live event", virtual queue | `.eml` headers and body, received 2026-10-12 14:41 PDT | measured |
| "No sessions scheduled", Apply Now, No Thanks | `ziprecruiter-rsvp-landing.png` | measured |
| Promise 16px bold, fine print 12px | `.eml` HTML: promise `font-weight:700;font-size:16px`, disclaimer `font-size:12px` | measured |
| "Next Available" written at send time, page checks on click | Bex's reading of the page source; not testable from the files | inference, worded "my read" |
| Oct 14 email: "really good fit", testjob_apr01, WFNQAFR44D, arrived from ziprecruiter.com | `HANDOFF_2026-10-15_ST-173-Testjob-and-Post-Final.md` §1, from a screenshot only (not yet saved in the repo or the draft folder) | observed; headers (DKIM, SPF, DMARC) not verified, so the text says only "arrived" and "looks like a test listing" |
| UW study: 85.1% White-associated, 11.1% female-associated, 500+ resumes | arXiv 2407.20371 abstract, fetched 2026-10-13 | study |

**Corrections made to the LinkedIn original while drafting:**

- The original said "85% vs 9%" (Black-associated) and "male 52% vs female 11%". The abstract confirms only 85.1% (White-associated) and 11.1% (female-associated). The 9% and 52% figures are not in the abstract and were dropped; restore them only after checking the paper's results section.
- The original said peer-reviewed studies show AI reviewers prefer their own resumes. arXiv 2509.00462 is listed as a non-archival submission at AIES 2025, so the LinkedIn version says "preprint". The research brief's "peer-reviewed" label needs the same fix. PNAS (Laurito et al.) is peer-reviewed but covers product, paper and film descriptions, not resumes.
- The original said the 82 "went through a portal". Four of them were referrals, so the text says "everything else".
- Dropped from the first comment, unverified from the files: the A/B testing tool on the landing page and the ASCII-art logo in the page source. Restore if Bex wants them (her own observations).

### Text

### The invite that promised a person

On October 12 an email arrived inviting me to a "brief, 5-minute intro call" about a Sr. Product Manager, Employer ATS role at ZipRecruiter. It had a named sender and a time, Wednesday at 2:00 PM PDT. It called the call a live event: I would join a virtual queue, and the sender would speak with me as soon as they were available.

I clicked RSVP. The page said "No sessions scheduled." Under that sat two buttons: Apply Now and No Thanks.

### An application wearing a calendar invite as a costume (USE FOR HERO ART - BECKY BOOP PROMPT)

The email is real, and the link goes exactly where it says: ZipRecruiter's own RSVP page for the same job. My read from the page source is that the "Next Available" time is written into the email when it is sent, while the page checks for open sessions only when you click. When the two disagree, the invitation promises something the page cannot deliver.

The fine print does say "automated message" and "not a guaranteed meeting." The promise is set in 16px bold. The caveat is set in 12px.

### Two doors, and one of them works

I track my job search like a data pipeline, which is the subject of my June post. Since 1 June I have sent 92 applications. How each one started matters more than anything on the resume.

| How it started | Applications | Screens | Rate |
|---|---|---|---|
| A recruiter wrote to me first | 10 | 10 | 100% |
| Everything else (alerts, boards, cold applies, referrals) | 82 | 3 | 3.7% |

In June I reported a cold-apply rate of 6.7%. It is now 3.7%. These are small samples and different cohorts, and a recruiter who writes first has already chosen me, so the rows are not like for like. But the pattern is loud: a human choosing me first works, and the portal almost never does.

That is why the invite landed the way it did. An email saying a person wants a call is the one message my data says to answer.

### Three funnel basics the page broke

- **Message match.** The page has to deliver what the email promised.
- **Honest CTA.** RSVP means "save my spot." Apply is a bigger ask.
- **Design the unhappy path.** The page knew there was no session. The email did not. "What if the slot is gone?" needs an answer before the send.

"Automated" and "not guaranteed" belong in the first line, not the fine print.

### Hi, Becky, hold my beer! Hugs, Phil (Your Career Advisor)

A second email landed on Oct 14. It said "I think you're a really good fit" for a job called testjob_apr01 at a company called WFNQAFR44D. That looks like a test listing that reached a real inbox. It's the same missing gate as the RSVP, earlier in the pipeline: nothing checked that the job was real before the send. One QA leak says nothing about the whole company. It does show where the checkpoint belongs.

### What I cannot say

I have no evidence that ZipRecruiter's applicant tracking system, or anyone's, treated my application unfairly. An invitation email and an ATS are different products. I am describing a funnel, not accusing a vendor.

### What the follow-up will cover

The full follow-up to "I Treated My Job Search Like a Data Pipeline" lands at the end of October, after my next read of the data. The angle: I fixed the resume, and the rate went down. The thing I controlled improved. The thing I did not control decided.

It will sort what is on record from what is alleged from what is only theory, because the public evidence on AI in hiring contains all three. One example of the first kind: University of Washington researchers tested embedding models for resume screening on more than 500 resumes. The models favored White-associated names in 85.1% of cases and female-associated names in 11.1%. That is a controlled study, not a live hiring system. Whether anything like it sits behind a portal I applied through, I cannot know, and the follow-up will say so.

### Compliance (run 2026-10-13)

Re-run 2026-10-15 after the testjob paragraph: zero em dashes, publish gate clean on the article text. First run 2026-10-13: zero em dashes; banned-vocabulary and filler-transition scan clean; publish gate (`python3 checks/check_tiers.py --publish`, run in `resume-factory/os`) clean on the article text and both LinkedIn files. The gate does not flag ZipRecruiter or the role title, so naming them is Bex's decision (see Open decisions).

## Hero image

| Field | Value |
|---|---|
| File | `article-five-minute-call-hero.webp`, kept in `resume-factory/data/content/drafts/linkedin-ziprecruiter/` (internal, outside this repo) |
| Generator | ChatGPT, from a `/becky-boop` prompt (Claude only, Becky as witness) |
| Alt text | Black-and-white 1930s cartoon. A deadpan Becky B00p side-eyes a robot dangling from a fishing hook in a flimsy calendar costume, while a steaming funnel machine swallows a heap of forms and lets out a single application. Generated with ChatGPT. |
| Disclosure | AI-generated image; the alt text names the tool (`docs/write-pipeline-prompt.md` §5) |
| Hero section | `heroSection` image, `imageWidth: content-width`; upload when the Sanity draft is created |

## Open decisions (Bex)

- Name ZipRecruiter and the role title in public text while that pursuit is live (decided 2026-10-13: keep both).
- Restore the A/B testing tool and ASCII logo lines in the first comment, if she wants them.
- Re-open the live June post and confirm the 6.7% figure before publish.
- Which rate the article cites: 3.7% (all non-recruiter, as drafted), or 2.5% (pure portal, 2 of 81). Check against `HANDOFF_2026-10-12_Funnel-Recut` in the resume-factory project. Keep the small-sample caveat either way.
- Crop and save the testjob screenshot (remove the Gmail label chips and the "to bex" line; the sender name can stay) in the draft folder. Optionally export the `.eml` and run the header check before any wording stronger than "arrived from ziprecruiter.com".
- Keep the testjob beat to one paragraph here. The two-gates, one-pipeline argument belongs in ST-162. Name no sender person. "Phil" stays in the Oct 14 subhead (decided 2026-10-15): it is the email's own sign-off, a sender persona, not a person.
- Bring back the HBS "Hidden Workers" 88% and ghost-jobs bullets, which were cut from the LinkedIn post only for its 3,000-character limit? The article has no limit.
- Not done yet, owner Bex: submit the ZipRecruiter feedback form (`ziprecruiter-feedback-form.txt`), click "No Thanks" on the RSVP page, post the LinkedIn first comment right after the post.
- Publish order and timing relative to the LinkedIn post.

## Acceptance Criteria

- [ ] Every figure traces to a command or file in the evidence table; none is copied from the LinkedIn original without a re-check.
- [ ] Zero em dashes; compliance gate passed; `aiDisclosure` set to match who drafted it.
- [ ] `python3 checks/check_tiers.py --publish` (run in `resume-factory/os`) passes on the final text, and the recruiter's name does not appear.
- [ ] Draft exists as `drafts.*` in Sanity with taxonomy attached, and nothing is published without Bex's standalone instruction.
- [ ] `node scripts/check-epic-doc.js docs/backlog/ST-173-article-five-minute-call-that-was-an-application.md` exits 0.

## Non-Goals

- No Sanity write before Bex approves the draft text.
- No claim that any vendor's ATS or AI treated an application unfairly.
- The data follow-up and its evidence tour stay in ST-162.
- No schema, GROQ, component or CSS changes. New taxonomy documents are not created.
