import {defineType, defineField, defineArrayMember} from 'sanity'
import {HomeIcon} from '@sanity/icons'

/**
 * Homepage Document (Singleton)
 *
 * Main landing page content including hero content, callout, and editorial cards
 * Only one instance of this document should exist
 */
export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  // Singleton configuration - only allow one document
  __experimental_singleton: true,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main headline for the homepage hero',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Title is required and must be under 100 characters')
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      description: 'Supporting text beneath the title',
      validation: (Rule) =>
        Rule.max(200)
          .warning('Subtitle should be under 200 characters')
    }),
    defineField({
      name: 'callout',
      title: 'Callout',
      type: 'object',
      description: 'Optional featured callout section',
      fields: [
        defineField({
          name: 'text',
          title: 'Callout Text',
          type: 'text',
          rows: 2,
          description: 'Featured message or announcement',
          validation: (Rule) => Rule.max(200)
        }),
        defineField({
          name: 'link',
          title: 'Callout Link',
          type: 'link',
          description: 'Optional link for the callout'
        }),
        defineField({
          name: 'style',
          title: 'Callout Style',
          type: 'string',
          options: {
            list: [
              {title: 'Pink', value: 'pink'},
              {title: 'Seafoam', value: 'seafoam'},
              {title: 'Dark', value: 'dark'},
              {title: 'Light', value: 'light'}
            ],
            layout: 'radio'
          },
          initialValue: 'pink'
        })
      ]
    }),
    defineField({
      name: 'cards',
      title: 'Homepage Cards',
      type: 'array',
      description: 'Featured editorial cards (0-6 cards)',
      of: [
        defineArrayMember({
          type: 'editorialCard'
        })
      ],
      validation: (Rule) =>
        Rule.max(6)
          .warning('Homepage layout is optimized for 6 or fewer cards')
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      description: 'Override default SEO for homepage',
      options: {
        collapsible: true,
        collapsed: true
      },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Override the default meta title',
          validation: (Rule) =>
            Rule.max(60)
              .warning('Meta titles should be under 60 characters')
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: 'Override the default meta description',
          validation: (Rule) =>
            Rule.max(160)
              .warning('Meta descriptions should be under 160 characters')
        }),
        defineField({
          name: 'ogImage',
          title: 'Social Share Image',
          type: 'image',
          description: 'Override the default social share image',
          options: {
            hotspot: true
          }
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}) {
      return {
        title: title || 'Homepage',
        subtitle: 'Landing Page Configuration'
      }
    }
  }
})
