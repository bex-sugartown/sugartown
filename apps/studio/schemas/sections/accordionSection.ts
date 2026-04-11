import {defineType, defineField, defineArrayMember} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'
import {accordionPortableText} from '../objects/portableTextConfig'

/**
 * accordionSection — section builder block for collapsible FAQ / detail panels.
 *
 * Renders via the DS Accordion component. Each item has a title (trigger)
 * and body (accordionPortableText — bold, italic, code, links, citations,
 * bullet/numbered lists. No headings, images, code blocks, tables, or
 * blockquotes — hierarchy inside accordion panels is an anti-pattern).
 *
 * SUG-44: Accordion Component
 * SUG-61: Upgraded from summaryPortableText to accordionPortableText
 */
export default defineType({
  name: 'accordionSection',
  title: 'Accordion Section',
  type: 'object',
  icon: ChevronDownIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading displayed above the accordion.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'multi',
      title: 'Allow Multiple Open',
      type: 'boolean',
      description: 'When enabled, multiple items can be expanded at once.',
      initialValue: false,
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'accordionItem',
          title: 'Accordion Item',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(200),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: accordionPortableText,
              description: 'Supports bold, italic, inline code, links, citations, and lists. No headings, images, or code blocks.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title'},
            prepare({title}) {
              return {title: title || 'Untitled item'}
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      items: 'items',
    },
    prepare({heading, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: heading || 'Accordion',
        subtitle: `Accordion · ${count} item${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
