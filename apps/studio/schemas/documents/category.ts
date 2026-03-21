import {defineType, defineField} from 'sanity'
import {defineIncomingReferenceDecoration} from 'sanity/structure'
import {TagIcon} from '@sanity/icons'
import {createRemoveReferenceAction} from '../../components/RemoveReferenceAction'

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
  renderMembers: (members) => [
    ...members,
    defineIncomingReferenceDecoration({
      name: 'assignedContent',
      title: 'Assigned content',
      types: [{type: 'article'}, {type: 'node'}, {type: 'caseStudy'}],
      actions: [createRemoveReferenceAction('categories')],
    }),
  ],
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
      name: 'colorHex',
      title: 'Brand Color',
      type: 'color',
      description: 'Color for knowledge graph visualization and archive filter chips.',
      options: {
        disableAlpha: true,
        colorList: [
          {title: 'Sugartown Pink',  value: '#FF247D'},
          {title: 'Maroon',          value: '#b91c68'},
          {title: 'Lime',            value: '#D1FF1D'},
          {title: 'Seafoam',         value: '#2BD4AA'},
          {title: 'Midnight',        value: '#0D1226'},
          {title: 'Charcoal',        value: '#1e1e1e'},
          {title: 'Softgrey',        value: '#94A3B8'},
          {title: 'Blue',            value: '#0066CC'},
        ],
      },
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
      const color = colorHex?.hex || '#FF69B4'
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
