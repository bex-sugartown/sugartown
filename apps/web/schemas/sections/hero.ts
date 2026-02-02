import {defineType, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * Hero Section
 *
 * Large header section typically used at the top of pages and case studies
 * Supports heading, subheading, background image, and CTA
 */
export default defineType({
  name: 'hero',
  title: 'Hero Section',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main hero heading (usually large and prominent)',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Heading is required and must be under 100 characters')
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Optional supporting text below the heading',
      validation: (Rule) => Rule.max(200)
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'richImage',
      description: 'Optional background image for the hero section'
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'ctaButton',
      description: 'Optional CTA button in the hero'
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      subheading: 'subheading',
      media: 'backgroundImage.asset'
    },
    prepare({heading, subheading, media}) {
      return {
        title: heading || 'Hero Section',
        subtitle: subheading || 'No subheading',
        media: media
      }
    }
  }
})
