import {defineType, defineField} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

/**
 * CTA Button Object
 *
 * Call-to-action button component with style variants
 * Used in hero sections, CTA sections, and promotional content
 */
export default defineType({
  name: 'ctaButton',
  title: 'CTA Button',
  type: 'object',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Button Text',
      type: 'string',
      description: 'The label displayed on the button',
      validation: (Rule) => Rule.max(50).warning('Button text should be under 50 characters')
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'linkItem',
      description: 'Where the button should navigate to'
    }),
    defineField({
      name: 'style',
      title: 'Button Style',
      type: 'string',
      description: 'Visual style of the button',
      options: {
        list: [
          {title: 'Primary', value: 'primary'},
          {title: 'Secondary', value: 'secondary'},
          {title: 'Tertiary', value: 'tertiary'}
        ],
        layout: 'radio'
      },
      initialValue: 'primary'
    })
  ],
  preview: {
    select: {
      text: 'text',
      style: 'style',
      linkLabel: 'link.label',
      linkType: 'link.type',
      internalSlug: 'link.internalRef.slug.current',
      externalUrl: 'link.externalUrl'
    },
    prepare({text, style, linkLabel, linkType, internalSlug, externalUrl}) {
      const styleLabels = {
        primary: '🎀 Primary',
        secondary: '🍋 Secondary',
        tertiary: '◽ Tertiary'
      }
      let dest = 'No URL'
      if (linkType === 'internal') dest = internalSlug ? `/${internalSlug}` : '⚠ No page'
      if (linkType === 'external') dest = externalUrl || '⚠ No URL'
      return {
        title: text || linkLabel || 'Untitled Button',
        subtitle: `${styleLabels[style as keyof typeof styleLabels] || style} → ${dest}`
      }
    }
  }
})
