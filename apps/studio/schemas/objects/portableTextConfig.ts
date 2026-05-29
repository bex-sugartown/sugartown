import {defineArrayMember, defineField} from 'sanity'
import {ImageIcon, CodeIcon, ThListIcon, RemoveIcon, LinkIcon} from '@sanity/icons'

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
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'type',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  {title: 'External URL', value: 'external'},
                  {title: 'Internal Page', value: 'internal'},
                ],
                layout: 'radio',
              },
              initialValue: 'external',
            }),
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) =>
                Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
              hidden: ({parent}) => parent?.type === 'internal',
            }),
            defineField({
              name: 'internalRef',
              title: 'Internal Page',
              type: 'reference',
              to: [
                {type: 'page'},
                {type: 'article'},
                {type: 'caseStudy'},
                {type: 'node'},
                {type: 'archivePage'},
              ],
              hidden: ({parent}) => parent?.type !== 'internal',
            }),
          ]
        })
      ]
    }
  }),
  // Divider — horizontal rule in summary text
  defineArrayMember({
    name: 'divider',
    type: 'object',
    title: 'Divider',
    icon: RemoveIcon,
    fields: [
      defineField({
        name: 'style',
        type: 'string',
        title: 'Style',
        options: {
          list: [
            {title: 'Default', value: 'default'},
            {title: 'Subtle', value: 'subtle'},
          ],
        },
        initialValue: 'default',
      }),
    ],
    preview: {
      prepare: () => ({title: '── Divider ──'}),
    },
  })
]

/**
 * Compact Config - Rich inline content without layout blocks
 * - Normal text only (NO headings)
 * - Bold, Italic, Underline, inline Code marks
 * - Links (external + internal) + Citation references
 * - Bullet and numbered lists
 * - NO images, NO code blocks, NO tables, NO blockquote, NO dividers
 *
 * Use for: accordion panels, callout bodies, card descriptions,
 * glossary definitions, taxonomy descriptions — anywhere you want
 * rich inline formatting without structural layout elements.
 */
export const compactPortableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'}
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
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'type',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  {title: 'External URL', value: 'external'},
                  {title: 'Internal Page', value: 'internal'},
                ],
                layout: 'radio',
              },
              initialValue: 'external',
            }),
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) =>
                Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
              hidden: ({parent}) => parent?.type === 'internal',
            }),
            defineField({
              name: 'internalRef',
              title: 'Internal Page',
              type: 'reference',
              to: [
                {type: 'page'},
                {type: 'article'},
                {type: 'caseStudy'},
                {type: 'node'},
                {type: 'archivePage'},
              ],
              hidden: ({parent}) => parent?.type !== 'internal',
            }),
          ]
        }),
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
  })
]

/**
 * Metadata Config - For structured node fields (challenge, insight, actionItem)
 * - Normal text only (no headings)
 * - Bold, Italic, Code marks
 * - Links allowed
 * - NO headings, NO lists, NO images
 * - Inline code for technical references (field names, tool names, etc.)
 */
export const metadataPortableText = [
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
        {title: 'Code', value: 'code'}
      ],
      annotations: [
        defineArrayMember({
          name: 'link',
          type: 'object',
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'type',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  {title: 'External URL', value: 'external'},
                  {title: 'Internal Page', value: 'internal'},
                ],
                layout: 'radio',
              },
              initialValue: 'external',
            }),
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) =>
                Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
              hidden: ({parent}) => parent?.type === 'internal',
            }),
            defineField({
              name: 'internalRef',
              title: 'Internal Page',
              type: 'reference',
              to: [
                {type: 'page'},
                {type: 'article'},
                {type: 'caseStudy'},
                {type: 'node'},
                {type: 'archivePage'},
              ],
              hidden: ({parent}) => parent?.type !== 'internal',
            }),
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
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'type',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  {title: 'External URL', value: 'external'},
                  {title: 'Internal Page', value: 'internal'},
                ],
                layout: 'radio',
              },
              initialValue: 'external',
            }),
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) =>
                Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
              hidden: ({parent}) => parent?.type === 'internal',
            }),
            defineField({
              name: 'internalRef',
              title: 'Internal Page',
              type: 'reference',
              to: [
                {type: 'page'},
                {type: 'article'},
                {type: 'caseStudy'},
                {type: 'node'},
                {type: 'archivePage'},
              ],
              hidden: ({parent}) => parent?.type !== 'internal',
            }),
            defineField({
              name: 'openInNewTab',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: true,
              hidden: ({parent}) => parent?.type === 'internal',
            }),
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
  }),
  // Divider — horizontal rule between content blocks
  defineArrayMember({
    name: 'divider',
    type: 'object',
    title: 'Divider',
    icon: RemoveIcon,
    fields: [
      defineField({
        name: 'style',
        type: 'string',
        title: 'Style',
        options: {
          list: [
            {title: 'Default', value: 'default'},
            {title: 'Subtle', value: 'subtle'},
          ],
        },
        initialValue: 'default',
      }),
    ],
    preview: {
      prepare: () => ({title: '── Divider ──'}),
    },
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
