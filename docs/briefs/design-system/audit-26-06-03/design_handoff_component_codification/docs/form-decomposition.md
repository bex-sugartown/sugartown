# Form decomposition — retiring `ContactForm` (a law-01 + law-02 case study)

> Status: proposed · Owner: DS · Source of record: the Component Naming Audit + `uploads/component-registry.md`
> Governing rules: the Naming & Composition Charter (`docs/README.md`, `CHARTER.md`).

The headline offender. `ContactForm` is a **use-case name** (law 01) wrapped around field anatomy that is
**re-implemented inline** instead of composed from primitives (law 02). The fix has two halves: rename the
pattern to `Form`, and codify the field primitives it should have been built from. "Contact" then becomes
configuration — a `Form` fed a field schema + a submit target — not a component.

---

## 1. The problem

`web/components/ContactForm.jsx` (`Patterns/ContactForm`, Netlify Forms POST) bakes in:

- a **use-case name** — "contact" is a domain noun, not a structure;
- **inline field anatomy** — label + control + helper + error, hand-rolled per field;
- a **submit target** (Netlify POST) hard-wired into the component.

So every new form ("newsletter signup", "RFP intake", …) tempts another `XForm` clone, each re-deriving the
same field plumbing. None of the field pieces exist as codified primitives.

**Audit rows in play** (current status):

| Concept | Audit status | Becomes |
|--------|--------------|---------|
| Form (`ContactForm`) | Diverges → rename | **pattern** `Form` (composition) |
| Text input | Diverges (`Input`) — *confirm story; see SUG-145* | **primitive** `Input` (verify/codify) |
| Textarea | To codify | **primitive** |
| Field (label+control+error wrapper) | To codify | **primitive** |
| Label (form) | To codify | **primitive** (distinct from `SectionLabel`) |
| Helper text | To codify | **primitive** |
| Error message | To codify | **primitive** |
| Button | In system | composed as-is |
| Select / Checkbox / Radio | Not yet | only if a given form needs them |

---

## 2. Target architecture

```
Form                              PATTERN · structure + submit handling (no use-case in the name)
│                                 props: fields[] (schema) · onSubmit/action (Netlify, etc.)
└─ Field                          PRIMITIVE · one row: label + control + helper + error
   ├─ Label                       primitive (form caption — NOT SectionLabel)
   ├─ ▢ control slot              → Input | Textarea | Select | Checkbox | Radio
   ├─ Helper text                 primitive (guidance below control)
   └─ Error message               primitive (inline validation)
                                  …and a Button (existing) for submit

Instances are CONFIG, not components:
  "contact form"      = Form fields=[name, email, message] action="netlify:contact"
  "newsletter signup" = Form fields=[email]                action="netlify:newsletter"
```

**The rule made concrete:** `Form` owns structure + submission. Each `Field` composes a `Label`, a control
primitive, and validation primitives. A *specific* form is a `Form` configured with a field schema and a target —
expressed in Studio/content, never as a new component.

---

## 3. Naming decisions of record

| Old | Verdict | New |
|-----|---------|-----|
| `ContactForm` | Use-case name (law 01) | `Form` pattern + config |
| inline label markup | Should be a primitive | `Label` (form) — distinct from `SectionLabel` (eyebrow) |
| inline helper/error spans | Should be primitives | `Helper text`, `Error message` |
| per-field wrapper | Should be a primitive | `Field` (a.k.a. FormField / FormGroup — pick one canonical) |
| Netlify POST in component | Behaviour, not identity | `Form action`/`onSubmit` config |

> Reviewer test for any `*Form` PR: *is the domain noun in the name?* If yes, it's an **instance** — express it
> as `Form` + config and close the PR.

---

## 4. Implementation — end to end

**Primitives first (law 02). The `Form` pattern PR cannot merge until its field primitives are codified.**

### Phase 0 — confirm `Input` (SUG-145)
- [ ] Grep `packages/ds/` for an `Input`/`TextField` **primitive** + a `*.stories.*` file. The registry shows a
      `comp-inputs` preview/token surface but **no confirmed story**. If a story exists → flip to In system;
      if only preview/tokens → it's **To codify** and is the **first dependency of this whole epic**.
- [ ] **DECISION (SUG-145): canonical name is `Input`, not `TextField`.** The control also hosts
      email/password/search/number — "text" is a false constraint (a password field isn't text). `type` stays
      config (`<Input type="password">`); never spawn `PasswordField`/`SearchField` clones (use-case naming, one
      layer down). Record the name in the audit.
- [ ] **`Textarea` stays a separate sibling primitive** — do NOT fold multiline into `Input` as a prop the way
      Material/Polaris do; our `Field` composes `Input` and `Textarea` distinctly.

### Phase 1 — codify the field primitives
- [ ] `packages/ds/Label/` — form-field label (`<label htmlFor>`); explicitly **not** `SectionLabel`.
- [ ] `packages/ds/Textarea/` — multiline control.
- [ ] `packages/ds/HelperText/` — guidance caption.
- [ ] `packages/ds/ErrorMessage/` — inline validation, `aria-live`, wired to control `aria-describedby`.
- [ ] `packages/ds/Field/` — composes `Label` + control slot + `HelperText` + `ErrorMessage`; owns the a11y wiring.
- [ ] Stories + registry rows for each. Tokens only.

### Phase 2 — build the `Form` pattern
- [ ] `web/components/Form.jsx` (`Patterns/Form`) — renders `Field[]` from a schema; handles submit/validation/state.
- [ ] Submit target is config: `action` / `onSubmit` (Netlify adapter lives behind it, not in the name).
- [ ] Story `Patterns/Form` with a couple of field-schema fixtures.

### Phase 3 — migrate `ContactForm`
- [ ] Replace `ContactForm` usages with `Form` + a `contact` field schema + Netlify action.
- [ ] The "contact" config lives in content/Studio (or a tiny `contactFormFields` constant), not a component.
- [ ] **Deprecate** `web/components/ContactForm.jsx` (one minor with a warning, then delete).

### Phase 4 — close out
- [ ] Registry rows for `Input`(if new), `Label`, `Textarea`, `HelperText`, `ErrorMessage`, `Field`, `Form`.
- [ ] Audit flips: those primitives → **In system**; `Form` row → **In system** (`Form`); `ContactForm` retired.
- [ ] Grep for other `*Form` clones; fold each into `Form` + config.

---

## 5. Definition of done

1. No component name contains a form's use-case (`Contact*`, `Newsletter*`, …).
2. `Form` renders only structure + submission; each `Field` composes `Label` + control + `HelperText`/`ErrorMessage`.
3. Every field primitive has a primitive + Storybook story + registry row.
4. `ContactForm` is deleted; "contact form" is a `Form` configured with content.
5. a11y: every control has an associated `Label`; errors announced via `aria-live` and linked by `aria-describedby`.

> One line for the review thread: *a form is a `Form`; "contact" is configuration. Charter, laws 01 + 02.*
