import {defineType, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * Rich Image Object
 *
 * Image with comprehensive metadata and accessibility support
 * Includes hotspot/crop, alt text, captions, credits, and optional linking
 */
export default defineType({
  name: 'richImage',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      validation: (Rule) => Rule.required().error('Image is required')
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the image for accessibility and SEO (required)',
      validation: (Rule) =>
        Rule.required()
          .max(125)
          .warning('Alt text should be concise, ideally under 125 characters')
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional visible caption displayed below the image',
      validation: (Rule) => Rule.max(200)
    }),
    defineField({
      name: 'credit',
      title: 'Photo Credit',
      type: 'string',
      description: 'Attribution for the photographer or image source',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'url',
      description: 'Optional: make the image clickable',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
          allowRelative: true
        })
    })
  ],
  preview: {
    select: {
      asset: 'asset',
      alt: 'alt',
      caption: 'caption'
    },
    prepare({asset, alt, caption}) {
      return {
        title: alt || 'Image (missing alt text)',
        subtitle: caption || undefined,
        media: asset
      }
    }
  }
})
