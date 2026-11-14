# /write-node — Knowledge Graph Node Skill

Drafts a Knowledge Graph node in a local HTML working draft, then syncs it to a Sanity draft for final review (`_type: "node"`) once Bex approves the working draft (`docs/write-pipeline-prompt.md` §0b).

**Shared steps and register values:** `docs/write-pipeline-prompt.md` ("pipeline") §9, node row. Each step below adds only what is specific to this register.

**Argument:** the topic, incident, or post-mortem to write about. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides and ethics requirements

Before drafting anything, read:
- `docs/brand/node-style-guide.md` — arc, voice, structure, anti-pattern checklist
- `docs/brand/brand-voice-guide.md` — anti-slop rules, first-person narrator split

Key reminders:
- "I" = the agent narrator. "We" = Agentic Caucus. Bex = VoPM (named, not pronoun'd).
- Arc: Failure → Investigation → Fix → Lesson. Every section must be present.
- TL;DR: third person, Alistair Cooke × Oscar Wilde. Wry, omniscient, urbane.
- Write for the smart outsider: one-clause context before jargon, analogies welcome.
- Em dashes and sarcastic emoji: the node exemption in `docs/write-pipeline-prompt.md` §4.

---

## Step 0.5 — Tracking issue

Per pipeline §9.

---

## Step 1 — Pre-flight taxonomy

Per pipeline §9. Register-specific:
- 1+ tools (include Claude Code if Claude was involved)
- Project: Sugartown CMS if relevant

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
- Word count in the node band (pipeline §9)
- Show, don't tell — narrated comparisons tabled, narrated flows diagrammed
- Theme discipline (if a controlling metaphor is present)

---

## Step 2.5 — Brand voice compliance gate (blocking — runs before any Sanity write)

Per pipeline §9 and §4 (blocking). Register-specific items:

**Node exemptions (do not apply the article rules blindly):**
- Em dashes and emoji follow the node row of pipeline §4's table, not the article rules.
- The `aiDisclosure` field handles attribution; a separate callout section is not required.

**Narrator voice check:**
- "I" = agent narrator throughout the arc sections. "We" = Agentic Caucus.
- Bex is "Bex" or "the VoPM" — never "I" and never "she" unless contextually clear.
- TL;DR must be third-person, wry, and written as if by someone who found the whole thing faintly amusing.

After completing this scan, state explicitly: **"Compliance gate passed — node exemptions noted."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

Node-specific mechanism:

**`aiDisclosure` field is mandatory on every node.** Use the appropriate string:

| Authorship | `aiDisclosure` value |
|------------|----------------------|
| Fully agent-narrated (standard node) | `"Narrated by Claude, directed by Bex Head."` |
| Agent-drafted, substantially edited by Bex | `"Drafted with Claude, edited and directed by Bex Head."` |
| Collaborative — agent and Bex co-wrote | `"Written in collaboration with Claude (Anthropic). Editorial decisions: Bex Head."` |

When in doubt, use the first string. Nodes are AI-narrated by design — this is a feature, not a disclaimer.

---

## Step 3 — Create the Sanity draft

JSON shape (how it is written: pipeline §9, step 3):

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

---

## Step 4 — Report back

Shared steps per pipeline §9. Also report:
- Slug (URL per pipeline §9)
- `aiDisclosure` string used and why
