import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

/**
 * Page Document - Flexible Page Builder
 *
 * Static pages with modular section-based layout
 * Supports hierarchical page structures (parent-child relationships)
 */
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'settings', title: 'Settings'},
    {name: 'seo', title: 'SEO'}
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The main page title',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Title is required and must be under 100 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title)',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from title.')
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      description: 'Build your page with flexible sections',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroSection'}),
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'ctaSection'})
      ]
    }),

    // SETTINGS GROUP
    defineField({
      name: 'template',
      title: 'Page Template',
      type: 'string',
      description: 'Layout template for this page',
      group: 'settings',
      options: {
        list: [
          {title: 'Default (Standard Width)', value: 'default'},
          {title: 'Full Width (Edge to Edge)', value: 'full-width'},
          {title: 'With Sidebar', value: 'sidebar'}
        ],
        layout: 'radio'
      },
      initialValue: 'default'
    }),
    defineField({
      name: 'parent',
      title: 'Parent Page',
      type: 'reference',
      to: [{type: 'page'}],
      description: 'Optional: nest this page under another page',
      group: 'settings',
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

    // SEO GROUP
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      description: 'Search engine optimization overrides',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Override the page title for SEO (defaults to page title)',
          validation: (Rule) =>
            Rule.max(60)
              .warning('Meta titles should be under 60 characters for best SEO')
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: 'Brief description for search results',
          validation: (Rule) =>
            Rule.max(160)
              .warning('Meta descriptions should be under 160 characters for best SEO')
        }),
        defineField({
          name: 'ogImage',
          title: 'Social Share Image',
          type: 'richImage',
          description: 'Image for social media sharing (Open Graph)'
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      parentTitle: 'parent.title',
      template: 'template'
    },
    prepare({title, slug, parentTitle, template}) {
      return {
        title: title || 'Untitled Page',
        subtitle: parentTitle ? `↳ ${parentTitle} / ${slug || ''}` : `/${slug || ''}`,
        description: template ? `Template: ${template}` : undefined
      }
    }
  },
  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    },
    {
      title: 'Title (Z-A)',
      name: 'titleDesc',
      by: [{field: 'title', direction: 'desc'}]
    }
  ]
})
