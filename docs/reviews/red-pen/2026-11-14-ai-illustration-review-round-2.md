# Red Pen — round 2: AI Illustration Review: The Guardrails Passed. The Images Didn't. (node, Chorus / ChatGPT / Claude)

**Reviewed:** 2026-11-14, by a fresh-context reviewer agent (the draft was written in the same session, so the session did not grade it). The orchestrating session checked the findings below before they reached Bex.
**Source reviewed:** `docs/drafts/ST-116-ai-illustration-review/ST-116-sync.json` (exact text) and the working draft HTML. Round 1: `2026-11-14-ai-illustration-review-ethics-accessibility-ip-guardrails.md`.
**Tracking issue:** #116

## Editor's verdict

The reframe works: a real arc, a narrator with a grievance, and lines that land ("Nobody ran it.", "We counted.", "Mine is visible."). The weak link is accuracy again, in a new place: the "decided" and "required" sections show the round-2 rules (labelling in the ethics question, "the image itself" in the brand rule) as if they were the original rules, so the scold blames Bex for rules that did not exist yet, and the "What changed" section contradicts them. Smaller problems: "Ten weeks later" is miscounted, the subtitle credits ChatGPT with the audit, "no label on any of them" is false, and the stamping paragraph is in the present tense for something only true after sync. Close to publishable; findings 1 to 7 should land before sync.

## Narrative map

**Thesis:** Bex wrote sound guardrails for AI images and never ran them, so the images shipped without alt text or a label, one with brand names in its pixels; the fix is a fifth gate row, a stamp, and running the gate.

**Beats:** hook (TL;DR, cast) → setup (decided, required) → tension ("Nobody ran it.") → escalation (audit table, five uses, stripped credentials, 56 days) → resolution (redaction, toggles, stamping) → aftermath (rule changes, gate, verdict table, closer). All present and in order.

**Skim skeleton:** title "AI Illustration Review: The Guardrails Passed. The Images Didn't." · subtitle "Or, How ChatGPT and Claude Audited Bex's Own Checklist…" · TL;DR "Bex filed a set of rules for publishing AI images, and the images went out anyway." · "How were the guardrails decided?" · "What did the guardrails require?" · "What did the audit find?" "On 14 November 2026 Claude ran an editorial review…" · "How was it fixed?" (opens on a Bex quote) · "What changed in the rules?" "Two things." · gate table · "Governance outcome" · closer "Run it on every AI image before it ships, including the ones already live." Dead skim slots: "Two things." and the fix-section quote.

**Length:** 1,058 prose words plus 234 in tables. Inside the 600–1,800 band; TL;DR required and present.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | strong | Title, TL;DR and "Nobody ran it." all state it |
| Beat completeness | strong | Every leg present, in order |
| Momentum | strong | Question headings and breakaway lines pull forward |
| Payoff | adequate | The closer instructs but drops the scold (finding 14) |
| Skim integrity | adequate | Two dead first lines |
| Length economy | strong | Mid-band; one duplicated paragraph pair (finding 12) |
| Theme discipline | n/a | A scold frame, not a controlling metaphor |

## What worked

- "And a four-row pre-publish gate, at the bottom of this page. It was the most useful thing here. Nobody ran it." Three shrinking sentences; the third is the thesis. Do This candidate.
- "They are good questions. We would like that on the record before what follows." Praise that raises the cost of the failure.
- "It was. Bex raised it to High priority and left it there for fifty-six days. We counted." Forensic, verified, and the scold in two words.
- "So my label is gone and yours is on." / "Mine is visible." The real trade-off as a rivalry.
- "I mention this not to shift the blame, only to note where it landed." Shifting blame while denying it.
- The "The page said / The data said" table: four contradictions in one glance.

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 1 | Accuracy | "What changed in the rules?" first block | `Two things. The stamping rules are now part of the guardrails:` | `Three things. The ethics question now asks for a label and the brand rule now covers the pixels; both appear above in their new form. The stamping rules joined the guardrails:` | The original ethics criterion had no labelling and the brand rule did not cover the image; stamping dates from ST-178 (October). Without this, the scold blames Bex for rules she never filed | approved, applied |
| 2 | Accuracy | TL;DR | `Ten weeks later the machines read the rules back. Not one image had alt text, not one was labelled, and one carried … The names are now under pink paint, the labels are on, and the rules have a fifth row.` | `On 14 November the machines read the rules back. On this page, not one image had alt text or a label, and one carried two brand names in its own pixels while appearing on three published pages. The names are now under pink paint, the labels are on, and the gate has a fifth row.` | "Ten weeks" counts from the issue, not from when the rules were filed; image 3 had alt text elsewhere; the gate gained the row | approved, applied |
| 3 | Accuracy | hero subheading | `Or, How ChatGPT and Claude Audited Bex's Own Checklist and Found No Alt Text, No Labels and Two Brand Names in a Shredder` | `Or, How Bex's Own Checklist Passed Three Images With No Alt Text, No Labels and Two Brand Names in a Shredder` | The cast list says Claude audited; ChatGPT made the images | approved, applied |
| 4 | Accuracy | audit section, "Five uses…" | `Five uses, three published pages, no label on any of them.` | `Five uses, three published pages.` | **Confirmed wrong by the session:** the iCloud inline image already had `aiGenerated: true` and an "AI GENERATED" caption before the swap | approved, applied |
| 5 | Accuracy | Claude line before the Bex quote | `The review issue was raised on 5 September. Two weeks later, Bex checked it again.` | `Issue #116 logged the empty alt text on 5 September. Two weeks later, Bex checked it again.` | The #116 body already recorded null alt on 5 September; Bex knew, which sharpens the 56 days | approved, applied |
| 6 | Accuracy | stamping paragraph | `…and IPTC metadata (the industry tag for machine-made media) written into the file. The site serves the stamped copies instead of the CDN image, so the label survives a download.` | `…and an IPTC tag (the photo-metadata standard's marker for machine-made media) written into the file. Wherever a stamped copy is attached, the site serves it instead of the CDN image, so the label survives a download.` | True today only where copies are attached; IPTC is a general standard and the AI marker is one field in it | approved, applied |
| 7 | Accuracy | redaction paragraph | `a pixel-by-pixel comparison with the original found changes only inside the bars.` | `a pixel-by-pixel comparison with the original found no change outside the redacted area.` | The diff measured one bounding box around all three bars, not each bar | approved, applied |
| 8 | Voice | opening Chorus line | `**Chorus** *(with affection)*: Bex filed the rules…` | Unlabelled: `Bex filed the rules both of us were supposed to be held to, and then did not hold the images to them.` | Unlabelled lines are already the Chorus. Taste call: keeping "(with affection)" needs the label | kept as is (see log) |
| 9 | Voice | ChatGPT and Claude lines after the opening | `ChatGPT: I made the images.` / `Claude: I audited them.` | Cut both | They repeat the cast list four lines later and spend two of ten labels | approved, applied |
| 10 | Sharpness | title and hero heading | `AI Illustration Review: The Guardrails Passed. The Images Didn't.` | `AI Illustration Review: Every Image Passed. None of Them Should Have.` | Guardrails don't "pass"; the review passed the images | approved, applied |
| 11 | Sharpness | excerpt | `Every AI illustration on Sugartown gets three checks before it ships: … This node is the checklist.` | `Bex wrote three checks for AI images: label them, describe them, keep brands out. Three images shipped without them, one on three published pages. ChatGPT and Claude would like a word.` | The round-1 excerpt advertises the old thesis | approved, applied |
| 12 | Sharpness | paragraph after the Correction | `The copy replaced the original on all five uses and on this page, and went live on 14 November. Every use now has…` | `It went live on 14 November. Every use now has the AI-Generated toggle on, names ChatGPT as the tool, and carries alt text that describes what is visible.` | The Correction already says the replacement | approved, applied |
| 13 | Sharpness | h2 "Governance outcome" | `Governance outcome` | `So, can they ship?` | The only non-question heading in the arc | approved, applied |
| 14 | Sharpness | closer | `…including the ones already live.` | `…including the ones already live. We will check.` | Returns to the scold; taste call | approved, applied |

Mechanical passes: no banned vocabulary, filler transitions, brand names or triple sentence-openers. Em dashes and the ✅/⚠️ marks are allowed in this register.

## Notes to the writer (no edit proposed)

- If ChatGPT drafted the original review, its credentials line is the place for a one-line admission. Needs a receipt: who drafted the original copy is not on record.
- `docs/briefs/ai-ethics-and-operations.md` Principle 13 and the `/ai-ethics` page still say "no image has been stamped yet" and "no image is flagged yet". After this round they contradict the node they are linked from. A follow-up for the ethics doc.
- Whether image 3's stamped copies also go onto the two articles and the showcase page decides whether gate row 5 is true for image 3 site-wide. (Decided 2026-11-14: yes, at sync.)
- The gate heading "(AI + IP)" undersells rows 4 and 5. Taste call; left alone.
- The verdict table and "Governance outcome" become true at sync, when the node's own alt text and toggles are written.

## Unverifiable claims

- The 2026-09-19 issue comment was posted from the shared `bex-sugartown` account; the words are exact. Confirm Bex wrote it.
- The second Bex quote is exact: the session checked it against Bex's chat message of 2026-11-14.
- "Every file I exported carried Content Credentials" rests on the round-1 `stamp.py --detect` results (all three source files: `c2pa: true`).
- Reference-image claim: confirmed by Bex in round 1.
- The years in the captions: art direction, not checkable.

## Gate 2 application log

**2026-11-14.** Bex selected "Approve all 14" and, in the same popup, ticked every row except #8. The session read the deliberate omission as keeping #8 out: the labelled Chorus line with "(with affection)" stays as it is. Say so if #8 was meant to apply too.

Applied to `docs/drafts/ST-116-ai-illustration-review/build.mjs` verbatim as proposed (rows 1–7 and 9–14), then rebuilt the working draft and `ST-116-sync.json`. Title and hero heading both changed (#10). Checks after the rebuild: 1,070 body words, excerpt 184 characters, no brand names, "Ten weeks" and "Two things" gone. Nothing written to Sanity.

## Feedback log

(empty)
