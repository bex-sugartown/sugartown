# /write-node — Knowledge Graph Node Skill

Creates a Knowledge Graph node post as a Sanity draft (`_type: "node"`).

**Argument:** the topic, incident, or post-mortem to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides

Before drafting anything, read:
- `docs/brand/node-style-guide.md` — arc, voice, structure, anti-pattern checklist
- `docs/brand/brand-voice-guide.md` — anti-slop rules, first-person narrator split

Key reminders:
- "I" = the agent narrator. "We" = Agentic Caucus. Bex = VoPM (named, not pronoun'd).
- Arc: Failure → Investigation → Fix → Lesson. Every section must be present.
- TL;DR: third person, Alistair Cooke × Oscar Wilde. Wry, omniscient, urbane.
- Write for the smart outsider: one-clause context before jargon, analogies welcome.
- Em dashes and sarcastic emoji are allowed in nodes (node exemption from site-wide bans).

---

## Step 1 — Pre-flight taxonomy

Before drafting, query Sanity for existing taxonomy to use as references. Do NOT create new taxonomy documents unless asked.

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

From the results, identify the best-fit refs for the topic. Aim for:
- 1–2 categories
- 3–6 tags
- 1+ tools (include Claude Code if Claude was involved)
- Authors: Bex Head by default (look up her person _id)
- Project: Sugartown CMS if relevant

If a concept has no close taxonomy match, note it — do not invent new docs.

Also query for potentially related content:
```groq
*[_type in ["node", "article", "caseStudy"] && defined(slug.current)] | order(publishedAt desc) [0..20] { _id, _type, title, slug }
```

---

## Step 2 — Draft the node

Write the full node content following the style guide arc. Sections:

1. **heroSection** — `eyebrow: "Node"`, `heading: <title>`
2. **textSection** (no heading) — subtitle h3 italic + TL;DR blockquote italic
3. **textSection** — "The Setup" (or a vivid equivalent)
4. **textSection** — "The Failure"
5. **textSection** — "The Investigation" (name it something wry if the story earns it)
6. **textSection** — "The Fix"
7. **textSection** — "The Lesson"

The subtitle format: *Or, How [the specific embarrassing thing that happened]*

Check the anti-pattern checklist from the style guide before finalising:
- Arc present (all five stages)
- Title earns a click
- Subtitle clarifies
- Stakes named
- Specifics replace adjectives
- Ending lands
- Smart outsider test passes
- Word count 600–1,800

---

## Step 3 — Create the Sanity draft

Use `create_documents_from_json` (NOT `create_documents_from_markdown` — no AI rewriting).

```json
{
  "_type": "node",
  "title": "<title>",
  "slug": { "_type": "slug", "current": "<slug>" },
  "excerpt": "<one-sentence takeaway — lead with the principle>",
  "publishedAt": "<today's date ISO>",
  "status": "exploring",
  "aiDisclosure": "Narrated by Claude, directed by Bex Head.",
  "authors": [{ "_type": "reference", "_ref": "<bex person _id>", "_key": "author-1" }],
  "tools": [...],
  "categories": [...],
  "tags": [...],
  "projects": [...],
  "related": [...],
  "sections": [...]
}
```

All array items must have a unique `_key`. PortableText blocks need `_key`, `_type`, `style`, `markDefs: []`, and `children` with `_key`, `_type`, `marks`, `text`.

---

## Step 4 — Report back

After creating the draft, report:
- Sanity draft ID (`drafts.*`)
- Slug (`/knowledge-graph/<slug>`)
- Taxonomy attached (categories, tags, tools)
- Any taxonomy concepts that had no existing match (flag for possible new docs)
- Any related content linked
