import {defineType, defineField} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

/**
 * CTA Button Document
 *
 * Reusable call-to-action button that can be referenced across the site
 * Allows editors to create and manage buttons independently
 */
export default defineType({
  name: 'ctaButtonDoc',
  title: 'CTA Button',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal name for this button (e.g., "Header CTA - Free Trial")',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      description: 'Button destination and label'
    }),
    defineField({
      name: 'style',
      title: 'Button Style',
      type: 'string',
      description: 'Visual style of the button',
      options: {
        list: [
          {title: 'Primary (Sugartown Pink)', value: 'primary'},
          {title: 'Secondary (Seafoam)', value: 'secondary'},
          {title: 'Ghost (Outline)', value: 'ghost'}
        ],
        layout: 'radio'
      },
      initialValue: 'primary'
    })
  ],
  preview: {
    select: {
      internalTitle: 'internalTitle',
      label: 'link.label',
      style: 'style',
      url: 'link.url'
    },
    prepare({internalTitle, label, style, url}) {
      const styleLabels: Record<string, string> = {
        primary: 'Primary',
        secondary: 'Secondary',
        ghost: 'Ghost'
      }
      return {
        title: internalTitle || label || 'Untitled Button',
        subtitle: `${styleLabels[style] || style} | "${label || 'No label'}" → ${url || 'No URL'}`
      }
    }
  },
  orderings: [
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'internalTitle', direction: 'asc'}]
    }
  ]
})
