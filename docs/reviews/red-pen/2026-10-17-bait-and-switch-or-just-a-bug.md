# Red Pen, pass 2: Bait and Switch, or Just a Bug (article, Bex first-person PM)

**Reviewed:** 2026-10-17. **Source:** Sanity draft `drafts.218e24d5-2d8b-430b-8b2c-9f686ffcea2e`, `_rev` `R5ACzkqJPJK3TR7zitsXH6`, slug `bait-and-switch-or-just-a-bug`. **Guides read:** `master-voice-cheatsheet.md`, `brand-voice-guide.md`, `write-pipeline-prompt.md` §4. **Earlier pass:** [2026-10-16-five-minute-call-that-was-an-application.md](2026-10-16-five-minute-call-that-was-an-application.md), run on the epic copy before the Sanity draft existed. **Draft written in this session:** partly. The Sanity text descends from a draft and fixes made in this session, so this pass grades its own lineage. A fresh-context reviewer is offered at Gate 1.

**Out of scope by request:** the "Hi, Bex, hold my beer! Hugs, Phil" heading.

## Editor's verdict

Close to publishable. The piece now says only what its evidence supports: the email facts, the 16px and 12px beat, and the request log are all checked. Two numbers still need fixing before it goes live. The June post is dated 20 May in Sanity, and the 6.7% to 3.7% comparison still sets a cold-only rate against an all-routes rate. One line, "Malice or incompetence" in the hero, accuses where the rest of the piece carefully does not.

## Narrative map

**Thesis:** An invite that promises a person and delivers an application breaks the funnel's promise at the click; by design or by bug the candidate pays, and the fix is a check before the send.

**Beats:** hook (invite) → tension (empty RSVP page) → mechanism (what the email and page actually do) → evidence (two doors) → principles (funnel basics) → second exhibit (testjob) → limits (what I cannot say) → teaser. Carried over from the 10-16 pass: the second exhibit still reads as a coda, and the thesis never appears as one sentence.

**Skim skeleton:** "Bait and Switch, or Just a Bug" / "The invite that promised a person" / "An application wearing a calendar invite as a costume" / "Two doors, and one of them works" / "Three funnel basics the page broke" / (subhead 5, out of scope) / "What I cannot say" / "What the follow-up will cover". Closer: "Whether anything like it sits behind a portal I applied through, I cannot know."

**Length:** about 1,000 words including tables, hand count, not tool-measured. Band 400 to 1,200. Debt: the follow-up section (about 140 words) spends words on another piece.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | adequate | Recoverable from "Two doors" onward, never one sentence |
| Beat completeness | strong | Every beat present; mechanism section now explains the cause |
| Momentum | adequate | Strong to the table, slower through basics and testjob |
| Payoff | adequate | The title's question is answered inside the testjob paragraph, not at the close |
| Skim integrity | adequate | The skeleton shows the question but not the answer; subhead 5 excluded |
| Length economy | adequate | In band; follow-up section is debt |
| Theme discipline | strong | Costume and bait run title, subhead 2, testjob line and hero art; see Pass 3.5 |

## What worked

- "A bait and switch would have checked the bait." The title's metaphor pays off in one line, and the line is also the argument.
- "But the pattern is loud: a human choosing me first works, and the portal almost never does." Hedge, then position.
- "I cannot see ZipRecruiter's metrics. ... That is a theory, not a finding." Labels the theory without apologising for it.
- "Reader, I did not apply." Deadpan and short.
- "I cannot see the server's answer on October 13, only the page it produced." States the edge of the evidence exactly.

## Pass results

**Accuracy.**

| Claim | Result |
|---|---|
| Invite: date 12 Oct, named sender, Wednesday 2:00 PM PDT, "live event", virtual queue, "as soon as I am available" | Verified on the `.eml` (Downloads), text and HTML parts |
| "Next Available" is plain text, fixed once sent | Verified on the `.eml`: plain text in both parts. How it was produced is not visible in the file |
| RSVP link carries a job ID and no time slot | Verified: params `job_id`, `click_data` (placementId, encodedJobKey, decoded), `zs`; no date or slot |
| Request names only the job ID | Verified in DevTools: `GET /api/video/v2/rsvp-initialization?jobId=c05c4af4`, Payload shows only `jobId` (2026-10-17) |
| 17 Oct answer: empty, inactive session, RSVP switched off | Verified in the Response tab: `scheduledSessionId` "", `isActive` false, `disableRsvp` true |
| "automated message", "not a guaranteed meeting" | Verified in the `.eml` fine print |
| "The promise is set in 16px bold. The caveat is set in 12px." | Half right. The "Next Available" line is bold in a 16px cell; the intro sentence is 16px regular; the caveat is 12px (finding 1) |
| 92 applications, 8 of 10 (corrected 2026-10-22, was 10 of 10), 3 of 82, 3.7% | Verified in `findings.json`: `funnel.applied` 92; recruiter 8 of 10 applications (corrected 2026-10-22); others 82 applied, 3 screened |
| Cold-only rate now | Computed from `findings.json` `channel`: Job Alert 28, Board 27, Cold 21, Untagged 2 = 78 applied, 2 screened = 2.6% (finding 3) |
| 6.7% in the earlier post | Verified in the live post's "Six Out of 100" section: "I'm sitting at 6.7%". Definition: cold apply, no prior relationship |
| Earlier post date | Sanity `publishedAt` and `_createdAt` 2026-05-20, `_updatedAt` 2026-08-08. The article says "June" (finding 2) |
| Testjob email: sender, subject, 14 Oct 2:28 PM PDT, "I think you're a really good fit for this testjob_apr01 job at WFNQAFR44D!" | Verified on `testjob_apr01-email.eml`. DKIM, SPF, DMARC pass |
| UW study 85.1% and 11.1%, 500+ resumes | Verified on arXiv 2407.20371 abstract. No citation in the article (finding 5) |

**Voice.** No em dashes, banned vocabulary, filler transitions or emoji outside the excluded heading. First-person contract holds. Findings 6 and 7 are the exceptions: an accusing hero line, and four sentences opening "The" in a row.

**Theme (Pass 3.5).** Controlling image: costume and bait (title, subhead 2, testjob line, hero art). "Two doors" is a second image family, a taste call, not a break. No over-extension.

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|------|----------|---------|----------|-----|----------|
| 1 | Accuracy | "An application wearing..." section, last paragraph | "The fine print does say "automated message" and "not a guaranteed meeting." The promise is set in 16px bold. The caveat is set in 12px." | "The fine print does say "automated message" and "not a guaranteed meeting", in 12px. The time slot itself is set in 16px bold." | The 16px bold is the "Next Available" line, not the whole promise. Also removes three sentences opening "The" | approved, applied |
| 2 | Accuracy | "Two doors", paragraphs 1 and 3 | "which is the subject of my June post" and "In June my cold-apply screen rate was 6.7%." | "which is the subject of my earlier post" and "In that post my cold-apply screen rate was 6.7%." | Sanity dates the post 20 May 2026. Confirm if it ran elsewhere in June; otherwise "June" is wrong | approved, applied |
| 3 | Accuracy | "Two doors", paragraph 3 | "...6.7%. Every non-recruiter route combined is now 3.7%." | "...6.7%. Counting only cold routes (alerts, boards, direct applies), it is now 2 in 78, or 2.6%. Add the four referrals and every non-recruiter route comes to 3 in 82, or 3.7%." | The earlier post defines cold apply as no prior relationship, which excludes referrals. The like-for-like figure is 2.6%, a bigger drop than the text shows. Table row stays as is | approved, applied |
| 4 | Accuracy | "Two doors", paragraph 1 | "Since 1 June I have sent 92 applications." | "Between 1 June and 12 October I sent 92 applications." | The figure is a 12 October data cut; "have sent" goes stale | approved, applied |
| 5 | Accuracy | Last section, UW sentence | (no citation) | Add a citation item: Wilson and Caliskan, "Gender, Race, and Intersectional Bias in Resume Screening via Language Model Retrieval", AIES 2024, https://arxiv.org/abs/2407.20371, linked inline to "University of Washington researchers". Structural insert | A verified claim with no receipt on the page | approved, applied |
| 6 | Voice | Hero subheading | "Malice or incompetence, the candidate walks away either way." | "By design or by accident, the candidate walks away either way." | Accuses a named company, against "I am describing a funnel, not accusing a vendor" and the softened testjob line. Matches the excerpt | approved, applied |
| 7 | Voice | "An application wearing..." section, paragraph 1 | "The costume is convincing. The email is real, ... The "Next Available" time is plain text in the email, so it was fixed the moment the email went out. The RSVP link carries a job ID and no time slot." | "The costume is convincing. The email is real, ... Its "Next Available" time is plain text, so it was fixed the moment the email went out. The link itself carries a job ID and no time slot." | Four sentences in a row opened "The" (rewrite signal) | approved, applied |
| 8 | Sharpness | "Two doors", paragraph 1 | "my earlier post" (plain text, after finding 2) | Same words as an inline link to /articles/job-search-funnel-data-postmortem. Structural: adds a link annotation | The reader is told about the post and given no way to reach it; the page's related list is the only route | approved, applied |
| 9 | Voice | "What the follow-up will cover", paragraph 1 | "The full follow-up to ... The angle: ... The thing I controlled improved. The thing I did not control decided." | "My full follow-up to ... Its angle: I fixed the resume, and the rate went down. The thing I controlled improved. The thing I did not control decided." | Four sentences open "The". Fresh-context reviewer found it; the first-pass missed it. The closing pair stays as deliberate parallelism | approved, applied |
| 10 | Accuracy | First table, row 2 label | "Everything else (alerts, boards, cold applies, referrals)" | "Everything else (alerts, boards, cold applies, untagged, referrals)" | The 82 includes 2 untagged applications. Fresh-context reviewer | approved, applied |
| 11 | Accuracy | Costume section image alt text | Identical to the hero alt text | "A repeat of the hero cartoon: a robot in a calendar costume dangling from a hook while Becky B00p watches. Generated with ChatGPT." | Two images with identical alt text, one after the other, read twice to a screen reader. Fresh-context reviewer | approved, applied |
| 12 | Voice | Hero subheading (alternative to row 6) | "By design or by accident, the candidate walks away either way." | "Bait or bug, the candidate walks away either way." | Echoes the title. Taste call; row 6 is already applied | declined by Bex |

## Notes to the writer (no edit proposed)

- **Carried over from the 10-16 pass, still open:** the thesis never appears as one sentence; the closer is a teaser for a different piece; the testjob section reads as a coda. Consider ending on "What I cannot say" with the teaser as one line after it.
- **The title asks a question the piece answers mid-way.** "A bait and switch would have checked the bait. ... My read is a missing check, not a scheme" is the verdict, and it sits in section five. A skimmer reads the question and not the answer.
- **"The person on the other end gets the same page either way."** Is "page" a deliberate pun on the web page? If so it stays; if not, "the same dead end" is plainer. Left as a question.
- **The costume image caption** ("The costume is convincing.") repeats the section's first sentence. A caption that adds information would earn the space. Left as a question, because the right joke is yours.
- **Trailing space** after "Reader, I did not apply." in the first section. Mechanical, harmless.
- **"Landed"** appears twice (second email; "the invite landed the way it did"). Taste call.

## Unverifiable claims (confirm before publish)

1. "An invitation email and an ATS are different products." Reasonable, not checked against anything.
2. "The full follow-up lands at the end of October." ST-162 waits on the 10-30 read.
3. The server may also read cookies; the article's "the email and the page were not comparing notes" rests on the request carrying only the job ID. The cookies were not inspected for slot data (names only; none looked schedule-related).
4. The testjob screenshot still shows the "to bex" line under the sender, per the 10-16 note. Crop before publish.

## Fresh-context review (2026-10-17)

A separate reviewer with no view of this session ran the four passes on the same draft, without seeing the findings above. It reached findings 1, 2, 6 and 7 independently and added rows 9 to 12. Rulings on its other points:

| Reviewer point | Ruling |
|---|---|
| "6.7% does not appear in the published post" (blocking) | Wrong. It is in the accordion tile "Six Out of 100" ("I'm sitting at 6.7%"), which the reviewer's search did not cover. Verified in Sanity 2026-10-17. The "June" label is still wrong (finding 2) |
| "Screening call" vs the email's "intro call" | Not a row. "Screening call" is the article's label for the funnel stage; the body quotes the email's "intro call" correctly |
| "Same page either way" is unverifiable (no capture of the second email's landing page) | Kept as a question to Bex in Notes (pun or literal) |
| "I fixed the resume, and the rate went down" is unverifiable | Supported by the earlier post's "Electric Resumes: Solved" tile and the funnel counts; Bex to confirm |
| "The portal works 3.7% of the time" in place of "almost never does" | Declined. Row 3 already carries the numbers one sentence earlier; the adjective is the jagged edge on purpose |
| Rewrite of the opening paragraph; "before the send" added to the checkpoint line | Declined. The first adds a date the section does not need; the second repeats "before the send" from the line above |
| Cut "The costume is convincing." | Declined. The 10-16 pass added it deliberately; row 7 keeps it |
| Tools field credits Claude Code | Not an issue. The tools field is the machine-readable AI attribution per `write-pipeline-prompt.md` §5 |

## Gate 2 application log

Approved by Bex via AskUserQuestion 2026-10-17: rows 1 to 8. Rows 9 to 12 are new from the fresh-context review and wait for approval. Applied with `patch_documents` to `drafts.218e24d5-2d8b-430b-8b2c-9f686ffcea2e`, `ifRevisionId` `R5ACzkqJPJK3TR7zitsXH6`; new `_rev` `o9Hm3VreAttyHorA2dEPpK`.

| # | Change |
|---|---|
| 1 | `txt-costume` block `c3`: "...in 12px. The time slot itself is set in 16px bold." |
| 2, 4, 8 | `txt-doors` block `d2` rebuilt as three spans with an internal `link` markDef to the earlier post: "...the subject of my earlier post. Between 1 June and 12 October I sent 92 applications..." |
| 2, 3 | `txt-doors` block `d3`: "In that post my cold-apply screen rate was 6.7%. Counting only cold routes (alerts, boards, direct applies and untagged), it is now 2 in 78, or 2.6%. Add the four referrals..." |
| 5 | `txt-followup` block `f3` rebuilt with a `citationRef` markDef (index 1) on "University of Washington researchers"; document `citations[]` gained item `cit-1` (arXiv 2407.20371, AIES 2024) |
| 6 | Hero `subheading`: "By design or by accident, the candidate walks away either way." |
| 7 | `txt-costume` block `a3e395fdd49b`: "Its "Next Available" time is plain text... The link itself carries a job ID and no time slot." |

**Deviation from the proposal, disclosed:** row 3's parenthetical read "(alerts, boards, direct applies)", which sums to 76, not 78. It now reads "(alerts, boards, direct applies and untagged)" so the count reconciles.

**Verification:** a re-fetch confirmed every change, both table blocks, all five images and the block shapes (`markDefs` and `marks` present on rebuilt blocks).

### 2026-10-18 follow-on application (rows 9 to 12)

Bex approved rows 9 to 11 and chose to keep the current hero line, so row 12 was not applied (her specific answer overrode "Approve all 4"). Applied with `patch_documents` to the same draft: row 9 on `txt-followup` block `f2`; row 10 on table `dt1`, row `dt1r2`, cell 0; row 11 on image `09af3dab8441` alt text. **Slip, corrected:** the first patch for row 10 indexed cell 2 (Screens) instead of cell 0 and re-set it to its existing value "3", so nothing changed; a second patch with `ifRevisionId` set cell 0. Final re-fetch confirmed the label, both tables, five images and one citation.

### 2026-10-18 issue #176 follow-on

- **Fig. 3 redaction:** the testjob screenshot had the recipient line ("to bex") visible. A solid black box was drawn over it (copy in `upload-ready/article-bait-and-switch-testjob-email-redacted.png`), uploaded as asset `image-ef6d4d7399c9b5b11efd19cd7cf11cc322856d13-845x1579-png`, and the draft's Fig. 3 reference was swapped; alt text and caption unchanged. The old un-redacted asset `image-29024b54...` remains in the media library, unreferenced. Bex chose to keep "Phil" unredacted in the heading and screenshot.
- **Publish gate and scans on the draft text** (1,256 words including captions, alt text, tables and the excerpt; about 1,000 in the body): clean, zero em dashes, no banned vocabulary, no three-in-a-row openers. Re-run after Bex's final pass.
- **LinkedIn drafts corrected** (outside the repo): "June" wording, "when it loads", 16px applies to the time slot only, rates now cold-only 2.6% beside 6.7% with 3.7% for all routes, the UW figures replaced with the abstract's (85.1% and 11.1%), "peer-reviewed" changed to "a preprint", and the short version's "My read is incompetence" matched to the article.

## Feedback log

- 2026-10-17: Bex asked for a fresh-context reviewer before any rows were applied; ran, then rows 1 to 8 applied.

