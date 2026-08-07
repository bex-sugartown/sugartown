# /glossy — Glossary Term Skill

Researches, drafts, and (on approval) publishes a `glossaryTerm` document to
`sugartown.io/glossary`. Two gates: **Gate 1** proposes a fully-researched term
for human review in an inline table; **Gate 2** posts it live only after explicit
approval.

**Argument:** the source term(s) to define, plus any related content, context, or
links. If no term is provided, ask before proceeding.

**Sanity:** project `poalmzla` / dataset `production`. Document type: `glossaryTerm`.
URL pattern: `/glossary/:slug`.

---

## Input modes — single, pasted batch, or uploaded file

`/glossy` accepts one term or many. Detect the mode before doing anything else.

1. **Single term** — the argument is one term (optionally with context/links).
2. **Pasted batch** — the argument (or a follow-up message) is a list: one term
   per line, a comma/semicolon-separated list, a markdown bullet list, or a
   `term, optional note` pair per line. Parse it into a clean term list.
3. **Uploaded / referenced file** — the user points at a file path (`.txt`, `.md`,
   `.csv`, or similar). Read it with the `Read` tool and parse:
   - **Plain list** (`.txt` / `.md`): one term per line or per bullet. Ignore blank
     lines and headings.
   - **CSV**: treat the first column as `term`. Recognise optional columns by header
     name when present — `term`, `abbreviation`, `note`/`context`, `source`/`url`.
     Use any provided values as research *seeds*, not as final copy (they still pass
     the no-hallucination rule and the voice rules).
4. **Evernote export (`.enex`)** — the expected bulk-import format. ENEX is XML; one
   `<note>` per term. Parse each note (see "Parsing ENEX" below) and extract:
   - **term** ← `<title>` (clean it: strip trailing "(definition)", dates, emoji).
   - **context / definition seed** ← the note `<content>` (ENML — XHTML inside a
     CDATA block). Strip tags to plain text; use it as a research seed, never as
     final copy verbatim (Evernote clippings are someone else's words and someone
     else's voice — rewrite to the glossary register, do not paste).
   - **source seeds** ← collect *all* of: the `<source-url>` in `<note-attributes>`,
     and every `href` inside the content's `<a>` tags. These are candidate sources,
     not yet trusted (see source-handling rule below).

### Parsing ENEX

`.enex` is XML — do not eyeball it block by block. Read the file, then extract
structurally (a short Bash/Python pass with an XML parser, or `Read` for small
files). For each `<note>`:

```
<title>…</title>                         → term candidate
<content><![CDATA[ <en-note>…</en-note> ]]></content>   → ENML body (strip to text)
<note-attributes><source-url>…</source-url></note-attributes>  → primary source seed
  (also harvest every <a href="…"> inside the CDATA body)
```

Notes that are clearly not glossary candidates (a meeting note, a to-do, an empty
clipping) get dropped at the parse-and-confirm step — list them as skipped with a
one-line reason, do not silently discard.

**Parse-and-confirm step (batch only):** before researching, echo the parsed term
list back as a numbered list and state the count ("Parsed 12 terms from the upload").
Flag anything ambiguous (a line that may be a note vs a term, an apparent
duplicate within the input). Ask the user to confirm the list, or to trim it, before
spending research effort. This is cheap and prevents researching a mis-parsed row.

**De-dupe within the batch and against Sanity:** run the duplicate pre-flight (Gate
1a) once for the whole batch, not per term. Drop terms that already exist (offer
those as "edit existing?" instead) and collapse near-duplicates inside the input.

**Batch sizing:** there is no hard cap, but research is the slow part. For large
uploads (20+ terms), process in chunks of ~10: present a Gate 1 batch table per
chunk so the user can approve and post incrementally rather than waiting for the
whole set. State the chunking plan up front.

---

## Voice — the glossary register

Glossary terms are **cheeky, opinionated, and succinct**, written entirely in the
context of the **digital content ecosystem** (CMS, headless, design systems,
content modelling, publishing pipelines, the agentic build). Read
`docs/brand/brand-voice-guide.md` before drafting.

- **Definition** (`definition`): the dictionary-clean part. One to three sentences.
  Lead with an extractable `X is Y` sentence (AEO — this is the line an AI search
  engine quotes). Plain, correct, no hedging. This is where you are *succinct*.
- **Extended definition** (`extendedDefinition`): where the *cheek and opinion*
  live. A point of view, a dry aside, the thing a senior practitioner would
  actually say about the term at a whiteboard. Still grounded in fact — opinion is
  earned, not invented.

  **Editorial flavour is the point here, and it is governed by the voice guides,
  not by the flattened register of an internal doc.** Write this field to
  `docs/brand/brand-voice-guide.md` and the voice registers in
  `docs/brand/node-style-guide.md` §Voice: structural metaphor, ironic distance,
  analogy as a first-class tool, and a closing line that lands. The Ontology term
  is the reference implementation ("a taxonomy that grew up and got opinions about
  relationships"). A hedged, summary-shaped paragraph that reads like a neutral
  encyclopedia entry has failed this field even when every fact in it is correct.
  The bans below (em dash, emoji, banned vocabulary) still apply; they constrain
  the surface, not the voice.
- A glossary term is **not a node**. The node em-dash and emoji exemptions do
  **not** apply. No em dashes (`—`) — commas, parentheses, colons, full stops. No
  decorative emoji. Run the shared brand voice compliance gate
  (`docs/write-pipeline-prompt.md` §4 — banned vocabulary, filler transitions,
  structural tells) before finalising. Note: consolidating onto the shared canonical
  banned-vocabulary list adds `passionate about` and `excited to announce` to what's
  enforced here — this glossary-specific list previously omitted those two relative
  to the other write-*-prompt.md files (SUG-210 flagged this gap; it wasn't a
  deliberate register difference).
- The opinion is Sugartown's, not a vendor's. If a term is marketing spin dressed
  as a concept, the cheek is in *saying so*, not in repeating the pitch.

---

## No hallucination — the hard rule

Every definition must be defensible. The `sources[]` field is **required by the
schema and by this skill**.

- Research the term before writing. Use `WebSearch` / the `firecrawl` skills /
  `WebFetch` to confirm meaning, etymology, abbreviation, and pronunciation against
  real sources. Prefer primary/authoritative sources (spec authors, official docs,
  the people who coined the term) over SEO content farms.
- Every factual claim in the definition must trace to a source you actually read
  this session. If you cannot source it, do not write it — flag the gap in the
  Gate 1 proposal instead of inventing.
- Opinion is allowed in `extendedDefinition` and must be labelled as Sugartown's
  view, not asserted as external fact.
- `abbreviation` and `pronunciation` are only filled when verified. An unverified
  pronunciation is worse than a blank one. Leave optional fields empty rather than
  guessing.

### Numeronyms — the goober credibility signal

If the term has a **well-established numeronym** (the count-the-middle-letters
shorthand the trade actually uses), put it in `abbreviation`. This is a deliberate
insider signal: it tells a practitioner-reader the glossary was written by someone
who lives in the ecosystem.

- Known examples: `p13n` (personalization), `a11y` (accessibility), `i18n`
  (internationalization), `l10n` (localization), `o11y` (observability), `k8s`
  (Kubernetes), `g11n` (globalization), `s12n` (serialization).
- **Only include a numeronym that genuinely exists in the wild** — same
  no-hallucination rule. Verify it is in real use (docs, conference talks, tooling)
  before adding it. Do **not** coin a new one to look clever; a made-up numeronym is
  the opposite of a credibility signal.
- Numeronym takes precedence for the `abbreviation` field when both a numeronym and
  a plain acronym exist *and the numeronym is the more common form* (e.g. prefer
  `a11y` over "A11Y"). If the plain acronym is overwhelmingly dominant (e.g. `CMS`,
  `SEO`), use that instead — pick the form a reader is most likely to recognise.
- If there is a numeronym but it is niche, you may note it in `extendedDefinition`
  ("also written `s12n`") rather than the `abbreviation` field. Judgement call:
  `abbreviation` is for the canonical short form, not every variant.

### Source handling — extracted links + canonical sources

The goal is a `sources[]` list that actually earns the term credibility, not just
whatever URL a clipping happened to carry.

1. **Include the user-provided / extracted links.** Source URLs harvested from an
   `.enex` note (`source-url` and inline `href`s), or a CSV `source` column, are
   candidate sources. Keep them **only if** they (a) resolve, (b) are relevant to
   the term, and (c) are credible. Drop dead links, paywalled SEO filler,
   content-farm reposts, and "I saved this from a random blog" clippings. Note in
   the Gate 1 gaps line when a provided link was dropped and why.
2. **Add the canonical source.** For every term, add the authoritative reference a
   practitioner would actually cite even if the clipping didn't include it: the spec
   (W3C / WHATWG / IETF RFC / ECMA), the official docs (e.g. Sanity docs for GROQ /
   Portable Text), the standards body, or the person/paper who coined the term.
   Verify it by fetching it this session.
3. **Prefer primary over secondary.** A clipping from a marketing blog explaining
   "headless CMS" is a seed; the canonical source is the spec or the originating
   authority. When both exist, cite the canonical one and optionally keep a strong
   secondary that adds genuine context.
4. **Order sources** canonical-first in the `sources[]` array.
5. If a term has *no* credible source after research (extracted or canonical), do
   not invent one and do not post it — flag it at Gate 1 for the user to decide.

---

## Gate 1 — Research, draft, propose (no writes)

Do **not** call any Sanity write tool during Gate 1. Output is a proposal table
only.

### 1a — Schema + duplicate pre-flight

Confirm the deployed schema and check for an existing term (taxonomy pre-flight is
blocking per CLAUDE.md). Run against `{ projectId: "poalmzla", dataset: "production" }`:

```groq
// Does this term (or a near-synonym) already exist?
*[_type == "glossaryTerm"]{ _id, term, abbreviation, slug } | order(lower(term) asc)
```

If an 80%+ semantic match exists, **stop** and surface it: propose editing the
existing term rather than creating a duplicate.

### 1b — Relation pre-flight

Pull candidate references so the proposal can wire real `_id`s, never invented ones:

```groq
// Categories (for categories[])
*[_type == "category"]{ _id, name } | order(name asc)

// Other glossary terms (for relatedTerms[] — glossaryTerm refs only)
*[_type == "glossaryTerm"]{ _id, term } | order(lower(term) asc)

// Tags (for relatedTags[]) and tools (for relatedTools[]) — separate fields since SUG-186
*[_type == "tag"]{ _id, name } | order(name asc)
*[_type == "tool"]{ _id, name } | order(name asc)

// Articles + related content for relatedContent[]
*[_type in ["article","caseStudy","node"] && defined(slug.current)]{ _id, _type, title, slug } | order(_type asc)
```

Only reference documents that exist in these results. If a relation has no match,
leave the field empty and note it. Do **not** create new taxonomy.

### 1c — Research the term

Web-research the term per the no-hallucination rule. Collect 1–3 real sources with
`text` (citation label) and `url`.

### 1d — Draft every field you can

Fill as much of the schema as the research supports:

| Field | Required | Notes |
|-------|----------|-------|
| `term` | ✅ | The canonical label, max 80 chars. |
| `slug` | ✅ | kebab-case, derived from `term`. |
| `abbreviation` | — | Acronym or **known numeronym** (`p13n`, `a11y`, `i18n`). Verified, max 20 chars. See the numeronym rule. |
| `pronunciation` | — | IPA or phonetic, only if verified. |
| `definition` | ✅ | 1–3 sentences, `X is Y` opener, succinct. |
| `extendedDefinition` | — | The opinionated deep-dive. Omit if you have nothing earned to add. |
| `categories[]` | — | Real `category` `_id`s from 1b. |
| `relatedTerms[]` | — | Real `glossaryTerm` `_id`s **only**. Bidirectional: publishing syncs the reverse link onto the target. |
| `relatedTags[]` | — | Real `tag` `_id`s. Separate field since SUG-186. |
| `relatedTools[]` | — | Real `tool` `_id`s. Separate field since SUG-186. |
| `relatedContent[]` | — | Real `_id`s (article / caseStudy / node / etc.). |
| `sources[]` | ✅ | Verified `{ text, url }` entries. |
| `seo` | — | `seoMetadata` object. Leave `autoGenerate: true` unless the term needs exact overrides, then set `title` / `description` (**not** `metaTitle`/`metaDescription` — those fields do not exist). |

### 1e — Present the proposal (inline table)

**Single term:** output one detail table per the layout below.

**Batch:** output the detail table for *each* term in sequence, separated by the
term as a heading, then close with a compact summary index so the user can approve
selectively:

| # | term | slug | has extended? | relations | sources | gaps |
|---|------|------|---------------|-----------|---------|------|
| 1 | … | … | yes/no | n | n | … |

Let the user approve all, approve a subset ("post 1, 3, 4"), or request edits per
row. Only the approved rows proceed to Gate 2.

Detail table (per term):

| Field | Proposed value |
|-------|----------------|
| term | … |
| slug | … |
| abbreviation | … *(or "—")* |
| pronunciation | … *(or "—")* |
| definition | *(full text, as it will be written)* |
| extendedDefinition | *(full text, or "—")* |
| categories | Name → `_id`, … *(or "none — no match")* |
| relatedTerms | Name → `_id`, … *(glossaryTerm only)* |
| relatedTags | Name → `_id`, … |
| relatedTools | Name → `_id`, … |
| relatedContent | Title → `_id`, … |
| sources | "Label", url *(canonical)* / "Label", url *(from export)* — tag each by provenance, canonical first |
| seo | `autoGenerate: true`, or the exact `title` / `description` overrides |

Below the table, add:
- **Voice check:** confirm no em dashes / emoji / banned vocab in the copy.
- **Sourcing check:** every definitional claim maps to a listed source.
- **Gaps:** fields left blank and why; any relation with no existing doc.

Then ask via `AskUserQuestion`. A follow-up question is not approval — this call is
required before Gate 2, no exceptions (CLAUDE.md Content Write Gate).

**Single term:**
```
Question: "Approve this term for posting to /glossary?"
Options:
  - "Approved — post it"
  - "Needs edits"
```

**Batch (multi-select, chunked ≤4 per question per
`docs/conventions/human-gate-conventions.md` §Row-level multi-select batch gate):**
```
Question: "Approve these terms for posting? (chunk 1 of N)"
multiSelect: true
Options: one per term in this chunk, labeled "<term> — <one-line gap/quality note>"
```
Repeat per chunk of ≤4. For batches too large for granular per-row selection, default
to "approve all / flag exceptions": one question, "Approve all {N} terms, or flag
specific ones?" with options "Approve all" / "Let me flag exceptions" (leads to a
follow-up multi-select on the flagged subset).

If the user requests edits, revise the table and re-ask — do not proceed to Gate 2 on
a partial yes.

---

## Gate 2 — Create the draft(s) (after explicit approval only)

Only run once Gate 1 is explicitly approved. The human approval at Gate 1 authorizes
writing the approved content to Sanity as a **draft** — it is the human sign-off
required by AI Ethics Principles 6 and 7 and the Content Write Gate (CLAUDE.md). It
does **not** authorize publishing. Publishing is governed separately by CLAUDE.md's
Human-Publishes Rule: the agent creates drafts, a human publishes them, and approving
the copy is not the same action as approving the publish. If the user wants a term
live immediately, that requires its own explicit instruction ("publish that") — never
inferred from the Gate 1 "approved."

**Batch:** post only the rows the user approved. `create_documents` accepts an array
— create the approved set in one call. If any single term fails validation, create the
rest and report the failure rather than aborting the whole batch.

### 2a — Create the draft

Use `mcp__Sanity__create_documents` (structured JSON only — never a markdown/AI-rewrite
tool). `resource: { projectId: "poalmzla", dataset: "production" }`.

`definition` and `extendedDefinition` are Portable Text arrays. Every block needs
`_key`, `_type: "block"`, `style`, `markDefs: []`, and `children` each with `_key`,
`_type: "span"`, `marks: []`, `text`. Omitting `markDefs`/`marks` saves fine on the
web but locks the block in Studio (see CLAUDE.md).

Reference `_type` values follow the schema's named array members:
- `categories[]` items: `{ "_type": "reference", "_key": "...", "_ref": "<id>" }`
- `relatedTerms[]` items: `{ "_type": "glossaryTermRef", "_key": "...", "_ref": "<id>" }` — glossaryTerm targets only
- `relatedTags[]` items: `{ "_type": "reference", "_key": "...", "_ref": "<id>" }`
- `relatedTools[]` items: `{ "_type": "reference", "_key": "...", "_ref": "<id>" }`
- `relatedContent[]` items: `{ "_type": "articleRef" | "caseStudyRef" | "nodeRef" | "pageRef" | "personRef" | "projectRef" | "toolContentRef", "_key": "...", "_ref": "<id>" }`
- `sources[]` items: `{ "_type": "source", "_key": "...", "text": "...", "url": "..." }`

**SUG-186 split tags and tools out of `relatedTerms` into their own fields.** Writing a `tagRef`, `toolRef`, or `categoryRef` into `relatedTerms` now produces an invalid document — that array accepts glossaryTerm references only. Note the `_type` asymmetry: `relatedTerms` items are `glossaryTermRef` (the schema names that array member), while `relatedTags`/`relatedTools`/`categories` items are plain `reference`.

Content shape:

```json
{
  "type": "glossaryTerm",
  "content": {
    "term": "<term>",
    "slug": { "_type": "slug", "current": "<slug>" },
    "abbreviation": "<optional>",
    "pronunciation": "<optional>",
    "definition": [
      {
        "_key": "def1", "_type": "block", "style": "normal", "markDefs": [],
        "children": [{ "_key": "s1", "_type": "span", "marks": [], "text": "<X is Y…>" }]
      }
    ],
    "extendedDefinition": [ /* optional, same block shape */ ],
    "categories": [ /* reference items */ ],
    "relatedTerms": [ /* glossaryTermRef items */ ],
    "relatedTags": [ /* reference items */ ],
    "relatedTools": [ /* reference items */ ],
    "relatedContent": [ /* named ref items */ ],
    "sources": [
      { "_key": "src1", "_type": "source", "text": "<label>", "url": "<url>" }
    ],
    "seo": { "_type": "seoMetadata", "autoGenerate": true }
  }
}
```

### 2b — Revising an existing term (not a create)

When Gate 1 approved an edit to a term that already exists, use `mcp__Sanity__patch_documents`, not `create_documents`. Passing the **published** `_id` routes the edit to the draft automatically; published content is never modified directly, so the Human-Publishes Rule holds without extra effort.

- **Re-fetch the live document immediately before patching** and confirm the `_key`s you are about to target still match. Keys do not reliably survive prior patches, and a human may have edited in Studio since Gate 1. If you find unexpected content in place of what you expected, stop and ask — do not overwrite (see CLAUDE.md §PT array clobbering).
- **Use keyed paths, never whole-array replacement.** `set` on `definition[_key=="b01"].children[_key=="s01"].text` edits one span. Replacing the whole `definition` array drops `_type`/`style`/`markDefs` and crashes the renderer.
- **Appending a block:** `insert` with `{ after: "extendedDefinition[-1]", items: [ … ] }`. The array must already exist; use `setIfMissing` first if it may not.
- **`ifRevisionId` does not work on a first, draft-creating patch.** The draft is created inside the same transaction and gets a fresh `_rev`, which is then compared against the `_rev` you supplied (the published document's). It can never match, and the failure message reads as though a draft already exists with an unfamiliar revision — a false "someone else edited this" signal. Use the guard only when a draft already exists; otherwise verify by re-fetching before and after.
- **Verify after writing.** Re-query the draft and confirm the changed field landed *and* that neighbouring fields (other blocks, relations) are untouched.

### 2c — Code blocks in `extendedDefinition`

`extendedDefinition` accepts `code` blocks, rendered through the DS `CodeBlock`. Useful for a small ASCII diagram that earns its place; not for decoration.

- **Omit `language`** for ASCII diagrams. The serializer passes `language ?? undefined`, and `CodeBlock` skips Prism entirely when it is falsy, so the block renders as clean unhighlighted monospace with no language chip. Setting `markdown` or `bash` would syntax-colour `---`, `|`, and `>` and look worse.
- **Keep lines under ~26 characters.** `CodeBlock` is `white-space: pre-wrap` with no horizontal scroll container, so long lines *reflow* instead of scrolling. At a 360px viewport roughly 28 characters fit; anything longer wraps and destroys the alignment that makes ASCII art legible. Prose captions inside the block may exceed this — sentences wrap harmlessly.
- **Verify at 360px, not just desktop.** A diagram that looks correct in the detail column can collapse into noise on a phone. Measure the widest line against the available width rather than eyeballing it.

Block shape: `{ "_key": "...", "_type": "code", "code": "<the literal text with \n line breaks>" }`.

### 2d — Report back and hand off to the human

- Draft document `_id`(s) for each term created (`drafts.<id>`)
- Fields written vs left blank
- Relations wired (with names)
- Sources attached
- Tell the user the term(s) are drafted and ready, and that publishing is theirs to
  do — from Studio, or by giving you a separate explicit "publish that" instruction
  if they want it live now. The web client uses `perspective: 'published'`, so
  nothing appears at `/glossary` until a human (or an explicitly-instructed you)
  actually publishes it.

---

## Quick reference

- **Input:** single term, pasted list, or uploaded file (txt/md/csv/`.enex`). Parse,
  confirm the list, de-dupe, then research. Chunk large uploads (~10/batch).
- **Sources:** keep credible links from the export, add the canonical source for
  every term, canonical-first, all verified this session. No source → don't post.
- **Gate 1 = read + research + propose.** No Sanity writes. Output is a table (per
  term in a batch) plus a summary index for selective approval.
- **Gate 2 = create the draft only.** Publishing is a separate human action (or a separate, explicit instruction) — never bundled into Gate 1's "approved."
- **No hallucination.** Every claim sourced; unverified optional fields stay blank.
- **Glossary is not a node.** No em dashes, no emoji, anti-slop bans in force.
- **Cheek lives in `extendedDefinition`.** `definition` stays clean and quotable.
- **Numeronyms in `abbreviation`** (`p13n`, `a11y`, `i18n`) when one genuinely
  exists — the goober credibility signal. Never coin a fake one.
