# EPIC — Brand Color Picker for Sanity Studio (BL-01)

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/studio`
**Priority:** 🟣 Soon
**Created:** 2026-03-15
**Origin:** BL-01 from EPIC-0156

---

## Objective

Replace the raw hex string input for `colorHex` on the `project` schema with the `@sanity/color-input` visual colour picker. Editors currently have to type a hex value like `#0099FF` into a plain text field — the picker gives them a swatch, hue slider, and alpha control with live preview. The field value shape changes from `string` to the `color` type object (`{ hex, hsl, hsv, rgb, alpha }`), which means all GROQ projections that consume `colorHex` must be updated to extract `colorHex.hex`.

**Data layer:** Field type change on `project` schema (`string` → `color`). Migration script to convert existing `colorHex` string values to the `color` object shape.
**Query layer:** GROQ projections that reference `colorHex` updated to `colorHex.hex`.
**Render layer:** No component changes — consumers already receive a hex string; the GROQ projection flattens the new object back to a string.

---

## Context

### Current state

- `apps/studio/schemas/documents/project.ts` — `colorHex` field is `type: 'string'` with regex validation (`/^#([0-9a-fA-F]{6})$/`)
- `@sanity/color-input` is already installed in `apps/studio/package.json` (v6.0.3) — no new dependency needed
- `colorHex` is used in:
  - Studio preview (`prepare()` shows hex suffix in subtitle)
  - GROQ: archive queries project `colorHex` for card `accentColor` prop
  - ContentCard: maps `projects[0].colorHex` → Card `accentColor`
  - Card component: `accentColor` → `--accent` CSS var → `color-mix()` colorway

### What `@sanity/color-input` provides

The `color` type stores an object:
```json
{
  "hex": "#0099FF",
  "hsl": { "h": 204, "s": 100, "l": 50, "a": 1 },
  "hsv": { "h": 204, "s": 100, "v": 100, "a": 1 },
  "rgb": { "r": 0, "g": 153, "b": 255, "a": 1 },
  "alpha": 1
}
```

The Studio renders a visual colour picker with swatch preview, hue/saturation pads, and hex/RGB/HSL input modes.

---

## Scope (draft — refine at activation)

### Schema change
- [ ] Change `colorHex` field from `type: 'string'` to `type: 'color'`
- [ ] Remove the regex validation (the color input handles validation natively)
- [ ] Update the `prepare()` preview to use `colorHex?.hex` instead of `colorHex`
- [ ] Optionally configure color picker options (disable alpha if not needed: `{ disableAlpha: true }`)

### Plugin registration
- [ ] Verify `@sanity/color-input` is registered as a plugin in `sanity.config.ts` (may already be — check)
- [ ] If not registered: `import {colorInput} from '@sanity/color-input'` and add `colorInput()` to the plugins array

### GROQ projection updates
- [ ] Update every GROQ query that projects `colorHex` to project `"colorHex": colorHex.hex`
  - Archive queries (allArticlesQuery, allNodesQuery, allCaseStudiesQuery — wherever `colorHex` is projected via `projects[]->`)
  - Detail slug queries if they project `colorHex`
- [ ] Verify ContentCard still receives a plain hex string after projection change

### Migration script
- [ ] Convert existing `colorHex` string values to the `color` object shape
  - Input: `"colorHex": "#0099FF"`
  - Output: `"colorHex": { "_type": "color", "hex": "#0099FF", "hsl": {...}, "hsv": {...}, "rgb": {...}, "alpha": 1 }`
  - Use a colour conversion library or compute HSL/HSV/RGB from hex
- [ ] Target: all `project` documents with a `colorHex` string value
- [ ] Dry-run / `--execute` pattern per migration script conventions

---

## Non-Goals

- Does **not** add colour picker to any other schema (tags, categories, etc.) — scoped to `project` only
- Does **not** use the alpha channel — `disableAlpha: true` is recommended
- Does **not** change Card or ContentCard component code — GROQ projections flatten to the same hex string shape

---

## Risks / Edge Cases

- **Empty `colorHex` values** — projects without a colour should not break the migration script. Skip documents where `colorHex` is null/undefined.
- **Invalid hex values** — if any existing `colorHex` values don't match the expected format, the conversion to HSL/HSV/RGB will fail. The migration script should validate and warn.
- **Plugin registration** — `@sanity/color-input` must be registered as a Sanity plugin, not just installed as a dependency. If it's not in `sanity.config.ts`, the Studio will render a "Unknown type: color" error. Verify at activation.
- **GROQ projection miss** — if any query projects `colorHex` without the `.hex` accessor, the frontend will receive an object instead of a string, breaking `accentColor` styling. Audit all queries.

---

## Trigger for Activation

Activate this epic when:
- Editors request a better colour editing experience
- A broader Studio UX polish sprint is planned
- Or as a quick win during low-priority cycles (small scope, high UX payoff)

---

*Created 2026-03-15. Origin: BL-01 from EPIC-0156. `@sanity/color-input` v6.0.3 already installed.*
