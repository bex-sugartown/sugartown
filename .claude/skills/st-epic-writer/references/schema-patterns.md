# Schema Patterns Reference — Epic Writer

---

## Schema File Locations

| Type | Location |
|------|----------|
| Section schemas | `apps/studio/schemas/sections/[name].ts` |
| Document schemas | `apps/studio/schemas/documents/[name].ts` |
| Object schemas | `apps/studio/schemas/objects/[name].ts` |
| Registration | `apps/studio/schemas/index.ts` |

---

## Field Type Reference

Always declare types explicitly. Sanity does not infer types.

| Sanity type | When to use |
|-------------|-------------|
| `string` | Short text, single line |
| `text` | Multi-line plain text |
| `array` of `block` | Rich text (Portable Text) |
| `boolean` | True/false toggles |
| `number` | Numeric values |
| `slug` | URL-safe identifiers |
| `image` | Sanity image asset reference |
| `reference` | Reference to another document |
| `array` of `reference` | Multiple references |
| `array` of `object` | Inline structured content |
| `object` | Nested structured fields |

---

## Section Schema Pattern

```typescript
import { defineType, defineField } from 'sanity'

export const mySection = defineType({
  name: 'mySection',
  type: 'object',
  title: 'My Section',
  fields: [
    defineField({
      name: 'fieldName',
      type: 'string',         // explicit type always
      title: 'Field Label',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'fieldName' },
    prepare({ title }) {
      return { title: title || 'My Section' }
    },
  },
})
```

---

## Registration Pattern (index.ts)

```typescript
import { mySection } from './sections/mySection'

export const schemaTypes = [
  // ... existing types
  mySection,
]
```

---

## Document Wiring (sections[])

```typescript
defineField({
  name: 'sections',
  type: 'array',
  of: [
    // ... existing types
    defineArrayMember({ type: 'mySection' }),
  ],
})
```

Add to every in-scope doc type from the doc type coverage audit.

---

## Enum Field Pattern

```typescript
defineField({
  name: 'status',
  type: 'string',
  options: {
    list: [
      { title: 'Active', value: 'active' },
      { title: 'Archived', value: 'archived' },
      { title: 'Draft', value: 'draft' },
    ],
  },
})
```

**Critical:** copy `value` strings verbatim into the epic's Schema Enum Audit table.
The display label map in the frontend must use the exact stored values.

---

## TypeScript Check After Schema Changes

```bash
cd apps/studio && npx tsc --noEmit
```

Zero NEW errors is the acceptance criterion. Pre-existing errors are exempt but must be
documented in the epic.
