**Linear Issue:** SUG-82
**Phase strategy:** merge-as-you-go (each structural surface ships independently)

# SUG-82 — Ledger Tradition Phase 2: Structural DS Component Updates

## Scope

Structural component and layout changes deferred from SUG-78 Ledger Tradition Phase 1. WCAG audit and Callout rewrite shipped in SUG-80.

This epic covers changes that require new primitives or significant component restructuring:

- **Card layout restructure** — converge Card to Ledger Tradition grid/rule pattern where appropriate (rule-pair separators, reduced radius, tighter density)
- **MetadataCard ruled rows** — replace current MetadataCard field layout with ruled-row pattern (horizontal rule separators, label-value grid)
- **Archive density posture** — review and tighten archive page layouts for Ledger Tradition rhythm
- **New primitives** — any new DS primitives identified during the above (e.g. RuledRow, LabelValue)

## Blocked by

SUG-80 (ships first — contrast fixes + Callout rewrite).

## Phase 0 gate

An HTML mock covering all structural surfaces must be approved before any JSX/CSS changes. Mock to be authored at epic start. No implementation without sign-off.

## Phase checklist

- [ ] Phase 0: HTML mock authored and approved
- [ ] MetadataCard ruled-row layout
- [ ] Card Ledger Tradition update
- [ ] Archive density review
- [ ] New primitives (if any)
- [ ] Storybook stories updated
- [ ] Chromatic VRT snapshot
- [ ] Mini-release + ship doc + Linear Done
