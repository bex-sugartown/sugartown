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

## 0. Tracking issue (single issue, created early)

Before the taxonomy pre-flight, create **one** GitHub issue that tracks the piece
end-to-end — discovery, drafting, and the publish decision — rather than an issue per
phase or one created only at publish time. This gives content pieces the same
"assign an ID first" discipline CLAUDE.md's epic-authoring workflow already requires for
engineering work.

**When to create it:**
- On the first message that clearly commits to writing a specific piece (a topic,
  incident, or engagement is named) — not on speculative "should I write about X?"
  questions, and after Step 0's voice-guide read, before Step 1's taxonomy queries.
- If the user already supplied an issue link or number for this piece, use it. Do not
  create a duplicate.

**Issue shape:**
- Title: `<Register>: <working title>` — e.g. `Node: The Witness Who Was Never in the Room`
- `gh issue create --title "<title>" --assignee bex-sugartown`, then add it to project 1 and set `Priority`
  (CLAUDE.md §Issue status = workflow stage)
- Label: `content`. No register-specific label exists for node/article/case-study beyond
  that — don't invent one
- Body: the brief or topic in one paragraph, plus a tracking checklist:
  - [ ] Discovery run (taxonomy pre-flight + related-content check)
  - [ ] Working draft approved (path in `docs/drafts/`, §0b)
  - [ ] Synced to Sanity and sync-checked (Sanity draft ID, §0b stage 2)
  - [ ] Final review in Sanity
  - [ ] Compliance gate passed
  - [ ] Human review
  - [ ] Publish decision

**As the piece progresses, update the same issue** — never create a second one for the
same piece:
- After Step 3 (Sanity draft created): add the draft ID, slug, and taxonomy attached, as
  a body edit or a comment (`gh issue comment`).
- At Step 4 (report-back): the report content is what goes into the issue.

**State transitions** (the project item's `Status` field):
- `Backlog` → `In Progress` when drafting begins (Step 2).
- `In Progress` → `Done` only after the human's separate, explicit instruction to
  publish — never inferred from approval of the drafted content. This mirrors
  CLAUDE.md's Human-Publishes Rule: the issue's publish checkbox is not the agent's to
  tick on its own judgment. Closing the issue (`gh issue close`) at that point lets the
  `Item closed` board automation set `Status: Done` itself, same as any other issue.
- If the piece stalls or the user drops it, leave the issue in its last state. Don't
  auto-cancel it.

Each `write-*-prompt.md`'s own Step 0.5 points here instead of repeating this section.

---

## 0b. Local working draft: every edit happens here

**Draft and edit every piece in one local HTML working draft. Sanity receives the result only
for final review.** This holds for a new piece and for a piece already in Sanity, draft or
published: once a review or edit round starts, all changes are made locally and synced at the
end of the round. (ST-162 took a correction, two red-pen passes and a data re-cut as live
Sanity patches, with no single copy to read the whole piece from.)

| Stage | Where | What happens there |
|---|---|---|
| 1. Working draft | `docs/drafts/{ID}-{slug}/{ID}-{slug}.html`, started from `docs/conventions/content-draft-template.html` | All copy, all checks (§1 to §5), red-pen Gates 1 and 2, every edit Bex asks for |
| 2. Sync | `drafts.<id>` in Sanity | The approved working draft is written to Sanity verbatim, then checked against it |
| 3. Final review | The Sanity draft, in Studio | Bex reads it as it will publish. She publishes, or sends it back to stage 1 with what to change |

`{ID}` is the tracking issue (`ST-{n}`, §0). `{slug}` is a short kebab-case working slug, not
necessarily the final Sanity slug; if a `docs/drafts/{ID}-*/` folder already exists, use it.
`docs/drafts/` is gitignored: never `git add` these files.

**The working draft is HTML, on the content draft template.** Pink Moon, light by default,
with a light/dark toggle; the same framework as `docs/conventions/vspec-template.html`. Use
only `--st-*` tokens. Top to bottom it holds:

1. A sync stamp: Sanity document ID, the `_rev` it was exported from or last synced to, the
   time, and a status (`drafting`, `in review`, `approved`, `synced`).
2. Front matter: title, slug, excerpt, `aiDisclosure`, taxonomy picks with `_id`s (§1, §1a),
   length budget and word count (§3a).
3. Every section in Sanity order, each marked with its section type and `_key` (once it has
   one). Tables as tables. Charts and diagrams as their real HTML or Mermaid source.
4. Citations as a numbered list in `citations[]` order (§6).
5. Images: filename per `docs/conventions/image-naming-convention.md`, alt text, the
   generation tool if AI-made.
6. Open questions for Bex. A working draft with open questions is not ready for approval.

**Starting a round on a piece already in Sanity:** export the live document into the working
draft first, then edit only the working draft. Before overwriting an existing working draft,
compare its stamp `_rev` with the live `_rev`. If they differ and the working draft has
unsynced edits, stop and ask Bex which copy wins; name both locations in the popup. Do not
patch Sanity during a round.

**Approval and sync (stage 2):**

1. Ask Bex to approve the round with `AskUserQuestion`. The question names the working
   draft's path. Options: "Reviewed, sync it to Sanity", "Needs edits, I'll list them",
   "Stop". This approval is the Content Write Gate for the sync (§7).
2. Re-fetch the live `_rev`. If it differs from the stamp, someone edited in Studio: stop and
   ask, as above.
3. Write to Sanity verbatim: `create_documents` the first time, `patch_documents` keyed by
   `_key` after that, following §6.
4. Re-export the live draft and compare its text with the working draft, section by section.
   Any difference is a sync defect: fix it before handing over.
5. Update the stamp with the new `_rev`, status `synced`.
6. Hand over for final review in a popup that names the Studio location and the working
   draft's path.

Edits found during final review go back to stage 1 and through the sync again. Until #224
ships a command, export and compare by hand: query `drafts.<id>` with `query_documents` (raw
perspective) and render it on the template.

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

// Glossary terms (display field is `term`, not `name`)
*[_type == "glossaryTerm"]{ _id, term, abbreviation, "slug": slug.current } | order(term asc)
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

## 1a. Which metadata: tag, tool, category or glossary term

**Use the cheapest type that does the job.** Cost, lowest first:

| Type | Cost | Use when | Limit |
|---|---|---|---|
| Tag | Lowest. Pick from the existing list; a new tag needs editorial review | Readers would browse all content on the theme | 3 to 6 per piece |
| Tool | Low. Pick from the existing list | A named product, vendor or platform (never a tag) | Per register, see its Step 1 |
| Category | Structural. The list is fixed; a content epic never adds one | The piece sits under one of the site's broad pillars | 1 to 2 |
| Glossary term | Highest. Research, sources, the two-gate `/glossy` flow, a definition to maintain | A reader needs the word defined to follow the piece, and all four tests below pass | 0 to 2 new per piece |

**Recommend a new glossary term only when all four tests pass:**

1. It has a definition that can be sourced, or it is a Sugartown coinage Bex defines.
2. It recurs: it appears in at least 3 pieces, published or in the backlog.
3. A reader of this piece would stall without it.
4. No existing term covers it. Check the pre-flight list, including abbreviations.

A term and a tag can both apply to one concept: the tag groups content, the term defines it.
The writing skills link existing terms and recommend new ones. They never create them.
`/glossy` creates terms, and the Content Write Gate applies. Report each
recommendation as: term, reason, tests passed.

**To link an existing term, add an inline `glossaryTermRef` mark on its first mention.** Add a
markDef `{"_key": "<key>", "_type": "glossaryTermRef", "term": {"_type": "reference", "_ref": "<glossaryTerm _id>"}}`
to the block, and put `<key>` in the `marks` of the span that carries the text. There is no
`relatedTerms` field on article, node, caseStudy or page (retired by #136, 2026-09-25); writing
one produces an Unknown field error in Studio. A reference can only target a published term,
so link after `/glossy` has created the term and Bex has published it.

---

## 2. Metadata reference field matrix

What's available to tag, per content type. Audited directly against live schema files
(`apps/studio/schemas/documents/*.ts`) — every cell below is grep/read-confirmed, not
inferred from convention. Each `write-*-prompt.md`'s Pre-flight taxonomy step points here
instead of writers having to remember or re-derive what fields a given content type
supports.

| Content type | categories | tags | tools | related content | glossary terms | citations |
|---|---|---|---|---|---|---|
| **article** | `categories` (max 2) `:235` | `tags` `:253` | `tools` `:221` | `related` → node\|article\|caseStudy `:168` | inline `glossaryTermRef` only | `citations[]` (`citationItem`) `:95` + inline `citationRef` |
| **node** | `categories` (max 2) `:300` | `tags` `:318` | `tools` `:284` | `related` → node\|article\|caseStudy `:351` | inline `glossaryTermRef` only | `citations[]` (`citationItem`) `:106` + inline `citationRef` |
| **caseStudy** | `categories` (max 2) `:348` | `tags` `:365` | `tools` `:334` | `related` → node\|article\|caseStudy `:398` | inline `glossaryTermRef` only | `citations[]` (`citationItem`) `:93` + inline `citationRef` |
| **glossaryTerm** | `categories` (no max) `:82` | `relatedTags` (⚠ different name) `:100` | `relatedTools` (⚠ different name) `:108` | `relatedContent` → article\|caseStudy\|node\|page\|person\|project\|tool (⚠ different name + shape) `:116` | `relatedTerms` (bidirectional — adding here also updates the target's Related Terms on publish) `:90` + inline `glossaryTermRef` | `sources[]` — plain `{text, url}`, **not** the shared `citationItem` type `:132` |
| **page** | `categories` `:165` — **`hidden: true`**, editors can't set it | `tags` `:178` — **`hidden: true`** | `tools` `:205` (visible) | **none** | **none** (inline `glossaryTermRef` only, no curated array) | `citations[]` (`citationItem`) `:116` + inline `citationRef` (added via SUG-48, was previously missing) |
| **project** | `categories` `:177` | `tags` `:190` | `tools` `:163` | — | — | — (no Portable Text field on this schema, so no inline mechanism either) |
| **person** | `expertise` → category (⚠ different name) `:137` | — | — | — | — (inline `glossaryTermRef` possible in `bio`, no backing array) | — (inline `citationRef` possible in `bio`, no `citations[]` to resolve against) |
| **series** | — | — | — | `parts` → article\|node\|caseStudy\|page (⚠ third field name for the same concept) `:44` | — | — |
| **tool** | — | — | — | — | — | — (pure taxonomy leaf, zero content-type fields — expected, not a gap) |

**Tier 1 recommendations (schema, pending approval — see SUG-210's own doc for the full
proposal):** unhide `page.ts` categories/tags; add `related` to `page.ts`. Content-level `relatedTerms` was retired by #136.
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
register's band and what pays first when the draft runs over are in the §9 register table.

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

**To remove an em dash:** before a clause, use a colon or two sentences; around a
parenthetical, use parentheses or commas.

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
- Node, article, and case study all have an `aiDisclosure` field — mandatory when this
  skill drafts the copy. See each file's own value table for the exact strings.
- Articles render it via `PageSidebar`, which falls back when the field is blank: first to
  a string assembled from AI-tagged `tools[]`, then to a `"Written and edited by {author}"`
  default. A blank field on an AI-drafted article therefore renders a false human-authorship
  claim — see `write-blog-prompt.md` Step 2.6, which also covers the optional end-of-article
  `calloutSection` supplement.
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

**Citations: never type `[N]` in body text.** A typed `[N]` in a Portable Text span renders
as plain text with no link (ST-221; the ST-162 draft had six). Instead:

1. Add the source to the document's `citations[]` (`citationItem`: `text`, `url`, `label`).
   Its position in the array, counting from 1, is its number.
2. Put a `citationRef` markDef (`index: N`) on the block and its key on the span holding the
   sentence the source supports. The `[N]` pill renders after that span and links to note N.
3. **In a `tableBlock` cell, type `[N]`.** Cells are plain strings and cannot carry a mark;
   the table renderer turns a typed `[N]` into the same linked pill.

`pnpm validate:content` check L flags a typed `[N]` in body text and any number with no
`citations[]` entry, on published documents.

---

## 7. Content Write Gate composition

Each write-*-prompt's own taxonomy pre-flight, compliance gate, and disclosure steps, run
against the working draft (§0b), together satisfy CLAUDE.md's Content Write Gate
before/after proposal requirement. Bex's approval of the round (§0b stage 2, step 1) is the
approval for that sync. You don't need a separate proposal table on top of it. Every later
edit round is approved the same way, against the working draft.

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
- Working draft path, its stamp `_rev`, and the sync check result (§0b)
- Sanity draft ID (`drafts.*`)
- Taxonomy attached (categories, tags, tools) and any concepts with no existing match
  (flag for possible new docs)
- Any related content linked
- Any images included — confirm alt text is present
- Tracking issue link (created in §0) and its current state
- Glossary terms: existing ones linked, new ones recommended (term, reason, tests passed).
  New terms are not created here; `/glossy` does that

Register-specific report items (node's `aiDisclosure` string; article's `aiDisclosure`
string plus any optional disclosure callout; case study's engagement facts, outcome tile
`evidenceType` values, FAQ/`aeoSummary`/`geoSummary` status) live in each file's own Step 4.

---

## 9. Register table and shared step flow

**Every write skill runs the shared steps below with its row of the register table.** Each
`write-*-prompt.md` adds only what is specific to its register. A value that appears here is
not repeated in a prompt.

| Variable | article | node | caseStudy |
|---|---|---|---|
| Skill and prompt | `/write-blog`, `docs/write-blog-prompt.md` | `/write-node`, `docs/write-node-prompt.md` | `/write-casestudy`, `docs/write-casestudy-prompt.md` |
| Tracking issue title | `Article: <working title>` | `Node: <working title>` | `Case Study: <working title>` |
| URL | `/articles/<slug>` | `/knowledge-graph/<slug>` | `/case-studies/<slug>` |
| Length band | 400–1,200; long-form 1,200–2,500 only if the argument needs it (engagement peaks around 1,600 and declines after) | 600–1,800; 600–1,200 for a single incident | Overview 500–1,200; under 500 usually means fragments, not a tight case study |
| Over budget, cut first | detail sections; never the thesis or the closer | the Investigation; never the Failure, the Lesson or the closer | mechanism detail; never stakes, receipts or candour |
| Categories / tags | 1–2 / 3–6 | 1–2 / 3–6 | 1–2 (schema warns at 3+) / 3–6 |
| Em dashes, emoji | §4 table | §4 table | §4 table |

**Shared step flow.** Every prompt keeps these step numbers; its own text under each step is
the register-specific addition.

| Step | Every register | Rules |
|---|---|---|
| 0 | Read the guides the prompt's Step 0 lists, and `docs/briefs/ai-ethics-and-operations.md` (Principles 3, 11, 13) | |
| 0.5 | Create or reuse the tracking issue, titled per the table | §0 |
| 1 | Taxonomy pre-flight; check what the `_type` supports; categories and tags per the table; authors default to Bex Head (look up her person `_id`); link existing glossary terms with an inline `glossaryTermRef` on first mention, recommend 0 to 2 new ones, never create them | §1, §1a, §2 |
| 2 | Draft in the HTML working draft; every later edit happens there too; run the self-checks; length band per the table | §0b, §3 |
| 2.5 | Blocking compliance gate before any Sanity write, then the register's own items; fix violations in the working draft; state the prompt's confirmation line | §4 |
| 2.6 | Disclosure and attribution | §5 |
| 3 | Only after Bex approves the working draft: build the JSON from it verbatim (a wording change goes back to the working draft first); `create_documents` with exact JSON, never an AI-rewriting or markdown tool; every array item has a unique `_key` | §0b stage 2, §6 |
| 4 | Sync check: re-export, compare, update the stamp, hand over with the Studio location and the working draft's path in the popup. Then report the shared checklist plus the register's items | §0b stage 2 steps 4 to 6, §8 |

---

## Changelog

### v2026.11.14c (register table)
- Added §9: one register table (skill, issue title, URL, length band, cut order, taxonomy
  ranges) and the shared step flow. JSON shapes, eyebrows, guides and gate confirmation
  lines stay in each prompt. The three
  write prompts now hold only register-specific text. §3a's band list and the prompts' copies
  of the bands, the em dash replacement guidance (moved to §4) and the repeated step text
  were removed. No rule value changed; one stale sentence (the retired Step 2.75) was dropped.
  From the 2026-11-14 duplication audit, findings F1 to F3.

### v2026.11.14b (working draft holds every edit)
- §0b rewritten: one HTML working draft on `docs/conventions/content-draft-template.html`
  (Pink Moon, light default, light/dark toggle) holds every draft and every edit round, also
  for pieces already in Sanity. Sanity is synced at the end of a round, checked against the
  working draft, and used for final review. Replaces the read-only `-sanity-latest.html`
  review copy and the md option from v2026.11.14. §0 checklist, §7 and §8 updated. Asked for
  by Bex 2026-11-14.

### v2026.11.14 (local draft stage)
- Added §0b: draft locally in `docs/drafts/{ID}-{slug}/` (md, or html for diagrams, images and
  custom layout), create the Sanity draft only from the approved file, and export the live
  Sanity draft to `{ID}-{slug}-sanity-latest.html` before publish. §0 checklist, §7 and §8
  updated to match. Asked for by Bex 2026-11-14 after ST-162.

### v2026.11.12 (ST-221, citation links)
- §6: added the citation rule: `citationRef` mark in body text, typed `[N]` in table cells
  only, and `validate:content` check L. No skill told an author how to link a citation, and
  the ST-162 draft had 14 unlinked `[N]` markers.

### v2026.10.13 (glossary and metadata decision rule)
- Added §1a: cost ladder and decision rule for tag, tool, category and glossary term; glossary
  pre-flight query in §1; glossary line in §8. Each `write-*-prompt.md` Step 1 now points here.

### v2026.08.03 (aiDisclosure correction)
- §5 and §8: corrected the false claim that article has no `aiDisclosure` field. The field
  exists in `apps/studio/schemas/documents/article.ts`, is projected by every article query
  in `queries.js`, and renders via `PageSidebar` with a `tools[]`-assembled fallback and a
  human-authorship default (commit e871ebab, 2026-08-03). `write-blog-prompt.md` Step 2.6
  rewritten to match; the end-of-article `calloutSection` demoted from sole mechanism to
  optional supplement.

### v2026.07.18 (SUG-210 — initial creation)
- Extracted from `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`,
  and `glossy-prompt.md`'s duplicated write-time mechanics. See
  `docs/shipped/SUG-210-content-pipeline-rules-consolidation.md` for the full audit.
- This epic did not change what any rule says, only where it lives, with one flagged
  exception: consolidating glossy onto the canonical 17-item banned-vocabulary list adds
  "passionate about" and "excited to announce" to glossy's enforced list (glossy's own prior
  list was missing those two entries relative to node/blog/casestudy). Flagged for Bex at
  epic close-out rather than executed silently.
