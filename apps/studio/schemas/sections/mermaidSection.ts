import {defineType, defineField} from 'sanity'
import {CodeBlockIcon} from '@sanity/icons'

/**
 * Mermaid Diagram Section
 *
 * Renders a Mermaid diagram as themed SVG on the frontend.
 * Editors paste Mermaid markup; the frontend renders it client-side
 * via the mermaid library with dark/light theme support.
 *
 * See: https://mermaid.js.org/syntax/
 */
export default defineType({
  name: 'mermaidSection',
  title: 'Mermaid Diagram',
  type: 'object',
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: 'code',
      title: 'Mermaid Code',
      type: 'text',
      description:
        'Paste Mermaid diagram markup. Supports flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline. See mermaid.js.org/syntax for reference.',
      validation: (Rule) =>
        Rule.required().error('Mermaid code is required for a diagram section'),
      rows: 15,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption displayed below the diagram.',
    }),
  ],
  preview: {
    select: {
      caption: 'caption',
      code: 'code',
    },
    prepare({caption, code}) {
      const preview = code
        ? code.replace(/%%\{[\s\S]*?\}%%/g, '').trim().substring(0, 80)
        : ''
      return {
        title: caption || 'Mermaid Diagram',
        subtitle: `Diagram · ${preview ? preview + (code.length > 80 ? '…' : '') : 'No code'}`,
      }
    },
  },
})
