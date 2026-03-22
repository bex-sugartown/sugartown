import {defineType, defineField, defineArrayMember} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * Hero Section
 *
 * Large header section typically used at the top of pages and case studies
 * Supports eyebrow, heading, subheading, background image with overlay treatment, and CTAs (0-3)
 */
export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Short label above the heading (e.g. section name, category). Renders in teal uppercase.',
      validation: (Rule) => Rule.max(80)
    }),
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
      name: 'imageTreatment',
      title: 'Image Treatment',
      type: 'mediaOverlay',
      description: 'Optional overlay effect applied to the background image (duotone, dark scrim, or colour overlay)',
    }),
    defineField({
      name: 'imageWidth',
      title: 'Image Width',
      type: 'string',
      description:
        'How wide the hero background image should render. Content-width keeps it within the reading column; full-width stretches edge to edge.',
      options: {
        list: [
          {title: 'Content width', value: 'content-width'},
          {title: 'Full width', value: 'full-width'}
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'content-width'
    }),
    defineField({
      name: 'ctas',
      title: 'Call to Action Buttons',
      type: 'array',
      description: 'Add 0-3 CTA buttons. First = primary, second = secondary, third = tertiary.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'ctaButtonDoc'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(3).warning('Hero sections work best with 3 or fewer CTAs')
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
        subtitle: `Hero · ${subheading || 'No subheading'}`,
        media: media
      }
    }
  }
})
