# Red Pen: Twice the Applications, the Same Number of Cold Calls (article, Bex PM voice)

- **Document:** `drafts.c1415fdb-baf2-4561-85f0-745ba125cc31` (Sanity `poalmzla` / `production`), draft only, `_rev` M5XJYBHz42rrzhJqqKEYUP at review time
- **Epic:** ST-162, `docs/backlog/ST-162-article-ai-screening-followup.md`
- **Reviewed:** 2026-11-12. Asked for special attention to "show, don't tell".
- **Method:** Pass 1 (accuracy) ran in a fresh-context subagent against the epic doc, `docs/drafts/ST-162-twice-the-applications/`, `findings.json`, the tracker (read-only) and the four chart htmlSections. Three of its Wrong rows were spot-checked by hand: warm touches 3.5/month (epic line 95), first post `publishedAt` 2026-05-20, last resume cut 1 May 2026 (epic line 84). Passes 2 to 4 ran in this session. This session made two small edits to the draft earlier today (plan-table row, "What I have been changing" heading and opening line); it did not write the rest of the draft.

## Editor's verdict

The argument is sound and honest. The piece says "flat, not fell", shows its p-value, and draws a careful line between what the data shows and what it cannot. That restraint is its best quality. The weak link is the middle third. "What the machine changed" and "What my data cannot say" narrate comparisons and timelines in long paragraphs: before and after, dated rule changes, resume versions. Each one is a table waiting to happen. The charts already show the door and pace numbers, and the prose then reads the same numbers out again. Eight numbers are wrong or framed wrong, mostly from earlier cuts that survived the re-cut. Fix those and it can publish. Fix the show-don't-tell rows too and it gets about 400 words shorter, and you can see what it is saying at a glance.

## Narrative map

**Thesis:** I doubled and tailored my applications and the portal's cold yield did not move. Only the human door responds to effort, and my data cannot say why the portal does not.

**Beats:**
- Hook: the line I got wrong
- Tension: twice the effort, same cold yield
- Escalation: two doors, then what the machine changed
- Context: what is behind the portals
- Limits: what my data cannot say
- Context again: it is not just me
- Resolution: the human door, and what I have been changing
- Aftermath: the plan, scored

The external evidence is split by the limits section. "What my data cannot say" sits between two context sections, which breaks the context run in half (see Notes).

**Skim skeleton (what the 30-second reader gets):**

- Twice the Applications, the Same Number of Cold Calls / *I fixed the part of the job search I controlled. The part I did not control was the decider.*
- **The line I got wrong.** "Last spring I published a post mortem on eleven months of job searching, run like a product retrospective."
- **Twice the effort, the same cold yield.** "Two cohorts, compared on monthly pace because the windows differ."
- **Two doors.** "There are two ways into a job…"
- **What the machine changed, and what it did not.** "Before June 27 everything was manual…"
- **What is behind the job portals.** "I cannot see inside an applicant tracking system."
- **What my data cannot say.** "I am over 50, and I have been taking the age cues off my resume for years, one at a time."
- **It is not just me.** "Some of these are government data and some are press reports; I say which."
- **The human door, briefly.** "Every role I have held since 2019 came through a recruiter who found me."
- **What I have been changing.** "Present perfect continuous, because I have been writing this post for two months."
- **The plan, scored.** "The first post ended with six things I said I would do."
- Closer: "Chapter one, reopened: I improved the part I controlled, and the part I did not control decided."

The headings and the closer carry the thesis. Three first sentences are set-up rather than claims: "Two cohorts, compared…", "Before June 27…" and "Some of these are…". A skimmer reading those learns how the post is organised, not what it found.

**Length:** about 2,700 words including tables and the callout (an estimate from section text, not a script). That is well past the roughly 1,600 where articles peak. The extra words sit in `s-machine-2` (four paragraphs, about 470 words) and the first paragraph of `s-cannot` (about 190 words). Rows 16 to 22 below take about 400 words of prose out without losing a fact.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | strong | The title, subheading and closer all state it, and the evidence never overclaims. |
| Beat completeness | adequate | Every beat is present. The limits section interrupts the context beats. |
| Momentum | adequate | The opening two sections pull you along. The machine section slows to a list of dates. |
| Payoff | strong | The scored plan settles the earlier post's account, and the closer echoes the subheading. |
| Skim integrity | adequate | The headings tell the story. Three section openers are set-up, not findings. |
| Length economy | weak | About 2,700 words. The machine and age-cue paragraphs narrate what a table would show. |
| Theme discipline | strong | The doors image is set up in "Two doors" and returns at the beats ("the one door that opens", "a door that does not open", "Done, one door only"). It never becomes shtick. |

## What worked

- "A retrospective that does not score the last retrospective is a diary." This is the frame of the whole piece in one line, and it earns the scored-plan table.
- "The filter is not the parse." It names the exact mistake chapter one made, in five words.
- "None of that is my funnel. All of it is the water my funnel sits in." It turns five outside statistics into context without claiming them as cause.
- "an application invite in a costume". A concrete, funny image for a real deception.
- "The machine's output was never the bottleneck. I was." The short second sentence lands because the paragraph before it is long.
- "I remembered it as one decision and it was four." This is show, not tell: it proves the checking happened instead of claiming rigour.
- "On seven screens and then three, a Fisher exact test puts that difference inside chance (p=0.34), so the honest word is flat." This is credibility through specificity: the test, the n and the p-value in one sentence.

## Findings

Rows 1 to 11 are Accuracy and 12 to 13 are Voice. Rows 14 to 23 are Sharpness, and 16 to 23 are show-don't-tell. Where two rows touch the same text, the later row says which one it replaces.

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 1 | Accuracy | `s-human` h1 | "The first post (Cohort 1, June ‘26) said that channel works and Cohort 2 agrees, louder." | "The earlier post said that channel works, and Cohort 2 agrees, louder." | The first post was published 2026-05-20, not June. The epic says to call it "the earlier post". The ‘ is also the wrong character. Row 20 includes this fix. | approved, applied 2026-11-13 |
| 2 | Accuracy | `p-tbl` row pr5, cell 2 | "The warm door doubled, from 1.5 touches a month to 3.3. Most of that…" | "The warm door more than doubled, from 1.5 touches a month to 3.5. Most of that…" | The final cut is 18 over 5.19 months, which is 3.5 a month, or 2.4 times (epic line 95). 3.3 matches no cut. | approved, applied 2026-11-13 |
| 3 | Accuracy | `s-machine` m1 | "…about 170 job descriptions a month, peaking near 300 in August and September before October's filters cut it to around 110." | "…about 170 job descriptions a month, peaking at 425 in August before the gates cut it to around 110 by October." | By calendar month it was August 425, September 128 and October 106. The "about 300" is an average for early August to mid-September, and it contradicts the "425" two paragraphs later. Row 17 replaces this row if both are approved. | approved; applied through 17, which replaces it |
| 4 | Accuracy | `s-machine-2` m2a and m2b | "So the machine widened the top of the funnel by roughly ten times and the middle by two…" / "Widening the funnel ten times did not widen me (yay Ozempic!)." | "So the machine filled the top of the funnel, 871 job descriptions for 109 applications, doubled the middle, and left the cold door exactly where it was." / "Filling the funnel did not widen me (yay Ozempic!)." | Cohort 1's intake was never tracked, so there is no "before" for a tenfold claim. The 10x in `build_charts.py` is intake against applications, which is actually 8x. | approved, applied 2026-11-13 |
| 5 | Accuracy | `s-cannot` c1 | "…landed in May 2026, five weeks before Cohort 2 started." | "…landed on 1 May 2026, a month before Cohort 2 started." | The cut was 1 May. That is 31 days before June 1, not five weeks (epic line 84). Row 21 includes this fix. | approved, applied 2026-11-13 |
| 6 | Accuracy | callout `s-notes` | "Every figure about my own search comes from one script run against my tracker on 2026-11-08, window closed at 2026-11-05." | "Every figure about my own search comes from scripts run against my tracker, last on 2026-11-12, window closed at 2026-11-05." | The final figures come from the 11-12 correction re-run. Listing lifetime and age cues come from separate scripts. | approved, applied 2026-11-13 |
| 7 | Accuracy | `html-pace` subtitle | "…and held between 14 and 26." | "…and held between 12 and 24 in its full months." | The full months were 21, 24, 23, 12 and 23. "14 to 26" is left over from the 10-20 cut. The same string is hard-coded at `docs/drafts/ST-162-twice-the-applications/ST-162-charts/build_charts.py:164`, which is local and gitignored, so fix it there too or a re-run brings it back. | approved, applied 2026-11-13 |
| 8 | Accuracy | `s-effort-2` e2 | "Twice the cold volume bought no extra cold screen." | "Nearly twice the cold volume bought no extra cold screen." | Cold applications went from 9.5 to 17.5 a month, which is 1.8 times. The chart labels it ×1.8. | approved, applied 2026-11-13 |
| 9 | Accuracy | `html-permonth` footnote | "Cold-only screens: 7 then 3, so say flat, not fell." | "Cold-only screens: 7 then 3, too few to call a change." | The current text is an internal writing instruction that would show to readers. | approved, applied 2026-11-13 |
| 10 | Accuracy | `s-behind` b2 | "The lawsuit that could settle the question is in discovery and I will re-read the docket before this goes live." | "The lawsuit that could settle the question is still in discovery." | This is a note to yourself in reader copy. The docket re-check stays a publish-day task (see Notes). | approved, applied 2026-11-13 |
| 11 | Accuracy | callout `s-notes`, new sentence at the end | (none) | "Cohort 1 counted hiring-manager screens and Cohort 2 counts hiring-manager rounds or later: close, not identical." | The epic says this definition mismatch is to be "stated in the post, not hidden" (line 258). "Rounds per month doubled" relies on it. | approved, applied 2026-11-13 |
| 12 | Voice | `s-machine-2` m2b | "(get thee behind me, facists!)" | "(get thee behind me, fascists!)" | Spelling. | approved, applied 2026-11-13 |
| 13 | Voice | `s-wrong` w2 | "…and a story-bank written by myself)" | "…and a story bank I wrote myself)" | "Written by myself" is a reflexive used as a subject. "I wrote myself" keeps the emphasis and the credit. | approved, applied 2026-11-13 |
| 14 | Sharpness | `s-machine-2` m3 | "I want to be precise about what that shows. A parse-clean, role-tailored resume…" | "A parse-clean, role-tailored resume…" | The opener announces precision instead of showing it. The next three sentences are the precision. | approved, applied 2026-11-13 |
| 15 | Sharpness | `s-behind` b2 | "The bottom line of that table: no court has found…" | "No court has found…" | A wind-up before the point. The paragraph already sits under the table. | approved, applied 2026-11-13 |
| 16 | Sharpness (table) | `s-effort` e1 | The paragraph narrates two cohorts across five dimensions (window, months, applications, tracking). | New `tableBlock` after a shorter e1. e1: "Two cohorts, compared on monthly pace because the windows differ. A cold application means I found the posting and applied with no prior relationship at the company. A screen is a recruiter call, including a staffing recruiter's call about a client seat, which is how Cohort 1 counted it too." Table rows: `| | Cohort 1 | Cohort 2 |` / `Window | Jul 2025 to May 2026 | Jun 1 to Nov 5, 2026` / `Months | 11 | 5.2` / `Applications | 111 | 109` / `Tracked with | Evernote tags | the pipeline, row by row` | Show, don't tell: two arms across four dimensions is a table. Structural insert. | approved, applied 2026-11-13 |
| 17 | Sharpness (table) | `s-machine` m1 | "Intake went from untracked to… Packaging went from… Applications went from 10 a month to 21." | Keep the first two sentences of m1, then insert a table: `Stage | Before June 27 | After` / `Intake | not tracked | about 170 job descriptions a month (425 in August, about 110 by October)` / `Packaging | one resume, edited by hand | 123 tailored packages` / `Applications | 10 a month | 21 a month` | Show, don't tell: a before-and-after across three stages, and three "X went from" openers in a row. Replaces row 3. Structural insert. | approved, applied 2026-11-13 |
| 18 | Sharpness (table) | `s-machine-2` m2b | The dated rule changes, written as one sentence with semicolons (Aug 21, Sep 4, Sep 20, Oct 2, Oct 18). | m2b ends at: "So the next two months went into rules rather than resumes, starting with hard gates for role, level, commute, federal work (get thee behind me, fascists!) and AI-as-the-product." Then a table: `Date | Rule added` / `August 21 | a scored triage board, so I could see what the gates were throwing out before it was gone` / `September 4 | a duplicate check` / `September 20 | a Date Applied column with a fourteen-day follow-up clock` / `October 2 | a re-rank of ecommerce and DAM roles` / `October 18 | a cut of the Director tier`. Then a new block with the rest of m2b: "By October intake was down to about 110 a month and I trusted what reached me. Most of that work was making sure Cowork was not flushing a dream job down the toilet. The machine's output was never the bottleneck. I was." | Show, don't tell: a dated sequence is a table. A Mermaid timeline is possible, but a table is safer to render. Includes row 12's spelling fix. Structural insert. | approved, applied 2026-11-13 |
| 19 | Sharpness | `s-doors-2` d2 | "Ten of twelve against three of ninety-one. Warm channels together ran at 12 of 18, which is 67%, against 69% in Cohort 1: level, on sixteen or eighteen touches each. Referrals dipped from 3 of 4 to 2 of 6. Four and six referrals are too few for that drop to be statistically significant, but it is the data I have. The portal number…" | "Ten of twelve against three of ninety-one. Warm channels together held level with Cohort 1, 67% against 69%, and referrals dipped from 3 of 4 to 2 of 6, too few to mean anything. The portal number…" | The doors chart directly above already shows every per-channel number. The prose should say what the numbers mean, not read them out again. | approved, applied 2026-11-13 |
| 20 | Sharpness | `s-human` h1 | "…The first post (Cohort 1, June ‘26) said that channel works and Cohort 2 agrees, louder. Ten of twelve recruiter-first applications reached a screen, seven of those reached a hiring manager, and one of them is live as I write this, which is why no company is named here." | "Every role I have held since 2019 came through a recruiter who found me. The earlier post said that channel works, and Cohort 2 agrees, louder. One of those processes is live as I write this, which is why no company is named here." | "Ten of twelve" and "seven" already appear in "Two doors". Saying them twice tells the reader again what they were already shown. Includes row 1. | approved, applied 2026-11-13 |
| 21 | Sharpness (table) | `s-cannot` c1 | One 190-word paragraph narrates four resume versions and two rates. | c1: "I am over 50, and I have been taking the age cues off my resume for years, one at a time. I went back through every version to check, because I remembered it as one decision and it was four." Table: `Resume version | Earliest date shown | Tenure line | Cold screen rate` / `2023 to 2024 | 2012, graduation year gone | "20+ years" | before both cohorts` / `Dec 2024 to Apr 2026 | 2012 | none on most versions | Cohort 1: 6.7%` / `From 1 May 2026 | 2017 | "15+ years" | Cohort 2: 3.3%`. New block after it: "The rate did not rise after the last cut, which fits \"it did not help\" and fits \"it helped and the market got worse\" equally well, and the two cohorts differ in too many other ways to pick between them." | Show, don't tell: a staged timeline set against an outcome is a table. Includes row 5. Rows checked against epic line 84. Structural insert. | approved as amended in the delta review, applied 2026-11-13 |
| 22 | Sharpness (table) | `s-notme` n1 | Five statistics in one paragraph, opening "Some of these are government data and some are press reports; I say which." | Replace n1 with a table that uses the same labelling device as the portal table: `Figure | Source | Label` / `Unemployed people 55 to 64 were out of work 34.9 weeks on average in September 2026, against 25.4 for everyone. It attributes nothing to AI. [10] | Bureau of Labor Statistics | Government data` / `About one posting in five shows no hiring activity in a quarter. [11] | Greenhouse data, reported by Korn Ferry | Reported` / `LinkedIn was at about 11,000 applications a minute in 2025, up 45% in a year. [12] | New York Times, relayed by eWeek | Reported` / `88% of employers said their systems screen out qualified candidates for not matching criteria exactly. [13] | Harvard Business School and Accenture | Survey` / `21% of business leaders said they let AI reject candidates at every stage with no human looking. [14] | 2024 survey | Survey`. Keep n2 as written. | Show, don't tell: "I say which" promises a label, and a Label column delivers it the way the earlier table does. Typed [N] markers are correct in table cells (ST-221). The 21% row needs its survey named (see Unverifiable). Structural insert. | declined (superseded by 28) |
| 23 | Sharpness (diagram, optional) | after `s-wrong` w2 | w2 narrates the pipeline: mail, mirror, tracker, gates, tailoring, review, apply. | Optional `mermaidSection`: `flowchart LR; A[Recruiter and job-alert mail] --> B[Gmail mirror]; B --> C[Tracker]; C --> D{Hard gates}; D -- pass --> E[Triage board]; E --> F[Tailored resume and letter]; F --> G[I review and apply]; D -- fail --> X[Out]` | Show, don't tell: a pipeline described in a sentence. This is a fifth visual and the post is already long, so it is a taste call. Structural insert. | declined (optional diagram not chosen) |

## Notes to the writer (no edit proposed)

- **"I would love to tell you it fell."** (`s-effort-2`) This can read as if you wanted the rate to drop. I take it to mean "fell" would be the more dramatic headline, but some readers will stumble on it. Your call.
- **Section order.** Moving "What my data cannot say" to after "It is not just me" keeps the two outside-evidence sections together. The limits section would then lead straight into "The human door". Structure is your call, so no edit is proposed.
- **The iTutorGroup citation title** contains the $365,000 figure. The epic's acceptance criteria say a dollar figure trips `check_tiers.py --publish` and has to be omitted or overridden on purpose. It is the source's own headline, so overriding it is reasonable, but decide on purpose.
- **"Two missing gates, one pipeline"** (epic Scope 8) is not in the draft. Either it was dropped on purpose and the epic should say so, or it still needs writing.
- **Publish-day tasks from the epic:** re-check the Mobley docket (Workday's opposition was due 2026-11-10); open every link; read the Nature study at the primary source; confirm the Gender Shades credit; run the taxonomy pre-flight; run `check_tiers.py --publish`; confirm the Perspective A account in your own words.
- **Theme budget:** the doors image is used well and used enough. Do not add more.

## Unverifiable claims (confirm before publish)

- "I have been writing this post for two months" (`s-changing`, today's edit). The epic was created 2026-10-12, a month ago. Drafting before that is not on record.
- "I widened my scope to product and web platform roles in October" (`s-cannot` c3). The epic says project and program roles (lane added 09-04 and 10-16), and in another place "PM and web platform roles". "Product" may be a misreading of "PM".
- "Every role I have held since 2019 came through a recruiter who found me." It repeats the earlier post. There is no independent record.
- "Peer-reviewed study, Nature, 2025" (table [4]). The Nature and Stanford pages returned 403. The study is confirmed only through university coverage.
- "the interesting ones went first" (`s-machine-2`). Your observation, not measured. It reads as an observation, which is fine.
- The 21% survey (row 22 / [14]) is not named in the prose. Name the publisher.

## Delta review, 2026-11-13

A short pass after three out-of-band edits: section `s-why` ("Why the portal might not answer"), section `s-newplan` ("The new plan", with `p3` moved to its end) and the bridge sentence opening `s-cannot` c1. Draft `_rev` at review: `yJ1rDM2TtSY4dSM8JHvVHh`. Findings 1 to 23 were not re-reviewed; each was re-checked only against the changed text.

### Length

3,097 words, up from about 2,700. The new sections add 553. (Command: GROQ `count(string::split(...))` over every section's `pt::text(content)`, table cells and callout body, on 2026-11-13; chart HTML not counted.) Length economy stays weak. Findings 25 and 28 cut the main duplication the additions created.

### Scorecard changes

| Structure | Was | Now | Why |
|---|---|---|---|
| Beat completeness | adequate | strong | The "why" beat now exists, and the bridge sentence connects Gender Shades to the age cuts. |
| Payoff | strong | strong | Unchanged, and better supported: the ending now spends both the theories and a forward plan before the closer. |
| Length economy | weak | weak | 3,097 words against a band that peaks near 1,600. |

### New findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 24 | Accuracy | `s-why` y-tbl row yr5, cell 2 | "Systems built on shared models and data tend to give the same people the same outcome everywhere. Measured on benchmarks, not hiring [8]" | "When many systems share training data, the same people tend to get the same outcome from all of them. For shared models the evidence is mixed. Measured on benchmarks, not hiring [8]" | The paper found shared data reliably increases homogenization, and shared models gave mixed results (abstract read 2026-11-13). The portal table's row br7 already says this correctly. | approved, applied 2026-11-13 |
| 25 | Sharpness | `s-changing` g2 | "…before I press Apply. And three new columns on the tracker, so the next post can say more than this one: which applicant tracking system took the application, how old the posting was when I applied, and how many applicants the portal showed. With those I can test whether stale postings and crowded postings explain the silence, and whether any one vendor's door behaves differently from the rest." | "…before I press Apply." (cut the last two sentences) | The three columns now appear in the theories table's last column and in "The new plan" row 5. This is the third telling. The plan is where they belong. | approved, applied 2026-11-13 |
| 26 | Sharpness | `s-why` y1 | "My data cannot say why the portal stays quiet. The research offers six candidates, and my numbers fit some better than others. Each is a theory, not a finding." | "The research offers six reasons the portal might stay quiet, and my numbers fit some better than others. Each is a theory, not a finding." | A heading two sections up already says "What my data cannot say". Open on the six. | approved, applied 2026-11-13 |
| 27 | Theme | `s-newplan` np1 | "…because being found is the door that opens." | "…because being found is what gets an answer." | The third "door that opens" in two sections ("the one door that opens", "a door that does not open"). The doors budget was already spent. "Answer" calls back to "The human door, briefly". Taste call. | approved, applied 2026-11-13 |
| 28 | Sharpness | `s-notme` n1 | The five-statistic paragraph, opening "Some of these are government data and some are press reports; I say which." | "Two more numbers set the scene. Unemployed people aged 55 to 64 had been out of work 34.9 weeks on average in September 2026, against 25.4 for everyone, per the Bureau of Labor Statistics, which attributes nothing to AI.[10] And 21% of business leaders in a 2024 Resume Builder survey said they let AI reject candidates at every stage with no human looking.[14]" Keep n2. [10] and [14] stay `citationRef` marks. | The Greenhouse, LinkedIn and Harvard figures ([11] to [13]) now sit in the theories table one section later, so n1 would say them twice in a row. This also names the 21% survey's publisher (citation 14 is Resume Builder). Supersedes 22. | approved, applied 2026-11-13 |

### Changes to findings 1 to 23

| # | Change | Why |
|---|---|---|
| 21 | Amended: the proposed c1 must keep the bridge. New c1: "That skepticism is why I started editing my resume for age. I am over 50, and I have been taking the age cues off it for years, one at a time. I went back through every version to check, because I remembered it as one decision and it was four." The table and the closing block are unchanged. | The original proposal predates the bridge sentence and would delete it. |
| 22 | Recommend decline. | A table in `s-notme` would repeat four figures from the theories table. Finding 28 handles that section instead. |
| 5 | Still applies. "five weeks" is unchanged in c1. | Re-checked against the edited span. |
| 2 | Still applies. "3.3" is unchanged in `p-tbl` pr5. | Re-checked. |
| All others | Unaffected. | They touch text the three edits did not change. |

### Notes changes

- **Section order note withdrawn.** The bridge sentence makes "What is behind the job portals" lead straight into "What my data cannot say", so the current order now works better than the suggested move.
- **Two studies appear twice.** The theories table reuses [8] and [9] from the portal table (rows br7 and br8). The framing is different (evidence, then theory), so no edit is proposed. Trim br7 and br8 later if length matters more.
- **New unverifiable claim:** "This post is the first one" (`s-newplan` row npr3). If the earlier post already has a Medium copy, the claim is wrong. Confirm.
- **Resolved if 28 is approved:** the unnamed 21% survey.

## Gate 2 application log

2026-11-12: Gate 2 held by Bex at end of day. No rows approved or applied; all 23 stay `pending`. Draft `drafts.c1415fdb-baf2-4561-85f0-745ba125cc31` untouched by this review. Re-fetch before applying (last `_rev` seen: M5XJYBHz42rrzhJqqKEYUP).

2026-11-13: out-of-band addition, not a numbered finding. Bex asked for possible reasons the portal does not answer, so the piece does not stop at "my data cannot say". Proposed and approved ("Write it as shown"). One `patch_documents` transaction with `ifRevisionId` `M5XJYBHz42rrzhJqqKEYUP` inserted section `s-why` ("Why the portal might not answer") after `s-notme`: block `y1`, tableBlock `y-tbl` (header plus six theory rows, typed citations [1] [7] [8] [9] [11] [12] [13]), block `y2`. Re-fetch (`_rev` `TiskbWAg8339xLi9CR769B`) confirmed the order and content. Sources [8] and [9] were checked at the primary abstract on 2026-11-13; a referrals theory was dropped because its paper could not be loaded. Effect on pending findings: finding 22 (a table for "It is not just me") now repeats four of these figures. Decline it, or trim that section.

2026-11-13: out-of-band addition, not a numbered finding. Bex asked for a follow-up to "The plan, scored" with the next three months, drawing on her doc "Inbound Recruiter Visibility Plan" (its Bottom line and Indeed sections; four sections there were still empty). Proposed and approved ("Write it as shown"). One `patch_documents` transaction with `ifRevisionId` `TiskbWAg8339xLi9CR769B`: unset block `p3` from `s-plan`; inserted section `s-newplan` ("The new plan") after `s-plan` with block `np1`, tableBlock `np-tbl` (header plus six rows), block `np2`, and `p3` re-created with identical text as the article's last line. Re-fetch (`_rev` `TiskbWAg8339xLi9CRAFnq`) confirmed the order, `s-plan` = p1, p-tbl, p2, and `s-newplan` = np1, np-tbl (7 rows), np2, p3. No targets set: the source doc's metrics section is empty.

2026-11-13: out-of-band edit, not a numbered finding. Bex asked to link "What my data cannot say" to the Gender Shades paragraph that ends "What is behind the job portals" (her age-cue edits began from that skepticism). Approved ("Write it as shown"). `set` on `sections[s-cannot].content[c1].children[c1a].text` with `ifRevisionId` `TiskbWAg8339xLi9CRAFnq`: opening "I am over 50, and I have been taking the age cues off my resume for years, one at a time." became "That skepticism is why I started editing my resume for age. I am over 50, and I have been taking the age cues off it for years, one at a time." Rest of the span unchanged, including "five weeks" (finding 5, still pending). Re-fetch (`_rev` `yJ1rDM2TtSY4dSM8JHvVHh`) confirmed the text, `markDefs: []`, `marks: []`.

### Gate 2, 2026-11-13

Bex chose "All but 22 and 23 (Recommended)" at the approval dialog: 26 findings applied, 22 and 23 declined.

**Main transaction.** One `patch_documents` call with `ifRevisionId` `yJ1rDM2TtSY4dSM8JHvVHh`:
- `set` on span text: h1a (1, 20), m1a (17), m2a (4), m2b-a (4, 12, 18), m3a (14), c1a (5, 21), nn1a (6, 11), e2a (8), b2a (10, 15), w2a (13), e1a (16), d2a (19), g1a (25), y1a (26), np1a (27).
- `set` on table cells: p-tbl pr5 cell 1 (2), y-tbl yr5 cell 1 (24).
- `set` on n1 `children` and `markDefs` (28): spans n1a-0, n1a-1 [10], n1a-2, n1a-9 [14]. Spans n1a-3 to n1a-8 and marks cite-n1-11 to cite-n1-13 removed.
- `insert`: e-tbl after e1 (16), m1-tbl after m1 (17), m2b-tbl and block m2d after m2b (18), c-tbl and block c1b after c1 (21).
- Finding 25 was logged as `s-changing` g2; the text it quotes is block g1, and g1 is what was patched.

**Chart text, a failure and its repair.** Findings 7 and 9 were sent in the same transaction as hand-built `diffMatchPatch` strings. They deleted part of the old text and inserted nothing: html-pace lost " and held between 14 and", leaving "(10.1 to 21.0) 26.", and html-permonth lost "Cold-only screens: 7 then 3, so say flat, not fe", leaving "ll.". The verification re-fetch (`_rev` `yJ1rDM2TtSY4dSM8JHwyXP`) caught both. Repair: a script run with `npx sanity exec --with-user-token` from `apps/studio` (copied in, run, deleted; nothing committed) read the draft, required that `_rev`, did a single exact string replacement per chart, and committed with `ifRevisionId`. Result `_rev` `20mWqb5JxEZ7f25aDRSGGQ`. Each chart's HTML now equals its pre-edit original with only the approved replacement (byte comparison against the pre-edit copy fetched with `npx sanity documents get`).

**Verification.** A script re-fetched the draft and checked each finding: 21 checks passed, and 7 and 9 failed until the repair above. Portable Text shape check: every block has `markDefs`, every span has `marks`, and every table row has `_key` and `_type: tableRow`. No problems.

**Still to do outside Sanity.** `docs/drafts/ST-162-twice-the-applications/ST-162-charts/build_charts.py:164` still hard-codes "held between 14 and 26", and the permonth footnote text likely lives in the same script. A chart re-run would bring both back. That file is local and gitignored.

## Feedback log

(empty)
