import {defineType, defineField, defineArrayMember} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'
import {compactPortableText} from '../objects/portableTextConfig'

/**
 * accordionSection — section builder block for collapsible FAQ / detail panels.
 *
 * Renders via the DS Accordion component. Each item has a title (trigger)
 * and body (compactPortableText — bold, italic, code, links, citations,
 * bullet/numbered lists. No headings, images, code blocks, tables, or
 * blockquotes — hierarchy inside accordion panels is an anti-pattern).
 *
 * SUG-44: Accordion Component
 * SUG-61: Upgraded from summaryPortableText to compactPortableText
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
      description: 'Optional heading displayed above the accordion. (max. 120 characters)',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'semantic',
      title: 'Semantic Role',
      type: 'string',
      description: 'Optional. Set to "FAQ" to emit FAQPage structured data (JSON-LD) from this accordion\'s items. Use when the accordion\'s questions and answers represent the canonical FAQ for this page.',
      options: {
        list: [{title: 'FAQ (drives FAQPage JSON-LD)', value: 'faq'}],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'multi',
      title: 'Allow Multiple Open',
      type: 'boolean',
      description: 'When enabled, multiple items can be expanded at once.',
      initialValue: false,
    }),
    defineField({
      name: 'numbered',
      title: 'Numbered (Q-format)',
      type: 'boolean',
      description: 'When enabled, renders Q.NN prefix numbers, Cormorant question text, and hairline dividers.',
      initialValue: false,
    }),
    defineField({
      name: 'numberPrefix',
      title: 'Number Prefix',
      type: 'string',
      description: 'Prefix for numbered items, e.g. "Q" → Q.01. Only used when Numbered is enabled. (max. 4 characters)',
      initialValue: 'Q',
      validation: (Rule) => Rule.max(4),
      hidden: ({parent}) => !parent?.numbered,
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
              description: '(max. 200 characters)',
              validation: (Rule) => Rule.required().max(200),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: compactPortableText,
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
