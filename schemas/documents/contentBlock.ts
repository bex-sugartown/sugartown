import {defineType} from 'sanity'
import {WarningOutlineIcon} from '@sanity/icons'

/**
 * @deprecated Use page schema with sections instead
 * This schema is kept for backwards compatibility but should not be used for new content.
 * Rich content is now managed via page sections (textSection, etc.)
 */
export default defineType({
  name: 'contentBlock',
  title: '[DEPRECATED] Content Block',
  type: 'document',
  icon: WarningOutlineIcon,
  deprecated: {
    reason: 'Use page schema with sections instead'
  },
  fields: [
    {
      name: 'title',
      title: 'Block Title',
      type: 'string',
      description: 'Internal reference (not displayed on frontend)',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'External Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'media',
          title: 'Image',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Content Block',
      }
    },
  },
})