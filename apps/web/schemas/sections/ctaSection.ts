import {defineType, defineField, defineArrayMember} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

/**
 * CTA Section
 *
 * Call-to-action section with heading, description, and up to 2 CTA buttons
 * Typically used to drive conversions or encourage user actions
 */
export default defineType({
  name: 'ctaSection',
  title: 'CTA Section',
  type: 'object',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main CTA heading',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Heading is required and must be under 100 characters')
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Supporting text for the CTA',
      rows: 2,
      validation: (Rule) => Rule.max(300)
    }),
    defineField({
      name: 'buttons',
      title: 'CTA Buttons',
      type: 'array',
      description: 'Call-to-action buttons (maximum 2 for layout)',
      of: [
        defineArrayMember({
          type: 'ctaButton'
        })
      ],
      validation: (Rule) =>
        Rule.min(1)
          .max(2)
          .error('CTA section must have 1-2 buttons')
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      description: 'description',
      buttons: 'buttons'
    },
    prepare({heading, description, buttons}) {
      const buttonCount = buttons?.length || 0

      return {
        title: heading || 'CTA Section',
        subtitle: description || `${buttonCount} button${buttonCount !== 1 ? 's' : ''}`
      }
    }
  }
})
