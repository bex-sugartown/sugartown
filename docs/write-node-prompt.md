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

Run the standard taxonomy pre-flight — see `docs/write-pipeline-prompt.md` §1 for the
queries — and consult its §2 metadata reference field matrix for what `node` supports.

Node-specific target ranges:
- 1–2 categories
- 3–6 tags
- 1+ tools (include Claude Code if Claude was involved)
- Authors: Bex Head by default (look up her person _id)
- Project: Sugartown CMS if relevant

If a concept has no close taxonomy match, note it — do not invent new docs.

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

Run the shared write-time self-checks (`docs/write-pipeline-prompt.md` §3) before Step 2.5.

**Length budget:** target band 600–1,800; 600–1,200 is the sweet spot for single-incident
nodes. If the draft runs over budget, the Investigation pays first — the Failure, the
Lesson, and the closer are never the cut.

**Skim skeleton:** title, subtitle, section headings, first sentence of each section, and
the closer. It should carry the arc (failure → investigation → fix → lesson) on its own.

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

Do not call `create_documents` until every item below is resolved. Run the shared
compliance gate (`docs/write-pipeline-prompt.md` §4 — banned vocabulary, filler transitions,
structural tells) alongside the node-specific items below.

**Node exemptions (do not apply the article rules blindly):**
- Em dashes (`—`) are **permitted** in nodes — they are part of the forensic narrator register.
- Sarcastic or deadpan emoji is **permitted** — use sparingly and only when the joke earns it.
- The `aiDisclosure` field handles attribution; a separate callout section is not required.

**Narrator voice check:**
- "I" = agent narrator throughout the arc sections. "We" = Agentic Caucus.
- Bex is "Bex" or "the VoPM" — never "I" and never "she" unless contextually clear.
- TL;DR must be third-person, wry, and written as if by someone who found the whole thing faintly amusing.

After completing this scan, state explicitly: **"Compliance gate passed — node exemptions noted."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

See `docs/write-pipeline-prompt.md` §5 for the shared disclosure mechanics (ethics-doc
citation, tools-field attribution, images/alt-text rule). Node-specific mechanism:

**`aiDisclosure` field is mandatory on every node.** Use the appropriate string:

| Authorship | `aiDisclosure` value |
|------------|----------------------|
| Fully agent-narrated (standard node) | `"Narrated by Claude, directed by Bex Head."` |
| Agent-drafted, substantially edited by Bex | `"Drafted with Claude, edited and directed by Bex Head."` |
| Collaborative — agent and Bex co-wrote | `"Written in collaboration with Claude (Anthropic). Editorial decisions: Bex Head."` |

When in doubt, use the first string. Nodes are AI-narrated by design — this is a feature, not a disclaimer.

---

## Step 3 — Create the Sanity draft

Use `create_documents` with precise, structured JSON (NOT any AI-rewriting/markdown-ingestion tool — no AI rewriting).
See `docs/write-pipeline-prompt.md` §6 for Portable Text block requirements.

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

All array items must have a unique `_key`.

---

## Step 4 — Report back

Report the shared checklist (`docs/write-pipeline-prompt.md` §8: draft ID, taxonomy
attached, related content linked, images alt text confirmed) plus, node-specific:
- Slug (`/knowledge-graph/<slug>`)
- `aiDisclosure` string used and why
