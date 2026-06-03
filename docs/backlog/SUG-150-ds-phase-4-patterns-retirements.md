**Linear Issue:** [SUG-150](https://linear.app/sugartown/issue/SUG-150/ds-phase-4-patterns-retirements-statcard-form-contactform)

## EPIC SUG-150: DS Phase 4 — Patterns & retirements

**Replaces:** SUG-144 Phases 2–3 + SUG-145 Phases 2–3 + SUG-146 Phase 3 + SUG-143
**Depends on:** SUG-149 (Card re-codified; layout primitives shipped; Storybook re-bucketed)
**Unblocks:** SUG-151 (schema migration + final close-out)

Compose the patterns from codified primitives and retire the charter offenders. All workstreams gate on SUG-149.

---

## Model & Mode

Use `opusplan` for the pre-execution gate. Sonnet executes.

---

## Pre-Execution Completeness Gate

- [ ] SUG-149 Done — Card, Container, Page, Stack, Columns, Surface, AppShell all shipped
- [ ] SUG-148 Done — Metric, Meter, Skeleton, DescriptionList, Avatar, Input, Label, Textarea, HelperText, ErrorMessage, Field all shipped
- [ ] Storybook re-bucket from SUG-149 confirmed — `Regions/` and `Patterns/` groups exist
- [ ] `ContactForm` call-site count confirmed: `grep -r "ContactForm" apps/web/src/`
- [ ] `TwoColumnLayout` call-site count confirmed: `grep -r "TwoColumnLayout" apps/web/src/`
- [ ] `MetadataCard` container CSS audit: `grep "display:\|padding:\|margin:\|border-radius:" apps/web/src/components/MetadataCard*`
- [ ] Reuse audit for StatCard, Form: grep all 5 layers before writing

---

## Workstream A — Card patterns (from SUG-144 Phases 2–3)

### StatCard
- `StatCard` = `Card( Metric + Meter )` — the replacement for the old Tile stat display
- Lives in `apps/web/src/components/StatCard.jsx`
- Points `statTileSection` renderer in `PageSections.jsx` at `StatCard`
- Loading state = `Card( Skeleton )`
- Story: `Patterns/StatCard` — default, loading state, with trend

### MetadataCard recomposition
- `MetadataCard` → `Card( DescriptionList + Chip )` — delete its private container markup
- After recomposition, `MetadataCard.jsx` must contain zero `display: flex/grid`, zero padding/margin declarations of its own — it composes Card
- Smoke test: every taxonomy detail page and article detail page renders MetadataCard correctly after recomposition

### ContentCard assertion
- Audit `ContentCard.jsx` for any UI it owns beyond data binding
- Any container/box CSS must move to Card slots
- After audit, ContentCard must be: `query data → Card( Media + Chip + heading + excerpt )` with no container CSS of its own

### ListView / listing card
- `CardGrid` with `Card variant="listing"` — remove any bespoke list-card component if one exists
- Grep for standalone listing card components: `grep -r "ListView\|ListCard\|list-card" apps/web/src/`

---

## Workstream B — Form pattern + ContactForm retirement (from SUG-145 Phases 2–3)

### Form pattern
- `apps/web/src/components/Form.jsx`
- Renders `Field[]` from a schema; handles submit/validation/state
- Submit target is config: `action` prop (Netlify adapter) or `onSubmit` callback — never in the component name
- Story: `Patterns/Form` with two field-schema fixtures (contact fields; single email field)

### ContactForm migration
- Replace all `ContactForm` usages with `Form` + contact field schema + Netlify action
- "contact" config in a `contactFormFields` constant (or Studio content) — not a component
- Add `console.warn` to `ContactForm.jsx`: "ContactForm is deprecated — use Form + contactFormFields. See SUG-150."
- **Do NOT delete yet** — deletion in SUG-151

### Other `*Form` clone audit
- `grep -r "Form\b" apps/web/src/components/ --include="*.jsx" | grep -v "^.*Form\.jsx\|ContactForm\|node_modules"` — find any other use-case-named form clones
- Fold each into `Form` + config

---

## Workstream C — Region recomposition (from SUG-146 Phase 3)

Refactor each Region to compose layout primitives instead of hand-rolling CSS. The drift catalogue from SUG-147 identifies the specific CSS to replace in each file.

- `Header.jsx` — replace bespoke layout CSS with `Page`/`Stack`/`Container` composition
- `Footer.jsx` — same
- `Hero.jsx` — same
- `Preheader.jsx` — same
- `MobileNav.jsx` — same
- `TwoColumnLayout.jsx` — add `console.warn`: "TwoColumnLayout is deprecated — use Columns count={2}. See SUG-150." Replace all usages with `<Columns count={2}>` (or `DetailLayout` if reading-rail semantics needed)
- Delete duplicated layout CSS from each region as it migrates

---

## Workstream D — Archive Layout Storybook stories (from SUG-143)

Write Storybook `LAYOUTS` stories documenting all archive page layout variants. Gated on Workstream C (re-bucket must be complete — stories live under `Patterns/` or `Regions/`).

- Audit all archive page layout variants: grid view, list view, FilterBar + toolbar, graph bar, per-type list rows
- One story per approved layout variant under `Patterns/ArchiveLayout` (or `Patterns/Layouts`)
- Stories are documentation/spec surfaces — they use realistic mock data, not empty fixtures
- These stories inform the glossary/terms layout scoping (original SUG-143 intent)

---

## Files to Modify

**Web patterns (create/modify)**
- `apps/web/src/components/StatCard.jsx` — CREATE
- `apps/web/src/components/MetadataCard.jsx` — MODIFY (recompose onto Card + DescriptionList)
- `apps/web/src/components/ContentCard.jsx` — MODIFY (assert binding-only)
- `apps/web/src/components/Form.jsx` — CREATE
- `apps/web/src/components/ContactForm.jsx` — MODIFY (add deprecation warning)
- `apps/web/src/components/TwoColumnLayout.jsx` — MODIFY (add deprecation warning; replace usages)
- `apps/web/src/components/PageSections.jsx` — UPDATE (StatCard wiring; ContactForm → Form)
- Region components (Header, Footer, Hero, Preheader, MobileNav) — MODIFY (recompose CSS)

**Storybook**
- `apps/storybook/src/stories/StatCard.stories.jsx` — CREATE
- `apps/storybook/src/stories/Form.stories.jsx` — CREATE
- Archive layout stories — CREATE (one per variant under `Patterns/`)

**Docs**
- `docs/conventions/component-registry.md` — add StatCard, Form rows; update MetadataCard, ContentCard

---

## Acceptance Criteria

- [ ] `StatCard` renders as `Card( Metric + Meter )`; loading state uses `Card( Skeleton )`
- [ ] `MetadataCard` contains zero container/box CSS — grep confirms no `display:`, `padding:`, `margin:` of its own
- [ ] `ContentCard` contains zero container CSS — binding-only confirmed
- [ ] `Form` renders only structure + submission; no domain content
- [ ] `ContactForm` import produces `console.warn`; all call sites use `Form` + `contactFormFields`
- [ ] `TwoColumnLayout` import produces `console.warn`; all call sites use `<Columns count={2}>`
- [ ] No Region hand-rolls flex/grid/max-width/elevation — verified by grepping the files post-recomposition
- [ ] Archive Layout stories present under `Patterns/`; render without console errors
- [ ] `pnpm validate:tokens --strict-colors` zero violations

---

## Visual QA Gate

Agent prepares: screenshots of StatCard, Form (all field states), MetadataCard (spot check on 2 real pages), Archive Layout stories; token compliance grep; smoke test of every taxonomy/article detail route after MetadataCard recomposition.

Human gate: "Visual QA approved" before close-out.

---

## Post-Epic Close-Out

1. Visual QA gate
2. Chromatic VRT
3. Audit flips: StatCard/Form → `present`; ContactForm/TwoColumnLayout → deprecated (not yet retired — that's SUG-151)
4. Move `docs/backlog/SUG-150-ds-phase-4-patterns-retirements.md` → `docs/shipped/`
5. `/mini-release SUG-150`
6. Transition SUG-150 to Done in Linear
