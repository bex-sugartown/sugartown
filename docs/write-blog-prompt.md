# /write-blog — Article (Blog Post) Skill

Creates an article post as a Sanity draft (`_type: "article"`).

**Argument:** the topic, angle, or brief to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides

Before drafting anything, read:
- `docs/brand/brand-voice-guide.md` — full voice, anti-slop rules, first-person narrator split

Key reminders for articles (opposite of nodes):
- **"I" = Bex.** Articles are written in Bex's voice — PM, plain language, first person.
- **AI gets credit for building, not narrating.** "Claude built the schema. I reviewed it." Not "I built the schema using Claude."
- **No forensic storytelling arc.** Articles are essays, tutorials, opinion pieces, or reflections. They have a thesis, not an incident report.
- **Anti-slop rules apply fully** — no em dashes, no decorative emoji, no AI vocabulary ("leverage", "delve into", etc.).
- **Plain language first.** Bex writes the way she talks to clients — direct, specific, occasionally wry, never performed.

---

## Step 1 — Pre-flight taxonomy

Before drafting, query Sanity for existing taxonomy. Do NOT create new taxonomy documents unless asked.

**Sanity project:** `poalmzla` / dataset: `production` / perspective: `published`

Run these queries in parallel:

```groq
// Tools
*[_type == "tool"]{ _id, name } | order(name asc)

// Categories
*[_type == "category"]{ _id, name } | order(name asc)

// Tags
*[_type == "tag"]{ _id, name } | order(name asc)

// Persons (authors)
*[_type == "person"]{ _id, name } | order(name asc)

// Projects
*[_type == "project"]{ _id, name } | order(name asc)
```

Identify best-fit refs. Aim for:
- 1–2 categories
- 3–6 tags
- Tools only if the article is specifically about those tools
- Authors: Bex Head by default (look up her person _id)
- Project: Sugartown CMS if relevant

Also query for related content:
```groq
*[_type in ["node", "article", "caseStudy"] && defined(slug.current)] | order(publishedAt desc) [0..20] { _id, _type, title, slug }
```

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

**Word count:** 400–1,200 for standard articles. Long-form (1,200–2,500) only if the argument genuinely requires it.

---

## Step 3 — Create the Sanity draft

Use `create_documents_from_json` (NOT `create_documents_from_markdown` — no AI rewriting).

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

All array items must have a unique `_key`. PortableText blocks need `_key`, `_type`, `style`, `markDefs: []`, and `children` with `_key`, `_type`, `marks`, `text`.

---

## Step 4 — Report back

After creating the draft, report:
- Sanity draft ID (`drafts.*`)
- Slug (`/articles/<slug>`)
- Taxonomy attached (categories, tags, tools)
- Any taxonomy concepts with no existing match (flag for possible new docs)
- Any related content linked
