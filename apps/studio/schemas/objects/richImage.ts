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
      name: 'link',
      title: 'Link',
      type: 'linkItem',
      description: 'Optional: make the image clickable. Supports internal pages (SPA navigation) and external URLs.',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL (deprecated)',
      type: 'url',
      description: 'Deprecated — use the "Link" field above instead. This field is retained for backward compatibility with existing data.',
      hidden: true,
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
          allowRelative: true
        })
    }),
    defineField({
      name: 'overlay',
      title: 'Image Overlay',
      type: 'mediaOverlay',
      description: 'Optional duotone or colour overlay treatment. Not used when image is inside a gallery — use the gallery-level Image Treatment instead.',
    }),
    // AI Ethics compliance (SUG-55): structured AI attribution for images
    defineField({
      name: 'aiGenerated',
      title: 'AI-Generated',
      type: 'boolean',
      description: 'Is this image AI-generated or AI-manipulated?',
      initialValue: false,
    }),
    defineField({
      name: 'aiTool',
      title: 'AI Tool',
      type: 'string',
      description: 'Which AI tool generated this image?',
      hidden: ({parent}) => !parent?.aiGenerated,
      options: {
        list: [
          {title: 'DALL-E', value: 'dall-e'},
          {title: 'Midjourney', value: 'midjourney'},
          {title: 'Stable Diffusion', value: 'stable-diffusion'},
          {title: 'Adobe Firefly', value: 'adobe-firefly'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'dropdown',
      },
    }),
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
