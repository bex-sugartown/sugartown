# Red Pen — round 3: AI Illustration Review: Every Image Passed. None of Them Should Have. (node, Chorus / ChatGPT / Claude)

**Reviewed:** 2026-11-26. The draft was written on 2026-11-14 in an earlier session, so this session did not write it.
**Source reviewed:** `docs/drafts/ST-116-ai-illustration-review/build.mjs` (the text) and `ST-116-sync.json`. Rounds 1 and 2: `2026-11-14-ai-illustration-review-ethics-accessibility-ip-guardrails.md`, `2026-11-14-ai-illustration-review-round-2.md`.
**Tracking issue:** #116 (On Hold since 2026-11-14)
**Why a third round:** much of the effort the node describes has shipped since the draft was written (#225 closed 2026-11-14, release v0.41.0 on 2026-11-24, #239 share-image stamping). This round re-checks every claim against current state.

## Editor's verdict

Publishable once one dependency clears. Every factual claim I could check still holds against the repo, GitHub and Sanity, and nothing shipped since 14 November makes a sentence false. The one problem is outside the node: it cites Principle 13 and links `/ai-ethics`, and that page still says no image is flagged or stamped (#226, open). A reader who follows the link finds the node contradicted. The other findings are small: a stale pointer in the draft's open questions, an undefined "image CDN", and a glossary term that is now published and can be linked.

## Narrative map

**Thesis:** Bex wrote sound guardrails for AI images and never ran them, so the images shipped unlabelled and one carried brand names in its pixels; the fix is redaction, a visible and embedded stamp, a fifth gate row, and actually running the gate.

**Beats:** hook (TL;DR, cast) → setup (how the rules were decided, what they required) → failure (audit table: the page said / the data said) → investigation (five uses on three pages, ChatGPT's stripped credentials, the 56 days) → fix (redaction, toggles, stamping) → lesson (rule changes, five-row gate, "So, can they ship?", "We will check."). All present, in order.

**Skim skeleton:** "AI Illustration Review: Every Image Passed. None of Them Should Have." · "Or, How Bex's Own Checklist Passed Three Images With No Alt Text, No Labels and Two Brand Names in a Shredder" · "tl;dr: Bex filed a set of rules for publishing AI images, and the images went out anyway." · "How were the guardrails decided?" · "What did the guardrails require?" · "What did the audit find?" · "How was it fixed?" · "What changed in the rules?" · "Tiny Pre-Publish Media Gate (AI + IP)" · "So, can they ship?" · closer "Run it on every AI image before it ships, including the ones already live. We will check."

**Length:** 1,070 prose words plus 234 in tables. Inside the 600–1,800 band. TL;DR present (four sentences).

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | strong | Title, TL;DR and "Nobody ran it." all state it |
| Beat completeness | strong | Every leg present, in order |
| Momentum | strong | Question headings and the short breakaway lines pull forward |
| Payoff | strong | "We will check." returns to the scold the opening set up |
| Skim integrity | adequate | The skeleton tells the story; "Tiny Pre-Publish Media Gate (AI + IP)" is the one non-question heading, which suits an artifact title |
| Length economy | strong | Mid-band, no duplicated paragraph left |
| Theme discipline | n/a | A scold frame, not a controlling metaphor |

## What worked

- "It was the most useful thing here. Nobody ran it." Three short sentences; the third is the thesis.
- "Bex raised it to High priority and left it there for fifty-six days. We counted." Verified (19 September to 14 November is 56 days) and the scold lands in two words.
- "So my label is gone and yours is on." / "Mine is visible." The real trade-off, written as a rivalry.
- The "The page said / The data said" table: four contradictions at a glance, each re-verified below.

## Accuracy results

| Claim | Result | Source |
|---|---|---|
| Image 3 on five uses, three published pages | Verified | Sanity: published docs referencing the redacted asset are `article-claude-code-joins-the-agentic-caucus`, `article-the-great-icloud-divorce` and page `33a205e9…`; #225 Done comment lists the five uses |
| "It went live on 14 November" | Verified | #225 closed 2026-11-14T16:56:58Z |
| Three bars of #FF247D, no change outside the redacted area | Verified | #225 comment: change confined to x 252–474, y 431–516 |
| "alt: glowing tablet", it is a binder | Verified | #225 body |
| Alt null, `aiGenerated` false on all three; no `aiDisclosure`; four-row gate | Verified | Sanity `drafts.node-ai-illustration-review-ethics-accessibility-ip`, last updated 2026-09-05 |
| Issue logged empty alt on 5 September; Bex re-verified 19 September; priority raised to High | Verified | #116 created 2026-09-05; comment 2026-09-19 reads "Priority raised to High" |
| 56 days | Verified | 19 September to 14 November |
| Every source file carried Content Credentials | Verified for all three | Round 1 `stamp.py --detect`, recorded in round 2 |
| Image CDN strips metadata; re-saving drops Content Credentials | Verified | `docs/shipped/ST-178-*.md` §Finding; #225 comment |
| Site serves a stamped copy where one is attached | Verified | `apps/web/src/lib/shareImage.js` (`stampedCopies`, `shareImageUrl`); v0.41.0 notes (#239) |
| Principle 13 | **Contradicted by the linked page** | See finding 1 |
| Bex's 14 November quote ("add to content a note to correct image 3…") | Unverifiable | Not in any repo file or issue; it comes from the session transcript |
| "Reference images … used for context only and were not reused" | Unverifiable | Carried from the original September text; no record found |

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 1 | Accuracy | Rules intro ("Principle 13 of AI Ethics & Operations") and the `/ai-ethics` link | Node says labelling is Principle 13 and links the page | No change to the node text. Add #226 to the working draft's open questions as a publish dependency: do not publish the node until #226 is closed | `docs/briefs/ai-ethics-and-operations.md` lines 248, 250, 251 still read "no image has been stamped yet" and "no image is flagged yet"; `page-ai-ethics` was last updated 2026-10-31; #226 is open. The node would link to a page that says the opposite of it | applied |
| 2 | Accuracy | Working draft, open question "Stamped copies" (`build.mjs`, not published content) | "Until then, 'The site serves the stamped copies' is not yet true." | "Decided 2026-11-14: attach stamped copies to all three node images at sync. The site already serves any attached copy (`shareImage.js`, live on #225's five uses); the node's own images have none until sync." | The quoted sentence is no longer in the node, and serving is now verified | applied |
| 3 | Accuracy | Stamping rules, "Stamp every flagged image…" | Plain text "Stamp" | Link "Stamp" to the glossary term "AI stamp" (`bbdb28f6-1e6d-41a6-aa14-1218ef261cee`) as a `glossaryTermRef` at sync | The handoff on #116 says the term is a draft; Sanity now holds only the published document and no draft, so the "link once both are published" wait is over for the term. Structural insert, not a text edit | applied |
| 4 | Sharpness | ChatGPT line in "What did the audit find?" | "The image CDN strips embedded metadata on the way out" | "The image CDN (the service that delivers images to readers) strips embedded metadata on the way out" | Smart-outsider test: every other term is defined in one clause, this one is not | applied |

Mechanical passes: no banned vocabulary, filler transitions, hedge stacking or triple sentence-openers (scan of the sync text). No em dashes. The ✅, ⚠️ and ⬜ marks are status markers in tables, not decoration.

## Notes to the writer (no edit proposed)

- The node is `On Hold` on #116. Moving it back to `In Progress` is yours to call.
- Sync is still undone: the Sanity draft last changed 2026-09-05 and is the only document that still references the original, unredacted image 3 asset. The sync JSON already uses the redacted copy, so syncing removes the last reference.
- Sync steps are in the 2026-11-14 handoff comment on #116 (upload and attach stamped copies for images 1 and 2, image 3's are uploaded, then `pnpm export:draft check ST-116-ai-illustration-review`).

## Unverifiable claims

1. Bex's 14 November quote about redacting image 3. Confirm the wording.
2. "Reference images … were used for context only and were not reused." Confirm.

## Gate 2 application log

2026-11-28: Bex approved all 4 findings and confirmed both unverifiable claims (14 November quote; reference images line). Findings 1, 2 and 4 applied to `build.mjs`, finding 3 added as a `glossaryTermRef` on "Stamp" (term `bbdb28f6…` is published). Synced to `drafts.node-ai-illustration-review-ethics-accessibility-ip` with stamped copies attached on all three images and the hero; `pnpm export:draft check` matches both sections. Not published; #226 still blocks publish.
