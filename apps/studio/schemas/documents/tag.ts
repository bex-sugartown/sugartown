import {defineType, defineField} from 'sanity'
import {TagsIcon} from '@sanity/icons'

/**
 * Tag Document
 *
 * Flat tagging system for cross-cutting themes and topics
 * Complements hierarchical categories with flexible, ad-hoc classification
 */
export default defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      type: 'string',
      description: 'The tag label (e.g., "AI Ethics", "TypeScript", "Debugging")',
      validation: (Rule) =>
        Rule.required()
          .max(30)
          .error('Tag name is required and must be under 30 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from name)',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from name.')
    })
  ],
  preview: {
    select: {
      title: 'name'
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Tag',
        subtitle: 'Tag'
      }
    }
  },
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}]
    },
    {
      title: 'Name (Z-A)',
      name: 'nameDesc',
      by: [{field: 'name', direction: 'desc'}]
    }
  ]
})
