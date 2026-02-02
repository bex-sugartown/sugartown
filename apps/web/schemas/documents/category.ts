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
      name: 'color',
      title: 'Color',
      type: 'color',
      description: 'Color for knowledge graph visualization',
      initialValue: {
        hex: '#FF69B4' // Sugartown Pink
      },
      validation: (Rule) => Rule.required().error('Color is required for visualization')
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      color: 'color.hex',
      parentName: 'parent.name'
    },
    prepare({title, subtitle, color, parentName}) {
      return {
        title: title || 'Untitled Category',
        subtitle: parentName ? `↳ ${parentName}` : subtitle,
        media: () => (
          // Simple color swatch preview
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: color || '#FF69B4'
            }}
          />
        )
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
