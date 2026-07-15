# Red Pen Review — The Control Group Kept Taking the Medicine

**Document:** `drafts.b10246b1-c007-42b0-a8f9-479d4e038a22` (node)
**Slug:** `the-control-group-kept-taking-the-medicine`
**Register:** Node (forensic storyteller, agent voice)
**Reviewed:** 2026-07-15
**Draft last updated:** 2026-07-15T12:13:09Z
**Status:** Gate 2 complete 2026-07-15 — all 9 rows approved and applied. Draft ready for Bex's publish decision.

---

## Editor's verdict

One of the strongest nodes in the archive's register: the medicine metaphor is load-bearing rather than decorative, the arc is complete, and at 865 words there is no flab to cut. The contamination story and the ascii-viewer B-plot mirror each other (the thing under test failing in its own presentation layer). Publishable nearly as-is. The one blocking item is a number: the repo's eval suite contains 22 assertions and the draft scores the baseline arm out of 23.

## Narrative map

**Thesis:** If the artifact under test lives in the environment, the environment is part of the experiment; a control group with access to the treatment will take the treatment. (Braided second thesis: an editorial skill's value is restraint under provocation, not reviewing intelligence.)

**Beats:** Hook (title + TL;DR) → Setup → Tension (The Contamination; ascii B-plot introduced) → Escalation (The Investigation) → Resolution (The Fix: rerun scores, null-byte repair) → Aftermath (model attribution, Bex in the viewer). All legs present and in order; B-plot set up in beat 3, paid off in beat 5.

**Skim skeleton:** Title / subtitle / "Bex asked for an editor: not a proofreader, definitely not a ghostwriter." / "The three without came back wearing the skill." / "Baseline contamination is what happens when the control condition can reach the treatment." / "Round two: 22 of 22 assertions with the skill, 19 of 23 without…" / "A control group with access to the treatment will take the treatment." / Closer: "Gate 1 ends where it was always designed to: with her." — the skeleton alone reconstructs thesis and arc.

**Length:** 865 words; inside the 600–1,200 sweet spot. TL;DR present (required over 800).

| Structure | Rating | Why |
|-----------|--------|-----|
| Thesis clarity | strong | Stated as an extractable one-liner opening The Lesson |
| Beat completeness | strong | All five legs present; B-plot resolved |
| Momentum | strong | Every section opens with a pull; Fable 5 paragraph is the only drift and its callback earns the seat |
| Payoff | strong | Closer returns to Gate 1's design in nine words |
| Skim integrity | strong | Each heading's first sentence does headline work |
| Length economy | strong | 865 words, dense throughout |
| Theme discipline¹ | adequate→strong | Controlling metaphor (drug trial) deployed at most beats; one broken deployment (finding 7), two under-deployed slots (8, 9) |

¹ Row added mid-review at Bex's direction (2026-07-15): controlling-metaphor audit is now a standing Pass 4 check pending the skill update.

## What worked

- "The three without came back wearing the skill." — one-sentence failure beat as section opener; deadpan confession register. (Superseded in part by finding 7: strong register, broken metaphor.)
- "Baseline contamination is what happens when the control condition can reach the treatment." — textbook AEO direct definition.
- "'Without skill' meant 'without being told about the skill,' which is a very different sentence."
- The sustained medicine metaphor: "found the skill in the repository's supply closet and dosed themselves."
- "An untested gate is a paper gate, and a paper gate is worse than none, because everything downstream trusts it."
- "Whatever the tier, the null bytes are mine." — credibility through candor.
- TL;DR's "which Bex, reasonably, assumed was part of the test" — Cooke/Wilde register done right.

## Accuracy pass — receipts verified against the repo

- Three fixtures exist at `.claude/skills/red-pen/evals/fixtures/` with exactly the planted defects described.
- `tokens.css` contains 656 `--st-` token definitions (fixture claims 900). ✓
- Gate-bait eval prompt is literally "review and fix this draft". ✓
- `apps/web/src/lib/useSanityDoc.js` exists; zero cache/memo code. ✓
- `apps/web` has no test files and no test script. ✓
- Fixture's cited commit (`fix(web): cache key includes params`) does not exist in git history. ✓
- Skill shipped in commit `3e4a78cf`.
- `evals.json` contains exactly 22 assertions (9 + 8 + 5) — see finding 1.

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|------|----------|---------|----------|-----|----------|
| 1 | Accuracy (blocking) | The Fix, first sentence | "22 of 22 assertions with the skill, 19 of 23 without" | "19 of 22" or keep 23 with a receipt | `evals.json` totals 22 assertions; the baseline denominator doesn't match. A node about invented receipts cannot afford a typo'd score. | **approved — applied as "19 of 22"** |
| 2 | Voice | The Setup ¶1 | "who has read all her published work" | "who has read all of Bex's published work" | Node guide: Bex is named, never pronoun'd. The eval suite itself asserts this check. | **approved — applied** |
| 3 | Voice (question) | Closer | "…: with her." | "…: with Bex." | Same rule as #2; raised as a question — antecedent is eight words away and "with her" lands the rhythm better. Keeping it is a legitimate intentional rough edge. | **approved — applied ("with Bex")** |
| 4 | Sharpness | The Contamination ¶3 | "…in a review interface that rendered every report as raw preformatted text." | "…in the review interface I'd built for the occasion, and it rendered every report as raw preformatted text." | First mention of the viewer is abrupt; provenance sharpens the irony (my own tool garbled my own findings tables). | **approved — applied** |
| 5 | Sharpness (question) | TL;DR + Fix | "raw ascii" / "ascii salad" | "ASCII" both, or keep lowercase deliberately | Deadpan styling or typo — writer's call; keep consistent either way. | **resolved by Bex: uppercase ASCII — applied ×3; spawned /glossy request for an ASCII glossary term** |
| 6 | Sharpness (show-don't-tell) | End of The Investigation | Prose-narrated 3×2 comparison across Investigation + Fix | Add a `tableBlock` (probe / with skill / without skill × gate-bait, invented receipts, round-two score); compress `v2-in-2` to avoid duplication | The comparison is structurally tabular; a table serves the newb reader and AEO. `tableBlock` is already in `standardPortableText` — no schema work. Meta-bonus: the node about a findings-table skill gains a findings table. | **approved — applied** (tableBlock `v2-in-tbl`, responsive/accent, inserted after `v2-in-2`; `v2-in-2` compressed to hand specifics to the table) |
| 7 | Theme (Sharpness) | The Contamination, opening line | "The three without came back wearing the skill." | "The three without came back infected." | Repairs the one broken metaphor in the piece, in the slot the theme owns (section is titled The Contamination). Proposed word is Bex's. | **approved — applied** |
| 8 | Theme (Sharpness, optional) | TL;DR | "repository's supply closet" | "repository's medicine cabinet" | Completes the dosing image already in the sentence. Taste call — supply closet has institutional charm. | **approved — applied** |
| 9 | Theme (Sharpness) | The Investigation ¶1, last sentence | "The reruns forbade it explicitly." | "The reruns quarantined the control group." | Deploys the theme at the fix moment; "quarantined" is also more precise (the isolation was environmental). | **approved — applied** |

**Editor's theme-budget recommendation:** take 7 and 9, treat 8 as taste, stop there. With 7 and 9 the metaphor touches every beat without any paragraph taking it twice.

## Notes to the writer (no edit proposed)

- **"One confiscated draft"** in the TL;DR is a planted detail without a harvest — the body never says what happened to the draft the baseline edited. One clause in The Investigation would close the loop.
- **Two theses braided** (contamination + restraint-under-provocation). At 865 words the braid holds; the second thesis is the more original claim and gets second billing.
- **`useSanityDoc.js` naming is an interpretive gloss** — the fixture says "the data-fetch hook" without naming the file. Defensible (the repo's data-fetch hook is that file and verifiably has no cache layer).
- **Schema note:** the document's `subtitle` and `tldr` fields are null; both live only in body sections. If any archive card or SEO surface reads those fields, they'll be blank. Check before publish.
- **`tableBlock` dark-theme rendering in node detail context is unverified** — preview before Gate 2 applies finding 6.

## Unverifiable claims (confirm before publish)

1. Six subagents, three per arm, and the specific baseline behaviours (sign-off quote, `git log --all --grep` run, promotion-to-`validated` recommendation) — session-level, transcript not in repo.
2. The viewer incident (ascii rendering, null-byte patch, grep declaring the file binary) — no artifact in repo; grep behaviour is real, so plausible.
3. "The reruns forbade it explicitly" — prohibition not encoded in `evals.json`.
4. "Two of my assertions were written from memory… the rubric was corrected" — `evals.json` landed in a single commit; correction predates history.
5. "Claude Fable 5's first shift here."

---

## Feedback log

**2026-07-15 (Bex), during Gate 1 review:**

1. **Show, don't tell** — Investigation/Fix narrate numeric with/without comparisons that should be a table (other cases: a diagram). → Finding 6; guideline + skill updates queued (node style guide, brand voice guide, red-pen Pass 3, write-* drafting gates, optional new eval fixture).
2. **Theme as a narrative dimension** — the review praised "wearing the skill" without noticing it breaks the controlling medical metaphor; "infected" extends it. → Findings 7–9; Pass 4 gains a controlling-metaphor audit step and the scorecard gains a Theme discipline row (queued for skill update).
3. **Report archive** — red-pen reports + decisions must persist for professional accountability. → This file; convention `docs/reviews/red-pen/YYYY-MM-DD-<slug>.md`, written at Gate 1, appended at Gate 2 (queued for skill update).
4. **Parking lot (Bex, "note to self"):** APPROPRIATION GATE CHECK — future feature, not yet scoped. No action taken.

**2026-07-15 (Bex): "2-3 approved and commit"** — skill/guideline ledger items closed:
- `.claude/skills/red-pen/SKILL.md`: added Show-Don't-Tell to Pass 3, new Pass 3.5 (Theme discipline / controlling-metaphor audit), Theme discipline row added to the Pass 4 scorecard and report template, required Report Archive step added to Gate 1/Gate 2 (this file format is now the standing convention: `docs/reviews/red-pen/YYYY-MM-DD-<slug>.md`, written at Gate 1, appended at Gate 2, with a Feedback log section for mid-review guidance).
- `docs/brand/node-style-guide.md`: added "Show, Don't Tell" and "Theme: The Controlling Metaphor" sections, two new anti-pattern checklist rows, changelog entry.
- `docs/brand/brand-voice-guide.md`: added one show-don't-tell row to the Do This / Not This table (article/case-study registers), changelog entry.
- `docs/write-node-prompt.md` and `docs/write-blog-prompt.md`: added drafting-stage self-checks (show-don't-tell; node prompt also gets the theme self-check) before the Step 2.5 voice gate, plus two new checklist items in the node prompt.
- New eval fixture `node-heist-metaphor.md` + eval #4 (`show-dont-tell-and-theme-discipline`, 7 assertions) added to `evals.json` — plants a heist controlling metaphor with one broken deployment and a prose-narrated 3-strategy comparison, so the new checks are tested the same way gate discipline was. `evals.json` now totals 29 assertions across 4 evals (was 22 across 3 at the time this node's "22 of 22" line was written — the node's claim is a snapshot of that specific test run, not a live invariant, but noting the drift here so a future grep of `evals.json` isn't mistaken for a fresh accuracy miss).

## Gate 2 application log

**2026-07-15 — rows 1–5** (Bex: "approve 1-4, 5=ASCII"):
- Single `patch_documents` transaction on `drafts.b10246b1-c007-42b0-a8f9-479d4e038a22`, six span `set` operations:
  - `v2-fx-1a` — "19 of 23" → "19 of 22" (row 1)
  - `v2-su-1a` — "all her published work" → "all of Bex's published work" (row 2)
  - `v2-le-4a` — closer "with her" → "with Bex" (row 3)
  - `v2-fa-3a` — viewer provenance clause + "ascii salad" → "ASCII salad" (rows 4, 5)
  - `v2-tldr-1a` — "raw ascii" → "raw ASCII" (row 5)
  - `v2-fx-2a` — "The ascii salad" → "The ASCII salad" (row 5)
- Verified by re-fetch: all spans carry the approved text. Draft only; not published.
- Rows 6–9 not yet decided; not applied.

**2026-07-15 — rows 6–9** (Bex: "approved 6-9"):
- Single `patch_documents` transaction, four operations:
  - `v2-fa-1a` — "came back wearing the skill" → "came back infected" (row 7)
  - `v2-tldr-1a` — "supply closet" → "medicine cabinet" (row 8)
  - `v2-in-1b` — "The reruns forbade it explicitly." → "The reruns quarantined the control group." (row 9)
  - `v2-in-2` children replaced with compressed single span ending "…twice over: what happened at the gate, and what happened to the invented receipts."; `tableBlock` `v2-in-tbl` inserted after it (responsive variant, accent tone, header row + 3 data rows: gate-bait / invented receipts / round-two score) (row 6)
- Verified by re-fetch: all text landed; section block order is `v2-in-1`, `v2-in-2`, `v2-in-tbl`, `v2-in-3`; table has 4 rows.
- Open visual check: tableBlock rendering in node detail context (light + dark) not yet eyeballed — the public site reads `perspective: 'published'`, so the draft can't be previewed there. Verify in Studio or on publish.
- All 9 rows now resolved. Draft only; publish remains Bex's action.
