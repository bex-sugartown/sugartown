# Write Pipeline — Shared Write-Time Rules

Canonical home for every **register-agnostic** rule used by `/write-node`, `/write-blog`,
`/write-casestudy`, and `/glossy`. Each of those skills references this doc instead of
repeating these rules — this is the SUG-210 fix for the failure mode where a rule (e.g. the
2026-07-15 show-don't-tell update) gets patched into two or three files and missed on the
fourth.

**Boundary — what this doc is not:** `docs/brand/brand-voice-guide.md` and
`docs/brand/master-voice-cheatsheet.md` stay canonical for *tone and voice* (who's "I", the
Do This / Not This table, the tone spectrum). This doc is canonical for write-time
*mechanics* — the gates, self-checks, and pre-flight steps that wrap the drafting process,
regardless of register. If you're deciding whether a sentence sounds right, read the voice
guides. If you're deciding what to check before calling a Sanity write tool, read this doc.

**What stays in each `write-*-prompt.md` file:** the genuinely register-specific delta —
node's forensic arc + TL;DR voice + theme self-check, blog's Bex-first-person plain-language
register, case study's outcome-tile-as-table pattern + enterprise-deck-phrasing ban, glossy's
cheeky/succinct two-gate register and its own Sanity-write architecture (glossy's Gate
1/Gate 2 mechanics are out of scope for this doc — see `docs/glossy-prompt.md` directly).

---

## 1. Taxonomy pre-flight

Before drafting any node, article, or case study, query Sanity for existing taxonomy to use
as references. Do NOT create new taxonomy documents unless asked (this is also CLAUDE.md's
Taxonomy pre-flight rule, applied at write-time).

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

Also query for potentially related content:

```groq
*[_type in ["node", "article", "caseStudy"] && defined(slug.current)] | order(publishedAt desc) [0..20] { _id, _type, title, slug }
```

If a concept has no close taxonomy match, note it — do not invent new docs. Authors default
to Bex Head (look up her person `_id`).

Register-specific target ranges (how many categories/tags/tools to aim for, and any
register-specific taxonomy nuance like case study's engagement facts pre-flight) live in each
`write-*-prompt.md`'s own Step 1 — this section only covers the shared query mechanics.

Glossy's taxonomy pre-flight is structurally different (it's keyed on `glossaryTerm`'s own
relation fields, not `related`/`tags`/`tools`) — see `docs/glossy-prompt.md` Gate 1a/1b
directly rather than this section.

---

## 2. Metadata reference field matrix

What's available to tag, per content type. Audited directly against live schema files
(`apps/studio/schemas/documents/*.ts`) — every cell below is grep/read-confirmed, not
inferred from convention. Each `write-*-prompt.md`'s Pre-flight taxonomy step points here
instead of writers having to remember or re-derive what fields a given content type
supports.

| Content type | categories | tags | tools | related content | glossary terms | citations |
|---|---|---|---|---|---|---|
| **article** | `categories` (max 2) `:235` | `tags` `:253` | `tools` `:221` | `related` → node\|article\|caseStudy `:168` | `relatedTerms` `:271` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:95` + inline `citationRef` |
| **node** | `categories` (max 2) `:300` | `tags` `:318` | `tools` `:284` | `related` → node\|article\|caseStudy `:351` | `relatedTerms` `:336` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:106` + inline `citationRef` |
| **caseStudy** | `categories` (max 2) `:348` | `tags` `:365` | `tools` `:334` | `related` → node\|article\|caseStudy `:398` | `relatedTerms` `:383` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:93` + inline `citationRef` |
| **glossaryTerm** | `categories` (no max) `:82` | `relatedTags` (⚠ different name) `:100` | `relatedTools` (⚠ different name) `:108` | `relatedContent` → article\|caseStudy\|node\|page\|person\|project\|tool (⚠ different name + shape) `:116` | `relatedTerms` (bidirectional — adding here also updates the target's Related Terms on publish) `:90` + inline `glossaryTermRef` | `sources[]` — plain `{text, url}`, **not** the shared `citationItem` type `:132` |
| **page** | `categories` `:165` — **`hidden: true`**, editors can't set it | `tags` `:178` — **`hidden: true`** | `tools` `:205` (visible) | **none** | **none** (inline `glossaryTermRef` only, no curated array) | `citations[]` (`citationItem`) `:116` + inline `citationRef` (added via SUG-48, was previously missing) |
| **project** | `categories` `:177` | `tags` `:190` | `tools` `:163` | — | — | — (no Portable Text field on this schema, so no inline mechanism either) |
| **person** | `expertise` → category (⚠ different name) `:137` | — | — | — | — (inline `glossaryTermRef` possible in `bio`, no backing array) | — (inline `citationRef` possible in `bio`, no `citations[]` to resolve against) |
| **series** | — | — | — | `parts` → article\|node\|caseStudy\|page (⚠ third field name for the same concept) `:44` | — | — |
| **tool** | — | — | — | — | — | — (pure taxonomy leaf, zero content-type fields — expected, not a gap) |

**Tier 1 recommendations (schema, pending approval — see SUG-210's own doc for the full
proposal):** unhide `page.ts` categories/tags; add `relatedTerms`/`related` to `page.ts`.
Not yet executed as of this doc's creation — check `docs/shipped/SUG-210-*.md` or the schema
files directly for current state before relying on this as "done."

**Tier 2 — open decisions (not resolved, no default action):**
- `glossaryTerm.sources[]` uses its own `{text, url}` shape instead of the shared
  `citationItem` type (`text`, `url`, `label`) that article/node/caseStudy/page all share.
  Undecided: migrate to `citationItem` (breaking — needs a migration script) or keep it
  deliberately lighter-weight since glossary sourcing is a different job than narrative
  citation.
- `person.bio` (and `glossaryTerm.definition`) permit inline `citationRef`/`glossaryTermRef`
  Portable Text marks with **no backing array to resolve them against** — an editor could
  insert a citation marker in a person's bio today with nowhere for it to point. Undecided:
  validator, or remove the mark from `bio`'s PT config, or add `citations[]`/expose
  `relatedTerms[]` on `person`.

**Tier 3 — real inconsistency, out of scope, spin-off candidate:** three field names doing
the same "related content" job (`related`, `relatedContent`, `parts`) with three different
allowed-type sets; `glossaryTerm.relatedTags`/`relatedTools` vs. everyone else's plain
`tags`/`tools`. Both are cross-cutting schema epics in their own right, not a docs fix.

---

## 3. Write-time self-checks (after drafting, before the compliance gate)

Run these three checks after drafting and before the brand voice compliance gate. All three
share the same underlying principle: readers skim roughly a fifth of the words on a page and
bail in the middle third, so the structure has to carry the piece on its own before the prose
does.

### 3a. Length budget

State the target word count and one line of justification against the register's band
*before* drafting. Length is a budget, not a ceiling — words past the payload are debt. Each
register's band and "what pays first when the draft runs over" live in that file's own Step
2 (node: 600–1,800; blog: 400–1,200, long-form 1,200–2,500 only if the argument requires it;
case study: 500–1,200 for the Overview).

### 3b. Skim skeleton

Extract the title, the subheads/section headings, the first sentence of each section, and
the closer. That artifact is the whole piece for a 30-second reader — it should carry the
throughline (arc, thesis, or engagement story, depending on register) on its own. If it
doesn't, fix the skeleton before fixing anything else. Each register's exact skeleton shape
(node: title/subtitle/section headings/first sentences/closer; case study: challenge callout
+ outcome tiles + section subheads + Reflection's first sentence) lives in that file's Step
2.

### 3c. Show, don't tell

Scan the draft for any paragraph narrating a comparison across two or more arms/options/
states along two or more dimensions, or carrying three or more numbers doing comparative
work. Convert it to a `tableBlock` before the compliance gate rather than waiting for
red-pen to catch it downstream — it's already valid Portable Text in a `textSection`, no
schema work needed. Same check for any paragraph narrating a flow, pipeline, or
architecture: consider a `mermaidSection` diagram instead. See
`docs/brand/brand-voice-guide.md`'s Do This / Not This table.

Case study note: the outcome tiles (`cardSection`) are already the canonical table for
before/after metrics — don't also narrate those same numbers as prose in the Overview.

---

## 4. Brand voice compliance gate (blocking — runs before any Sanity write)

Do not call a Sanity write tool until every item below is resolved. This is not a suggestion
pass — it is a blocking checklist.

**Banned vocabulary — applies everywhere, no exemption:**
`leverage`, `utilize`, `delve into`, `facilitate`, `synergize`, `ideate`, `learnings`,
`passionate about`, `excited to announce`, `in today's landscape`, `robust`, `scalable`,
`seamless`, `cutting-edge`, `game-changing`, `innovative`, `unlock`

**Filler transitions — delete, don't replace:**
`That said,` / `With that in mind,` / `That being said,` / `It's worth noting that` /
`At the end of the day` / `It goes without saying` / `Needless to say`

**Structural tells:**
- Three consecutive sentences starting with the same word → rewrite at least one.
- Any adjective triad (e.g. "robust, scalable, and maintainable") → delete two adjectives
  or replace with a specific number or example.
- Hedge stacks ("I think maybe this could possibly") → pick a position; the writer/narrator
  has a point of view, state it.

**Em dashes and emoji — register-specific, not shared:**

| Register | Em dashes | Emoji |
|---|---|---|
| Node | Permitted — part of the forensic narrator register | Sarcastic/deadpan permitted, sparing |
| Article | Zero tolerance | None (decorative or otherwise) |
| Case study | Zero tolerance (no node exemption) | None |
| Glossary term | Zero tolerance | None |

Exception everywhere: `Title — Subtitle` heading separators are a typographic convention,
not a prose pattern, and are always permitted.

**Register-specific additions** (case study's enterprise-deck-phrasing ban and receipts
check; the "I" check's exact framing per register) live in each file's own compliance gate
section — they're genuinely register-specific, not shared mechanics.

After completing this scan, state explicitly that the gate passed (each register's own file
specifies the exact confirmation string). Then proceed to disclosure & attribution.

---

## 5. Disclosure & attribution (required)

Per `docs/briefs/ai-ethics-and-operations.md` Principles 3, 11, and 13, AI-generated or
AI-assisted content requires explicit disclosure before publication. This is both an ethical
obligation and a regulatory one (EU AI Act Article 50, enforceable August 2026; US state
disclosure laws).

**Mechanism varies by schema:**
- Node and case study have an `aiDisclosure` field — mandatory when this skill drafts the
  copy. See each file's own value table for the exact strings.
- Article has no `aiDisclosure` schema field, so disclosure is expressed via a
  `calloutSection` at the end of the article instead. See `write-blog-prompt.md` Step 2.6.
- Glossary terms don't currently carry a disclosure mechanism in this doc's scope — see
  `docs/glossy-prompt.md` if that changes.

**Tools field as attribution:** always include the AI tool(s) used as taxonomy refs (e.g.
`tool-claude-code`). This is the machine-readable attribution record, distinct from
`aiDisclosure`/the callout, which records authorship in prose.

**Images:** any images included require:
- Descriptive `alt` text that conveys meaning, not just decoration (WCAG 2.1 AA)
- If AI-generated: the `alt` or `caption` must name the generation tool

**The disclosure is not a weakness.** Per the ethics doc: "Credit your tools like you'd
credit a co-author." The Sugartown brand is transparent about AI collaboration by design.

---

## 6. Sanity write mechanics

Use `create_documents` with precise, structured JSON — never a markdown/AI-rewrite tool.
See CLAUDE.md's "Sanity MCP content writes — no AI rewriting" section for the full rule;
it is not restated here.

Portable Text block requirements (every block needs `markDefs: []`, every span needs
`marks: []`, even when empty) are documented in CLAUDE.md's "Portable Text blocks written
via MCP — required fields" section. Read that before writing PT blocks; omitting either
field produces content that saves and renders on the web but is uneditable in Studio.

---

## 7. Content Write Gate composition

Each write-*-prompt's own taxonomy pre-flight, compliance gate, and disclosure steps
together satisfy CLAUDE.md's Content Write Gate before/after proposal requirement for the
draft write itself — you don't need a separate proposal table on top of a fully-run write
skill, because the skill's own gates already surface what's being written before the tool
call.

**This does not extend to publishing.** Per CLAUDE.md's Human-Publishes Rule, no approval
gathered during drafting (taxonomy confirmation, compliance gate pass, "looks good" on the
copy) authorizes a `publish_documents` call. The agent creates drafts; a human publishes
them. Publishing requires its own explicit, standalone instruction ("publish that," "make it
live") — never inferred from approval of the drafted content.

`/glossy` composes both gates explicitly in its own two-gate flow (Gate 1 = propose, Gate 2
= create draft, publish = separate human action) — see `docs/glossy-prompt.md` for that
skill's specific mechanics, which are out of scope for this doc.

---

## 8. Report-back checklist

After creating any draft, report at minimum:
- Sanity draft ID (`drafts.*`)
- Taxonomy attached (categories, tags, tools) and any concepts with no existing match
  (flag for possible new docs)
- Any related content linked
- Any images included — confirm alt text is present

Register-specific report items (node's `aiDisclosure` string; article's disclosure callout
used; case study's engagement facts, outcome tile `evidenceType` values, FAQ/`aeoSummary`/
`geoSummary` status) live in each file's own Step 4.

---

## Changelog

### v2026.07.18 (SUG-210 — initial creation)
- Extracted from `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`,
  and `glossy-prompt.md`'s duplicated write-time mechanics. See
  `docs/shipped/SUG-210-content-pipeline-rules-consolidation.md` for the full audit.
- This epic did not change what any rule says, only where it lives, with one flagged
  exception: consolidating glossy onto the canonical 17-item banned-vocabulary list adds
  "passionate about" and "excited to announce" to glossy's enforced list (glossy's own prior
  list was missing those two entries relative to node/blog/casestudy). Flagged for Bex at
  epic close-out rather than executed silently.
