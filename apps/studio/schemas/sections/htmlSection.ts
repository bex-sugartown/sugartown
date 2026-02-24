import {defineType, defineField} from 'sanity'
import {CodeIcon} from '@sanity/icons'

/**
 * HTML Section
 *
 * Renders raw HTML as-is on the frontend. No sanitization is applied.
 * Intended for migrated content that could not be converted to Portable Text,
 * and for one-off embeds that don't fit the other section types.
 *
 * The `label` field is internal only — never displayed to visitors.
 */
export default defineType({
  name: 'htmlSection',
  title: 'HTML Section',
  type: 'object',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'html',
      title: 'HTML',
      type: 'text',
      description: 'Paste raw HTML here. Renders as-is on the frontend.',
      validation: (Rule) =>
        Rule.required().error('HTML content is required for an HTML section'),
      rows: 10,
    }),
    defineField({
      name: 'label',
      title: 'Internal Label',
      type: 'string',
      description: 'Internal label only — not displayed to visitors.',
    }),
  ],
  preview: {
    select: {
      label: 'label',
      html: 'html',
    },
    prepare({label, html}) {
      const preview = html ? html.replace(/<[^>]+>/g, '').trim().substring(0, 80) : ''
      return {
        title: label || 'HTML Section',
        subtitle: preview ? preview + (html.length > 80 ? '…' : '') : 'No content',
      }
    },
  },
})
