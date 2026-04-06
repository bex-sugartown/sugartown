# SUG-47 — Storybook/Studio Props Alignment Audit

**Linear Issue:** SUG-47
**Status:** Backlog
**Depends on:** SUG-45 (argTypes must exist before they can be audited)

---

## Context

SUG-45 added explicit `argTypes` to all Storybook stories, but enum values (`status`, `evolution`, `conversationType`, `backgroundStyle`, etc.) were derived from component TypeScript types — not cross-checked against the Sanity Studio schema. If Studio adds or renames an option, Storybook controls won't reflect it.

## Objective

Cross-check every Storybook select/enum `argType` against its corresponding Sanity schema field. Studio is the source of truth. Update Storybook to match.

## Scope

| Storybook Prop | Schema Source |
|---|---|
| `Card.status` | `schemas/documents/project.ts` → `status` field |
| `Card.evolution` / `MetadataCard.status` | `schemas/documents/node.ts` → `status` field |
| `MetadataCard.conversationType` | `schemas/documents/node.ts` → `conversationType` field |
| `Callout.variant` | `schemas/objects/calloutSection.ts` → `variant` field |
| `Hero.backgroundStyle` | `schemas/objects/heroSection.ts` → `backgroundStyle` field |
| `Preheader.backgroundColor` | `schemas/documents/siteSettings.ts` → `preheader.backgroundColor` |
| `ContentCard` docType map | Active doc types with slugs in `routes.js` |

## Deliverables

1. Audit table (prop → Storybook options → Studio options → delta)
2. Update argTypes where drift is found
3. Add schema source comments to each story file

## Non-Goals

- No new stories, components, or schema changes

---

*Created 2026-04-06. Depends on SUG-45.*
