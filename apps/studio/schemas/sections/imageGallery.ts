import {defineType, defineField, defineArrayMember} from 'sanity'
import {ImagesIcon} from '@sanity/icons'

/**
 * Image Gallery Section
 *
 * Display multiple images in various layouts (grid, carousel, masonry)
 * Useful for showcasing project work, photo collections, etc.
 */
export default defineType({
  name: 'imageGallery',
  title: 'Image Gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'The images to display in this gallery',
      of: [
        defineArrayMember({
          type: 'richImage'
        })
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('At least one image is required for a gallery')
    }),
    defineField({
      name: 'layout',
      title: 'Gallery Layout',
      type: 'string',
      description: 'How should the images be displayed?',
      options: {
        list: [
          {title: 'Grid (Equal Height)', value: 'grid'},
          {title: 'Carousel (Slideshow)', value: 'carousel'}
        ],
        layout: 'radio'
      },
      initialValue: 'grid',
      validation: (Rule) => Rule.required().error('Layout selection is required')
    }),
    defineField({
      name: 'treatment',
      title: 'Image Treatment',
      type: 'mediaOverlay',
      description: 'Overlay effect applied to all images in this gallery (duotone, dark scrim, or colour overlay)',
    })
  ],
  preview: {
    select: {
      images: 'images',
      layout: 'layout'
    },
    prepare({images, layout}) {
      const imageCount = images?.length || 0
      const layoutLabels = {
        grid: 'Grid',
        carousel: 'Carousel',
      }

      return {
        title: `Image Gallery (${imageCount} image${imageCount !== 1 ? 's' : ''})`,
        subtitle: `Image Gallery · ${layoutLabels[layout as keyof typeof layoutLabels] || layout}`,
        media: images?.[0]?.asset
      }
    }
  }
})
