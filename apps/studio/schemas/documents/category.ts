import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'

/**
 * Category Document
 *
 * Hierarchical topic categorization with color coding for knowledge graph visualization
 * Supports parent-child relationships for nested category structures
 */
export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'The display name for this category',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('Category name is required and must be under 60 characters')
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
          .custom(async (value, context) => {
            if (!value?.current) return true
            const {document, getClient} = context
            const client = getClient({apiVersion: '2024-01-01'})
            const id = document._id.replace(/^drafts\./, '')
            const existing = await client.fetch(
              `*[_type == "category" && slug.current == $slug && !(_id in [$id, $draftId])][0]`,
              {slug: value.current, id, draftId: `drafts.${id}`}
            )
            return existing ? `The slug "${value.current}" is already used by another category` : true
          })
          .error('Slug is required. Click "Generate" to create from name.')
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of what this category covers',
      rows: 3,
      validation: (Rule) => Rule.max(200)
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Optional: nest this category under another category',
      options: {
        filter: ({document}) => {
          // Prevent selecting self as parent
          return {
            filter: '_id != $id',
            params: {id: document._id}
          }
        }
      }
    }),
    defineField({
      name: 'colorHex',
      title: 'Color (Hex)',
      type: 'string',
      description: 'Hex color used for knowledge graph visualization and archive filter chips (e.g., #FF69B4).',
      initialValue: '#FF69B4', // Sugartown Pink
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{6})$/, {
          name: 'hex color',
          invert: false,
        }).warning('Use a 6-digit hex color like #FF69B4.')
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      colorHex: 'colorHex',
      parentName: 'parent.name'
    },
    prepare({title, subtitle, colorHex, parentName}) {
      const color = colorHex || '#FF69B4'
      return {
        title: title || 'Untitled Category',
        subtitle: parentName ? `↳ ${parentName} • ${color}` : `${subtitle || ''} • ${color}`
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
