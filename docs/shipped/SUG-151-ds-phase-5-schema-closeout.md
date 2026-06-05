**Linear Issue:** [SUG-151](https://linear.app/sugartown/issue/SUG-151/ds-phase-5-schema-migration-registry-audit-close-out)

## EPIC SUG-151: DS Phase 5 — Schema migration, registry & audit close-out

**Replaces:** SUG-144 Phases 4–5 + SUG-145 Phase 4 + SUG-146 Phase 4
**Depends on:** SUG-150 (all patterns shipped; deprecation warnings in place)
**Unblocks:** nothing — this is the final phase

Final close-out across the entire DS refactor sequence. Schema migration, deletion of deprecated components, registry completion, audit flips.

---

## Model & Mode

Sonnet executes. Opus only if migration script architecture is unclear.

---

## Pre-Execution Completeness Gate

- [ ] SUG-150 Done — StatCard, Form, ContactForm deprecated, TwoColumnLayout deprecated, regions recomposed
- [ ] Zero active call-sites for ContactForm: `grep -r "ContactForm" apps/web/src/` returns only the deprecated file itself
- [ ] Zero active call-sites for TwoColumnLayout: `grep -r "TwoColumnLayout" apps/web/src/` returns only the deprecated file itself
- [ ] Zero active call-sites for Tile: `grep -r "import.*Tile\b" apps/web/src/ packages/design-system/src/` returns only the deprecated file
- [ ] Pre-flight GROQ count run: `count(*[_type in ["page","article","caseStudy","node"] && "statTileSection" in sections[]._type])`
- [ ] Registry audit: list every primitive/pattern created in SUG-148/149/150 that still lacks a registry row

---

## Scope

### Task 1 — statTileSection → cardSection schema migration

- [ ] Confirm via GROQ whether `statTileSection` exists in Studio schema and has live documents
- [ ] Create `apps/studio/schemas/sections/cardSection.ts` (rename of statTileSection — or confirm if it should fold into `cardBuilderSection`)
- [ ] Register `cardSection` in `apps/studio/schemas/index.ts`; remove `statTileSection` import
- [ ] Write migration script `scripts/migrate/statTileSection-to-cardSection.js` following `scripts/migrate/lib.js` pattern (dry-run default, `--execute` flag, 5s abort window, idempotent)
- [ ] Run dry-run — confirm count matches pre-flight GROQ count (not zero unless pre-flight confirmed zero)
- [ ] Run `--execute` — confirm clean
- [ ] Re-run dry-run — confirm 0 patches (idempotency)
- [ ] Update `PageSections.jsx` switch: `case 'statTileSection'` → `case 'cardSection'`
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/`
- [ ] Add `migrate:card-section` script to root `package.json`

### Task 2 — Delete deprecated components

All three deprecation-warned components are safe to delete once call-site greps confirm zero active usages (pre-execution gate above).

- [ ] Delete `apps/web/src/components/ContactForm.jsx`
- [ ] Delete `apps/web/src/components/TwoColumnLayout.jsx`
- [ ] Delete `packages/design-system/src/components/Tile/` — or retain as empty re-export with final warning for one more minor, then delete. Decision: if no external consumers, delete now.

### Task 3 — Registry close-out

Add or update rows in `docs/conventions/component-registry.md` for every primitive and pattern created across SUG-148/149/150 that doesn't already have a row:

**New rows to add (verify each exists before adding):**
Box · Metric · Meter · Skeleton · DescriptionList · Avatar · Input (if newly codified) · Label · Textarea · HelperText · ErrorMessage · Field · Container · Page · Stack · Columns · Surface · AppShell · StatCard · Form

**Rows to update:**
Card (re-codified — update health columns)

**Rows to mark deprecated/retired:**
Tile · TwoColumnLayout · ContactForm · Flex (synonym pointer to Stack)

### Task 4 — Audit flips in component-audit.json

Update `pinkMoonStatusKey` for each affected row in `component-audit.json` (the live audit data):

| Component | Old status | New status | Notes |
|-----------|-----------|-----------|-------|
| Metric | codify | present | story: Primitives/Metric |
| Meter | codify | present | story: Primitives/Meter |
| Skeleton | codify | present | story: Primitives/Skeleton |
| DescriptionList | missing | present | story: Primitives/DescriptionList |
| Avatar | codify | present | story: Primitives/Avatar |
| Input / Text input | diverges | present | story: Primitives/Input (if newly codified) |
| Label | codify | present | story: Primitives/Label |
| Textarea | codify | present | story: Primitives/Textarea |
| HelperText | codify | present | story: Primitives/HelperText |
| ErrorMessage | codify | present | story: Primitives/ErrorMessage |
| Field | codify | present | story: Primitives/Field |
| Box | missing | present | story: Primitives/Layout/Box |
| Container | codify | present | story: Primitives/Layout/Container |
| Page | codify | present | story: Primitives/Layout/Page |
| Stack | codify | present | story: Primitives/Layout/Stack |
| Columns | codify | present | story: Primitives/Layout/Columns |
| Surface | codify | present | story: Primitives/Layout/Surface |
| AppShell | missing | present | story: Primitives/Layout/AppShell |
| Card | present (overloaded) | present (re-codified) | update note |
| Tile | diverges | retired | folded into Card; Metric/Meter extracted |
| Form (ContactForm) | diverges | present | story: Patterns/Form |
| ContactForm | diverges | retired | use Form + config |
| TwoColumnLayout | diverges | retired | use Columns count={2} |
| Flex | codify | synonym | pointer to Stack direction prop |

**After flips, re-run the status counts** and report the new In system / Diverges / To codify / Not yet tally. A row may only be marked `present` if a real registry entry + Storybook story exists.

---

## Migration Script Constraints

**Target doc count (run before writing script):**
```groq
count(*[_type in ["page","article","caseStudy","node"] && "statTileSection" in sections[]._type])
```
Expected count: `___` (fill in at execution time)

Skip condition: documents where sections[] contains no statTileSection entries — correctly skipped.
Idempotency: re-running after rename finds zero statTileSection entries → 0 patches.

`nanoid` fallback pattern required if used:
```js
const { nanoid } = await import('nanoid').catch(() => ({
  nanoid: () => Math.random().toString(36).slice(2, 11)
}))
```

---

## Files to Modify

**Studio**
- `apps/studio/schemas/sections/cardSection.ts` — CREATE
- `apps/studio/schemas/sections/statTileSection.ts` — DELETE (after migration)
- `apps/studio/schemas/index.ts` — update import

**Frontend**
- `apps/web/src/components/PageSections.jsx` — update switch case
- `apps/web/src/components/ContactForm.jsx` — DELETE
- `apps/web/src/components/TwoColumnLayout.jsx` — DELETE
- `packages/design-system/src/components/Tile/` — DELETE (or final-warning retain)

**Scripts**
- `scripts/migrate/statTileSection-to-cardSection.js` — CREATE
- `package.json` — add `migrate:card-section` script

**Docs**
- `docs/conventions/component-registry.md` — full close-out
- `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/component-audit.json` — audit flips

---

## Acceptance Criteria

- [ ] statTileSection migration dry-run count matches pre-flight GROQ count
- [ ] Migration `--execute` runs clean; re-run dry-run = 0 patches (idempotent)
- [ ] Schema deployed: `npx sanity schema deploy` confirms success
- [ ] PageSections.jsx switch uses `cardSection` — grep confirms no remaining `statTileSection` reference
- [ ] ContactForm, TwoColumnLayout deleted — grep confirms no remaining imports
- [ ] Tile deleted (or final-warning retained per decision at execution time)
- [ ] Registry has rows for all 20+ new primitives/patterns
- [ ] Audit flips applied; updated status counts reported
- [ ] `pnpm validate:tokens --strict-colors` zero violations
- [ ] `tsc --noEmit` in `apps/studio` zero new errors

---

## Post-Epic Close-Out

1. Visual QA gate — spot check statTileSection-renamed pages in browser
2. Chromatic VRT
3. Move `docs/backlog/SUG-151-ds-phase-5-schema-closeout.md` → `docs/shipped/`
4. `/mini-release SUG-151`
5. Transition SUG-151 to Done in Linear
6. **Full DS refactor sequence complete.** Archive SUG-147/148/149/150/151 shipped docs.
