import {defineType, defineField} from 'sanity'
import {SearchIcon} from '@sanity/icons'

/**
 * SEO Metadata Object (Embedded)
 *
 * Reusable SEO object type that can be embedded in any document.
 * NOT a standalone document — it gets embedded in pages, posts, archive pages, etc.
 *
 * Inheritance Pattern:
 * Slug is the unique identifier. If SEO fields are empty, the frontend should
 * fall back to siteSettings defaults.
 *
 * Frontend usage example:
 *   const seoTitle = page.seo?.title || `${page.title} | ${siteSettings.defaultMetaTitle}`
 *   const seoDescription = page.seo?.description || siteSettings.defaultMetaDescription
 *   const ogImage = page.seo?.openGraph?.image || siteSettings.defaultOgImage
 *
 * GROQ with coalesce for fallback logic:
 *   *[_type == "page" && slug.current == $slug][0] {
 *     ...,
 *     "seo": {
 *       "title": coalesce(seo.title, title),
 *       "description": coalesce(seo.description, ""),
 *       "ogTitle": coalesce(seo.openGraph.title, seo.title, title),
 *       "ogDescription": coalesce(seo.openGraph.description, seo.description, ""),
 *       "ogImage": coalesce(seo.openGraph.image, seo.openGraph.image),
 *       "ogType": coalesce(seo.openGraph.type, "website"),
 *       "noIndex": seo.noIndex == true,
 *       "noFollow": seo.noFollow == true,
 *       "canonicalUrl": seo.canonicalUrl
 *     }
 *   }
 */
export default defineType({
  name: 'seoMetadata',
  title: 'SEO Metadata',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Meta Title',
      type: 'string',
      description: 'Leave empty to use site default + page title',
      validation: (Rule) =>
        Rule.max(60)
          .warning('Meta titles should be under 60 characters for best SEO')
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Leave empty to use site default description',
      validation: (Rule) =>
        Rule.max(160)
          .warning('Meta descriptions should be under 160 characters for best SEO')
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'Optional. Overrides auto-generated canonical URL',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https']
        })
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      description: 'Prevent search engines from indexing this page',
      initialValue: false
    }),
    defineField({
      name: 'noFollow',
      title: 'No Follow',
      type: 'boolean',
      description: 'Prevent search engines from following links on this page',
      initialValue: false
    }),
    defineField({
      name: 'openGraph',
      title: 'Open Graph / Social Sharing',
      type: 'object',
      description: 'Social media preview settings. Leave empty to inherit from SEO fields above.',
      fields: [
        defineField({
          name: 'title',
          title: 'OG Title',
          type: 'string',
          description: 'Leave empty to inherit from SEO title',
          validation: (Rule) =>
            Rule.max(60)
              .warning('OG titles should be under 60 characters')
        }),
        defineField({
          name: 'description',
          title: 'OG Description',
          type: 'text',
          rows: 2,
          description: 'Leave empty to inherit from SEO description',
          validation: (Rule) =>
            Rule.max(160)
              .warning('OG descriptions should be under 160 characters')
        }),
        defineField({
          name: 'image',
          title: 'Share Image',
          type: 'image',
          description: 'Social share image (1200x630px recommended)',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility'
            })
          ]
        }),
        defineField({
          name: 'type',
          title: 'OG Type',
          type: 'string',
          options: {
            list: [
              {title: 'Website', value: 'website'},
              {title: 'Article', value: 'article'},
              {title: 'Profile', value: 'profile'}
            ],
            layout: 'radio'
          },
          initialValue: 'website'
        })
      ]
    })
  ]
})
