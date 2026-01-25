import {defineType, defineField, defineArrayMember} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * Hero Section
 *
 * Large header section typically used at the top of pages and case studies
 * Supports heading, subheading, background image, and CTAs (0-2)
 */
export default defineType({
  name: 'heroSection',
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
      type: 'image',
      description: 'Optional background image for the hero section',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO'
        })
      ]
    }),
    defineField({
      name: 'ctas',
      title: 'Call to Action Buttons',
      type: 'array',
      description: 'Add 0-2 CTA buttons. First = primary, second = secondary.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'ctaButtonDoc'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(2).warning('Hero sections work best with 2 or fewer CTAs')
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      subheading: 'subheading',
      media: 'backgroundImage'
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
