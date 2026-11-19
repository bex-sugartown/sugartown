# Red Pen: Twice the Applications, the Same Number of Cold Calls, Part 1 (article)

- **Date:** 2026-11-17
- **Piece:** ST-162 Part 1 (#162), the local working draft `docs/drafts/ST-162-twice-the-applications/ST-162-twice-the-applications.html`, after the three-part split (#241, #242). Not synced to Sanity.
- **Reviewer:** a fresh-context subagent, because the orchestrating session wrote much of the new copy. It was read-only. The orchestrating session re-checked findings #1 and #3 (CONFIRMED, see below).
- **Previous review of this piece:** `2026-11-12-twice-the-applications-same-number-of-cold-calls.md` (pre-split).

## Editor's verdict

This is a strong, honest Part 1. The thesis lands in the excerpt, the opening confesses a mistake, the stats are careful ("so the honest word is flat"), and the closer pays off the opening. It is not publishable as-is, for two reasons.

1. **Four accuracy problems, all in the machine section.**
   - June includes rows from before the tracker existed.
   - "About 200" is really 183, and the sentence reads as if it means October.
   - "The interesting ones went first" is contradicted by the tracker's priority field.
   - "Next two months... starting with hard gates" conflicts with the chart, which dates the gates from June.
2. **Repetition.** Several facts are stated three or four times across prose, tables and charts:
   - 425 in August: four times.
   - Applications at about twenty a month: three times.
   - "I was the bottleneck": three times.
   - Six base resumes: three times.
   - The hiring-manager rounds split: three times.

The two new closing sections earn their place, and both get cleaner once the duplicates around them are cut.

## Narrative map

**Thesis:** Doubling applications with an AI pipeline did not raise cold screens. People opened the doors, so the next project is being found, not a better resume.

**Beats:**

- **Hook:** the line I got wrong.
- **Tension:** 2x effort, flat cold yield, then two doors.
- **Escalation:** what the machine changed. The bottleneck was me, and listings die before I reach them.
- **Resolution:** the human door, where the screens came from.
- **Aftermath:** next, being found, then "Chapter one, reopened."

The PM arc is complete. One problem: s-machine-3 ends with a Part 2 tease, which makes a false ending three sections early.

**Skim skeleton:** the headings carry the arc. The first sentences of s-effort ("Two cohorts, compared on monthly pace…") and s-machine ("Before June 27 everything was manual…") carry method or setup rather than the claim. The closer is "Chapter one, reopened: I improved the part I controlled, and the part that answered was people."

**Length:** about 1,160 body words, or 1,313 with Notes. That is under the 1,600 band, but about 120 words are repeats (s-machine-2, s-machine-3 and s-found-2 paragraph 1).

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | strong | The excerpt and closer both state it, and the doors frame makes it concrete. |
| Beat completeness | adequate | The mid-piece Part 2 tease is a premature ending. |
| Momentum | adequate | It sags in the machine section, where three blocks restate the bottleneck. |
| Payoff | strong | The closer spends what the opening earned. |
| Skim integrity | adequate | Two section openers carry method instead of the claim. |
| Length economy | adequate | Under the band, but about 120 words are repeats. |
| Theme discipline | adequate | The doors metaphor is well deployed. "Where the screens came from" misses a beat that the chart under it ("Who opened the door") already takes. |

## What worked

- "The number of cold screens a month did not move. I am re-litigating chapter one."
- "I would love to tell you it fell… so the honest word is flat." The instinct is right; the first clause gets a fix in #8.
- "Nearly twice the cold volume bought no extra cold screen."
- "The jobs portal number is the one that has not changed its mind across two cohorts and two tracking systems."
- "Filling the funnel did not widen me (yay Ozempic!)"
- "The pipeline made applying cheaper. It did not make the window any wider."
- "Through the jobs portal door, I choose them and wait (and wait, and wait, pretty much forever)."
- "Chapter one, reopened: I improved the part I controlled, and the part that answered was people."

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 1 | Accuracy | html-rules caption | June starts at the tracker launch on June 27; | June includes 17 job descriptions logged from before the tracker launched on June 27; | **Wrong.** 17 of June's 32 captures, and 16 of its 21 applications, are dated June 1 to 26. CONFIRMED by the orchestrating session. | approved, applied |
| 2 | Accuracy | s-wrong | Between June 1 and November 5 that system saw 871 job descriptions | Between June 1 and November 5 that system logged 871 job descriptions | The system went live June 27, so "saw" is untrue of the June 1 to 26 rows. | approved, applied |
| 3 | Accuracy | s-machine-3 | About 200 of them an employer closed first, a third within five days of capture, and the interesting ones went first. | Across all five months, 183 closed at the employer's end before I applied, more than a third within five days of capture. | **Wrong.** It is 183, and "of them" reads as October's 31. "Interesting ones went first" is contradicted: P1 dead listings had a median life of 16 days (13 rows) against 3 for unrated (50). CONFIRMED by the orchestrating session. "A third" is verified (66 of 179 dated, 37%). | approved, applied |
| 4 | Accuracy | html-rules subtitle | As the rules cut intake to a quarter, that fell to 67%. | By October, with intake at a quarter of August's, it was 67%. | The rules close rows after capture. Nothing in the sources shows what drove 425 down to 106. PLAUSIBLE: some upstream filtering may have lowered capture. | approved, applied |
| 5 | Accuracy | s-machine-2 | So the next two months went into rules rather than resumes, starting with hard gates for role, level, commute, federal work and AI-as-the-product. | So from late August the work went into rules rather than resumes. | The gates date from June (s-machine), and the chart's rules run August 21 to October 18. | approved, applied |
| 6 | Accuracy | html-doors SVG label | 7% (7 of 105) | 6.7% (7 of 105) | The text says 6.7%. | approved, applied |
| 7 | Voice | s-wrong | I built the Resume Factory pipeline. Claude, running in Cowork, built a tracker | I specced the Resume Factory pipeline. Claude, running in Cowork, built a tracker | Article contract: Bex directs, Claude builds. As written, the two sentences contradict each other. | approved, applied |
| 8 | Sharpness | s-effort-2 | I would love to tell you it fell. | It looks like a fall. | Wishing for a fall reads backwards to a recruiter. | approved, applied |
| 9 | Sharpness | s-effort-2 | Everything that did grow, screens, hiring-manager rounds, rejections, grew because | Everything that grew (screens, hiring-manager rounds, rejections) grew because | The comma appositive parses as a list. | approved, applied |
| 10 | Sharpness, show don't tell | s-doors-2, paragraph 2 | The same split holds further down. Nine of Cohort 2's applications reached a hiring-manager round or later. Seven came through recruiter outreach, one through a referral, one through a jobs portal. | *(delete paragraph)* | This is the third telling. The html-screens chart and s-found carry it. | approved, applied |
| 11 | Sharpness | s-machine-2 | The tailoring got deeper, six base resumes instead of one and a bank of true stories to draw from, and the cold door did not notice. | *(delete sentence)* | The third mention of six resumes. s-machine-3 lands the same point. | approved, applied |
| 12 | Sharpness, show don't tell | s-machine-2 | So the machine filled the top of the funnel, 871 job descriptions for 109 applications, doubled the middle, and left the cold door exactly where it was. | So the machine filled the top of the funnel, doubled the middle, and left the cold door exactly where it was. | The funnel chart above shows 871 and 109. | approved, applied |
| 13 | Sharpness | html-rules subtitle | Applications held near twenty a month throughout. | *(delete sentence)* | September was 12. The pace chart carries the point. | approved, applied |
| 14 | Sharpness, narrative | s-machine-3, paragraph 3 | What sits between a clean resume and a silent jobs portal is its own question, and the next post takes it on: what the public record says about automated screening, age included. | *(delete sentence)* | A false ending mid-piece. Part 2 is teased again at the end. | approved, applied |
| 15 | Sharpness | s-found-2, paragraph 1 | I spent the summer scrambling to keep up with the volume the machine created, 425 job descriptions in August alone, and more volume was never going to help. The constraint was whether I had the time to vet a phat pipeline. | I spent the summer scrambling to vet a phat pipeline, and more volume was never going to help. | This would be the fourth "425" and the third bottleneck statement. "Phat" stays. | approved, applied |
| 16 | Sharpness, show don't tell | html-screens caption | In Cohort 2, 91 cold applications produced 3 screens; 18 applications that started with a person produced 12. | *(delete sentence)* | s-found says this right above the chart. | approved, applied |
| 17 | Sharpness | f-tbl, first Next row | Change my LinkedIn title from Senior to Principal, which three AI assistants repeat back | Change my LinkedIn title from Senior to Principal (three AI assistants still call me Senior) | "Which" is ambiguous. Verified: Inbound-Visibility_REPORT.md (Google AI Mode, Gemini, Perplexity). | approved, applied |
| 18 | Sharpness | html-doors subtitle | Grey = Cohort 1, pink = Cohort 2. Through a person | Through a person | The legend is on the next line, and colour names fail in the dark theme and for colour-blind readers. | approved, applied |
| 19 | Sharpness | html-pace caption | *November is 5 days. | November is 5 days. | The asterisk has no anchor. | approved, applied |
| 20 | Theme | s-found heading | Where the screens came from | Who opened the door | Puts the doors metaphor at a section turn, matching the chart below. Hand the skimmer the claim. Do not push "door" further; it is near its budget. | approved, applied |

**Verified with no finding:**

- **Funnel:** 871 / 123 / 109 / 15 (+1 call with no application) / 9 / 0.
- **Per-month values and multipliers**, with Cohort 1 at 18 screens.
- **Doors:** 10 of 12, 2 of 6, 3 of 91.
- **Warm share:** 67% against 69%.
- **Fisher p=0.34**, re-run. The period p-values are all ≥0.30.
- **Share through people:** 61%, 80%, 89%.
- **Rules chart:** every count and percentage, and the rule dates for August 21, September 4, September 20 and October 18.
- **Roadmap dates:** November 23, December 1 and December 14.
- **Open to Work:** set to recruiters only.
- **The sixty-day ghost rule.**

**Voice:** no banned vocabulary and no em dashes. The rough edges ("strict as F!@&!K", "yay Ozempic!", "phat") are intentional.

## Notes to the writer (no edit proposed)

1. **Title ambiguity.** To a recruiter, a "cold call" is unprompted outreach, and those doubled. One option is "…the Same Number of Cold Screens". Your call.
2. **The March paragraph** (s-effort-2, paragraph 2) compares three periods in prose, so it is a table candidate. It also tells recruiters the cold rate dipped when you started tailoring with AI. Consider moving it to Part 2.
3. **Age signals in a recruiter-first post:** "age cues trimmed" (f-tbl), "age included" (cut by #14), and "from a 1992 start it is 34" (Notes). This is a strategic call, not an editorial one.
4. **Cohort 1 door counts overlap** (touches, not applications: 105 + 12 + 4 = 121 against 111 applications). Notes on the numbers should say so in one sentence.
5. **build_charts.py still computes Cohort 1 "All screens" from 19** (`19 / 11`). Regenerating the charts would revert the hand-set 1.6.
6. **The pace chart mostly repeats the per-month chart's ×2.1.** Consider cutting it.
7. **The excerpt says "Then I built a pipeline."** Align it with #7 if you take #7.
8. **Roadmap rows will age before December 1.** Re-read the statuses on publish day.
9. **Skim:** s-effort and s-machine open with method and setup, not the claim.

## Unverifiable claims (confirm before publish)

- "Every role I have held since 2019 came through recruiter outreach."
- "I am in an interview process through one of those recruiters right now." True now; it may be stale on December 1.
- Cold screens by period: the numerators "6 of 74… 1 of 31" (the denominators match).
- "Each with a debrief on file." findings.json says this only for the October rows.
- "October 2: Ecommerce and DAM roles re-ranked." No dated source found.
- Roadmap: "By mid-December" (site) and "January" (score), which are not in the plan.
- "Every recruiter who contacts me first is logged…: Done." The tag exists, but it is backfilled on only 3 rows.
- "Age cues trimmed, June to October."
- Claims about the first post ("last spring", "a 28-year career").

## Gate 2 application log

2026-11-17. Bex approved all 20 rows in one selection ("Approve all 20, apply to the HTML draft"). Each row's Current text was replaced verbatim with its Proposed text in the working draft, by exact-string match; all 20 matched exactly once. Backup before applying: the session scratchpad. Nothing was synced to Sanity.

Follow-on edit outside the table: #20 made the s-found heading "Who opened the door", the same as the html-screens chart title right below it. The chart title was changed to "How each screen started" to avoid the repeat.

Notes to the writer, decided by Bex 2026-11-17:
- Note 1, title: changed to "Twice the Applications, the Same Number of Cold Screens" (front matter, hero, page title). The slug stays the same.
- Note 2, March paragraph: removed from Part 1, and its text was moved to #241 (Part 2).
- Note 3, age signals: "age cues trimmed" cut from the roadmap row, and the 28 to 34-year career correction cut from Notes on the numbers and moved to #241.
- Note 7, excerpt: "Then I built a pipeline" became "Then I specced a pipeline".
- Notes 4, 5, 6, 8 and 9 were applied 2026-11-18, the final review round. Bex asked for the draft to reflect every red-pen recommendation.
  - Note 4: one sentence in Notes on the numbers. The door counts (105 cold, 12 recruiter outreach, 4 referral) add up to 121 against 111 applications.
  - Note 5: `build_charts.py` uses an `S1 = 18` constant and asserts that the monthly table's Recr column sums to it. Charts regenerated.
  - Note 6: the pace chart (html-pace) is cut.
  - Note 8 and the unverifiable claims: listed in the draft's Before publish panel, to confirm on publish day.
  - Note 9: s-effort now opens "Per month, I sent twice as many applications and got no more cold screens." s-machine now opens "The machine changed how much reached me, not what came back."
  - Not from the red pen: the "AI Ethics" tag moved to Part 2 (#241).
- Synced to Sanity 2026-11-19 (`drafts.c1415fdb-baf2-4561-85f0-745ba125cc31`, rev `VyVzgonK237PKVDeRoQXQS`). `pnpm export:draft check` matched all 18 sections. Edits after the red pen, at Bex's direction, are not red-pen rows:
  - s-effort-2: the Fisher test sentence became plain English ("essentially the same bracket (p=0.34)"), and the paragraph closes "What grew, grew because I submitted more applications, period."
  - s-effort: cold and warm screens are defined separately.
  - "Machine" became "the pipeline" or Resume Factory, defined once in s-wrong. "The machines that read them" (ATS) stays. So note 9's s-machine opener now reads "The pipeline changed…".
  - The status column in the "Now what? Being found" table shows ✓ instead of "Done".
  - Bex's Studio edits: the s-found-2 heading, the next-post line, and the closer "Reader, I'm not alone."
  - The article is now part 2 of the Career Engineering series. Citations are emptied in Part 1; all 17 belong to #241.
- Later on 2026-11-19, at Bex's direction (Sanity rev `ZjOHrs99VPsiZuws41i4ZA`, check matched all 15 sections):
  - Retitled "I Automated the Pipeline", subtitle "It filled the funnel with cold leads and ate my calendar". Slug changed before publish to `i-automated-the-pipeline`.
  - Restructured to the series format: By the Numbers card (Cohort 2: 109 applications, 15 recruiter screens, 9 hiring-manager rounds, 3 cold screens), § 01 Cold vs. warm callout (the definitions moved from s-effort), The Challenges accordion (CH.01 to CH.04, the four former chapter sections), then the tables and charts as a data run. Only "The chart shows what that cost." was cut; a word count confirmed nothing else was lost.
- Publish-day claims, confirmed by Bex 2026-11-19: the live interview process (re-check on publish day; the company stays unnamed); every role since 2019 through recruiter outreach (the first post asserts it too); a debrief after every interview and a post mortem for every job description at its close; the October 2 re-rank; "last spring". Still open for 2026-12-01: the roadmap statuses, including the LinkedIn title row, and the found-via ✓ row (backfilled on 3 rows).

## Feedback log

*(empty)*
