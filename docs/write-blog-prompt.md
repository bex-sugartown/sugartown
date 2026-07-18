# /write-blog — Article (Blog Post) Skill

Creates an article post as a Sanity draft (`_type: "article"`).

**Argument:** the topic, angle, or brief to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides and ethics requirements

Before drafting anything, read:
- `docs/brand/brand-voice-guide.md` — full voice, anti-slop rules, first-person narrator split
- `docs/briefs/ai-ethics-and-operations.md` — disclosure and attribution requirements (Principles 3, 11, 13)

Key reminders for articles (opposite of nodes):
- **"I" = Bex.** Articles are written in Bex's voice — PM, plain language, first person.
- **AI gets credit for building, not narrating.** "Claude built the schema. I reviewed it." Not "I built the schema using Claude."
- **No forensic storytelling arc.** Articles are essays, tutorials, opinion pieces, or reflections. They have a thesis, not an incident report.
- **Anti-slop rules apply fully** — no em dashes, no decorative emoji, no AI vocabulary ("leverage", "delve into", etc.).
- **Plain language first.** Bex writes the way she talks to clients — direct, specific, occasionally wry, never performed.

---

## Step 1 — Pre-flight taxonomy

Run the standard taxonomy pre-flight — see `docs/write-pipeline-prompt.md` §1 for the
queries — and consult its §2 metadata reference field matrix for what `article` supports.

Article-specific target ranges:
- 1–2 categories
- 3–6 tags
- Tools only if the article is specifically about those tools
- Authors: Bex Head by default (look up her person _id)
- Project: Sugartown CMS if relevant

---

## Step 2 — Draft the article

Articles are flexible in structure — no fixed arc. Common shapes:

- **Essay/opinion** — thesis, argument, evidence, conclusion
- **Tutorial/how-to** — problem, approach, steps, result
- **Reflection/retrospective** — what happened, what changed, what it means
- **Explainer** — concept, why it matters, how it works, what to do with it

Structure the sections to serve the argument, not a template. Use `heroSection` first (with eyebrow "Article"), then `textSection` blocks for the body. Section headings should carry meaning — not "Introduction" or "Background."

**Voice checklist:**
- "I" is Bex throughout
- No em dashes
- No decorative emoji
- No AI-isms: leverage, delve, utilize, learnings, excited to announce
- No hedge stacking
- No bullet-list substitutes for prose
- Specific over general: numbers, names, examples, not adjectives
- Anti-slop checklist from `docs/brand/brand-voice-guide.md` before finalising

Run the shared write-time self-checks (`docs/write-pipeline-prompt.md` §3) before Step 2.5.

**Length budget:** target band 400–1,200 for standard articles, long-form (1,200–2,500) only
if the argument genuinely requires it (engagement peaks around 1,600 words and declines
after). If the draft runs over budget, detail sections pay first — the thesis and the closer
are never the cut.

**Skim skeleton:** title, subheads, first sentence of each section, and the closer. It
should carry the thesis and the argument's shape on its own.

---

## Step 2.5 — Brand voice compliance gate (blocking — runs before any Sanity write)

Do not call `create_documents_from_json` until every item below is resolved. This is not a suggestion pass — it is a blocking checklist. Fix violations in the draft before proceeding.
Run the shared compliance gate (`docs/write-pipeline-prompt.md` §4 — banned vocabulary,
filler transitions, structural tells) alongside the article-specific items below.

**Em dashes (zero tolerance in articles):**
Scan all drafted text for `—`. Replace every instance:
- Before a clause: use a colon or restructure into two sentences.
- Around a parenthetical: use parentheses or commas.
- No exceptions. The em dash is the single most reliable AI-output tell.

**Article-specific structural tell:** more than two bullet lists in the full article →
convert at least one to prose.

**"I" check:**
Verify every first-person sentence is attributable to Bex. If a sentence reads as AI narrating its own process ("I generated", "I produced", "I drafted"), rewrite: "Claude drafted X. I reviewed it."

After completing this scan, state explicitly: **"Compliance gate passed — no violations found."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

See `docs/write-pipeline-prompt.md` §5 for the shared disclosure mechanics (ethics-doc
citation, tools-field attribution, images/alt-text rule). Article-specific mechanism:

**Articles have no `aiDisclosure` schema field**, so disclosure is expressed through two mechanisms:

**1. A disclosure callout section** — always include a `calloutSection` at the end of the article when AI was involved in drafting. Use plain, non-apologetic language. Suggested strings:

| Involvement level | Disclosure text |
|-------------------|-----------------|
| AI drafted, Bex edited | `"This article was drafted with Claude (Anthropic). All editorial decisions, accuracy verification, and publication are Bex Head's responsibility."` |
| AI assisted with research/structure, Bex wrote | `"Research and structural assistance by Claude (Anthropic). Written and edited by Bex Head."` |
| Bex wrote entirely, AI only reviewed | No disclosure callout required. |

**The disclosure callout is not a weakness.** Per the ethics doc: "Credit your tools like you'd credit a co-author." The Sugartown brand is transparent about AI collaboration by design — the disclosure is part of the story, not a footnote.

---

## Step 3 — Create the Sanity draft

Use `create_documents_from_json` (NOT `create_documents_from_markdown` — no AI rewriting).
See `docs/write-pipeline-prompt.md` §6 for Portable Text block requirements. This subsumes
the compliance re-scan formerly in a separate Step 2.75 — Step 2.5 already covers the full
checklist; do not proceed here until it and Step 2.6 are resolved.

```json
{
  "_type": "article",
  "title": "<title>",
  "slug": { "_type": "slug", "current": "<slug>" },
  "excerpt": "<one-sentence summary — what does the reader learn or take away?>",
  "publishedAt": "<today's date ISO>",
  "authors": [{ "_type": "reference", "_ref": "<bex person _id>", "_key": "author-1" }],
  "tools": [...],
  "categories": [...],
  "tags": [...],
  "projects": [...],
  "related": [...],
  "sections": [
    {
      "_key": "hero-1",
      "_type": "heroSection",
      "eyebrow": "Article",
      "heading": "<title or display heading>",
      "imageTreatment": { "_type": "mediaOverlay", "overlayOpacity": 50, "panel": false, "type": "none" },
      "imageWidth": "content-width",
      "showStatRail": false
    },
    ...textSections
  ]
}
```

All array items must have a unique `_key`.

---

## Step 4 — Report back

Report the shared checklist (`docs/write-pipeline-prompt.md` §8: draft ID, taxonomy
attached, related content linked, images alt text confirmed) plus, article-specific:
- Slug (`/articles/<slug>`)
- Disclosure callout included (yes/no) and which string was used
