# Usage Doc Style Guide

**Applies to:** All Storybook usage docs in `apps/storybook/.storybook/stories/`
**Template:** `_UsageDocTemplate.stories.tsx` (same directory)

---

## What a usage doc is

A usage doc answers one question: *how do I use this correctly?*

It is not a changelog, a design history, an implementation diary, or a planning document. Every sentence should be useful to someone implementing or reviewing a decision right now. If a sentence would only make sense to someone who was in the room when the decision was made, cut it.

---

## Sections — required and optional

### 1. Title + one-liner (required)

The H1 names the convention. One sentence beneath it says what it governs — not why it exists, not when it was introduced.

```
H1 Italic / Roman Rule
Which heading surfaces use italic Cormorant Garamond and which use roman.
```

### 2. The rule (required)

A single, bold, prescriptive statement. One sentence. No hedging.

```
Use italic for editorial surfaces. Use roman for catalogue and reference surfaces.
```

If the rule has two sides, put them in a two-column table or a short bullet pair. The reader should be able to read just this section and know what to do.

### 3. When to use (required)

Two columns: **Use X when** / **Use Y when**. Bullets, parallel structure. No prose intro.

Do not include: rationale, history, or "as a general rule". The rule section handled that.

### 4. Examples table (required)

One row per surface. Columns: Surface / Style / Live preview / CSS mechanism.

The live preview column should contain an inline rendered example using real DS tokens — not a screenshot, not a placeholder string. If the convention is visual, prove it visually.

### 5. Do / Don't (required)

Side-by-side pairs. Each pair: one do, one don't, short label. No explanatory prose per pair — the label is enough. If you need a sentence to explain a do/don't, the rule is underspecified; fix the rule section instead.

### 6. Implementation (required for code-touching conventions)

Specific file paths, class names, and token names. No narrative. Bullet list.

```
• apps/web/src/pages/pages.module.css — .archiveHeadingItalic, .archiveHeading
• apps/web/src/components/Hero.module.css — .heading
```

### 7. Accessibility (include if the convention has a11y implications)

Bullets only. Link to WCAG criterion by number if applicable.

---

## What to exclude

- **Origin stories** — "this doc was triggered by a question about..." belongs in a commit message, not a usage doc.
- **Phase N candidates** — backlog goes in Linear, not in published docs.
- **Uncertainty markers** — "TBD", "we might want to", "this could be extended". If it's not decided, don't document it.
- **Repeated headings from other docs** — if a rule is already in `CLAUDE.md` or another usage doc, link to it, don't restate it.
- **Internal rationale** — "we chose this because of a session on 2026-06-02". The rule stands on its own.

---

## Voice

- Second person, present tense: "Use italic on archive headings."
- No passive: not "italic is used on archive headings."
- No hedging: not "you may want to consider using italic."
- Imperative for rules: "Use / Don't use / Add / Set."
- Factual for descriptions: "`.archiveHeadingItalic` sets `font-style: italic`."

Same register as a linter rule. Brief. Unambiguous. No charm.

---

## Format rules (Storybook `.stories.tsx`)

- Inline styles only — no new CSS files, no className imports from other modules.
- All colours via `var(--st-*)` tokens. No hex values.
- The component is a function named `<ConventionName>Page` that returns a `<div>`.
- Meta: `title: 'Foundations/<Name>'`, `layout: 'padded'`, controls and actions disabled.
- One default export story: `export const Default: Story = {}`.
- Match the inline style object pattern from `ThemeGuide.stories.tsx` — shared `s` object at the top.

---

## Section ordering

```
Title + one-liner
The rule
When to use (two-column or bullet pair)
Examples table (with live preview)
Do / Don't
Implementation
Accessibility (if applicable)
```

Sections not needed for a particular convention can be omitted. Do not add sections not in this list without updating this style guide.
