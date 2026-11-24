# Interaction states

**Every interactive design-system component defines the states below, or is listed in `apps/web/scripts/state-allowlist.json` with a reason.** `pnpm --filter web validate:states` checks pressed, focus and disabled on every commit. The rest are checked in the vspec and the rendered probe. Written for the ST-252 post-mortem, 2026-11-24.

## The closed set

| State | Required for | How it is drawn | Checked by |
|---|---|---|---|
| Rest | all | the component's resting look | vspec |
| Hover | links, rows, toggles, fields | pink or text-default edge, underline, or the existing lift | rendered probe |
| Selected or open | toggles, disclosures | solid text-default fill (toggles), pink rule or arrow (disclosures) | rendered probe |
| Pressed | links, rows, toggles, buttons, cards | inset `--st-state-pressed-shade` on a box, a 2px underline on text, an inverted fill on a small marker | `validate:states`, `tests/smoke/interaction-states.spec.ts` |
| Focus-visible | everything focusable | `outline: var(--st-focus-ring)` with `--st-focus-ring-offset` | `validate:states`, smoke spec |
| Disabled | anything with a `disabled` prop | muted, `cursor: not-allowed`, no pointer events | `validate:states` |
| Error | form fields | brand-primary border | vspec |
| Reduced motion | anything that moves | covered by the global rule in `globals.css` (transitions and animations shortened); a lift or scale also sets `transform: none` | vspec |
| Forced colors | anything drawn with a box-shadow | a system-colour border or outline, because forced colours removes box-shadow | open: #262 |
| Touch | anything with a hover effect | hover rules behind `(hover: hover)` | open: #262 |
| Loading | async components | not defined | open: #264 |

## Which states a component type takes

| Type | Hover | Selected or open | Pressed | Focus | Disabled |
|---|---|---|---|---|---|
| Text link | underline | n/a | heavier underline | ring | n/a |
| Row or card link | wash or border | n/a | shade | ring | n/a |
| Toggle or chip | border and glow | solid fill | shade | ring | if it has the prop |
| Disclosure | label underline, arrow | pink arrow or rule | shade | ring | n/a |
| Form field | stronger border | n/a | n/a (mouse-down is focus) | border and ring | yes |
| Overlay label, not a control | edge only | n/a | n/a | ring if focusable | n/a |

## Rules

1. **A new interactive component takes the row for its type.** A state left out needs an entry in `state-allowlist.json` with a reason.
2. **Pressed on text is not a shade.** A shade under text is invisible; use text-default and a heavier underline.
3. **Hover text is never brand-primary on the light canvas.** Pink-500 on the light canvas measures under the 4.5:1 minimum (3.2:1; 3.47:1 on white). In dark it passes (5.13:1 on the canvas), so the rule is for light and for any pink-on-wash pair (List title on lime, 3.42:1). Use text-default or ink and put the pink on an underline or border.
4. **Measure a pair a vspec composes.** `pnpm validate:contrast` checks token pairs only. List the vspec's pairs in `ST-N-slug.contrast.json` beside it and run `pnpm --filter web validate:vspec-contrast`; it measures on the canvas, not the prototype frame, and runs on commit when a sidecar is staged.
5. **Probe the rendered page before drawing the vspec.** `node tests/probes/state-probe.cjs` reports which states change a computed style, in both themes.
