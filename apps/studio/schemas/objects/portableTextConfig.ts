import {defineArrayMember} from 'sanity'
import {ImageIcon, CodeIcon, ThListIcon} from '@sanity/icons'

/**
 * Portable Text Configurations
 *
 * Reusable Portable Text (rich text) configurations
 * Following Resume Factory pattern: different configs for different contexts
 */

/**
 * Summary Config - For excerpts and short descriptions
 * - Normal text only
 * - Bold, Italic, Underline marks
 * - Links allowed
 * - NO headings, NO lists, NO images
 */
export const summaryPortableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'}
    ],
    lists: [],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
        {title: 'Underline', value: 'underline'}
      ],
      annotations: [
        defineArrayMember({
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) => Rule.required()
                .uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true
                })
            }
          ]
        })
      ]
    }
  })
]

/**
 * Standard Content Config - For main content areas
 * - All heading levels (H2-H4)
 * - All text marks (bold, italic, underline, code, link)
 * - Bullet and numbered lists
 * - Images with captions
 * - Code blocks
 */
export const standardPortableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'Heading 2', value: 'h2'},
      {title: 'Heading 3', value: 'h3'},
      {title: 'Heading 4', value: 'h4'},
      {title: 'Blockquote', value: 'blockquote'}
    ],
    lists: [
      {title: 'Bullet', value: 'bullet'},
      {title: 'Numbered', value: 'number'}
    ],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
        {title: 'Underline', value: 'underline'},
        {title: 'Code', value: 'code'}
      ],
      annotations: [
        defineArrayMember({
          name: 'link',
          type: 'object',
          title: 'External Link',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) => Rule.required()
                .uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true
                })
            },
            {
              name: 'openInNewTab',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: true
            }
          ]
        }),
        // Inline citation marker — renders as superscript [n] in the web frontend.
        // Endnote definitions live in the document-level citations[] array.
        defineArrayMember({
          name: 'citationRef',
          type: 'object',
          title: 'Citation Reference',
          fields: [
            {
              name: 'index',
              type: 'number',
              title: 'Citation Number',
              description: 'The footnote number (e.g. 1 for [1])',
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1)
            }
          ]
        })
      ]
    }
  }),
  // Rich Image block
  defineArrayMember({
    type: 'richImage',
    icon: ImageIcon
  }),
  // Code block
  defineArrayMember({
    type: 'code',
    title: 'Code Block',
    icon: CodeIcon,
    options: {
      language: 'javascript',
      languageAlternatives: [
        {title: 'JavaScript', value: 'javascript'},
        {title: 'TypeScript', value: 'typescript'},
        {title: 'JSX', value: 'jsx'},
        {title: 'TSX', value: 'tsx'},
        {title: 'HTML', value: 'html'},
        {title: 'CSS', value: 'css'},
        {title: 'SCSS', value: 'scss'},
        {title: 'JSON', value: 'json'},
        {title: 'Markdown', value: 'markdown'},
        {title: 'Python', value: 'python'},
        {title: 'Bash', value: 'bash'},
        {title: 'SQL', value: 'sql'}
      ],
      withFilename: true
    }
  }),
  // Table block (EPIC-0163)
  defineArrayMember({
    type: 'tableBlock',
    icon: ThListIcon
  })
]

/**
 * Minimal Config - For simple text with NO formatting
 * - Normal text only
 * - NO marks, NO lists, NO images
 */
export const minimalPortableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'}
    ],
    lists: [],
    marks: {
      decorators: [],
      annotations: []
    }
  })
]
