# /write-casestudy — Case Study Skill

Creates a portfolio case study as a Sanity draft (`_type: "caseStudy"`).

**Argument:** the engagement to write about — client, brief, or source notes. If not provided, ask before proceeding.

---

## Step 0 — Read the voice guides and ethics requirements

Before drafting anything, read:
- `docs/brand/brand-voice-guide.md` — full voice, anti-slop rules, social proof guidance
- `docs/brand/master-voice-cheatsheet.md` — the five principles, quick tone dial
- `docs/briefs/ai-ethics-and-operations.md` — disclosure and attribution requirements (Principles 3, 11, 13)

### Case study voice — "Show the receipts"

Case studies are conversion surfaces. A hiring manager or prospective client reads them to answer one question: *can this person solve my problem?* The tone dial (per the brand voice guide): **process + result, no fluff. Specificity is social proof.**

- **"I" = Bex.** Case studies are first-person PM, same as articles. Bex directed, decided, aligned stakeholders, wrote requirements. If AI tools were part of the engagement, they get credit for building ("Claude built the migration script; I wrote the requirements for it").
- **Numbers are the argument.** "Reduced migration effort from hundreds of hours to under two" beats "dramatically improved efficiency" every time. Every outcome claim should carry a number, a timeframe, or a named artifact. If the honest answer is qualitative, say so plainly (and mark it `qualitative` in the outcome tile) — an honest qualitative claim beats an invented number.
- **No enterprise-deck phrasing.** "Omnichannel enablement", "unified model powering", "digital transformation journey", "best-in-class" — this is the case-study-specific slop register. It reads like the client's own pitch deck. Translate every such phrase into what actually happened: who was blocked, what shipped, what changed.
- **Stakes, not just status.** Name what was breaking and what it was costing the business before describing the fix. The Challenge block earns the reader's attention; the outcomes pay it off.
- **Candor is credibility.** If the deadline forced shortcuts, say so and say what the remediation plan was. If the scope grew beyond the brief, tell that story — it's usually the most interesting part.
- **No em dashes.** Case studies get NO node exemption. Some live case study copy predates this rule — do not imitate it. (Exception as everywhere: `Title — Subtitle` in headings is fine.)
- **Anti-slop rules apply fully** — no decorative emoji, no AI vocabulary, no hedge stacking, no empty adjective triads.

**Title pattern:** live examples set the register — "Beauty Retail: From Monolith to Microservice", "Bare Minerals: From Bottlenecks to Brilliance", "Charting a New Course for Backroads.com". Subject plus an outcome-flavoured phrase. Wit is welcome; puns must earn it. SEO pattern per the brand guide: `[platform/technology] + [outcome verb]`.

### No hallucination (hard rule)

Every claim, number, date, award, and outcome must come from the user's brief, the source notes provided, or an existing live document. **Never invent proof points.** If a section needs a fact you don't have (a metric, a stack detail, a date range), ask for it or leave an explicit `[NEEDS FACT: …]` placeholder in the proposal — do not fill the gap with a plausible number. Mark every outcome tile's `evidenceType` honestly: `measured`, `estimated`, or `qualitative`.

---

## Step 1 — Pre-flight: engagement facts + taxonomy

### Engagement facts

Case studies feed the CV/resume engine, discovery filtering, and the metadata card. Collect these before drafting; ask the user for any that are missing rather than guessing:

| Field | Example |
|-------|---------|
| `client` | "Backroads" (or "Enterprise prestige beauty brand" if redacted) |
| `employer` | "Freelance", "Lorien", "Huge / Elephant" |
| `contractType` | `full-time` / `contract` / `freelance` / `advisory` |
| `role` | "Senior Technical Product Manager" |
| `dateRange` | startDate / endDate (blank endDate = ongoing) |
| `industry` | from the schema's fixed list (Healthcare, Fintech, B2B SaaS, E-commerce / Retail, …) |
| `companySize` | `startup` / `smb` / `enterprise` / `agency` / `internal` |
| `region` | "US", "US / UK / AU", "Remote" |

If the client name is confidential, redact consistently everywhere (title, body, summaries) — pattern from live docs: "a premium beauty retailer", client field "&lt;Redacted&gt;".

### Taxonomy

Query Sanity for existing taxonomy. Do NOT create new taxonomy documents unless asked.

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
- 1–2 categories (schema warns at 3+)
- 3–6 tags
- Tools: what **Bex** used in the engagement (`tools` is "Bex's Tools" — practitioner tools like Storybook, Claude, dbt; client-operated platforms are tagged `kind=platform` on the tool doc)
- Authors: Bex Head by default (look up her person _id)
- Project: only if the engagement maps to an existing project doc

Also query for related content:
```groq
*[_type in ["node", "article", "caseStudy"] && defined(slug.current)] | order(publishedAt desc) [0..20] { _id, _type, title, slug }
```

---

## Step 2 — Draft the case study

All 7 live case studies follow one canonical section order (this is also the SUG-207 north-star template). Use it — do not invent a new shape:

1. **heroSection** — `eyebrow: "Case Study"`, `heading: <display title>`
2. **calloutSection** — `title: "Challenge"`, body: one tight paragraph naming what was broken and what it was costing the business. This is the hoisted challenge block; write it to stand alone.
3. **cardSection** — `label: "Outcomes"`, items: 3–4 `outcomeItem` tiles. Each: `metric` (what was measured), `valueBefore` / `valueAfter` (the receipt), `impactStatement` (plain-language sentence), `evidenceType` (`measured` / `estimated` / `qualitative` — honest, see Step 0). Lead with the strongest number.
4. **textSection** — `heading: "Overview"`, the narrative body. Open with a 2–3 sentence engagement summary, then `h3` subsections:
   - **Challenge** — expanded version of the callout: systemic issues found, business impact
   - **My Role** — role title bold, then bulleted responsibilities (parallel, verb-first)
   - **Process** — how the work actually unfolded (discovery, evaluation, implementation — name the phases for what they were, not template labels)
   - **Key Outcomes** — bulleted, each anchored to something specific
   - **Reflection** — 2–4 sentences of honest hindsight. This is where the best line of the case study usually lives; don't waste it on summary.
5. **imageGallery** — "Visuals / Artifacts", only if the user provides images. Never invent artifacts.
6. **accordionSection** — `heading: "Key Questions"`, **`semantic: "faq"` (required — this exact value drives the schema.org FAQPage JSON-LD; without it, no structured data is emitted)**. This is the AEO/GEO delivery mechanism and a base template concern, not an optional extra. 3–4 `accordionItem`s:
   - `title`: a question a prospective client evaluating Bex would actually ask ("What do you do when a project scope expands beyond the brief?", "How do you approach CMS vendor selection?")
   - `content`: 2–4 sentences, **third person** ("Bex ran a structured RFI…") — written for LLM extraction, grounded in this specific engagement

**Length budget (declare before drafting):** state the target Overview word count and one line of justification against the band (500–1,200). Length is a budget, not a ceiling: readers skim roughly a fifth of the words on a page and bail in the middle third, so words past the payload are debt. If the draft runs over budget, Process detail pays first — the Challenge, the receipts, and the Reflection are never the cut.

**Skim skeleton self-check (after drafting, before Step 2.5):** the case study's skeleton is structural, not just textual — challenge callout + outcome tiles + section subheads + Reflection's first sentence. That artifact is the whole page for a 30-second reader (and for the prospective client deciding whether to keep reading). If it does not tell the engagement's story alone, fix the skeleton before fixing anything else.

**Show, don't tell self-check:** the outcome tiles (`cardSection` step 3, above) are already the canonical table for before/after metrics — do not also narrate those same numbers as prose in the Overview; state the outcome once, in the tiles, and let the Overview's prose interpret it rather than repeat it. Separately, scan the Process subsection for any prose narrating a comparison across multiple options, vendors, or phases along multiple dimensions (a vendor bake-off, a multi-phase timeline with different metrics per phase) — that shape is a `tableBlock`, not a paragraph walking the reader across each one in turn. `tableBlock` is valid Portable Text inside the Overview `textSection`, no schema work needed. See `docs/brand/brand-voice-guide.md`'s Do This / Not This table.

**Deprecated fields — never write these:** `challengeSummary` (use the calloutSection), `outcomes[]` (use the cardSection), `keyQuestions[]` (use the FAQ accordion), `cardImage`, `relatedProjects` (use `projects`).

**Citations:** do NOT add `citationRef` markDefs to section content via MCP — a `citationRef` inside nested PT locks the entire section in Studio (see CLAUDE.md). If the case study needs endnotes, flag it in the report and leave citations for manual Studio work.

### Retrieval fields (required)

- **`aeoSummary`** — one paragraph (≤600 chars) answering "What did Bex do for [client]?" directly. Written for AI citation and featured snippets. Role, engagement, headline outcome. No em dashes, no jargon, no hedge stacking.
- **`geoSummary`** — fact-dense third-person inventory (≤600 chars), no narrative. Format: `Client: X (size, industry). Engagement: Y, dates. Role: Z (contract type). Stack: A, B. Outcomes: …. Region: R.`
- **`excerpt`** — ≤300 chars, the archive-listing summary. Lead with the strongest receipt.

---

## Step 2.5 — Brand voice compliance gate (blocking — runs before any Sanity write)

Do not call `create_documents_from_json` until every item below is resolved. Fix violations in the draft first.

**Em dashes (zero tolerance — case studies have no node exemption):**
Scan all drafted text for `—`. Replace every instance with a colon, comma, parentheses, or two sentences. Only `Title — Subtitle` heading separators may remain.

**Banned vocabulary — replace if found:**
`leverage`, `utilize`, `delve into`, `facilitate`, `synergize`, `ideate`, `learnings`,
`passionate about`, `excited to announce`, `in today's landscape`, `robust`, `scalable`,
`seamless`, `cutting-edge`, `game-changing`, `innovative`, `unlock`

**Enterprise-deck phrasing — replace with what actually happened:**
`omnichannel enablement`, `unified model powering`, `digital transformation journey`,
`best-in-class`, `end-to-end solution`, `drive business value`, `strategic initiative`

**Filler transitions — delete, don't replace:**
`That said,` / `With that in mind,` / `That being said,` / `It's worth noting that` /
`At the end of the day` / `It goes without saying` / `Needless to say`

**Structural tells:**
- Three consecutive sentences starting with the same word → rewrite at least one.
- Any adjective triad → delete two adjectives or replace with a specific number.
- Hedge stacks → pick a position.
- Bullets that aren't parallel items → write prose.

**Receipts check (case-study-specific):**
- Every outcome tile has an honest `evidenceType`.
- No number, date, award, or claim appears that wasn't in the source material.
- No superlative doing a number's job ("significantly reduced" → the actual figure or a qualitative statement marked as such).

**"I" check:**
Every first-person sentence is attributable to Bex directing, deciding, or aligning. If AI built something in the engagement, the AI is named as the builder.

After completing this scan, state explicitly: **"Compliance gate passed — no violations found."** Then proceed to Step 2.6.

---

## Step 2.6 — Disclosure & attribution (required)

Per `docs/briefs/ai-ethics-and-operations.md` Principles 3, 11, and 13 (EU AI Act Article 50, enforceable August 2026; US state disclosure laws).

**`aiDisclosure` field is mandatory when this skill drafts the copy.** It renders below the byline. Use the appropriate string:

| Authorship | `aiDisclosure` value |
|------------|----------------------|
| Claude drafted from source notes, Bex edits before publish | `"Drafted with Claude, edited by Bex Head."` |
| Claude assisted with structure/summaries, Bex wrote the narrative | `"Structural assistance by Claude (Anthropic). Written and edited by Bex Head."` |
| Bex wrote entirely, AI only reviewed | Leave blank (schema convention: blank = fully human-authored). |

When this skill produces the draft, the first string is the default. The engagement itself was human work; the disclosure covers the write-up, not the work.

**Tools field as attribution:** if AI tools were used **in the engagement**, they belong in `tools` (machine-readable attribution). Do not add Claude to `tools` merely for drafting this page — `tools` records the engagement stack, `aiDisclosure` records the authorship.

**Images:** any images require descriptive `alt` text (WCAG 2.1 AA). If AI-generated, name the generation tool in `alt` or `caption`.

---

## Step 3 — Create the Sanity draft

Use `create_documents_from_json` (NOT `create_documents_from_markdown` — no AI rewriting).

```json
{
  "_type": "caseStudy",
  "title": "<internal title — drives SEO <title> and slug>",
  "slug": { "_type": "slug", "current": "<slug>" },
  "excerpt": "<≤300 chars, strongest receipt first>",
  "publishedAt": "<today's date ISO>",
  "updatedAt": "<today's date ISO>",
  "client": "<client>",
  "employer": "<employer>",
  "contractType": "<full-time|contract|freelance|advisory>",
  "role": "<role>",
  "dateRange": { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" },
  "industry": ["<from schema list>"],
  "companySize": "<startup|smb|enterprise|agency|internal>",
  "region": "<region>",
  "aiDisclosure": "Drafted with Claude, edited by Bex Head.",
  "aeoSummary": "<direct-answer paragraph>",
  "geoSummary": "<fact inventory>",
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
      "eyebrow": "Case Study",
      "heading": "<display title>",
      "imageTreatment": { "_type": "mediaOverlay", "overlayOpacity": 50, "panel": false, "type": "none" },
      "imageWidth": "content-width",
      "showStatRail": false
    },
    {
      "_key": "challenge-1",
      "_type": "calloutSection",
      "title": "Challenge",
      "body": [ ...PT blocks ]
    },
    {
      "_key": "outcomes-1",
      "_type": "cardSection",
      "label": "Outcomes",
      "items": [
        {
          "_key": "outcome-1",
          "_type": "outcomeItem",
          "metric": "<what was measured>",
          "valueBefore": "<state before>",
          "valueAfter": "<state after>",
          "impactStatement": "<plain-language sentence>",
          "evidenceType": "measured"
        }
      ]
    },
    {
      "_key": "overview-1",
      "_type": "textSection",
      "heading": "Overview",
      "content": [ ...PT blocks with h3 subsections ]
    },
    {
      "_key": "faq-1",
      "_type": "accordionSection",
      "heading": "Key Questions",
      "semantic": "faq",
      "items": [
        {
          "_key": "kq-1",
          "_type": "accordionItem",
          "title": "<question a prospective client would ask>",
          "content": [ ...PT blocks, third person ]
        }
      ]
    }
  ]
}
```

All array items must have a unique `_key`. PortableText blocks need `_key`, `_type`, `style`, `markDefs: []`, and `children` with `_key`, `_type`, `marks`, `text` — omitting `markDefs`/`marks` makes the content uneditable in Studio.

**Double-check `semantic: "faq"` is set on the accordion before writing** — it is an easy-to-miss field and its absence silently drops the FAQPage JSON-LD.

---

## Step 4 — Report back

After creating the draft, report:
- Sanity draft ID (`drafts.*`)
- Slug (`/case-studies/<slug>`)
- `aiDisclosure` string used and why
- Engagement facts recorded (client, employer, contractType, role, dateRange, industry, companySize, region) — flag any left blank
- Outcome tiles with their `evidenceType` values — flag anything marked `estimated`/`qualitative` that the user might be able to firm up
- FAQ accordion present with `semantic: "faq"` confirmed (JSON-LD will emit)
- `aeoSummary` / `geoSummary` populated
- Any `[NEEDS FACT: …]` placeholders remaining (these block publish)
- Taxonomy attached (categories, tags, tools) and any concepts with no existing match
- Any related content linked
- Any images included — confirm alt text is present
