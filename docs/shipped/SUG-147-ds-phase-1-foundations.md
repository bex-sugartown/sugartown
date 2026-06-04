**Linear Issue:** [SUG-147](https://linear.app/sugartown/issue/SUG-147/ds-phase-1-foundations-layout-drift-audit-input-codification-verify)

## EPIC SUG-147: DS Phase 1 — Foundations

**Replaces:** SUG-146 Phase 0 (layout drift audit) + SUG-145 Phase 0 (Input verify)
**Depends on:** nothing
**Unblocks:** SUG-148 (Box needs drift results; leaf primitives need Input status confirmed)

Investigation-only. No new components, no CSS, no stories. Output is two documents and a recorded decision.

---

## Model & Mode

Sonnet is sufficient — this is grep + analysis, no architectural planning needed.

---

## Objective

Produce the two artefacts that gate all subsequent DS phases:

1. **Drift catalogue** — every distinct hand-rolled layout pattern in the codebase, counted and clustered. Determines which `Container size` tokens and `Stack gap` tokens are needed before any primitive is written. Prevents codifying a primitive that just re-bakes existing drift.
2. **Input codification status** — binary answer: does `Input` have a Storybook story or not? If yes, flip audit row to `present` and proceed. If no, `Input` is the first deliverable of SUG-148.

---

## Scope

### Task 1 — Layout drift audit

- [ ] Run: `grep -rn "display: flex" apps/web/src/ packages/design-system/src/ --include="*.css" | wc -l` — count flex usages
- [ ] Run: `grep -rn "display: grid" apps/web/src/ packages/design-system/src/ --include="*.css"`
- [ ] Run: `grep -rn "max-width:" apps/web/src/ packages/design-system/src/ --include="*.css"`
- [ ] Run: `grep -rn "760\|960\|1080" apps/web/src/ packages/design-system/src/ --include="*.css"` — hardcoded width values
- [ ] Run: `grep -rn "margin-inline: auto\|margin: 0 auto\|margin: auto" apps/web/src/ packages/design-system/src/ --include="*.css"`
- [ ] Run: `grep -rn "box-shadow\|elevation" apps/web/src/ packages/design-system/src/ --include="*.css"`
- [ ] Cluster the results by concept (flex patterns, column gaps, max-width values, elevation shadows)
- [ ] Output a **drift catalogue** — format:

```
FLEX PATTERNS
  N usages across M files
  Distinct gap values: [list]
  → candidate: Stack with token gap keys [...]

MAX-WIDTH / CONTAINER
  hardcoded 760px: N usages in [files]
  hardcoded 960px: N usages in [files]
  hardcoded 1080px: N usages in [files]
  stray margin-inline: auto: N usages
  → Container size tokens needed: reading=760, detail=1080, archive=960 (confirm counts)

ELEVATION / SURFACE
  distinct box-shadow values: [list]
  → Surface elevation levels needed: [N]
```

- [ ] Save catalogue to `docs/briefs/design-system/audit-26-06-03/drift-catalogue.md`

### Task 2 — Input codification verify

- [ ] Run: `find packages/design-system/src/components -iname "*input*" -o -iname "*textfield*" 2>/dev/null`
- [ ] Run: `find apps/storybook/src/stories -iname "*input*" 2>/dev/null`
- [ ] **If `*.stories.*` file found:** Input is In system. Record: "Input confirmed present — story at [path]". Update audit row for `Text input` → `present` (`Input`). Input is NOT a deliverable in SUG-148.
- [ ] **If no story found:** Input is To codify. Record: "Input not codified — no story found. Input is first deliverable of SUG-148." Input IS a deliverable in SUG-148.
- [ ] Record result in `docs/briefs/design-system/audit-26-06-03/drift-catalogue.md` under an `INPUT STATUS` heading.

---

## Deliverables

1. `docs/briefs/design-system/audit-26-06-03/drift-catalogue.md` — drift catalogue + Input status
2. Confirmation of whether Input needs to be codified in SUG-148

---

## Acceptance Criteria

- [ ] Drift catalogue covers all six grep passes (flex, grid, max-width, hardcoded widths, margin-inline, elevation)
- [ ] Each cluster names candidate tokens — not just counts
- [ ] Input status is binary and backed by a file path (story found) or absence thereof (not found)
- [ ] No components written, no CSS changed, no stories added

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-147-ds-phase-1-foundations.md` → `docs/shipped/`
2. `/mini-release SUG-147`
3. Transition SUG-147 to Done in Linear
4. Begin SUG-148
