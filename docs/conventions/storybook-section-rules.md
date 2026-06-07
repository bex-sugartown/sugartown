# Storybook Docs — Section Rules

**Version:** 2026-06 · Sugartown DS  
**Applies to:** All story files in `packages/design-system/` and `apps/web/`

This document defines the canonical rules for each of the 14 doc sections.  
The visual reference is `Storybook Docs Template.html` in this package.

---

## Coverage model

| Section | SB Autodoc | Custom (Guidelines story) |
|---------|-----------|--------------------------|
| 01 Overview / Purpose | — | ✓ |
| 02 Live Preview | ✓ | — |
| 03 Code / Usage Examples | ✓ | — |
| 04 Props / API | ✓ (tags: ['autodocs']) | — |
| 05 Composition Patterns | ✓ (named exports) | — |
| 06 Usage Guidelines | — | ✓ |
| 07 Accessibility | — | ✓ |
| 08 Design Tokens | — | ✓ |
| 09 Anatomy | — | ✓ |
| 10 Variants | — | ✓ |
| 11 States | — | ✓ |
| 12 Content Guidelines | — | ✓ |
| 13 Related Components | — | ✓ |
| 14 Changelog | — | ✓ |

**Priority:** 01–08 are Must Have. 09–14 are Should Have (include before merging).

---

## Section rules

### 01 · Overview / Purpose — MUST HAVE

**What goes here:**
Three mandatory sub-sections:

1. **What it is** — one sentence. "[ComponentName] is the [noun] that [verb phrase] on [location]."
2. **What it does** — 3–5 bullet points using `→` arrows. Each bullet = one capability.
3. **What it is not** — 2–3 bullet points using `✗`. Prevents misuse. Points to the correct alternative.

**Rules:**
- No marketing copy. No adjectives like "powerful" or "flexible."
- "What it is not" must cite a specific alternative component.
- This section does NOT replace the JSDoc `description` on the component — keep both.

**Implementation:** Written in the `Guidelines` story's JSX, not in meta `docs.description.component`. The meta description should be a one-sentence lead only.

---

### 02 · Live Preview — MUST HAVE

**What goes here:** The interactive Storybook Canvas with the Controls panel.

**Rules:**
- Covered automatically by `tags: ['autodocs']` + the default export story.
- The Controls panel is auto-generated from prop types — do not suppress it.
- Set `layout: 'fullscreen'` for full-width components; `'centered'` for self-contained ones.
- The first story in the file is the one shown in the Live Preview position.

**Implementation:** Storybook autodocs handles this. No manual work required.

---

### 03 · Code / Usage Examples — MUST HAVE

**What goes here:** Import snippet + minimal usage example + complete usage example.

**Rules:**
- Required: `import` statement showing all needed imports from `@sugartown/design-system`.
- Required: minimal usage (required props only, simplest variant).
- Required: complete usage (all slots populated, most complex variant).
- Optional: pattern-specific snippets (e.g. archive vs entity page patterns).
- All code examples use DS tokens — no hardcoded hex or px values.
- No decorative stories here — usage context belongs in section 05.

**Implementation:** Storybook autodocs shows story source automatically. Add the import + pattern snippets in `meta.parameters.docs.description.component` as fenced code blocks, or in the `Guidelines` story.

---

### 04 · Props / API — MUST HAVE

**What goes here:** The autodocs prop table — name, type, default, required, description.

**Rules (LOCKED — do not override):**
- Column order: Name · Type · Default · Required · Description.
- Generated from JSDoc on the TypeScript interface — write docs on each prop, not on the component.
- One sentence per description. Present tense.
- Prop names are verbatim from the interface — never rename in docs.
- `argTypes` overrides in meta are allowed for: restricting a free-text prop to a `select`, adding explicit option labels.
- Do not suppress any prop from the table (`control: false` is allowed; `table: { disable: true }` is not).

**Implementation:** Add JSDoc `/** */` blocks to each prop in the component's TypeScript interface. Autodocs reads these automatically.

---

### 05 · Composition Patterns — MUST HAVE

**What goes here:** All named story exports — one per distinct usage context.

**Naming convention:** `"[Category] — [Descriptor]"`
- "Archive — Articles"
- "Entity — Person Folio"
- "With Actions"

**Rules:**
- Order: simplest → most complex. Snapshot story always last.
- Show ALL named exports — do not cherry-pick for the docs view.
- Each story has a JSDoc `/** */` comment: one sentence describing what it demonstrates.
- The Controls panel in section 02 covers individual prop exploration — stories here show usage context.
- Mock subcomponents (passed as slot props in stories) must be clearly labelled `Mock*` and carry a comment: `// replace with real import in apps/web`.

**Snapshot story (required):**
```tsx
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Stack all variants — one VRT screenshot covers all */}
    </div>
  ),
};
```

---

### 06 · Usage Guidelines — MUST HAVE

**What goes here:** Do / Don't grid.

**Rules:**
- Maximum 5 items per column.
- One sentence each. No code examples (those belong in section 03).
- Focus on: boundary conditions, common misuse, composability pitfalls.
- Do NOT repeat Props/API content.
- "Don't" items must name the specific thing to avoid, not vague "bad patterns."

**Visual:** Two-column grid. Do column = seafoam left-border + ✓ marker. Don't column = pink left-border + ✗ marker.

---

### 07 · Accessibility — MUST HAVE

**What goes here:** Accessibility requirements for implementers.

**Required topics (every component):**
1. Semantic HTML — root element, landmark roles
2. ARIA attributes — which ones, when they change
3. Focus behaviour — interactive components only (or "non-interactive, no focus management")
4. Colour contrast — confirm WCAG AA pass in both themes
5. Motion — confirm `prefers-reduced-motion` support or state "no animations"

**Keyboard interaction table:** Required ONLY for components that have keyboard interactions. Omit entirely if the component is non-interactive.

**Screen reader notes:** Required when announced output is non-obvious (e.g. count badge, eyebrow text-transform, loading states).

---

### 08 · Design Tokens — MUST HAVE

**What goes here:** Every CSS custom property the component consumes, mapped to its visual role.

**Groups (in order):** Layout · Typography · Colour & Surface · Spacing

**Column rules (LOCKED):**
- **Token** — exact CSS variable name (e.g. `--st-color-bg-surface`)
- **Value** — resolved value in `light-pink-moon` at rest state (e.g. `#FAFAFA`)
- **Role** — one phrase (e.g. "Base background")

**Rules:**
- Do NOT document tokens from slot components — those belong in each slot's own docs.
- Do NOT document tokens that the component passes through without consuming.
- Values must match `canonical-snapshot/tokens.css` + `canonical-snapshot/theme.pink-moon.css`.
- If a token resolves differently in dark mode, add a note in the Role column.

---

### 09 · Anatomy — SHOULD HAVE

**What goes here:** Labeled ASCII diagram of every named DOM part.

**Rules:**
- Use the component's actual CSS module class names as labels (`.root`, `.topRow`, `.content`, etc.).
- Show the most complete variant — all slots populated.
- No screenshots. Diagram only — it must be readable in dark mode and copy-pasteable.
- Update class names when CSS module is refactored — anatomy is a contract, not decoration.

---

### 10 · Variants — SHOULD HAVE

**What goes here:** Visual grid of all distinct configurations.

**Rules:**
- Variants ≠ stories. Variants are conceptual configurations; stories are named exports.
- Each card: variant name + rendered component instance + prop diff from the minimal variant.
- Use actual `<ComponentName>` renders — not screenshots or mockups.
- Label prop diffs in monospace below each variant.

---

### 11 · States — SHOULD HAVE

**What goes here:** Every conditional rendering state with label + trigger + visual.

**For interactive components:** hover, focus, active, disabled, loading, error.  
**For non-interactive components:** loading/skeleton, empty (no content), error.

**Rules:**
- Each state must show the actual rendered component, not a description.
- Trigger column explains what causes this state: data condition, user action, or prop value.
- Hover and focus states can be shown as static screenshots if JS-triggered states are hard to capture.

---

### 12 · Content Guidelines — SHOULD HAVE

**What goes here:** Rules for every text-bearing prop.

**Table columns (LOCKED):** Prop · Rule · Character limit · Example

**Rules:**
- Rules must be actionable: "sentence case, no terminal punctuation" not "keep it short."
- Character limits must match the CSS `max-width` or line-length constraint in the component.
- Examples must be real — no "Lorem ipsum" or "[Component title]" placeholders.
- Include a note if the prop's content is constrained by CMS schema validation.

---

### 13 · Related Components — SHOULD HAVE

**What goes here:** Components with a direct relationship to this one.

**Include if:** slot dependency, common alternative, or frequent co-usage.  
**Exclude:** components that share a category but have no direct relationship.

**Card fields:** name · why it relates · when to use it instead  
**Maximum:** 6 cards (2×3 grid).

---

### 14 · Changelog — SHOULD HAVE

**What goes here:** Version history for this component's public API and visual contract.

**Rules:**
- Most recent version first.
- Breaking changes carry a BREAKING badge.
- Only document changes to this component — not dependency bumps or tooling changes.
- Use semantic versioning matching `packages/design-system/package.json`.
- Format: `vX.Y.Z · YYYY-MM-DD · bullet list`

---

## Story file structure (canonical order)

```
meta (export default)
  └─ title, component, tags: ['autodocs'], parameters, argTypes

Named story exports (section 05)
  ├─ Default (simplest)
  ├─ [Variant A]
  ├─ [Variant B]
  ├─ ...
  └─ Snapshot (Chromatic VRT — always last)

Guidelines story (sections 01, 06–14)
  └─ export const Guidelines: Story = { ... }
```

## Naming rules

| Element | Convention | Example |
|---------|-----------|---------|
| Story file | `ComponentName.stories.tsx` | `PageHeader.stories.tsx` |
| Meta title | `"[Category]/[ComponentName]"` | `"Patterns/PageHeader"` |
| Story export | `PascalCase` | `ArchiveDefault`, `EntityPersonFolio` |
| Story display name | `"[Category] — [Descriptor]"` | `"Archive — Articles"` |
| Guidelines story | always `Guidelines` | `export const Guidelines` |
| Snapshot story | always `Snapshot` | `export const Snapshot` |
| Mock subcomponent | `Mock[ComponentName]` | `MockBreadcrumb`, `MockAvatar` |
