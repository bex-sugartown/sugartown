# Red Pen — AI Illustration Review: Ethics, Accessibility & IP Guardrails (node, forensic agent voice)

**Reviewed:** 2026-11-14
**Document:** `drafts.node-ai-illustration-review-ethics-accessibility-ip`, `_rev` `09b5fb04-3ba9-4d15-9725-e1b6fde8b5a4` (last edited 2026-09-05 12:50 UTC; no published version)
**Working draft:** `docs/drafts/ST-116-ai-illustration-review/ST-116-ai-illustration-review.html`
**Tracking issue:** #116
**Guides read:** `docs/brand/master-voice-cheatsheet.md`, `docs/brand/node-style-guide.md`, `docs/write-node-prompt.md` Step 2.6, `docs/write-pipeline-prompt.md` §0b and §5, `docs/ai/ai-generated-images.md`, `docs/conventions/image-naming-convention.md`, `docs/briefs/ai-ethics-and-operations.md` Principle 13.

## Editor's verdict

The checklist at the bottom is genuinely reusable and the guardrail list is specific. Everything above it is a governance memo, not a node: no failure, no investigation, no narrator, and an opening that could sit on any consultancy site. The weak link is accuracy. The node grades all three images "a11y Pass" while none of them has alt text, says "All published images are AI-generated" while all three are flagged `aiGenerated: false`, and rates image 3 "IP Low Risk" while that image prints "barbie" and "imac" in its own pixels. Not publishable as-is. The fixes are small, and the contradictions are themselves the better node (see Notes to the writer).

## Narrative map

**Thesis:** AI-generated editorial illustrations are safe to publish when they are labelled, carry real alt text, and avoid borrowed brand identifiers.

**Beats:** Hook (missing; opens on "This documents…") → tension (missing; no failure) → escalation (missing) → resolution (the per-image verdicts and the four-row gate) → aftermath ("reusable blueprint"). Only the resolution beat is present. The node arc Failure → Investigation → Fix → Lesson is absent.

**Skim skeleton:**
- Title: "AI Illustration Review: Ethics, Accessibility & IP Guardrails"
- "This documents a formal, multi-dimensional review of AI-generated illustrative thumbnails used on Sugartown.io."
- "Review Dimensions" → "Each image was evaluated against the following criteria:"
- "Thumbnail Review Summary (Ethics + Accessibility + IP)" → (broken table header)
- "IP & Brand Safety Findings" → "None of the AI-generated images reuse official brand assets…"
- "Alt Text & Caption Guardrails (Required)" → "To reduce both accessibility and IP risk, the following rules are mandatory:"
- "Tiny Pre-Publish Media Gate (AI + IP)" → (table)
- "Governance Outcome" → "✅ All reviewed images are approved for editorial use on Sugartown.io."
- Closer: "This node serves as a reusable blueprint for evaluating AI-generated imagery where creative expression, accessibility, and intellectual property concerns intersect."

The skimmer gets the topic and the verdict, not a claim worth remembering.

**Length:** 530 body words (export count, tables excluded); 677 including table text (issue count). Under the 600-word floor, so it reads as a stub. No debt to cut; the gap is the missing arc.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | adequate | Recoverable from the guardrails, never stated as a claim |
| Beat completeness | weak | Resolution only; no failure, no investigation |
| Momentum | weak | Each section is a list of criteria; nothing pulls to the next |
| Payoff | weak | The closer restates the topic instead of landing |
| Skim integrity | adequate | Headings are clear; first sentences are procedural |
| Length economy | adequate | Short, no padding, but under the node floor |
| Theme discipline | n/a | No controlling metaphor |

## What worked

- **"Tiny Pre-Publish Media Gate (AI + IP)"**: the four-row table is the most useful thing on the page. It is short, binary, and reusable, and row 3 flips its options ("⬜ No / ⬜ Yes") so the safe answer is always first. That is a deliberate design choice worth keeping.
- **"Describe what is visible, not what the image references culturally"**: one sentence that resolves both the accessibility and the IP risk at once. Specific and teachable.
- **"Note: This node is not a lawyer."**: the right deadpan instinct for a node. It needs the narrator fixed (finding 8), not the joke removed.
- **"⚠️ Pass (Moderate, Managed)"** on image 2: candour. The one image that most evokes a specific toy line is the one rated higher risk.

## Findings

| # | Tier | Location | Current | Proposed | Why | Decision |
|---|---|---|---|---|---|---|
| 1 | Accuracy | richImage `2058677a9386`, `498bbc803509`, `898936608e04` · `alt` | `null` on all three, while the node grades each "a11y ✅ Pass" | 1: `AI-generated (ChatGPT) illustration: a fashion doll in a red dress at a 1970s mainframe console with tape reels.` (112) · 2: `AI-generated (ChatGPT) illustration: a fashion doll in a pink suit at a 1980s travel agency desk under landmark posters.` (120) · 3: `AI-generated (ChatGPT) illustration: one doll shreds a "Final AI Prompt v12" while another holds a binder at 1990s computers.` (125) | Makes the a11y verdict true; names the tool (§5, Principle 13); ≤125 chars (schema soft max). Builds on the node's own recommended alt, adding the setting (2) and the joke the image exists to tell (3) | pending |
| 2 | Accuracy | same three richImages · `aiGenerated`, `aiTool` | `aiGenerated: false`, no `aiTool` | `aiGenerated: true`, `aiTool: "chatgpt"` | `stamp.py --detect` reads "chatgpt" and C2PA credentials in all three source files. The node's own line "All published images are AI-generated" is false in data until this is set. Turns on the site's "AI-generated" label. Stamping is separate (Notes) | pending |
| 3 | Accuracy | block `6267f52c9b75` (image 3 verdict) | `✅ Pass (Low Risk)` … `Avoid brand names (e.g., Apple) in captions or alt text.` | `⚠️ Pass (Moderate, Managed)` … `The prompt sheet in the image prints "barbie" and "imac". Crop it out or regenerate before any new use.` | Verified by viewing the image: the shredder sheet reads "vintage barbie doll" and "Barbies … imac". Contradicts "None of the AI-generated images reuse … wordmarks" (block `i87t7l4i`). Alternative: replace the image (Notes) | pending |
| 4 | Accuracy | block `i87t7l4i` | `None of the AI-generated images reuse official brand assets, logos, wordmarks, or commercial packaging layouts.` | `None of the images reuse official logos or packaging layouts. One prints two brand names in its own text; that is flagged above.` | Same evidence as 3; keeps the paragraph true either way | pending |
| 5 | Accuracy | block `pnesqib7` (Governance Outcome) | `✅ All reviewed images are approved for editorial use … meet accessibility standards …` | `✅ All three are approved for editorial use, with alt text, the AI label and the image 3 caveat above. ⚠️ Image 3 needs a crop before it is reused anywhere new.` | The outcome must match the corrected verdicts | pending |
| 6 | Accuracy | block `ws3qll6r` | `…the canonical governance document: AI Ethics & Operations.` (plain text) | Link "AI Ethics & Operations" to `/ai-ethics` (`page-ai-ethics`) | Verified the page exists; an unlinked "canonical document" is a dead end | pending |
| 7 | Voice | block `qy7er2lj` | `Note: This node is not a lawyer. It is a product manager applying standard best practices to AI-generated content.  For legal advice, consult a qualified attorney.` | `Not legal advice. I am a language model; Bex is a product manager. Neither of us is a lawyer, and you should ask one.` | Node "I" is the agent and Bex is named (node guide, Pronouns). The current line makes the node a PM. Keeps the deadpan, drops the double space | pending |
| 8 | Voice | block `xf0yyfwr` (opening) | `This documents a formal, multi-dimensional review of AI-generated illustrative thumbnails used on Sugartown.io. The objective is operational clarity — not aesthetic judgment — across three governance dimensions: AI ethics, accessibility, and intellectual property (IP) risk.` | `Three AI-generated doll illustrations, three questions before they ship: is the image honest about where it came from, can a screen reader use it, and would a toy company's lawyer object? I asked all three. The answers were not as tidy as the first draft said.` | Charter 3: the current opening could sit on any consultancy site. The last sentence only stands if 1–5 are approved; drop it otherwise | pending |
| 9 | Voice | front matter · `excerpt` | 300 chars ending "Note: This node is not a…" | `Every AI illustration on Sugartown gets three checks before it ships: honest labelling, alt text a screen reader can use, and no borrowed brand. This node is the checklist.` (172) | One takeaway, principle first, no truncation (issue scope) | pending |
| 10 | Sharpness | blocks `r3wy5fwh`, `svmj6i9l`, `a1prujur` | Line-broken paragraphs posing as lists | Same text as bullet `listItem` blocks | They are parallel items; as single paragraphs a screen reader reads them as one run-on line | pending |
| 11 | Sharpness | blocks `btsha3cp`, `4de7c76b6b5a`, `f3035b832680`, `6267f52c9b75` | Broken HTML table: a header row of newline text and three whitespace-padded verdict blocks between the images | Images stay; each gets a caption (finding 12). The verdicts move to one `tableBlock` under them: Image · Ethics · a11y · IP · Notes, one row per image. The "Recommended Alt Text" column goes (it now lives in each image's `alt`) | Show, don't tell: a real table instead of a pasted one. Structural insert | pending |
| 12 | Sharpness | three richImages · `caption` | `null` | 1: `Image 1 · 1978, the mainframe. Generated with ChatGPT.` · 2: `Image 2 · 1986, the travel agency. Generated with ChatGPT.` · 3: `Image 3 · 1999, the prompt shredder. Generated with ChatGPT.` | Captions earn their place here as the key the verdict table points at; each also names the tool. The brand disclaimer stays once, in the blockquote | pending |
| 13 | Sharpness | block `hk70pthl` (closer) | `This node serves as a reusable blueprint for evaluating AI-generated imagery where creative expression, accessibility, and intellectual property concerns intersect.` | `The four-row gate above is the reusable part. Run it on every AI image before it ships, including the ones already live.` | The current closer restates the topic. "Including the ones already live" lands the image 3 point without inventing a fact | pending |
| 14 | Sharpness | `tags` | AI Ethics | AI Ethics, Audit, Reusable, metadata strategy | 4 tags from the existing 64; nothing created. No accessibility tag exists (Notes) | pending |
| 15 | Sharpness | `related` | `null` | `article-claude-code-joins-the-agentic-caucus`, `article-the-great-icloud-divorce`, `0811c2dc-…` (Post-Mortems as System Upgrades) | The two articles use image 3 as their hero, so the review is about them, a material link. Post-Mortems as System Upgrades only if the reframe in Notes is taken | pending |
| 16 | Sharpness | asset `originalFilename` | `hero-dolly-mainframe-1978.png`, `hero-doll-travel-agency-1986.png`, `hero-doll-imac-1999.png` | Keep the `hero-` prefix. Rename `hero-doll-imac-1999.png` → `hero-doll-prompt-shredder-1999.png` only | The issue says the `hero-` names predate the convention. They do not: the convention lists `hero-` for "doll illustrations", and all three assets are also used as heroes elsewhere (image 3 on two articles, all three on `ds-section-showcase`), so `node-` would be wrong. "imac" is a brand name the node itself bans. Renaming `originalFilename` does not change the image URL | pending |

## Notes to the writer (no edit proposed)

- **The better node is the failure.** The review graded three images Pass for accessibility with no alt text on any of them, and Low Risk for IP on an image that prints "barbie" in its own pixels. That image is the live hero on two published articles. That is Failure → Investigation → Fix → Lesson, ready-made, and it would take the piece past the 600-word floor honestly. Changing the thesis from "here is the checklist" to "the checklist failed its own first test" is your call, not an edit (charter 1).
- **`aiDisclosure` needs your answer.** The three node strings in `write-node-prompt.md` Step 2.6 all name Claude. The node's only tool is ChatGPT, and the copy reads as ChatGPT-drafted. If ChatGPT drafted it, none of the three strings is true, and a new one is needed, for example `Drafted with ChatGPT, edited and directed by Bex Head.`
- **Hero image: recommend none.** The three images are the subject of the review and appear in the body. Promoting one duplicates it at the top. If one is promoted, image 1 (mainframe) is the lowest IP risk.
- **Stamping is not in this issue's scope.** Setting `aiGenerated` turns on the on-site label. The stamped copies (`docs/workflows/ai-image-provenance.md`) are a separate step, and `stamp.py --detect` reports C2PA Content Credentials on all three sources, which stamping drops. That trade-off needs its own decision.
- **Image 3 is live elsewhere.** Whatever is decided here, `/articles/claude-code-joins-the-agentic-caucus` and `/articles/the-great-icloud-divorce` already show the "barbie"/"imac" text, unlabelled, with whatever alt those pages carry. That is a follow-up issue, not this one.
- **No accessibility tag exists** in the taxonomy. Not created (taxonomy pre-flight).

## Unverifiable claims

- "Reference images (historical toy box art and product photography) were used solely for context and were not reused as publishable assets." Cannot be checked from the repo or Sanity. Confirm before publish.
- The years in the filenames (1978, 1986, 1999) are an art-direction claim, not checkable. They appear only in captions under finding 12.

## Decisions, 2026-11-14

| Question | Bex's answer |
|---|---|
| Apply the 16 findings | Stop, let me review again. Nothing applied; all rows stay `pending` |
| Reframe | Reframe as a failure node (Failure → Investigation → Fix → Lesson), drafted in the working draft as a second round |
| `aiDisclosure` | `Narrated by Claude, directed by Bex Head.` |
| Hero image | Promote image 1, the mainframe (`image-5dd197724f810653a84305de2b8d9ce5ff0bab60-1536x1024-png`) |

## Gate 2 application log

(empty)

## Feedback log

(empty)
