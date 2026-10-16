# Red Pen: A Five-Minute Call That Was an Application (article, Bex first-person PM)

**Reviewed:** 2026-10-16. **Source:** `docs/backlog/ST-173-article-five-minute-call-that-was-an-application.md`, lines 107 to 150 (article text). **Guides read:** `master-voice-cheatsheet.md`, `brand-voice-guide.md`, `write-pipeline-prompt.md` §4. **Draft written in this session:** no.

## Editor's verdict

Publishable after fixing one number comparison. The hook is strong (an invite promising a person, a page saying "No sessions scheduled") and the 16px versus 12px beat is the best line in the piece. The weak link is the 6.7% to 3.7% comparison, which sets a cold-apply rate against an everything-else rate. The ending trades the payoff for a teaser about a different piece.

## Narrative map

**Thesis:** An invite that looked like a person reaching out was a funnel with no message match, and my data says only real human-first contact converts, so that gap is the cost.

**Beats:** hook (invite) → tension (empty RSVP page) → analysis (page source, fine print) → evidence (cohort table) → principles (three funnel basics) → second example (testjob) → limits (what I cannot say) → teaser (follow-up). Escalation is thin: the second example arrives after the lesson, so it reads as a coda.

**Skim skeleton:** "A Five-Minute Call That Was an Application" / "The invite that promised a person" / "An application wearing a calendar invite as a costume (USE FOR HERO ART - BECKY BOOP PROMPT)" / "Two doors, and one of them works" / "Three funnel basics the page broke" / "Hi, Becky, hold my beer! Hugs, Phil (Your Career Advisor)" / "What I cannot say" / "What the follow-up will cover". Closer: "...the follow-up will say so."

**Length:** about 700 words counted with `sed -n 107,150p | wc -w` (includes tables and subheads). Band 400 to 1,200. Debt: the follow-up section (about 150 words) spends words on another piece.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | adequate | Recoverable from "Two doors" onward, never stated in one sentence |
| Beat completeness | adequate | All beats present, second example is a coda |
| Momentum | adequate | Strong through the table and basics, slows at the testjob and follow-up |
| Payoff | weak | Ends on a promise about another article |
| Skim integrity | adequate | Subhead 5 is opaque alone; subhead 2 carries a production note |
| Length economy | adequate | Inside band, last section is debt |
| Theme discipline | adequate | See Pass 3.5 |

## What worked

- "The promise is set in 16px bold. The caveat is set in 12px." A measured fact does the accusing; no adjectives needed.
- "I am describing a funnel, not accusing a vendor." Stakes and limits in one line, and it matches the Non-Goals.
- "But the pattern is loud: a human choosing me first works, and the portal almost never does." Hedge then position, in that order.
- "One QA leak says nothing about the whole company. It does show where the checkpoint belongs." Restraint plus a point.

## Pass results

**Accuracy.** Checked against sources I could open:

| Claim | Result |
|---|---|
| 6.7% cold-apply rate in the June post | Verified on the live post: "cold-only sits at 6.7%, below the 8% tech-sector benchmark" |
| 3.7% is "the cold-apply rate now" | Wrong as worded: 3.7% is all 82 non-recruiter applications (finding 1) |
| UW study: 85.1% and 11.1%, 500+ resumes | Verified on arXiv 2407.20371 abstract. Tests embedding models in a retrieval framework simulating selection |
| Arithmetic: 10 + 82 = 92, 3/82 = 3.66%, 28+27+21+2+4 = 82 | Verified by calculation only |
| 92 applications, 10 of 10 recruiter-first, 3 of 82 other | Verified 2026-10-16 in `resume-factory/data/00 FUNNEL ANALYSIS 2026-08/findings.json`: `funnel.applied` 92; `channel` applied 28+27+10+21+2+4, screened Board 1, Recruiter 10, Cold 1, Referral 1 |
| Invite email text, time slot, "live event", virtual queue, fine print | Verified against the redacted screenshot `ziprecruiter-invite-email_redacted.png` (Oct 12, 2:41 PM; "Next Available: Wednesday, October 14 at 2:00 PM PDT") |
| "No sessions scheduled", Apply Now, No Thanks | Verified on `ziprecruiter-rsvp-landing.png` |
| 16px bold promise, 12px fine print | Not re-verified: the invite `.eml` is not in the repo or Downloads. Source is the 2026-10-15 handoff §3 |
| Oct 14 testjob email: "really good fit", testjob_apr01, WFNQAFR44D | Verified on the `.eml` (Downloads, copied to `source-originals/`). Sent Wed 14 Oct 2026 21:28:49 UTC = 2:28 PM PDT. DKIM, SPF and DMARC pass for `mg.ziprecruiter.com` / `ziprecruiter.com` (finding 9) |
| UW study affiliation | Verified on the AIES 2024 page (aaai.org, vol 7 no 1, pp. 1578 to 1590): Wilson and Caliskan, University of Washington. Abstract: over 500 resumes and 500 job descriptions, 85.1% White-associated, 11.1% female-associated |
| "Preprint" for AI-preferring-own-resumes (arXiv 2509.00462) | Verified: "non-archival submission at EAAMO 2025 and AIES 2025"; self-preference 67% to 82% |
| Handoff figures "85% vs 9%", "male 52% vs 11%", "550+ resumes" | Not in the abstract. The draft already dropped them. Keep dropped |

**Voice.** Zero em dashes (grep). No banned vocabulary or filler transitions (grep against the §4 list). No emoji. First-person contract holds (Bex observes, no code claimed).

**Theme (Pass 3.5).** Controlling image is passage: doors, gate, pipeline, funnel, costume. One family, no broken deployment. "Costume" is promised in a subhead and the body never spends it.

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|------|----------|---------|----------|-----|----------|
| 1 | Accuracy | "Two doors", paragraph after table | "In June I reported a cold-apply rate of 6.7%. It is now 3.7%." | "In June my cold-apply screen rate was 6.7%. Every non-recruiter route combined is now 3.7%." | 3.7% is 3 of 82 across boards, cold, referrals and alerts; 6.7% was cold-only. The 2.5% pure-portal figure is still an open decision and unverified | approved, applied |
| 2 | Accuracy | "Two doors", intro | "How each one started matters more than anything on the resume." | "How each one started looks like the strongest signal in my data." | n=10 and a different cohort cannot carry "more than anything"; needs a receipt otherwise | approved, applied |
| 3 | Accuracy | Epic doc, Objective vs Draft table | Objective: "about 620 words". Draft table: "about 700 words" | Set both to "about 700 words" | Word count measured at 700 | approved, applied |
| 4 | Voice | Subhead 2 | "An application wearing a calendar invite as a costume (USE FOR HERO ART - BECKY BOOP PROMPT)" | "An application wearing a calendar invite as a costume" | A production note would ship as a public heading. The note already lives in the Hero image section | approved, applied |
| 5 | Sharpness | Last paragraph | "Whether anything like it sits behind a portal I applied through, I cannot know, and the follow-up will say so." | "Whether anything like it sits behind a portal I applied through, I cannot know." | "What I cannot say" already covers it, and "the follow-up will say so" repeats the section opener | approved, applied |
| 6 | Sharpness | Third funnel basic | "The page knew there was no session. The email did not. "What if the slot is gone?" needs an answer before the send." | "The page knew there was no session; the email did not. Answer "what if the slot is gone?" before the send." | Bullet 3 is the only one of three that runs to three sentences | approved, applied |
| 7 | Theme | Opening of "An application wearing..." section | "The email is real, and the link goes exactly where it says:" | "The costume is convincing. The email is real, and the link goes exactly where it says:" | Spends the subhead's metaphor once in the body. Taste call; skip if the hero art carries it | approved, applied |
| 8 | Accuracy | Epic doc, Hero image alt text | "Black-and-white 1930s cartoon. A deadpan Becky B00p side-eyes a robot dangling from a fishing hook in a flimsy calendar costume, while a steaming funnel machine swallows a heap of forms and lets out a single application. Generated with ChatGPT." | "Black-and-white cartoon with hot pink and teal accents. A deadpan Becky B00p, hands on hips, side-eyes a robot in a calendar costume and a Claude name tag, dangling from a hook. On the right, a steaming funnel machine swallows a heap of forms and lets out a single application. Generated with ChatGPT." | The image has hot pink and teal colour on a black background, not pure black and white, and it shows the Claude name tag. "Fishing hook" and "1930s" are not checkable from the image | approved, applied |
| 9 | Accuracy | Epic doc, Evidence table, Oct 14 email row | "observed; headers (DKIM, SPF, DMARC) not verified" | "measured; `.eml` headers checked 2026-10-16: DKIM, SPF and DMARC pass (d=mg.ziprecruiter.com, from ziprecruiter.com)" | Closes the open decision. The article text may now say it came from ZipRecruiter's sending system, not only "arrived from ziprecruiter.com" | approved, applied |

## Notes to the writer (no edit proposed)

- **Payoff.** The piece earns its hook and then closes on a teaser. Consider whether the "What I cannot say" section is a stronger closer than the follow-up section, with the teaser as one line after it. That is a structure choice, not a rewrite.
- **Subhead 5** ("Hi, Becky, hold my beer! Hugs, Phil...") works only if you read the paragraph. A skimmer gets a joke with no referent. Your 2026-10-15 decision keeps it; this is a note, not an edit.
- **Open decision 3** (re-open the June post for 6.7%) is resolved by this review: the figure is confirmed, but it is a cold-only rate (finding 1).
- **Thesis** never appears as one sentence. Consider whether "Two doors" should open with it.

## Unverifiable claims (confirm before publish)

1. 16px bold promise and 12px fine print: the invite `.eml` is not on disk; confirm from the original or drop the figures.
2. "Next Available" written at send time (your page-source reading; worded "my read").
3. "The full follow-up lands at the end of October": ST-162 waits on the 10-30 headline read; confirm the date still holds.
4. 2.5% pure-portal figure (handoff says "2 of 81"): from `findings.json`, Board 27 + Alert 28 + Cold 21 + Untagged 2 = 78 non-referral applications with 2 screens, so 2 of 78 = 2.6%. "2 of 81" matches no channel split I can reconstruct. Do not cite 2.5% until reconciled. The article does not cite it today.

## Assets saved (2026-10-16)

In `resume-factory/data/content/drafts/linkedin-ziprecruiter/` (never gitted):

| Folder | File | Use |
|---|---|---|
| `upload-ready/` | `article-five-minute-call-hero.webp` (1672x941) | Hero, `imageWidth: content-width` |
| `upload-ready/` | `article-five-minute-call-invite-email-redacted.png` (1229x1378) | Inline figure; sender name blacked out |
| `upload-ready/` | `article-five-minute-call-rsvp-landing.png` (1490x1150) | Inline figure; no personal data visible |
| `source-originals/` | `article-five-minute-call-hero-original.png` (2.9 MB) | Editable original of the hero |
| `source-originals/` | `testjob_apr01-email.eml` | Evidence for the Oct 14 email; contains your address, never upload |

| `upload-ready/` | `article-five-minute-call-testjob-email.png` (845x1568) | Inline figure, added by Bex. Gmail label chips are gone; the "to bex" line under the sender is still visible |

## Gate 2 application log

Approved by Bex via AskUserQuestion 2026-10-16: all 9 rows. Applied verbatim with Edit to `docs/backlog/ST-173-article-five-minute-call-that-was-an-application.md`:

| # | Old text | New text |
|---|---|---|
| 1 | "In June I reported a cold-apply rate of 6.7%. It is now 3.7%." | "In June my cold-apply screen rate was 6.7%. Every non-recruiter route combined is now 3.7%." |
| 2 | "matters more than anything on the resume." | "looks like the strongest signal in my data." |
| 3 | Objective "about 620 words" | "about 700 words" |
| 4 | Subhead "...as a costume (USE FOR HERO ART - BECKY BOOP PROMPT)" | "...as a costume" |
| 5 | "I cannot know, and the follow-up will say so." | "I cannot know." |
| 6 | Funnel basic 3, three sentences | "The page knew there was no session; the email did not. Answer "what if the slot is gone?" before the send." |
| 7 | "The email is real, and the link..." | "The costume is convincing. The email is real, and the link..." |
| 8 | Hero alt text | Pink and teal accents, name tag, hands on hips |
| 9 | Evidence row "headers not verified" | "measured; .eml headers checked 2026-10-16: DKIM, SPF and DMARC pass" |

Nothing was written to Sanity. The article text itself still carries the compliance gate, so re-run the em dash and publish checks after these edits.

## Feedback log

(empty)
