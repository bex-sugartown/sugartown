import {defineType, defineField, defineArrayMember} from 'sanity'
import {CogIcon} from '@sanity/icons'

/**
 * Site Settings Document (Singleton)
 *
 * Global site configuration including branding, navigation, and SEO defaults
 * Only one instance of this document should exist
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  // Singleton configuration - only allow one document
  __experimental_singleton: true,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'header', title: 'Header'},
    {name: 'footer', title: 'Footer'},
    {name: 'seo', title: 'SEO Defaults'}
  ],
  fields: [
    // GENERAL GROUP
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The main site name (e.g., "Sugartown")',
      group: 'general',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('Site title is required and must be under 60 characters')
    }),
    defineField({
      name: 'siteLogo',
      title: 'Site Logo',
      type: 'image',
      description: 'Primary site logo (used in header, favicon generation)',
      group: 'general',
      options: {
        hotspot: true
      },
      validation: (Rule) => Rule.required().error('Site logo is required')
    }),
    defineField({
      name: 'brandColors',
      title: 'Brand Colors',
      type: 'object',
      description: 'Primary brand color palette',
      group: 'general',
      fields: [
        defineField({
          name: 'pink',
          title: 'Sugartown Pink',
          type: 'color',
          description: 'Primary brand color',
          initialValue: {hex: '#FF69B4'}
        }),
        defineField({
          name: 'seafoam',
          title: 'Seafoam',
          type: 'color',
          description: 'Secondary brand color',
          initialValue: {hex: '#2BD4AA'}
        })
      ]
    }),

    // HEADER GROUP
    defineField({
      name: 'headerStyle',
      title: 'Header Style',
      type: 'string',
      description: 'Choose your header layout',
      group: 'header',
      options: {
        list: [
          {title: 'Minimal (Logo + Nav)', value: 'minimal'},
          {title: 'Standard (Logo + Nav + CTA)', value: 'standard'},
          {title: 'With Announcement Bar', value: 'announcement'}
        ],
        layout: 'radio'
      },
      initialValue: 'standard'
    }),
    defineField({
      name: 'primaryNav',
      title: 'Primary Navigation',
      type: 'reference',
      to: [{type: 'navigation'}],
      description: 'The main site navigation menu',
      group: 'header',
      validation: (Rule) =>
        Rule.required()
          .error('Primary navigation is required')
    }),
    defineField({
      name: 'headerCta',
      title: 'Header CTA Button',
      type: 'ctaButton',
      description: 'Optional call-to-action button in header',
      group: 'header'
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      description: 'Optional banner above header',
      group: 'header',
      fields: [
        defineField({
          name: 'show',
          title: 'Show Announcement Bar',
          type: 'boolean',
          description: 'Toggle announcement bar visibility',
          initialValue: false
        }),
        defineField({
          name: 'message',
          title: 'Message',
          type: 'string',
          description: 'Announcement text',
          validation: (Rule) => Rule.max(150)
        }),
        defineField({
          name: 'link',
          title: 'Link',
          type: 'link',
          description: 'Optional link for the announcement'
        })
      ]
    }),

    // FOOTER GROUP
    defineField({
      name: 'footerColumns',
      title: 'Footer Navigation Columns',
      type: 'array',
      description: 'Footer menu columns (max 4 for layout)',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'navigation'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(4)
          .warning('Footer layout is optimized for 4 or fewer columns')
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      description: 'Links to social media profiles',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'link'
        })
      ],
      validation: (Rule) =>
        Rule.max(8)
          .warning('Consider limiting to 8 social links for clarity')
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'Footer copyright notice (e.g., "© 2024 Sugartown. All rights reserved.")',
      group: 'footer',
      validation: (Rule) => Rule.max(100)
    }),

    // SEO GROUP
    defineField({
      name: 'defaultMetaTitle',
      title: 'Default Meta Title',
      type: 'string',
      description: 'Fallback title for pages without custom SEO (e.g., "Sugartown - AI Collaboration Knowledge Base")',
      group: 'seo',
      validation: (Rule) =>
        Rule.max(60)
          .warning('Meta titles should be under 60 characters for best SEO')
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default Meta Description',
      type: 'text',
      rows: 2,
      description: 'Fallback description for search results and social sharing',
      group: 'seo',
      validation: (Rule) =>
        Rule.max(160)
          .warning('Meta descriptions should be under 160 characters for best SEO')
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default Social Share Image',
      type: 'image',
      description: 'Fallback image for social media sharing (recommended: 1200x630px)',
      group: 'seo',
      options: {
        hotspot: true
      }
    })
  ],
  preview: {
    select: {
      title: 'siteTitle',
      media: 'siteLogo'
    },
    prepare({title, media}) {
      return {
        title: title || 'Site Settings',
        subtitle: 'Global Configuration',
        media: media
      }
    }
  }
})
