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
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short tagline or slogan (e.g., "AI Collaboration Knowledge Base")',
      group: 'general',
      validation: (Rule) => Rule.max(100).warning('Tagline should be under 100 characters')
    }),
    defineField({
      name: 'siteLogo',
      title: 'Site Logo',
      type: 'image',
      description: 'Primary site logo (used in header)',
      group: 'general',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Site favicon (recommended: 32x32 or 64x64 PNG)',
      group: 'general',
      options: {
        accept: 'image/png,image/x-icon,image/svg+xml'
      }
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
      name: 'primaryNav',
      title: 'Primary Navigation',
      type: 'reference',
      to: [{type: 'navigation'}],
      description: 'The main site navigation menu',
      group: 'header'
    }),
    defineField({
      name: 'headerCta',
      title: 'Header CTA Button',
      type: 'reference',
      to: [{type: 'ctaButtonDoc'}],
      description: 'Optional call-to-action button in header (select from existing buttons or create new)',
      group: 'header'
    }),
    defineField({
      name: 'preheader',
      title: 'Preheader',
      type: 'reference',
      to: [{type: 'preheader'}],
      description: 'Optional announcement bar above header (select from existing preheaders or create new)',
      group: 'header'
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
