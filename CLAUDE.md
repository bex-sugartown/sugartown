# Sugartown — Claude Code Conventions

> These conventions apply to all sessions in this repo. They supplement MEMORY.md
> (auto-loaded) and docs/epic-template.md (used for epic authoring).

---

## Session Discipline

### Epic close-out sequence

When an epic is complete, run these steps in order before starting the next epic:

1. **Commit** all epic changes with a scoped message (`feat(...)`, `refactor(...)`, etc.)
2. **Mini-release** — run `/mini-release` to produce a patch version bump and CHANGELOG stub
3. **Clean tree** — confirm `git status` is clean before starting EPIC-N+1

Do not carry uncommitted changes across epic boundaries. If the working tree is dirty when a new epic begins, stop and commit or stash (`git stash push -m "WIP: EPIC-XXXX — <reason>"`) before proceeding.

A dirty tree at epic start is a process failure, not a starting condition.

### CSS layout fix escalation rule

When a CSS layout fix fails and requires a follow-up commit, **stop and diagnose before patching**. Write a 1-paragraph root-cause analysis covering the full cascade (containment → flex/grid → margin → max-width → child sizing) before writing the next fix.

If 2+ fix commits address the same layout surface in sequence, treat it as a signal to step back, map the full constraint chain, and fix the root cause — not the symptom.

### `container-type` guardrail

`container-type: inline-size` establishes size containment that can interfere with flex-grow negotiation. Before applying it:

1. Verify the element does **not** use `margin: auto` on the inline axis (auto margins + containment prevents stretch)
2. Verify the element's parent flex/grid context does not rely on the child growing beyond its basis
3. If the element is a flex child, add `width: 100%` explicitly — do not rely on `align-items: stretch` surviving containment

If a layout collapses after adding `container-type`, remove the containment first and replace the `@container` query with a `@media` query or intrinsic grid sizing (`minmax()`).

### Studio schema changes get their own commit

Any change to `apps/studio/schemas/` that is **not** a direct consequence of a DS component API decision belongs in a separate commit scoped to a studio concern — it must **not** be bundled into a component, tooling, or web epic commit.

Commit prefix: `feat(studio):` or `fix(studio):`.

If a schema change is needed to unblock a component epic, commit the schema change first, then begin the component work in a subsequent commit.

### Paired schema convention

When an **object schema** and a **document schema** represent the same logical concept, they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit.

Known pairs:
- `ctaButton` (object, `schemas/objects/ctaButton.ts`) ↔ `ctaButtonDoc` (document, `schemas/documents/ctaButtonDoc.ts`)

When adding a new object/document pair, register it in this list. A fix to one half of a pair that misses the other is a bug, not a follow-up.

### Section Layout Contract

All page sections rendered by `PageSections.jsx` must share:

1. **Horizontal containment** — inherited from parent when inside a detail page (`context="detail"`). Sections must not define their own `max-width` or `padding-inline` in this context.
2. **Vertical rhythm** — `padding-block` only, using `--st-spacing-stack-lg` (32px) for standard sections in detail context.
3. **Typography** — body text uses `var(--st-font-heading-4)`, headings use `var(--st-font-heading-*)` scale, h2 colour is `var(--st-color-brand-primary)`.

When adding a new section type, verify it renders correctly:
- Adjacent to existing section types on a real page (not just in isolation)
- Inside both `context="detail"` (detail pages) and `context="full"` (standalone pages)
- Check `.detailContext` overrides in `PageSections.module.css` and add the new section class if it has its own `max-width` / `padding-inline`

### GROQ projection audit for nested image types

When writing a GROQ projection for an array of objects that contain image fields, verify the depth of the asset reference. Schema types that wrap `image` in another object (like `richImage`) require flattening:

```groq
// richImage: asset is a field of type 'image', which itself contains asset._ref
images[] {
  "asset": asset.asset->,   // dereference the INNER reference
  "hotspot": asset.hotspot,
  "crop": asset.crop,
  alt,
  caption
}
```

Do **not** write `asset->` on a `richImage` — that dereferences the `image` object, not the reference inside it, and silently returns null.

---

## Pre-Commit Checklist for CSS Token Changes

Whenever `apps/web/src/design-system/styles/tokens.css` **or** `packages/design-system/src/styles/tokens.css` is edited:

1. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
2. Update **both** token files in the same commit — they must stay in sync at all times.

This catches: duplicate definitions, renamed tokens with lingering references, and cross-file drift. See MEMORY.md §Token Drift Rules for background.
