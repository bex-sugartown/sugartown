# Content Authoring Guide — Sanity Studio

Conventions for authoring content in Studio. These rules govern what editors write and how they apply PT styles — they are the editorial complement to `schema-conventions.md` (which governs how schemas are built).

---

## Portable Text style reference

The `standardPortableText` config (used on `article`, `node`, `caseStudy`, and `page` content fields) exposes these styles in the Studio toolbar:

| Studio label | PT value | Use for |
|---|---|---|
| Normal | `normal` | Body paragraphs |
| **Section Heading** | `h2` | Top-level section headings (TL;DR, main H2s) |
| Subheading | `h3` | Sub-sections within an h2 section |
| Heading 4 | `h4` | Rare — deep nesting only |
| Blockquote | `blockquote` | Pull quotes, TL;DR body text (see below) |

---

## TL;DR sections — canonical format

Every long-form content document (article, node, case study) that includes a TL;DR must follow this exact pattern:

**Heading:** Select **Section Heading** (`h2`). Span text must be exactly:

```
TL;DR
```

Rules:
- Uppercase. No lowercase (`tl;dr`).
- No trailing colon. The heading is a label, not a sentence opener.
- Always h2 (Section Heading). Never h3 or lower.

**Body paragraph immediately after the heading:** Select **Blockquote**.

The blockquote style renders with a left accent bar — this visually anchors the TL;DR as a distinct navigational block, separate from the main body. A plain `Normal` paragraph after the TL;DR heading is wrong.

**Correct structure in Studio:**

```
[Section Heading]  TL;DR
[Blockquote]       The registry said one table primitive. The directory disagreed...
[Normal]           Body text continues...
```

**Wrong — do not do these:**

| What | Why it's wrong |
|---|---|
| `tl;dr:` as heading text | Wrong capitalisation and trailing colon |
| Heading 3 (`h3`) for TL;DR | Wrong level — TL;DR is always a top-level h2 |
| Normal paragraph after the TL;DR heading | Missing blockquote treatment — renders as plain body text |
| `tl;dr:` as a Subheading nested under another Section Heading | Wrong structure — TL;DR is a standalone top-level section |

---

## General heading discipline

- Use **Section Heading** (`h2`) for top-level section breaks.
- Use **Subheading** (`h3`) for subsections within an h2. Do not skip levels.
- Never use a heading just to make text pink or large — headings have semantic meaning and appear in the page TOC.
- The page title is always the document `title` field, not an h1 in the body. Do not author h1 text in the PT body.
