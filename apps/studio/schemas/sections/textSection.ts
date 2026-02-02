import {defineType, defineField} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Text Section
 *
 * Generic content section with optional heading and rich text content
 * The workhorse component for most page content
 */
export default defineType({
  name: 'textSection',
  title: 'Text Section',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading for this section',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Rich text content for this section',
      of: standardPortableText,
      validation: (Rule) =>
        Rule.required()
          .error('Content is required for text sections')
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      content: 'content'
    },
    prepare({heading, content}) {
      // Extract first text block for preview
      const block = (content || []).find((block: any) => block._type === 'block')
      const previewText = block?.children?.[0]?.text || 'No content'

      return {
        title: heading || 'Text Section',
        subtitle: previewText.substring(0, 100) + (previewText.length > 100 ? '...' : '')
      }
    }
  }
})
