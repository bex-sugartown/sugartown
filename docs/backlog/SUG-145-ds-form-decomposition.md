**Linear Issue:** [SUG-145](https://linear.app/sugartown/issue/SUG-145/ds-epic-2-form-decomposition-codify-field-primitives-field-label)

## EPIC SUG-145: DS Epic 2 — Form decomposition

**Source:** Component Naming Audit handoff — `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/docs/form-decomposition.md`

**Dependency:** SUG-144 (Card/Tile) has no hard dependency on this epic. SUG-145 can proceed in parallel, but Phase 1 field primitives must land before Phase 2 Form pattern.

**DECISION RECORD — Input codification status & canonical name (resolved 2026-06-03):**

**Codification status:** The audit marks `Text input` as `diverges`, not `present`. The registry does not list an Input/TextField primitive — a `comp-inputs` preview/token surface exists, but no confirmed Storybook story. The loose inference that a preview card equals "In system" is the exact failure mode that mis-filed Slider. Phase 0 action is: `grep packages/design-system/src/components/ -r "Input\|TextField"` + check for a `*.stories.*` file. If a story exists → flip to In system. If only tokens/preview exist → `To codify`, and Input becomes the first dependency of the whole epic.

**Canonical name: `Input`**
- The primitive hosts email, password, search, url, tel, number — naming it `TextField` bakes in a content assumption that is false for half its uses (a password field is not "text").
- `Input` names the role without that constraint and matches the platform vocabulary (`<input>`); `type` is configuration.
- This closes the same trap as `ContactForm` one level down: naming by content type (`TextField`, `PasswordField`, `SearchField`) spawns a family of use-case clones. `Input type="password"` is the composable model.
- Cross-system note: the audit logs `Text field` (Material, Apple, Polaris) and `Textfield` (Atlassian) as synonyms. Charter law 01 resolves the tie: name by what it is.

**Input vs Textarea split (hard constraint):**
`Input` is the single-line control primitive. `Textarea` is a separate sibling primitive (multi-line). Do NOT fold `textarea` into `Input` as a `multiline` prop (Material/Polaris pattern) — `Field` composes them differently, and the audit already lists `Textarea` as its own `To codify` primitive. The boundary is enforced by HTML semantics: `<input>` and `<textarea>` are distinct elements.

---

## Model & Mode

Use `opusplan` for planning phases. Sonnet executes from Files to Modify onward.

---

## Pre-Execution Completeness Gate

- [ ] **Phase 0 verification (not assumed):** run `find packages/design-system/src/components -iname "*input*" -o -iname "*textfield*"` and `find apps/storybook/src/stories -iname "*input*"`. If a `*.stories.*` file exists → Input is In system, skip Phase 0 codification. If only tokens/preview → Input is To codify and is the first dependency. Record the result here before proceeding.
- [x] DECISION resolved: canonical name is `Input`. `TextField` rejected (names content, not role). `type` is config. `Textarea` stays a separate primitive — do not fold via `multiline` prop. See Decision Record above.
- [ ] `ContactForm` current call-sites catalogued: `grep -r "ContactForm" apps/web/src/`
- [ ] Interaction surface audit: search all 4 layers for existing Field, Label, Textarea, HelperText, ErrorMessage implementations
- [ ] Token audit: all new component CSS uses `--st-*` tokens only
- [ ] a11y wiring scoped: every control must have `<label htmlFor>`; errors must use `aria-live` + `aria-describedby`
- [ ] Web adapter sync scoped for each new DS primitive

---

## Context

`ContactForm` is the headline charter offender: a use-case name (law 01) wrapping inline field anatomy that should be codified primitives (law 02). Current location: `apps/web/src/components/ContactForm.jsx`.

Audit rows in play:

| Component | Audit status | Action |
|-----------|-------------|--------|
| Form (ContactForm) | Diverges | Rename → Form pattern; "contact" is config |
| Input / Text input | Diverges — registry has preview/tokens only, no confirmed Storybook story | Verify in Phase 0: story exists → In system; no story → codify as `Input` (canonical name resolved; `Textarea` is a separate sibling) |
| Textarea | To codify | Codify as DS primitive |
| Field | To codify | Wrapper: label + control + helper + error |
| Label (form) | To codify | `<label htmlFor>` — distinct from `SectionLabel` |
| Helper text | To codify | Guidance caption below control |
| Error message | To codify | Inline validation, `aria-live` |
| Button | In system | Compose as-is (existing) |
| Select / Checkbox / Radio | Not yet | Out of scope — only if a given form needs them |

---

## Objective

After this epic: `ContactForm` is deleted. A generic `Form` pattern exists in `apps/web/src/components/Form.jsx`, rendering `Field[]` from a field schema and accepting an `action`/`onSubmit` config. Six field primitives exist as codified DS components with Storybook stories and registry rows: `Input` (verified or newly codified), `Label`, `Textarea`, `HelperText`, `ErrorMessage`, `Field`. The "contact form" is expressed as `Form` configured with a contact field schema + Netlify action — not as a component. No data layer, query layer, or route changes.

---

## Doc Type Coverage Audit

No schema or section changes. ContactForm is a web-app pattern, not a Sanity section type.

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | No section builder changes |
| `article` | No | No section builder changes |
| `caseStudy` | No | No section builder changes |
| `node` | No | No section builder changes |
| `archivePage` | No | No section builder changes |

---

## Schema Field Proposal

N/A — no Sanity schema changes in this epic.

---

## Scope

### Phase 0 — Verify Input codification status

Canonical name is settled: **`Input`**. The only open question is whether it already exists.

- [ ] Run: `find packages/design-system/src/components -iname "*input*" -o -iname "*textfield*"` and `find apps/storybook/src/stories -iname "*input*"`
- [ ] **If a `*.stories.*` file exists** → Input is In system. Skip to Phase 1. Update audit row: `Text input` → `present` (`Input`).
- [ ] **If only tokens/preview exist** → Input is `To codify`. Create `packages/design-system/src/components/Input/Input.tsx` + CSS module + web adapter + story (`Primitives/Input`) + registry row. This is the first dependency of every subsequent phase.
- [ ] Verify the Input/Textarea split is clean: `Input` handles single-line only; `type` is config (`text`, `email`, `password`, `search`, `url`, `tel`, `number`). No `multiline` prop on Input.

### Phase 1 — Codify field primitives

- [ ] `packages/design-system/src/components/Label/` — form-field label (`<label htmlFor>`); NOT SectionLabel. Story + registry.
- [ ] `packages/design-system/src/components/Textarea/` — multiline control. Story + registry.
- [ ] `packages/design-system/src/components/HelperText/` — guidance caption. Story + registry.
- [ ] `packages/design-system/src/components/ErrorMessage/` — inline validation; `role="alert"` or `aria-live="polite"`. Wired to control `aria-describedby`. Story + registry.
- [ ] `packages/design-system/src/components/Field/` — composes Label + control slot + HelperText + ErrorMessage; owns a11y wiring. Story + registry.
- [ ] Web adapter for each
- [ ] `pnpm validate:tokens --strict-colors` green for each

### Phase 2 — Build Form pattern

- [ ] `apps/web/src/components/Form.jsx` — renders `Field[]` from a schema; handles submit/validation/state
- [ ] Submit target is config: `action` prop (Netlify adapter) or `onSubmit` callback
- [ ] Story: `Patterns/Form` with a couple of field-schema fixtures

### Phase 3 — Migrate ContactForm

- [ ] Replace `ContactForm` usages with `Form` + contact field schema + Netlify action
- [ ] "contact" config lives in a `contactFormFields` constant (or Studio content) — not a component
- [ ] Deprecate `apps/web/src/components/ContactForm.jsx` with console.warn; delete after one minor

### Phase 4 — Close out

- [ ] Registry rows for Input (if new), Label, Textarea, HelperText, ErrorMessage, Field, Form
- [ ] Audit flips: those primitives → In system; Form row → In system; ContactForm retired
- [ ] `grep -r "*Form" apps/web/src/` — check for other use-case-named form clones; fold each into `Form` + config

---

## Non-Goals

- Select, Checkbox, Radio — not in scope (codify only if a specific form requires them)
- No Sanity schema changes
- No new routes or page templates
- No Studio UI changes

---

## Technical Constraints

- Web adapter sync mandatory for each DS primitive: JSX adapter + CSS module copy + index export.
- a11y is a hard requirement: every `Field` must wire `htmlFor` → control `id`; `ErrorMessage` must use `aria-live` and be linked via `aria-describedby`. This is not deferrable.
- `Label` must be clearly distinct from `SectionLabel` (eyebrow/heading label). Different component, different registry row, different story category.
- Tokens only; no raw hex/rgba in component CSS.

---

## Files to Modify

**DS primitives (create/update)**
- `packages/design-system/src/components/Input/` — CREATE or VERIFY (if already exists)
- `packages/design-system/src/components/Label/Label.tsx` — CREATE
- `packages/design-system/src/components/Label/Label.module.css` — CREATE
- `packages/design-system/src/components/Label/index.ts` — CREATE
- `packages/design-system/src/components/Textarea/Textarea.tsx` — CREATE
- `packages/design-system/src/components/Textarea/Textarea.module.css` — CREATE
- `packages/design-system/src/components/Textarea/index.ts` — CREATE
- `packages/design-system/src/components/HelperText/HelperText.tsx` — CREATE
- `packages/design-system/src/components/HelperText/HelperText.module.css` — CREATE
- `packages/design-system/src/components/HelperText/index.ts` — CREATE
- `packages/design-system/src/components/ErrorMessage/ErrorMessage.tsx` — CREATE
- `packages/design-system/src/components/ErrorMessage/ErrorMessage.module.css` — CREATE
- `packages/design-system/src/components/ErrorMessage/index.ts` — CREATE
- `packages/design-system/src/components/Field/Field.tsx` — CREATE
- `packages/design-system/src/components/Field/Field.module.css` — CREATE
- `packages/design-system/src/components/Field/index.ts` — CREATE
- `packages/design-system/src/index.ts` — add new exports

**Web adapters (create)**
- `apps/web/src/design-system/components/Label/` — CREATE
- `apps/web/src/design-system/components/Textarea/` — CREATE
- `apps/web/src/design-system/components/HelperText/` — CREATE
- `apps/web/src/design-system/components/ErrorMessage/` — CREATE
- `apps/web/src/design-system/components/Field/` — CREATE
- `apps/web/src/design-system/index.js` — add exports

**Web patterns**
- `apps/web/src/components/Form.jsx` — CREATE
- `apps/web/src/components/ContactForm.jsx` — MODIFY (add deprecation warning, then delete)

**Storybook**
- `apps/storybook/src/stories/Label.stories.jsx` — CREATE
- `apps/storybook/src/stories/Textarea.stories.jsx` — CREATE
- `apps/storybook/src/stories/HelperText.stories.jsx` — CREATE
- `apps/storybook/src/stories/ErrorMessage.stories.jsx` — CREATE
- `apps/storybook/src/stories/Field.stories.jsx` — CREATE
- `apps/storybook/src/stories/Form.stories.jsx` — CREATE

**Docs**
- `docs/conventions/component-registry.md` — UPDATE

---

## Deliverables

1. `Input` — codification confirmed or new primitive created; story + registry row
2. `Label`, `Textarea`, `HelperText`, `ErrorMessage`, `Field` — DS primitive + web adapter + Storybook story + registry row for each
3. `Form` pattern — renders Field[] from schema; Storybook story with fixtures; Netlify action config
4. `ContactForm` — deprecated with console.warn; removed from all call sites

---

## Acceptance Criteria

- [ ] No component name contains a form's use-case (`Contact*`, `Newsletter*`, …)
- [ ] `Form` renders only structure + submission; no domain content
- [ ] Every field primitive has DS primitive + web adapter + Storybook story + registry row
- [ ] `ContactForm` deleted; "contact form" expressed as `Form` + field schema config
- [ ] a11y: every control has an associated `Label`; errors announced via `aria-live` and linked by `aria-describedby`
- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] Storybook: Field story shows all states (empty, focused, filled, error, disabled) without console errors; dark-pink-moon theme verified

---

## Visual QA Gate

Agent prepares:
1. Storybook screenshots of Field (all states) + Form on default + dark-pink-moon theme
2. Token compliance grep: zero hardcoded values in new CSS files
3. Contact page renders correctly with the migrated `Form` component

Human gate: wait for "Visual QA approved" before close-out.

---

## Risks / Edge Cases

- Input may already be partially codified under a different name — check before creating a duplicate.
- `Label` name collision: confirm `SectionLabel` (eyebrow/headings) is a distinct component in the registry. They are not the same primitive.
- Netlify Forms integration in `ContactForm` must be preserved in the `Form` action config — do not break the contact form submission.

---

## Post-Epic Close-Out

1. Visual QA gate — produce comparison table; wait for "Visual QA approved"
2. Chromatic VRT — run; review changes
3. Flip audit rows: Input/Label/Textarea/HelperText/ErrorMessage/Field → `present`; Form → `present`; ContactForm → retired
4. Move `docs/backlog/SUG-145-ds-form-decomposition.md` → `docs/shipped/`
5. `/mini-release SUG-145`
6. Transition SUG-145 to Done in Linear
