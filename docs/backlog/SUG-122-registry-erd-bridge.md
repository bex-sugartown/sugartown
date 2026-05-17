---
**Epic:** SUG-122 — Registry ↔ ERD bridge
**Linear Issue:** [SUG-122](https://linear.app/sugartown/issue/SUG-122/registry-erd-bridge-link-component-registry-rows-to-schema-erd-cards)
**Status:** Backlog
**Priority:** 🟡 Medium
**Merge strategy:** (a) Merge-as-you-go
**Depends on:** SUG-114 (dynamic ERD pipeline — shipped v0.23.36)
---

# SUG-122 — Registry ↔ ERD bridge

Close the loop between the component registry (`/platform/design-system/registry`) and the schema ERD (`/platform/cms`). These are two views of the same system — a Button in the registry and `ctaButton` in the ERD are the same atom — but they have no live connection. This epic wires them together so the platform section reads as a coherent ecosystem rather than two isolated inventories.

## Background

The registry already has a "Studio schema object" column (`component-registry.md`) — today it's a plain text label like `ctaButton (object) + ctaButtonDoc (document)`. The ERD shows `ctaButton` as a node with fields and relationships but has no awareness that a Button component renders it.

The gap: a developer looking at the registry knows `Button → ctaButton`, but has to manually navigate to the ERD. A developer looking at the ERD knows `ctaButton` has a `linkItem` sub-reference, but can't see what UI surface consumes it. The full ecosystem — DS primitive → web adapter → Storybook → schema object → ERD card — is only complete when these two surfaces cross-link.

Also in scope: four ERD cards (`logo`, `media`, `navigationItem`, `socialLink`) currently appear empty because those schema files use plain `{ name, type }` object syntax instead of `defineField()`. The generator regex only matches `defineField({` so their fields are invisible. A mechanical fix to add `defineField` wrappers will populate those cards.

## Scope

### Phase 1 — Fix empty ERD cards (mechanical, no logic change)

- [ ] Update `logo.ts`, `media.ts`, `navigationItem.ts`, `socialLink.ts` to wrap all fields with `defineField()` — layer: studio schema
- [ ] Run `npx sanity schema deploy` after — layer: studio
- [ ] Rebuild manifest and verify all four cards show fields in the ERD — layer: tooling

### Phase 2 — ERD URL param: auto-select node on load

- [ ] `SchemaERD.jsx` reads `?type=<typeName>` from the URL on mount and opens the corresponding detail panel — layer: web component
- [ ] If the type doesn't exist in the manifest, param is silently ignored — layer: web component
- [ ] URL param is set when a node is selected (so the URL is shareable/bookmarkable) — layer: web component

### Phase 3 — Registry → ERD links

- [ ] `registryParser.js` or `DesignSystemRegistryPage.jsx` recognises schema object cell values and renders them as links to `/platform/cms?type=<typeName>#schema-erd` — layer: web page
- [ ] Pairs (`ctaButton + ctaButtonDoc`) produce two links — layer: web page
- [ ] `component-registry.md` format stays unchanged (plain text); the parser does the linking — layer: web page

### Phase 4 — ERD → Registry "Rendered by" chip

- [ ] Define a static mapping in `SchemaERD.jsx` (or a co-located config file): `{ ctaButton: 'Button', tableBlock: 'Table', accordionSection: 'Accordion', calloutSection: 'Callout', linkItem: 'Button (via ctaButton)', ... }` — layer: web component
- [ ] Detail panel shows a "Rendered by" chip (using the existing `Chip` DS primitive) linking to `/platform/design-system/registry#<ComponentName>` when a mapping exists — layer: web component
- [ ] No chip if no mapping — silence is better than a broken link — layer: web component

## Schema object → component mapping (seed list)

| Schema object | Rendered by | Notes |
|---|---|---|
| `ctaButton` | Button | Primary pairing |
| `ctaButtonDoc` | Button | Document form of ctaButton |
| `linkItem` | Button (via ctaButton) | Sub-object |
| `tableBlock` | Table | |
| `accordionSection` | Accordion | |
| `calloutSection` | Callout | |
| `heroSection` | — | No single DS primitive; composite |
| `cardBuilderSection` | CardBuilderSection | App composite |
| `citationRef` | Citation | PT mark |
| `richImage` | Media | |

## Acceptance criteria

- [ ] `logo`, `media`, `navigationItem`, `socialLink` cards in the ERD show their fields
- [ ] `/platform/cms?type=ctaButton#schema-erd` opens the ERD with `ctaButton` selected in the detail panel
- [ ] Selecting a node in the ERD updates the URL with `?type=<name>` (shareable link)
- [ ] Registry table: schema object cells for `ctaButton`, `tableBlock`, `accordionSection`, `calloutSection` render as links that navigate to the ERD and auto-select the node
- [ ] ERD detail panel for `ctaButton` shows a "Rendered by: Button" chip linking back to the registry
- [ ] ERD detail panel for `linkItem` shows "Rendered by: Button (via ctaButton)"
- [ ] No broken chips: types with no component mapping show no chip

## Technical notes

- URL param approach for ERD selection is the simplest cross-component communication path — avoids prop drilling or global state
- The static registry→ERD mapping lives in `SchemaERD.jsx` or a co-located `erdMappings.js` — it is not auto-generated. The mapping is sparse by design (only schema objects with a UI rendering component appear); infra types like `redirect`, `siteSettings`, `navigation` have no "Rendered by" and should not appear
- `registryParser.js` currently parses the MD table into rows — extend it to detect the "Studio schema object" column and return structured schema object refs rather than raw strings
- The `?type=` param approach also enables future deep-links from other platform surfaces (e.g. the Sanity section module showcase linking to its schema objects)
- Phase 1 (defineField fix) can ship independently as a standalone commit — it has no UI dependency

## Non-goals

- No runtime Sanity API call to fetch the schema — the ERD stays build-time generated (SUG-114's pipeline)
- No auto-generation of the schema→component mapping — the mapping is hand-maintained and sparse by design
- No changes to `component-registry.md` format — the parser layer absorbs the linking logic

## Related

- [SUG-114](https://linear.app/sugartown/issue/SUG-114) — Dynamic schema ERD (shipped — pipeline this epic depends on)
- [SUG-103](https://linear.app/sugartown/issue/SUG-103) — Component registry page (shipped — surface this epic extends)
- `apps/web/src/components/SchemaERD/SchemaERD.jsx`
- `apps/web/src/pages/platform/DesignSystemRegistryPage.jsx`
- `apps/web/src/lib/registryParser.js`
- `docs/conventions/component-registry.md`
