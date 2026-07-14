import {defineType, defineField, defineArrayMember} from 'sanity'
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
      description: 'Name of the series (e.g. "Building a Design System from Scratch", max. 120 characters)',
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
      description: 'Brief description of what this series covers. (max. 300 characters)',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'parts',
      title: 'Parts',
      type: 'array',
      description: 'Add content to this series in part order. Drag to reorder. Part numbers are set on each individual document.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {type: 'article'},
            {type: 'node'},
            {type: 'caseStudy'},
            {type: 'page'},
          ],
        }),
      ],
      validation: (Rule) => Rule.unique(),
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
