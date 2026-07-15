# /write-node — Knowledge Graph Node Skill

Creates a Knowledge Graph node post as a Sanity draft (`_type: "node"`).

**Argument:** the topic, incident, or post-mortem to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides and ethics requirements

Before drafting anything, read:
- `docs/brand/node-style-guide.md` — arc, voice, structure, anti-pattern checklist
- `docs/brand/brand-voice-guide.md` — anti-slop rules, first-person narrator split
- `docs/briefs/ai-ethics-and-operations.md` — disclosure and attribution requirements (Principles 3, 11, 13)

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

**Length budget (declare before drafting):** state the target word count and one line of justification against the guide's band (600–1,800; 600–1,200 is the sweet spot for single-incident nodes). Length is a budget, not a ceiling: readers skim roughly a fifth of the words on a page and bail in the middle third, so words past the payload are debt. If the draft runs over budget, the Investigation pays first — the Failure, the Lesson, and the closer are never the cut.

**Skim skeleton self-check (after drafting, before Step 2.5):** extract the title, the subtitle, the section headings, the first sentence of each section, and the closer. That artifact is the whole node for a 30-second reader — it should carry the arc (failure → investigation → fix → lesson) on its own. If it doesn't, fix the skeleton before fixing anything else.

**Show, don't tell self-check:** scan the draft for any paragraph narrating a comparison across two or more arms/options/states along two or more dimensions, or carrying three or more numbers doing comparative work. Convert it to a `tableBlock` before Step 2.5 rather than waiting for red-pen to catch it downstream — it's already valid Portable Text in a `textSection`, no schema work needed. Same check for any paragraph narrating a flow, pipeline, or architecture: consider a `mermaidSection` diagram instead.

**Theme self-check:** if the title or opening commits to a controlling metaphor (a drug trial, a courtroom, a heist), name it in one line before finalising, and re-read every figurative choice against it, not in isolation — a strong sentence in the wrong image system is a broken deployment. Deploy the theme at the beats (title, section turns, closer), not in every paragraph; over-extension is the opposite failure. See the Node Style Guide's "Theme: The Controlling Metaphor" section.

Check the anti-pattern checklist from the style guide before finalising:
- Arc present (all five stages)
- Title earns a click
- Subtitle clarifies
- Stakes named
- Specifics replace adjectives
- Ending lands
- Smart outsider test passes
- Word count 600–1,800
- Show, don't tell — narrated comparisons tabled, narrated flows diagrammed
- Theme discipline (if a controlling metaphor is present)

---

## Step 2.5 — Brand voice compliance gate (blocking — runs before any Sanity write)

Do not call `create_documents_from_json` until every item below is resolved.

**Node exemptions (do not apply the article rules blindly):**
- Em dashes (`—`) are **permitted** in nodes — they are part of the forensic narrator register.
- Sarcastic or deadpan emoji is **permitted** — use sparingly and only when the joke earns it.
- The `aiDisclosure` field handles attribution; a separate callout section is not required.

**Banned vocabulary — applies to nodes too, no exemption:**
`leverage`, `utilize`, `delve into`, `facilitate`, `synergize`, `ideate`, `learnings`,
`passionate about`, `excited to announce`, `in today's landscape`, `robust`, `scalable`,
`seamless`, `cutting-edge`, `game-changing`, `innovative`, `unlock`

**Filler transitions — delete:**
`That said,` / `With that in mind,` / `That being said,` / `It's worth noting that` /
`At the end of the day` / `It goes without saying` / `Needless to say`

**Structural tells:**
- Three consecutive sentences starting with the same word → rewrite at least one.
- Any adjective triad → delete two or replace with a specific number or example.
- Hedge stacks → the narrator has a point of view; state it.

**Narrator voice check:**
- "I" = agent narrator throughout the arc sections. "We" = Agentic Caucus.
- Bex is "Bex" or "the VoPM" — never "I" and never "she" unless contextually clear.
- TL;DR must be third-person, wry, and written as if by someone who found the whole thing faintly amusing.

After completing this scan, state explicitly: **"Compliance gate passed — node exemptions noted."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

Per `docs/briefs/ai-ethics-and-operations.md` Principles 3, 11, and 13, AI-generated content requires explicit disclosure before publication. This is both an ethical obligation and a regulatory one (EU AI Act Article 50, enforceable August 2026; US state disclosure laws).

**`aiDisclosure` field is mandatory on every node.** Use the appropriate string:

| Authorship | `aiDisclosure` value |
|------------|----------------------|
| Fully agent-narrated (standard node) | `"Narrated by Claude, directed by Bex Head."` |
| Agent-drafted, substantially edited by Bex | `"Drafted with Claude, edited and directed by Bex Head."` |
| Collaborative — agent and Bex co-wrote | `"Written in collaboration with Claude (Anthropic). Editorial decisions: Bex Head."` |

When in doubt, use the first string. Nodes are AI-narrated by design — this is a feature, not a disclaimer.

**Tools field as attribution:** always include the AI tool(s) used as taxonomy refs (e.g. `tool-claude-code`). This is the machine-readable attribution record.

**Images:** if any images are included in the node (hero image, gallery), they require:
- Descriptive `alt` text that conveys meaning, not just decoration (WCAG 2.1 AA)
- If AI-generated: note the generation tool in the image's `alt` or `caption` field

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
- `aiDisclosure` string used and why
- Taxonomy attached (categories, tags, tools — tools list confirms attribution record)
- Any taxonomy concepts that had no existing match (flag for possible new docs)
- Any related content linked
- Any images included — confirm alt text is present
