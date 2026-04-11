import {defineType, defineField} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

/**
 * Series — Multi-part article grouping
 *
 * Groups related articles into an ordered series. Articles reference
 * this doc type via their `series` field and specify their `partNumber`.
 *
 * SUG-55: Structured Content Near-Term
 */
export default defineType({
  name: 'series',
  title: 'Article Series',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Series Title',
      type: 'string',
      description: 'Name of the series (e.g. "Building a Design System from Scratch")',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of what this series covers.',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Series',
        subtitle: 'Series',
      }
    },
  },
})
