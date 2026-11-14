# /write-blog — Article (Blog Post) Skill

Drafts an article in a local HTML working draft, then syncs it to a Sanity draft for final review (`_type: "article"`) once Bex approves the working draft (`docs/write-pipeline-prompt.md` §0b).

**Shared steps and register values:** `docs/write-pipeline-prompt.md` ("pipeline") §9, article row. Each step below adds only what is specific to this register.

**Argument:** the topic, angle, or brief to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides and ethics requirements

Before drafting anything, read:
- `docs/brand/brand-voice-guide.md` — full voice, anti-slop rules, first-person narrator split

Key reminders for articles (opposite of nodes):
- **"I" = Bex.** Articles are written in Bex's voice — PM, plain language, first person.
- **AI gets credit for building, not narrating.** "Claude built the schema. I reviewed it." Not "I built the schema using Claude."
- **No forensic storytelling arc.** Articles are essays, tutorials, opinion pieces, or reflections. They have a thesis, not an incident report.
- **Anti-slop rules apply fully** (`docs/write-pipeline-prompt.md` §4).
- **Plain language first.** Bex writes the way she talks to clients — direct, specific, occasionally wry, never performed.

---

## Step 0.5 — Tracking issue

Per pipeline §9.

---

## Step 1 — Pre-flight taxonomy

Per pipeline §9. Register-specific:
- Tools only if the article is specifically about those tools
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
- Em dashes, emoji and banned words per `docs/write-pipeline-prompt.md` §4
- No hedge stacking
- No bullet-list substitutes for prose
- Specific over general: numbers, names, examples, not adjectives
- Anti-slop checklist from `docs/brand/brand-voice-guide.md` before finalising

**Skim skeleton:** title, subheads, first sentence of each section, and the closer. It
should carry the thesis and the argument's shape on its own.

---

## Step 2.5 — Brand voice compliance gate (blocking — runs before any Sanity write)

Per pipeline §9 and §4 (blocking). Register-specific items:

**Article-specific structural tell:** more than two bullet lists in the full article →
convert at least one to prose.

**"I" check:**
Verify every first-person sentence is attributable to Bex. If a sentence reads as AI narrating its own process ("I generated", "I produced", "I drafted"), rewrite: "Claude drafted X. I reviewed it."

After completing this scan, state explicitly: **"Compliance gate passed — no violations found."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

Article-specific mechanism:

**Articles have an `aiDisclosure` schema field** (string, max. 300 characters — `apps/studio/schemas/documents/article.ts`), projected by every article query in `apps/web/src/lib/queries.js` and rendered in the page sidebar. **Set it whenever this skill drafts the copy:**

| Authorship | `aiDisclosure` value |
|-----------|----------------------|
| AI drafted, Bex edited | `"Drafted with Claude, edited by Bex Head."` |
| AI assisted with research/structure, Bex wrote | `"Research and structural assistance by Claude (Anthropic). Written and edited by Bex Head."` |
| Bex wrote entirely, AI only reviewed | Leave blank — the sidebar default (below) covers it. |

**What renders when the field is blank** — `PageSidebar.jsx` never leaves the disclosure slot empty on a page that already shows a sidebar. It falls back in order:

1. The `aiDisclosure` field value, verbatim, if set
2. Assembled from AI-tagged `tools[]`: `"Drafted with {tool names}, edited by {author}. All analysis and conclusions are human-authored."`
3. Default: `"Written and edited by {author}. How Sugartown uses AI: see the AI Ethics policy."`

Fallback 3 asserts human authorship, so **a blank field on an AI-drafted article renders a false claim, not a missing one**. Set the field (or tag the AI tool in `tools[]`, which triggers fallback 2) before creating the draft.

**Optional disclosure callout** — when the AI collaboration is part of the article's story, a `calloutSection` at the end may carry a longer prose disclosure. It supplements the sidebar disclosure; it never replaces the field.

---

## Step 3 — Create the Sanity draft

JSON shape (how it is written: pipeline §9, step 3):

```json
{
  "_type": "article",
  "title": "<title>",
  "slug": { "_type": "slug", "current": "<slug>" },
  "excerpt": "<one-sentence summary — what does the reader learn or take away?>",
  "publishedAt": "<today's date ISO>",
  "aiDisclosure": "<string from Step 2.6, or omit if Bex wrote entirely>",
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

---

## Step 4 — Report back

Shared steps per pipeline §9. Also report:
- Slug (URL per pipeline §9)
- `aiDisclosure` string set (or the reason it was left blank), and whether an optional
  disclosure callout was included
