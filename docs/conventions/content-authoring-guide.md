# Content Authoring Guide — Sanity Studio

Conventions for authoring content in Studio. These rules govern what editors write and how they apply PT styles — they are the editorial complement to `schema-conventions.md` (which governs how schemas are built).

---

## Portable Text style reference

The `standardPortableText` config (used on `article`, `node`, `caseStudy`, and `page` content fields) exposes these styles in the Studio toolbar:

| Studio label | PT value | Use for |
|---|---|---|
| Normal | `normal` | Body paragraphs |
| Heading 2 | `h2` | Top-level section headings |
| Heading 3 | `h3` | Sub-sections within an h2 section |
| Heading 4 | `h4` | Rare — deep nesting only |
| Blockquote | `blockquote` | Pull quotes, TL;DR body text (see below) |

---

## TL;DR sections — canonical format

TL;DR sections use the `textSection` **Section Heading** field (the dedicated string input at the top of the section), not a PT heading block inside the content body.

**In Studio:**
1. Add a **Text Section** block via Page Sections
2. Set the **Section Heading** field to exactly: `TL;DR`
3. In the **Content** PT field, write the TL;DR body paragraph using the **Blockquote** style

The blockquote style renders with a left accent bar — this visually anchors the TL;DR as a distinct navigational block, separate from the main body.

**Rules:**
- Label: `TL;DR` — uppercase, no trailing colon
- Use the Section Heading field, not an h2 block inside the PT body
- Body text: Blockquote style, not Normal

**Wrong — do not do these:**

| What | Why it's wrong |
|---|---|
| `tl;dr:` or `TL;DR:` as the heading | Trailing colon is wrong — the label is `TL;DR` |
| Heading 2 block inside PT body for the TL;DR label | Use the Section Heading field instead |
| Normal paragraph for the TL;DR body | Missing blockquote treatment |

---

## AI Disclosure — canonical strings

The `aiDisclosure` field renders below the byline on article and node detail pages. Use the string that matches the actual collaboration model. Do not leave it blank on AI-assisted content.

| Collaboration model | `aiDisclosure` string |
|---|---|
| Bex provided outline/strategy; Claude drafted; Bex edited and published | `Concept and strategy by Bex Head. Drafted with Claude (Anthropic). Edited and published by Bex Head.` |
| Claude drafted and narrated (node voice); Bex directed | `Narrated by Claude, directed by Bex Head.` |
| Claude assisted with research/structure only; Bex wrote | `Research and structural assistance by Claude (Anthropic). Written and edited by Bex Head.` |
| Bex wrote entirely; no AI involvement | *(leave blank)* |

**Rules:**
- The "outline-led, AI-drafted, human-edited" string (row 1) is the canonical form for articles where Bex provided the intellectual content and Claude produced the first draft. This is the most common article collaboration pattern.
- Never write "I" in the disclosure — it renders in third person on the page.
- No em dashes in disclosure strings.
- Match the model honestly. If Claude only checked grammar, that is not "drafted with Claude."

---

## General heading discipline

- Use the **Section Heading** field on `textSection` for top-level section labels.
- Use **Heading 2** inside PT body for major structural breaks within a section's content.
- Use **Heading 3** for subsections within an h2. Do not skip levels.
- Never use a heading just to make text pink or large — headings have semantic meaning and appear in the page TOC.
- The page title is always the document `title` field, not an h1 in the body. Do not author h1 text in the PT body.
