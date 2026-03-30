import {defineType, defineField, defineArrayMember} from 'sanity'
import {ThListIcon} from '@sanity/icons'
import TableBlockInput from '../../components/TableBlockInput'

/**
 * tableBlock — Portable Text custom block type for structured tables.
 *
 * Data structure:
 *   tableBlock {
 *     variant: 'default' | 'responsive' | 'wide'
 *     hasHeaderRow: boolean
 *     rows: tableRow[] {
 *       cells: string[]
 *     }
 *   }
 *
 * Cells are plain strings (no rich text) — keeps the schema simple and
 * the renderer straightforward. Rich text cells are a future enhancement.
 *
 * EPIC-0163: Table as PortableText Custom Block Type
 * SUG-34: Custom grid input component with clipboard paste support
 */
export default defineType({
  name: 'tableBlock',
  title: 'Table',
  type: 'object',
  icon: ThListIcon,
  components: {
    input: TableBlockInput,
  },
  fields: [
    defineField({
      name: 'variant',
      title: 'Table Variant',
      type: 'string',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Responsive (card layout on mobile)', value: 'responsive'},
          {title: 'Wide (fixed columns)', value: 'wide'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'hasHeaderRow',
      title: 'First row is header',
      type: 'boolean',
      description: 'When enabled, the first row renders as column headers (th elements).',
      initialValue: true,
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tableRow',
          title: 'Row',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule) => Rule.min(1).error('Each row must have at least one cell.'),
            }),
          ],
          preview: {
            select: {
              cells: 'cells',
            },
            prepare({cells}) {
              const cellValues = cells ?? []
              return {
                title: cellValues.slice(0, 4).join(' | ') || '(empty row)',
                subtitle: `${cellValues.length} cell${cellValues.length === 1 ? '' : 's'}`,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Table must have at least one row.'),
    }),
  ],
  preview: {
    select: {
      rows: 'rows',
      variant: 'variant',
    },
    prepare({rows, variant}) {
      const rowCount = rows?.length ?? 0
      const firstCell = rows?.[0]?.cells?.[0] ?? ''
      return {
        title: `Table${variant && variant !== 'default' ? ` (${variant})` : ''}`,
        subtitle: `${rowCount} row${rowCount === 1 ? '' : 's'}${firstCell ? ` — ${firstCell}` : ''}`,
      }
    },
  },
})
