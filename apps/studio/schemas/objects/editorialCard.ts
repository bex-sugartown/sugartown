import {defineType, defineField} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'

/**
 * Editorial Card Object
 *
 * Reusable card component for homepage and other sections
 * Supports title, description, image, and optional CTA
 */
export default defineType({
  name: 'editorialCard',
  title: 'Editorial Card',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Card headline',
      validation: (Rule) => Rule.required().max(100)
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Brief description or summary',
      validation: (Rule) => Rule.max(250).warning('Keep descriptions concise')
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Card image or icon',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      description: 'Optional link for this card'
    })
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      media: 'image'
    },
    prepare({title, description, media}) {
      return {
        title: title || 'Untitled Card',
        subtitle: description,
        media
      }
    }
  }
})
